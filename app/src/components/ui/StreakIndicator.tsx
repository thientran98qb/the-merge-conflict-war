"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StreakIndicatorProps {
  streak: number;
  conflictsHeld: number;
  className?: string;
}

export function StreakIndicator({
  streak,
  conflictsHeld,
  className = "",
}: StreakIndicatorProps) {
  const isConflictReady = streak >= 3 && conflictsHeld === 0;

  return (
    <div className={`flex items-center gap-2 font-mono text-sm ${className}`}>
      {/* Streak fire emojis */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.05, type: "spring" }}
          >
            🔥
          </motion.span>
        ))}
        {streak === 0 && (
          <span className="text-terminal-dim">no streak</span>
        )}
      </div>

      {/* Streak count */}
      {streak > 0 && (
        <span className="text-terminal-yellow tabular-nums">
          x{streak}
        </span>
      )}

      {/* Conflict ready indicator */}
      <AnimatePresence>
        {isConflictReady && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="text-terminal-red animate-pulse-glow font-bold text-xs border border-terminal-red/60 bg-terminal-red/10 px-2 py-0.5 rounded"
          >
            💣 CONFLICT READY!
          </motion.span>
        )}
      </AnimatePresence>

      {/* Conflict held indicator */}
      {conflictsHeld > 0 && (
        <span className="text-terminal-red text-xs">
          💣 x{conflictsHeld}
        </span>
      )}
    </div>
  );
}
