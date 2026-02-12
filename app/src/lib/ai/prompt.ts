import type { GenerateTicketsOptions } from "./types";

/**
 * Generate a random seed to ensure unique question sets each time
 */
function getRandomSeed(): string {
  return `SEED-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get random focus areas for variety
 */
function getRandomFocusAreas(topic: string): string {
  const phpAreas = [
    "array manipulation, string functions, type juggling",
    "OOP patterns, traits, interfaces, abstract classes",
    "Laravel Eloquent, middleware, request lifecycle",
    "PDO, prepared statements, database transactions",
    "error handling, exceptions, null coalescing",
    "regex, date/time, file handling",
    "closures, generators, arrow functions",
    "session management, cookies, authentication",
    "composer autoloading, namespaces, PSR standards",
    "PHP 8.x features: enums, fibers, named arguments, match expression",
  ];

  const frontendAreas = [
    "React hooks (useState, useEffect, useRef, useMemo, useCallback)",
    "CSS Grid, Flexbox, responsive design, media queries",
    "JavaScript promises, async/await, event loop",
    "TypeScript generics, utility types, type guards",
    "DOM manipulation, event delegation, bubbling",
    "Next.js routing, SSR, server components",
    "React state management, context, reducers",
    "Web APIs: fetch, localStorage, IntersectionObserver",
    "ES6+ features: destructuring, spread, optional chaining",
    "Accessibility (ARIA), semantic HTML, forms",
  ];

  const areas = topic === "php" ? phpAreas : topic === "frontend" ? frontendAreas : [...phpAreas, ...frontendAreas];

  // Pick 3-4 random focus areas
  const shuffled = areas.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4).join("; ");
}

export function buildTicketPrompt(options: GenerateTicketsOptions): string {
  const topicDesc =
    options.topic === "php"
      ? "PHP code bugs, Laravel patterns, common PHP pitfalls"
      : options.topic === "frontend"
        ? "JavaScript/TypeScript/React bugs, CSS issues, HTML accessibility"
        : "Mix of PHP and Frontend (JavaScript/TypeScript/React) code bugs";

  const seed = getRandomSeed();
  const focusAreas = getRandomFocusAreas(options.topic);

  return `Generate ${options.count} UNIQUE code challenge tickets for a coding game.

Uniqueness seed: ${seed}
Focus areas for THIS batch: ${focusAreas}

Topic: ${topicDesc}

Difficulty distribution:
- Easy: ${options.difficultyDistribution.easy} tickets
- Medium: ${options.difficultyDistribution.medium} tickets
- Hard: ${options.difficultyDistribution.hard} tickets

Each ticket must be a JSON object with this exact schema:
{
  "id": "unique-string-id",
  "type": "multiple_choice" | "fill_in_blank",
  "difficulty": "easy" | "medium" | "hard",
  "topic": "${options.topic === "mix" ? "php or frontend" : options.topic}",
  "title": "Short title describing the bug",
  "description": "What is wrong with this code? or What does this code do?",
  "code_snippet": "The code snippet with the bug (use \\n for newlines)",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correct_answer": "A" | "B" | "C" | "D" (for multiple_choice) or "exact answer text" (for fill_in_blank),
  "explanation": "Brief explanation of the correct answer"
}

CRITICAL RULES:
- EVERY ticket must be DIFFERENT from typical examples - create NOVEL scenarios, not textbook examples
- Use varied, realistic code contexts (real-world use cases, not trivial one-liners)
- For multiple_choice: always provide exactly 4 options labeled A, B, C, D
- For fill_in_blank: correct_answer should be the exact text to fill in (case-insensitive matching will be used)
- Code snippets should be realistic and practical, from real-world projects
- Easy: simple syntax errors, missing semicolons, wrong operators, basic API misuse
- Medium: logic errors, scope issues, common framework mistakes, edge cases
- Hard: complex bugs, race conditions, security vulnerabilities, performance issues
- Mix type distribution: roughly 70% multiple_choice, 30% fill_in_blank
- DO NOT repeat common textbook questions like "what is == vs ===" - be creative and surprising!

Return ONLY a valid JSON array of ticket objects, no markdown or explanation.`;
}

export const SYSTEM_PROMPT = `You are a creative code challenge generator for a real-time coding game. You generate UNIQUE, DIVERSE JSON arrays of coding challenge tickets that players have never seen before. Each ticket presents a code snippet with a bug or question. Be creative - avoid repeating common textbook examples. Your output must be valid JSON only - no markdown, no explanation, just the JSON array.`;
