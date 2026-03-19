import type { InsertScore, Score } from "@shared/schema";

export interface IStorage {
  getScores(): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
}

export class MemoryStorage implements IStorage {
  private scores: Score[] = [];
  private nextId = 1;

  async getScores(): Promise<Score[]> {
    return [...this.scores]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const score: Score = {
      id: this.nextId++,
      name: insertScore.name,
      value: insertScore.value,
      createdAt: new Date(),
    };
    this.scores.push(score);
    return score;
  }
}

export const storage = new MemoryStorage();
