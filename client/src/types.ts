export type GameSizeId = "STADT" | "KANTON" | "SCHWEIZ";
export type Role = "HIDER" | "SEEKER";
export type QuestionCategory = "GEOGRAPHY" | "PHOTO" | "VIDEO" | "AUDIO" | "TEXT" | "PHYSICAL";
export type AnswerType = "BOOLEAN" | "CHOICE" | "NUMBER" | "TEXT" | "PHOTO" | "VIDEO" | "AUDIO";
export type CardType = "TIME_BONUS" | "POWERUP" | "CURSE";
export type CardRarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY";
export type RoundPhase = "HIDING" | "SEEKING" | "ENDGAME" | "FINISHED";
export type SessionStatus = "LOBBY" | "IN_ROUND" | "ROUND_SUMMARY" | "FINISHED";

export interface SizeConfig {
  id: GameSizeId;
  label: string;
  subtitle: string;
  description: string;
  hidingPeriodMinutes: number;
  minRoundHours: number;
  maxRoundHours: number;
  hidingZoneRadiusMeters: number;
  handLimit: number;
  answerTimeSeconds: Record<AnswerType, number>;
  questionCost: {
    normal: { draw: number; keep: number };
    strong: { draw: number; keep: number };
  };
  timeBonusMinutes: number[];
  requiresRegionSelection: "CITY" | "CANTON" | null;
  latePenaltyMinutes: number;
}

export interface QuestionDef {
  id: string;
  category: QuestionCategory;
  title: string;
  description: string;
  answerType: AnswerType;
  hasStrongVariant: boolean;
  regionAware?: boolean;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  effectKey: string;
  target: "SELF" | "SEEKERS" | "NONE";
  duration: string;
  activationCondition: string;
  timing: string;
  stackable: boolean;
  discardAfterUse: boolean;
  counterable: boolean;
  textDescription: string;
  honorSystem: boolean;
  scalesBySize: boolean;
}

export interface CantonRef {
  num: number;
  name: string;
}

export interface CityDef {
  id: string;
  name: string;
  cantonNum: number;
  lat: number;
  lon: number;
}

export interface GameData {
  sizes: SizeConfig[];
  questions: QuestionDef[];
  categoryLabels: Record<string, string>;
  cards: CardDef[];
  cantons: CantonRef[];
  cities: CityDef[];
}

export interface StationRef {
  id: string;
  name: string;
  lat: number;
  lon: number;
  tier: "HUB" | "REGIONAL" | "CITY_STOP";
}

export interface QuestionEntryView {
  id: string;
  questionId: string;
  variant: "normal" | "strong";
  askedBy: string;
  askedByName: string;
  askedAt: number;
  deadline: number;
  paramsText?: string;
  status: "PENDING" | "ANSWERED" | "LATE" | "VOIDED";
  costDraw: number;
  costKeep: number;
  repeatIndex: number;
  revealAt?: number;
  answer?: { type: AnswerType; value?: string | number | boolean; mediaUrl?: string; answeredAt: number };
  pendingReveal: boolean;
}

export interface ActiveEffectView {
  id: string;
  cardId: string;
  effectKey: string;
  startedAt: number;
  endsAt?: number;
  data?: Record<string, unknown>;
  cleared: boolean;
  label: string;
}

export interface FoundClaimView {
  id: string;
  by: string;
  byName: string;
  at: number;
  photoUrl?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  resolvedAt?: number;
}

export interface BoardNoteView {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface BoardPinView {
  id: string;
  authorId: string;
  authorName: string;
  lat: number;
  lon: number;
  label: string;
  probability: number;
  excluded: boolean;
  createdAt: number;
}

export interface BoardShapeView {
  id: string;
  authorId: string;
  type: "CIRCLE" | "LINE";
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

export interface ScoreBreakdownView {
  actualHidingMinutes: number;
  timeBonusMinutes: number;
  specialBonusMinutes: number;
  latePenaltyMinutes: number;
  totalMinutes: number;
}

export interface CurrentRoundView {
  index: number;
  hiderId: string;
  hiderName: string;
  myRole: Role;
  size: GameSizeId;
  region?: { type: string; id: string | number; name: string };
  phase: RoundPhase;
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
  activeEffects: ActiveEffectView[];
  questionLog: QuestionEntryView[];
  seekerGateBlocked: boolean;
  seekerGateReason?: string;
  foundClaims: FoundClaimView[];
  pendingDrawChoice?: { id: string; cardIds: string[]; keepCount: number; source: string };
  hidingZoneStation?: { id: string; name: string; lat: number; lon: number } | null;
  anchorStations: StationRef[];
  board?: { notes: BoardNoteView[]; pins: BoardPinView[]; shapes: BoardShapeView[] };
  scoreBreakdown?: ScoreBreakdownView;
  finishedReason?: "FOUND" | "SURRENDER" | "TIME_UP";
  isPausedForOverdueQuestion: boolean;
  pausedSince?: number;
  totalPausedMs: number;
}

export interface PlayerView {
  code: string;
  status: SessionStatus;
  scoringMode: "EACH_ONCE_TOTAL" | "BEST_ROUND";
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
  currentRound: CurrentRoundView | null;
  history: Array<{ index: number; hiderName: string; size: string; reason?: string; totalMinutes?: number }>;
  leaderboard: Array<{ playerId: string; name: string; totalMinutes: number; bestRoundMinutes: number; roundsHidden: number }>;
}
