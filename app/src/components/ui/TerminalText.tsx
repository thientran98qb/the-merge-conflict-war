"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TerminalTextProps {
  text: string;
  className?: string;
  typing?: boolean;
  typingSpeed?: number;
  glowing?: boolean;
  color?: "green" | "red" | "yellow" | "blue" | "dim" | "muted";
  prefix?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

const colorMap = {
  green: "text-terminal-green",
  red: "text-terminal-red",
  yellow: "text-terminal-yellow",
  blue: "text-terminal-blue",
  dim: "text-terminal-dim",
  muted: "text-terminal-muted",
};

const glowMap = {
  green: "glow-green",
  red: "glow-red",
  yellow: "glow-yellow",
  blue: "glow-blue",
  dim: "",
  muted: "",
};

export function TerminalText({
  text,
  className = "",
  typing = false,
  typingSpeed = 50,
  glowing = false,
  color = "green",
  prefix,
  as: Tag = "span",
}: TerminalTextProps) {
  const [displayText, setDisplayText] = useState(typing ? "" : text);
  const [showCursor, setShowCursor] = useState(typing);

  useEffect(() => {
    if (!typing) {
      setDisplayText(text);
      return;
    }

    setDisplayText("");
    setShowCursor(true);
    let i = 0;

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, typing, typingSpeed]);

  const colorClass = colorMap[color];
  const glowClass = glowing ? glowMap[color] : "";

  return (
    <Tag className={`font-mono ${colorClass} ${glowClass} ${className}`}>
      {prefix && <span className="text-terminal-dim">{prefix} </span>}
      {typing ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {displayText}
          {showCursor && (
            <span className="animate-cursor-blink border-r-2 border-terminal-green ml-0.5">
              &nbsp;
            </span>
          )}
        </motion.span>
      ) : (
        displayText
      )}
    </Tag>
  );
}
