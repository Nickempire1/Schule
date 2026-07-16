import { nanoid } from "nanoid";
import { GameError } from "./errors";
import * as store from "./sessionStore";
import {
  ActiveEffect,
  BoardPin,
  BoardShape,
  FoundClaim,
  HandCard,
  Player,
  QuestionEntry,
  RegionSelection,
  Round,
  Session,
} from "./state";
import { SIZE_CONFIGS } from "./sizeConfig";
import { GameSizeId, QuestionCategory } from "./types";
import { QUESTION_BY_ID } from "./questions";
import { CARD_BY_ID, TIME_BONUS_CARD_ORDER } from "./cards";
import { drawCards, toHandCard } from "./deck";
import { computeQuestionPrice, nextRepeatIndex } from "./pricing";
import {
  CANTONS,
  CITIES,
  CITY_BY_ID,
  stationsForCanton,
  stationsForCity,
  stationsForCountry,
} from "./stations";
import {
  BLOCK_CATEGORY_MINUTES,
  SEEKER_BOARDING_FREEZE_MINUTES,
  SEEKER_TIME_FREEZE_MINUTES,
} from "./cardDurations";
import { computeScore } from "./scoring";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne verwechselbare Zeichen

function generateCode(): string {
  let code = "";
  for (let attempt = 0; attempt < 50; attempt++) {
    code = "";
    for (let i = 0; i < 5; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    if (!store.getSession(code)) return code;
  }
  return code + nanoid(4);
}

function touch(session: Session): void {
  session.updatedAt = Date.now();
  store.putSession(session);
}

export function requireSession(code: string): Session {
  const session = store.getSession(code);
  if (!session) throw new GameError("Session nicht gefunden.");
  return session;
}

function requirePlayer(session: Session, playerId: string): Player {
  const player = session.players.find((p) => p.id === playerId);
  if (!player) throw new GameError("Spieler nicht Teil dieser Session.");
  return player;
}

function requireHost(session: Session, playerId: string): Player {
  const player = requirePlayer(session, playerId);
  if (!player.isHost) throw new GameError("Nur der Host darf das tun.");
  return player;
}

export function currentRound(session: Session): Round | undefined {
  return session.rounds[session.currentRoundIndex];
}

function requireRound(session: Session): Round {
  const round = currentRound(session);
  if (!round) throw new GameError("Keine aktive Runde.");
  return round;
}

function requireHider(round: Round, playerId: string): void {
  if (round.hiderId !== playerId) {
    throw new GameError("Nur der Hider darf das tun.");
  }
}

function requireSeeker(round: Round, playerId: string): void {
  if (round.hiderId === playerId) {
    throw new GameError("Der Hider darf das nicht tun.");
  }
}

function sizeConfig(round: Round) {
  return SIZE_CONFIGS[round.size];
}

function effectiveHandLimit(round: Round): number {
  return sizeConfig(round).handLimit + round.handLimitBonus;
}

function assertHandWithinLimit(round: Round): void {
  if (round.hiderHand.length > effectiveHandLimit(round)) {
    throw new GameError(
      "Handlimit überschritten - zuerst Karten abwerfen oder ausspielen."
    );
  }
}

function assertNoPendingDraw(round: Round): void {
  if (round.pendingDrawChoice) {
    throw new GameError(
      "Es liegt noch eine offene Kartenauswahl vor - zuerst auflösen."
    );
  }
}

// ---------------------------------------------------------------- SESSION

export function createSession(hostName: string): {
  session: Session;
  player: Player;
} {
  const code = generateCode();
  const host: Player = {
    id: nanoid(12),
    token: nanoid(24),
    name: hostName.trim().slice(0, 24) || "Host",
    connected: true,
    isHost: true,
    joinedAt: Date.now(),
    hasHidden: false,
  };
  const session: Session = {
    code,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hostPlayerId: host.id,
    players: [host],
    size: "KANTON",
    scoringMode: "EACH_ONCE_TOTAL",
    status: "LOBBY",
    rounds: [],
    currentRoundIndex: -1,
  };
  store.putSession(session);
  return { session, player: host };
}

export function joinSession(
  code: string,
  name: string
): { session: Session; player: Player } {
  const session = requireSession(code);
  if (session.status !== "LOBBY") {
    throw new GameError("Diese Session läuft bereits - Beitritt nicht mehr möglich.");
  }
  if (session.players.length >= 8) {
    throw new GameError("Diese Session ist voll.");
  }
  const player: Player = {
    id: nanoid(12),
    token: nanoid(24),
    name: name.trim().slice(0, 24) || "Spieler",
    connected: true,
    isHost: false,
    joinedAt: Date.now(),
    hasHidden: false,
  };
  session.players.push(player);
  touch(session);
  return { session, player };
}

export function rejoinSession(
  code: string,
  token: string
): { session: Session; player: Player } {
  const session = requireSession(code);
  const player = session.players.find((p) => p.token === token);
  if (!player) throw new GameError("Rejoin nicht möglich - Token unbekannt.");
  player.connected = true;
  touch(session);
  return { session, player };
}

export function setConnected(
  code: string,
  playerId: string,
  connected: boolean
): Session {
  const session = requireSession(code);
  const player = requirePlayer(session, playerId);
  player.connected = connected;
  touch(session);
  return session;
}

export function kickPlayer(
  code: string,
  hostPlayerId: string,
  targetId: string
): Session {
  const session = requireSession(code);
  requireHost(session, hostPlayerId);
  if (session.status !== "LOBBY") {
    throw new GameError("Spieler können nur in der Lobby entfernt werden.");
  }
  if (targetId === hostPlayerId) throw new GameError("Der Host kann sich nicht selbst entfernen.");
  session.players = session.players.filter((p) => p.id !== targetId);
  touch(session);
  return session;
}

export function setScoringMode(
  code: string,
  hostPlayerId: string,
  mode: Session["scoringMode"]
): Session {
  const session = requireSession(code);
  requireHost(session, hostPlayerId);
  session.scoringMode = mode;
  touch(session);
  return session;
}

// ------------------------------------------------------------------ ROUND

function resolveRegion(
  size: GameSizeId,
  regionInput?: { type: "CITY" | "CANTON"; id: string | number }
): RegionSelection | undefined {
  const cfg = SIZE_CONFIGS[size];
  if (!cfg.requiresRegionSelection) return undefined;
  if (!regionInput) throw new GameError("Für diese Spielgrösse muss eine Region gewählt werden.");
  if (cfg.requiresRegionSelection === "CITY") {
    const city = CITY_BY_ID.get(String(regionInput.id));
    if (!city) throw new GameError("Unbekannte Stadt.");
    return { type: "CITY", id: city.id, name: city.name };
  } else {
    const cantonNum = Number(regionInput.id);
    const canton = CANTONS.find((c) => c.num === cantonNum);
    if (!canton) throw new GameError("Unbekannter Kanton.");
    return { type: "CANTON", id: canton.num, name: canton.name };
  }
}

export function anchorStationsFor(round: Round) {
  if (round.size === "STADT" && round.region) {
    return stationsForCity(String(round.region.id));
  }
  if (round.size === "KANTON" && round.region) {
    return stationsForCanton(Number(round.region.id));
  }
  return stationsForCountry();
}

export function startRound(
  code: string,
  hostPlayerId: string,
  hiderId: string,
  size: GameSizeId,
  region?: { type: "CITY" | "CANTON"; id: string | number }
): Session {
  const session = requireSession(code);
  requireHost(session, hostPlayerId);
  if (session.status === "IN_ROUND") {
    throw new GameError("Es läuft bereits eine Runde.");
  }
  const hider = requirePlayer(session, hiderId);
  if (session.players.length < 2) {
    throw new GameError("Mindestens 2 Spieler nötig (1 Hider + 1 Seeker).");
  }
  const cfg = SIZE_CONFIGS[size];
  if (!cfg) throw new GameError("Unbekannte Spielgrösse.");
  const resolvedRegion = resolveRegion(size, region);

  const now = Date.now();
  const round: Round = {
    index: session.rounds.length,
    hiderId: hider.id,
    hiderName: hider.name,
    size,
    region: resolvedRegion,
    phase: "HIDING",
    hidingStartedAt: now,
    hidingEndsAt: now + cfg.hidingPeriodMinutes * 60000,
    hiderHand: [],
    hiderDiscard: [],
    handLimitBonus: 0,
    pendingDrawChoice: null,
    accumulatedTimeBonusMinutes: 0,
    pendingTimeMultiplier: false,
    pendingExtraInfoDraw: false,
    pendingVoidNextQuestion: false,
    pendingForceStrongNextQuestion: false,
    pendingDoubleCostNextQuestion: false,
    pendingGatePhotoNextQuestion: false,
    pendingDelayNextAnswerReveal: false,
    activeEffects: [],
    questionLog: [],
    questionUsageCount: {},
    hiderClockPausedSince: null,
    totalPausedMs: 0,
    seekerGateBlocked: false,
    foundClaims: [],
    board: { notes: [], pins: [], shapes: [] },
    arrivedInZoneDeclared: false,
  };
  session.rounds.push(round);
  session.currentRoundIndex = session.rounds.length - 1;
  session.status = "IN_ROUND";
  session.size = size;
  hider.hasHidden = true;
  touch(session);
  return session;
}

export function chooseHidingZone(
  code: string,
  playerId: string,
  stationId: string
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, playerId);
  if (round.phase !== "HIDING") {
    throw new GameError("Die Hiding Zone kann nur während der Hiding Period gewählt werden.");
  }
  const allowed = anchorStationsFor(round);
  if (!allowed.some((s) => s.id === stationId)) {
    throw new GameError("Diese Station ist für die gewählte Spielgrösse/Region nicht gültig.");
  }
  round.hidingZoneStationId = stationId;
  touch(session);
  return session;
}

