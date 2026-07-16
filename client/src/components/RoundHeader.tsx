import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { sendAction } from "../lib/socket";
import { CountdownTo, CountUpFrom } from "./Timer";
import MediaCapture from "./MediaCapture";

const PHASE_LABEL: Record<string, string> = {
  HIDING: "Hiding Period",
  SEEKING: "Seeking Period",
  ENDGAME: "Endgame",
  FINISHED: "Beendet",
};

export default function RoundHeader() {
  const { view } = useGameStore();
  const [gateBusy, setGateBusy] = useState(false);
  const round = view?.currentRound;
  if (!round) return null;

  const isHider = round.myRole === "HIDER";

  async function clearGate(mediaUrl?: string) {
    setGateBusy(true);
    await sendAction("clearGate", { mediaUrl });
    setGateBusy(false);
  }

  return (
    <div className="panel stack" style={{ gap: 10 }}>
      <div className="row row--between">
        <div className="row">
          <span className="badge badge--red">{PHASE_LABEL[round.phase]}</span>
          <span className="badge">{isHider ? "Du bist der Hider" : "Du bist Seeker"}</span>
        </div>
        <span className="badge">{round.region?.name ?? round.size}</span>
      </div>

      {round.phase === "HIDING" && (
        <div className="row row--between">
          <span className="muted small">Vorsprung endet in</span>
          <CountdownTo target={round.hidingEndsAt} className="row" />
        </div>
      )}

      {(round.phase === "SEEKING" || round.phase === "ENDGAME") && round.seekingStartedAt && (
        <div className="row row--between">
          <span className="muted small">
            {isHider ? "Deine bisherige Versteckzeit" : "Versteckzeit des Hiders"}
            {round.isPausedForOverdueQuestion && " (pausiert)"}
          </span>
          <CountUpFrom
            start={round.seekingStartedAt}
            pausedMs={round.totalPausedMs}
            pausedSince={round.pausedSince}
          />
        </div>
      )}

      {round.activeEffects.length > 0 && (
        <div className="stack" style={{ gap: 6 }}>
          {round.activeEffects.map((e) => (
            <div key={e.id} className="row row--between small" style={{ background: "var(--bg-3)", padding: "6px 10px", borderRadius: 8 }}>
              <span>☠️ {e.label}</span>
              {e.endsAt && <CountdownTo target={e.endsAt} />}
            </div>
          ))}
        </div>
      )}

      {!isHider && round.seekerGateBlocked && (
        <div className="panel panel--tight stack" style={{ background: "rgba(232,17,45,0.1)", borderColor: "rgba(232,17,45,0.35)" }}>
          <b className="small">
            🔒 Der Hider hat eine Bedingung gestellt, bevor ihr weiter fragen könnt.
          </b>
          {round.seekerGateReason === "PHOTO" ? (
            <MediaCapture kind="PHOTO" onUploaded={(url) => clearGate(url)} />
          ) : (
            <button className="btn btn--secondary btn--sm" disabled={gateBusy} onClick={() => clearGate()}>
              Bestätigen: Aufgabe erledigt
            </button>
          )}
        </div>
      )}
    </div>
  );
}
