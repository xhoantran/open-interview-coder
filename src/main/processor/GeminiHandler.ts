import {
  FunctionCallingMode,
  GenerationConfig,
  GoogleGenerativeAI,
  Part,
  SchemaType,
  Tool,
  ToolConfig,
} from '@google/generative-ai';
import { GeminiModel } from '../../types/models';
import { ProblemSchema, SolutionSchema } from '../../types/ProblemInfo';
import stateManager from '../stateManager';

export async function extractProblemInfo(
  modelName: GeminiModel, // Use a Gemini model name
  imageDataList: string[],
  // signal: AbortSignal, // AbortSignal not directly supported by generateContent
): Promise<ProblemSchema> {
  const { geminiApiKey } = stateManager.getState(); // Get Gemini key
  if (!geminiApiKey) {
    throw new Error('Gemini API key not set');
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  // --- Prepare Gemini Input ---

  // 1. Prepare the image parts
  const imageParts: Part[] = imageDataList.map((imageData) => ({
    inlineData: {
      mimeType: 'image/jpeg', // Assuming JPEG, adjust if necessary
      data: imageData,
    },
  }));

  // 2. Prepare the text part (prompt)
  const textPart: Part = {
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
  };

  const contents = [{ role: 'user', parts: [textPart, ...imageParts] }];

  const tools: Tool[] = [
    {
      functionDeclarations: [
        {
          name: 'extract_problem_details',
          description:
            'Extract and structure the key components of a coding problem',
          parameters: {
            type: SchemaType.OBJECT, // Use Enum for type safety
            properties: {
              problem_statement: {
                type: SchemaType.STRING,
                description:
                  'The ENTIRE main problem statement describing what needs to be solved',
              },
              input_format: {
                type: SchemaType.OBJECT,
                properties: {
                  description: {
                    type: SchemaType.STRING,
                    description: 'Description of the input format',
                  },
                  parameters: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        name: {
                          type: SchemaType.STRING,
                          description: 'Name of the parameter',
                        },
                        type: {
                          type: SchemaType.STRING,
                          format: 'enum',
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
                          type: SchemaType.STRING,
                          format: 'enum',
                          enum: [
                            'integer',
                            'float',
                            'string',
                            'char',
                            'boolean',
                          ],
                          description:
                            'For arrays, specifies the type of elements',
                        },
                      },
                      required: ['name', 'type'],
                    },
                  },
                },
                required: ['description', 'parameters'],
              },
              output_format: {
                type: SchemaType.OBJECT,
                properties: {
                  description: {
                    type: SchemaType.STRING,
                    description: 'Description of the expected output format',
                  },
                  type: {
                    type: SchemaType.STRING,
                    format: 'enum',
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
                    type: SchemaType.STRING,
                    format: 'enum',
                    enum: ['integer', 'float', 'string', 'char', 'boolean'],
                    description: 'For arrays, specifies the type of elements',
                  },
                },
                required: ['description', 'type'],
              },
              constraints: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    description: {
                      type: SchemaType.STRING,
                      description: 'Description of the constraint',
                    },
                    parameter: {
                      type: SchemaType.STRING,
                      description: 'The parameter this constraint applies to',
                    },
                    range: {
                      type: SchemaType.OBJECT,
                      properties: {
                        min: { type: SchemaType.NUMBER },
                        max: { type: SchemaType.NUMBER },
                      },
                    },
                  },
                  required: ['description'],
                },
              },
              test_cases: {
                type: SchemaType.ARRAY,
                minItems: 1,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    input: {
                      type: SchemaType.OBJECT,
                      properties: {
                        args: {
                          type: SchemaType.ARRAY,
                          items: {
                            type: SchemaType.STRING,
                            description:
                              'Arguments of the function call in order',
                          },
                          description:
                            'Array of arguments of mixed types (number, string, array, object, boolean, null)',
                        },
                      },
                      required: ['args'],
                    },
                    output: {
                      type: SchemaType.OBJECT,
                      properties: {
                        result: {
                          type: SchemaType.OBJECT,
                          properties: {
                            type: {
                              type: SchemaType.STRING,
                              format: 'enum',
                              enum: [
                                'number',
                                'string',
                                'array',
                                'array2d',
                                'array3d',
                                'matrix',
                                'boolean',
                              ],
                              description:
                                'Type of the expected result (number, string, array, object, boolean)',
                            },
                            subtype: {
                              type: SchemaType.STRING,
                              format: 'enum',
                              enum: ['integer', 'float', 'string', 'char'],
                              description:
                                'For arrays, specifies the type of elements',
                            },
                          },
                          description:
                            'Expected result of mixed types (number, string, array, object, boolean, null)',
                        },
                      },
                      required: ['result'],
                    },
                  },
                  required: ['input', 'output'],
                },
              },
            },
            required: ['problem_statement'], // Keep required fields
          },
        },
      ],
    },
  ];

  // --- Configure Generation ---
  const generationConfig = {
    maxOutputTokens: 4096,
    temperature: 0.5,
  };

  // --- Configure Tool Usage ---
  // Force the model to call the specified function
  const toolConfig: ToolConfig = {
    functionCallingConfig: {
      mode: FunctionCallingMode.ANY,
      allowedFunctionNames: ['extract_problem_details'],
    },
  };

  try {
    // --- Send Request ---
    const result = await model.generateContent({
      contents,
      tools,
      toolConfig,
      generationConfig,
    });

    const { response } = result;

    // --- Process Response ---
    const firstCandidate = response?.candidates?.[0];
    const functionCallPart = firstCandidate?.content?.parts?.find(
      (part) => !!part.functionCall,
    );

    if (functionCallPart?.functionCall) {
      const { name, args } = functionCallPart.functionCall;
      if (name === 'extract_problem_details') {
        // Gemini SDK often parses 'args' into an object directly
        // If it were a string (less common now), you'd use JSON.parse(args)
        // Validate the structure if necessary before casting
        return args as ProblemSchema; // Assuming 'args' matches ProblemSchema
      }
      throw new Error(
        `Expected function call 'extract_problem_details' but got '${name}'`,
      );
    } else {
      // Handle cases where the model didn't call the function as expected
      const finishReason = firstCandidate?.finishReason;
      const textResponse = firstCandidate?.content?.parts
        ?.map((p) => p.text)
        .join('');
      console.error(
        'Gemini did not return a function call. Finish Reason:',
        finishReason,
        'Text Response:',
        textResponse,
      );
      throw new Error(
        `Gemini failed to extract problem details. Finish Reason: ${finishReason}`,
      );
    }
  } catch (error: any) {
    // Basic Gemini error handling (might need refinement based on specific errors)
    console.error('Error calling Gemini API:', error);
    if (error.message.includes('API key not valid')) {
      throw new Error(
        'Invalid Gemini API key. Please check your configuration.',
      );
    }
    if (
      error.message.includes('quota') ||
      error.message.includes('rate limit')
    ) {
      throw new Error(
        'Gemini API quota exceeded or rate limit hit. Please check your usage or limits.',
      );
    }
    // Re-throw other errors
    throw error;
  }
} // Adjust path as needed

