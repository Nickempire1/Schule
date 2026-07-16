import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import BrandMark from "../components/BrandMark";

export default function HomeScreen({ onShowRules }: { onShowRules: () => void }) {
  const { createSession, joinSession, error } = useGameStore();
  const [mode, setMode] = useState<"none" | "create" | "join">("none");
  const [name, setName] = useState(() => localStorage.getItem("verstecken-ch-name") || "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code");
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      setMode("join");
    }
  }, []);

  useEffect(() => {
    if (name) localStorage.setItem("verstecken-ch-name", name);
  }, [name]);

  async function handleCreate() {
    setBusy(true);
    await createSession(name || "Host");
    setBusy(false);
  }

  async function handleJoin() {
    if (!code.trim()) return;
    setBusy(true);
    await joinSession(code, name || "Spieler");
    setBusy(false);
  }

  return (
    <div className="screen" style={{ justifyContent: "center", minHeight: "100vh" }}>
      <div className="stack" style={{ alignItems: "center", marginBottom: 8 }}>
        <BrandMark size={72} />
        <h1 style={{ textAlign: "center" }}>
          Versteck<span style={{ color: "var(--red)" }}>en</span> CH
        </h1>
        <p className="muted" style={{ textAlign: "center", maxWidth: 340 }}>
          Ein Hider versteckt sich irgendwo in der Schweiz. Die anderen jagen ihn mit Fragen,
          Köpfchen und dem ÖV. Wer gewinnt?
        </p>
      </div>

      <div className="panel stack">
        <label className="field">
          Dein Name
          <input
            className="input"
            value={name}
            maxLength={24}
            placeholder="z.B. Nick"
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        {mode === "none" && (
          <div className="stack">
            <button className="btn btn--primary btn--block" onClick={() => setMode("create")}>
              Neue Session erstellen
            </button>
            <button className="btn btn--secondary btn--block" onClick={() => setMode("join")}>
              Session beitreten
            </button>
          </div>
        )}

        {mode === "create" && (
          <div className="stack">
            <p className="small muted">
              Du wirst Host der Lobby. Andere Spieler:innen können danach per Code oder Link
              beitreten - solange ihr im selben WLAN / Netzwerk seid.
            </p>
            <button className="btn btn--primary btn--block" onClick={handleCreate} disabled={busy}>
              {busy ? "Erstelle..." : "Lobby erstellen"}
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => setMode("none")}>
              Zurück
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="stack">
            <label className="field">
              Session-Code
              <input
                className="input input--code"
                value={code}
                maxLength={9}
                placeholder="XXXXX"
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </label>
            <button className="btn btn--primary btn--block" onClick={handleJoin} disabled={busy}>
              {busy ? "Beitreten..." : "Beitreten"}
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => setMode("none")}>
              Zurück
            </button>
          </div>
        )}
      </div>

      <button className="btn btn--ghost btn--block" onClick={onShowRules}>
        Wie funktioniert das Spiel?
      </button>
    </div>
  );
}
