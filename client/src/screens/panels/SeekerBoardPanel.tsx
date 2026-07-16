import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { sendAction } from "../../lib/socket";

export default function SeekerNotesPanel() {
  const { view } = useGameStore();
  const round = view?.currentRound;
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!round) return null;

  async function addNote() {
    if (!note.trim()) return;
    setBusy(true);
    await sendAction("addBoardNote", { text: note.trim() });
    setBusy(false);
    setNote("");
  }

  return (
    <div className="stack">
      <div className="panel stack">
        <h2>Notizen des Teams</h2>
        <p className="small muted">
          Pins, Kreise und Linien setzt ihr direkt auf der Karten-Tab. Hier sammelt ihr
          textliche Erkenntnisse und Deduktionen.
        </p>
        <div className="row">
          <input
            className="input"
            placeholder="Notiz hinzufügen..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button className="btn btn--primary btn--sm" disabled={busy} onClick={addNote}>
            +
          </button>
        </div>
        <div className="stack">
          {[...(round.board?.notes ?? [])].reverse().map((n) => (
            <div key={n.id} className="row row--between small panel panel--tight" style={{ padding: 8 }}>
              <span>{n.text}</span>
              <div className="row">
                <span className="muted">{n.authorName}</span>
                <button className="btn btn--ghost btn--sm" onClick={() => sendAction("removeBoardNote", { noteId: n.id })}>
                  ✕
                </button>
              </div>
            </div>
          ))}
          {(round.board?.notes.length ?? 0) === 0 && <p className="muted small">Noch keine Notizen.</p>}
        </div>
      </div>
    </div>
  );
}
