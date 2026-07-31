import { formatHMS } from '../utils/time'

interface Props {
  elapsedSeconds: number
  isRunning: boolean
}

export function TimerDisplay({ elapsedSeconds, isRunning }: Props) {
  return (
    <div className={`block timer ${isRunning ? '' : 'timer--paused'}`}>
      <span className="block__value numeric">{formatHMS(elapsedSeconds)}</span>
    </div>
  )
}
