import { formatKm } from '../utils/time'

interface Props {
  distanceKm: number
}

export function DistanceDisplay({ distanceKm }: Props) {
  return (
    <div className="block distance">
      <span className="block__label">Distanz</span>
      <span className="block__value numeric">
        {formatKm(distanceKm)}
        <span className="block__unit">km</span>
      </span>
    </div>
  )
}
