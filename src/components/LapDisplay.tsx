import { getCurrentLapNumber } from '../utils/eventMath'

interface Props {
  lapCount: number
}

export function LapDisplay({ lapCount }: Props) {
  const currentLap = getCurrentLapNumber(lapCount)

  return (
    <div className="block laps">
      <span className="block__label">Runde</span>
      <span className="block__value numeric">{lapCount}</span>
      <span className="laps__current numeric">
        Aktuelle Runde: <strong>{currentLap} / ∞</strong>
      </span>
    </div>
  )
}
