// Database types will be defined in task 2.5
// Placeholder for Supabase generated types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoomStatus = "waiting" | "playing" | "finished";
export type Topic = "php" | "frontend" | "mix";
export type ConflictType = "hard_puzzle" | "silly_task";
export type TicketType = "multiple_choice" | "fill_in_blank" | "drag_and_drop";
export type Difficulty = "easy" | "medium" | "hard";

export interface Ticket {
  id: string;
  type: TicketType;
  difficulty: Difficulty;
  topic: Topic;
  title: string;
  description: string;
  code_snippet: string;
  options?: string[]; // for multiple_choice
  correct_answer: string | string[]; // string for mc/fill, string[] for drag_and_drop
  explanation?: string;
}

export interface ConflictChallenge {
  type: ConflictType;
  content: string; // hard_puzzle ticket id or silly_task comment string
  ticket?: Ticket; // populated for hard_puzzle
}

export interface Database {
  public: {
    Tables: {
      game_rooms: {
        Row: {
          id: string;
          room_code: string;
          status: RoomStatus;
          topic: Topic;
          duration_minutes: number;
          tickets: Json;
          created_at: string;
          started_at: string | null;
        };
        Insert: {
          id?: string;
          room_code: string;
          status?: RoomStatus;
          topic: Topic;
          duration_minutes: number;
          tickets: Json;
          created_at?: string;
          started_at?: string | null;
        };
        Update: {
          id?: string;
          room_code?: string;
          status?: RoomStatus;
          topic?: Topic;
          duration_minutes?: number;
          tickets?: Json;
          created_at?: string;
          started_at?: string | null;
        };
      };
      players: {
        Row: {
          id: string;
          room_id: string;
          nickname: string;
          progress: number;
          streak: number;
          conflicts_held: number;
          is_conflicted: boolean;
          total_correct: number;
          total_wrong: number;
          current_ticket_index: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          nickname: string;
          progress?: number;
          streak?: number;
          conflicts_held?: number;
          is_conflicted?: boolean;
          total_correct?: number;
          total_wrong?: number;
          current_ticket_index?: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          nickname?: string;
          progress?: number;
          streak?: number;
          conflicts_held?: number;
          is_conflicted?: boolean;
          total_correct?: number;
          total_wrong?: number;
          current_ticket_index?: number;
          joined_at?: string;
        };
      };
      conflict_events: {
        Row: {
          id: string;
          room_id: string;
          from_player_id: string;
          to_player_id: string;
          conflict_type: ConflictType;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          from_player_id: string;
          to_player_id: string;
          conflict_type: ConflictType;
          resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          from_player_id?: string;
          to_player_id?: string;
          conflict_type?: ConflictType;
          resolved?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      room_status: RoomStatus;
      topic: Topic;
      conflict_type: ConflictType;
    };
  };
}
