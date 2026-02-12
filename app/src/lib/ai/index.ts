import type { AIProvider, GenerateTicketsOptions } from "./types";
import type { Ticket, Topic } from "@/types/database";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { GeminiProvider } from "./gemini-provider";
import { validateTickets } from "./validate";
import { getPresetTickets } from "./preset-tickets";

export type { AIProvider, GenerateTicketsOptions };
export { validateTickets };

// ─── Ticket Cache ──────────────────────────────────────────────────────────
// Pre-generate 1 batch per topic on first request, serve from cache afterward.
// Cache refreshes in the background so the next room also gets fresh tickets.
// This means only 1 API call per topic, no matter how many rooms are created.

interface CacheEntry {
  tickets: Ticket[];
  createdAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes - refresh in background after this
const ticketCache = new Map<Topic, CacheEntry>();
const pendingGenerations = new Map<Topic, Promise<Ticket[]>>();

/**
 * Get the configured AI provider
 */
function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "openai";

  switch (provider) {
    case "anthropic":
      return new AnthropicProvider();
    case "gemini":
      return new GeminiProvider();
    case "openai":
    default:
      return new OpenAIProvider();
  }
}

/**
 * Generate tickets via AI (raw, no cache)
 */
async function generateFromAI(topic: Topic, count: number): Promise<Ticket[] | null> {
  const options: GenerateTicketsOptions = {
    topic,
    count,
    difficultyDistribution: {
      easy: Math.floor(count * 0.4),
      medium: Math.floor(count * 0.4),
      hard: count - Math.floor(count * 0.4) * 2,
    },
  };

  try {
    const provider = getProvider();
    console.log(`[AI] Generating ${count} tickets with ${provider.name}...`);

    const rawTickets = await provider.generateTickets(options);
    const { valid, invalid } = validateTickets(rawTickets);
    console.log(`[AI] Result: ${valid.length} valid, ${invalid} invalid`);

    if (valid.length >= count * 0.7) {
      return valid.slice(0, count);
    }
    return null; // Not enough valid tickets
  } catch (error) {
    console.error("[AI] ❌ AI generation failed:", (error as Error).message);
    return null;
  }
}

/**
 * Shuffle array in-place (Fisher-Yates) and return a copy
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generate tickets for a game room.
 *
 * Strategy (always instant - never blocks room creation):
 * 1. If cache has tickets → return shuffled subset (instant, 0 API calls)
 * 2. If cache stale → return cached (fast), refresh in background
 * 3. If no cache → return presets immediately, start AI generation in background
 *    (next room creation for same topic will use AI cache)
 */
export async function generateGameTickets(
  topic: Topic,
  count: number = 30
): Promise<Ticket[]> {
  const cached = ticketCache.get(topic);
  const now = Date.now();

  // ── Cache HIT: return shuffled subset immediately ──
  if (cached && cached.tickets.length > 0) {
    const age = now - cached.createdAt;
    console.log(`[AI] ✅ Cache hit for "${topic}" (age: ${Math.round(age / 1000)}s)`);

    // If stale, trigger background refresh (non-blocking)
    if (age > CACHE_TTL_MS && !pendingGenerations.has(topic)) {
      console.log(`[AI] 🔄 Cache stale, refreshing in background...`);
      refreshCacheInBackground(topic, count);
    }

    // Return a shuffled selection so each room gets different order
    return shuffle(cached.tickets).slice(0, count);
  }

  // ── Cache MISS: return presets instantly, generate AI in background ──
  console.log(`[AI] ⚡ Cache miss for "${topic}" → returning presets instantly, AI generating in background`);

  // Start AI generation in background (non-blocking, for future rooms)
  if (!pendingGenerations.has(topic)) {
    refreshCacheInBackground(topic, count);
  }

  // Return presets immediately so room creation is instant
  const presets = getPresetTickets(topic);
  return shuffle(presets).slice(0, count);
}

/**
 * Generate tickets and cache them
 */
async function generateAndCache(topic: Topic, count: number): Promise<Ticket[]> {
  // Generate a larger batch (50) so we have variety when slicing 30
  const batchSize = Math.max(count, 50);

  const aiTickets = await generateFromAI(topic, batchSize);

  if (aiTickets && aiTickets.length > 0) {
    console.log(`[AI] ✅ Cached ${aiTickets.length} AI tickets for "${topic}"`);
    ticketCache.set(topic, { tickets: aiTickets, createdAt: Date.now() });
    return aiTickets;
  }

  // AI failed → use presets as cache
  console.log(`[AI] ⚠️ Using preset tickets for "${topic}"`);
  const presets = getPresetTickets(topic);
  ticketCache.set(topic, { tickets: presets, createdAt: Date.now() });
  return presets;
}

/**
 * Non-blocking background refresh
 */
function refreshCacheInBackground(topic: Topic, count: number): void {
  const promise = generateAndCache(topic, count);
  pendingGenerations.set(topic, promise);
  promise
    .then(() => console.log(`[AI] 🔄 Background refresh done for "${topic}"`))
    .catch((err) => console.error(`[AI] Background refresh failed:`, err))
    .finally(() => pendingGenerations.delete(topic));
}
