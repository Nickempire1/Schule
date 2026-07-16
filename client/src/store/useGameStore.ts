import { create } from "zustand";
import { GameData, PlayerView } from "../types";
import { getSocket, authCreate, authJoin, authRejoin } from "../lib/socket";
import { fetchGameData } from "../lib/api";

const STORAGE_KEY = "verstecken-ch-session";

interface StoredAuth {
  code: string;
  token: string;
  name: string;
}

function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

interface GameStoreState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  gameData: GameData | null;
  view: PlayerView | null;
  code: string | null;
  playerId: string | null;
  name: string;

  init: () => Promise<void>;
  createSession: (name: string) => Promise<boolean>;
  joinSession: (code: string, name: string) => Promise<boolean>;
  leaveSession: () => void;
  setError: (msg: string | null) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  connected: false,
  connecting: false,
  error: null,
  gameData: null,
  view: null,
  code: null,
  playerId: null,
  name: "",

  init: async () => {
    set({ connecting: true });
    try {
      const gameData = await fetchGameData();
      set({ gameData });
    } catch (err) {
      set({ error: (err as Error).message });
    }

    const socket = getSocket();
    socket.on("connect", () => set({ connected: true }));
    socket.on("disconnect", () => set({ connected: false }));
    socket.on("state", (view: PlayerView) => set({ view, code: view.code, playerId: view.you.id }));

    const stored = loadStoredAuth();
    if (stored) {
      const res = await authRejoin(stored.code, stored.token);
      if (res.ok) {
        set({ code: res.code, playerId: res.playerId, name: stored.name });
      } else {
        clearStoredAuth();
      }
    }
    set({ connecting: false });
  },

  createSession: async (name: string) => {
    set({ error: null });
    const res = await authCreate(name);
    if (!res.ok) {
      set({ error: res.error });
      return false;
    }
    storeAuth({ code: res.code, token: res.token, name });
    set({ code: res.code, playerId: res.playerId, name });
    return true;
  },

  joinSession: async (code: string, name: string) => {
    set({ error: null });
    const res = await authJoin(code.trim().toUpperCase(), name);
    if (!res.ok) {
      set({ error: res.error });
      return false;
    }
    storeAuth({ code: res.code, token: res.token, name });
    set({ code: res.code, playerId: res.playerId, name });
    return true;
  },

  leaveSession: () => {
    clearStoredAuth();
    set({ code: null, playerId: null, view: null });
    window.location.reload();
  },

  setError: (msg: string | null) => set({ error: msg }),
}));

export function useIsHider(): boolean {
  const view = useGameStore((s) => s.view);
  return !!view?.currentRound && view.currentRound.myRole === "HIDER";
}
