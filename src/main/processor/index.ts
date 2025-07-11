import { isGeminiModel, isOpenAIModel } from '../../types/models';
import { ProblemSchema, UnifiedProblemSchema } from '../../types/ProblemInfo';
import stateManager from '../stateManager';
import * as OpenAIHandler from './OpenAIHandler';
import * as GeminiHandler from './GeminiHandler';

export const extractProblemInfo = async (
  imageDataList: string[],
  signal: AbortSignal,
) => {
  const { extractionModel } = stateManager.getState();

  if (isOpenAIModel(extractionModel))
    return OpenAIHandler.extractProblemInfo(
      extractionModel,
      imageDataList,
      signal,
    );

  if (isGeminiModel(extractionModel))
    return GeminiHandler.extractProblemInfo(extractionModel, imageDataList);

  throw new Error(`Unsupported extraction model: ${extractionModel}`);
};

export const generateSolutionResponses = async (
  problemInfo: UnifiedProblemSchema,
  signal: AbortSignal,
) => {
  const { solutionModel } = stateManager.getState();

  // Only generate solutions for coding problems
  if (problemInfo.type !== 'coding' || !problemInfo.coding_data) {
    throw new Error('Solution generation is only available for coding problems');
  }

  if (isOpenAIModel(solutionModel))
    return OpenAIHandler.generateSolutionResponses(
      solutionModel,
      problemInfo.coding_data,
      signal,
    );

  if (isGeminiModel(solutionModel))
    return GeminiHandler.generateSolutionResponses(solutionModel, problemInfo);

  throw new Error(`Unsupported solution model: ${solutionModel}`);
};
