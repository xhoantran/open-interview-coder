import { LANGUAGES, VIEW } from '../constant';
import { ModelType } from './models';
import { ProblemSchema, SolutionSchema } from './ProblemInfo';

export type ViewType = (typeof VIEW)[keyof typeof VIEW];

export type LanguageType = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export interface Screenshot {
  id: string;
  data: string;
  timestamp: number;
}

export interface AppState {
  // Functional state
  view: ViewType;
  problemInfo: ProblemSchema | null;
  solutionData: SolutionSchema | null;
  screenshotQueue: Screenshot[];
  extraScreenshotQueue: Screenshot[];

  // Settings
  openAIApiKey: string | null;
  geminiApiKey: string | null;
  extractionModel: ModelType;
  solutionModel: ModelType;
  language: LanguageType;
  opacity: number;
}
