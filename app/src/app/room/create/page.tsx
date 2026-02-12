"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TerminalText, TerminalButton, TerminalInput } from "@/components/ui";
import type { Topic } from "@/types/database";

const TOPICS: { value: Topic; label: string; icon: string }[] = [
  { value: "php", label: "PHP", icon: "🐘" },
  { value: "frontend", label: "Frontend", icon: "⚛️" },
  { value: "mix", label: "Mix", icon: "🔀" },
];

const DURATIONS = [
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
];

export default function CreateRoomPage() {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic>("mix");
  const [duration, setDuration] = useState(10);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      setError("Nickname must be 2-20 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          durationMinutes: duration,
          nickname: trimmedNickname,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create room.");
        return;
      }

      sessionStorage.setItem("playerId", data.player.id);
      sessionStorage.setItem("playerNickname", data.player.nickname);
      sessionStorage.setItem("roomId", data.room.id);
      sessionStorage.setItem("isHost", "true");

      router.push(`/room/${data.room.roomCode}/lobby`);
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
            text="$ git init --new-room"
            color="green"
            glowing
            as="h1"
            className="text-xl"
          />
          <TerminalText
            text="Configure your battle arena"
            color="muted"
            as="p"
            className="text-sm"
          />
        </div>

        {/* Topic selector */}
        <div className="space-y-2">
          <TerminalText text="// Select topic" color="dim" as="p" className="text-xs" />
          <div className="grid grid-cols-3 gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTopic(t.value)}
                className={`
                  border px-3 py-3 font-mono text-sm transition-all rounded-md
                  ${
                    topic === t.value
                      ? "border-terminal-green bg-terminal-green/15 text-terminal-green"
                      : "border-terminal-border text-terminal-muted hover:border-terminal-green/50 hover:text-terminal-text bg-terminal-surface"
                  }
                `}
              >
                <div className="text-lg mb-1">{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration selector */}
        <div className="space-y-2">
          <TerminalText text="// Game duration" color="dim" as="p" className="text-xs" />
          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`
                  border px-4 py-2 font-mono text-sm transition-all rounded-md
                  ${
                    duration === d.value
                      ? "border-terminal-green bg-terminal-green/15 text-terminal-green"
                      : "border-terminal-border text-terminal-muted hover:border-terminal-green/50 hover:text-terminal-text bg-terminal-surface"
                  }
                `}
              >
                {d.label}
              </button>
            ))}
          </div>
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
            if (e.key === "Enter") handleCreate();
          }}
          error={error}
        />

        {/* Submit */}
        <TerminalButton
          variant="green"
          size="lg"
          className="w-full"
          onClick={handleCreate}
          loading={loading}
          disabled={!nickname.trim()}
        >
          $ git init
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
