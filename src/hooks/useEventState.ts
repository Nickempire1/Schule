import { useEffect, useMemo, useReducer, useState } from 'react'
import { settings } from '../config/settings'
import { initialEventState, loadPersistedState, savePersistedState, type PersistedEventState } from '../utils/persistence'

type Action =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'INCREASE_LAP' }
  | { type: 'DECREASE_LAP' }
  | { type: 'RESET' }

function reducer(state: PersistedEventState, action: Action): PersistedEventState {
  switch (action.type) {
    case 'START': {
      if (state.isRunning) return state
      return { ...state, isRunning: true, runningSinceEpochMs: Date.now() }
    }
    case 'PAUSE': {
      if (!state.isRunning) return state
      const now = Date.now()
      const elapsedSinceStart = state.runningSinceEpochMs ? now - state.runningSinceEpochMs : 0
      return {
        ...state,
        isRunning: false,
        accumulatedMs: state.accumulatedMs + elapsedSinceStart,
        runningSinceEpochMs: null,
      }
    }
    case 'INCREASE_LAP':
      return { ...state, lapCount: state.lapCount + 1 }
    case 'DECREASE_LAP':
      return { ...state, lapCount: Math.max(0, state.lapCount - 1) }
    case 'RESET':
      return { ...initialEventState }
    default:
      return state
  }
}

export function useEventState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersistedState)
  const [now, setNow] = useState(() => Date.now())

  // Drives the once-a-second (ish) re-render that makes the clock tick.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [])

  // Persist immediately on meaningful state changes (start/pause/lap/reset).
  useEffect(() => {
    savePersistedState(state)
  }, [state])

  // Additionally autosave on a fixed cadence, as required for the live display.
  useEffect(() => {
    const id = window.setInterval(() => savePersistedState(state), settings.autosaveIntervalMs)
    return () => window.clearInterval(id)
  }, [state])

  const elapsedMs = useMemo(() => {
    const runningMs = state.isRunning && state.runningSinceEpochMs ? now - state.runningSinceEpochMs : 0
    return state.accumulatedMs + runningMs
  }, [state.accumulatedMs, state.isRunning, state.runningSinceEpochMs, now])

  const elapsedSeconds = elapsedMs / 1000
  const distanceKm = state.lapCount * settings.lapDistanceKm

  return {
    elapsedSeconds,
    isRunning: state.isRunning,
    lapCount: state.lapCount,
    distanceKm,
    start: () => dispatch({ type: 'START' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    toggleRunning: () => dispatch({ type: state.isRunning ? 'PAUSE' : 'START' }),
    increaseLap: () => dispatch({ type: 'INCREASE_LAP' }),
    decreaseLap: () => dispatch({ type: 'DECREASE_LAP' }),
    resetEvent: () => dispatch({ type: 'RESET' }),
  }
}

export type EventState = ReturnType<typeof useEventState>
