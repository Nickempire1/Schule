import { GameData } from "../types";

export async function fetchGameData(): Promise<GameData> {
  const res = await fetch("/api/gamedata");
  if (!res.ok) throw new Error("Konnte Spieldaten nicht laden.");
  return res.json();
}

export async function uploadMedia(code: string, file: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("file", file, filename);
  const res = await fetch(`/api/sessions/${code}/media`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload fehlgeschlagen.");
  }
  const data = await res.json();
  return data.url as string;
}