function beginSeekingPhase(round: Round): void {
  const now = Date.now();
  const cfg = sizeConfig(round);
  round.phase = "SEEKING";
  round.seekingStartedAt = now;
  round.roundHardCapAt = now + cfg.maxRoundHours * 3600000;
}

export function endHidingEarly(code: string, playerId: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, playerId);
  if (round.phase !== "HIDING") throw new GameError("Nicht in der Hiding Period.");
  if (!round.hidingZoneStationId) {
    throw new GameError("Bitte zuerst eine Hiding Zone wählen.");
  }
  round.hidingEndsAt = Date.now();
  beginSeekingPhase(round);
  touch(session);
  return session;
}

// --------------------------------------------------------------- QUESTIONS

export function askQuestion(
  code: string,
  playerId: string,
  questionId: string,
  variant: "normal" | "strong",
  paramsText: string | undefined
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  if (round.phase !== "SEEKING" && round.phase !== "ENDGAME") {
    throw new GameError("Fragen können nur während der Suche gestellt werden.");
  }
  if (round.seekerGateBlocked) {
    throw new GameError(
      "Eine Bedingung des Hiders muss zuerst erfüllt werden, bevor weitere Fragen gestellt werden können."
    );
  }
  const openQuestion = round.questionLog.find((q) => q.status === "PENDING");
  if (openQuestion) {
    throw new GameError("Es gibt bereits eine offene, unbeantwortete Frage.");
  }
  const def = QUESTION_BY_ID.get(questionId);
  if (!def) throw new GameError("Unbekannte Frage.");
  if (variant === "strong" && !def.hasStrongVariant) {
    throw new GameError("Diese Frage hat keine verstärkte Variante.");
  }

  const blockingEffect = round.activeEffects.find((e) => {
    if (e.cleared || (e.endsAt && e.endsAt < Date.now())) return false;
    if (e.effectKey === "BLOCK_ALL_QUESTIONS") return true;
    if (e.effectKey === "BLOCK_CATEGORY" && e.data?.category === def.category) return true;
    return false;
  });
  if (blockingEffect) {
    throw new GameError(`Die Kategorie "${def.category}" ist aktuell gesperrt: ${blockingEffect.label}`);
  }

  const cfg = sizeConfig(round);
  const repeatIndex = nextRepeatIndex(round, questionId);
  let effectiveVariant = variant;
  if (round.pendingForceStrongNextQuestion) {
    effectiveVariant = "strong";
  }
  const price = computeQuestionPrice(cfg, effectiveVariant, repeatIndex);
  let draw = price.draw;
  let keep = price.keep;
  if (round.pendingDoubleCostNextQuestion) {
    draw *= 2;
    keep *= 2;
  }
  round.pendingForceStrongNextQuestion = false;
  round.pendingDoubleCostNextQuestion = false;

  const asker = requirePlayer(session, playerId);
  const entry: QuestionEntry = {
    id: nanoid(10),
    questionId,
    variant: effectiveVariant,
    askedBy: playerId,
    askedByName: asker.name,
    askedAt: Date.now(),
    deadline: Date.now() + cfg.answerTimeSeconds[def.answerType] * 1000,
    paramsText,
    status: "PENDING",
    costDraw: draw,
    costKeep: keep,
    repeatIndex,
  };
  round.questionLog.push(entry);
  round.questionUsageCount[questionId] = repeatIndex + 1;
  touch(session);
  return session;
}

