import { CardDef } from "../types";
import { CARD_TYPE_ICON, RARITY_LABEL } from "./icons";

const RARITY_VAR: Record<string, string> = {
  COMMON: "var(--rarity-common)",
  UNCOMMON: "var(--rarity-uncommon)",
  RARE: "var(--rarity-rare)",
  LEGENDARY: "var(--rarity-legendary)",
};

export default function CardView({
  card,
  selected,
  onClick,
  compact,
}: {
  card: CardDef;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const color = RARITY_VAR[card.rarity];
  return (
    <div
      onClick={onClick}
      className="stack"
      style={{
        border: `1.5px solid ${selected ? color : "var(--border-soft)"}`,
        borderRadius: 16,
        padding: compact ? 10 : 14,
        background: `linear-gradient(160deg, ${color}14, var(--bg-2))`,
        cursor: onClick ? "pointer" : undefined,
        boxShadow: selected ? `0 0 0 2px ${color}55` : undefined,
        gap: 6,
        minWidth: 0,
      }}
    >
      <div className="row row--between">
        <span style={{ fontSize: compact ? 18 : 22 }}>{CARD_TYPE_ICON[card.type]}</span>
        <span className="badge" style={{ color, borderColor: color + "55" }}>
          {RARITY_LABEL[card.rarity]}
        </span>
      </div>
      <b style={{ fontSize: compact ? 13 : 15 }}>{card.name}</b>
      {!compact && <p className="small">{card.textDescription}</p>}
      {card.honorSystem && <span className="badge badge--gold small">🤝 Ehrenregel</span>}
    </div>
  );
}
