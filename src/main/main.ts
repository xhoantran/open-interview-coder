/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app } from 'electron';
import { MainWindowHelper } from './helper/MainWindowHelper';
import { ShortcutsHelper } from './helper/ShortcutsHelper';
import { initializeIpcHandlers } from './ipcHandlers';
import { initializeStateManager } from './stateManager';
import { isDebug } from './constant';

// Fix for black screen during screen sharing
// Disable hardware acceleration features that can interfere with screen capture
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor,UseSkiaRenderer');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const mainWindowHelper = MainWindowHelper.getInstance();

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
      mainWindowHelper.destroy();
    }
  });
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    const mainWindow = mainWindowHelper.getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

app
  .whenReady()
  .then(() => {
    mainWindowHelper.createWindow();
    ShortcutsHelper.getInstance().registerGlobalShortcuts();
    initializeIpcHandlers();
    initializeStateManager();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindowHelper.getMainWindow() === null) {
        mainWindowHelper.createWindow();
      }
    });
    if (isDebug)
      mainWindowHelper.getMainWindow()?.webContents.openDevTools({
        mode: 'detach',
      });
  })
  .catch(console.log);
