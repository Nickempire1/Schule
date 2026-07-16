import { Session, Round, QuestionEntry, ActiveEffect } from "./state";
import {
  STATION_BY_ID,
  stationsForCanton,
  stationsForCity,
  stationsForCountry,
} from "./stations";
import { SIZE_CONFIGS } from "./sizeConfig";

function sanitizeEffect(effect: ActiveEffect) {
  if (effect.cleared) return null;
  if (effect.endsAt && effect.endsAt <= Date.now()) return null;
  return effect;
}

function sanitizeQuestionEntry(entry: QuestionEntry, isHider: boolean) {
  const now = Date.now();
  const revealBlocked = !isHider && entry.revealAt !== undefined && entry.revealAt > now;
  return {
    id: entry.id,
    questionId: entry.questionId,
    variant: entry.variant,
    askedBy: entry.askedBy,
    askedByName: entry.askedByName,
    askedAt: entry.askedAt,
    deadline: entry.deadline,
    paramsText: entry.paramsText,
    status: entry.status,
    costDraw: entry.costDraw,
    costKeep: entry.costKeep,
    repeatIndex: entry.repeatIndex,
    revealAt: entry.revealAt,
    answer: revealBlocked ? undefined : entry.answer,
    pendingReveal: revealBlocked,
  };
}

export interface PlayerView {
  code: string;
  status: Session["status"];
  scoringMode: Session["scoringMode"];
  hostPlayerId: string;
  you: { id: string; name: string; isHost: boolean };
  players: Array<{
    id: string;
    name: string;
    connected: boolean;
    isHost: boolean;
    hasHidden: boolean;
    isCurrentHider: boolean;
  }>;
  currentRound: null | {
    index: number;
    hiderId: string;
    hiderName: string;
    myRole: "HIDER" | "SEEKER";
    size: string;
    region?: { type: string; id: string | number; name: string };
    phase: Round["phase"];
    hidingStartedAt: number;
    hidingEndsAt: number;
    seekingStartedAt?: number;
    roundHardCapAt?: number;
    endgameStartedAt?: number;
    arrivedInZoneDeclared: boolean;
    handSize: number;
    handLimit: number;
    handCards?: Array<{ instanceId: string; cardId: string }>;
    discardLog: Array<{ cardId: string; at: number }>;
    accumulatedTimeBonusMinutes?: number;
    pendingFlags?: Record<string, boolean>;
    activeEffects: ActiveEffect[];
    questionLog: Array<ReturnType<typeof sanitizeQuestionEntry>>;
    seekerGateBlocked: boolean;
    seekerGateReason?: string;
    foundClaims: Round["foundClaims"];
    pendingDrawChoice?: { id: string; cardIds: string[]; keepCount: number; source: string };
    hidingZoneStation?: { id: string; name: string; lat: number; lon: number } | null;
    anchorStations: Array<{ id: string; name: string; lat: number; lon: number; tier: string }>;
    board?: Round["board"];
    scoreBreakdown?: Round["scoreBreakdown"];
    finishedReason?: Round["finishedReason"];
    isPausedForOverdueQuestion: boolean;
    pausedSince?: number;
    totalPausedMs: number;
  };
  history: Array<{
    index: number;
    hiderName: string;
    size: string;
    reason?: string;
    totalMinutes?: number;
  }>;
  leaderboard: Array<{ playerId: string; name: string; totalMinutes: number; bestRoundMinutes: number; roundsHidden: number }>;
}

function anchorStationsForView(round: Round) {
  if (round.size === "STADT" && round.region) {
    return stationsForCity(String(round.region.id));
  }
  if (round.size === "KANTON" && round.region) {
    return stationsForCanton(Number(round.region.id));
  }
  return stationsForCountry();
}

