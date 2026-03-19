import { z } from "zod";

export interface Score {
  id: number;
  name: string;
  value: number;
  createdAt: Date | null;
}

export const insertScoreSchema = z.object({
  name: z.string().min(1).max(15),
  value: z.number().int().min(0),
});

export type InsertScore = z.infer<typeof insertScoreSchema>;
export type CreateScoreRequest = InsertScore;
