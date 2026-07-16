import { useGameStore } from "../store/useGameStore";
import { QuestionEntryView } from "../types";
import { CATEGORY_ICON } from "./icons";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "offen", cls: "badge--blue" },
  ANSWERED: { label: "beantwortet", cls: "badge--green" },
  LATE: { label: "verspätet", cls: "badge--gold" },
  VOIDED: { label: "annulliert", cls: "" },
};

export default function QuestionLogItem({ entry }: { entry: QuestionEntryView }) {
  const gameData = useGameStore((s) => s.gameData);
  const def = gameData?.questions.find((q) => q.id === entry.questionId);
  if (!def) return null;
  const status = STATUS_BADGE[entry.status];

  return (
    <div className="panel panel--tight stack" style={{ gap: 6 }}>
      <div className="row row--between">
        <span className="row small">
          <span>{CATEGORY_ICON[def.category]}</span>
          <b>{def.title}</b>
          {entry.variant === "strong" && <span className="badge badge--gold">verstärkt</span>}
          {entry.repeatIndex > 0 && <span className="badge">x{entry.repeatIndex + 1} Preis</span>}
        </span>
        <span className={`badge ${status.cls}`}>{status.label}</span>
      </div>
      {entry.paramsText && <p className="small">"{entry.paramsText}"</p>}
      <div className="row small muted">
        <span>gefragt von {entry.askedByName}</span>
        <span>·</span>
        <span>
          Kosten: zieh {entry.costDraw} / behalte {entry.costKeep}
        </span>
      </div>
      {entry.status === "ANSWERED" || entry.status === "LATE" ? (
        entry.pendingReveal ? (
          <p className="small muted">⏳ Antwort wird verzögert angezeigt...</p>
        ) : entry.answer ? (
          <AnswerDisplay answer={entry.answer} />
        ) : null
      ) : null}
    </div>
  );
}

function AnswerDisplay({ answer }: { answer: NonNullable<QuestionEntryView["answer"]> }) {
  if (answer.type === "PHOTO" && answer.mediaUrl) {
    return <img src={answer.mediaUrl} alt="Antwort-Foto" style={{ width: "100%", borderRadius: 10 }} />;
  }
  if (answer.type === "VIDEO" && answer.mediaUrl) {
    return <video src={answer.mediaUrl} controls style={{ width: "100%", borderRadius: 10 }} />;
  }
  if (answer.type === "AUDIO" && answer.mediaUrl) {
    return <audio src={answer.mediaUrl} controls style={{ width: "100%" }} />;
  }
  if (answer.type === "BOOLEAN") {
    return <p><b style={{ color: answer.value ? "var(--green)" : "var(--red)" }}>{answer.value ? "Ja" : "Nein"}</b></p>;
  }
  return <p><b>{String(answer.value ?? "-")}</b></p>;
}
