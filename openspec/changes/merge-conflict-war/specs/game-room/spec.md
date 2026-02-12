## ADDED Requirements

### Requirement: Create game room
The system SHALL allow a user to create a new game room by selecting a topic (PHP, Frontend, or Mix) and a duration (10 or 15 minutes). The system SHALL generate a unique 6-character alphanumeric room code and return it to the creator.

#### Scenario: Successful room creation
- **WHEN** user selects topic "PHP" and duration "10" and submits the create room form
- **THEN** system creates a new room with status "waiting", generates a unique 6-character room code, triggers AI ticket generation, and returns the room code to the user

#### Scenario: Room code uniqueness
- **WHEN** system generates a room code that already exists in the database
- **THEN** system SHALL regenerate a new code until a unique one is found

### Requirement: Join game room
The system SHALL allow a player to join an existing room by entering a valid room code and a nickname. The nickname MUST be between 2 and 20 characters. The system SHALL reject duplicate nicknames within the same room.

#### Scenario: Successful join
- **WHEN** player enters valid room code "A7X92K" and nickname "NhatDev" and the room has status "waiting"
- **THEN** system adds the player to the room and broadcasts the join event to all connected players

#### Scenario: Join with invalid room code
- **WHEN** player enters room code "ZZZZZZ" that does not exist
- **THEN** system displays an error "Room not found"

#### Scenario: Join with duplicate nickname
- **WHEN** player enters nickname "NhatDev" and another player with that nickname is already in the room
- **THEN** system displays an error "Nickname already taken in this room"

#### Scenario: Join after game started
- **WHEN** player enters valid room code but room status is "playing" or "finished"
- **THEN** system displays an error "Game already in progress"

### Requirement: Room player limit
The system SHALL enforce a maximum of 10 players per room. The system SHALL require a minimum of 2 players to start a game.

#### Scenario: Room is full
- **WHEN** player attempts to join a room that already has 10 players
- **THEN** system displays an error "Room is full (10/10)"

#### Scenario: Not enough players to start
- **WHEN** room has fewer than 2 players and a start attempt is made
- **THEN** system SHALL not start the game and display "Need at least 2 players"

### Requirement: Auto-start game
The system SHALL automatically start a countdown of 10 seconds when 3 or more players have joined. Any player MAY also manually trigger the start if 2 or more players are present. When the countdown reaches zero, the game transitions to "playing" status.

#### Scenario: Auto-start countdown
- **WHEN** the 3rd player joins the room
- **THEN** system starts a 10-second countdown visible to all players, after which the game begins

#### Scenario: Manual start with 2 players
- **WHEN** any player clicks the start button and the room has 2 players
- **THEN** system starts a 5-second countdown and then begins the game

#### Scenario: Countdown cancelled by player leaving
- **WHEN** auto-start countdown is active and a player leaves reducing count below 3
- **THEN** system cancels the countdown

### Requirement: Room lifecycle
The system SHALL manage room status transitions: waiting → playing → finished. A room in "finished" status SHALL NOT accept new actions. Room data is ephemeral and MAY be cleaned up after the game ends.

#### Scenario: Game starts
- **WHEN** countdown reaches zero
- **THEN** room status transitions to "playing", `started_at` timestamp is set, and all players begin receiving tickets

#### Scenario: Game ends by timer
- **WHEN** the game timer reaches zero
- **THEN** room status transitions to "finished" and the results screen is shown to all players

#### Scenario: Game ends by winner
- **WHEN** any player reaches 100% progress
- **THEN** room status transitions to "finished" immediately and results are shown
