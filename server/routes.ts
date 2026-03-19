import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.scores.list.path, async (_req, res) => {
    const scores = await storage.getScores();
    res.json(scores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      const input = api.scores.create.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed with some initial data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingScores = await storage.getScores();
  if (existingScores.length === 0) {
    await storage.createScore({ name: "Snot King", value: 500 });
    await storage.createScore({ name: "Booger Boy", value: 300 });
    await storage.createScore({ name: "Slimy Sam", value: 150 });
  }
}
