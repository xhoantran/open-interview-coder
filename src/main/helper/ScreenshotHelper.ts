import { execFile } from 'child_process';
import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { MAX_SCREENSHOTS } from '../../constant';
import stateManager from '../stateManager';

const userDataPath = app.getPath('userData');
const screenshotDir = path.join(userDataPath, 'screenshots');

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

const extraScreenshotDir = path.join(userDataPath, 'extra_screenshots');

if (!fs.existsSync(extraScreenshotDir)) {
  fs.mkdirSync(extraScreenshotDir);
}

const execFileAsync = promisify(execFile);

const captureScreenshotMac = async (): Promise<Buffer> => {
  const tmpPath = path.join(app.getPath('temp'), `${uuidv4()}.png`);
  await execFileAsync('screencapture', ['-x', tmpPath]);
  const buffer = await fs.promises.readFile(tmpPath);
  await fs.promises.unlink(tmpPath);
  return buffer;
};

const captureScreenshotWindows = async (): Promise<Buffer> => {
  // Using PowerShell's native screenshot capability
  const tmpPath = path.join(app.getPath('temp'), `${uuidv4()}.png`);
  const script = `
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen
    $bitmap = New-Object System.Drawing.Bitmap $screen.Bounds.Width, $screen.Bounds.Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($screen.Bounds.X, $screen.Bounds.Y, 0, 0, $bitmap.Size)
    $bitmap.Save('${tmpPath.replace(/\\/g, '\\\\')}')
    $graphics.Dispose()
    $bitmap.Dispose()
  `;
  await execFileAsync('powershell', ['-command', script]);
  const buffer = await fs.promises.readFile(tmpPath);
  await fs.promises.unlink(tmpPath);
  return buffer;
};

export const getImagePreview = async (filepath: string): Promise<string> => {
  try {
    const data = await fs.promises.readFile(filepath);
    return `data:image/png;base64,${data.toString('base64')}`;
  } catch (error) {
    console.error('Error reading image:', error);
    throw error;
  }
};

const addScreenshotToQueue = (buffer: Buffer, isExtra: boolean) => {
  const screenshot = {
    id: uuidv4(),
    data: buffer.toString('base64'),
    timestamp: Date.now(),
  };

  const { screenshotQueue, extraScreenshotQueue } = stateManager.getState();
  const targetingQueue = isExtra ? extraScreenshotQueue : screenshotQueue;
  targetingQueue.push(screenshot);

  if (targetingQueue.length > MAX_SCREENSHOTS) {
    targetingQueue.shift();
  }

  if (isExtra) {
    stateManager.setState({ extraScreenshotQueue: targetingQueue });
  } else {
    stateManager.setState({ screenshotQueue: targetingQueue });
  }

  return screenshot;
};

export const takeScreenshot = async (
  hideMainWindow: () => void,
  showMainWindow: () => void,
  isExtra: boolean,
): Promise<void> => {
  hideMainWindow();
  await new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

  try {
    // Get screenshot buffer using native methods
    const screenshotBuffer =
      process.platform === 'darwin'
        ? await captureScreenshotMac()
        : await captureScreenshotWindows();

    addScreenshotToQueue(screenshotBuffer, isExtra);
  } catch (error) {
    console.error('Screenshot error:', error);
    throw error;
  } finally {
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    showMainWindow();
  }
};

export const deleteScreenshot = async (
  id: string,
  isExtra: boolean,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { screenshotQueue, extraScreenshotQueue } = stateManager.getState();
    if (isExtra) {
      stateManager.setState({
        extraScreenshotQueue: extraScreenshotQueue.filter(
          (screenshot) => screenshot.id !== id,
        ),
      });
    } else {
      stateManager.setState({
        screenshotQueue: screenshotQueue.filter(
          (screenshot) => screenshot.id !== id,
        ),
      });
    }
    console.log('Deleted screenshot:', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    // @ts-expect-error
    return { success: false, error: error.message || 'Unknown error' };
  }
};

export const clearExtraScreenshotQueue = () => {
  stateManager.setState({ extraScreenshotQueue: [] });
};
