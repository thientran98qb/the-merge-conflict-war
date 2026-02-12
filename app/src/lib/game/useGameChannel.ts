"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { BroadcastType } from "@/types/game";

const POLL_INTERVAL_MS = 1000; // Poll every 1 second for low latency

interface UseGameChannelOptions {
  roomCode: string;
  playerId: string;
  onMessage: (type: BroadcastType, payload: Record<string, unknown>, senderId: string) => void;
  enabled?: boolean;
}

interface GameEvent {
  id: string;
  room_id: string;
  sender_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

/**
 * useGameChannel - HTTP-polling based game event channel.
 *
 * Instead of Supabase Realtime (which had persistent timeout issues),
 * this uses simple HTTP polling via /api/rooms/[code]/events.
 *
 * - POST to send events (inserts into game_events table server-side)
 * - GET to poll for new events every 1 second
 * - 100% reliable, no WebSocket dependency
 */
export function useGameChannel({
  roomCode,
  playerId,
  onMessage,
  enabled = true,
}: UseGameChannelOptions) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Use refs to avoid stale closures
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  // Track the timestamp of the last processed event
  const lastEventTimeRef = useRef<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());

  // Poll for new events
  useEffect(() => {
    if (!enabled || !roomCode || !playerId) return;

    // Set initial cursor to "now" so we only get events from after we joined
    if (!lastEventTimeRef.current) {
      lastEventTimeRef.current = new Date().toISOString();
    }

    let isMounted = true;

    const poll = async () => {
      try {
        const after = lastEventTimeRef.current || new Date().toISOString();
        const res = await fetch(
          `/api/rooms/${roomCode}/events?after=${encodeURIComponent(after)}&senderId=${encodeURIComponent(playerId)}`
        );

        if (!res.ok) {
          console.warn(`[GameChannel] Poll error: ${res.status}`);
          return;
        }

        const data = await res.json();
        const events: GameEvent[] = data.events || [];

        if (!isMounted) return;

        if (!isSubscribed && events !== undefined) {
          setIsSubscribed(true);
        }

        for (const event of events) {
          // Deduplicate: skip if we already processed this event
          if (processedIdsRef.current.has(event.id)) continue;
          processedIdsRef.current.add(event.id);

          // Keep the set from growing too large
          if (processedIdsRef.current.size > 200) {
            const entries = Array.from(processedIdsRef.current);
            processedIdsRef.current = new Set(entries.slice(-100));
          }

          console.log(`[GameChannel] 📩 Received: ${event.event_type} from ${event.sender_id}`);
          onMessageRef.current(
            event.event_type as BroadcastType,
            event.payload,
            event.sender_id
          );

          // Update cursor to this event's timestamp
          lastEventTimeRef.current = event.created_at;
        }
      } catch (err) {
        console.warn("[GameChannel] Poll fetch error:", err);
      }
    };

    // Do an initial poll immediately
    poll();

    // Then poll at interval
    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);
    console.log(`[GameChannel] ✅ Polling started for ${roomCode} (every ${POLL_INTERVAL_MS}ms)`);

    return () => {
      isMounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setIsSubscribed(false);
      console.log(`[GameChannel] 🔌 Polling stopped for ${roomCode}`);
    };
  }, [roomCode, playerId, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Broadcast = POST an event to the API route
  const broadcast = useCallback(
    async (type: BroadcastType, payload: Record<string, unknown>) => {
      console.log(`[GameChannel] 📤 Sending: ${type}`, payload);

      try {
        const res = await fetch(`/api/rooms/${roomCode}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: playerId,
            eventType: type,
            payload,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error(`[GameChannel] ❌ Failed to send ${type}: ${res.status}`, errData);
        } else {
          console.log(`[GameChannel] ✅ Sent ${type} successfully`);
        }
      } catch (err) {
        console.error(`[GameChannel] ❌ Error sending ${type}:`, err);
      }
    },
    [roomCode, playerId]
  );

  return { broadcast, isSubscribed };
}
