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
      useContentSize: true,
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
      movable: true,
      resizable: false,
      icon: getAssetPath('icon.png'),
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

    // Enhanced screen capture resistance
    this.mainWindow.setContentProtection(true);
    this.mainWindow.setHiddenInMissionControl(true);
    this.mainWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    this.mainWindow.setAlwaysOnTop(true, 'floating', 1);
    // this.mainWindow.setIgnoreMouseEvents(true, { forward: true });

    // Additional screen capture resistance settings
    if (process.platform === 'darwin') {
      // Prevent window from being captured in screenshots
      this.mainWindow.setWindowButtonVisibility(false);
      this.mainWindow.setBackgroundColor('#00000000');

      // Prevent window from being included in window switcher
      this.mainWindow.setSkipTaskbar(true);

      // Disable window shadow
      this.mainWindow.setHasShadow(false);
    }

    // Prevent the window from being captured by screen recording
    this.mainWindow.webContents.setBackgroundThrottling(false);
    this.mainWindow.webContents.setFrameRate(60);

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

    const [currentX, currentY] = this.mainWindow.getPosition();
    const workArea = screen.getPrimaryDisplay().workAreaSize;
    const maxWidth = Math.floor(workArea.width * 0.5);

    this.mainWindow.setBounds({
      x: Math.min(currentX, workArea.width - maxWidth),
      y: currentY,
      width: Math.min(width + 32, maxWidth),
      height: Math.ceil(height),
    });
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
    this.mainWindow.setOpacity(1);
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
}
