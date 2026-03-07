import type { Difficulty, GameState } from "../types";

export const DEFAULT_STATE: GameState = {
  songName: "",
  songSubName: "",
  songAuthor: "",
  mapper: "",
  coverUrl: "",
  bsr: "",
  difficulty: "Expert",
  bpm: 0,
  duration: 0,
  currentTime: 0,
  score: 0,
  combo: 0,
  missCount: 0,
  accuracy: 100,
  health: 50,
  speedModifier: 1,
  playState: "menu",
  ranked: false,
  pp: 0,
};

export function parseDifficulty(raw?: string): Difficulty {
  if (!raw) return "Expert";
  const map: Record<string, Difficulty> = {
    Easy: "Easy",
    Normal: "Normal",
    Hard: "Hard",
    Expert: "Expert",
    ExpertPlus: "ExpertPlus",
  };
  return map[raw] ?? "Expert";
}
