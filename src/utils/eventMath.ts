/**
 * Pure derived-metric calculations for the Backyard Ultra live display.
 * Kept free of React/state concerns so they stay easy to reason about and test.
 */

/** Seconds remaining until the next lap start, counting down from the interval length. */
export function getCountdownRemainingSeconds(elapsedSeconds: number, intervalSeconds: number): number {
  const elapsed = Math.max(0, Math.floor(elapsedSeconds))
  const intoInterval = elapsed % intervalSeconds
  return intervalSeconds - intoInterval
}

/** 1-indexed "hour lap" the event currently sits in (Stunde 1 during the first interval, etc.). */
export function getHourLapNumber(elapsedSeconds: number, intervalSeconds: number): number {
  const elapsed = Math.max(0, Math.floor(elapsedSeconds))
  return Math.floor(elapsed / intervalSeconds) + 1
}

/** The lap currently being run — one ahead of the last completed lap, hence "n / ∞". */
export function getCurrentLapNumber(completedLaps: number): number {
  return completedLaps + 1
}

export interface Milestone {
  km: number
  lap: number
}

/** Distance and lap number of the next completed-lap milestone. */
export function getNextMilestone(completedLaps: number, lapDistanceKm: number): Milestone {
  const lap = completedLaps + 1
  return { km: Number((lap * lapDistanceKm).toFixed(1)), lap }
}

/** Average pace since event start, in minutes per kilometer. Returns 0 when no distance covered yet. */
export function getAveragePaceMinPerKm(elapsedSeconds: number, distanceKm: number): number {
  if (distanceKm <= 0) return 0
  return elapsedSeconds / 60 / distanceKm
}