export async function generateSolutionResponses(
  modelName: GeminiModel,
  problemInfo: ProblemSchema,
): Promise<SolutionSchema> {
  const { geminiApiKey } = stateManager.getState(); // Get Gemini key
  if (!geminiApiKey) {
    throw new Error('Gemini API key not set');
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  // Consider using a more powerful model like Pro for generation tasks if needed
  const model = genAI.getGenerativeModel({
    model: modelName,
    // Optional: Configure safety settings if necessary
    // safetySettings: [...]
  });

  // --- Build the Prompt ---
  // This logic remains the same as it just constructs a string
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
        constraintStr += ` (${c.parameter}: ${c.range.min ?? 'N/A'} to ${c.range.max ?? 'N/A'})`; // Added nullish coalescing for safety
      }
      return constraintStr;
    })
    .join('\n') ?? 'No constraints specified'
}

Test Cases:
${JSON.stringify(problemInfo.test_cases ?? 'No test cases available', null, 2)}

Generate a solution strictly in this JSON format:
{
  "thoughts": [
    "First thought showing recognition of the problem and core challenge.",
    "Second thought naming specific algorithm/data structure being considered.",
    "Third thought showing confidence in approach while acknowledging details needed."
  ],
  "code": "The Python solution code as a single string, including line breaks (\\\\n) and proper indentation. Include comments explaining the code.",
  "time_complexity": "The time complexity in Big O notation (e.g., O(N log N)) followed by a brief justification.",
  "space_complexity": "The space complexity in Big O notation (e.g., O(N)) followed by a brief justification."
}