export function answerQuestion(
  code: string,
  playerId: string,
  entryId: string,
  answer: { value?: string | number | boolean; mediaUrl?: string }
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, playerId);
  const entry = round.questionLog.find((q) => q.id === entryId);
  if (!entry || entry.status !== "PENDING") {
    throw new GameError("Diese Frage ist nicht mehr offen.");
  }
  const def = QUESTION_BY_ID.get(entry.questionId)!;
  const now = Date.now();
  const isLate = now > entry.deadline;

  if (isLate) {
    entry.status = "LATE";
    entry.answer = { type: def.answerType, ...answer, answeredAt: now };
    entry.revealAt = now;
    if (round.hiderClockPausedSince) {
      round.totalPausedMs += now - round.hiderClockPausedSince;
      round.hiderClockPausedSince = null;
    }
    touch(session);
    return session;
  }

  entry.status = "ANSWERED";
  entry.answer = { type: def.answerType, ...answer, answeredAt: now };
  if (round.pendingDelayNextAnswerReveal) {
    entry.revealAt = now + 10 * 60000;
    round.pendingDelayNextAnswerReveal = false;
  } else {
    entry.revealAt = now;
  }
  if (round.hiderClockPausedSince) {
    round.totalPausedMs += now - round.hiderClockPausedSince;
    round.hiderClockPausedSince = null;
  }

  let drawCount = entry.costDraw;
  if (round.pendingExtraInfoDraw) {
    drawCount += 1;
    round.pendingExtraInfoDraw = false;
  }
  const drawn = drawCards(drawCount);
  round.pendingDrawChoice = {
    id: nanoid(10),
    source: "question",
    questionEntryId: entry.id,
    cardIds: drawn.map((c) => c.id),
    keepCount: Math.min(entry.costKeep, drawCount),
    createdAt: now,
  };
  touch(session);
  return session;
}

