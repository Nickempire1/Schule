import { ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,4,7,0.72)",
        backdropFilter: "blur(3px)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          animation: "fadeSlideIn 0.22s ease",
          paddingBottom: "calc(16px + var(--safe-bottom))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row row--between">
          <h2>{title}</h2>
          {onClose && (
            <button className="btn btn--ghost btn--sm" onClick={onClose}>
              Schliessen
            </button>
          )}
        </div>
        <div className="stack" style={{ overflowY: "auto", paddingRight: 2 }}>
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}
