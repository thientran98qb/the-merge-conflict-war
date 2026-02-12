-- ============================================
-- The Merge Conflict War - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE room_status AS ENUM ('waiting', 'playing', 'finished');
CREATE TYPE topic_type AS ENUM ('php', 'frontend', 'mix');
CREATE TYPE conflict_type AS ENUM ('hard_puzzle', 'silly_task');

-- ============================================
-- Table: game_rooms
-- ============================================
CREATE TABLE game_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  status room_status NOT NULL DEFAULT 'waiting',
  topic topic_type NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 10,
  tickets JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ
);

-- Index for room code lookup
CREATE INDEX idx_game_rooms_room_code ON game_rooms(room_code);
-- Index for active rooms cleanup
CREATE INDEX idx_game_rooms_status ON game_rooms(status);

-- ============================================
-- Table: players
-- ============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(20) NOT NULL,
  progress FLOAT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  conflicts_held INT NOT NULL DEFAULT 0,
  is_conflicted BOOLEAN NOT NULL DEFAULT FALSE,
  total_correct INT NOT NULL DEFAULT 0,
  total_wrong INT NOT NULL DEFAULT 0,
  current_ticket_index INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique nickname per room
  UNIQUE(room_id, nickname)
);

-- Index for room players lookup
CREATE INDEX idx_players_room_id ON players(room_id);

-- ============================================
-- Table: conflict_events
-- ============================================
CREATE TABLE conflict_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  from_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  to_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  conflict_type conflict_type NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for room conflict lookup
CREATE INDEX idx_conflict_events_room_id ON conflict_events(room_id);

-- ============================================
-- Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE conflict_events;

-- ============================================
-- RLS Policies (permissive for internal team use)
-- ============================================
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth required for internal team building)
CREATE POLICY "Allow all on game_rooms" ON game_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on conflict_events" ON conflict_events FOR ALL USING (true) WITH CHECK (true);
