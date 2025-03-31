import { ipcMain, shell } from 'electron';
import { randomBytes } from 'crypto';
import { getImagePreview, ScreenshotHelper } from './helper/ScreenshotHelper';
import { ProcessingHelper } from './helper/ProcessingHelper';
import { MainWindowHelper } from './helper/MainWindowHelper';
import stateManager from './stateManager';

const screenshotHelper = ScreenshotHelper.getInstance();
const processingHelper = ProcessingHelper.getInstance();
const mainWindowHelper = MainWindowHelper.getInstance();

export function initializeIpcHandlers(): void {
  console.log('Initializing IPC handlers');

  // Screenshot queue handlers
  ipcMain.handle('get-screenshot-queue', () => {
    return screenshotHelper.getScreenshotQueue();
  });

  ipcMain.handle('get-extra-screenshot-queue', () => {
    return screenshotHelper.getExtraScreenshotQueue();
  });

  ipcMain.handle('delete-screenshot', async (event, path: string) => {
    return screenshotHelper.deleteScreenshot(path);
  });

  ipcMain.handle('get-image-preview', async (event, path: string) => {
    return getImagePreview(path);
  });

  // Screenshot processing handlers
  ipcMain.handle('process-screenshots', async () => {
    await processingHelper.processScreenshots();
  });

  // Window dimension handlers
  ipcMain.handle(
    'update-content-dimensions',
    async (event, { width, height }: { width: number; height: number }) => {
      if (width && height) {
        mainWindowHelper.setWindowDimensions(width, height);
      }
    },
  );

  ipcMain.handle(
    'set-window-dimensions',
    (event, width: number, height: number) => {
      mainWindowHelper.setWindowDimensions(width, height);
    },
  );

  // Screenshot management handlers
  ipcMain.handle('get-screenshots', async () => {
    try {
      let previews = [];
      const { view: currentView } = stateManager.getState();

      if (currentView === 'queue') {
        const queue = screenshotHelper.getScreenshotQueue();
        previews = await Promise.all(
          queue.map(async (path) => ({
            path,
            preview: await getImagePreview(path),
          })),
        );
      } else {
        const extraQueue = screenshotHelper.getExtraScreenshotQueue();
        previews = await Promise.all(
          extraQueue.map(async (path) => ({
            path,
            preview: await getImagePreview(path),
          })),
        );
      }

      return previews;
    } catch (error) {
      console.error('Error getting screenshots:', error);
      throw error;
    }
  });

  // Screenshot trigger handlers
  ipcMain.handle('trigger-screenshot', async () => {
    const mainWindow = mainWindowHelper.getMainWindow();
    if (mainWindow) {
      try {
        const screenshotPath = await screenshotHelper.takeScreenshot(
          () => mainWindowHelper.hideMainWindow(),
          () => mainWindowHelper.showMainWindow(),
        );
        const preview = await getImagePreview(screenshotPath);
        mainWindow.webContents.send('screenshot-taken', {
          path: screenshotPath,
          preview,
        });
        return { success: true };
      } catch (error) {
        console.error('Error triggering screenshot:', error);
        return { error: 'Failed to trigger screenshot' };
      }
    }
    return { error: 'No main window available' };
  });

  ipcMain.handle('take-screenshot', async () => {
    try {
      const screenshotPath = await screenshotHelper.takeScreenshot(
        () => mainWindowHelper.hideMainWindow(),
        () => mainWindowHelper.showMainWindow(),
      );
      const preview = await getImagePreview(screenshotPath);
      return { path: screenshotPath, preview };
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return { error: 'Failed to take screenshot' };
    }
  });

  // Auth related handlers
  ipcMain.handle('get-pkce-verifier', () => {
    return randomBytes(32).toString('base64url');
  });

  ipcMain.handle('open-external-url', (event, url: string) => {
    shell.openExternal(url);
  });

  // Window management handlers
  ipcMain.handle('toggle-window', () => {
    try {
      mainWindowHelper.toggleMainWindow();
      return { success: true };
    } catch (error) {
      console.error('Error toggling window:', error);
      return { error: 'Failed to toggle window' };
    }
  });

  ipcMain.handle('reset-queues', async () => {
    try {
      screenshotHelper.clearQueues();
      return { success: true };
    } catch (error) {
      console.error('Error resetting queues:', error);
      return { error: 'Failed to reset queues' };
    }
  });

  // Process screenshot handlers
  ipcMain.handle('trigger-process-screenshots', async () => {
    try {
      await processingHelper.processScreenshots();
      return { success: true };
    } catch (error) {
      console.error('Error processing screenshots:', error);
      return { error: 'Failed to process screenshots' };
    }
  });

  // Reset handlers
  ipcMain.handle('trigger-reset', () => {
    try {
      // First cancel any ongoing requests
      processingHelper.cancelOngoingRequests();

      // Clear all queues immediately
      screenshotHelper.clearQueues();

      // Reset view to queue
      stateManager.setState({ view: 'queue' });

      // Get main window and send reset events
      const mainWindow = mainWindowHelper.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        // Send reset events in sequence
        mainWindow.webContents.send('reset-view');
        mainWindow.webContents.send('reset');
      }

      return { success: true };
    } catch (error) {
      console.error('Error triggering reset:', error);
      return { error: 'Failed to trigger reset' };
    }
  });
}
