import { Server, Socket } from "socket.io";
import * as manager from "./game/sessionManager";
import { buildPlayerView } from "./game/view";
import { GameError } from "./game/errors";
import { Session } from "./game/state";

interface AuthResult {
  ok: true;
  code: string;
  playerId: string;
  token: string;
}
interface AuthError {
  ok: false;
  error: string;
}

type ActionFn = (code: string, playerId: string, payload: any) => Session;

const ACTIONS: Record<string, ActionFn> = {
  kickPlayer: (code, playerId, p) => manager.kickPlayer(code, playerId, p.targetId),
  setScoringMode: (code, playerId, p) => manager.setScoringMode(code, playerId, p.mode),
  startRound: (code, playerId, p) =>
    manager.startRound(code, playerId, p.hiderId, p.size, p.region),
  chooseHidingZone: (code, playerId, p) => manager.chooseHidingZone(code, playerId, p.stationId),
  endHidingEarly: (code, playerId) => manager.endHidingEarly(code, playerId),
  askQuestion: (code, playerId, p) =>
    manager.askQuestion(code, playerId, p.questionId, p.variant, p.paramsText),
  answerQuestion: (code, playerId, p) =>
    manager.answerQuestion(code, playerId, p.entryId, { value: p.value, mediaUrl: p.mediaUrl }),
  voidPendingQuestion: (code, playerId, p) =>
    manager.voidPendingQuestion(code, playerId, p.instanceId),
  resolveCardDraw: (code, playerId, p) => manager.resolveCardDraw(code, playerId, p.chosenIndexes),
  discardCard: (code, playerId, p) => manager.discardCard(code, playerId, p.instanceId),
  playCard: (code, playerId, p) =>
    manager.playCard(code, playerId, p.instanceId, {
      category: p.category,
      transportMode: p.transportMode,
    }),
  clearGate: (code, playerId, p) => manager.clearGate(code, playerId, p.mediaUrl),
  addBoardNote: (code, playerId, p) => manager.addBoardNote(code, playerId, p.text),
  removeBoardNote: (code, playerId, p) => manager.removeBoardNote(code, playerId, p.noteId),
  addBoardPin: (code, playerId, p) => manager.addBoardPin(code, playerId, p),
  updateBoardPin: (code, playerId, p) => manager.updateBoardPin(code, playerId, p.pinId, p),
  removeBoardPin: (code, playerId, p) => manager.removeBoardPin(code, playerId, p.pinId),
  addBoardShape: (code, playerId, p) => manager.addBoardShape(code, playerId, p),
  removeBoardShape: (code, playerId, p) => manager.removeBoardShape(code, playerId, p.shapeId),
  declareArrivedInZone: (code, playerId) => manager.declareArrivedInZone(code, playerId),
  claimFound: (code, playerId, p) => manager.claimFound(code, playerId, p?.photoUrl),
  respondFound: (code, playerId, p) => manager.respondFound(code, playerId, p.claimId, p.confirm),
  surrender: (code, playerId) => manager.surrender(code, playerId),
  finishTournament: (code, playerId) => manager.finishTournament(code, playerId),
  reopenLobby: (code, playerId) => manager.reopenLobby(code, playerId),
};

export function initSocketHandlers(io: Server): void {
  function broadcastSession(code: string): void {
    const session = manager.requireSession(code);
    for (const player of session.players) {
      io.to(`player:${player.id}`).emit("state", buildPlayerView(session, player.id));
    }
  }

  io.on("connection", (socket: Socket) => {
    socket.on(
      "auth:create",
      (payload: { name: string }, ack: (r: AuthResult | AuthError) => void) => {
        try {
          const { session, player } = manager.createSession(payload?.name ?? "Host");
          socket.data.code = session.code;
          socket.data.playerId = player.id;
          socket.join(`player:${player.id}`);
          ack({ ok: true, code: session.code, playerId: player.id, token: player.token });
          broadcastSession(session.code);
        } catch (err) {
          ack({ ok: false, error: (err as Error).message });
        }
      }
    );

    socket.on(
      "auth:join",
      (payload: { code: string; name: string }, ack: (r: AuthResult | AuthError) => void) => {
        try {
          const { session, player } = manager.joinSession(payload.code, payload.name);
          socket.data.code = session.code;
          socket.data.playerId = player.id;
          socket.join(`player:${player.id}`);
          ack({ ok: true, code: session.code, playerId: player.id, token: player.token });
          broadcastSession(session.code);
        } catch (err) {
          ack({ ok: false, error: (err as Error).message });
        }
      }
    );

    socket.on(
      "auth:rejoin",
      (payload: { code: string; token: string }, ack: (r: AuthResult | AuthError) => void) => {
        try {
          const { session, player } = manager.rejoinSession(payload.code, payload.token);
          socket.data.code = session.code;
          socket.data.playerId = player.id;
          socket.join(`player:${player.id}`);
          ack({ ok: true, code: session.code, playerId: player.id, token: player.token });
          broadcastSession(session.code);
        } catch (err) {
          ack({ ok: false, error: (err as Error).message });
        }
      }
    );

    socket.on(
      "game:action",
      (payload: { type: string; payload?: any }, ack?: (r: { ok: boolean; error?: string }) => void) => {
        const code = socket.data.code;
        const playerId = socket.data.playerId;
        if (!code || !playerId) {
          ack?.({ ok: false, error: "Nicht authentifiziert." });
          return;
        }
        const handler = ACTIONS[payload?.type];
        if (!handler) {
          ack?.({ ok: false, error: `Unbekannte Aktion: ${payload?.type}` });
          return;
        }
        try {
          handler(code, playerId, payload?.payload ?? {});
          ack?.({ ok: true });
          broadcastSession(code);
        } catch (err) {
          const message = err instanceof GameError ? err.message : "Unerwarteter Fehler.";
          if (!(err instanceof GameError)) console.error(err);
          ack?.({ ok: false, error: message });
        }
      }
    );

    socket.on("disconnect", () => {
      const code = socket.data.code;
      const playerId = socket.data.playerId;
      if (!code || !playerId) return;
      try {
        // Nur als getrennt markieren, wenn keine andere Verbindung dieses
        // Spielers mehr im Player-Room ist (z.B. anderer Tab / Reconnect).
        const room = io.sockets.adapter.rooms.get(`player:${playerId}`);
        const stillConnected = room && room.size > 0;
        if (!stillConnected) {
          manager.setConnected(code, playerId, false);
          broadcastSession(code);
        }
      } catch {
        // Session existiert evtl. nicht mehr - ignorieren.
      }
    });
  });

  setInterval(() => {
    const changed = manager.tickAllSessions();
    for (const code of changed) {
      try {
        broadcastSession(code);
      } catch {
        // ignore
      }
    }
  }, 2000);
}
