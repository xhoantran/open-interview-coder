import { Screenshot } from '../../types';
import { extractProblemInfo, generateSolutionResponses } from '../processor';
import stateManager from '../stateManager';
import { MainWindowHelper } from './MainWindowHelper';

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
        return;
      }

      stateManager.setState({ view: 'solutions' });

      // Initialize AbortController
      this.currentProcessingAbortController = new AbortController();
      const { signal } = this.currentProcessingAbortController;

      try {
        await this.processScreenshotsHelper(screenshotQueue, signal);
      } catch (error: any) {
        console.error('Error processing screenshots:', error);
      } finally {
        this.currentProcessingAbortController = null;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async processScreenshotsHelper(
    screenshots: Array<Screenshot>,
    signal: AbortSignal,
  ) {
    console.log('Processing screenshots...');
    const imageDataList = screenshots.map((screenshot) => screenshot.data);

    // Store problem info in AppState
    console.log('Extracting problem info...');
    const problemInfo = await extractProblemInfo(imageDataList, signal);
    stateManager.setState({ problemInfo });

    // Second function call - generate solutions
    console.log('Generating solutions...');
    const solutionData = await generateSolutionResponses(problemInfo, signal);
    stateManager.setState({ solutionData });
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
