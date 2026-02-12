## ADDED Requirements

### Requirement: Realtime channel architecture
The system SHALL use Supabase Realtime Broadcast channels for all in-game communication. Each room SHALL have a single broadcast channel identified by the room code. All game events (progress updates, conflicts, activity feed) SHALL flow through this channel.

#### Scenario: Channel creation on game start
- **WHEN** a game room transitions to "playing" status
- **THEN** all connected players subscribe to the broadcast channel `room:{room_code}` and begin receiving/sending events

#### Scenario: Channel cleanup on game end
- **WHEN** a game room transitions to "finished" status
- **THEN** all players unsubscribe from the broadcast channel after viewing results

### Requirement: Player progress broadcast
The system SHALL broadcast a player's progress update to all players in the room whenever the player answers a ticket. The broadcast message MUST contain: player_id, nickname, new_progress (0–100), streak_count, total_correct, total_wrong, and a timestamp.

#### Scenario: Progress update after correct answer
- **WHEN** player "NhatDev" answers correctly and progress increases from 62% to 70%
- **THEN** system broadcasts `{ type: "progress", player_id, nickname: "NhatDev", progress: 70, streak: 2, correct: 10, wrong: 2, timestamp }` to all players in the room

#### Scenario: All clients update leaderboard
- **WHEN** a progress broadcast is received by any client
- **THEN** the client updates the leaderboard to reflect the new progress value and reorders ranks if necessary

### Requirement: Conflict event broadcast
The system SHALL broadcast conflict events when a player throws a conflict and when a conflict is resolved. Throw messages MUST contain: from_player_id, to_player_id, conflict_type. Resolve messages MUST contain: player_id and resolution_time_ms.

#### Scenario: Conflict thrown
- **WHEN** player "ThanhPHP" throws a conflict at player "MinhFrontend"
- **THEN** system broadcasts `{ type: "conflict_throw", from: "ThanhPHP", to: "MinhFrontend", conflict_type: "silly_task", timestamp }` to all players

#### Scenario: Conflict resolved
- **WHEN** player "MinhFrontend" resolves their conflict
- **THEN** system broadcasts `{ type: "conflict_resolve", player_id, nickname: "MinhFrontend", resolution_time_ms: 8500, timestamp }` to all players

### Requirement: Activity feed broadcast
The system SHALL broadcast activity events for display in the live activity feed. Events include: player answered correctly, player answered incorrectly, streak achieved, conflict thrown, conflict resolved, and player joined.

#### Scenario: Activity feed entry for correct answer
- **WHEN** player answers correctly with a streak of 2
- **THEN** system broadcasts `{ type: "activity", message: "NhatDev pushed +8% (streak: 🔥🔥)", timestamp }`

#### Scenario: Activity feed entry for conflict
- **WHEN** a conflict is thrown
- **THEN** system broadcasts `{ type: "activity", message: "ThanhPHP CONFLICT thrown at MinhFrontend! 💣", timestamp }`

### Requirement: Game state broadcast
The system SHALL broadcast game-level state changes: game start (with timer start), timer tick (every second), and game end (with final results trigger).

#### Scenario: Game start broadcast
- **WHEN** game transitions to "playing"
- **THEN** system broadcasts `{ type: "game_start", started_at, duration_minutes, tickets_count }` to all players

#### Scenario: Game end broadcast
- **WHEN** timer reaches zero or a player reaches 100%
- **THEN** system broadcasts `{ type: "game_end", reason: "timer" | "winner", winner_id, timestamp }` to all players

### Requirement: Connection handling
The system SHALL detect player disconnections via Supabase Presence. When a player reconnects, they SHALL request the current game state from connected peers via a broadcast sync message. The system SHALL handle reconnection gracefully without losing the player's progress.

#### Scenario: Player disconnects and reconnects
- **WHEN** player "NhatDev" loses connection and reconnects within 60 seconds
- **THEN** player broadcasts `{ type: "sync_request", player_id }` and any connected client responds with current game state including all player progress values

#### Scenario: Player disconnects permanently
- **WHEN** player does not reconnect within 60 seconds
- **THEN** player remains in the leaderboard with their last-known progress but is marked as "disconnected" in the UI

### Requirement: Message latency
All broadcast messages SHALL be delivered to connected clients within 500 milliseconds under normal network conditions. The system SHALL use optimistic UI updates — local state updates immediately on user action, broadcast confirms to other clients.

#### Scenario: Optimistic progress update
- **WHEN** player submits a correct answer
- **THEN** player's own progress bar updates immediately (optimistic), and other players see the update within 500ms via broadcast
