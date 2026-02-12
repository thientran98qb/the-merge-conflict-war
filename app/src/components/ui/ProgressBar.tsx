"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number; // 0-100
  nickname?: string;
  isLeader?: boolean;
  isConflicted?: boolean;
  isImmune?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  nickname,
  isLeader = false,
  isConflicted = false,
  isImmune = false,
  compact = false,
  className = "",
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const barWidth = compact ? 20 : 30;
  const filled = Math.round((clampedProgress / 100) * barWidth);
  const empty = barWidth - filled;

  const barColor = isConflicted
    ? "text-terminal-red"
    : isLeader
      ? "text-terminal-yellow"
      : "text-terminal-green";

  const glowClass = isLeader ? "glow-yellow" : "";

  return (
    <div className={`font-mono text-sm flex items-center gap-2 ${className}`}>
      {nickname && (
        <span className="text-terminal-text w-20 truncate text-right">
          {nickname}
        </span>
      )}
      <span className="text-terminal-dim">[</span>
      <motion.span
        className={`${barColor} ${glowClass}`}
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {"█".repeat(filled)}
        <span className="text-terminal-dim">{"░".repeat(empty)}</span>
      </motion.span>
      <span className="text-terminal-dim">]</span>
      <motion.span
        className={`${barColor} w-12 text-right tabular-nums`}
        key={clampedProgress}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {clampedProgress.toFixed(0)}%
      </motion.span>
      {isLeader && <span className="text-terminal-yellow text-xs">👑</span>}
      {isConflicted && <span className="text-terminal-red text-xs">⚠️</span>}
      {isImmune && <span className="text-terminal-blue text-xs">🛡️</span>}
    </div>
  );
}
