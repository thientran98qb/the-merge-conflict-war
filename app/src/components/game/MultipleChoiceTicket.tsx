"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Ticket } from "@/types/database";
import { CodeBlock } from "@/components/ui";

interface MultipleChoiceTicketProps {
  ticket: Ticket;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function MultipleChoiceTicket({
  ticket,
  onAnswer,
  disabled = false,
}: MultipleChoiceTicketProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (disabled || selected) return;
    const letter = option.charAt(0);
    setSelected(letter);
    onAnswer(letter);
  };

  return (
    <div className="space-y-5">
      {/* Title & Description */}
      <div>
        <h3 className="text-terminal-yellow text-lg font-bold">{ticket.title}</h3>
        <p className="text-terminal-muted text-sm mt-1">{ticket.description}</p>
      </div>

      {/* Code Snippet */}
      <CodeBlock code={ticket.code_snippet} language={ticket.topic === "php" ? "php" : "javascript"} />

      {/* Options */}
      <div className="grid gap-2">
        {ticket.options?.map((option, i) => {
          const letter = option.charAt(0);
          const isSelected = selected === letter;

          return (
            <motion.button
              key={i}
              whileHover={!disabled && !selected ? { scale: 1.01 } : {}}
              whileTap={!disabled && !selected ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(option)}
              disabled={disabled || !!selected}
              className={`
                text-left px-4 py-3 font-mono text-sm border transition-all rounded-md
                ${
                  isSelected
                    ? "border-terminal-green bg-terminal-green/15 text-terminal-green"
                    : "border-terminal-border bg-terminal-surface text-terminal-text hover:border-terminal-green/50 hover:bg-terminal-card"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <code className="whitespace-pre-wrap">{option}</code>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
