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
