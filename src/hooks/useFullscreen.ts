import { useCallback, useEffect, useState } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    let mounted = true

    if (window.backyard) {
      window.backyard.isFullscreen().then((value) => {
        if (mounted) setIsFullscreen(value)
      })
    } else {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleChange)
    return () => {
      mounted = false
      document.removeEventListener('fullscreenchange', handleChange)
    }
  }, [])

  const enter = useCallback(async () => {
    if (window.backyard) {
      setIsFullscreen(await window.backyard.setFullscreen(true))
    } else if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    }
  }, [])

  const exit = useCallback(async () => {
    if (window.backyard) {
      setIsFullscreen(await window.backyard.setFullscreen(false))
    } else if (document.fullscreenElement) {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const toggle = useCallback(async () => {
    if (window.backyard) {
      setIsFullscreen(await window.backyard.toggleFullscreen())
    } else if (document.fullscreenElement) {
      await exit()
    } else {
      await enter()
    }
  }, [enter, exit])

  return { isFullscreen, enter, exit, toggle }
}
