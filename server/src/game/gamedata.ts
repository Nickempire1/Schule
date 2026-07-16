import { SIZE_LIST } from "./sizeConfig";
import { QUESTIONS, CATEGORY_LABELS } from "./questions";
import { CARD_LIBRARY } from "./cards";
import { CANTONS, CITIES } from "./stations";

export function buildGameData() {
  return {
    sizes: SIZE_LIST,
    questions: QUESTIONS,
    categoryLabels: CATEGORY_LABELS,
    cards: CARD_LIBRARY,
    cantons: CANTONS,
    cities: CITIES,
  };
}
