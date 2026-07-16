import { SizeConfig } from "../types";

export function previewPrice(
  cfg: SizeConfig,
  variant: "normal" | "strong",
  repeatIndex: number
): { draw: number; keep: number } {
  const base = cfg.questionCost[variant];
  const multiplier = repeatIndex + 1;
  return { draw: base.draw * multiplier, keep: base.keep * multiplier };
}
