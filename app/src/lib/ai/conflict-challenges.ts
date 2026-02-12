import type { ConflictChallenge, Ticket } from "@/types/database";

const SILLY_TASK_COMMENTS: string[] = [
  "// TODO: Fix this before the deadline that was yesterday",
  "// I don't know why this works but please don't touch it",
  "// This code was written at 3 AM. You've been warned.",
  "// Dear future developer, I'm sorry. Sincerely, past developer.",
  "// If you're reading this, the code below is a masterpiece of spaghetti",
  "// Temporary fix applied 3 years ago. Still here. Still temporary.",
  "// Magic number: 42. Because that's the answer to everything.",
  "// This function does exactly what you think it doesn't do",
  "// The following code is not a bug, it's an undocumented feature",
  "// Abandon all hope, ye who enter this function",
];

/**
 * Get a random conflict challenge
 */
export function getRandomConflictChallenge(
  hardTickets: Ticket[]
): ConflictChallenge {
  const type = Math.random() < 0.5 ? "hard_puzzle" : "silly_task";

  if (type === "hard_puzzle" && hardTickets.length > 0) {
    const ticket = hardTickets[Math.floor(Math.random() * hardTickets.length)];
    return {
      type: "hard_puzzle",
      content: ticket.id,
      ticket,
    };
  }

  // Silly task: type out a comment
  const comment =
    SILLY_TASK_COMMENTS[Math.floor(Math.random() * SILLY_TASK_COMMENTS.length)];
  return {
    type: "silly_task",
    content: comment,
  };
}
