export const VIEW = {
  QUEUE: 'queue',
  SOLUTIONS: 'solutions',
  DEBUG: 'debug',
} as const;
export const ALLOWED_MODELS = ['gpt-4o', 'gpt-4o-mini'] as const;
export const ALLOWED_LANGUAGES = [
  'python',
  'javascript',
  'java',
  'golang',
  'cpp',
  'kotlin',
] as const;
