"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TerminalText, TerminalButton, TerminalInput } from "@/components/ui";

export default function JoinRoomPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      setError("Nickname must be 2-20 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmedNickname }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join room.");
        return;
      }

      // Store player info in sessionStorage
      sessionStorage.setItem("playerId", data.player.id);
      sessionStorage.setItem("playerNickname", data.player.nickname);
      sessionStorage.setItem("roomId", data.room.id);
      sessionStorage.setItem("isHost", "false");

      // Navigate to lobby
      router.push(`/room/${code}/lobby`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <TerminalText
            text={`$ git checkout ${code}`}
            color="green"
            glowing
            as="h1"
            className="text-xl"
          />
          <TerminalText
            text="Join the battle"
            color="dim"
            as="p"
            className="text-sm"
          />
        </div>

        {/* Room code display */}
        <div className="text-center border border-terminal-dim/30 py-4 bg-terminal-surface">
          <TerminalText text="Room Code" color="dim" as="p" className="text-xs mb-1" />
          <span className="text-3xl font-bold text-terminal-green tracking-[0.3em] glow-green">
            {code}
          </span>
        </div>

        {/* Nickname input */}
        <TerminalInput
          label="// Your nickname"
          placeholder="Enter nickname"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value.slice(0, 20));
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleJoin();
          }}
          error={error}
        />

        {/* Submit */}
        <TerminalButton
          variant="green"
          size="lg"
          className="w-full"
          onClick={handleJoin}
          loading={loading}
          disabled={!nickname.trim()}
        >
          $ git merge --join
        </TerminalButton>

        {/* Back */}
        <TerminalButton
          variant="red"
          size="sm"
          className="w-full"
          prefix="<"
          onClick={() => router.push("/")}
        >
          Back
        </TerminalButton>
      </motion.div>
    </div>
  );
}