export function voidPendingQuestion(code: string, hiderId: string, instanceId: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, hiderId);
  const entry = round.questionLog.find((q) => q.status === "PENDING");
  if (!entry) throw new GameError("Keine offene Frage zum Annullieren vorhanden.");
  playCardInternal(session, round, hiderId, instanceId, { voidTargetId: entry.id });
  return session;
}

// -------------------------------------------------------------- CARD DRAW

export function resolveCardDraw(
  code: string,
  hiderId: string,
  chosenIndexes: number[]
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, hiderId);
  const pending = round.pendingDrawChoice;
  if (!pending) throw new GameError("Keine offene Kartenauswahl vorhanden.");
  if (chosenIndexes.length !== pending.keepCount) {
    throw new GameError(`Bitte genau ${pending.keepCount} Karte(n) auswählen.`);
  }
  const uniqueIdx = new Set(chosenIndexes);
  if (uniqueIdx.size !== chosenIndexes.length) {
    throw new GameError("Doppelte Auswahl nicht möglich.");
  }
  for (const idx of chosenIndexes) {
    if (idx < 0 || idx >= pending.cardIds.length) {
      throw new GameError("Ungültige Auswahl.");
    }
  }
  const now = Date.now();
  pending.cardIds.forEach((cardId, idx) => {
    const handCard: HandCard = { instanceId: nanoid(10), cardId, acquiredAt: now };
    if (chosenIndexes.includes(idx)) {
      round.hiderHand.push(handCard);
    } else {
      round.hiderDiscard.push(handCard);
    }
  });
  round.pendingDrawChoice = null;
  touch(session);
  return session;
}

