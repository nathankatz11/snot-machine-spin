import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Score, InsertScore } from "@shared/schema";

const STORAGE_KEY = "snot-machine-scores";

function getStoredScores(): Score[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveScores(scores: Score[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

// Seed default scores if empty
function ensureSeeded(): Score[] {
  const scores = getStoredScores();
  if (scores.length === 0) {
    const seeds: Score[] = [
      { id: 1, name: "Snot King", value: 500, createdAt: new Date() },
      { id: 2, name: "Booger Boy", value: 300, createdAt: new Date() },
      { id: 3, name: "Slimy Sam", value: 150, createdAt: new Date() },
    ];
    saveScores(seeds);
    return seeds;
  }
  return scores;
}

export function useScores() {
  return useQuery({
    queryKey: ["scores"],
    queryFn: async () => {
      const scores = ensureSeeded();
      return scores.sort((a, b) => b.value - a.value).slice(0, 10);
    },
  });
}

export function useCreateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScore): Promise<Score> => {
      const scores = getStoredScores();
      const newScore: Score = {
        id: Date.now(),
        name: data.name,
        value: data.value,
        createdAt: new Date(),
      };
      scores.push(newScore);
      saveScores(scores);
      return newScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
    },
  });
}
