import { settings } from '../config/settings'
import { formatMS } from '../utils/time'

interface Props {
  remainingSeconds: number
}

export function CountdownDisplay({ remainingSeconds }: Props) {
  const isCritical = remainingSeconds <= settings.countdown.criticalThresholdSeconds
  const isWarn = !isCritical && remainingSeconds <= settings.countdown.warnThresholdSeconds

  const modifier = isCritical ? 'countdown--critical' : isWarn ? 'countdown--warn' : ''

  return (
    <div className={`block countdown ${modifier}`}>
      <span className="block__label">Nächster Start in</span>
      <span className="block__value numeric">{formatMS(remainingSeconds)}</span>
    </div>
  )
}
