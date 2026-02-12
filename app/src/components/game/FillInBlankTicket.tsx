"use client";

import { useState } from "react";
import type { Ticket } from "@/types/database";
import { CodeBlock, TerminalInput, TerminalButton } from "@/components/ui";

interface FillInBlankTicketProps {
  ticket: Ticket;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function FillInBlankTicket({
  ticket,
  onAnswer,
  disabled = false,
}: FillInBlankTicketProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (disabled || submitted || !answer.trim()) return;
    setSubmitted(true);
    onAnswer(answer.trim());
  };

  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div>
        <h3 className="text-terminal-yellow text-lg font-bold">{ticket.title}</h3>
        <p className="text-terminal-text text-sm mt-1">{ticket.description}</p>
      </div>

      {/* Code Snippet */}
      <CodeBlock code={ticket.code_snippet} language={ticket.topic === "php" ? "php" : "javascript"} />

      {/* Answer Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <TerminalInput
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            disabled={disabled || submitted}
          />
        </div>
        <TerminalButton
          variant="green"
          size="md"
          onClick={handleSubmit}
          disabled={disabled || submitted || !answer.trim()}
        >
          Submit
        </TerminalButton>
      </div>
    </div>
  );
}
