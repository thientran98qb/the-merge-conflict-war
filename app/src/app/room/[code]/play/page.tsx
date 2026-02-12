"use client";

import { useEffect, useReducer, useCallback, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  gameReducer,
  createInitialState,
  validateAnswer,
  useGameChannel,
} from "@/lib/game";
import { getRandomConflictChallenge } from "@/lib/ai/conflict-challenges";
import { TerminalButton, StreakIndicator } from "@/components/ui";
import {
  MultipleChoiceTicket,
  FillInBlankTicket,
  DragAndDropTicket,
  CountdownTimer,
} from "@/components/game";
import { Leaderboard } from "@/components/game/Leaderboard";
import { ActivityFeed } from "@/components/game/ActivityFeed";
import { ConflictOverlay } from "@/components/game/ConflictOverlay";
import { TargetSelectionModal } from "@/components/game/TargetSelectionModal";
import type { Ticket } from "@/types/database";
import type { BroadcastType, ActivityEntry, GamePlayer, ConflictThrowPayload } from "@/types/game";

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const playerId = typeof window !== "undefined" ? sessionStorage.getItem("playerId") || "" : "";
  const playerNickname = typeof window !== "undefined" ? sessionStorage.getItem("playerNickname") || "" : "";

  const [store, dispatch] = useReducer(
    gameReducer,
    playerId,
    createInitialState
  );

  const [showTargetModal, setShowTargetModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedIdCounter = useRef(0);
  const gameEndTriggeredRef = useRef(false);

  // Add activity entry helper
  const addActivity = (type: ActivityEntry["type"], message: string, actorId?: string) => {
    feedIdCounter.current++;
    const entry: ActivityEntry = {
      id: `feed-${feedIdCounter.current}`,
      type,
      message,
      timestamp: Date.now(),
      playerId: actorId,
    };
    dispatch({ type: "ADD_ACTIVITY", payload: entry });
  };

  // Handle incoming broadcast messages
  const handleMessage = (type: BroadcastType, payload: Record<string, unknown>, senderId: string) => {
    console.log(`[GameMessage] Received: ${type}`, payload);

    switch (type) {
      case "progress_update": {
        const progressPayload = payload as unknown as import("@/types/game").ProgressUpdatePayload;
        dispatch({
          type: "UPDATE_PLAYER",
          payload: progressPayload,
        });
        break;
      }

      case "conflict_throw": {
        const conflictData = payload as unknown as ConflictThrowPayload;
        console.log(`[Conflict] toPlayerId=${conflictData.toPlayerId}, myPlayerId=${playerId}, match=${conflictData.toPlayerId === playerId}`);

        if (conflictData.toPlayerId === playerId) {
          // Don't receive conflicts if already finished
          if (store.myFinished) {
            addActivity("conflict_throw", `${conflictData.fromNickname} tried to throw a conflict at you (blocked - already finished)`);
            break;
          }
          dispatch({
            type: "RECEIVE_CONFLICT",
            payload: conflictData,
          });
          addActivity("conflict_throw", `${conflictData.fromNickname} threw a conflict at you!`);
        } else {
          addActivity("conflict_throw", `${conflictData.fromNickname} → ${conflictData.toNickname || "someone"}`);
        }
        break;
      }

      case "conflict_resolve":
        dispatch({
          type: "UPDATE_PLAYER",
          payload: {
            playerId: (payload as Record<string, string>).playerId,
            progress: 0,
            streak: 0,
            totalCorrect: 0,
            totalWrong: 0,
            conflictsHeld: 0,
          },
        });
        addActivity("conflict_resolve", `Player resolved their conflict`);
        break;

      case "game_start":
        fetchAndStartGame();
        break;

      case "game_end": {
        const endPayload = payload as unknown as import("@/types/game").GameEndPayload;
        dispatch({ type: "GAME_OVER", payload: endPayload });
        setTimeout(() => {
          sessionStorage.setItem("gameResult", JSON.stringify(endPayload));
          router.push(`/room/${code}/results`);
        }, 2000);
        break;
      }

      case "player_finished": {
        const finishedId = (payload as Record<string, string>).playerId;
        const finishedNickname = (payload as Record<string, string>).nickname;
        dispatch({ type: "PLAYER_FINISHED", payload: { playerId: finishedId } });
        addActivity("correct_answer", `${finishedNickname || "A player"} finished all tickets! ✅`);
        break;
      }

      case "player_joined":
        dispatch({
          type: "PLAYER_JOINED",
          payload: payload as unknown as GamePlayer,
        });
        addActivity("player_joined", `${(payload as Record<string, string>).nickname} joined`);
        break;

      case "player_left":
        dispatch({ type: "PLAYER_LEFT", payload: { playerId: senderId } });
        addActivity("player_left", `Player left the game`);
        break;

      case "activity":
        addActivity(
          (payload as Record<string, string>).activityType as ActivityEntry["type"],
          (payload as Record<string, string>).message,
          senderId
        );
        break;
    }
  };

  const { broadcast, isSubscribed } = useGameChannel({
    roomCode: code,
    playerId,
    onMessage: handleMessage,
  });

  // Fetch room data and start game
  const fetchAndStartGame = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}/status`);
      const data = await res.json();

      if (data.room) {
        const tickets = data.room.tickets as Ticket[];
        const durationSec = data.room.duration_minutes * 60;

        let timeRemaining = durationSec;
        if (data.room.started_at) {
          const elapsed = Math.floor(
            (Date.now() - new Date(data.room.started_at).getTime()) / 1000
          );
          timeRemaining = Math.max(0, durationSec - elapsed);
        }

        dispatch({
          type: "START_GAME",
          payload: {
            tickets,
            duration: timeRemaining,
            startedAt: Date.now(),
          },
        });

        if (data.room.players) {
          for (const p of data.room.players) {
            dispatch({
              type: "PLAYER_JOINED",
              payload: {
                id: p.id,
                nickname: p.nickname,
                progress: p.progress || 0,
                streak: p.streak || 0,
                conflictsHeld: p.conflicts_held || 0,
                isConflicted: p.is_conflicted || false,
                isImmune: false,
                totalCorrect: p.total_correct || 0,
                totalWrong: p.total_wrong || 0,
                isOnline: true,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch game data:", error);
    }
  }, [code]);

  // Initial load
  useEffect(() => {
    fetchAndStartGame();
  }, [fetchAndStartGame]);

  // Timer
  useEffect(() => {
    if (store.state !== "PLAYING" && store.state !== "CONFLICTED" && store.state !== "FINISHED_WAITING") return;

    timerRef.current = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [store.state]);

  // Check timer expiry → game over for everyone
  useEffect(() => {
    if (
      (store.state === "PLAYING" || store.state === "CONFLICTED" || store.state === "FINISHED_WAITING") &&
      store.timeRemaining <= 0
    ) {
      handleGameEnd("timeout");
    }
  }, [store.timeRemaining, store.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // When I finish all tickets → broadcast "player_finished"
  useEffect(() => {
    if (store.myFinished && store.state === "FINISHED_WAITING") {
      broadcast("player_finished", {
        playerId,
        nickname: playerNickname,
      });
      // Also broadcast final progress
      broadcast("progress_update", {
        playerId,
        progress: store.myProgress,
        streak: store.myStreak,
        totalCorrect: store.myTotalCorrect,
        totalWrong: store.myTotalWrong,
        conflictsHeld: store.myConflictsHeld,
      });
      addActivity("correct_answer", `You finished all tickets! ✅`);
    }
  }, [store.myFinished, store.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if ALL players finished → trigger game end
  useEffect(() => {
    if (store.state === "GAME_OVER" || gameEndTriggeredRef.current) return;
    if (store.players.size === 0) return;

    // Check if every player in the room has finished
    const allPlayerIds = Array.from(store.players.keys());
    const allFinished = allPlayerIds.every((id) => store.finishedPlayers.has(id));

    if (allFinished && store.finishedPlayers.size >= store.players.size) {
      console.log("[Game] All players finished! Triggering game end.");
      gameEndTriggeredRef.current = true;
      handleGameEnd("winner");
    }
  }, [store.finishedPlayers, store.players, store.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check immunity expiry
  useEffect(() => {
    if (store.isImmune && Date.now() >= store.immuneUntil) {
      dispatch({
        type: "SET_IMMUNITY",
        payload: { until: 0 },
      });
    }
  }, [store.isImmune, store.immuneUntil, store.timeRemaining]);

  const handleGameEnd = async (reason: "winner" | "timeout") => {
    if (store.state === "GAME_OVER") return;

    // Merge local player's latest stats
    const playersMap = new Map(store.players);
    const localExisting = playersMap.get(playerId);
    if (localExisting) {
      playersMap.set(playerId, {
        ...localExisting,
        progress: store.myProgress,
        streak: store.myStreak,
        totalCorrect: store.myTotalCorrect,
        totalWrong: store.myTotalWrong,
        conflictsHeld: store.myConflictsHeld,
      });
    } else {
      playersMap.set(playerId, {
        id: playerId,
        nickname: playerNickname,
        progress: store.myProgress,
        streak: store.myStreak,
        totalCorrect: store.myTotalCorrect,
        totalWrong: store.myTotalWrong,
        conflictsHeld: store.myConflictsHeld,
        isConflicted: false,
        isImmune: false,
        isOnline: true,
      });
    }

    const players = Array.from(playersMap.values());
    const rankings = players
      .map((p) => ({
        playerId: p.id,
        nickname: p.nickname,
        progress: p.progress,
        totalCorrect: p.totalCorrect,
        totalWrong: p.totalWrong,
        accuracy:
          p.totalCorrect + p.totalWrong > 0
            ? (p.totalCorrect / (p.totalCorrect + p.totalWrong)) * 100
            : 0,
      }))
      .sort((a, b) => {
        if (b.progress !== a.progress) return b.progress - a.progress;
        return a.totalWrong - b.totalWrong;
      });

    const payload = {
      reason,
      winnerId: rankings[0]?.playerId,
      rankings,
    };

    dispatch({ type: "GAME_OVER", payload });

    await broadcast("game_end", payload as unknown as Record<string, unknown>);

    try {
      await fetch(`/api/rooms/${code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "finished" }),
      });
    } catch (err) {
      console.error("[GameEnd] Failed to update room status:", err);
    }

    setTimeout(() => {
      sessionStorage.setItem("gameResult", JSON.stringify(payload));
      router.push(`/room/${code}/results`);
    }, 2000);
  };

  const handleAnswer = async (answer: string | string[]) => {
    const ticket = store.tickets[store.currentTicketIndex];
    if (!ticket) return;

    const correct = validateAnswer(ticket, answer);

    // Progress = tickets answered / total tickets (always advances, regardless of correct/wrong)
    const ticketsAnswered = store.currentTicketIndex + 1;
    const newProgress = Math.round((ticketsAnswered / store.tickets.length) * 100);

    dispatch({
      type: "ANSWER_TICKET",
      payload: { correct, progress: newProgress },
    });

    setFeedbackMessage(correct ? "✓ CORRECT" : "✗ WRONG");
    setTimeout(() => setFeedbackMessage(null), 800);

    // Broadcast progress
    broadcast("progress_update", {
      playerId,
      progress: newProgress,
      streak: correct ? store.myStreak + 1 : 0,
      totalCorrect: store.myTotalCorrect + (correct ? 1 : 0),
      totalWrong: store.myTotalWrong + (correct ? 0 : 1),
      conflictsHeld: store.myConflictsHeld,
    });

    // Check streak milestone
    if (correct && (store.myStreak + 1) % 3 === 0) {
      broadcast("activity", {
        activityType: "streak",
        message: `${playerNickname} is on a ${store.myStreak + 1}x streak! 🔥`,
      });
    }

    // Auto advance to next ticket (may trigger FINISHED_WAITING if last ticket)
    setTimeout(() => {
      dispatch({ type: "NEXT_TICKET" });
    }, 500);
  };

  const handleThrowConflict = async (targetId: string) => {
    setShowTargetModal(false);

    const target = store.players.get(targetId);
    if (!target) return;

    const hardTickets = store.tickets.filter((t) => t.difficulty === "hard");
    const challenge = getRandomConflictChallenge(hardTickets);

    const conflictPayload: ConflictThrowPayload = {
      fromPlayerId: playerId,
      fromNickname: playerNickname,
      toPlayerId: targetId,
      toNickname: target.nickname,
      conflictType: challenge.type,
      challenge,
    };

    await broadcast("conflict_throw", conflictPayload as unknown as Record<string, unknown>);
    dispatch({ type: "USE_CONFLICT" });

    await broadcast("progress_update", {
      playerId,
      progress: store.myProgress,
      streak: 0,
      totalCorrect: store.myTotalCorrect,
      totalWrong: store.myTotalWrong,
      conflictsHeld: 0,
    });

    addActivity("conflict_throw", `You threw a conflict at ${target.nickname}! 💣`);
  };

  const handleResolveConflict = async () => {
    dispatch({ type: "RESOLVE_CONFLICT" });
    dispatch({ type: "SET_IMMUNITY", payload: { until: Date.now() + 30000 } });

    await broadcast("conflict_resolve", { playerId });
    broadcast("activity", {
      activityType: "conflict_resolve",
      message: `${playerNickname} resolved their conflict! 🛡️`,
    });
  };

  const currentTicket = store.tickets[store.currentTicketIndex];
  const playersArray = Array.from(store.players.values());
  const canThrowConflict = store.myStreak >= 3 && store.myConflictsHeld > 0 && !store.myFinished;
  const ticketNumber = store.currentTicketIndex + 1;
  const totalTickets = store.tickets.length;

  // Game Over screen
  if (store.state === "GAME_OVER") {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-4"
        >
          <span className="text-5xl">🏆</span>
          <h1 className="text-3xl font-bold text-terminal-yellow glow-yellow">
            GAME OVER
          </h1>
          <p className="text-terminal-dim">Calculating results...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg flex">
      {/* Conflict Overlay */}
      {store.state === "CONFLICTED" && store.currentConflict && (
        <ConflictOverlay
          conflict={store.currentConflict}
          onResolve={handleResolveConflict}
        />
      )}

      {/* Target Selection Modal */}
      <TargetSelectionModal
        players={playersArray}
        myPlayerId={playerId}
        onSelect={handleThrowConflict}
        onCancel={() => setShowTargetModal(false)}
        isOpen={showTargetModal}
      />

      {/* Left Sidebar: Leaderboard */}
      <div className="w-56 border-r border-terminal-border bg-terminal-surface/50 p-3 overflow-y-auto overflow-x-hidden shrink-0">
        <Leaderboard
          players={playersArray}
          myPlayerId={playerId}
          finishedPlayers={store.finishedPlayers}
        />
      </div>

      {/* Center: Game Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-terminal-border bg-terminal-surface/30">
          <div className="flex items-center gap-4">
            <CountdownTimer timeRemaining={store.timeRemaining} />
            <span className="text-terminal-muted text-xs font-mono">
              {ticketNumber > totalTickets ? totalTickets : ticketNumber}/{totalTickets}
            </span>
            <span className={`inline-block w-2 h-2 rounded-full ${isSubscribed ? "bg-terminal-green" : "bg-terminal-red animate-pulse"}`}
              title={isSubscribed ? "Connected" : "Connecting..."}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-terminal-yellow text-sm font-mono truncate max-w-40">
              {playerNickname}
            </span>
            <div className="text-terminal-green text-xl font-bold glow-green tabular-nums">
              {store.myProgress.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Ticket Area or Waiting Screen */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* FINISHED_WAITING: Player completed all tickets */}
          {store.state === "FINISHED_WAITING" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6"
            >
              <span className="text-6xl">✅</span>
              <h2 className="text-2xl font-bold text-terminal-green glow-green">
                ALL TICKETS COMPLETED!
              </h2>
              <p className="text-terminal-muted text-sm max-w-md">
                You answered all {totalTickets} tickets. Waiting for other players to finish...
              </p>
              <div className="border border-terminal-border bg-terminal-surface/50 p-4 rounded-md font-mono text-sm space-y-2 w-72">
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Progress:</span>
                  <span className="text-terminal-green">{store.myProgress.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Correct:</span>
                  <span className="text-terminal-green">{store.myTotalCorrect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Wrong:</span>
                  <span className="text-terminal-red">{store.myTotalWrong}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Players finished:</span>
                  <span className="text-terminal-yellow">
                    {store.finishedPlayers.size}/{store.players.size}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-terminal-dim text-xs">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ⏳
                </motion.span>
                <span>Time remaining: {Math.floor(store.timeRemaining / 60)}:{(store.timeRemaining % 60).toString().padStart(2, "0")}</span>
              </div>
            </motion.div>
          )}

          {/* PLAYING: Show current ticket */}
          {(store.state === "PLAYING" || store.state === "CONFLICTED") && (
            <>
              {/* Feedback overlay */}
              <AnimatePresence>
                {feedbackMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`text-center mb-4 text-lg font-bold ${
                      feedbackMessage.includes("CORRECT")
                        ? "text-terminal-green glow-green"
                        : "text-terminal-red glow-red"
                    }`}
                  >
                    {feedbackMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {currentTicket && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={store.currentTicketIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    {currentTicket.type === "multiple_choice" && (
                      <MultipleChoiceTicket
                        ticket={currentTicket}
                        onAnswer={(a) => handleAnswer(a)}
                        disabled={store.state !== "PLAYING"}
                      />
                    )}
                    {currentTicket.type === "fill_in_blank" && (
                      <FillInBlankTicket
                        ticket={currentTicket}
                        onAnswer={(a) => handleAnswer(a)}
                        disabled={store.state !== "PLAYING"}
                      />
                    )}
                    {currentTicket.type === "drag_and_drop" && (
                      <DragAndDropTicket
                        ticket={currentTicket}
                        onAnswer={(a) => handleAnswer(a)}
                        disabled={store.state !== "PLAYING"}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-terminal-border bg-terminal-surface/30">
          <StreakIndicator
            streak={store.myStreak}
            conflictsHeld={store.myConflictsHeld}
          />
          <div className="flex items-center gap-4">
            <span className="text-terminal-muted text-xs font-mono">
              <span className="text-terminal-green">✓{store.myTotalCorrect}</span>{" "}
              <span className="text-terminal-red">✗{store.myTotalWrong}</span>
            </span>
            {canThrowConflict && (
              <TerminalButton
                variant="red"
                size="sm"
                onClick={() => setShowTargetModal(true)}
              >
                💣 THROW CONFLICT
              </TerminalButton>
            )}
            {store.isImmune && (
              <span className="text-terminal-blue text-xs border border-terminal-blue/40 bg-terminal-blue/10 px-2 py-1 rounded">
                🛡️ IMMUNE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Activity Feed */}
      <div className="w-64 border-l border-terminal-border bg-terminal-surface/50 p-4 overflow-y-auto shrink-0">
        <ActivityFeed entries={store.activityFeed} />
      </div>
    </div>
  );
}
