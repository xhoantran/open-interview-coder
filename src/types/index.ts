import { LANGUAGES, VIEW, SHORTCUTS } from '../constant';
import { ModelType } from './models';
import { ProblemSchema, SolutionSchema, UnifiedProblemSchema } from './ProblemInfo';

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
  problemInfo: UnifiedProblemSchema | null;
  solutionData: SolutionSchema | null;
  screenshotQueue: Screenshot[];
  extraScreenshotQueue: Screenshot[];

  // Settings
  openAIApiKey: string | null;
  geminiApiKey: string | null;
  extractionModel: ModelType | null;
  solutionModel: ModelType | null;
  language: LanguageType;
  opacity: number;

  // Metadata
  metadata: {
    isMac: boolean;
  };
}

export type AcceleratorElement =
  (typeof SHORTCUTS)[keyof typeof SHORTCUTS][number];
