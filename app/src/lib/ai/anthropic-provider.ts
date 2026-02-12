import type { AIProvider, GenerateTicketsOptions } from "./types";
import type { Ticket } from "@/types/database";
import { buildTicketPrompt, SYSTEM_PROMPT } from "./prompt";

export class AnthropicProvider implements AIProvider {
  name = "anthropic";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || "";
  }

  async generateTickets(options: GenerateTicketsOptions): Promise<Ticket[]> {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: buildTicketPrompt(options) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error("No content in Anthropic response");
    }

    // Extract JSON from response (may have markdown wrapping)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Anthropic response");
    }

    const tickets: Ticket[] = JSON.parse(jsonMatch[0]);
    return tickets;
  }
}
