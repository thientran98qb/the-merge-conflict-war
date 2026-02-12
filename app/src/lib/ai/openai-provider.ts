import type { AIProvider, GenerateTicketsOptions } from "./types";
import type { Ticket } from "@/types/database";
import { buildTicketPrompt, SYSTEM_PROMPT } from "./prompt";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
  }

  async generateTickets(options: GenerateTicketsOptions): Promise<Ticket[]> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildTicketPrompt(options) },
        ],
        temperature: 0.9,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const parsed = JSON.parse(content);
    // Handle both { tickets: [...] } and direct array
    const tickets: Ticket[] = Array.isArray(parsed) ? parsed : parsed.tickets;

    return tickets;
  }
}
