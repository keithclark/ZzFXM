// The number of pattern rows to jump when using fine navigation
export const PATTERN_ROW_FINE_STEP = 1;

// The number of pattern rows to jump when using coarse navigation
export const PATTERN_ROW_COARSE_STEP = 4;

// The number of attenutation steps to jump when using fine navigation
export const ATTENUATION_FINE_STEP = .01;

// The number of attenutation steps to jump when using coarse navigation
export const ATTENUATION_COARSE_STEP = .1;

// Keyboard map for notes
export const NOTE_KEY_CODES = {
  'z': 1, 's': 2, 'x': 3, 'd': 4, 'c': 5, 'v': 6, 'g': 7, 'b': 8, 'h': 9,
  'n': 10, 'j': 11, 'm': 12, ',': 13, 'l': 14, '.': 15, ';': 16, '/': 17,
  'q': 18, '2': 19, 'w': 20, '3': 21, 'e': 22, 'r': 23, '5': 24, 't': 25,
  '6': 26, 'y': 27, '7': 28, 'u': 29, 'i': 30, '9': 31, 'o': 32, '0': 33,
  'p': 34, '[': 35, '=': 36
};

// UI update speed options - shown in the settings modal
export const UI_FPS_OPTIONS = [
  60, 30, 15, 10, 5
];

// Sample rate options - shown in the settings modal
export const PLAYER_SAMPLE_RATE_OPTIONS = [
  44100, 22050, 11025
];

// Song player buffer size options
export const PLAYER_BUFFER_SIZE_OPTIONS = [
  16384, 8192, 4096, 2048, 1024
];

// The default sample rate for the song player
export const DEFAULT_PLAYER_SAMPLE_RATE = PLAYER_SAMPLE_RATE_OPTIONS[0];

// The default buffer size for the song player
export const DEFAULT_PLAYER_BUFFER_SIZE = PLAYER_BUFFER_SIZE_OPTIONS[2];

// The default UI refresh rate
export const DEFAULT_UI_FPS = UI_FPS_OPTIONS[0];
