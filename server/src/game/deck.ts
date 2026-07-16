import { nanoid } from "nanoid";
import { CARD_LIBRARY, RARITY_WEIGHTS } from "./cards";
import { CardDef } from "./types";
import { HandCard } from "./state";

// Unendliches, gewichtetes Kartendeck (nach Seltenheit). Es gibt keine
// begrenzte Kartenanzahl - stattdessen wird bei jedem Ziehen zufällig mit
// Gewichtung nach Rarität aus der gesamten Kartenbibliothek gezogen.
function weightedRandomCard(exclude: Set<string> = new Set()): CardDef {
  const pool = CARD_LIBRARY.filter((c) => !exclude.has(c.id));
  const total = pool.reduce((sum, c) => sum + RARITY_WEIGHTS[c.rarity], 0);
  let roll = Math.random() * total;
  for (const card of pool) {
    roll -= RARITY_WEIGHTS[card.rarity];
    if (roll <= 0) return card;
  }
  return pool[pool.length - 1];
}

export function drawCards(count: number): CardDef[] {
  const drawn: CardDef[] = [];
  const seenThisDraw = new Set<string>();
  for (let i = 0; i < count; i++) {
    // Innerhalb eines einzelnen Ziehvorgangs keine exakten Duplikate, damit
    // die Auswahl interessanter bleibt.
    const card = weightedRandomCard(
      seenThisDraw.size < CARD_LIBRARY.length ? seenThisDraw : undefined
    );
    seenThisDraw.add(card.id);
    drawn.push(card);
  }
  return drawn;
}

export function toHandCard(cardId: string): HandCard {
  return { instanceId: nanoid(10), cardId, acquiredAt: Date.now() };
}
