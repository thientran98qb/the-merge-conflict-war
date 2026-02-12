"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TerminalText, TerminalButton } from "@/components/ui";
import type { GameEndPayload, Award } from "@/types/game";

function ConfettiCanvas() {
  useEffect(() => {
    const canvas = document.getElementById("confetti") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      life: number;
    }> = [];

    const colors = ["#3fb950", "#e3b341", "#58a6ff", "#f85149", "#bc8cff"];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1,
      });
    }

    let frameId: number;
    const startTime = Date.now();

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.rotation += p.rotationSpeed;
        p.life -= 0.002;

        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;

      if (Date.now() - startTime < 4000) {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <canvas
      id="confetti"
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

const RANK_STYLES = [
  { medal: "🥇", border: "border-terminal-yellow/50", bg: "bg-terminal-yellow/8", glow: "glow-yellow", text: "text-terminal-yellow" },
  { medal: "🥈", border: "border-terminal-muted/40", bg: "bg-terminal-muted/5", glow: "", text: "text-terminal-muted" },
  { medal: "🥉", border: "border-terminal-red/30", bg: "bg-terminal-red/5", glow: "", text: "text-terminal-red" },
];

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const [result, setResult] = useState<GameEndPayload | null>(null);
  const playerId = typeof window !== "undefined" ? sessionStorage.getItem("playerId") || "" : "";

  useEffect(() => {
    const stored = sessionStorage.getItem("gameResult");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);

  const awards = useMemo<Award[]>(() => {
    if (!result || result.rankings.length === 0) return [];

    const rankings = result.rankings;
    const awards: Award[] = [];

    // Sharpshooter: highest accuracy
    const bestAccuracy = [...rankings].sort((a, b) => b.accuracy - a.accuracy)[0];
    if (bestAccuracy && bestAccuracy.accuracy > 0) {
      awards.push({
        title: "Sharpshooter",
        description: `${bestAccuracy.accuracy.toFixed(0)}% accuracy`,
        playerId: bestAccuracy.playerId,
        playerNickname: bestAccuracy.nickname,
        emoji: "🎯",
      });
    }

    // Speed Demon: most correct answers
    const mostCorrect = [...rankings].sort((a, b) => b.totalCorrect - a.totalCorrect)[0];
    if (mostCorrect && mostCorrect.totalCorrect > 0) {
      awards.push({
        title: "Speed Demon",
        description: `${mostCorrect.totalCorrect} correct answers`,
        playerId: mostCorrect.playerId,
        playerNickname: mostCorrect.nickname,
        emoji: "⚡",
      });
    }

    // Bug Creator: most wrong answers (fun award)
    const mostWrong = [...rankings].sort((a, b) => b.totalWrong - a.totalWrong)[0];
    if (mostWrong && mostWrong.totalWrong > 3) {
      awards.push({
        title: "Bug Creator",
        description: `${mostWrong.totalWrong} bugs introduced`,
        playerId: mostWrong.playerId,
        playerNickname: mostWrong.nickname,
        emoji: "🐛",
      });
    }

    return awards;
  }, [result]);

  if (!result) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <TerminalText text="Loading results..." typing color="green" as="p" />
      </div>
    );
  }

  const winner = result.rankings[0];

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col items-center px-4 py-10 overflow-y-auto">
      <ConfettiCanvas />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-8 relative z-10"
      >
        {/* Winner Announcement */}
        <div className="text-center space-y-3">
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.3, stiffness: 200 }}
            className="text-6xl block"
          >
            🏆
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-terminal-yellow glow-yellow font-mono"
          >
            {winner?.nickname || "No Winner"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-terminal-dim text-sm font-mono"
          >
            {result.reason === "winner"
              ? "All players finished!"
              : "Time expired — highest progress wins"}
          </motion.p>
        </div>

        {/* Rankings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <p className="text-terminal-dim text-xs font-mono px-1">
            // FINAL RANKINGS
          </p>

          {result.rankings.map((r, i) => {
            const style = RANK_STYLES[i] || {
              medal: `${i + 1}`,
              border: "border-terminal-border",
              bg: "bg-terminal-surface/50",
              glow: "",
              text: "text-terminal-muted",
            };
            const isMe = r.playerId === playerId;
            const accuracy = r.accuracy.toFixed(0);

            return (
              <motion.div
                key={r.playerId}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.15 }}
                className={`
                  border ${style.border} ${style.bg} rounded-lg p-4
                  ${isMe ? "ring-1 ring-terminal-green/40" : ""}
                  ${style.glow}
                `}
              >
                {/* Top row: Rank + Name */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl w-8 text-center shrink-0">
                    {style.medal}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-base truncate ${i === 0 ? "text-terminal-yellow" : "text-terminal-text"}`}>
                        {r.nickname}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-terminal-green border border-terminal-green/40 bg-terminal-green/10 px-1.5 py-0.5 rounded shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-lg tabular-nums shrink-0 ${style.text}`}>
                    {r.progress.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-terminal-border/40 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className={`h-full rounded-full ${
                      i === 0
                        ? "bg-terminal-yellow"
                        : i === 1
                          ? "bg-terminal-muted"
                          : "bg-terminal-green/70"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, r.progress)}%` }}
                    transition={{ delay: 1.0 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-terminal-green">✓</span>
                    <span className="text-terminal-text">{r.totalCorrect}</span>
                    <span className="text-terminal-dim">correct</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-terminal-red">✗</span>
                    <span className="text-terminal-text">{r.totalWrong}</span>
                    <span className="text-terminal-dim">wrong</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-terminal-blue">⊘</span>
                    <span className="text-terminal-text">{accuracy}%</span>
                    <span className="text-terminal-dim">accuracy</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Awards */}
        {awards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="space-y-3"
          >
            <p className="text-terminal-dim text-xs font-mono px-1">
              // AWARDS
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {awards.map((award, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 + i * 0.15 }}
                  className="border border-terminal-yellow/20 bg-terminal-surface rounded-lg p-3 text-center"
                >
                  <div className="text-3xl mb-2">{award.emoji}</div>
                  <div className="text-terminal-yellow text-xs font-bold font-mono">
                    {award.title}
                  </div>
                  <div className="text-terminal-text text-xs font-mono mt-1 truncate">
                    {award.playerNickname}
                  </div>
                  <div className="text-terminal-dim text-[10px] font-mono mt-0.5">
                    {award.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Game summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="border border-terminal-border bg-terminal-surface/50 rounded-lg p-4 font-mono text-xs"
        >
          <div className="flex items-center justify-between text-terminal-dim">
            <span>Room: {code}</span>
            <span>{result.rankings.length} players</span>
            <span>{result.reason === "timeout" ? "Time expired" : "Completed"}</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="flex gap-4 justify-center pb-6"
        >
          <TerminalButton
            variant="green"
            size="lg"
            onClick={() => {
              sessionStorage.clear();
              router.push("/room/create");
            }}
          >
            $ new game
          </TerminalButton>
          <TerminalButton
            variant="red"
            size="lg"
            onClick={() => {
              sessionStorage.clear();
              router.push("/");
            }}
          >
            $ exit
          </TerminalButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
