import { app, globalShortcut } from 'electron';
import stateManager from '../stateManager';
import { MainWindowHelper } from './MainWindowHelper';
import { ProcessingHelper } from './ProcessingHelper';
import { takeScreenshot } from './ScreenshotHelper';

export const STEP = 50;

export class ShortcutsHelper {
  private processingHelper: ProcessingHelper = ProcessingHelper.getInstance();

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
          await takeScreenshot(
            () => this.mainWindowHelper.hideMainWindow(),
            () => this.mainWindowHelper.showMainWindow(),
            stateManager.getState().view !== 'queue',
          );
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

      // Update the view state to 'queue'
      stateManager.setState({
        view: 'queue',
        problemInfo: null,
        solutionData: null,
        screenshotQueue: [],
        extraScreenshotQueue: [],
      });

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

    // Adjust opacity shortcuts
    globalShortcut.register('CommandOrControl+[', () => {
      console.log('Command/Ctrl + [ pressed. Decreasing opacity.');
      this.mainWindowHelper.adjustOpacity(-10);
    });

    globalShortcut.register('CommandOrControl+]', () => {
      console.log('Command/Ctrl + ] pressed. Increasing opacity.');
      this.mainWindowHelper.adjustOpacity(10);
    });

    globalShortcut.register('CommandOrControl+Shift+I', () => {
      console.log('Command/Ctrl + Shift + I pressed. Opening settings.');
      const { view } = stateManager.getState();
      stateManager.setState({
        view: view === 'settings' ? 'queue' : 'settings',
      });
    });

    // Unregister shortcuts when quitting
    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }
}
