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
  GEMINI_2_0_FLASH_LITE: 'gemini-2.0-flash-lite',
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
} as const;

export const RECOMMENDED_EXTRACTION_MODEL = [
  OPEN_AI_MODELS.GPT_4O_MINI,
  GEMINI_MODELS.GEMINI_2_0_FLASH_LITE,
] as const;
export const RECOMMENDED_SOLITION_MODEL = [
  OPEN_AI_MODELS.GPT_4O,
  GEMINI_MODELS.GEMINI_2_5_PRO,
] as const;

export const LANGUAGES = {
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
  JAVA: 'java',
  GOLANG: 'go',
  CPP: 'cpp',
  KOTLIN: 'kotlin',
} as const;

export const MAX_SCREENSHOTS = 5;

export const SHORTCUTS = {
  SCREENSHOT: ['CommandOrControl', 'H'],
  SOLVE: ['CommandOrControl', 'Enter'],
  TOGGLE_WINDOW: ['CommandOrControl', 'B'],
  TOGGLE_SETTINGS: ['CommandOrControl', 'Shift', 'I'],
  MOVE_WINDOW_LEFT: ['CommandOrControl', 'Left'],
  MOVE_WINDOW_RIGHT: ['CommandOrControl', 'Right'],
  MOVE_WINDOW_UP: ['CommandOrControl', 'Up'],
  MOVE_WINDOW_DOWN: ['CommandOrControl', 'Down'],
  MOVE_WINDOW: ['CommandOrControl', 'Arrows'],
  DECREASE_OPACITY: ['CommandOrControl', '['],
  INCREASE_OPACITY: ['CommandOrControl', ']'],
  ADJUST_OPACITY: ['CommandOrControl', '[ or ]'],
  RESET: ['CommandOrControl', 'R'],
} as const;
