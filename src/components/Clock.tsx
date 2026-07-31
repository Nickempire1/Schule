import { useEffect, useState } from 'react'
import { formatClock } from '../utils/time'

export function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return <div className="wall-clock numeric">{formatClock(now)}</div>
}
