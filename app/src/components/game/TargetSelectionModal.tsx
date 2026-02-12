"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GamePlayer } from "@/types/game";
import { ProgressBar } from "@/components/ui";

interface TargetSelectionModalProps {
  players: GamePlayer[];
  myPlayerId: string;
  onSelect: (targetId: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function TargetSelectionModal({
  players,
  myPlayerId,
  onSelect,
  onCancel,
  isOpen,
}: TargetSelectionModalProps) {
  // Sort by progress descending
  const targets = players
    .filter((p) => p.id !== myPlayerId && !p.isConflicted && !p.isImmune)
    .sort((a, b) => b.progress - a.progress);

  const leader = targets[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md mx-4 border border-terminal-red/40 bg-terminal-surface rounded-lg p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-terminal-red glow-red">
                💣 SELECT TARGET
              </h2>
              <p className="text-terminal-dim text-xs mt-1">
                Choose who receives the merge conflict
              </p>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {targets.map((player) => (
                <motion.button
                  key={player.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(player.id)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-terminal-border rounded-md hover:border-terminal-red/50 hover:bg-terminal-red/5 transition-all text-left bg-terminal-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-terminal-text font-mono">
                      {player.nickname}
                    </span>
                    {player.id === leader?.id && (
                      <span className="text-xs text-terminal-yellow border border-terminal-yellow/40 bg-terminal-yellow/10 px-1.5 py-0.5 rounded">
                        LEADING
                      </span>
                    )}
                  </div>
                  <ProgressBar
                    progress={player.progress}
                    compact
                    isLeader={player.id === leader?.id}
                  />
                </motion.button>
              ))}

              {targets.length === 0 && (
                <p className="text-terminal-dim text-sm text-center py-4">
                  No valid targets (all conflicted or immune)
                </p>
              )}
            </div>

            <button
              onClick={onCancel}
              className="w-full text-terminal-dim text-sm font-mono hover:text-terminal-text py-2 transition-colors"
            >
              {"< Cancel"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
