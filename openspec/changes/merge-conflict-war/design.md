## Context

"The Merge Conflict War" is a greenfield real-time multiplayer coding game for internal dev team building (5–10 players per session). Players race to merge their code into `main` by solving AI-generated code tickets while sabotaging opponents with "Merge Conflict" attacks.

**Current state**: No existing codebase. UI designs completed on Google Stitch (Project ID: `292099321973586351`) with 7 screens covering the full game flow. PRD finalized in `docs/PRD.md`.

**Constraints**:
- Session duration: 10–15 minutes (fast-paced gameplay required)
- No authentication (nickname-only, zero friction)
- Ephemeral data (no persistence beyond active session)
- Desktop browsers only (Chrome, Edge, Firefox)
- AI ticket generation must happen pre-game (not real-time) to control cost and latency
- Single game room at a time

**Stakeholders**: Dev team (players), team lead (organizer)

## Goals / Non-Goals

**Goals:**
- Sub-500ms real-time updates for all player actions (progress, conflicts, activity feed)
- AI tickets generated in under 15 seconds when creating a room
- Smooth animations (60fps) for conflict overlays, progress bars, and UI transitions
- Clean separation between game logic, real-time transport, and UI layers
- One-command deploy to Vercel + Supabase

**Non-Goals:**
- Mobile support or responsive design
- User accounts, persistent profiles, or game history
- Multiple concurrent game rooms
- Admin dashboard or content management
- Offline support or PWA features

## Decisions

### D1: Next.js App Router with Server Components for room creation, Client Components for gameplay

**Choice**: Hybrid rendering — server-side for room setup (API routes for AI generation), client-side for the entire game experience.

**Why over full SPA**: App Router provides built-in API routes (no separate backend), server-side AI calls (keys stay server-side), and file-based routing. The game screen itself is entirely client-rendered since it's real-time interactive.

**Why over Pages Router**: App Router is the current standard for Next.js 14+. Server Components keep AI API keys off the client. Route groups organize game vs. lobby cleanly.

**Alternatives considered**:
- Vite + Express backend: More setup, separate deploy, no SSR benefits for landing/lobby pages
- Remix: Good alternative but smaller ecosystem for real-time patterns with Supabase

### D2: Supabase Realtime Broadcast (not Postgres Changes) for game state

**Choice**: Use Supabase Realtime **Broadcast** channels for all in-game communication. Use **Postgres** for room/player persistence only at key moments (join, game start, game end).

**Why Broadcast over Postgres Changes**: Broadcast is peer-to-peer via the Realtime server — no database write required per action. A player answering a ticket fires a broadcast message, not a DB update. This gives us:
- Lower latency (no DB round-trip for each answer)
- Lower Supabase DB load
- Simpler conflict resolution (last-write-wins is fine for ephemeral game state)

**DB writes happen only for**:
- Room creation (insert `game_rooms`)
- Player joining (insert `players`)
- Game start/end (update `game_rooms.status`)
- Final results (update `players` with final scores)

**In-game state flows through Broadcast**:
- Player progress updates
- Conflict throw/resolve events
- Activity feed entries
- Timer sync

**Why over Socket.io**: Supabase Realtime is already part of the stack (shares auth, DB connection). No additional server to deploy or manage. Free tier supports 200 concurrent connections (we need 10 max).

**Alternatives considered**:
- Supabase Postgres Changes (Realtime): Too many DB writes, higher latency, unnecessary persistence
- Socket.io + Express: Separate server needed, separate deploy, more infrastructure
- Ably/Pusher: External dependency, cost, overkill for 10 players

### D3: AI ticket pre-generation with provider abstraction

**Choice**: Generate all tickets (~35) when creating a room via a Next.js API route. Abstract the AI provider behind an interface so OpenAI, Anthropic, or Gemini can be swapped via env var.

**Architecture**:
```
/api/rooms/create (POST)
  → validateInput(topic, duration)
  → generateTickets(topic, count, provider)
      → provider.chat(systemPrompt, userPrompt)
      → parseAndValidateTickets(response)
      → fallbackToPresetIfInvalid()
  → insertRoom(roomCode, tickets)
  → return { roomCode }
```

