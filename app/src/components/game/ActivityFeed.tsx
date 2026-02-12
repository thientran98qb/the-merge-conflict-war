"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ActivityEntry } from "@/types/game";

interface ActivityFeedProps {
  entries: ActivityEntry[];
}

const ENTRY_ICONS: Record<ActivityEntry["type"], string> = {
  correct_answer: "✓",
  wrong_answer: "✗",
  streak: "🔥",
  conflict_throw: "💣",
  conflict_resolve: "✓",
  player_joined: "+",
  player_left: "-",
  game_start: "▶",
  game_end: "■",
  win: "🏆",
};

const ENTRY_COLORS: Record<ActivityEntry["type"], string> = {
  correct_answer: "text-terminal-green",
  wrong_answer: "text-terminal-red",
  streak: "text-terminal-yellow",
  conflict_throw: "text-terminal-red",
  conflict_resolve: "text-terminal-green",
  player_joined: "text-terminal-blue",
  player_left: "text-terminal-dim",
  game_start: "text-terminal-green",
  game_end: "text-terminal-yellow",
  win: "text-terminal-yellow",
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <div className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-200px)]">
      <p className="text-terminal-muted text-xs font-mono mb-3">
        // ACTIVITY LOG
      </p>
      <AnimatePresence>
        {entries.slice(0, 50).map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: 20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            className="font-mono text-xs leading-5"
          >
            <span className="text-terminal-dim">[{formatTimestamp(entry.timestamp)}]</span>{" "}
            <span className={ENTRY_COLORS[entry.type]}>
              {ENTRY_ICONS[entry.type]}
            </span>{" "}
            <span className="text-terminal-muted">{entry.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
