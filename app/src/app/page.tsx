"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TerminalText, TerminalButton, TerminalInput } from "@/components/ui";

export default function LandingPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleJoinWithCode = () => {
    const code = roomCode.toUpperCase().trim();
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError("Room code must be 6 alphanumeric characters.");
      return;
    }
    setError("");
    router.push(`/room/${code}/join`);
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(63,185,80,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(63,185,80,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-terminal-bg)_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-lg w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-terminal-green glow-green animate-glitch tracking-wider leading-tight">
            THE MERGE
            <br />
            CONFLICT WAR
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <TerminalText
            text="Race to merge your code into production. Survive the conflicts."
            typing
            typingSpeed={30}
            color="muted"
            as="p"
            className="text-center text-sm"
          />
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3 w-full max-w-sm"
        >
          <TerminalButton
            variant="green"
            size="lg"
            className="w-full"
            onClick={() => router.push("/room/create")}
          >
            CREATE ROOM
          </TerminalButton>

          <TerminalButton
            variant="blue"
            size="lg"
            className="w-full"
            onClick={() => {
              if (roomCode.trim()) {
                handleJoinWithCode();
              } else {
                document.getElementById("room-code-input")?.focus();
              }
            }}
          >
            JOIN ROOM
          </TerminalButton>
        </motion.div>

        {/* Room code input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="w-full max-w-sm"
        >
          <TerminalInput
            id="room-code-input"
            placeholder="ENTER ROOM CODE"
            value={roomCode}
            onChange={(e) => {
              setRoomCode(e.target.value.toUpperCase().slice(0, 6));
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && roomCode.trim()) {
                handleJoinWithCode();
              }
            }}
            error={error}
            prefix=">"
            maxLength={6}
            className="text-center tracking-[0.5em] text-lg uppercase"
          />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-terminal-dim text-xs"
        >
          Built with Next.js + Supabase
        </motion.p>
      </div>
    </div>
  );
}
