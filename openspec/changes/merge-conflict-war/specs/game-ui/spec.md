## ADDED Requirements

### Requirement: Terminal theme design system
The system SHALL render all UI using a terminal/hacker aesthetic: black background (#0a0a0a), neon green primary text (#00ff41), monospace font (JetBrains Mono), and CRT scan line overlay effect. All interactive elements SHALL use terminal-style prefixes ("> " for buttons, "$ " for commands).

#### Scenario: Consistent theme across screens
- **WHEN** any screen is rendered (landing, lobby, game, results)
- **THEN** background is #0a0a0a, primary text is #00ff41 monospace, and CRT scan lines are visible as a subtle overlay

#### Scenario: Design token usage
- **WHEN** a UI component uses a color
- **THEN** it references Tailwind design tokens: green (#00ff41), red (#ff0040), yellow (#ffd700), blue (#00d4ff), surface (#111111), code-surface (#1a1a1a)

### Requirement: Landing page
The system SHALL display a landing page with: a glitchy "THE MERGE CONFLICT WAR" logo, a typewriter-animated tagline, "CREATE ROOM" button, "JOIN ROOM" button, and a 6-character room code input field.

#### Scenario: Create room flow
- **WHEN** user clicks "CREATE ROOM"
- **THEN** system navigates to the room creation screen with topic and duration selection

#### Scenario: Join room flow
- **WHEN** user enters a 6-character room code and clicks "JOIN ROOM"
- **THEN** system validates the code and navigates to the nickname entry then waiting room

### Requirement: Waiting room display
The system SHALL display the waiting room with: the room code (large, copy-able), a list of connected players with terminal-style avatars (>_), player count (N/10), game settings summary, and a start button.

#### Scenario: Player joins waiting room
- **WHEN** a new player joins
- **THEN** their name appears in the player list with a typing animation and "✓ connected" status

#### Scenario: Copy room code
- **WHEN** user clicks the copy button next to the room code
- **THEN** room code is copied to clipboard and a brief "Copied!" confirmation appears

### Requirement: Main game layout
The system SHALL render the main game screen with a 3-column layout: left sidebar (leaderboard, 250px), center area (current ticket), and right sidebar (activity feed, 280px). A bottom bar SHALL show streak indicator, conflict button, and player stats.

#### Scenario: Leaderboard updates in real-time
- **WHEN** any player's progress changes
- **THEN** the leaderboard re-renders with updated progress bars and reorders ranks with smooth animation

#### Scenario: Ticket display
- **WHEN** player receives a new ticket
- **THEN** center area shows: ticket number, language, difficulty badge (color-coded), code block with syntax highlighting, question text, and answer input area

#### Scenario: Activity feed scrolling
- **WHEN** new activity events arrive
- **THEN** they appear at the top of the feed with a fade-in animation and older entries scroll down

### Requirement: Code block display
The system SHALL render code snippets in tickets using a dark editor theme (#1a1a1a background) with syntax highlighting appropriate to the language (PHP or JavaScript/CSS/HTML). Line numbers SHALL be displayed on the left. The buggy or missing portion SHALL be visually highlighted.

#### Scenario: PHP code with syntax highlighting
- **WHEN** a PHP ticket is displayed
- **THEN** code shows proper PHP syntax colors (keywords, strings, variables, comments) with line numbers

#### Scenario: Bug highlighting
- **WHEN** ticket contains a buggy line
- **THEN** the buggy line or section has a yellow background or red underline to draw attention

### Requirement: Progress bar component
The system SHALL render each player's progress as an ASCII-style horizontal bar: filled portion in green (#00ff41), unfilled in dark gray (#333333), with percentage text. The bar SHALL animate smoothly (spring physics) when the value changes. The leading player's bar SHALL have a yellow glow border.

#### Scenario: Progress bar animation
- **WHEN** player's progress increases from 45% to 53%
- **THEN** the green fill animates from 45% to 53% width with a spring easing over ~300ms

#### Scenario: Leader highlight
- **WHEN** player has the highest progress among all players
- **THEN** their progress bar row has a yellow (#ffd700) glow border

### Requirement: Countdown timer
The system SHALL display a countdown timer showing remaining minutes and seconds in large red monospace text. When under 2 minutes remaining, the timer SHALL pulse with an animation. When time reaches zero, the game ends.

#### Scenario: Timer under 2 minutes
- **WHEN** remaining time drops below 2:00
- **THEN** timer text pulses with a red glow animation at 1-second intervals

#### Scenario: Timer reaches zero
- **WHEN** timer shows 0:00
- **THEN** game transitions to "finished" and results screen is displayed

### Requirement: Conflict overlay
The system SHALL display a full-screen red-tinted overlay when a player is hit with a conflict. The overlay MUST include: "MERGE CONFLICT!" text with glitch distortion, attacker's name, screen shake animation, hazard stripe borders, and the conflict challenge content. The main game timer SHALL remain visible.

#### Scenario: Conflict overlay appears
- **WHEN** player receives a conflict
- **THEN** full-screen overlay fades in with shake animation, glitch text, red vignette, and hazard stripes within 500ms

#### Scenario: Conflict resolved animation
- **WHEN** player resolves the conflict
- **THEN** overlay shows "CONFLICT RESOLVED ✓" in green, then fades out with a reverse-glitch effect returning to normal gameplay

### Requirement: Target selection modal
The system SHALL display a modal overlay when the player activates "Throw Conflict". The modal MUST list all other players with: terminal cursor icon, nickname, progress bar with percentage, and status badges (LEADING in yellow, CONFLICTED in red, IMMUNE in blue). Targetable players SHALL have a red hover effect.

#### Scenario: Hover on targetable player
- **WHEN** user hovers over a targetable player in the modal
- **THEN** the row shows a red border glow and slight scale-up animation

#### Scenario: Non-targetable player appearance
- **WHEN** a player is conflicted or immune
- **THEN** their row is grayed out with the appropriate badge and clicking has no effect

### Requirement: Game over results screen
The system SHALL display results after the game ends with: winner announcement text, ASCII table leaderboard (rank, name, progress, correct/wrong, conflicts, max streak), game stats summary, fun awards section (4 award cards), and action buttons ("Play Again" and "Leave").

#### Scenario: Winner announcement
- **WHEN** results screen appears and "NhatDev" won
- **THEN** screen shows "MERGED SUCCESSFULLY INTO MAIN!" in green with glow effect and "🏆 NhatDev" in gold

#### Scenario: Fun awards display
- **WHEN** results are calculated
- **THEN** system displays awards: Sharpshooter (highest accuracy), Conflict King (most conflicts thrown), Survivor (least conflicts received), Speed Demon (fastest average answer time)

#### Scenario: Play again
- **WHEN** user clicks "Play Again"
- **THEN** system navigates back to the landing page to create or join a new room

### Requirement: Framer Motion animations
The system SHALL use Framer Motion for all UI animations: spring-based progress bar transitions, layout animations for leaderboard reordering, enter/exit animations for modals and overlays, shake keyframes for conflict, and confetti particles for game over. All animations MUST maintain 60fps.

#### Scenario: Leaderboard reorder animation
- **WHEN** player ranks change (e.g., #3 overtakes #2)
- **THEN** rows animate smoothly to their new positions using Framer Motion layoutId

#### Scenario: Confetti on game over
- **WHEN** results screen appears
- **THEN** green and gold confetti particles animate falling from the top of the screen for 3 seconds
