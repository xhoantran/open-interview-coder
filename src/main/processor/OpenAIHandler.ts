import axios, { AxiosError } from 'axios';
import { OpenAIModel } from '../../types/models';
import { ProblemSchema, SolutionSchema } from '../../types/ProblemInfo';
import stateManager from '../stateManager';

const openAiAxios = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

openAiAxios.interceptors.request.use(
  (config) => {
    const { openAIApiKey } = stateManager.getState();
    if (openAIApiKey) {
      config.headers.Authorization = `Bearer ${openAIApiKey}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export async function extractProblemInfo(
  model: OpenAIModel,
  imageDataList: string[],
  signal: AbortSignal,
): Promise<ProblemSchema> {
  const { openAIApiKey } = stateManager.getState();
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not set');
  }

  // Prepare the image contents for the message
  const imageContents = imageDataList.map((imageData) => ({
    type: 'image_url',
    image_url: {
      url: `data:image/jpeg;base64,${imageData}`,
    },
  }));

  // Construct the messages to send to the model
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text:
            'Extract the following information from this coding problem image:\n' +
            '1. ENTIRE Problem statement (what needs to be solved)\n' +
            '2. Input/Output format\n' +
            '3. Constraints on the input\n' +
            '4. Example test cases\n' +
            'Format each test case exactly like this:\n' +
            "{'input': {'args': [nums, target]}, 'output': {'result': [0,1]}}\n" +
            "Note: test cases must have 'input.args' as an array of arguments in order,\n" +
            "'output.result' containing the expected return value.\n" +
            'Example for two_sum([2,7,11,15], 9) returning [0,1]:\n' +
            "{'input': {'args': [[2,7,11,15], 9]}, 'output': {'result': [0,1]}}\n",
        },
        ...imageContents,
      ],
    },
  ];

  // Define the function schema
  const functions = [
    {
      name: 'extract_problem_details',
      description:
        'Extract and structure the key components of a coding problem',
      parameters: {
        type: 'object',
        properties: {
          problem_statement: {
            type: 'string',
            description:
              'The ENTIRE main problem statement describing what needs to be solved',
          },
          input_format: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of the input format',
              },
              parameters: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Name of the parameter',
                    },
                    type: {
                      type: 'string',
                      enum: [
                        'number',
                        'string',
                        'array',
                        'array2d',
                        'array3d',
                        'matrix',
                        'tree',
                        'graph',
                      ],
                      description: 'Type of the parameter',
                    },
                    subtype: {
                      type: 'string',
                      enum: ['integer', 'float', 'string', 'char', 'boolean'],
                      description: 'For arrays, specifies the type of elements',
                    },
                  },
                  required: ['name', 'type'],
                },
              },
            },
            required: ['description', 'parameters'],
          },
          output_format: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of the expected output format',
              },
              type: {
                type: 'string',
                enum: [
                  'number',
                  'string',
                  'array',
                  'array2d',
                  'array3d',
                  'matrix',
                  'boolean',
                ],
                description: 'Type of the output',
              },
              subtype: {
                type: 'string',
                enum: ['integer', 'float', 'string', 'char', 'boolean'],
                description: 'For arrays, specifies the type of elements',
              },
            },
            required: ['description', 'type'],
          },
          constraints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description: 'Description of the constraint',
                },
                parameter: {
                  type: 'string',
                  description: 'The parameter this constraint applies to',
                },
                range: {
                  type: 'object',
                  properties: {
                    min: { type: 'number' },
                    max: { type: 'number' },
                  },
                },
              },
              required: ['description'],
            },
          },
          test_cases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                input: {
                  type: 'object',
                  properties: {
                    args: {
                      type: 'array',
                      items: {
                        anyOf: [
                          { type: 'integer' },
                          { type: 'string' },
                          {
                            type: 'array',
                            items: {
                              anyOf: [
                                { type: 'integer' },
                                { type: 'string' },
                                { type: 'boolean' },
                                { type: 'null' },
                              ],
                            },
                          },
                          { type: 'object' },
                          { type: 'boolean' },
                          { type: 'null' },
                        ],
                      },
                    },
                  },
                  required: ['args'],
                },
                output: {
                  type: 'object',
                  properties: {
                    result: {
                      anyOf: [
                        { type: 'integer' },
                        { type: 'string' },
                        {
                          type: 'array',
                          items: {
                            anyOf: [
                              { type: 'integer' },
                              { type: 'string' },
                              { type: 'boolean' },
                              { type: 'null' },
                            ],
                          },
                        },
                        { type: 'object' },
                        { type: 'boolean' },
                        { type: 'null' },
                      ],
                    },
                  },
                  required: ['result'],
                },
              },
              required: ['input', 'output'],
            },
            minItems: 1,
          },
        },
        required: ['problem_statement'],
      },
    },
  ];

  // Prepare the request payload
  const payload = {
    model,
    messages,
    functions,
    function_call: { name: 'extract_problem_details' },
    max_tokens: 4096,
  };

  try {
    // Send the request to the completion endpoint
    const response = await openAiAxios.post('/chat/completions', payload, {
      signal,
    });

    // Extract the function call arguments from the response
    const functionCallArguments =
      response.data.choices[0].message.function_call.arguments;

    // Return the parsed function call arguments
    return JSON.parse(functionCallArguments);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error(
          'Please close this window and re-enter a valid Open AI API key.',
        );
      }
      if (error.response?.status === 429) {
        throw new Error(
          'API Key out of credits. Please refill your OpenAI API credits and try again.',
        );
      }
    }

    throw error;
  }
}

export async function generateSolutionResponses(
  model: OpenAIModel,
  problemInfo: ProblemSchema,
  signal: AbortSignal,
): Promise<SolutionSchema> {
  try {
    // Build the complete prompt with all problem information
    const promptContent = `Given the following coding problem:

Problem Statement:
${problemInfo.problem_statement}

Input Format:
${problemInfo.input_format.description ?? 'Input format not available'}
Parameters:
${
  problemInfo.input_format.parameters
    ?.map((p) => `- ${p.name}: ${p.type}${p.subtype ? ` of ${p.subtype}` : ''}`)
    .join('\n') ?? 'No parameters available'
}

Output Format:
${problemInfo.output_format.description ?? 'Output format not available'}
Returns: ${problemInfo.output_format.type ?? 'Type not specified'}${
      problemInfo.output_format?.subtype
        ? ` of ${problemInfo.output_format.subtype}`
        : ''
    }

Constraints:
${
  problemInfo.constraints
    ?.map((c) => {
      let constraintStr = `- ${c.description}`;
      if (c.range) {
        constraintStr += ` (${c.parameter}: ${c.range.min} to ${c.range.max})`;
      }
      return constraintStr;
    })
    .join('\n') ?? 'No constraints specified'
}

Test Cases:
${JSON.stringify(problemInfo.test_cases ?? 'No test cases available', null, 2)}

Generate a solution in this format:
{
  "thoughts": [
    "First thought showing recognition of the problem and core challenge",
    "Second thought naming specific algorithm/data structure being considered",
    "Third thought showing confidence in approach while acknowledging details needed"
  ],
  "code": "The Python solution with comments explaining the code",
  "time_complexity": "The time complexity in form O(_) because _",
  "space_complexity": "The space complexity in form O(_) because _"
}

Format Requirements:
1. Use actual line breaks in code field
2. Indent code properly with spaces
3. Include clear code comments
4. Response must be valid JSON
5. Return only the JSON object with no markdown or other formatting`;

    const payload = {
      model,
      messages: [
        {
          role: 'user',
          content: promptContent,
        },
      ],
    };

    const response = await openAiAxios.post('/chat/completions', payload, {
      signal,
    });

    const { content } = response.data.choices[0].message;
    return JSON.parse(content);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error(
        'Please close this window and re-enter a valid Open AI API key.',
      );
    }
    if (error.response?.status === 429) {
      throw new Error(
        'API Key out of credits. Please refill your OpenAI API credits and try again.',
      );
    }
    console.error('Error details:', error);
    throw new Error(`Error generating solutions: ${error.message}`);
  }
}