export function discardCard(code: string, hiderId: string, instanceId: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, hiderId);
  const idx = round.hiderHand.findIndex((c) => c.instanceId === instanceId);
  if (idx === -1) throw new GameError("Karte nicht in der Hand.");
  const [card] = round.hiderHand.splice(idx, 1);
  round.hiderDiscard.push(card);
  touch(session);
  return session;
}

// ---------------------------------------------------------------- PLAYING

function makeEffect(cardId: string, effectKey: string, label: string, endsAt?: number, data?: Record<string, unknown>): ActiveEffect {
  return {
    id: nanoid(10),
    cardId,
    effectKey,
    startedAt: Date.now(),
    endsAt,
    data,
    cleared: false,
    label,
  };
}

function playCardInternal(
  session: Session,
  round: Round,
  hiderId: string,
  instanceId: string,
  options?: { category?: QuestionCategory; transportMode?: string; voidTargetId?: string }
): void {
  assertHandWithinLimit(round);
  const idx = round.hiderHand.findIndex((c) => c.instanceId === instanceId);
  if (idx === -1) throw new GameError("Karte nicht in der Hand.");
  const handCard = round.hiderHand[idx];
  const def = CARD_BY_ID.get(handCard.cardId);
  if (!def) throw new GameError("Unbekannte Karte.");
  const cfg = sizeConfig(round);
  const now = Date.now();

  switch (def.effectKey) {
    case "TIME_BONUS_0":
    case "TIME_BONUS_1":
    case "TIME_BONUS_2":
    case "TIME_BONUS_3":
    case "TIME_BONUS_4": {
      const tbIndex = TIME_BONUS_CARD_ORDER.indexOf(handCard.cardId);
      let amount = cfg.timeBonusMinutes[tbIndex] ?? 0;
      if (round.pendingTimeMultiplier) {
        amount *= 2;
        round.pendingTimeMultiplier = false;
      }
      round.accumulatedTimeBonusMinutes += amount;
      break;
    }
    case "HAND_SIZE_INCREASE":
      round.handLimitBonus += 2;
      break;
    case "EXTRA_INFO_NEXT_DRAW":
      round.pendingExtraInfoDraw = true;
      break;
    case "VOID_NEXT_QUESTION": {
      const targetId = options?.voidTargetId;
      const entry = round.questionLog.find(
        (q) => q.id === targetId && q.status === "PENDING"
      );
      if (!entry) throw new GameError("Keine offene Frage zum Annullieren vorhanden.");
      entry.status = "VOIDED";
      round.questionUsageCount[entry.questionId] = Math.max(
        0,
        (round.questionUsageCount[entry.questionId] ?? 1) - 1
      );
      break;
    }
    case "MOBILITY":
      round.activeEffects.push(
        makeEffect(handCard.cardId, def.effectKey, "Bewegungsfreiheit aktiv (Ehrenregel)")
      );
      break;
    case "FORCE_STRONG_NEXT_QUESTION":
      round.pendingForceStrongNextQuestion = true;
      break;
    case "DOUBLE_NEXT_TIME_BONUS":
      round.pendingTimeMultiplier = true;
      break;
    case "INSTANT_DRAW_2_KEEP_1": {
      const drawn = drawCards(2);
      round.pendingDrawChoice = {
        id: nanoid(10),
        source: "instant",
        cardIds: drawn.map((c) => c.id),
        keepCount: 1,
        createdAt: now,
      };
      break;
    }
    case "BLOCK_CATEGORY": {
      if (!options?.category) throw new GameError("Bitte eine Kategorie wählen.");
      const minutes = BLOCK_CATEGORY_MINUTES[round.size];
      round.activeEffects.push(
        makeEffect(
          handCard.cardId,
          def.effectKey,
          `Kategorie "${options.category}" gesperrt`,
          now + minutes * 60000,
          { category: options.category }
        )
      );
      break;
    }
    case "TRAVEL_DETOUR":
      round.activeEffects.push(
        makeEffect(handCard.cardId, def.effectKey, "Umweg-Fluch aktiv (Ehrenregel)", now + 3600000)
      );
      break;
    case "FORBID_TRANSPORT_MODE": {
      if (!options?.transportMode) throw new GameError("Bitte ein Verkehrsmittel wählen.");
      round.activeEffects.push(
        makeEffect(
          handCard.cardId,
          def.effectKey,
          `${options.transportMode} verboten (Ehrenregel)`,
          now + 30 * 60000,
          { mode: options.transportMode }
        )
      );
      break;
    }
    case "NEXT_QUESTION_DOUBLE_COST":
      round.pendingDoubleCostNextQuestion = true;
      break;
    case "GATE_NEXT_QUESTION_PHOTO":
      round.seekerGateBlocked = true;
      round.seekerGateReason = "PHOTO";
      break;
    case "REQUIRE_SEEKER_PHOTO":
      round.seekerGateBlocked = true;
      round.seekerGateReason = "PHOTO";
      break;
    case "REQUIRE_WALK_CONFIRM":
      round.seekerGateBlocked = true;
      round.seekerGateReason = "WALK_CONFIRM";
      break;
    case "SEEKER_TIME_FREEZE": {
      const minutes = SEEKER_TIME_FREEZE_MINUTES[round.size];
      round.activeEffects.push(
        makeEffect(handCard.cardId, def.effectKey, "Zeitdieb aktiv (Ehrenregel)", now + minutes * 60000)
      );
      break;
    }
    case "SEEKER_BOARDING_FREEZE": {
      const minutes = SEEKER_BOARDING_FREEZE_MINUTES[round.size];
      round.activeEffects.push(
        makeEffect(handCard.cardId, def.effectKey, "Zwangspause aktiv (Ehrenregel)", now + minutes * 60000)
      );
      break;
    }
    case "DELAY_NEXT_ANSWER_REVEAL":
      round.pendingDelayNextAnswerReveal = true;
      break;
    case "BLOCK_ALL_QUESTIONS":
      round.activeEffects.push(
        makeEffect(handCard.cardId, def.effectKey, "Alle Fragekategorien gesperrt", now + 20 * 60000, {
          all: true,
        })
      );
      break;
    default:
      throw new GameError(`Unbekannter Karteneffekt: ${def.effectKey}`);
  }

  round.hiderHand.splice(idx, 1);
  round.hiderDiscard.push(handCard);
}

