import { ipcMain } from 'electron';
import { MainWindowHelper } from './helper/MainWindowHelper';
import { ProcessingHelper } from './helper/ProcessingHelper';
import { deleteScreenshot, takeScreenshot } from './helper/ScreenshotHelper';
import stateManager from './stateManager';

const processingHelper = ProcessingHelper.getInstance();
const mainWindowHelper = MainWindowHelper.getInstance();

export function initializeIpcHandlers(): void {
  console.log('Initializing IPC handlers');

  ipcMain.handle('delete-screenshot', async (event, path: string) => {
    return deleteScreenshot(path, stateManager.getState().view !== 'queue');
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

  // Screenshot trigger handlers
  ipcMain.handle('trigger-screenshot', async () => {
    const mainWindow = mainWindowHelper.getMainWindow();
    if (mainWindow) {
      try {
        await takeScreenshot(
          () => mainWindowHelper.hideMainWindow(),
          () => mainWindowHelper.showMainWindow(),
          stateManager.getState().view !== 'queue',
        );
        return { success: true };
      } catch (error) {
        console.error('Error triggering screenshot:', error);
        return { error: 'Failed to trigger screenshot' };
      }
    }
    return { error: 'No main window available' };
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

      // Reset view to queue
      stateManager.setState({
        view: 'queue',
        screenshotQueue: [],
        extraScreenshotQueue: [],
        problemInfo: null,
        solutionData: null,
      });

      return { success: true };
    } catch (error) {
      console.error('Error triggering reset:', error);
      return { error: 'Failed to trigger reset' };
    }
  });
}
