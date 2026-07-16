import { useMemo, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { sendAction } from "../../lib/socket";
import { previewPrice } from "../../lib/pricing";
import { CATEGORY_ICON } from "../../components/icons";
import { CountdownTo } from "../../components/Timer";
import QuestionLogItem from "../../components/QuestionLogItem";
import { QuestionCategory } from "../../types";

const CATEGORIES: QuestionCategory[] = ["GEOGRAPHY", "PHOTO", "VIDEO", "AUDIO", "TEXT", "PHYSICAL"];

export default function SeekerQuestionsPanel() {
  const { view, gameData } = useGameStore();
  const [category, setCategory] = useState<QuestionCategory>("GEOGRAPHY");
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [variant, setVariant] = useState<"normal" | "strong">("normal");
  const [paramsText, setParamsText] = useState("");
  const [busy, setBusy] = useState(false);

  const round = view?.currentRound;
  const sizeCfg = gameData?.sizes.find((s) => s.id === round?.size);

  const openQuestion = round?.questionLog.find((q) => q.status === "PENDING");

  const questionsInCategory = useMemo(
    () => gameData?.questions.filter((q) => q.category === category) ?? [],
    [gameData, category]
  );

  if (!round || !sizeCfg || !gameData) return null;

  const repeatCounts: Record<string, number> = {};
  for (const q of round.questionLog) {
    if (q.status !== "VOIDED") {
      repeatCounts[q.questionId] = (repeatCounts[q.questionId] ?? 0) + 1;
    }
  }

  const def = gameData.questions.find((q) => q.id === selectedQuestion);
  const repeatIndex = def ? repeatCounts[def.id] ?? 0 : 0;
  const price = def ? previewPrice(sizeCfg, variant, repeatIndex) : null;

  async function ask() {
    if (!selectedQuestion) return;
    setBusy(true);
    const res = await sendAction("askQuestion", { questionId: selectedQuestion, variant, paramsText });
    setBusy(false);
    if (res.ok) {
      setSelectedQuestion(null);
      setParamsText("");
    }
  }

  return (
    <div className="stack">
      {round.phase === "HIDING" && (
        <div className="panel">
          <p className="muted">
            Der Hider ist noch im Vorsprung unterwegs. Sobald die Hiding Period endet, könnt ihr
            Fragen stellen.
          </p>
        </div>
      )}

      {round.phase !== "HIDING" && openQuestion && (
        <div className="panel stack" style={{ borderColor: "var(--blue)" }}>
          <div className="row row--between">
            <b className="small">Frage läuft - wartet auf Antwort</b>
            <CountdownTo target={openQuestion.deadline} />
          </div>
          <QuestionLogItem entry={openQuestion} />
        </div>
      )}

      {round.phase !== "HIDING" && !openQuestion && !round.seekerGateBlocked && (
        <div className="panel stack">
          <h2>Frage stellen</h2>
          <div className="tabbar" style={{ flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <div
                key={c}
                className={`tabbar__item ${category === c ? "tabbar__item--active" : ""}`}
                onClick={() => {
                  setCategory(c);
                  setSelectedQuestion(null);
                }}
              >
                {CATEGORY_ICON[c]}
              </div>
            ))}
          </div>

          <div className="stack">
            {questionsInCategory.map((q) => {
              const isSelected = selectedQuestion === q.id;
              const usedTimes = repeatCounts[q.id] ?? 0;
              return (
                <div
                  key={q.id}
                  className="panel panel--tight stack"
                  style={{
                    cursor: "pointer",
                    borderColor: isSelected ? "var(--red)" : undefined,
                    gap: 4,
                  }}
                  onClick={() => {
                    setSelectedQuestion(isSelected ? null : q.id);
                    setVariant("normal");
                  }}
                >
                  <div className="row row--between">
                    <b className="small">{q.title}</b>
                    {usedTimes > 0 && <span className="badge">bereits {usedTimes}x gefragt</span>}
                  </div>
                  <p className="small">{q.description.replace("{{REGION}}", regionWord(round.size))}</p>
                  {isSelected && (
                    <div className="stack" onClick={(e) => e.stopPropagation()}>
                      <div className="row">
                        <button
                          className={`btn btn--sm ${variant === "normal" ? "btn--primary" : "btn--secondary"}`}
                          onClick={() => setVariant("normal")}
                        >
                          Normal ({previewPrice(sizeCfg, "normal", usedTimes).draw}/
                          {previewPrice(sizeCfg, "normal", usedTimes).keep})
                        </button>
                        {q.hasStrongVariant && (
                          <button
                            className={`btn btn--sm ${variant === "strong" ? "btn--primary" : "btn--secondary"}`}
                            onClick={() => setVariant("strong")}
                          >
                            Verstärkt ({previewPrice(sizeCfg, "strong", usedTimes).draw}/
                            {previewPrice(sizeCfg, "strong", usedTimes).keep})
                          </button>
                        )}
                      </div>
                      <label className="field">
                        Details / Parameter für den Hider
                        <textarea
                          className="input"
                          rows={2}
                          placeholder="z.B. Referenzort, Distanz, Farbe, Himmelsrichtung..."
                          value={paramsText}
                          onChange={(e) => setParamsText(e.target.value)}
                        />
                      </label>
                      <button className="btn btn--primary btn--block" disabled={busy} onClick={ask}>
                        Frage stellen (zieh {price?.draw} / behalte {price?.keep})
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="stack">
        <h3 className="muted">Verlauf</h3>
        {[...round.questionLog]
          .reverse()
          .filter((q) => q.id !== openQuestion?.id)
          .map((q) => (
            <QuestionLogItem key={q.id} entry={q} />
          ))}
        {round.questionLog.length === 0 && <p className="muted small">Noch keine Fragen gestellt.</p>}
      </div>
    </div>
  );
}

function regionWord(size: string): string {
  if (size === "STADT") return "Stadtteil/Quartier";
  if (size === "KANTON") return "Bezirk";
  return "Kanton";
}
