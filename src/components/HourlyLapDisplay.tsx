interface Props {
  hourLapNumber: number
}

export function HourlyLapDisplay({ hourLapNumber }: Props) {
  return (
    <div className="block hourly">
      <span className="block__label">Stundenrunde</span>
      <span className="block__value numeric">{hourLapNumber}</span>
    </div>
  )
}
