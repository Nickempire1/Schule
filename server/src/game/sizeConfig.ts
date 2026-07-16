import { GameSizeId, SizeConfig } from "./types";

export const SIZE_CONFIGS: Record<GameSizeId, SizeConfig> = {
  STADT: {
    id: "STADT",
    label: "Stadt",
    subtitle: "Kleines Format",
    description:
      "Eine einzelne Schweizer Stadt. Kurze Wege, hohe Informationsdichte, ein Nachmittag oder Abend Spielzeit.",
    hidingPeriodMinutes: 20,
    minRoundHours: 3,
    maxRoundHours: 8,
    hidingZoneRadiusMeters: 600,
    handLimit: 5,
    answerTimeSeconds: {
      BOOLEAN: 90,
      CHOICE: 90,
      NUMBER: 90,
      TEXT: 120,
      PHOTO: 480,
      VIDEO: 600,
      AUDIO: 300,
    },
    questionCost: {
      normal: { draw: 2, keep: 1 },
      strong: { draw: 4, keep: 2 },
    },
    timeBonusMinutes: [5, 10, 15, 25, 40],
    requiresRegionSelection: "CITY",
    latePenaltyMinutes: 5,
  },
  KANTON: {
    id: "KANTON",
    label: "Kanton",
    subtitle: "Mittleres Format",
    description:
      "Ein ganzer Kanton oder eine Metropolregion. Ein guter Tag Spielzeit, ÖV-Planung wird wichtig.",
    hidingPeriodMinutes: 45,
    minRoundHours: 6,
    maxRoundHours: 14,
    hidingZoneRadiusMeters: 4000,
    handLimit: 6,
    answerTimeSeconds: {
      BOOLEAN: 180,
      CHOICE: 180,
      NUMBER: 180,
      TEXT: 240,
      PHOTO: 1200,
      VIDEO: 1500,
      AUDIO: 600,
    },
    questionCost: {
      normal: { draw: 3, keep: 1 },
      strong: { draw: 5, keep: 2 },
    },
    timeBonusMinutes: [10, 20, 30, 45, 75],
    requiresRegionSelection: "CANTON",
    latePenaltyMinutes: 10,
  },
  SCHWEIZ: {
    id: "SCHWEIZ",
    label: "Ganze Schweiz",
    subtitle: "Grosses Format",
    description:
      "Die ganze Schweiz ist das Spielfeld. Mehrtägiges Abenteuer, öffentlicher Verkehr und Reiseplanung entscheiden.",
    hidingPeriodMinutes: 240,
    minRoundHours: 24,
    maxRoundHours: 96,
    hidingZoneRadiusMeters: 20000,
    handLimit: 7,
    answerTimeSeconds: {
      BOOLEAN: 600,
      CHOICE: 600,
      NUMBER: 600,
      TEXT: 900,
      PHOTO: 3600,
      VIDEO: 5400,
      AUDIO: 1800,
    },
    questionCost: {
      normal: { draw: 4, keep: 2 },
      strong: { draw: 6, keep: 3 },
    },
    timeBonusMinutes: [15, 30, 60, 90, 150],
    requiresRegionSelection: null,
    latePenaltyMinutes: 20,
  },
};

export const SIZE_LIST = Object.values(SIZE_CONFIGS);