export function playCard(
  code: string,
  hiderId: string,
  instanceId: string,
  options?: { category?: QuestionCategory; transportMode?: string }
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, hiderId);
  playCardInternal(session, round, hiderId, instanceId, options);
  touch(session);
  return session;
}

// -------------------------------------------------------------------- GATE

export function clearGate(code: string, playerId: string, mediaUrl?: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  if (!round.seekerGateBlocked) throw new GameError("Es ist aktuell keine Bedingung offen.");
  if (round.seekerGateReason === "PHOTO" && !mediaUrl) {
    throw new GameError("Bitte ein Foto als Beweis hochladen.");
  }
  round.seekerGateBlocked = false;
  round.seekerGateReason = undefined;
  touch(session);
  return session;
}

// ------------------------------------------------------------------ BOARD

export function addBoardNote(code: string, playerId: string, text: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  const author = requirePlayer(session, playerId);
  round.board.notes.push({
    id: nanoid(10),
    authorId: playerId,
    authorName: author.name,
    text: text.slice(0, 500),
    createdAt: Date.now(),
  });
  touch(session);
  return session;
}

export function removeBoardNote(code: string, playerId: string, noteId: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  round.board.notes = round.board.notes.filter((n) => n.id !== noteId);
  touch(session);
  return session;
}

