import { useEffect, useRef } from 'react'
import { settings } from '../config/settings'
import { playCountdownTick, playHourlyChime } from '../utils/sound'

interface Params {
  isRunning: boolean
  elapsedSeconds: number
  countdownRemainingSeconds: number
}

/** Plays the hourly chime and the final-countdown ticks, each exactly once per second boundary. */
export function useEventSounds({ isRunning, elapsedSeconds, countdownRemainingSeconds }: Params): void {
  const lastHourRef = useRef<number | null>(null)
  const lastTickSecondRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning) return

    if (settings.sound.hourlyChimeEnabled) {
      const currentHour = Math.floor(elapsedSeconds / settings.startIntervalSeconds)
      if (lastHourRef.current === null) {
        lastHourRef.current = currentHour
      } else if (currentHour > lastHourRef.current && elapsedSeconds > 1) {
        lastHourRef.current = currentHour
        playHourlyChime()
      }
    }

    if (settings.sound.finalCountdownTicksEnabled) {
      const remaining = Math.ceil(countdownRemainingSeconds)
      if (remaining <= settings.countdown.criticalThresholdSeconds && remaining >= 1) {
        if (lastTickSecondRef.current !== remaining) {
          lastTickSecondRef.current = remaining
          playCountdownTick(remaining === 1)
        }
      } else {
        lastTickSecondRef.current = null
      }
    }
  }, [isRunning, elapsedSeconds, countdownRemainingSeconds])
}
