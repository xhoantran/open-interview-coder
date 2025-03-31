import { ALLOWED_LANGUAGES, ALLOWED_MODELS, VIEW } from './constant';

export type ViewType = (typeof VIEW)[keyof typeof VIEW];

export type AllowedModelType = (typeof ALLOWED_MODELS)[number];

export type AllowedLanguageType = (typeof ALLOWED_LANGUAGES)[number];

export interface AppState {
  view: ViewType;
  problemInfo: any;
  apiKey: string;
  extractionModel: AllowedModelType;
  solutionModel: AllowedModelType;
  debuggingModel: AllowedModelType;
  language: AllowedLanguageType;
  opacity: number;
}
