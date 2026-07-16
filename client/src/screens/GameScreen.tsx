import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { sendAction } from "../lib/socket";
import RoundHeader from "../components/RoundHeader";
import MapView from "../components/MapView";
import SeekerQuestionsPanel from "./panels/SeekerQuestionsPanel";
import HiderQuestionsPanel from "./panels/HiderQuestionsPanel";
import HiderHandPanel from "./panels/HiderHandPanel";
import SeekerNotesPanel from "./panels/SeekerBoardPanel";
import MediaCapture from "../components/MediaCapture";
import Modal from "../components/Modal";

type Tab = "map" | "questions" | "extra";

export default function GameScreen() {
  const { view } = useGameStore();
  const round = view?.currentRound;
  const [tab, setTab] = useState<Tab>("map");
  const [claimPhoto, setClaimPhoto] = useState<string | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);

  if (!round) return null;
  const isHider = round.myRole === "HIDER";

  const pendingClaim = round.foundClaims.find((c) => c.status === "PENDING");

  async function declareArrived() {
    await sendAction("declareArrivedInZone");
  }

  async function submitClaim() {
    await sendAction("claimFound", { photoUrl: claimPhoto ?? undefined });
    setShowClaimForm(false);
    setClaimPhoto(null);
  }

  async function respond(confirm: boolean) {
    if (!pendingClaim) return;
    await sendAction("respondFound", { claimId: pendingClaim.id, confirm });
  }

  return (
    <div className="screen" style={{ paddingBottom: isHider ? 32 : 170 }}>
      <RoundHeader />

      <div className="tabbar">
        <div className={`tabbar__item ${tab === "map" ? "tabbar__item--active" : ""}`} onClick={() => setTab("map")}>
          🗺️ Karte
        </div>
        <div className={`tabbar__item ${tab === "questions" ? "tabbar__item--active" : ""}`} onClick={() => setTab("questions")}>
          ❓ Fragen
        </div>
        <div className={`tabbar__item ${tab === "extra" ? "tabbar__item--active" : ""}`} onClick={() => setTab("extra")}>
          {isHider ? "🃏 Hand" : "🕵️ Ermittlung"}
        </div>
      </div>

      {tab === "map" && <MapView />}
      {tab === "questions" && (isHider ? <HiderQuestionsPanel /> : <SeekerQuestionsPanel />)}
      {tab === "extra" && (isHider ? <HiderHandPanel /> : <SeekerNotesPanel />)}

      {!isHider && (round.phase === "SEEKING" || round.phase === "ENDGAME") && (
        <div
          className="stack"
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            width: "100%",
            maxWidth: 560,
            padding: "14px 16px calc(14px + var(--safe-bottom))",
            background: "linear-gradient(0deg, var(--bg-0) 55%, transparent)",
          }}
        >
          {round.phase === "SEEKING" && (
            <button className="btn btn--secondary btn--block" onClick={declareArrived}>
              📍 In der Zone angekommen
            </button>
          )}
          <button className="btn btn--primary btn--block" onClick={() => setShowClaimForm(true)}>
            🎯 Gefunden!
          </button>
        </div>
      )}

      {showClaimForm && (
        <Modal title="Hider gefunden melden" onClose={() => setShowClaimForm(false)}>
          <p className="small muted">
            Optional: Füge ein Beweisfoto bei. Der Hider muss die Meldung bestätigen, bevor die Runde endet.
          </p>
          <MediaCapture kind="PHOTO" onUploaded={setClaimPhoto} />
          <button className="btn btn--primary btn--block" onClick={submitClaim}>
            Meldung senden
          </button>
        </Modal>
      )}

      {isHider && pendingClaim && (
        <Modal title="Ein Seeker meldet: Gefunden!">
          <p>
            <b>{pendingClaim.byName}</b> behauptet, dich gefunden zu haben. Stimmt das?
          </p>
          {pendingClaim.photoUrl && <img src={pendingClaim.photoUrl} style={{ width: "100%", borderRadius: 12 }} alt="Beweisfoto" />}
          <div className="row">
            <button className="btn btn--success btn--block" onClick={() => respond(true)}>
              Ja, gefunden
            </button>
            <button className="btn btn--danger btn--block" onClick={() => respond(false)}>
              Nein, falsch
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
