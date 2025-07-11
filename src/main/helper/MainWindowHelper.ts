/* eslint-disable max-classes-per-file */
import { app, BrowserWindow, screen, shell } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';

import stateManager from '../stateManager';
import { resolveHtmlPath } from '../util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export class MainWindowHelper {
  // eslint-disable-next-line no-use-before-define
  private static instance: MainWindowHelper;

  private mainWindow: BrowserWindow | null = null;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): MainWindowHelper {
    if (!MainWindowHelper.instance) {
      MainWindowHelper.instance = new MainWindowHelper();
    }
    return MainWindowHelper.instance;
  }

  private static async installExtensions() {
    // eslint-disable-next-line global-require
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload,
      )
      .catch(console.log);
  }

  public async createWindow() {
    // if (isDebug) {
    //   await MainWindowHelper.installExtensions();
    // }

    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
      return;
    }

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    this.mainWindow = new BrowserWindow({
      x: 50,
      y: 50,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
        scrollBounce: true,
        // Disable hardware acceleration to fix screen sharing black screen
        webSecurity: true,
        backgroundThrottling: false,
      },
      show: true,
      frame: false,
      transparent: true,
      fullscreenable: false,
      hasShadow: false,
      backgroundColor: '#00000000',
      focusable: true,
      skipTaskbar: true,
      type: 'panel',
      paintWhenInitiallyHidden: true,
      titleBarStyle: 'hidden',
      enableLargerThanScreen: true,
      movable: false,
      resizable: false,
      icon: getAssetPath('icon.png'),
      opacity: stateManager.getState().opacity / 100,
    });

    this.mainWindow.loadURL(resolveHtmlPath('index.html'));

    this.mainWindow.on('ready-to-show', () => {
      if (!this.mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        this.mainWindow.minimize();
      } else {
        this.mainWindow.show();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Open urls in the user's browser
    this.mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    // Note: Commented out screen capture resistance features to fix black screen during screen sharing
    // If you need these features, they may interfere with screen sharing functionality
    
    // Enhanced screen capture resistance - DISABLED for screen sharing compatibility
    // this.mainWindow.setContentProtection(true);
    this.mainWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    this.mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    this.mainWindow.setIgnoreMouseEvents(true, { forward: true });

    // Additional screen capture resistance settings - MODIFIED for screen sharing compatibility
    if (process.platform === 'darwin') {
      // Prevent window from being captured in screenshots - DISABLED
      this.mainWindow.setWindowButtonVisibility(false);
      // this.mainWindow.setHiddenInMissionControl(true); // DISABLED - causes issues with screen sharing
      this.mainWindow.setBackgroundColor('#00000000');

      // Prevent window from being included in window switcher
      this.mainWindow.setSkipTaskbar(true);

      // Disable window shadow
      this.mainWindow.setHasShadow(false);
    }

    // Prevent the window from being captured by screen recording - MODIFIED
    this.mainWindow.webContents.setBackgroundThrottling(false);
    // this.mainWindow.webContents.setFrameRate(60); // This can cause issues with screen sharing

    stateManager.subscribe((state) => {
      if (this.mainWindow) {
        this.mainWindow.webContents.send('state:sync', state);
      }
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public destroy() {
    if (this.mainWindow) {
      this.mainWindow.removeAllListeners();
      this.mainWindow.close();
      this.mainWindow = null;
    }
  }

  public setWindowDimensions(width: number, height: number) {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    const { workAreaSize } = screen.getPrimaryDisplay();

    if (stateManager.getState().view !== 'solutions') {
      const [currentX, currentY] = this.mainWindow.getPosition();
      const maxWidth = Math.floor(workAreaSize.width * 0.5);

      this.mainWindow.setBounds({
        x: Math.min(currentX, workAreaSize.width - maxWidth),
        y: currentY,
        width: Math.min(width + 32, maxWidth),
        height: Math.ceil(height),
      });
    } else {
      this.mainWindow.setBounds({
        x: 16,
        y: 16,
        width: workAreaSize.width - 32,
        height: Math.ceil(height),
      });
    }
  }

  public moveWindowVertical(updateFn: (y: number) => number) {
    if (!this.mainWindow) return;
    const [x, y] = this.mainWindow.getPosition();
    const windowHeight = this.mainWindow.getSize()[1];
    const { workAreaSize } = screen.getPrimaryDisplay();

    const newY = updateFn(y);
    // Allow window to go 2/3 off screen in either direction
    const maxUpLimit = (-(windowHeight || 0) * 2) / 3;
    const maxDownLimit = workAreaSize.height + ((windowHeight || 0) * 2) / 3;

    // Only update if within bounds
    if (newY >= maxUpLimit && newY <= maxDownLimit) {
      this.mainWindow.setPosition(Math.round(x), Math.round(newY));
    }
  }

  public moveWindowHorizontal(
    updateFn: (x: number, windowWidth: number, screenWidth: number) => number,
  ) {
    if (!this.mainWindow) return;
    const [x, y] = this.mainWindow.getPosition();
    const { workAreaSize } = screen.getPrimaryDisplay();
    const windowWidth = this.mainWindow.getSize()[0];
    const newX = updateFn(x, windowWidth, workAreaSize.width);
    this.mainWindow.setPosition(Math.round(newX), Math.round(y));
  }

  public hideMainWindow() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    this.mainWindow.setOpacity(0);
    this.mainWindow.hide();
  }

  public showMainWindow() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    this.mainWindow.setContentProtection(true);
    this.mainWindow.showInactive();
    this.mainWindow.setOpacity(stateManager.getState().opacity / 100);
  }

  public toggleMainWindow() {
    if (this.mainWindow && this.mainWindow.isVisible()) {
      this.hideMainWindow();
    } else {
      this.showMainWindow();
    }
  }

  public adjustOpacity(delta: number): void {
    if (!this.mainWindow) return;

    const currentOpacity = stateManager.getState().opacity || 100;
    const newOpacity = Math.max(10, Math.min(100, currentOpacity + delta));
    console.log(`Adjusting opacity from ${currentOpacity} to ${newOpacity}`);
    this.mainWindow.setOpacity(newOpacity / 100);

    stateManager.setState({
      opacity: newOpacity,
    });
  }

  public setIgnoreMouseEvents(ignore: boolean) {
    if (!this.mainWindow) return;

    this.mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
}
