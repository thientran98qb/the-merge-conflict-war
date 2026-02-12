"use client";

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "php",
  highlightLines = [],
  showLineNumbers = true,
  className = "",
}: CodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div
      className={`bg-terminal-card border border-terminal-border rounded-md overflow-x-auto ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-terminal-surface border-b border-terminal-border rounded-t-md">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-terminal-red/70" />
          <span className="w-3 h-3 rounded-full bg-terminal-yellow/70" />
          <span className="w-3 h-3 rounded-full bg-terminal-green/70" />
        </div>
        <span className="text-terminal-dim text-xs font-mono ml-2">
          {language}
        </span>
      </div>

      {/* Code content */}
      <pre className="p-4 font-mono text-sm leading-6 overflow-x-auto">
        <code>
          {lines.map((line, i) => {
            const lineNumber = i + 1;
            const isHighlighted = highlightLines.includes(lineNumber);

            return (
              <div
                key={i}
                className={`flex ${
                  isHighlighted
                    ? "bg-terminal-red/10 border-l-2 border-terminal-red -ml-[2px]"
                    : ""
                }`}
              >
                {showLineNumbers && (
                  <span
                    className={`select-none w-8 text-right pr-4 shrink-0 ${
                      isHighlighted
                        ? "text-terminal-red"
                        : "text-terminal-dim"
                    }`}
                  >
                    {lineNumber}
                  </span>
                )}
                <span className="text-terminal-text whitespace-pre">
                  {line}
                </span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
