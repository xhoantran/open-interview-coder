import { ALLOWED_LANGUAGES, ALLOWED_MODELS, VIEW } from '../constant';
import { ProblemSchema, SolutionSchema } from './ProblemInfo';

export type ViewType = (typeof VIEW)[keyof typeof VIEW];

export type AllowedModelType = (typeof ALLOWED_MODELS)[number];

export type AllowedLanguageType =
  (typeof ALLOWED_LANGUAGES)[keyof typeof ALLOWED_LANGUAGES];

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
  apiKey: string;
  extractionModel: AllowedModelType;
  solutionModel: AllowedModelType;
  debuggingModel: AllowedModelType;
  language: AllowedLanguageType;
  opacity: number;
}
