import { AnswerType, GameSizeId, Role } from "./types";

export interface Player {
  id: string;
  token: string;
  name: string;
  connected: boolean;
  isHost: boolean;
  joinedAt: number;
  hasHidden: boolean; // hat in diesem Turnier bereits einmal versteckt
}

export interface RegionSelection {
  type: "CITY" | "CANTON";
  id: string | number;
  name: string;
}

export type QuestionStatus = "PENDING" | "ANSWERED" | "LATE" | "VOIDED";

export interface Answer {
  type: AnswerType;
  value?: string | number | boolean;
  mediaUrl?: string;
  answeredAt: number;
}

export interface QuestionEntry {
  id: string;
  questionId: string;
  variant: "normal" | "strong";
  askedBy: string;
  askedByName: string;
  askedAt: number;
  deadline: number;
  paramsText?: string;
  status: QuestionStatus;
  answer?: Answer;
  revealAt?: number;
  costDraw: number;
  costKeep: number;
  repeatIndex: number;
  cardsDrawnPreview?: string[]; // nur serverseitig sichtbar während Auswahl
  gateRequirementMet?: boolean;
}

export interface HandCard {
  instanceId: string;
  cardId: string;
  acquiredAt: number;
}

export interface ActiveEffect {
  id: string;
  cardId: string;
  effectKey: string;
  startedAt: number;
  endsAt?: number;
  data?: Record<string, unknown>;
  cleared: boolean;
  label: string;
}

export interface PendingDrawChoice {
  id: string;
  source: "question" | "instant";
  questionEntryId?: string;
  cardIds: string[]; // Reihenfolge entspricht Auswahl-Indizes
  keepCount: number;
  createdAt: number;
}

export interface FoundClaim {
  id: string;
  by: string;
  byName: string;
  at: number;
  photoUrl?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  resolvedAt?: number;
}

export interface BoardNote {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface BoardPin {
  id: string;
  authorId: string;
  authorName: string;
  lat: number;
  lon: number;
  label: string;
  probability: number; // 0-100
  excluded: boolean;
  createdAt: number;
}

export interface BoardShape {
  id: string;
  authorId: string;
  type: "CIRCLE" | "LINE";
  // CIRCLE: centerLat/centerLon/radiusM ; LINE: lat1/lon1/lat2/lon2
  centerLat?: number;
  centerLon?: number;
  radiusM?: number;
  lat1?: number;
  lon1?: number;
  lat2?: number;
  lon2?: number;
  color: string;
  label?: string;
  createdAt: number;
}

export interface ScoreBreakdown {
  actualHidingMinutes: number;
  timeBonusMinutes: number;
  specialBonusMinutes: number;
  latePenaltyMinutes: number;
  totalMinutes: number;
}

export type RoundPhase = "HIDING" | "SEEKING" | "ENDGAME" | "FINISHED";

export interface Round {
  index: number;
  hiderId: string;
  hiderName: string;
  size: GameSizeId;
  region?: RegionSelection;
  phase: RoundPhase;
  hidingZoneStationId?: string;
  hidingStartedAt: number;
  hidingEndsAt: number;
  seekingStartedAt?: number;
  roundHardCapAt?: number;
  hiderHand: HandCard[];
  hiderDiscard: HandCard[];
  handLimitBonus: number;
  pendingDrawChoice: PendingDrawChoice | null;
  accumulatedTimeBonusMinutes: number;
  pendingTimeMultiplier: boolean;
  pendingExtraInfoDraw: boolean;
  pendingVoidNextQuestion: boolean;
  pendingForceStrongNextQuestion: boolean;
  pendingDoubleCostNextQuestion: boolean;
  pendingGatePhotoNextQuestion: boolean;
  pendingDelayNextAnswerReveal: boolean;
  activeEffects: ActiveEffect[];
  questionLog: QuestionEntry[];
  questionUsageCount: Record<string, number>;
  hiderClockPausedSince: number | null;
  totalPausedMs: number;
  seekerGateBlocked: boolean; // curse_conditional_question / curse_proof_photo aktiv
  seekerGateReason?: string;
  foundClaims: FoundClaim[];
  endgameStartedAt?: number;
  finishedAt?: number;
  finishedReason?: "FOUND" | "SURRENDER" | "TIME_UP";
  scoreBreakdown?: ScoreBreakdown;
  board: {
    notes: BoardNote[];
    pins: BoardPin[];
    shapes: BoardShape[];
  };
  arrivedInZoneDeclared: boolean;
}

export type SessionStatus = "LOBBY" | "IN_ROUND" | "ROUND_SUMMARY" | "FINISHED";

export interface Session {
  code: string;
  createdAt: number;
  updatedAt: number;
  hostPlayerId: string;
  players: Player[];
  size: GameSizeId;
  scoringMode: "EACH_ONCE_TOTAL" | "BEST_ROUND";
  status: SessionStatus;
  rounds: Round[];
  currentRoundIndex: number;
}

export interface PublicPlayer {
  id: string;
  name: string;
  connected: boolean;
  isHost: boolean;
  hasHidden: boolean;
  role?: Role;
}
