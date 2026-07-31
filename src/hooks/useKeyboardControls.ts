import { useEffect, useRef } from 'react'

export interface KeyboardHandlers {
  onIncreaseDistance: () => void
  onDecreaseDistance: () => void
  onToggleTimer: () => void
  onToggleFullscreen: () => void
  onExitFullscreen: () => void
  onRequestReset: () => void
}

/** Wires the global keyboard shortcuts for the live display (see README for the full list). */
export function useKeyboardControls(handlers: KeyboardHandlers): void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const current = handlersRef.current
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          current.onIncreaseDistance()
          break
        case 'ArrowDown':
          event.preventDefault()
          current.onDecreaseDistance()
          break
        case ' ':
        case 'Spacebar':
          event.preventDefault()
          current.onToggleTimer()
          break
        case 'f':
        case 'F':
          event.preventDefault()
          current.onToggleFullscreen()
          break
        case 'Escape':
          event.preventDefault()
          current.onExitFullscreen()
          break
        case 'r':
        case 'R':
          event.preventDefault()
          current.onRequestReset()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
