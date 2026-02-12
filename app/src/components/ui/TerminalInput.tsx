"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface TerminalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ label, error, prefix = "$", className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-terminal-muted text-sm font-mono">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2 border border-terminal-border bg-terminal-surface px-4 py-2.5 rounded-md focus-within:border-terminal-green/70 focus-within:ring-1 focus-within:ring-terminal-green/20 transition-all">
          <span className="text-terminal-green font-mono text-sm shrink-0">
            {prefix}
          </span>
          <input
            ref={ref}
            className={`
              w-full bg-transparent font-mono text-terminal-text
              outline-none placeholder:text-terminal-dim
              caret-terminal-green
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-terminal-red text-xs font-mono">
            {`// ERROR: ${error}`}
          </span>
        )}
      </div>
    );
  }
);

TerminalInput.displayName = "TerminalInput";
