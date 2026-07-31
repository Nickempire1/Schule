import { settings } from '../config/settings'

export interface PersistedEventState {
  accumulatedMs: number
  isRunning: boolean
  runningSinceEpochMs: number | null
  lapCount: number
}

export const initialEventState: PersistedEventState = {
  accumulatedMs: 0,
  isRunning: false,
  runningSinceEpochMs: null,
  lapCount: 0,
}

function isPersistedEventState(value: unknown): value is PersistedEventState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.accumulatedMs === 'number' &&
    typeof v.isRunning === 'boolean' &&
    (v.runningSinceEpochMs === null || typeof v.runningSinceEpochMs === 'number') &&
    typeof v.lapCount === 'number'
  )
}

export function loadPersistedState(): PersistedEventState {
  try {
    const raw = window.localStorage.getItem(settings.storageKey)
    if (!raw) return initialEventState
    const parsed = JSON.parse(raw)
    if (!isPersistedEventState(parsed)) return initialEventState
    return parsed
  } catch {
    return initialEventState
  }
}

export function savePersistedState(state: PersistedEventState): void {
  try {
    window.localStorage.setItem(settings.storageKey, JSON.stringify(state))
  } catch {
    // Storage unavailable (e.g. disabled) — the live display keeps running without persistence.
  }
}
