import { contextBridge, ipcRenderer } from 'electron'

const backyardAPI = {
  toggleFullscreen: (): Promise<boolean> => ipcRenderer.invoke('fullscreen:toggle'),
  setFullscreen: (value: boolean): Promise<boolean> => ipcRenderer.invoke('fullscreen:set', value),
  isFullscreen: (): Promise<boolean> => ipcRenderer.invoke('fullscreen:get'),
}

contextBridge.exposeInMainWorld('backyard', backyardAPI)

export type BackyardAPI = typeof backyardAPI
