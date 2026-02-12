## Why

Dev team building events lack engaging, code-relevant activities. Generic quiz tools (Kahoot) don't test real coding skills, and coding assessments feel too formal. We need a game that combines competitive fun with actual code knowledge — something devs genuinely enjoy while sharpening their skills. Building it now because the team has an upcoming team building event and this doubles as a portfolio-worthy project demonstrating real-time web development capabilities.

## What Changes

- **New web application**: Full-stack real-time multiplayer game built from scratch
- **Game room system**: Create/join rooms via 6-character codes, no authentication required
- **AI-powered ticket engine**: Pre-generate code challenge tickets (PHP + Frontend) using LLM APIs before each game session
- **Real-time gameplay**: Supabase Realtime for live progress tracking, conflict events, and activity feeds across all connected players
- **Streak & conflict mechanic**: 3 correct answers in a row earns a "Merge Conflict" weapon that can be thrown at any opponent, blocking their progress until they resolve a challenge
- **Progress & scoring**: Players race to 100% by solving tickets of varying difficulty (easy/medium/hard), with a timer-based fallback win condition
- **Terminal-themed UI**: Dark hacker aesthetic with CRT scan lines, glitch effects, and Framer Motion animations
- **Game results**: End-of-game leaderboard with stats, fun awards, and play-again flow

## Capabilities

### New Capabilities

- `game-room`: Room creation (topic/duration selection), joining via room code, player management, room lifecycle (waiting → playing → finished), auto-start logic
- `ticket-engine`: AI ticket generation via abstraction layer (OpenAI/Anthropic/Gemini), ticket types (multiple-choice, fill-in-blank, drag-and-drop), answer validation, difficulty scaling, conflict challenge generation
- `realtime-sync`: Supabase Realtime channel architecture for player progress broadcasts, conflict event propagation, game state transitions, activity feed streaming, and reconnection handling
- `streak-conflict`: Streak tracking (reset on wrong answer), conflict unlock at streak 3, target selection, conflict delivery and resolution flow, anti-spam cooldown (30s immunity after being conflicted)
- `game-ui`: Terminal/hacker themed component library, Framer Motion animations (shake, shatter, glitch, confetti), responsive game layout (leaderboard + ticket + feed), countdown timer, progress bars, code editor display with syntax highlighting

### Modified Capabilities

_None — this is a greenfield project with no existing specs._

## Impact

- **New codebase**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **New infrastructure**: Supabase project (PostgreSQL database + Realtime channels)
- **New deployment**: Vercel (frontend) + Supabase (hosted backend)
- **External API dependencies**: At least one LLM provider API (OpenAI, Anthropic, or Gemini) for ticket generation
- **Database tables**: `game_rooms`, `players`, `conflict_events`
- **Browser support**: Desktop only (Chrome, Edge, Firefox) — no mobile
