import { formatPace } from '../utils/time'

interface Props {
  averagePaceMinPerKm: number
}

export function PaceDisplay({ averagePaceMinPerKm }: Props) {
  return (
    <div className="block">
      <span className="block__label">Ø Pace</span>
      <span className="block__value numeric">{formatPace(averagePaceMinPerKm)} /km</span>
    </div>
  )
}
