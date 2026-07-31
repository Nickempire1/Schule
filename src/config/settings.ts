/**
 * Central configuration for the Backyard Ultra live display.
 * Adjust these values to retune the event without touching app logic.
 */
export const settings = {
  /** Distance of a single Backyard Ultra loop, in kilometers. */
  lapDistanceKm: 6.7,

  /** Length of one "hour lap" — the interval between two starts, in seconds. */
  startIntervalSeconds: 60 * 60,

  /** How often the current state is persisted to disk, in milliseconds. */
  autosaveIntervalMs: 5000,

  /** Key used to persist state in localStorage. */
  storageKey: 'backyard-ultra-timer-state-v1',

  colors: {
    background: '#101010',
    primary: '#ffffff',
    accent: '#ff7a00',
    danger: '#ff3b30',
    muted: '#8a8a8a',
  },

  sound: {
    /** Play a beep exactly on every full hour of the event timer. */
    hourlyChimeEnabled: true,
    /** Play a short tick every second during the last 10 seconds of the countdown. */
    finalCountdownTicksEnabled: true,
  },

  countdown: {
    /** Countdown starts blinking orange when this many seconds remain. */
    warnThresholdSeconds: 60,
    /** Countdown starts blinking red when this many seconds remain. */
    criticalThresholdSeconds: 10,
  },
} as const

export type Settings = typeof settings
