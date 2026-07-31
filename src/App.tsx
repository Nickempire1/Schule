import { useCallback, useState } from 'react'
import { Clock } from './components/Clock'
import { Controls } from './components/Controls'
import { CountdownDisplay } from './components/CountdownDisplay'
import { DistanceDisplay } from './components/DistanceDisplay'
import { HourlyLapDisplay } from './components/HourlyLapDisplay'
import { LapDisplay } from './components/LapDisplay'
import { MilestoneDisplay } from './components/MilestoneDisplay'
import { PaceDisplay } from './components/PaceDisplay'
import { ResetConfirmDialog } from './components/ResetConfirmDialog'
import { TimerDisplay } from './components/TimerDisplay'
import { settings } from './config/settings'
import { useEventSounds } from './hooks/useEventSounds'
import { useEventState } from './hooks/useEventState'
import { useFullscreen } from './hooks/useFullscreen'
import { useKeyboardControls } from './hooks/useKeyboardControls'
import {
  getAveragePaceMinPerKm,
  getCountdownRemainingSeconds,
  getHourLapNumber,
  getNextMilestone,
} from './utils/eventMath'

export default function App() {
  const event = useEventState()
  const { toggle: toggleFullscreen, exit: exitFullscreen } = useFullscreen()
  const [isResetDialogOpen, setResetDialogOpen] = useState(false)

  const countdownRemainingSeconds = getCountdownRemainingSeconds(
    event.elapsedSeconds,
    settings.startIntervalSeconds,
  )
  const hourLapNumber = getHourLapNumber(event.elapsedSeconds, settings.startIntervalSeconds)
  const milestone = getNextMilestone(event.lapCount, settings.lapDistanceKm)
  const averagePace = getAveragePaceMinPerKm(event.elapsedSeconds, event.distanceKm)

  useEventSounds({
    isRunning: event.isRunning,
    elapsedSeconds: event.elapsedSeconds,
    countdownRemainingSeconds,
  })

  const requestReset = useCallback(() => setResetDialogOpen(true), [])
  const confirmReset = useCallback(() => {
    event.resetEvent()
    setResetDialogOpen(false)
  }, [event])
  const cancelReset = useCallback(() => setResetDialogOpen(false), [])

  const handleExitFullscreen = useCallback(() => {
    if (isResetDialogOpen) {
      setResetDialogOpen(false)
      return
    }
    void exitFullscreen()
  }, [isResetDialogOpen, exitFullscreen])

  useKeyboardControls({
    onIncreaseDistance: event.increaseLap,
    onDecreaseDistance: event.decreaseLap,
    onToggleTimer: event.toggleRunning,
    onToggleFullscreen: () => void toggleFullscreen(),
    onExitFullscreen: handleExitFullscreen,
    onRequestReset: requestReset,
  })

  return (
    <div className="app-shell">
      <Clock />

      <main className="stage">
        <TimerDisplay elapsedSeconds={event.elapsedSeconds} isRunning={event.isRunning} />
        <CountdownDisplay remainingSeconds={countdownRemainingSeconds} />
        <LapDisplay lapCount={event.lapCount} />
        <DistanceDisplay distanceKm={event.distanceKm} />
        <HourlyLapDisplay hourLapNumber={hourLapNumber} />

        <div className="secondary-row">
          <PaceDisplay averagePaceMinPerKm={averagePace} />
          <MilestoneDisplay milestone={milestone} />
        </div>
      </main>

      <Controls
        isRunning={event.isRunning}
        onToggleTimer={event.toggleRunning}
        onRequestReset={requestReset}
      />

      <div className="shortcuts-hint">
        ↑/↓ Distanz · Leertaste Start/Pause · F Vollbild · ESC Verlassen · R Reset
      </div>

      {isResetDialogOpen && <ResetConfirmDialog onConfirm={confirmReset} onCancel={cancelReset} />}
    </div>
  )
}
