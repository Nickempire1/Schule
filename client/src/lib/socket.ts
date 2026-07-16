import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionDelayMax: 4000,
    });
  }
  return socket;
}

interface AuthOk {
  ok: true;
  code: string;
  playerId: string;
  token: string;
}
interface AuthErr {
  ok: false;
  error: string;
}
export type AuthResult = AuthOk | AuthErr;

export function authCreate(name: string): Promise<AuthResult> {
  return new Promise((resolve) => {
    getSocket().emit("auth:create", { name }, (res: AuthResult) => resolve(res));
  });
}

export function authJoin(code: string, name: string): Promise<AuthResult> {
  return new Promise((resolve) => {
    getSocket().emit("auth:join", { code, name }, (res: AuthResult) => resolve(res));
  });
}

export function authRejoin(code: string, token: string): Promise<AuthResult> {
  return new Promise((resolve) => {
    getSocket().emit("auth:rejoin", { code, token }, (res: AuthResult) => resolve(res));
  });
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export function sendAction(type: string, payload?: Record<string, unknown>): Promise<ActionResult> {
  return new Promise((resolve) => {
    getSocket().emit("game:action", { type, payload }, (res: ActionResult) => {
      resolve(res ?? { ok: true });
    });
  });
}
