import { create } from 'zustand';
import type { AppState } from '../../types';
import { ALLOWED_LANGUAGES, VIEW } from '../../constant';

interface useSyncedStoreInterface extends AppState {
  setProblemInfo: (problemInfo: AppState['problemInfo']) => void;
  setView: (view: AppState['view']) => void;
  setApiKey: (apiKey: string) => void;
  setExtractionModel: (model: AppState['extractionModel']) => void;
  setSolutionModel: (model: AppState['solutionModel']) => void;
  setDebuggingModel: (model: AppState['debuggingModel']) => void;
  setLanguage: (language: AppState['language']) => void;
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
    screenshotQueue: [],
    extraScreenshotQueue: [],
    problemInfo: null,
    solutionData: null,
    setProblemInfo: (problemInfo) => {
      set({ problemInfo });
      window.electronAPI.setState({ problemInfo });
    },
    view: VIEW.QUEUE,
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
    language: ALLOWED_LANGUAGES.PYTHON,
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
