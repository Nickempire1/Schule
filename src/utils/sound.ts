let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!sharedContext) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    sharedContext = new Ctor()
  }
  if (sharedContext.state === 'suspended') {
    void sharedContext.resume()
  }
  return sharedContext
}

/** Plays a short synthesized beep. No audio assets required. */
export function playBeep(frequencyHz: number, durationMs: number, volume = 0.2): void {
  const ctx = getContext()
  if (!ctx) return

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequencyHz
  gain.gain.value = volume

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  const now = ctx.currentTime
  const durationSec = durationMs / 1000

  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec)

  oscillator.start(now)
  oscillator.stop(now + durationSec)
}

/** Chime played at the top of every hour. */
export function playHourlyChime(): void {
  playBeep(880, 350, 0.25)
}

/** Short tick played each of the last 10 seconds before the next start. */
export function playCountdownTick(finalSecond: boolean): void {
  playBeep(finalSecond ? 1200 : 950, 120, 0.2)
}
