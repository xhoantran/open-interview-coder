import { app, globalShortcut } from 'electron';
import { STEP } from '../constant';
import { AppState } from '../state';
import { ProcessingHelper } from './ProcessingHelper';
import { getImagePreview, ScreenshotHelper } from './ScreenshotHelper';
import { MainWindowHelper } from './MainWindowHelper';

export class ShortcutsHelper {
  private processingHelper: ProcessingHelper = ProcessingHelper.getInstance();

  private screenshotHelper: ScreenshotHelper = ScreenshotHelper.getInstance();

  private appState: AppState = AppState.getInstance();

  private mainWindowHelper: MainWindowHelper = MainWindowHelper.getInstance();

  // eslint-disable-next-line no-use-before-define
  private static instance: ShortcutsHelper | null = null;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ShortcutsHelper {
    if (!ShortcutsHelper.instance) {
      ShortcutsHelper.instance = new ShortcutsHelper();
    }
    return ShortcutsHelper.instance;
  }

  public registerGlobalShortcuts(): void {
    globalShortcut.register('CommandOrControl+H', async () => {
      const mainWindow = this.mainWindowHelper.getMainWindow();
      if (mainWindow) {
        console.log('Taking screenshot...');
        try {
          const screenshotPath = await this.screenshotHelper.takeScreenshot(
            () => this.mainWindowHelper.hideMainWindow(),
            () => this.mainWindowHelper.showMainWindow(),
          );
          const preview = await getImagePreview(screenshotPath);
          mainWindow.webContents.send('screenshot-taken', {
            path: screenshotPath,
            preview,
          });
        } catch (error) {
          console.error('Error capturing screenshot:', error);
        }
      }
    });

    globalShortcut.register('CommandOrControl+Enter', async () => {
      await this.processingHelper?.processScreenshots();
    });

    globalShortcut.register('CommandOrControl+R', () => {
      console.log(
        'Command + R pressed. Canceling requests and resetting queues...',
      );

      // Cancel ongoing API requests
      this.processingHelper?.cancelOngoingRequests();

      // Clear both screenshot queues
      this.screenshotHelper.clearQueues();

      console.log('Cleared queues.');

      // Update the view state to 'queue'
      this.appState.setView('queue');

      // Notify renderer process to switch view to 'queue'
      const mainWindow = this.mainWindowHelper.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('reset-view');
        mainWindow.webContents.send('reset');
      }
    });

    // New shortcuts for moving the window
    globalShortcut.register('CommandOrControl+Left', () => {
      console.log('Command/Ctrl + Left pressed. Moving window left.');
      this.mainWindowHelper.moveWindowHorizontal((x, windowWidth) =>
        Math.max(-(windowWidth || 0) / 2, x - STEP),
      );
    });

    globalShortcut.register('CommandOrControl+Right', () => {
      console.log('Command/Ctrl + Right pressed. Moving window right.');
      this.mainWindowHelper.moveWindowHorizontal(
        (x, windowWidth, screenWidth) =>
          Math.min(screenWidth - (windowWidth || 0) / 2, x + STEP),
      );
    });

    globalShortcut.register('CommandOrControl+Down', () => {
      console.log('Command/Ctrl + down pressed. Moving window down.');
      this.mainWindowHelper.moveWindowVertical((y) => y + STEP);
    });

    globalShortcut.register('CommandOrControl+Up', () => {
      console.log('Command/Ctrl + Up pressed. Moving window Up.');
      this.mainWindowHelper.moveWindowVertical((y) => y - STEP);
    });

    globalShortcut.register('CommandOrControl+B', () => {
      this.mainWindowHelper.toggleMainWindow();
    });

    // Unregister shortcuts when quitting
    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }
}
