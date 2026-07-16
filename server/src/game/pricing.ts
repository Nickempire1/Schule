import { SizeConfig } from "./types";
import { Round } from "./state";

export interface QuestionPrice {
  draw: number;
  keep: number;
  repeatIndex: number;
  multiplier: number;
}

// Wiederholte Fragen kosten das (repeatIndex+1)-fache. repeatIndex 0 = erstmalig.
export function computeQuestionPrice(
  size: SizeConfig,
  variant: "normal" | "strong",
  repeatIndex: number
): QuestionPrice {
  const base = size.questionCost[variant];
  const multiplier = repeatIndex + 1;
  return {
    draw: base.draw * multiplier,
    keep: base.keep * multiplier,
    repeatIndex,
    multiplier,
  };
}

export function nextRepeatIndex(round: Round, questionId: string): number {
  return round.questionUsageCount[questionId] ?? 0;
}
