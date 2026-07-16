import { GameSizeId } from "./types";

// Effektdauer in Minuten, je nach Spielgrösse, für Karten mit skalierender Wirkung.
export const BLOCK_CATEGORY_MINUTES: Record<GameSizeId, number> = {
  STADT: 15,
  KANTON: 30,
  SCHWEIZ: 45,
};

export const SEEKER_TIME_FREEZE_MINUTES: Record<GameSizeId, number> = {
  STADT: 10,
  KANTON: 15,
  SCHWEIZ: 20,
};

export const SEEKER_BOARDING_FREEZE_MINUTES: Record<GameSizeId, number> = {
  STADT: 5,
  KANTON: 10,
  SCHWEIZ: 15,
};
