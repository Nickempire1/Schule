// Zentrale Typdefinitionen für das gesamte Spiel.
// Diese Datei ist die "Quelle der Wahrheit" für alle Datenformen, die
// zwischen Server und Client (via REST/Socket.IO) ausgetauscht werden.

export type GameSizeId = "STADT" | "KANTON" | "SCHWEIZ";

export type Role = "HIDER" | "SEEKER";

export type QuestionCategory =
  | "GEOGRAPHY"
  | "PHOTO"
  | "VIDEO"
  | "AUDIO"
  | "TEXT"
  | "PHYSICAL";

export type AnswerType =
  | "BOOLEAN"
  | "CHOICE"
  | "NUMBER"
  | "TEXT"
  | "PHOTO"
  | "VIDEO"
  | "AUDIO";

export type CardType = "TIME_BONUS" | "POWERUP" | "CURSE";

export type CardRarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY";

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
  timeBonusMinutes: number[]; // parallel to CARD_LIBRARY time bonus order
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
  regionAware?: boolean; // Text passt sich an Spielgrösse an ({{REGION}})
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  effectKey: string; // interner Schlüssel, den die Engine kennt
  target: "SELF" | "SEEKERS" | "NONE";
  duration: string;
  activationCondition: string;
  timing: string;
  stackable: boolean;
  discardAfterUse: boolean;
  counterable: boolean;
  textDescription: string;
  honorSystem: boolean; // true = nicht technisch erzwungen, Ehrenregel
  scalesBySize: boolean;
}

export interface StationDef {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cantonNum: number;
  cantonName: string;
  tier: "HUB" | "REGIONAL" | "CITY_STOP";
  city?: string; // nur bei tier === CITY_STOP
}

export interface CityDef {
  id: string;
  name: string;
  cantonNum: number;
  lat: number;
  lon: number;
}

export interface CantonRef {
  num: number;
  name: string;
}