export function buildPlayerView(session: Session, playerId: string): PlayerView {
  const player = session.players.find((p) => p.id === playerId);
  const round = session.rounds[session.currentRoundIndex];
  const isHider = !!round && round.hiderId === playerId;

  let currentRound: PlayerView["currentRound"] = null;
  if (round) {
    const anchors = anchorStationsForView(round).map((s) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lon: s.lon,
      tier: s.tier,
    }));

    let hidingZoneStation: { id: string; name: string; lat: number; lon: number } | null = null;
    if (isHider && round.hidingZoneStationId) {
      const st = STATION_BY_ID.get(round.hidingZoneStationId);
      if (st) hidingZoneStation = { id: st.id, name: st.name, lat: st.lat, lon: st.lon };
    }

    currentRound = {
      index: round.index,
      hiderId: round.hiderId,
      hiderName: round.hiderName,
      myRole: isHider ? "HIDER" : "SEEKER",
      size: round.size,
      region: round.region,
      phase: round.phase,
      hidingStartedAt: round.hidingStartedAt,
      hidingEndsAt: round.hidingEndsAt,
      seekingStartedAt: round.seekingStartedAt,
      roundHardCapAt: round.roundHardCapAt,
      endgameStartedAt: round.endgameStartedAt,
      arrivedInZoneDeclared: round.arrivedInZoneDeclared,
      handSize: round.hiderHand.length,
      handLimit: SIZE_CONFIGS[round.size].handLimit + round.handLimitBonus,
      handCards: isHider
        ? round.hiderHand.map((c) => ({ instanceId: c.instanceId, cardId: c.cardId }))
        : undefined,
      discardLog: round.hiderDiscard.map((c) => ({ cardId: c.cardId, at: c.acquiredAt })),
      accumulatedTimeBonusMinutes: isHider ? round.accumulatedTimeBonusMinutes : undefined,
      pendingFlags: isHider
        ? {
            extraInfo: round.pendingExtraInfoDraw,
            forceStrong: round.pendingForceStrongNextQuestion,
            doubleCost: round.pendingDoubleCostNextQuestion,
            timeMultiplier: round.pendingTimeMultiplier,
            delayReveal: round.pendingDelayNextAnswerReveal,
          }
        : undefined,
      activeEffects: round.activeEffects.filter((e) => sanitizeEffect(e)) as ActiveEffect[],
      questionLog: round.questionLog.map((q) => sanitizeQuestionEntry(q, isHider)),
      seekerGateBlocked: round.seekerGateBlocked,
      seekerGateReason: round.seekerGateReason,
      foundClaims: round.foundClaims,
      pendingDrawChoice:
        isHider && round.pendingDrawChoice
          ? {
              id: round.pendingDrawChoice.id,
              cardIds: round.pendingDrawChoice.cardIds,
              keepCount: round.pendingDrawChoice.keepCount,
              source: round.pendingDrawChoice.source,
            }
          : undefined,
      hidingZoneStation: isHider ? hidingZoneStation ?? null : undefined,
      anchorStations: anchors,
      board: !isHider ? round.board : undefined,
      scoreBreakdown: round.scoreBreakdown,
      finishedReason: round.finishedReason,
      isPausedForOverdueQuestion: !!round.hiderClockPausedSince,
      pausedSince: round.hiderClockPausedSince ?? undefined,
      totalPausedMs: round.totalPausedMs,
    };
  }

  const leaderboardMap = new Map<
    string,
    { playerId: string; name: string; totalMinutes: number; bestRoundMinutes: number; roundsHidden: number }
  >();
  for (const r of session.rounds) {
    if (r.phase !== "FINISHED" || !r.scoreBreakdown) continue;
    const existing = leaderboardMap.get(r.hiderId) ?? {
      playerId: r.hiderId,
      name: r.hiderName,
      totalMinutes: 0,
      bestRoundMinutes: 0,
      roundsHidden: 0,
    };
    existing.totalMinutes += r.scoreBreakdown.totalMinutes;
    existing.bestRoundMinutes = Math.max(existing.bestRoundMinutes, r.scoreBreakdown.totalMinutes);
    existing.roundsHidden += 1;
    leaderboardMap.set(r.hiderId, existing);
  }

  return {
    code: session.code,
    status: session.status,
    scoringMode: session.scoringMode,
    hostPlayerId: session.hostPlayerId,
    you: { id: playerId, name: player?.name ?? "?", isHost: !!player?.isHost },
    players: session.players.map((p) => ({
      id: p.id,
      name: p.name,
      connected: p.connected,
      isHost: p.isHost,
      hasHidden: p.hasHidden,
      isCurrentHider: !!round && round.hiderId === p.id,
    })),
    currentRound,
    history: session.rounds
      .filter((r) => r.phase === "FINISHED")
      .map((r) => ({
        index: r.index,
        hiderName: r.hiderName,
        size: r.size,
        reason: r.finishedReason,
        totalMinutes: r.scoreBreakdown?.totalMinutes,
      })),
    leaderboard: Array.from(leaderboardMap.values()).sort((a, b) => b.totalMinutes - a.totalMinutes),
  };
}
