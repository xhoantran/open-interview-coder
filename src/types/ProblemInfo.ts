interface Parameter {
  name: string;
  type:
    | 'number'
    | 'string'
    | 'array'
    | 'array2d'
    | 'array3d'
    | 'matrix'
    | 'tree'
    | 'graph';
  subtype?: 'integer' | 'float' | 'string' | 'char' | 'boolean';
}

interface InputFormat {
  description: string;
  parameters: Parameter[];
}

interface OutputFormat {
  description: string;
  type:
    | 'number'
    | 'string'
    | 'array'
    | 'array2d'
    | 'array3d'
    | 'matrix'
    | 'boolean';
  subtype?: 'integer' | 'float' | 'string' | 'char' | 'boolean';
}

interface Constraint {
  description: string;
  parameter?: string;
  range?: {
    min?: number;
    max?: number;
  };
}

type TestCaseArg =
  | number
  | string
  | boolean
  | null
  | TestCaseArg[]
  | Record<string, unknown>;

interface TestCase {
  input: {
    args: TestCaseArg[];
  };
  output: {
    result: TestCaseArg;
  };
}

export interface ProblemSchema {
  problem_statement: string;
  input_format: InputFormat;
  output_format: OutputFormat;
  constraints?: Constraint[];
  test_cases: TestCase[];
}

export interface MCQSchema {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface UnifiedProblemSchema {
  type: 'mcq' | 'coding';
  mcq_data?: MCQSchema;
  coding_data?: ProblemSchema;
}

export interface SolutionSchema {
  code: string;
  thoughts: string[];
  time_complexity: string;
  space_complexity: string;
}
