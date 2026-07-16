import { useMemo, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { sendAction } from "../lib/socket";
import QrCode from "../components/QrCode";
import { GameSizeId } from "../types";

export default function LobbyScreen() {
  const { view, gameData } = useGameStore();
  const [size, setSize] = useState<GameSizeId>("KANTON");
  const [regionId, setRegionId] = useState<string>("");
  const [hiderId, setHiderId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const joinUrl = useMemo(() => {
    if (!view) return "";
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("code", view.code);
    return url.toString();
  }, [view?.code]);

  if (!view || !gameData) return null;

  const sizeCfg = gameData.sizes.find((s) => s.id === size)!;
  const isHost = view.you.isHost;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(view!.code);
    } catch {
      /* Clipboard evtl. nicht verfügbar - kein Problem */
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
    } catch {
      /* ignore */
    }
  }

  async function handleStart() {
    if (!hiderId) return;
    setBusy(true);
    const region =
      sizeCfg.requiresRegionSelection === "CITY"
        ? { type: "CITY" as const, id: regionId }
        : sizeCfg.requiresRegionSelection === "CANTON"
        ? { type: "CANTON" as const, id: Number(regionId) }
        : undefined;
    await sendAction("startRound", { hiderId, size, region });
    setBusy(false);
  }

  async function kick(targetId: string) {
    await sendAction("kickPlayer", { targetId });
  }

  async function setScoringMode(mode: "EACH_ONCE_TOTAL" | "BEST_ROUND") {
    await sendAction("setScoringMode", { mode });
  }

  const canStart =
    isHost &&
    !!hiderId &&
    view.players.length >= 2 &&
    (sizeCfg.requiresRegionSelection ? !!regionId : true);

  return (
    <div className="screen">
      <div className="panel stack" style={{ alignItems: "center", textAlign: "center" }}>
        <p className="small muted" style={{ marginBottom: -4 }}>
          Andere im gleichen Netzwerk beitreten lassen
        </p>
        <QrCode text={joinUrl} />
        <div className="row">
          <button className="btn btn--secondary btn--sm mono" onClick={copyCode}>
            {view.code} kopieren
          </button>
          <button className="btn btn--ghost btn--sm" onClick={copyLink}>
            Link kopieren
          </button>
        </div>
      </div>

      <div className="panel stack">
        <h2>Spieler ({view.players.length})</h2>
        <div className="stack">
          {view.players.map((p) => (
            <div key={p.id} className="row row--between">
              <div className="row">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: p.connected ? "var(--green)" : "var(--text-3)",
                  }}
                />
                <span>{p.name}</span>
                {p.isHost && <span className="badge badge--gold">Host</span>}
                {p.hasHidden && <span className="badge">hat schon versteckt</span>}
              </div>
              {isHost && !p.isHost && (
                <button className="btn btn--ghost btn--sm" onClick={() => kick(p.id)}>
                  Entfernen
                </button>
              )}
            </div>
          ))}
        </div>
        {view.players.length < 2 && (
          <p className="small muted">Mindestens 2 Spieler:innen nötig, um zu starten.</p>
        )}
      </div>

      {view.leaderboard.length > 0 && (
        <div className="panel stack">
          <h2>Zwischenstand</h2>
          {view.leaderboard.map((l, i) => (
            <div key={l.playerId} className="row row--between small">
              <span>
                {i + 1}. {l.name}
              </span>
              <span className="mono">{l.totalMinutes} Min.</span>
            </div>
          ))}
        </div>
      )}

      {isHost ? (
        <div className="panel stack">
          <h2>Nächste Runde einrichten</h2>

          <label className="field">
            Wer versteckt sich?
            <select className="input" value={hiderId} onChange={(e) => setHiderId(e.target.value)}>
              <option value="">- Hider wählen -</option>
              {view.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.hasHidden ? "(hat schon versteckt)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Spielgrösse
            <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              {gameData.sizes.map((s) => (
                <button
                  key={s.id}
                  className={`btn btn--sm ${size === s.id ? "btn--primary" : "btn--secondary"}`}
                  onClick={() => {
                    setSize(s.id);
                    setRegionId("");
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </label>
          <p className="small muted">{sizeCfg.description}</p>

          {sizeCfg.requiresRegionSelection === "CITY" && (
            <label className="field">
              Stadt
              <select className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                <option value="">- Stadt wählen -</option>
                {gameData.cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {sizeCfg.requiresRegionSelection === "CANTON" && (
            <label className="field">
              Kanton
              <select className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                <option value="">- Kanton wählen -</option>
                {gameData.cantons.map((c) => (
                  <option key={c.num} value={c.num}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="row">
            <button
              className={`btn btn--sm ${view.scoringMode === "EACH_ONCE_TOTAL" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setScoringMode("EACH_ONCE_TOTAL")}
            >
              Gesamtpunkte
            </button>
            <button
              className={`btn btn--sm ${view.scoringMode === "BEST_ROUND" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setScoringMode("BEST_ROUND")}
            >
              Beste Runde zählt
            </button>
          </div>

          <button className="btn btn--primary btn--block" disabled={!canStart || busy} onClick={handleStart}>
            Runde starten
          </button>
        </div>
      ) : (
        <div className="panel">
          <p className="muted">Warte, bis der Host die nächste Runde startet...</p>
        </div>
      )}
    </div>
  );
}
