"use client";

import { motion } from "framer-motion";
import { formatTime } from "@/lib/utils";

interface CountdownTimerProps {
  timeRemaining: number; // seconds
  className?: string;
}

export function CountdownTimer({
  timeRemaining,
  className = "",
}: CountdownTimerProps) {
  const isUrgent = timeRemaining <= 120; // under 2 minutes
  const isCritical = timeRemaining <= 30;

  return (
    <motion.div
      className={`font-mono tabular-nums ${className}`}
      animate={
        isCritical
          ? { scale: [1, 1.05, 1], opacity: [1, 0.7, 1] }
          : isUrgent
            ? { opacity: [1, 0.8, 1] }
            : {}
      }
      transition={
        isCritical
          ? { duration: 0.5, repeat: Infinity }
          : isUrgent
            ? { duration: 1, repeat: Infinity }
            : {}
      }
    >
      <span
        className={`text-2xl font-bold ${
          isCritical
            ? "text-terminal-red glow-red"
            : isUrgent
              ? "text-terminal-yellow glow-yellow"
              : "text-terminal-text"
        }`}
      >
        {formatTime(timeRemaining)}
      </span>
    </motion.div>
  );
}
