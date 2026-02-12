# Stitch Prompts — The Merge Conflict War

> Các prompt dùng cho Google Stitch để generate UI cho từng màn hình game.
> Copy từng prompt bên dưới và paste vào Stitch tại: https://stitch.withgoogle.com/

---

## Hướng dẫn sử dụng

1. Mở [Google Stitch](https://stitch.withgoogle.com/)
2. Copy prompt cho từng screen bên dưới
3. Paste vào Stitch và generate
4. Dùng "annotate to edit" để chỉnh sửa chi tiết
5. Export HTML/CSS hoặc Figma khi hài lòng

**Lưu ý quan trọng:** Chạy từng prompt theo thứ tự để đảm bảo design consistency.

---

## Screen 1: Landing Page / Home

```
Real-time multiplayer coding game landing page with dark hacker/terminal aesthetic.

Key Features:
- Large glitchy logo text "THE MERGE CONFLICT WAR" centered at top with green neon glow effect and subtle glitch/flicker animation
- Tagline below logo with typewriter effect: "Race to merge your code into production. Survive the conflicts."
- Two large action buttons stacked vertically in the center:
  1. "CREATE ROOM" button (green border, terminal style with "> " prefix)
  2. "JOIN ROOM" button (blue border, terminal style with "> " prefix)
- Below the buttons: a text input field for entering a 6-character room code (monospace font, dashed underlines for each character like _ _ _ _ _ _)
- Background: pure black (#0a0a0a) with subtle animated scan lines (CRT monitor effect) and faint green grid lines
- Small footer text: "Built with Next.js + Supabase" in dim green

Visual Style:
- Color palette: black background (#0a0a0a), neon green text (#00ff41), blue accent (#00d4ff), red accent (#ff0040)
- Font: monospace (like JetBrains Mono or Fira Code)
- Design aesthetic: terminal/hacker/cyberpunk with CRT scan lines overlay
- Buttons have green glow on hover, cursor blinks like terminal
- All text should look like terminal output with ">" prefixes

Platform: Desktop web (1440px width, not responsive)
```

---

## Screen 2: Room Creation

```
Game room creation screen for a coding battle game with terminal/hacker aesthetic on black background.

Key Features:
- Header: "> INITIALIZE NEW GAME ROOM" in bright green monospace text
- Step-by-step form styled as terminal commands:
  1. Topic selector as terminal options:
     "$ select --topic" followed by three clickable options in bordered boxes:
     [PHP] [FRONTEND] [MIX] — currently selected option has green border and glow
  2. Duration selector:
     "$ set --timer" followed by two clickable options:
     [10 MIN] [15 MIN] — selected has green border
  3. AI provider indicator (small, dim text):
     "$ ai --provider auto" with a subtle loading spinner
- Large green button at bottom: "$ git init --start-room" with green glow
- Right side: animated ASCII art of a git branch diagram being drawn
- Loading state: when generating tickets, show "Generating tickets..." with a progress bar made of block characters [████████░░░░] 67%

Visual Style:
- Pure black background (#0a0a0a) with green monospace text (#00ff41)
- Form elements styled as terminal input/output
- Selected options have neon green border glow
- Typing cursor blinking animation on active fields
- Subtle scan lines overlay (CRT effect)

Platform: Desktop web (1440px width)
```

---

## Screen 3: Waiting Room / Lobby

```
Multiplayer game waiting room for a coding battle game with terminal/hacker aesthetic.

Key Features:
- Top section: Large room code display "ROOM: A7X92K" in huge green monospace text with a copy button (clipboard icon) next to it
- Subtitle: "Share this code with your team" in dim green
- Center: Player list styled as terminal output, showing joined players:
  ```
  > player_01: "NhatDev"        ✓ connected
  > player_02: "ThanhPHP"       ✓ connected  
  > player_03: "MinhFrontend"   ✓ connected
  > player_04: ________________  waiting...
  ```
  Each player has a blinking terminal cursor icon (>_) as avatar
- Player count: "3/10 branches connected" with a subtle pulse animation
- Bottom: Large start button "$ git push --force START" that becomes active when 3+ players joined. Below it: "Auto-start in 10s when 3+ players ready" as dim text
- Countdown animation when starting: large numbers 3...2...1 with screen flash effect
- Ambient animation: matrix-style falling green characters in the background (very subtle, low opacity)

Visual Style:
- Black background (#0a0a0a), neon green primary (#00ff41), blue for info (#00d4ff)
- Monospace font throughout
- Players appear with a typing animation (one character at a time)
- Connected status has green dot, waiting has blinking underscore
- CRT scan lines overlay

Platform: Desktop web (1440px width)
```

---

## Screen 4: Main Game (Core Gameplay)

```
Main gameplay screen for a real-time multiplayer coding battle game with terminal/hacker aesthetic. This is the most important screen.

Layout (3-column):
- Left sidebar (250px): Live leaderboard
- Center main area (flexible): Current ticket/question
- Right sidebar (280px): Activity feed

LEFT SIDEBAR - Leaderboard:
- Header: "BRANCHES" in green
- List of all players with horizontal progress bars:
  Each player row shows:
  - Rank number (#1, #2, etc.)
  - Player nickname in green
  - Progress bar (green filled portion on dark background): e.g. [████████░░░░░░] 62%
  - Small fire emoji indicators for active streaks (🔥🔥)
- Currently leading player has a yellow glow highlight
- Own player row is highlighted with a brighter border
- Progress bars animate smoothly in real-time

CENTER - Ticket Area:
- Top: Timer countdown "08:42" in large red monospace text, pulsing when under 2 minutes
- Ticket header: "TICKET #7 — PHP — MEDIUM" with difficulty badge (green=easy, yellow=medium, red=hard)
- Code block: Dark gray code editor area (#1a1a1a) with syntax-highlighted code (like VS Code dark theme). The code has a visible bug or missing part highlighted with a red underline or yellow placeholder
- Question text below code: "What should replace the highlighted line?" in green
- Answer area (multiple choice variant shown):
  Four option buttons labeled A, B, C, D — each containing a code snippet. Hover shows green border. Selected shows filled green background.
- Submit button: "$ git commit --push" in green

RIGHT SIDEBAR - Activity Feed:
- Header: "GIT LOG" in green
- Scrolling list of recent events styled as git log entries:
  "NhatDev → pushed +8% (streak: 🔥🔥)"
  "ThanhPHP → CONFLICT thrown at MinhFrontend! 💣"
  "MinhFrontend → resolved conflict ✓"
  Each entry has a timestamp and fades from bright to dim

BOTTOM BAR:
- Streak indicator: "STREAK: 🔥🔥 (1 more for Conflict!)" in yellow
- Conflict button (when available): "💣 THROW CONFLICT" — large red glowing button, pulsing animation
- Player stats: "Correct: 12 | Wrong: 3"

Visual Style:
- Black background (#0a0a0a), green text (#00ff41), red for danger (#ff0040), yellow for streak (#ffd700), blue for info (#00d4ff)
- Code blocks use dark VS Code-like theme with syntax highlighting
- All text is monospace
- Progress bars are ASCII-style: [████░░░░]
- CRT scan lines overlay (very subtle)
- Smooth animations on progress bar changes

Platform: Desktop web (1440px width)
```

---

## Screen 5: Conflict Target Selection Modal

```
Modal overlay for selecting a target player to throw a "Merge Conflict" at, in a coding battle game with terminal/hacker aesthetic.

Key Features:
- Semi-transparent dark overlay covering the main game screen
- Modal centered on screen with red/orange border glow
- Header: "💣 SELECT TARGET — THROW CONFLICT" in red monospace text with warning icon
- Subtitle: "Choose a branch to disrupt:" in dim orange text
- Player list showing all OTHER players (not yourself):
  Each player card is a horizontal row with:
  - Terminal cursor icon (>_)
  - Player nickname in green
  - Current progress bar with percentage: [████████░░] 72%
  - Small indicator if they are currently in a conflict already (red "CONFLICTED" badge)
  - The player with highest progress has a yellow "LEADING" badge and subtle target crosshair icon
- Each player row is clickable with red hover effect (red border glow)
- Bottom: "CANCEL" button (dim gray) and selected target confirmation
- When a target is selected: brief animation of a "projectile" or "git push --force" animation before the modal closes

Visual Style:
- Dark modal background (#111111) with red border glow (#ff0040)
- Player rows on dark cards (#1a1a1a)  
- Hover state: red border, slight scale up
- Leading player highlighted with yellow accent (#ffd700)
- Red accents throughout (#ff0040, #ff4444)
- Monospace font, terminal aesthetic

Platform: Desktop web (centered modal, ~600px wide)
```

---

## Screen 6: Merge Conflict Overlay (Being Attacked)

```
Full-screen dramatic overlay shown when a player receives a "Merge Conflict" attack in a coding battle game. This should feel intense and urgent.

Key Features:
- FULL SCREEN red-tinted overlay covering the entire game screen
- Giant text in the center: "MERGE CONFLICT!" in bold red (#ff0040) with heavy glitch/distortion effect, the text should appear broken/shattered
- Below the title: "Thrown by: ThanhPHP 💣" in orange text showing who attacked
- Visual effects suggestions:
  - Screen crack/shatter effect (like broken glass radiating from center)
  - Screen shake animation
  - Red warning stripes along the borders (hazard pattern)
  - Flickering/glitch static noise overlay
  - Red vignette darkening the edges
- After 2-second dramatic intro, the challenge appears:
  
  Challenge area (centered card):
  - Header: "RESOLVE CONFLICT TO CONTINUE" in yellow
  - Challenge type shown: either "TYPE THIS EXACTLY:" with a long comment string below it (like: // TODO: Fix this legacy spaghetti code that nobody understands anymore but we ship it anyway) in a text input area
  - OR a harder code puzzle similar to regular tickets but with "HARD" badge
  - Progress indicator: typing accuracy percentage
  - No timer (but game timer keeps running in background, visible as small red countdown in corner)
  
- When resolved: Green "CONFLICT RESOLVED ✓" animation with screen returning to normal, like a glitch effect reversing

Visual Style:
- Heavy red tint over everything (#ff0040 at 15% opacity overlay)
- Glitch effects, screen shake, broken glass
- Warning/hazard stripe borders (red and yellow diagonal stripes)
- Challenge card has dark background with red border
- Success state transitions to green glow before fading back to normal game
- All text remains monospace
- Should feel dramatic, urgent, but also FUN and humorous

Platform: Desktop web (full screen overlay, 1440px)
```

---

## Screen 7: Game Over / Results

```
Game over results screen for a multiplayer coding battle game with terminal/hacker aesthetic. Celebratory but still in terminal style.

Key Features:
- Top section: Large animated text:
  - For winner: "🎉 MERGED SUCCESSFULLY INTO MAIN!" in bright green with glow pulse
  - For others: "BRANCH DELETED — BETTER LUCK NEXT TIME" in yellow
- Winner spotlight: The winning player's name displayed in ASCII art style, large green text
- Results table (centered, terminal-style table with borders made of ─ │ ┌ ┐ └ ┘):
  ```
  ┌──────┬────────────────┬──────────┬─────────┬───────────┬────────────┐
  │ RANK │ BRANCH         │ PROGRESS │ CORRECT │ CONFLICTS │ STREAK MAX │
  ├──────┼────────────────┼──────────┼─────────┼───────────┼────────────┤
  │ 🥇 1 │ NhatDev        │ 100%     │ 14/16   │ 2 thrown  │ 🔥🔥🔥🔥   │
  │ 🥈 2 │ ThanhPHP       │ 87%      │ 11/15   │ 1 thrown  │ 🔥🔥🔥     │
  │ 🥉 3 │ MinhFrontend   │ 72%      │ 9/14    │ 0 thrown  │ 🔥🔥       │
  │   4  │ LinhCSS        │ 58%      │ 7/12    │ 1 thrown  │ 🔥         │
  └──────┴────────────────┴──────────┴─────────┴───────────┴────────────┘
  ```
- Stats summary below table:
  "Total tickets solved: 41 | Total conflicts: 4 | Game duration: 12:34"
- Fun awards section (small cards):
  "🎯 Sharpshooter: NhatDev (87% accuracy)"
  "💣 Conflict King: ThanhPHP (2 conflicts thrown)"  
  "🛡️ Survivor: MinhFrontend (0 conflicts received)"
  "⚡ Speed Demon: NhatDev (fastest average answer)"
- Bottom buttons:
  "$ git checkout -b new-game PLAY AGAIN" (green button)
  "$ exit LEAVE" (dim gray button)
- Confetti/particle animation for top 3 players (green, yellow, blue particles falling)

Visual Style:
- Black background (#0a0a0a) with celebration effects
- Green primary (#00ff41), gold for 1st (#ffd700), silver for 2nd (#c0c0c0), bronze for 3rd (#cd7f32)
- ASCII box-drawing characters for the table
- Monospace font throughout
- Winner name has animated glow effect
- Subtle confetti/particles in green and gold
- Fun but still maintaining the terminal/hacker aesthetic

Platform: Desktop web (1440px width)
```

---

## Bonus: Component-Level Prompts

Nếu muốn generate từng component riêng lẻ, dùng các prompt nhỏ sau:

### Progress Bar Component

```
Single player progress bar component for a terminal/hacker themed game.

Shows: rank number, player name in green monospace, horizontal ASCII-style progress bar [████████░░░░] with percentage, and streak fire emojis.

Black background (#0a0a0a), green fill (#00ff41), unfilled portion dark gray (#333).
Bar animates smoothly when percentage changes.
When player is leading, add yellow glow border.
Width: 240px, height: 40px.
```

### Streak Indicator

```
Streak indicator component for a coding game with terminal aesthetic.

Shows current streak count as fire emojis (🔥) from 0 to 3+.
At streak 0: dim text "STREAK: ---"
At streak 1: "STREAK: 🔥" 
At streak 2: "STREAK: 🔥🔥"
At streak 3+: "STREAK: 🔥🔥🔥 CONFLICT READY!" with pulsing red glow animation

Green monospace text on black background. Yellow (#ffd700) for fire indicators.
Width: 300px.
```

### Code Block / Ticket Display

```
Code editor display component for showing a code puzzle in a terminal-themed game.

Features:
- Dark code editor background (#1a1a1a) with rounded corners
- Syntax highlighted code (PHP or JavaScript) with line numbers on left (dim gray)
- One line or section highlighted with yellow background or red underline indicating the bug/missing code
- Header bar showing: language icon, filename, difficulty badge (green "EASY" / yellow "MEDIUM" / red "HARD")
- Scrollable if code is long

Style: VS Code dark theme colors for syntax highlighting
Font: monospace, 14px
Border: 1px solid #333 with subtle green glow on focus
Width: flexible (fills container)
```

---

## Thứ tự generate recommended

1. **Screen 1**: Landing Page → Thiết lập visual direction
2. **Screen 4**: Main Game → Màn hình quan trọng nhất, cần iterate nhiều
3. **Screen 6**: Conflict Overlay → Hiệu ứng dramatic nhất
4. **Screen 3**: Waiting Room → Đơn giản, xây trên style đã có
5. **Screen 2**: Room Creation → Form-based, ít phức tạp
6. **Screen 5**: Target Selection Modal → Component nhỏ
7. **Screen 7**: Game Over → Celebration screen

---

*Tạo ngày: 2026-02-12*
*Dùng với: [Google Stitch](https://stitch.withgoogle.com/)*
