// Alarm Sound Configuration
// These constants define the built-in alarm sounds and validation limits

export const ALARM_SOUNDS = {
  gentle: {
    id: 'gentle',
    label: 'Gentle Chime',
    description: 'Soft, calming notification',
    file: '/sounds/gentle.mp3',
    // Fallback to generated tone if file doesn't exist
    fallbackFrequency: 800, // Hz
  },
  moderate: {
    id: 'moderate',
    label: 'Moderate Bell',
    description: 'Medium intensity alert',
    file: '/sounds/moderate.mp3',
    fallbackFrequency: 1000,
  },
  urgent: {
    id: 'urgent',
    label: 'Urgent Alarm',
    description: 'Clear, attention-getting sound',
    file: '/sounds/urgent.mp3',
    fallbackFrequency: 1200,
  },
} as const;

export type AlarmSoundId = keyof typeof ALARM_SOUNDS;

// Custom audio upload limits
export const CUSTOM_AUDIO_LIMITS = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_DURATION: 10, // seconds
  ALLOWED_TYPES: [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
  ],
} as const;

// Default alarm settings
export const DEFAULT_ALARM_SETTINGS = {
  enabled: true,
  sound: 'moderate' as AlarmSoundId,
  volume: 70, // 0-100
  visualEnabled: false, // Screen flash for accessibility
  useCustom: false,
} as const;

// Validation error messages
export const AUDIO_VALIDATION_ERRORS = {
  FILE_TOO_LARGE: `File too large (max ${CUSTOM_AUDIO_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB)`,
  DURATION_TOO_LONG: `Audio too long (max ${CUSTOM_AUDIO_LIMITS.MAX_DURATION} seconds)`,
  INVALID_TYPE: 'Invalid file type (use MP3, WAV, OGG, or M4A)',
  LOAD_FAILED: 'Could not load audio file',
} as const;
