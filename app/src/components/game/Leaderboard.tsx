"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GamePlayer } from "@/types/game";

interface LeaderboardProps {
  players: GamePlayer[];
  myPlayerId: string;
  finishedPlayers?: Set<string>;
}

export function Leaderboard({ players, myPlayerId, finishedPlayers }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.progress - a.progress);
  const leaderId = sorted[0]?.id;

  return (
    <div className="space-y-1">
      <p className="text-terminal-muted text-xs font-mono mb-3">
        // LEADERBOARD ({players.length})
      </p>
      <AnimatePresence>
        {sorted.map((player, rank) => {
          const isMe = player.id === myPlayerId;
          const isLeader = player.id === leaderId;
          const isFinished = finishedPlayers?.has(player.id);

          const barColor = player.isConflicted
            ? "bg-terminal-red/60"
            : isLeader
              ? "bg-terminal-yellow/70"
              : "bg-terminal-green/60";

          return (
            <motion.div
              key={player.id}
              layout
              layoutId={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`
                py-2 px-2 rounded space-y-1.5
                ${isMe ? "bg-terminal-green/8 border-l-2 border-terminal-green" : "hover:bg-terminal-card/50"}
              `}
            >
              {/* Row 1: Rank + Name + Icons */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-terminal-dim w-4 shrink-0 text-right">
                  {rank + 1}.
                </span>
                <span className={`truncate flex-1 ${isMe ? "text-terminal-yellow" : "text-terminal-text"}`}>
                  {player.nickname}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {isLeader && <span className="text-[10px]">👑</span>}
                  {player.streak >= 3 && <span className="text-[10px]">🔥</span>}
                  {player.isConflicted && <span className="text-[10px]">⚠️</span>}
                  {player.isImmune && <span className="text-[10px]">🛡️</span>}
                  {isFinished && <span className="text-[10px]">✅</span>}
                </div>
              </div>

              {/* Row 2: Progress bar + percentage */}
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-terminal-border/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${barColor}`}
                    initial={false}
                    animate={{ width: `${Math.min(100, Math.max(0, player.progress))}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
                <span className={`text-[10px] font-mono tabular-nums w-8 text-right shrink-0 ${
                  isLeader ? "text-terminal-yellow" : "text-terminal-muted"
                }`}>
                  {player.progress.toFixed(0)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
