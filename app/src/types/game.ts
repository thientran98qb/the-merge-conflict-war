import type { Ticket, ConflictChallenge, ConflictType, Topic } from "./database";

// Game states for the state machine
export type GameState =
  | "LOBBY"
  | "COUNTDOWN"
  | "PLAYING"
  | "CONFLICTED"
  | "FINISHED_WAITING"
  | "GAME_OVER";

// Player as displayed in the game UI
export interface GamePlayer {
  id: string;
  nickname: string;
  progress: number;
  streak: number;
  conflictsHeld: number;
  isConflicted: boolean;
  isImmune: boolean;
  immuneUntil?: number; // timestamp
  totalCorrect: number;
  totalWrong: number;
  isOnline: boolean;
}

// Broadcast message types
export type BroadcastType =
  | "progress_update"
  | "conflict_throw"
  | "conflict_resolve"
  | "game_start"
  | "game_end"
  | "activity"
  | "sync_request"
  | "sync_response"
  | "player_joined"
  | "player_left"
  | "player_finished"
  | "countdown_start"
  | "countdown_cancel";

export interface BroadcastMessage {
  type: BroadcastType;
  payload: Record<string, unknown>;
  senderId: string;
  timestamp: number;
}

// Progress update payload
export interface ProgressUpdatePayload {
  playerId: string;
  progress: number;
  streak: number;
  totalCorrect: number;
  totalWrong: number;
  conflictsHeld: number;
}

// Conflict throw payload
export interface ConflictThrowPayload {
  fromPlayerId: string;
  fromNickname: string;
  toPlayerId: string;
  toNickname?: string;
  conflictType: ConflictType;
  challenge: ConflictChallenge;
}

// Conflict resolve payload
export interface ConflictResolvePayload {
  playerId: string;
  resolvedAt: number;
}

// Activity feed entry
export interface ActivityEntry {
  id: string;
  type:
    | "correct_answer"
    | "wrong_answer"
    | "streak"
    | "conflict_throw"
    | "conflict_resolve"
    | "player_joined"
    | "player_left"
    | "game_start"
    | "game_end"
    | "win";
  message: string;
  timestamp: number;
  playerId?: string;
}

// Game end payload
export interface GameEndPayload {
  reason: "winner" | "timeout";
  winnerId?: string;
  rankings: Array<{
    playerId: string;
    nickname: string;
    progress: number;
    totalCorrect: number;
    totalWrong: number;
    accuracy: number;
  }>;
}

// Fun awards
export interface Award {
  title: string;
  description: string;
  playerId: string;
  playerNickname: string;
  emoji: string;
}

// Room creation request
export interface CreateRoomRequest {
  topic: Topic;
  durationMinutes: number;
  nickname: string;
}

// Join room request
export interface JoinRoomRequest {
  nickname: string;
}

// Game reducer action types
export type GameAction =
  | { type: "SET_LOBBY" }
  | { type: "START_COUNTDOWN"; payload: { seconds: number } }
  | { type: "CANCEL_COUNTDOWN" }
  | { type: "START_GAME"; payload: { tickets: Ticket[]; duration: number; startedAt: number } }
  | { type: "ANSWER_TICKET"; payload: { correct: boolean; progress: number } }
  | { type: "NEXT_TICKET" }
  | { type: "PLAYER_FINISHED"; payload: { playerId: string } }
  | { type: "USE_CONFLICT" }
  | { type: "RECEIVE_CONFLICT"; payload: ConflictThrowPayload }
  | { type: "RESOLVE_CONFLICT" }
  | { type: "UPDATE_PLAYER"; payload: ProgressUpdatePayload }
  | { type: "PLAYER_JOINED"; payload: GamePlayer }
  | { type: "PLAYER_LEFT"; payload: { playerId: string } }
  | { type: "GAME_OVER"; payload: GameEndPayload }
  | { type: "TICK_TIMER" }
  | { type: "SET_IMMUNITY"; payload: { until: number } }
  | { type: "ADD_ACTIVITY"; payload: ActivityEntry };
