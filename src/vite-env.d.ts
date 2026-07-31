/// <reference types="vite/client" />

interface BackyardAPI {
  toggleFullscreen: () => Promise<boolean>
  setFullscreen: (value: boolean) => Promise<boolean>
  isFullscreen: () => Promise<boolean>
}

interface Window {
  backyard: BackyardAPI
}