export function addBoardPin(
  code: string,
  playerId: string,
  data: { lat: number; lon: number; label: string; probability: number }
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  const author = requirePlayer(session, playerId);
  const pin: BoardPin = {
    id: nanoid(10),
    authorId: playerId,
    authorName: author.name,
    lat: data.lat,
    lon: data.lon,
    label: data.label.slice(0, 80),
    probability: Math.max(0, Math.min(100, data.probability)),
    excluded: false,
    createdAt: Date.now(),
  };
  round.board.pins.push(pin);
  touch(session);
  return session;
}

export function updateBoardPin(
  code: string,
  playerId: string,
  pinId: string,
  patch: { probability?: number; excluded?: boolean; label?: string }
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  const pin = round.board.pins.find((p) => p.id === pinId);
  if (!pin) throw new GameError("Pin nicht gefunden.");
  if (patch.probability !== undefined) pin.probability = Math.max(0, Math.min(100, patch.probability));
  if (patch.excluded !== undefined) pin.excluded = patch.excluded;
  if (patch.label !== undefined) pin.label = patch.label.slice(0, 80);
  touch(session);
  return session;
}

export function removeBoardPin(code: string, playerId: string, pinId: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  round.board.pins = round.board.pins.filter((p) => p.id !== pinId);
  touch(session);
  return session;
}

export function addBoardShape(
  code: string,
  playerId: string,
  shape: Omit<BoardShape, "id" | "authorId" | "createdAt">
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  round.board.shapes.push({
    ...shape,
    id: nanoid(10),
    authorId: playerId,
    createdAt: Date.now(),
  });
  touch(session);
  return session;
}

export function removeBoardShape(code: string, playerId: string, shapeId: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  round.board.shapes = round.board.shapes.filter((s) => s.id !== shapeId);
  touch(session);
  return session;
}

// ---------------------------------------------------------------- ENDGAME

export function declareArrivedInZone(code: string, playerId: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  if (round.phase !== "SEEKING") throw new GameError("Nicht in der Suchphase.");
  round.phase = "ENDGAME";
  round.endgameStartedAt = Date.now();
  round.arrivedInZoneDeclared = true;
  for (const effect of round.activeEffects) {
    if (effect.effectKey === "MOBILITY") effect.cleared = true;
  }
  touch(session);
  return session;
}

