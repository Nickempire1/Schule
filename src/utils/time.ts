export function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

/** Formats total seconds as HH:MM:SS, growing beyond 99 hours if needed. */
export function formatHMS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
}

/** Formats total seconds as MM:SS, used for the next-start countdown. */
export function formatMS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${pad2(minutes)}:${pad2(seconds)}`
}

/** Formats a kilometer value with exactly one decimal place. */
export function formatKm(km: number): string {
  return km.toFixed(1)
}

/** Formats a pace in minutes per kilometer as MM:SS /km. */
export function formatPace(minutesPerKm: number): string {
  if (!Number.isFinite(minutesPerKm) || minutesPerKm <= 0) {
    return '--:--'
  }
  const totalSeconds = Math.round(minutesPerKm * 60)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${pad2(seconds)}`
}

/** Formats the wall-clock time of the host computer as HH:MM. */
export function formatClock(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}
