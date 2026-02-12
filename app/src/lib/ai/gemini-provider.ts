import type { AIProvider, GenerateTicketsOptions } from "./types";
import type { Ticket } from "@/types/database";
import { buildTicketPrompt, SYSTEM_PROMPT } from "./prompt";

// Available Gemini models (2025+), ordered by speed/rate-limit priority
// Ref: https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODELS = [
  "gemini-2.5-flash-lite", // Ultra fast, highest free-tier rate limits
  "gemini-2.0-flash",      // Deprecated March 2026, still works
  "gemini-2.5-flash",      // Stable, more capable
];

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
  }

  private async tryModel(model: string, options: GenerateTicketsOptions): Promise<Ticket[] | null> {
    try {
      console.log(`[Gemini] Calling ${model}...`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${SYSTEM_PROMPT}\n\n${buildTicketPrompt(options)}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.status === 429) {
        console.warn(`[Gemini] ${model} rate limited (429), trying next model...`);
        return null;
      }

      if (response.status === 404) {
        console.warn(`[Gemini] ${model} not found (404), trying next model...`);
        return null;
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.warn(`[Gemini] ${model} error ${response.status}: ${body.slice(0, 200)}`);
        return null;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        console.warn(`[Gemini] ${model} returned no content`);
        return null;
      }

      const parsed = JSON.parse(content);
      const tickets: Ticket[] = Array.isArray(parsed) ? parsed : parsed.tickets;
      console.log(`[Gemini] ✅ ${model} returned ${tickets?.length || 0} tickets`);
      return tickets;
    } catch (err) {
      console.warn(`[Gemini] ${model} exception:`, (err as Error).message);
      return null;
    }
  }

  async generateTickets(options: GenerateTicketsOptions): Promise<Ticket[]> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    // Try each model in order - first success wins
    for (const model of GEMINI_MODELS) {
      const tickets = await this.tryModel(model, options);
      if (tickets && tickets.length > 0) {
        return tickets;
      }
    }

    throw new Error("All Gemini models failed (rate limited, not found, or errors)");
  }
}
