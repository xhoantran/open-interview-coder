export const VIEW = {
  QUEUE: 'queue',
  SOLUTIONS: 'solutions',
  DEBUG: 'debug',
} as const;
export const ALLOWED_MODELS = ['gpt-4o', 'gpt-4o-mini'] as const;
export const ALLOWED_LANGUAGES = {
  PYTHON: 'Python',
  JAVASCRIPT: 'JavaScript',
  JAVA: 'Java',
  GOLANG: 'Go',
  CPP: 'C++',
  KOTLIN: 'Kotlin',
} as const;

export const MAX_SCREENSHOTS = 5;
