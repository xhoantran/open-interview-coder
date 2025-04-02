export const VIEW = {
  QUEUE: 'queue',
  SOLUTIONS: 'solutions',
  SETTINGS: 'settings',
} as const;

export const OPEN_AI_MODELS = {
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
} as const;

export const GEMINI_MODELS = {
  GEMINI_1_5_PRO: 'gemini-1.5-pro',
  GEMINI_2_0_FLASH: 'gemini-2.0-flash',
} as const;

export const MODELS = [
  ...Object.values(OPEN_AI_MODELS),
  ...Object.values(GEMINI_MODELS),
] as const;

export const LANGUAGES = {
  PYTHON: 'Python',
  JAVASCRIPT: 'JavaScript',
  JAVA: 'Java',
  GOLANG: 'Go',
  CPP: 'C++',
  KOTLIN: 'Kotlin',
} as const;

export const MAX_SCREENSHOTS = 5;