export function claimFound(code: string, playerId: string, photoUrl?: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireSeeker(round, playerId);
  const last = round.foundClaims[round.foundClaims.length - 1];
  if (last && last.status === "PENDING") {
    throw new GameError("Es gibt bereits eine offene Found-Meldung.");
  }
  if (last && last.status === "REJECTED" && last.resolvedAt) {
    const cooldownMs = 60000;
    if (Date.now() - last.resolvedAt < cooldownMs) {
      throw new GameError("Bitte kurz warten, bevor erneut 'Gefunden' gemeldet werden kann.");
    }
  }
  const author = requirePlayer(session, playerId);
  const claim: FoundClaim = {
    id: nanoid(10),
    by: playerId,
    byName: author.name,
    at: Date.now(),
    photoUrl,
    status: "PENDING",
  };
  round.foundClaims.push(claim);
  touch(session);
  return session;
}

function finishRound(
  session: Session,
  round: Round,
  endedAt: number,
  reason: "FOUND" | "SURRENDER" | "TIME_UP"
): void {
  round.phase = "FINISHED";
  round.finishedAt = endedAt;
  round.finishedReason = reason;
  round.scoreBreakdown = computeScore(round, sizeConfig(round), endedAt, reason);
  session.status = "ROUND_SUMMARY";
}

export function respondFound(
  code: string,
  hiderId: string,
  claimId: string,
  confirm: boolean
): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, hiderId);
  const claim = round.foundClaims.find((c) => c.id === claimId);
  if (!claim || claim.status !== "PENDING") {
    throw new GameError("Diese Meldung ist nicht mehr offen.");
  }
  claim.resolvedAt = Date.now();
  if (confirm) {
    claim.status = "CONFIRMED";
    finishRound(session, round, claim.at, "FOUND");
  } else {
    claim.status = "REJECTED";
  }
  touch(session);
  return session;
}

export function surrender(code: string, hiderId: string): Session {
  const session = requireSession(code);
  const round = requireRound(session);
  requireHider(round, hiderId);
  finishRound(session, round, Date.now(), "SURRENDER");
  touch(session);
  return session;
}

export function finishTournament(code: string, hostPlayerId: string): Session {
  const session = requireSession(code);
  requireHost(session, hostPlayerId);
  if (session.status === "IN_ROUND") {
    throw new GameError("Die laufende Runde muss zuerst beendet werden.");
  }
  session.status = "FINISHED";
  touch(session);
  return session;
}

export function reopenLobby(code: string, hostPlayerId: string): Session {
  const session = requireSession(code);
  requireHost(session, hostPlayerId);
  if (session.status === "IN_ROUND") {
    throw new GameError("Die laufende Runde muss zuerst beendet werden.");
  }
  session.status = "LOBBY";
  touch(session);
  return session;
}

// -------------------------------------------------------------------- TICK

export function tickSession(session: Session): boolean {
  let changed = false;
  if (session.status !== "IN_ROUND") return false;
  const round = currentRound(session);
  if (!round) return false;
  const now = Date.now();

  if (round.phase === "HIDING" && now >= round.hidingEndsAt) {
    beginSeekingPhase(round);
    changed = true;
  }

  if (round.phase === "SEEKING" || round.phase === "ENDGAME") {
    const pending = round.questionLog.find((q) => q.status === "PENDING");
    if (pending && now > pending.deadline && !round.hiderClockPausedSince) {
      round.hiderClockPausedSince = now;
      changed = true;
    }
    for (const effect of round.activeEffects) {
      if (!effect.cleared && effect.endsAt && effect.endsAt <= now) {
        effect.cleared = true;
        changed = true;
      }
    }
    if (round.roundHardCapAt && now >= round.roundHardCapAt) {
      finishRound(session, round, now, "TIME_UP");
      changed = true;
    }
  }

  if (changed) touch(session);
  return changed;
}

export function tickAllSessions(): string[] {
  const changedCodes: string[] = [];
  for (const session of store.allSessions()) {
    if (tickSession(session)) changedCodes.push(session.code);
  }
  return changedCodes;
}
