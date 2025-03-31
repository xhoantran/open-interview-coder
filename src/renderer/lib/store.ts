import { create } from 'zustand';
import type {
  AllowedLanguageType,
  AllowedModelType,
  AppState,
  ViewType,
} from '../../types';

interface useSyncedStoreInterface extends AppState {
  setView: (view: ViewType) => void;
  setApiKey: (apiKey: string) => void;
  setExtractionModel: (model: AllowedModelType) => void;
  setSolutionModel: (model: AllowedModelType) => void;
  setDebuggingModel: (model: AllowedModelType) => void;
  setLanguage: (language: AllowedLanguageType) => void;
  setOpacity: (opacity: number) => void;
}

export const useSyncedStore = create<useSyncedStoreInterface>((set) => {
  // Load initial state from Electron main process
  window.electronAPI
    .getState()
    .then((state) => set(state))
    .catch((error) => {
      console.error('Failed to load initial state:', error);
      set({ apiKey: '' }); // Fallback to default state
    });

  // Listen for updates from main process
  window.electronAPI.onStateUpdate(set);

  return {
    view: 'queue',
    setView: (view) => {
      set({ view });
      window.electronAPI.setState({ view });
    },
    apiKey: '',
    setApiKey: (apiKey) => {
      set({ apiKey });
      window.electronAPI.setState({ apiKey });
    },
    extractionModel: 'gpt-4o',
    setExtractionModel: (model) => {
      set({ extractionModel: model });
      window.electronAPI.setState({ extractionModel: model });
    },
    solutionModel: 'gpt-4o',
    setSolutionModel: (model) => {
      set({ solutionModel: model });
      window.electronAPI.setState({ solutionModel: model });
    },
    debuggingModel: 'gpt-4o',
    setDebuggingModel: (model) => {
      set({ debuggingModel: model });
      window.electronAPI.setState({ debuggingModel: model });
    },
    language: 'python',
    setLanguage: (language) => {
      set({ language });
      window.electronAPI.setState({ language });
    },
    opacity: 100,
    setOpacity: (opacity) => {
      set({ opacity });
      window.electronAPI.setState({ opacity });
    },
  };
});
