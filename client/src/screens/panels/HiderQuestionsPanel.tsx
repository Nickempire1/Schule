import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { sendAction } from "../../lib/socket";
import { CountdownTo } from "../../components/Timer";
import MediaCapture from "../../components/MediaCapture";
import QuestionLogItem from "../../components/QuestionLogItem";

export default function HiderQuestionsPanel() {
  const { view, gameData } = useGameStore();
  const round = view?.currentRound;
  const [value, setValue] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!round || !gameData) return null;

  const pending = round.questionLog.find((q) => q.status === "PENDING");
  const def = gameData.questions.find((q) => q.id === pending?.questionId);

  const canVoid = !!round.handCards?.some((c) => {
    const card = gameData.cards.find((cd) => cd.id === c.cardId);
    return card?.effectKey === "VOID_NEXT_QUESTION";
  });

  async function submitAnswer() {
    if (!pending || !def) return;
    setBusy(true);
    let payload: any = {};
    if (def.answerType === "BOOLEAN") payload.value = value === "true";
    else if (def.answerType === "NUMBER") payload.value = Number(value);
    else if (def.answerType === "TEXT" || def.answerType === "CHOICE") payload.value = value;
    else payload.mediaUrl = mediaUrl;
    const res = await sendAction("answerQuestion", { entryId: pending.id, ...payload });
    setBusy(false);
    if (res.ok) {
      setValue("");
      setMediaUrl(null);
    }
  }

  async function voidQuestion() {
    const card = round!.handCards?.find((c) => {
      const cd = gameData!.cards.find((x) => x.id === c.cardId);
      return cd?.effectKey === "VOID_NEXT_QUESTION";
    });
    if (!card || !pending) return;
    await sendAction("voidPendingQuestion", { instanceId: card.instanceId });
  }

  const canSubmit =
    !!pending &&
    !!def &&
    (def.answerType === "PHOTO" || def.answerType === "VIDEO" || def.answerType === "AUDIO"
      ? !!mediaUrl
      : value !== "");

  return (
    <div className="stack">
      {pending && def ? (
        <div className="panel stack" style={{ borderColor: "var(--red)" }}>
          <div className="row row--between">
            <b>Frage beantworten</b>
            <CountdownTo target={pending.deadline} />
          </div>
          <b className="small">{def.title}</b>
          <p className="small">{def.description}</p>
          {pending.paramsText && <p className="small muted">Details der Seeker: "{pending.paramsText}"</p>}

          {def.answerType === "BOOLEAN" && (
            <div className="row">
              <button className={`btn btn--sm ${value === "true" ? "btn--success" : "btn--secondary"}`} onClick={() => setValue("true")}>
                Ja
              </button>
              <button className={`btn btn--sm ${value === "false" ? "btn--danger" : "btn--secondary"}`} onClick={() => setValue("false")}>
                Nein
              </button>
            </div>
          )}
          {def.answerType === "NUMBER" && (
            <input className="input" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Zahl eingeben" />
          )}
          {(def.answerType === "TEXT" || def.answerType === "CHOICE") && (
            <input className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Antwort eingeben" />
          )}
          {(def.answerType === "PHOTO" || def.answerType === "VIDEO" || def.answerType === "AUDIO") && (
            <MediaCapture kind={def.answerType} onUploaded={setMediaUrl} />
          )}

          <button className="btn btn--primary btn--block" disabled={!canSubmit || busy} onClick={submitAnswer}>
            Antwort senden (ziehe {pending.costDraw} Karten, behalte {pending.costKeep})
          </button>
          {canVoid && (
            <button className="btn btn--ghost btn--block" onClick={voidQuestion}>
              🃏 Fragenverzerrung spielen (annulliert diese Frage)
            </button>
          )}
        </div>
      ) : (
        <div className="panel">
          <p className="muted">Aktuell liegt keine offene Frage vor.</p>
        </div>
      )}

      <div className="stack">
        <h3 className="muted">Verlauf</h3>
        {[...round.questionLog]
          .reverse()
          .filter((q) => q.id !== pending?.id)
          .map((q) => (
            <QuestionLogItem key={q.id} entry={q} />
          ))}
        {round.questionLog.length === 0 && <p className="muted small">Noch keine Fragen erhalten.</p>}
      </div>
    </div>
  );
}
