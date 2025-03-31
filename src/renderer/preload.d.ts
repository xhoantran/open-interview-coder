import { ElectronAPI } from '../main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
