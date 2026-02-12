"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalText, TerminalButton } from "@/components/ui";

interface PlayerInfo {
  id: string;
  nickname: string;
  joined_at: string;
}

interface RoomInfo {
  id: string;
  room_code: string;
  topic: string;
  duration_minutes: number;
  status: string;
}

const MIN_PLAYERS_AUTO = 3;
const MIN_PLAYERS_MANUAL = 2;
const AUTO_COUNTDOWN = 10;
const MANUAL_COUNTDOWN = 5;

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const playerId = typeof window !== "undefined" ? sessionStorage.getItem("playerId") : null;
  const isHost = typeof window !== "undefined" ? sessionStorage.getItem("isHost") === "true" : false;

  // Fetch room info
  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}/status`);
      const data = await res.json();
      if (res.ok && data.room) {
        setRoom({
          id: data.room.id,
          room_code: data.room.room_code,
          topic: data.room.topic,
          duration_minutes: data.room.duration_minutes,
          status: data.room.status,
        });
        setPlayers(data.room.players || []);

        // If game already started, redirect to play
        if (data.room.status === "playing") {
          router.push(`/room/${code}/play`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch room:", error);
    } finally {
      setLoading(false);
    }
  }, [code, router]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Poll for lobby updates (player joins, game start) every 3 seconds
  // This is the primary mechanism - no Supabase Realtime dependency
  useEffect(() => {
    if (!room?.id) return;

    const interval = setInterval(() => {
      fetchRoom();
    }, 3000);

    return () => clearInterval(interval);
  }, [room?.id, fetchRoom]);

  // Auto-start countdown when enough players (host-only triggers the PATCH)
  useEffect(() => {
    if (isHost && players.length >= MIN_PLAYERS_AUTO && countdown === null) {
      startCountdown(AUTO_COUNTDOWN);
    } else if (players.length < MIN_PLAYERS_AUTO && countdown !== null) {
      cancelCountdown();
    }
  }, [players.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current!);
          handleStartGame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  };

  const handleManualStart = () => {
    if (isHost && players.length >= MIN_PLAYERS_MANUAL) {
      cancelCountdown();
      startCountdown(MANUAL_COUNTDOWN);
    }
  };

  const handleStartGame = async () => {
    try {
      await fetch(`/api/rooms/${code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "playing" }),
      });
      router.push(`/room/${code}/play`);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <TerminalText text="Loading room..." typing color="green" as="p" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-terminal-bg flex flex-col items-center justify-center gap-4">
        <TerminalText text="// ERROR: Room not found" color="red" as="p" />
        <TerminalButton variant="green" onClick={() => router.push("/")}>
          Back to Home
        </TerminalButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg space-y-6"
      >
        {/* Room Code */}
        <div className="text-center space-y-2">
          <TerminalText text="// WAITING ROOM" color="dim" as="p" className="text-xs" />
          <button
            onClick={copyRoomCode}
            className="text-5xl font-bold text-terminal-green tracking-[0.4em] glow-green hover:scale-105 transition-transform cursor-pointer"
          >
            {code}
          </button>
          <p className="text-terminal-dim text-xs">
            {copied ? "✓ Copied!" : "Click to copy room code"}
          </p>
        </div>

        {/* Game Settings */}
        <div className="border border-terminal-border bg-terminal-surface p-4 font-mono text-sm space-y-2 rounded-md">
          <div className="flex justify-between">
            <span className="text-terminal-muted">topic:</span>
            <span className="text-terminal-blue">{room.topic}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-muted">duration:</span>
            <span className="text-terminal-blue">{room.duration_minutes} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-muted">players:</span>
            <span className="text-terminal-yellow">{players.length}/10</span>
          </div>
        </div>

        {/* Player List */}
        <div className="border border-terminal-border bg-terminal-surface p-4 rounded-md">
          <TerminalText
            text={`// Connected players (${players.length})`}
            color="dim"
            as="p"
            className="text-xs mb-3"
          />
          <AnimatePresence>
            {players
              .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime())
              .map((player, i) => {
                const isFirstPlayer = i === 0; // first player = room creator = host
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 py-1 font-mono text-sm"
                  >
                    <span className="text-terminal-green">{">"}</span>
                    <span
                      className={
                        player.id === playerId
                          ? "text-terminal-yellow"
                          : "text-terminal-text"
                      }
                    >
                      {player.nickname}
                    </span>
                    {isFirstPlayer && (
                      <span className="text-xs text-terminal-purple border border-terminal-purple/40 bg-terminal-purple/10 px-1.5 py-0.5 rounded">
                        HOST
                      </span>
                    )}
                    {player.id === playerId && (
                      <span className="text-terminal-dim text-xs">(you)</span>
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {/* Countdown */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <p className="text-terminal-dim text-sm">Game starting in</p>
              <motion.span
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-terminal-red glow-red"
              >
                {countdown}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="space-y-2">
          {isHost && countdown === null && players.length >= MIN_PLAYERS_MANUAL && (
            <TerminalButton
              variant="green"
              size="lg"
              className="w-full"
              onClick={handleManualStart}
            >
              $ git push --force (Start Game)
            </TerminalButton>
          )}

          {!isHost && players.length >= MIN_PLAYERS_MANUAL && countdown === null && (
            <div className="text-center text-terminal-muted text-sm font-mono border border-terminal-border bg-terminal-surface p-3 rounded-md">
              <span className="text-terminal-yellow">⏳</span> Waiting for host to start the game...
            </div>
          )}

          {players.length < MIN_PLAYERS_MANUAL && (
            <div className="text-center text-terminal-dim text-sm font-mono">
              Waiting for at least {MIN_PLAYERS_MANUAL} players...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
