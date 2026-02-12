import type { Ticket } from "@/types/database";

/**
 * Validate a single ticket's structure
 */
export function isValidTicket(ticket: unknown): ticket is Ticket {
  if (!ticket || typeof ticket !== "object") return false;

  const t = ticket as Record<string, unknown>;

  // Required fields
  if (typeof t.id !== "string" || !t.id) return false;
  if (!["multiple_choice", "fill_in_blank", "drag_and_drop"].includes(t.type as string))
    return false;
  if (!["easy", "medium", "hard"].includes(t.difficulty as string)) return false;
  if (typeof t.title !== "string" || !t.title) return false;
  if (typeof t.description !== "string") return false;
  if (typeof t.code_snippet !== "string" || !t.code_snippet) return false;

  // correct_answer is required
  if (t.correct_answer === undefined || t.correct_answer === null) return false;

  // Multiple choice must have options array
  if (t.type === "multiple_choice") {
    if (!Array.isArray(t.options) || t.options.length < 2) return false;
    if (typeof t.correct_answer !== "string") return false;
  }

  // Fill in blank must have string answer
  if (t.type === "fill_in_blank") {
    if (typeof t.correct_answer !== "string") return false;
  }

  // Drag and drop must have array answer
  if (t.type === "drag_and_drop") {
    if (!Array.isArray(t.correct_answer)) return false;
  }

  return true;
}

/**
 * Validate an array of tickets
 */
export function validateTickets(tickets: unknown[]): {
  valid: Ticket[];
  invalid: number;
} {
  const valid: Ticket[] = [];
  let invalid = 0;

  for (const ticket of tickets) {
    if (isValidTicket(ticket)) {
      valid.push(ticket);
    } else {
      invalid++;
    }
  }

  return { valid, invalid };
}
