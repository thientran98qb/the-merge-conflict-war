import type { Ticket, Topic } from "@/types/database";

export interface GenerateTicketsOptions {
  topic: Topic;
  count: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface AIProvider {
  name: string;
  generateTickets(options: GenerateTicketsOptions): Promise<Ticket[]>;
}
