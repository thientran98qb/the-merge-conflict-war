"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ConflictThrowPayload } from "@/types/game";
import type { Ticket } from "@/types/database";
import { TerminalInput, TerminalButton, CodeBlock } from "@/components/ui";
import { MultipleChoiceTicket } from "./MultipleChoiceTicket";

interface ConflictOverlayProps {
  conflict: ConflictThrowPayload;
  onResolve: () => void;
}

export function ConflictOverlay({ conflict, onResolve }: ConflictOverlayProps) {
  const [typedText, setTypedText] = useState("");
  const [resolved, setResolved] = useState(false);

  const handleSillyTaskSubmit = () => {
    const target = conflict.challenge.content;
    const accuracy =
      (target.split("").filter((c, i) => c === typedText[i]).length /
        target.length) *
      100;

    if (accuracy >= 85) {
      setResolved(true);
      setTimeout(onResolve, 1000);
    }
  };

  const handleHardPuzzleAnswer = (answer: string) => {
    const ticket = conflict.challenge.ticket;
    if (!ticket) return;

    const isCorrect =
      answer.toUpperCase().trim() ===
      (ticket.correct_answer as string).toUpperCase().trim();

    if (isCorrect) {
      setResolved(true);
      setTimeout(onResolve, 1000);
    }
    // Wrong answer: they can try again
  };

  if (resolved) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-terminal-bg/95"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <span className="text-4xl text-terminal-green glow-green font-bold">
            CONFLICT RESOLVED ✓
          </span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center animate-shake"
      style={{
        background:
          "repeating-linear-gradient(45deg, rgba(248,81,73,0.03) 0px, rgba(248,81,73,0.03) 10px, transparent 10px, transparent 20px)",
        backgroundColor: "rgba(13, 17, 23, 0.97)",
      }}
    >
      <div className="w-full max-w-xl px-4 space-y-6 bg-terminal-surface/80 border border-terminal-red/30 rounded-lg p-6 shadow-2xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold text-terminal-red glow-red animate-glitch">
            MERGE CONFLICT!
          </h1>
          <p className="text-terminal-yellow text-sm">
            ⚔️ Thrown by{" "}
            <span className="font-bold">{conflict.fromNickname}</span>
          </p>
        </motion.div>

        {/* Hazard stripes border */}
        <div
          className="border-2 border-terminal-red/50 p-6"
          style={{
            borderImage:
              "repeating-linear-gradient(45deg, #ff0040 0px, #ff0040 10px, #ffd700 10px, #ffd700 20px) 10",
          }}
        >
          {conflict.challenge.type === "hard_puzzle" &&
            conflict.challenge.ticket && (
              <div>
                <p className="text-terminal-red text-xs mb-4">
                  // Resolve this conflict to continue
                </p>
                <MultipleChoiceTicket
                  ticket={conflict.challenge.ticket}
                  onAnswer={handleHardPuzzleAnswer}
                />
              </div>
            )}

          {conflict.challenge.type === "silly_task" && (
            <div className="space-y-4">
              <p className="text-terminal-red text-xs">
                // Type this comment EXACTLY to resolve:
              </p>
              <CodeBlock
                code={conflict.challenge.content}
                showLineNumbers={false}
              />
              <TerminalInput
                placeholder="Type the comment exactly..."
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSillyTaskSubmit();
                }}
              />
              <div className="flex justify-between items-center">
                <span className="text-terminal-dim text-xs">
                  Accuracy:{" "}
                  {typedText.length > 0
                    ? (
                        (conflict.challenge.content
                          .split("")
                          .filter((c, i) => c === typedText[i]).length /
                          conflict.challenge.content.length) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </span>
                <TerminalButton
                  variant="red"
                  size="sm"
                  onClick={handleSillyTaskSubmit}
                  disabled={typedText.length < 10}
                >
                  Resolve Conflict
                </TerminalButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
