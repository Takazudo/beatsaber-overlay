export type Difficulty = "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";
export type PlayState = "menu" | "playing" | "paused" | "finished";
export type CardPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface GameState {
  // Song metadata
  songName: string;
  songSubName: string;
  songAuthor: string;
  mapper: string;
  coverUrl: string;
  bsr: string;
  difficulty: Difficulty;
  bpm: number;
  duration: number; // seconds

  // Live gameplay
  currentTime: number; // seconds
  score: number;
  combo: number;
  missCount: number;
  accuracy: number; // 0-100
  health: number; // 0-100
  speedModifier: number; // 1.0 = normal

  // State
  playState: PlayState;

  // Ranked
  ranked: boolean;
  pp: number;
}

export interface PlayerInfo {
  name: string;
  avatar: string;
  country: string;
  worldRank: number;
  countryRank: number;
  pp: number;
}

export interface OverlayParams {
  ip: string;
  pid: string;
  mock: boolean;
  md: boolean;
  scpos: CardPosition;
  pcpos: CardPosition;
  scsc: number;
  pcsc: number;
  bg: string;
  fg: string;
  opacity: number;
  radius: number | null;
  css: string;
}

export type GameStateCallback = (state: GameState) => void;
