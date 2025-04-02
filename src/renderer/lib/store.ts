import { create } from 'zustand';
import { LANGUAGES, VIEW } from '../../constant';
import type { AppState } from '../../types';

interface useSyncedStoreInterface extends AppState {
  setProblemInfo: (problemInfo: AppState['problemInfo']) => void;
  setView: (view: AppState['view']) => void;
  setOpenAIApiKey: (apiKey: AppState['openAIApiKey']) => void;
  setGeminiApiKey: (apiKey: AppState['geminiApiKey']) => void;
  setExtractionModel: (model: AppState['extractionModel']) => void;
  setSolutionModel: (model: AppState['solutionModel']) => void;
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

    // Settings
    openAIApiKey: null,
    setOpenAIApiKey: (apiKey) => {
      set({ openAIApiKey: apiKey });
      window.electronAPI.setState({ openAIApiKey: apiKey });
    },
    geminiApiKey: null,
    setGeminiApiKey: (apiKey) => {
      set({ geminiApiKey: apiKey });
      window.electronAPI.setState({ geminiApiKey: apiKey });
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
    language: LANGUAGES.PYTHON,
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
