"use client";

import { motion } from "framer-motion";

interface TerminalButtonProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "blue" | "yellow";
  size?: "sm" | "md" | "lg";
  prefix?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  id?: string;
}

const variantStyles = {
  green: {
    base: "border-terminal-green/60 text-terminal-green bg-terminal-green/10",
    hover: "hover:bg-terminal-green/20 hover:border-terminal-green",
    shadow: "hover:shadow-[0_0_20px_rgba(63,185,80,0.15)]",
  },
  red: {
    base: "border-terminal-red/60 text-terminal-red bg-terminal-red/10",
    hover: "hover:bg-terminal-red/20 hover:border-terminal-red",
    shadow: "hover:shadow-[0_0_20px_rgba(248,81,73,0.15)]",
  },
  blue: {
    base: "border-terminal-blue/60 text-terminal-blue bg-terminal-blue/10",
    hover: "hover:bg-terminal-blue/20 hover:border-terminal-blue",
    shadow: "hover:shadow-[0_0_20px_rgba(88,166,255,0.15)]",
  },
  yellow: {
    base: "border-terminal-yellow/60 text-terminal-yellow bg-terminal-yellow/10",
    hover: "hover:bg-terminal-yellow/20 hover:border-terminal-yellow",
    shadow: "hover:shadow-[0_0_20px_rgba(227,179,65,0.15)]",
  },
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm rounded",
  md: "px-6 py-3 text-base rounded-md",
  lg: "px-8 py-4 text-lg rounded-md",
};

export function TerminalButton({
  children,
  variant = "green",
  size = "md",
  prefix = ">",
  loading = false,
  disabled,
  className = "",
  onClick,
  id,
}: TerminalButtonProps) {
  const style = variantStyles[variant];

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        font-mono border ${style.base}
        ${style.hover} ${style.shadow}
        ${sizeStyles[size]}
        cursor-pointer
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      id={id}
    >
      <span className="text-terminal-dim">{prefix} </span>
      {loading ? (
        <span className="inline-flex items-center gap-1">
          <LoadingDots />
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
