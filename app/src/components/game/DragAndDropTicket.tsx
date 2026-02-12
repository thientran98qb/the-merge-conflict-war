"use client";

import { useState, useCallback } from "react";
import { motion, Reorder } from "framer-motion";
import type { Ticket } from "@/types/database";
import { TerminalButton } from "@/components/ui";

interface DragAndDropTicketProps {
  ticket: Ticket;
  onAnswer: (answer: string[]) => void;
  disabled?: boolean;
}

export function DragAndDropTicket({
  ticket,
  onAnswer,
  disabled = false,
}: DragAndDropTicketProps) {
  const correctOrder = ticket.correct_answer as string[];
  // Shuffle the lines initially
  const [lines, setLines] = useState(() => {
    const shuffled = [...correctOrder];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (disabled || submitted) return;
    setSubmitted(true);
    onAnswer(lines);
  }, [disabled, submitted, lines, onAnswer]);

  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div>
        <h3 className="text-terminal-yellow text-lg font-bold">{ticket.title}</h3>
        <p className="text-terminal-text text-sm mt-1">{ticket.description}</p>
        <p className="text-terminal-dim text-xs mt-1">
          Drag lines to reorder them correctly
        </p>
      </div>

      {/* Reorderable lines */}
      <Reorder.Group
        axis="y"
        values={lines}
        onReorder={disabled || submitted ? () => {} : setLines}
        className="space-y-1"
      >
        {lines.map((line, i) => (
          <Reorder.Item
            key={line}
            value={line}
            className={`
              flex items-center gap-2 px-3 py-2 font-mono text-sm border rounded
              ${
                submitted
                  ? "border-terminal-border cursor-default"
                  : "border-terminal-border cursor-grab active:cursor-grabbing hover:border-terminal-green/50 hover:bg-terminal-card"
              }
              bg-terminal-surface
            `}
          >
            <span className="text-terminal-dim w-6 text-right shrink-0">
              {i + 1}.
            </span>
            <motion.code className="text-terminal-text whitespace-pre">
              {line}
            </motion.code>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Submit */}
      <TerminalButton
        variant="green"
        size="md"
        className="w-full"
        onClick={handleSubmit}
        disabled={disabled || submitted}
      >
        $ git commit --push
      </TerminalButton>
    </div>
  );
}
