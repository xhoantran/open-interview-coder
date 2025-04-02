import { GEMINI_MODELS, OPEN_AI_MODELS } from '../constant';

export type OpenAIModel = (typeof OPEN_AI_MODELS)[keyof typeof OPEN_AI_MODELS];

export const isOpenAIModel = (model: string): model is OpenAIModel => {
  return Object.values(OPEN_AI_MODELS).includes(model as OpenAIModel);
};

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];

export const isGeminiModel = (model: string): model is GeminiModel => {
  return Object.values(GEMINI_MODELS).includes(model as GeminiModel);
};

export type ModelType = OpenAIModel | GeminiModel;
