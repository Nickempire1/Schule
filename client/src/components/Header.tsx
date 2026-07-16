import { useGameStore } from "../store/useGameStore";
import BrandMark from "./BrandMark";

export default function Header({ onShowRules }: { onShowRules: () => void }) {
  const { code, connected, view, leaveSession } = useGameStore();

  return (
    <div
      className="row row--between"
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-soft)",
        position: "sticky",
        top: 0,
        background: "rgba(5,8,13,0.85)",
        backdropFilter: "blur(10px)",
        zIndex: 20,
      }}
    >
      <div className="brand" style={{ minWidth: 0 }}>
        <BrandMark size={30} />
        {code && (
          <div className="row small mono" style={{ gap: 6, whiteSpace: "nowrap" }}>
            <span
              style={{
                width: 7,
                height: 7,
                flexShrink: 0,
                borderRadius: "50%",
                background: connected ? "var(--green)" : "var(--red)",
              }}
            />
            {code}
          </div>
        )}
      </div>
      <div className="row" style={{ flexShrink: 0 }}>
        <button className="btn btn--ghost btn--sm" onClick={onShowRules}>
          Regeln
        </button>
        {view && (
          <button className="btn btn--ghost btn--sm" onClick={leaveSession} title="Session verlassen">
            Verlassen
          </button>
        )}
      </div>
    </div>
  );
}
