import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { sendAction } from "../../lib/socket";
import CardView from "../../components/CardView";
import { QuestionCategory } from "../../types";
import { TRANSPORT_MODES } from "../../components/icons";

const CATEGORIES: QuestionCategory[] = ["GEOGRAPHY", "PHOTO", "VIDEO", "AUDIO", "TEXT", "PHYSICAL"];

export default function HiderHandPanel() {
  const { view, gameData } = useGameStore();
  const round = view?.currentRound;
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [category, setCategory] = useState<QuestionCategory>("GEOGRAPHY");
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [busy, setBusy] = useState(false);

  if (!round || !gameData) return null;

  const handCards = round.handCards ?? [];
  const selectedHand = handCards.find((c) => c.instanceId === selectedInstance);
  const selectedDef = selectedHand ? gameData.cards.find((c) => c.id === selectedHand.cardId) : null;
  const needsCategory = selectedDef?.effectKey === "BLOCK_CATEGORY";
  const needsTransport = selectedDef?.effectKey === "FORBID_TRANSPORT_MODE";
  const drawChoice = round.pendingDrawChoice;

  async function playSelected() {
    if (!selectedHand) return;
    setBusy(true);
    const res = await sendAction("playCard", {
      instanceId: selectedHand.instanceId,
      category: needsCategory ? category : undefined,
      transportMode: needsTransport ? transportMode : undefined,
    });
    setBusy(false);
    if (res.ok) setSelectedInstance(null);
  }

  async function discardSelected() {
    if (!selectedHand) return;
    setBusy(true);
    await sendAction("discardCard", { instanceId: selectedHand.instanceId });
    setBusy(false);
    setSelectedInstance(null);
  }

  return (
    <div className="stack">
      <div className="panel stack">
        <div className="row row--between">
          <h2>Deine Hand</h2>
          <span className="badge">
            {round.handSize} / {round.handLimit}
          </span>
        </div>
        {round.handSize > round.handLimit && (
          <p className="small" style={{ color: "var(--red)" }}>
            Handlimit überschritten - spiele oder wirf Karten ab!
          </p>
        )}
        <p className="small muted">Angesammelter Zeitbonus: +{round.accumulatedTimeBonusMinutes ?? 0} Min.</p>

        {drawChoice && <DrawChoiceModal />}

        <div className="grid-2">
          {handCards.map((c) => {
            const def = gameData.cards.find((cd) => cd.id === c.cardId);
            if (!def) return null;
            return (
              <CardView
                key={c.instanceId}
                card={def}
                compact
                selected={selectedInstance === c.instanceId}
                onClick={() => setSelectedInstance(selectedInstance === c.instanceId ? null : c.instanceId)}
              />
            );
          })}
          {handCards.length === 0 && <p className="muted small">Noch keine Karten.</p>}
        </div>

        {selectedDef && (
          <div className="panel panel--tight stack">
            <p className="small">{selectedDef.textDescription}</p>
            {needsCategory && (
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value as QuestionCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {gameData.categoryLabels[c]}
                  </option>
                ))}
              </select>
            )}
            {needsTransport && (
              <select className="input" value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
                {TRANSPORT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
            <div className="row">
              <button className="btn btn--primary" disabled={busy} onClick={playSelected}>
                Karte spielen
              </button>
              <button className="btn btn--secondary" disabled={busy} onClick={discardSelected}>
                Abwerfen
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="panel stack">
        <h3 className="muted">Abwurfstapel (Verlauf)</h3>
        <div className="row row--wrap">
          {round.discardLog.map((d, i) => {
            const def = gameData.cards.find((c) => c.id === d.cardId);
            return (
              <span key={i} className="badge">
                {def?.name ?? d.cardId}
              </span>
            );
          })}
          {round.discardLog.length === 0 && <p className="muted small">Noch nichts gespielt.</p>}
        </div>
      </div>

      <button
        className="btn btn--ghost btn--block"
        onClick={() => {
          if (confirm("Wirklich aufgeben? Die Runde endet sofort für dich.")) {
            sendAction("surrender");
          }
        }}
      >
        🏳️ Aufgeben
      </button>
    </div>
  );
}

function DrawChoiceModal() {
  const { view, gameData } = useGameStore();
  const round = view!.currentRound!;
  const drawChoice = round.pendingDrawChoice!;
  const [chosen, setChosen] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  function toggle(idx: number) {
    setChosen((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= drawChoice.keepCount) return prev;
      return [...prev, idx];
    });
  }

  async function confirm() {
    setBusy(true);
    await sendAction("resolveCardDraw", { chosenIndexes: chosen });
    setBusy(false);
  }

  return (
    <div className="panel panel--tight stack" style={{ borderColor: "var(--gold)" }}>
      <b className="small">
        Wähle {drawChoice.keepCount} von {drawChoice.cardIds.length} gezogenen Karten zum Behalten
      </b>
      <div className="grid-2">
        {drawChoice.cardIds.map((cardId, idx) => {
          const def = gameData!.cards.find((c) => c.id === cardId)!;
          return <CardView key={idx} card={def} compact selected={chosen.includes(idx)} onClick={() => toggle(idx)} />;
        })}
      </div>
      <button className="btn btn--primary btn--block" disabled={chosen.length !== drawChoice.keepCount || busy} onClick={confirm}>
        Bestätigen ({chosen.length}/{drawChoice.keepCount})
      </button>
    </div>
  );
}
