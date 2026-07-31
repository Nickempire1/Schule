import type { Milestone } from '../utils/eventMath'
import { formatKm } from '../utils/time'

interface Props {
  milestone: Milestone
}

export function MilestoneDisplay({ milestone }: Props) {
  return (
    <div className="block">
      <span className="block__label">Nächster Meilenstein</span>
      <span className="block__value numeric">
        {formatKm(milestone.km)} km ({milestone.lap} Runden)
      </span>
    </div>
  )
}