Format Requirements Checklist (MUST follow):
1. Output MUST be a single, valid JSON object.
2. Do NOT include any text before or after the JSON object (e.g., no markdown).
3. The "code" field MUST be a string containing the complete Python code with comments. Use \\n for newlines within the code string.
4. Ensure all fields ("thoughts", "code", "time_complexity", "space_complexity") are present in the JSON.
5. Follow the Big O notation format precisely for complexities.`;

  // --- Prepare Gemini Input ---
  const contents = [{ role: 'user', parts: [{ text: promptContent }] }];

  // --- Configure Generation ---
  const generationConfig: GenerationConfig = {
    responseMimeType: 'application/json',
    temperature: 0.2,
    // maxOutputTokens: 2048,
  };

  try {
    // --- Send Request ---
    const result = await model.generateContent({
      contents,
      generationConfig, // Apply the JSON config
      // requestOptions: { timeout: 60000 } // Optional: Add timeout
    });

    const { response } = result;

    // --- Process Response ---
    const candidate = response?.candidates?.[0];

    // With responseMimeType='application/json', the result should be in the text part
    if (
      candidate &&
      candidate.content?.parts?.length > 0 &&
      candidate.content.parts[0].text
    ) {
      const jsonText = candidate.content.parts[0].text;
      try {
        // Parse the JSON text received from Gemini
        const parsedJson = JSON.parse(jsonText);
        // You might want to add validation here to ensure it matches SolutionSchema
        return parsedJson as SolutionSchema;
      } catch (parseError) {
        console.error(
          'Failed to parse JSON response from Gemini:',
          jsonText,
          parseError,
        );
        console.error('Prompt sent:', promptContent); // Log the prompt for debugging
        throw new Error(
          `Gemini returned invalid JSON format for the solution. Response text: ${jsonText.substring(0, 500)}...`,
        ); // Include part of the response
      }
    } else {
      // Handle cases where Gemini didn't return expected content (e.g., safety blocked, error)
      const finishReason = candidate?.finishReason;
      const safetyRatings = candidate?.safetyRatings;
      console.error(
        'Gemini did not return valid content. Finish Reason:',
        finishReason,
        'Safety Ratings:',
        safetyRatings,
      );
      console.error('Prompt sent:', promptContent); // Log the prompt for debugging
      throw new Error(
        `Gemini failed to generate solution. Finish Reason: ${finishReason ?? 'Unknown'}`,
      );
    }
  } catch (error: any) {
    // Refined Gemini Error Handling
    console.error('Error calling Gemini API for solution generation:', error);
    console.error('Prompt sent:', promptContent); // Log the prompt for debugging

    if (error.message?.includes('API key not valid')) {
      // Check message content
      throw new Error(
        'Invalid Gemini API key. Please check your configuration.',
      );
    }
    // Check for common quota/rate limit messages (these might vary slightly)
    if (
      error.message?.includes('quota') ||
      error.message?.includes('rate limit') ||
      error.message?.includes('429')
    ) {
      throw new Error(
        'Gemini API quota exceeded or rate limit hit. Please check your usage or limits.',
      );
    }
    // Include more details from the error if available
    const details = error.details || error.message || 'Unknown error';
    throw new Error(`Error generating solution via Gemini: ${details}`);
  }
}