**Why pre-generate**: Real-time AI calls during gameplay would add 1–3s latency per ticket (unacceptable). Pre-generation happens once during room creation (acceptable 5–15s wait with loading UI). Tickets are stored as JSONB in the `game_rooms` table.

**Fallback**: If AI generation fails or returns invalid tickets, fall back to a curated preset ticket bank (~50 hand-crafted tickets per topic).

**Alternatives considered**:
- Real-time generation per ticket: Too slow, expensive, unreliable during gameplay
- Pre-built ticket database only (no AI): Less dynamic, requires manual curation, gets stale
- Hybrid (AI + cache): Over-engineered for MVP

### D4: Client-side game state machine with broadcast sync

**Choice**: Each client maintains its own game state via a state machine (useReducer or Zustand). Broadcast messages trigger state transitions. No central game server — clients are authoritative for their own progress.

**State machine states**:
```
LOBBY → COUNTDOWN → PLAYING → (CONFLICTED ↔ PLAYING) → GAME_OVER
```

**Why client-authoritative**: For a team building game with 5–10 trusted players on the same network, client-side authority is simpler and lower latency. No need for anti-cheat. Each player:
1. Validates their own answer locally (tickets include correct answers)
2. Broadcasts their progress update
3. All clients update their leaderboard from broadcasts

**Why over server-authoritative**: No server to build, no latency for answer validation, simpler architecture. Acceptable trust model for internal team building.

**Alternatives considered**:
- Server-authoritative with Supabase Edge Functions: More correct but adds latency, complexity, and cold-start issues
- Shared Zustand store via broadcast: Zustand's middleware approach is messier than explicit broadcast handling

### D5: Monospace terminal theme with Tailwind + Framer Motion

**Choice**: Custom Tailwind config with terminal design tokens. Framer Motion for all animations. JetBrains Mono as primary font.

**Design tokens**:
- `--bg-terminal: #0a0a0a`
- `--text-green: #00ff41`
- `--text-red: #ff0040`
- `--text-yellow: #ffd700`
- `--text-blue: #00d4ff`
- `--surface: #111111`
- `--surface-code: #1a1a1a`

**Key animations** (Framer Motion):
- Progress bar: `animate={{ width }}` with spring transition
- Conflict overlay: `shake` keyframes + CSS `backdrop-filter` for glass shatter
- Confetti: Lightweight canvas-based particle system (no heavy library)
- Typing effect: Custom hook with `setInterval` character reveal

**Why Framer Motion over CSS animations**: Declarative API integrates naturally with React state. Spring physics for progress bars feel more alive. Layout animations for leaderboard reordering. Exit animations for conflict resolution.

**UI screens reference**: Google Stitch Project `292099321973586351` — 7 screens designed with terminal/hacker aesthetic. Export HTML/CSS from Stitch as reference, rebuild as React components with Tailwind.

## Risks / Trade-offs

**[Client-authoritative cheating]** → Acceptable for internal team building. Players are colleagues, not strangers. If needed later, add server validation via Supabase Edge Functions.

**[AI ticket quality inconsistency]** → Structured prompt with JSON schema enforcement + validation function that checks ticket structure. Fallback to preset ticket bank if validation fails. Test prompts across providers before launch.

**[Supabase Realtime message ordering]** → Broadcast doesn't guarantee ordering. Mitigate with timestamps on every message + client-side reordering for activity feed. Progress updates are idempotent (last value wins).

**[Stale game state on reconnect]** → When a player reconnects, they request current state from other clients via a broadcast "sync request". Any connected client responds with full game state. If alone, fetch last-known state from DB.

**[Conflict spam targeting one player]** → 30-second immunity cooldown after being conflicted. UI shows "IMMUNE" badge on protected players in target selection modal.

**[Room code collision]** → 6-character alphanumeric code = 2.1 billion combinations. For single-room usage, collision is effectively impossible. Generate and check uniqueness on insert.
