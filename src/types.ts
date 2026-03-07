export type Difficulty = "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";

export type PlayState = "menu" | "playing" | "paused" | "finished";

export type CardPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface GameState {
  songName: string;
  songSubName: string;
  songAuthor: string;
  mapper: string;
  coverUrl: string;
  bsr: string;
  difficulty: Difficulty;
  bpm: number;
  duration: number;
  elapsed: number;
  accuracy: number;
  score: number;
  combo: number;
  misses: number;
  health: number;
  speed: number;
  ranked: boolean;
  pp: number;
  playState: PlayState;
}

export interface PlayerInfo {
  name: string;
  avatar: string;
  country: string;
  worldRank: number;
  countryRank: number;
  pp: number;
}
