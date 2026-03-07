export type Difficulty = "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";
export type PlayState = "menu" | "playing" | "paused" | "finished";

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
  currentTime: number;
  score: number;
  combo: number;
  missCount: number;
  accuracy: number;
  health: number;
  speedModifier: number;
  playState: PlayState;
  ranked: boolean;
  pp: number;
}

export type GameStateCallback = (state: GameState) => void;
