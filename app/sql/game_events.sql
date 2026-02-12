-- Game Events table for real-time communication between players
-- Uses postgres_changes subscription (reliable) instead of Realtime Broadcast

CREATE TABLE IF NOT EXISTS game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by room
CREATE INDEX idx_game_events_room_id ON game_events(room_id);
CREATE INDEX idx_game_events_created_at ON game_events(created_at);

-- Enable Row Level Security (permissive for game use)
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anonymous users
CREATE POLICY "Allow all game_events operations" ON game_events
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

-- Auto-cleanup: delete events older than 1 hour (optional, run periodically)
-- DELETE FROM game_events WHERE created_at < NOW() - INTERVAL '1 hour';
