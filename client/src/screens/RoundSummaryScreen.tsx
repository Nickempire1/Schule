import { useGameStore } from "../store/useGameStore";
import { sendAction } from "../lib/socket";

const REASON_LABEL: Record<string, string> = {
  FOUND: "Gefunden!",
  SURRENDER: "Aufgegeben",
  TIME_UP: "Volle Zeit überstanden!",
};

export default function RoundSummaryScreen() {
  const { view } = useGameStore();
  if (!view) return null;
  const last = view.history[view.history.length - 1];
  const round = view.currentRound;
  const score = round?.scoreBreakdown;

  return (
    <div className="screen">
      <div className="panel stack" style={{ alignItems: "center", textAlign: "center" }}>
        <span className="badge badge--gold">{last ? REASON_LABEL[last.reason ?? ""] : "Runde beendet"}</span>
        <h1>{last?.hiderName} hat sich versteckt</h1>
        {score && (
          <div className="stack" style={{ width: "100%" }}>
            <div className="row row--between">
              <span className="muted">Versteckzeit</span>
              <span className="mono">{score.actualHidingMinutes} Min.</span>
            </div>
            <div className="row row--between">
              <span className="muted">Zeitbonus-Karten</span>
              <span className="mono">+{score.timeBonusMinutes} Min.</span>
            </div>
            <div className="row row--between">
              <span className="muted">Spezialbonus</span>
              <span className="mono">+{score.specialBonusMinutes} Min.</span>
            </div>
            <div className="row row--between">
              <span className="muted">Verspätungs-Strafe</span>
              <span className="mono">-{score.latePenaltyMinutes} Min.</span>
            </div>
            <hr className="divider" />
            <div className="row row--between">
              <b>Total</b>
              <b className="mono" style={{ fontSize: 20, color: "var(--red)" }}>
                {score.totalMinutes} Min.
              </b>
            </div>
          </div>
        )}
      </div>

      <div className="panel stack">
        <h2>Rangliste</h2>
        {view.leaderboard.map((l, i) => (
          <div key={l.playerId} className="row row--between">
            <span>
              {i + 1}. {l.name}{" "}
              <span className="muted small">
                ({l.roundsHidden}x versteckt, beste {l.bestRoundMinutes} Min.)
              </span>
            </span>
            <span className="mono">{l.totalMinutes} Min.</span>
          </div>
        ))}
      </div>

      {view.you.isHost && (
        <div className="stack">
          <button className="btn btn--secondary btn--block" onClick={() => sendAction("reopenLobby")}>
            Zurück zur Lobby (nächste Runde einrichten)
          </button>
          <button className="btn btn--primary btn--block" onClick={() => sendAction("finishTournament")}>
            Turnier beenden &amp; Endresultat zeigen
          </button>
        </div>
      )}
      {!view.you.isHost && <p className="muted" style={{ textAlign: "center" }}>Warte auf den Host...</p>}
    </div>
  );
}
