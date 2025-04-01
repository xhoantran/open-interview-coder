import axios from 'axios';
import { Screenshot } from '../../types';
import { PROCESSING_EVENTS } from '../constant';
import stateManager from '../stateManager';
import { MainWindowHelper } from './MainWindowHelper';
import {
  debugSolutionResponses,
  extractProblemInfo,
  generateSolutionResponses,
} from './ProblemHandler';

export class ProcessingHelper {
  private mainWindowHelper: MainWindowHelper = MainWindowHelper.getInstance();

  // AbortControllers for API requests
  private currentProcessingAbortController: AbortController | null = null;

  private currentExtraProcessingAbortController: AbortController | null = null;

  // eslint-disable-next-line no-use-before-define
  private static instance: ProcessingHelper;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ProcessingHelper {
    if (!ProcessingHelper.instance) {
      ProcessingHelper.instance = new ProcessingHelper();
    }
    return ProcessingHelper.instance;
  }

  public async processScreenshots(): Promise<void> {
    const mainWindow = this.mainWindowHelper.getMainWindow();
    if (!mainWindow) return;

    const { view } = stateManager.getState();

    if (view === 'queue') {
      const { screenshotQueue } = stateManager.getState();
      if (screenshotQueue.length === 0) {
        mainWindow.webContents.send(PROCESSING_EVENTS.NO_SCREENSHOTS);
        return;
      }

      stateManager.setState({ view: 'solutions' });

      // Initialize AbortController
      this.currentProcessingAbortController = new AbortController();
      const { signal } = this.currentProcessingAbortController;

      try {
        await this.processScreenshotsHelper(screenshotQueue, signal);
      } catch (error: any) {
        if (axios.isCancel(error)) {
          mainWindow.webContents.send(
            PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR,
            'Processing was canceled by the user.',
          );
        } else {
          mainWindow.webContents.send(
            PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR,
            error.message,
          );
        }
      } finally {
        this.currentProcessingAbortController = null;
      }
    } else {
      // view == 'solutions'
      const { extraScreenshotQueue } = stateManager.getState();
      if (extraScreenshotQueue.length === 0) {
        mainWindow.webContents.send(PROCESSING_EVENTS.NO_SCREENSHOTS);
        return;
      }
      mainWindow.webContents.send(PROCESSING_EVENTS.DEBUG_START);

      // Initialize AbortController
      this.currentExtraProcessingAbortController = new AbortController();
      const { signal } = this.currentExtraProcessingAbortController;

      try {
        const screenshots = [
          ...stateManager.getState().screenshotQueue,
          ...extraScreenshotQueue,
        ];

        const result = await this.processExtraScreenshotsHelper(
          screenshots,
          signal,
        );

        if (result.success) {
          mainWindow.webContents.send(
            PROCESSING_EVENTS.DEBUG_SUCCESS,
            result.data,
          );
        } else {
          mainWindow.webContents.send(
            PROCESSING_EVENTS.DEBUG_ERROR,
            result.error,
          );
        }
      } catch (error: any) {
        if (axios.isCancel(error)) {
          mainWindow.webContents.send(
            PROCESSING_EVENTS.DEBUG_ERROR,
            'Extra processing was canceled by the user.',
          );
        } else {
          mainWindow.webContents.send(
            PROCESSING_EVENTS.DEBUG_ERROR,
            error.message,
          );
        }
      } finally {
        this.currentExtraProcessingAbortController = null;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async processScreenshotsHelper(
    screenshots: Array<Screenshot>,
    signal: AbortSignal,
  ) {
    try {
      console.log('Processing screenshots...');
      const imageDataList = screenshots.map((screenshot) => screenshot.data);

      // Store problem info in AppState
      console.log('Extracting problem info...');
      const problemInfo = await extractProblemInfo(imageDataList);
      stateManager.setState({ problemInfo });

      // Second function call - generate solutions
      console.log('Generating solutions...');
      const solutionData = await generateSolutionResponses(problemInfo, signal);
      stateManager.setState({ solutionData });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async processExtraScreenshotsHelper(
    screenshots: Array<Screenshot>,
    signal: AbortSignal,
  ) {
    try {
      const imageDataList = screenshots.map((screenshot) => screenshot.data);

      const { problemInfo } = stateManager.getState();
      if (!problemInfo) {
        throw new Error('No problem info available');
      }

      // Use the debugSolutionResponses function
      const debugSolutions = await debugSolutionResponses(
        imageDataList,
        problemInfo,
        signal,
      );

      if (!debugSolutions) {
        throw new Error('No debug solutions received');
      }

      return { success: true, data: debugSolutions };
    } catch (error: any) {
      const mainWindow = this.mainWindowHelper.getMainWindow();

      // Check if error message indicates API key out of credits
      if (error.message?.includes('API Key out of credits')) {
        if (mainWindow) {
          mainWindow.webContents.send(PROCESSING_EVENTS.API_KEY_OUT_OF_CREDITS);
        }
        return { success: false, error: error.message };
      }

      if (
        error.message?.includes(
          'Please close this window and re-enter a valid Open AI API key.',
        )
      ) {
        if (mainWindow) {
          mainWindow.webContents.send(PROCESSING_EVENTS.API_KEY_INVALID);
        }
        return { success: false, error: error.message };
      }
      return { success: false, error: error.message };
    }
  }

  public cancelOngoingRequests(): void {
    let wasCancelled = false;

    if (this.currentProcessingAbortController) {
      this.currentProcessingAbortController.abort();
      this.currentProcessingAbortController = null;

      wasCancelled = true;
    }

    if (this.currentExtraProcessingAbortController) {
      this.currentExtraProcessingAbortController.abort();
      this.currentExtraProcessingAbortController = null;

      wasCancelled = true;
    }

    const mainWindow = this.mainWindowHelper.getMainWindow();
    if (wasCancelled && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('Processing was canceled by the user.');
    }
  }
}
