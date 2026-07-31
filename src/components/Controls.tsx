interface Props {
  isRunning: boolean
  onToggleTimer: () => void
  onRequestReset: () => void
}

export function Controls({ isRunning, onToggleTimer, onRequestReset }: Props) {
  return (
    <div className="controls">
      <button type="button" className="btn btn--accent" onClick={onToggleTimer}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button type="button" className="btn btn--danger" onClick={onRequestReset}>
        Reset Event
      </button>
    </div>
  )
}
