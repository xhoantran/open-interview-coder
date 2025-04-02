import { isOpenAIModel } from '../../types/models';
import { ProblemSchema } from '../../types/ProblemInfo';
import stateManager from '../stateManager';
import * as OpenAIHandler from './OpenAIHandler';

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

  throw new Error(`Unsupported extraction model: ${extractionModel}`);
};

export const generateSolutionResponses = async (
  problemInfo: ProblemSchema,
  signal: AbortSignal,
) => {
  const { solutionModel } = stateManager.getState();

  if (isOpenAIModel(solutionModel))
    return OpenAIHandler.generateSolutionResponses(
      solutionModel,
      problemInfo,
      signal,
    );

  throw new Error(`Unsupported solution model: ${solutionModel}`);
};
