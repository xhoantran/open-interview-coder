import axios from 'axios';
import fs from 'node:fs';
import { PROCESSING_EVENTS } from '../constant';
import { getImagePreview, ScreenshotHelper } from './ScreenshotHelper';
import { MainWindowHelper } from './MainWindowHelper';
import {
  debugSolutionResponses,
  extractProblemInfo,
  generateSolutionResponses,
} from './ProblemHandler';
import stateManager from '../stateManager';

export class ProcessingHelper {
  private screenshotHelper: ScreenshotHelper = ScreenshotHelper.getInstance();

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
      const screenshotQueue = this.screenshotHelper.getScreenshotQueue();
      if (screenshotQueue.length === 0) {
        mainWindow.webContents.send(PROCESSING_EVENTS.NO_SCREENSHOTS);
        return;
      }

      mainWindow.webContents.send(PROCESSING_EVENTS.INITIAL_START);
      stateManager.setState({ view: 'queue' });

      // Initialize AbortController
      this.currentProcessingAbortController = new AbortController();
      const { signal } = this.currentProcessingAbortController;

      try {
        const screenshots = await Promise.all(
          screenshotQueue.map(async (path) => ({
            path,
            preview: await getImagePreview(path),
            data: fs.readFileSync(path).toString('base64'), // Read image data
          })),
        );

        const result = await this.processScreenshotsHelper(screenshots, signal);

        if (!result.success) {
          if (result.error?.includes('API Key out of credits')) {
            mainWindow.webContents.send(
              PROCESSING_EVENTS.API_KEY_OUT_OF_CREDITS,
            );
          } else if (
            result.error?.includes(
              'Please close this window and re-enter a valid Open AI API key.',
            )
          ) {
            mainWindow.webContents.send(PROCESSING_EVENTS.API_KEY_INVALID);
          } else {
            mainWindow.webContents.send(
              PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR,
              result.error,
            );
          }
        }
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
      const extraScreenshotQueue =
        this.screenshotHelper.getExtraScreenshotQueue();
      if (extraScreenshotQueue.length === 0) {
        mainWindow.webContents.send(PROCESSING_EVENTS.NO_SCREENSHOTS);
        return;
      }
      mainWindow.webContents.send(PROCESSING_EVENTS.DEBUG_START);

      // Initialize AbortController
      this.currentExtraProcessingAbortController = new AbortController();
      const { signal } = this.currentExtraProcessingAbortController;

      try {
        const screenshots = await Promise.all(
          [
            ...this.screenshotHelper.getScreenshotQueue(),
            ...extraScreenshotQueue,
          ].map(async (path) => ({
            path,
            preview: await getImagePreview(path),
            data: fs.readFileSync(path).toString('base64'), // Read image data
          })),
        );

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

  private async processScreenshotsHelper(
    screenshots: Array<{ path: string; data: string }>,
    signal: AbortSignal,
  ) {
    try {
      const imageDataList = screenshots.map((screenshot) => screenshot.data);
      const mainWindow = this.mainWindowHelper.getMainWindow();
      let problemInfo;

      console.log('Processing screenshots:', imageDataList);

      // First function call - extract problem info
      try {
        problemInfo = await extractProblemInfo(imageDataList);
        console.log('Problem info:', problemInfo);

        // Store problem info in AppState
        stateManager.setState({ problemInfo });

        // Send first success event
        if (mainWindow) {
          mainWindow.webContents.send(
            PROCESSING_EVENTS.PROBLEM_EXTRACTED,
            problemInfo,
          );
        }
      } catch (error: any) {
        if (error.message?.includes('API Key out of credits')) {
          throw new Error(error.message);
        }
        throw error; // Re-throw if not an API key error
      }

      // Second function call - generate solutions
      if (mainWindow) {
        const solutionsResult = await this.generateSolutionsHelper(signal);
        if (solutionsResult.success) {
          mainWindow.webContents.send(
            PROCESSING_EVENTS.SOLUTION_SUCCESS,
            solutionsResult.data,
          );
        } else {
          throw new Error(
            solutionsResult.error || 'Failed to generate solutions',
          );
        }
      }

      return { success: true, data: problemInfo };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async generateSolutionsHelper(signal: AbortSignal) {
    try {
      const { problemInfo } = stateManager.getState();
      if (!problemInfo) {
        throw new Error('No problem info available');
      }

      // Use the generateSolutionResponses function
      const solutions = await generateSolutionResponses(problemInfo, signal);

      if (!solutions) {
        throw new Error('No solutions received');
      }

      return { success: true, data: solutions };
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

  private async processExtraScreenshotsHelper(
    screenshots: Array<{ path: string; data: string }>,
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
