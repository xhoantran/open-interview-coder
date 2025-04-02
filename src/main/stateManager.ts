import { ipcMain } from 'electron';
// @ts-expect-error CommonJS module
import Store from 'electron-store';
import { LANGUAGES, VIEW } from '../constant';
import type { AppState } from '../types';

class StateManager {
  private store: Store<AppState>;

  private listeners: Set<(state: AppState) => void>;

  constructor() {
    this.store = new Store<AppState>({
      defaults: {
        screenshotQueue: [],
        extraScreenshotQueue: [],
        problemInfo: null,
        solutionData: null,
        view: VIEW.QUEUE,

        // Settings
        openAIApiKey: null,
        geminiApiKey: null,
        extractionModel: 'gpt-4o',
        solutionModel: 'gpt-4o',
        language: LANGUAGES.PYTHON,
        opacity: 100,
      },
      encryptionKey: 'your-encryption-key', // Replace with your actual encryption key
    });
    this.listeners = new Set();
  }

  setState(partialState: Partial<AppState>) {
    const newState = { ...this.store.store, ...partialState };
    this.store.set(newState);
    this.notifyAll(newState);
  }

  getState(): AppState {
    return this.store.store;
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyAll(newState: AppState) {
    this.listeners.forEach((listener) => listener(newState));
  }
}

const stateManager = new StateManager();

export const initializeStateManager = () => {
  ipcMain.handle('state:get', () => stateManager.getState());

  ipcMain.on('state:update', (event, partialState: Partial<AppState>) => {
    stateManager.setState(partialState);
    event.sender.send('state:sync', stateManager.getState());
  });
};

export default stateManager;
