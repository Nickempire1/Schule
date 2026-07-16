import { useGameStore } from "../store/useGameStore";
import { sendAction } from "../lib/socket";

export default function FinalScreen() {
  const { view } = useGameStore();
  if (!view) return null;
  const sorted = view.leaderboard;
  const medal = ["🥇", "🥈", "🥉"];

  return (
    <div className="screen">
      <div className="panel stack" style={{ alignItems: "center", textAlign: "center" }}>
        <h1>Endresultat</h1>
        <p className="muted">
          {view.scoringMode === "BEST_ROUND" ? "Es zählt die beste Runde jeder Person." : "Es zählen die Gesamtpunkte."}
        </p>
      </div>

      <div className="panel stack">
        {sorted.map((l, i) => (
          <div key={l.playerId} className="row row--between panel--tight panel" style={{ padding: 12 }}>
            <span>
              {medal[i] ?? `${i + 1}.`} <b>{l.name}</b>
            </span>
            <span className="mono" style={{ fontSize: 18 }}>
              {view.scoringMode === "BEST_ROUND" ? l.bestRoundMinutes : l.totalMinutes} Min.
            </span>
          </div>
        ))}
        {sorted.length === 0 && <p className="muted">Es wurde noch niemand gefunden oder versteckt.</p>}
      </div>

      <div className="panel stack">
        <h2>Rundenverlauf</h2>
        {view.history.map((h) => (
          <div key={h.index} className="row row--between small">
            <span>
              {h.hiderName} ({h.size})
            </span>
            <span className="mono">{h.totalMinutes} Min.</span>
          </div>
        ))}
      </div>

      {view.you.isHost && (
        <button className="btn btn--primary btn--block" onClick={() => sendAction("reopenLobby")}>
          Neues Turnier in dieser Lobby starten
        </button>
      )}
    </div>
  );
}
