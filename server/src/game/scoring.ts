import { SizeConfig } from "./types";
import { Round, ScoreBreakdown } from "./state";

const FULL_SURVIVAL_BONUS_MINUTES: Record<string, number> = {
  STADT: 30,
  KANTON: 60,
  SCHWEIZ: 120,
};

export function computeScore(
  round: Round,
  size: SizeConfig,
  endedAt: number,
  reason: "FOUND" | "SURRENDER" | "TIME_UP"
): ScoreBreakdown {
  const start = round.seekingStartedAt ?? round.hidingEndsAt;
  const rawMs = Math.max(0, endedAt - start);
  const effectiveMs = Math.max(0, rawMs - round.totalPausedMs);
  const actualHidingMinutes = Math.round(effectiveMs / 60000);

  const lateCount = round.questionLog.filter((q) => q.status === "LATE").length;
  const latePenaltyMinutes = lateCount * size.latePenaltyMinutes;

  const specialBonusMinutes =
    reason === "TIME_UP" ? FULL_SURVIVAL_BONUS_MINUTES[size.id] ?? 0 : 0;

  const totalMinutes = Math.max(
    0,
    actualHidingMinutes +
      round.accumulatedTimeBonusMinutes +
      specialBonusMinutes -
      latePenaltyMinutes
  );

  return {
    actualHidingMinutes,
    timeBonusMinutes: round.accumulatedTimeBonusMinutes,
    specialBonusMinutes,
    latePenaltyMinutes,
    totalMinutes,
  };
}
