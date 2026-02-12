import type {
  GameState,
  GamePlayer,
  GameAction,
  GameEndPayload,
  ActivityEntry,
  ConflictThrowPayload,
} from "@/types/game";
import type { Ticket } from "@/types/database";

export interface GameStore {
  state: GameState;
  players: Map<string, GamePlayer>;
  tickets: Ticket[];
  currentTicketIndex: number;
  timeRemaining: number; // seconds
  duration: number; // total seconds
  startedAt: number | null;
  myPlayerId: string;
  myProgress: number;
  myStreak: number;
  myConflictsHeld: number;
  myTotalCorrect: number;
  myTotalWrong: number;
  isConflicted: boolean;
  currentConflict: ConflictThrowPayload | null;
  isImmune: boolean;
  immuneUntil: number;
  myFinished: boolean; // true when player answered all tickets
  finishedPlayers: Set<string>; // player IDs who finished all tickets
  activityFeed: ActivityEntry[];
  gameResult: GameEndPayload | null;
  countdownSeconds: number | null;
  lastAnswerCorrect: boolean | null;
}

export function createInitialState(myPlayerId: string): GameStore {
  return {
    state: "LOBBY",
    players: new Map(),
    tickets: [],
    currentTicketIndex: 0,
    timeRemaining: 0,
    duration: 0,
    startedAt: null,
    myPlayerId,
    myProgress: 0,
    myStreak: 0,
    myConflictsHeld: 0,
    myTotalCorrect: 0,
    myTotalWrong: 0,
    isConflicted: false,
    currentConflict: null,
    isImmune: false,
    immuneUntil: 0,
    myFinished: false,
    finishedPlayers: new Set(),
    activityFeed: [],
    gameResult: null,
    countdownSeconds: null,
    lastAnswerCorrect: null,
  };
}

export function gameReducer(store: GameStore, action: GameAction): GameStore {
  switch (action.type) {
    case "SET_LOBBY":
      return { ...store, state: "LOBBY" };

    case "START_COUNTDOWN":
      return {
        ...store,
        state: "COUNTDOWN",
        countdownSeconds: action.payload.seconds,
      };

    case "CANCEL_COUNTDOWN":
      return { ...store, state: "LOBBY", countdownSeconds: null };

    case "START_GAME":
      return {
        ...store,
        state: "PLAYING",
        tickets: action.payload.tickets,
        duration: action.payload.duration,
        timeRemaining: action.payload.duration,
        startedAt: action.payload.startedAt,
        currentTicketIndex: 0,
        countdownSeconds: null,
      };

    case "ANSWER_TICKET": {
      const { correct, progress } = action.payload;
      return {
        ...store,
        myProgress: Math.min(100, progress),
        myStreak: correct ? store.myStreak + 1 : 0,
        myConflictsHeld: correct
          ? store.myStreak + 1 >= 3 && store.myConflictsHeld === 0
            ? 1
            : store.myConflictsHeld
          : 0, // lose held conflict on wrong answer
        myTotalCorrect: correct
          ? store.myTotalCorrect + 1
          : store.myTotalCorrect,
        myTotalWrong: correct ? store.myTotalWrong : store.myTotalWrong + 1,
        lastAnswerCorrect: correct,
      };
    }

    case "NEXT_TICKET": {
      const nextIndex = store.currentTicketIndex + 1;
      // If all tickets answered → player is finished, enter FINISHED_WAITING
      if (nextIndex >= store.tickets.length) {
        const newFinished = new Set(store.finishedPlayers);
        newFinished.add(store.myPlayerId);
        return {
          ...store,
          myFinished: true,
          finishedPlayers: newFinished,
          state: "FINISHED_WAITING",
          lastAnswerCorrect: null,
        };
      }
      return {
        ...store,
        currentTicketIndex: nextIndex,
        lastAnswerCorrect: null,
      };
    }

    case "PLAYER_FINISHED": {
      const newFinished = new Set(store.finishedPlayers);
      newFinished.add(action.payload.playerId);
      return { ...store, finishedPlayers: newFinished };
    }

    case "USE_CONFLICT":
      return {
        ...store,
        myStreak: 0,
        myConflictsHeld: 0,
      };

    case "RECEIVE_CONFLICT":
      return {
        ...store,
        state: "CONFLICTED",
        isConflicted: true,
        currentConflict: action.payload,
      };

    case "RESOLVE_CONFLICT":
      return {
        ...store,
        state: "PLAYING",
        isConflicted: false,
        currentConflict: null,
      };

    case "UPDATE_PLAYER": {
      const { playerId, ...data } = action.payload;
      const existing = store.players.get(playerId);
      const updated = new Map(store.players);
      updated.set(playerId, {
        ...(existing || {
          id: playerId,
          nickname: "",
          isOnline: true,
          isImmune: false,
        }),
        progress: data.progress,
        streak: data.streak,
        totalCorrect: data.totalCorrect,
        totalWrong: data.totalWrong,
        conflictsHeld: data.conflictsHeld,
        isConflicted: false,
      });
      return { ...store, players: updated };
    }

    case "PLAYER_JOINED": {
      const updated = new Map(store.players);
      updated.set(action.payload.id, action.payload);
      return { ...store, players: updated };
    }

    case "PLAYER_LEFT": {
      const updated = new Map(store.players);
      updated.delete(action.payload.playerId);
      return { ...store, players: updated };
    }

    case "GAME_OVER":
      return {
        ...store,
        state: "GAME_OVER",
        gameResult: action.payload,
      };

    case "TICK_TIMER":
      return {
        ...store,
        timeRemaining: Math.max(0, store.timeRemaining - 1),
      };

    case "SET_IMMUNITY":
      return {
        ...store,
        isImmune: true,
        immuneUntil: action.payload.until,
      };

    case "ADD_ACTIVITY":
      return {
        ...store,
        activityFeed: [action.payload, ...store.activityFeed].slice(0, 50), // keep max 50 entries
      };

    default:
      return store;
  }
}

/**
 * Calculate progress increment based on ticket difficulty and streak
 */
export function calculateProgressIncrement(
  difficulty: string,
  streak: number
): number {
  const base: Record<string, number> = {
    easy: 5,
    medium: 8,
    hard: 12,
  };

  let increment = base[difficulty] || 5;

  // Streak bonus at streak 3+
  if (streak >= 3) {
    increment += 3;
  }

  return increment;
}

/**
 * Validate an answer
 */
export function validateAnswer(
  ticket: Ticket,
  answer: string | string[]
): boolean {
  if (ticket.type === "multiple_choice") {
    return (
      (answer as string).toUpperCase().trim() ===
      (ticket.correct_answer as string).toUpperCase().trim()
    );
  }

  if (ticket.type === "fill_in_blank") {
    return (
      (answer as string).trim().toLowerCase() ===
      (ticket.correct_answer as string).trim().toLowerCase()
    );
  }

  if (ticket.type === "drag_and_drop") {
    const correctOrder = ticket.correct_answer as string[];
    const userOrder = answer as string[];
    return (
      correctOrder.length === userOrder.length &&
      correctOrder.every((val, i) => val === userOrder[i])
    );
  }

  return false;
}
