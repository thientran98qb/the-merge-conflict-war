## ADDED Requirements

### Requirement: Streak tracking
The system SHALL track consecutive correct answers per player. The streak counter starts at 0, increments by 1 for each correct answer, and resets to 0 on any incorrect answer. The current streak value MUST be visible to the player at all times during gameplay.

#### Scenario: Streak increments on correct answer
- **WHEN** player answers correctly and current streak is 1
- **THEN** streak increases to 2 and UI shows "STREAK: 🔥🔥"

#### Scenario: Streak resets on wrong answer
- **WHEN** player answers incorrectly and current streak is 2
- **THEN** streak resets to 0 and UI shows "STREAK: ---"

#### Scenario: Streak persists across ticket types
- **WHEN** player answers easy ticket correctly (streak 1), then medium ticket correctly (streak 2)
- **THEN** streak is 2 regardless of ticket type changes

### Requirement: Streak bonus points
The system SHALL award a bonus of 3% progress when a player achieves a streak of 3 (in addition to the ticket points). This bonus is awarded once per streak milestone of 3.

#### Scenario: Streak bonus at 3
- **WHEN** player answers 3rd consecutive correct answer (hard ticket worth 12%)
- **THEN** player receives 12% + 3% bonus = 15% total progress increase

#### Scenario: No bonus below streak 3
- **WHEN** player answers correctly with streak at 2
- **THEN** player receives only the ticket's point value, no bonus

### Requirement: Conflict unlock
The system SHALL unlock a "Throw Conflict" ability when a player achieves a streak of 3 or more correct answers. The player SHALL hold at most 1 conflict at a time. The conflict MUST be thrown before the player's streak resets, otherwise it is lost.

#### Scenario: Conflict unlocked at streak 3
- **WHEN** player achieves streak of 3
- **THEN** UI shows a pulsing "💣 THROW CONFLICT" button and player holds 1 conflict

#### Scenario: Conflict lost on wrong answer
- **WHEN** player holds an unthrown conflict and answers incorrectly
- **THEN** streak resets to 0 and the held conflict is lost

#### Scenario: Only one conflict at a time
- **WHEN** player has streak 6 (two sets of 3) but has not thrown their first conflict
- **THEN** player still holds only 1 conflict (no stacking)

### Requirement: Target selection
The system SHALL present a target selection modal when the player activates the "Throw Conflict" button. The modal MUST show all other players with their nickname, current progress percentage, and status. The leading player SHALL be highlighted. Players currently under a conflict (is_conflicted = true) SHALL be shown as disabled and not targetable.

#### Scenario: Select target player
- **WHEN** player opens target selection and clicks on "ThanhPHP" who has 72% progress
- **THEN** system sends a conflict to "ThanhPHP" and closes the modal

#### Scenario: Cannot target conflicted player
- **WHEN** target selection shows "MinhFrontend" with "CONFLICTED" badge
- **THEN** "MinhFrontend" row is grayed out and not clickable

#### Scenario: Cancel target selection
- **WHEN** player presses ESC or clicks cancel in the target selection modal
- **THEN** modal closes, conflict is NOT thrown, player retains the conflict for later use

### Requirement: Conflict delivery
The system SHALL deliver a conflict to the targeted player immediately via broadcast. The targeted player's game state MUST transition to "conflicted" — they cannot answer regular tickets until the conflict is resolved. The conflict type SHALL be randomly selected: 50% chance "hard_puzzle", 50% chance "silly_task".

#### Scenario: Player receives conflict
- **WHEN** broadcast delivers a conflict to player "MinhFrontend"
- **THEN** player's screen shows full-screen "MERGE CONFLICT!" overlay with glitch/shake effects, and their game state transitions to "conflicted"

#### Scenario: Conflict type hard_puzzle
- **WHEN** conflict type is "hard_puzzle"
- **THEN** player is presented with a code challenge of higher difficulty than their current ticket level

#### Scenario: Conflict type silly_task
- **WHEN** conflict type is "silly_task"
- **THEN** player is presented with a long code comment string they MUST type exactly to resolve

### Requirement: Conflict resolution
The system SHALL allow the conflicted player to resolve their conflict by completing the challenge. Upon resolution, the player's state transitions back to normal gameplay. A broadcast message SHALL notify all players of the resolution.

#### Scenario: Resolve hard_puzzle conflict
- **WHEN** conflicted player answers the hard puzzle correctly
- **THEN** conflict is resolved, "CONFLICT RESOLVED ✓" animation plays, player returns to normal gameplay

#### Scenario: Resolve silly_task conflict
- **WHEN** conflicted player types the comment string with 100% accuracy
- **THEN** conflict is resolved and player returns to normal gameplay

#### Scenario: Failed conflict resolution attempt
- **WHEN** conflicted player answers hard puzzle incorrectly or types string with errors
- **THEN** player MUST retry the same conflict challenge (no progress penalty, just time lost)

### Requirement: Conflict immunity cooldown
The system SHALL grant 30 seconds of immunity to a player after they resolve a conflict. During immunity, the player cannot be targeted by new conflicts. The target selection UI SHALL show an "IMMUNE" badge on protected players.

#### Scenario: Immunity after resolution
- **WHEN** player resolves a conflict at timestamp T
- **THEN** player is immune to new conflicts until T + 30 seconds

#### Scenario: Immunity badge in target selection
- **WHEN** another player opens target selection and "MinhFrontend" has 15 seconds of immunity remaining
- **THEN** "MinhFrontend" shows "IMMUNE (15s)" badge and is not targetable

#### Scenario: Immunity expires
- **WHEN** 30 seconds pass since conflict resolution
- **THEN** player becomes targetable again and the IMMUNE badge disappears
