## 1. Project Setup

- [x] 1.1 Initialize Next.js 14+ project with App Router, TypeScript, and Tailwind CSS
- [x] 1.2 Install dependencies: framer-motion, @supabase/supabase-js, @supabase/ssr
- [x] 1.3 Configure Tailwind with terminal design tokens (colors: #0a0a0a, #00ff41, #ff0040, #ffd700, #00d4ff, #111111, #1a1a1a; font: JetBrains Mono)
- [x] 1.4 Set up Supabase project (create database, get API keys, configure .env.local)
- [x] 1.5 Create Supabase client utilities (server-side and client-side helpers)
- [x] 1.6 Set up project file structure: app/(landing), app/(game), lib/, components/, types/

## 2. Database Schema

- [x] 2.1 Create `game_rooms` table (id uuid PK, room_code varchar unique, status enum, topic enum, duration_minutes int, tickets jsonb, created_at timestamp, started_at timestamp nullable)
- [x] 2.2 Create `players` table (id uuid PK, room_id FK, nickname varchar, progress float, streak int, conflicts_held int, is_conflicted boolean, total_correct int, total_wrong int, current_ticket_index int, joined_at timestamp)
- [x] 2.3 Create `conflict_events` table (id uuid PK, room_id FK, from_player_id FK, to_player_id FK, conflict_type enum, resolved boolean, created_at timestamp)
- [x] 2.4 Enable Supabase Realtime on required tables
- [x] 2.5 Create TypeScript types for all database tables and game entities (Ticket, Player, Room, ConflictEvent)

## 3. Terminal Design System & Base Components

- [x] 3.1 Create CRT scan lines overlay component (CSS pseudo-element with repeating gradient)
- [x] 3.2 Create TerminalText component (monospace, green glow, optional typing animation)
- [x] 3.3 Create TerminalButton component ("> " prefix, green/red/blue border variants, glow hover)
- [x] 3.4 Create TerminalInput component (monospace input field with blinking cursor)
- [x] 3.5 Create ProgressBar component (ASCII-style [████░░░░] with percentage, spring animation via Framer Motion, yellow glow for leader)
- [x] 3.6 Create StreakIndicator component (fire emojis 🔥, "CONFLICT READY!" pulse at streak 3)
- [x] 3.7 Create CodeBlock component (dark editor background #1a1a1a, line numbers, syntax highlighting, bug highlighting)
- [x] 3.8 Create global layout with CRT overlay, JetBrains Mono font loading, and dark background

## 4. Game Room — Create & Join

- [x] 4.1 Create API route POST /api/rooms for room creation (generate 6-char code, validate uniqueness, insert game_rooms row)
- [x] 4.2 Create API route POST /api/rooms/[code]/join for joining (validate room code, check nickname uniqueness, check player limit, insert players row)
- [x] 4.3 Create landing page with logo (glitch CSS animation), tagline (typing effect), CREATE ROOM and JOIN ROOM buttons, room code input
- [x] 4.4 Create room creation page with topic selector (PHP/Frontend/Mix), duration selector (10/15 min), nickname input, and "$ git init" submit button
- [x] 4.5 Create join room page with room code input and nickname input
- [x] 4.6 Add room code validation (6 alphanumeric characters, uppercase)
- [x] 4.7 Add nickname validation (2–20 characters, no duplicates in room)

## 5. Game Room — Waiting Room & Lifecycle

- [x] 5.1 Create waiting room page showing room code (large, copy-to-clipboard), player list, player count (N/10), game settings summary
- [x] 5.2 Implement real-time player list updates via Supabase Presence (show join/leave with typing animation)
- [x] 5.3 Implement auto-start countdown (10s when 3+ players) with visible countdown number
- [x] 5.4 Implement manual start button (enabled when 2+ players, 5s countdown)
- [x] 5.5 Implement countdown cancellation when player count drops below threshold
- [x] 5.6 Create room status transitions: waiting → playing → finished via API route PATCH /api/rooms/[code]/status

## 6. Ticket Engine — AI Generation

- [x] 6.1 Create AI provider abstraction layer interface (generateTickets method) in lib/ai/
- [x] 6.2 Implement OpenAI provider (GPT-4o-mini) with structured JSON output for ticket generation
- [x] 6.3 Implement Anthropic provider (Claude) with structured JSON output
- [x] 6.4 Implement Gemini provider with structured JSON output
- [x] 6.5 Create ticket generation prompt template (system prompt defining ticket JSON schema, user prompt with topic/count/difficulty distribution)
- [x] 6.6 Create ticket validation function (verify structure, types, correct_answer presence, difficulty distribution)
- [x] 6.7 Create preset ticket bank (50+ hand-crafted tickets per topic: PHP, Frontend) as JSON fallback
- [x] 6.8 Integrate AI generation into room creation API (call AI → validate → fallback if needed → store as JSONB)
- [x] 6.9 Create conflict challenge templates (5+ hard_puzzle, 10+ silly_task comment strings)
- [x] 6.10 Add loading UI for ticket generation (ASCII progress bar animation)

## 7. Core Gameplay — Ticket Display & Answer Checking

- [x] 7.1 Create game state machine using useReducer (states: LOBBY, COUNTDOWN, PLAYING, CONFLICTED, GAME_OVER)
- [x] 7.2 Create ticket fetching logic (load from room's JSONB tickets, shuffle per player using player_id as seed)
- [x] 7.3 Create MultipleChoiceTicket component (4 options A/B/C/D with code snippets, selectable with green highlight)
- [x] 7.4 Create FillInBlankTicket component (code with blank placeholder, text input for answer)
- [x] 7.5 Create DragAndDropTicket component (shuffled code lines, drag to reorder)
- [x] 7.6 Implement answer validation logic (multiple-choice: exact match, fill-in-blank: trim + case-insensitive, drag-and-drop: array order match)
- [x] 7.7 Implement progress calculation (easy +5%, medium +8%, hard +12%, streak bonus +3% at streak 3)
- [x] 7.8 Create ticket submit button ("$ git commit --push") with correct/incorrect feedback animation
- [x] 7.9 Implement auto-advance to next ticket after answer submission (500ms delay for feedback)

## 8. Core Gameplay — Timer & Win Condition

- [x] 8.1 Create countdown timer component (MM:SS format, red monospace, pulse animation under 2 min)
- [x] 8.2 Implement client-side timer sync (start from game_start broadcast, tick every second)
- [x] 8.3 Implement win condition: first to 100% triggers game_end broadcast
- [x] 8.4 Implement win condition: timer reaches 0 triggers game_end broadcast
- [x] 8.5 Implement tiebreaker logic (same %, fewer wrong answers wins)

## 9. Realtime Sync — Supabase Broadcast

- [x] 9.1 Create useGameChannel hook (subscribe to room:{code} broadcast channel, handle message types)
- [x] 9.2 Implement progress broadcast (send on answer, receive and update leaderboard)
- [x] 9.3 Implement conflict_throw broadcast (send on throw, receive and trigger conflict overlay on target)
- [x] 9.4 Implement conflict_resolve broadcast (send on resolve, update all clients)
- [x] 9.5 Implement activity feed broadcast (send on all events, receive and prepend to feed)
- [x] 9.6 Implement game_start and game_end broadcasts
- [x] 9.7 Implement optimistic UI updates (local state updates immediately, broadcast confirms to others)
- [x] 9.8 Implement reconnection handler (sync_request broadcast, peer responds with full state)
- [x] 9.9 Implement Supabase Presence for player online/offline status in waiting room

## 10. Streak & Conflict System

- [x] 10.1 Implement streak tracking in game state (increment on correct, reset on wrong)
- [x] 10.2 Implement streak bonus (+3% at streak 3) in progress calculation
- [x] 10.3 Implement conflict unlock (show "💣 THROW CONFLICT" button at streak >= 3, max 1 held)
- [x] 10.4 Implement conflict loss (held conflict lost on wrong answer with streak reset)
- [x] 10.5 Create target selection modal (list players with progress, LEADING badge, CONFLICTED/IMMUNE badges, red hover)
- [x] 10.6 Implement conflict delivery (random type selection 50/50, broadcast to target, transition target to CONFLICTED state)
- [x] 10.7 Create conflict overlay full-screen component (red tint, "MERGE CONFLICT!" glitch text, shake animation, hazard stripes, attacker name)
- [x] 10.8 Implement hard_puzzle conflict resolution (display hard ticket, validate answer, retry on wrong)
- [x] 10.9 Implement silly_task conflict resolution (display long comment string, validate exact typing, show accuracy %)
- [x] 10.10 Implement conflict resolution flow (resolve → "CONFLICT RESOLVED ✓" animation → return to PLAYING state → broadcast)
- [x] 10.11 Implement 30-second immunity cooldown after conflict resolution (IMMUNE badge, not targetable)

## 11. Main Game Screen Assembly

- [x] 11.1 Assemble 3-column game layout (left: leaderboard sidebar 250px, center: ticket area, right: activity feed 280px)
- [x] 11.2 Create leaderboard sidebar component (ranked player list with progress bars, streak indicators, live reordering with Framer Motion layoutId)
- [x] 11.3 Create activity feed sidebar component (scrolling terminal-style log entries with timestamps, fade-in animation)
- [x] 11.4 Create bottom bar component (streak indicator, conflict button, stats: correct/wrong counts)
- [x] 11.5 Wire all components together with game state machine and broadcast channel

## 12. Game Over & Results

- [x] 12.1 Create results screen layout (winner announcement, ASCII leaderboard table, stats summary, awards, action buttons)
- [x] 12.2 Create ASCII table component using box-drawing characters (┌┐└┘─│├┤) for the leaderboard
- [x] 12.3 Implement fun awards calculation (Sharpshooter: highest accuracy, Conflict King: most thrown, Survivor: least received, Speed Demon: fastest avg)
- [x] 12.4 Create confetti animation (canvas-based green/gold particles, 3-second duration)
- [x] 12.5 Implement "Play Again" button (navigate to landing page) and "Leave" button
- [x] 12.6 Write final player stats to database (update players table with final progress, correct, wrong counts)

## 13. Polish & Effects

- [x] 13.1 Add glitch CSS animation to logo on landing page
- [x] 13.2 Add typewriter animation hook for tagline text
- [x] 13.3 Add screen shake keyframe animation for conflict delivery
- [x] 13.4 Add glass shatter CSS effect for conflict overlay
- [x] 13.5 Add spring physics to all progress bar transitions (Framer Motion spring config)
- [x] 13.6 Add enter/exit animations to all modals and overlays (fade + scale)
- [ ] 13.7 Add sound effects (optional): correct answer beep, wrong answer buzz, conflict alarm, game over fanfare
- [x] 13.8 Ensure all animations maintain 60fps (test with Chrome DevTools Performance panel)

## 14. Testing & Deploy

- [ ] 14.1 Test multiplayer flow end-to-end with 2+ browser tabs (create room, join, play, conflict, game over)
- [ ] 14.2 Test AI ticket generation for all 3 topics (PHP, Frontend, Mix) and verify fallback
- [ ] 14.3 Test conflict immunity cooldown timing
- [ ] 14.4 Test reconnection handling (disconnect and rejoin mid-game)
- [ ] 14.5 Test win conditions (100% winner, timer expiry, tiebreaker)
- [ ] 14.6 Test edge cases (room full, duplicate nickname, invalid room code, game already started)
- [ ] 14.7 Configure Vercel project and environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, AI_PROVIDER, API keys)
- [ ] 14.8 Deploy to Vercel and verify production build
- [ ] 14.9 Run final multiplayer test on production URL with team
