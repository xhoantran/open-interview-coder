import { URL } from 'url';
import path from 'path';
import { BrowserWindow } from 'electron';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const sendToAll = (channel: string, msg: unknown) => {
  BrowserWindow.getAllWindows().forEach((browseWindow) => {
    browseWindow.webContents.send(channel, msg);
  });
};
