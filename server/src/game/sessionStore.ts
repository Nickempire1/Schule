import fs from "fs";
import path from "path";
import { Session } from "./state";

const DATA_DIR = path.join(__dirname, "..", "..", "data", "sessions");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const sessions = new Map<string, Session>();
const dirty = new Set<string>();

function filePathFor(code: string): string {
  return path.join(DATA_DIR, `${code}.json`);
}

export function loadAllFromDisk(): void {
  if (!fs.existsSync(DATA_DIR)) return;
  for (const file of fs.readdirSync(DATA_DIR)) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
      const session: Session = JSON.parse(raw);
      sessions.set(session.code, session);
    } catch (err) {
      console.error(`Konnte Session-Datei ${file} nicht laden:`, err);
    }
  }
  console.log(`${sessions.size} Session(s) von Disk geladen.`);
}

export function getSession(code: string): Session | undefined {
  return sessions.get(code.toUpperCase());
}

export function putSession(session: Session): void {
  sessions.set(session.code, session);
  markDirty(session.code);
}

export function deleteSession(code: string): void {
  sessions.delete(code);
  const file = filePathFor(code);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

export function allSessions(): Session[] {
  return Array.from(sessions.values());
}

function markDirty(code: string): void {
  dirty.add(code);
}

function flushDirty(): void {
  for (const code of Array.from(dirty)) {
    const session = sessions.get(code);
    dirty.delete(code);
    if (!session) continue;
    try {
      fs.writeFileSync(filePathFor(code), JSON.stringify(session));
    } catch (err) {
      console.error(`Konnte Session ${code} nicht speichern:`, err);
    }
  }
}

setInterval(flushDirty, 3000).unref();

// Alte, verwaiste Sessions (LOBBY seit > 24h oder FINISHED seit > 7 Tagen)
// regelmässig aufräumen, damit die Disk nicht zuwächst.
function cleanupStale(): void {
  const now = Date.now();
  for (const session of Array.from(sessions.values())) {
    const ageMs = now - session.updatedAt;
    const isStaleLobby = session.status === "LOBBY" && ageMs > 24 * 3600 * 1000;
    const isStaleFinished =
      session.status === "FINISHED" && ageMs > 7 * 24 * 3600 * 1000;
    if (isStaleLobby || isStaleFinished) {
      deleteSession(session.code);
    }
  }
}

setInterval(cleanupStale, 60 * 60 * 1000).unref();
