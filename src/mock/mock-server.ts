import type { GameState, GameStateCallback, Difficulty } from "../types";

interface MockSong {
  songName: string;
  songSubName: string;
  songAuthor: string;
  mapper: string;
  difficulty: Difficulty;
  bpm: number;
  duration: number;
  coverUrl: string;
  bsr: string;
  ranked: boolean;
  pp: number;
}

const MOCK_SONGS: MockSong[] = [
  {
    songName: "Reality Check Through The Skull",
    songSubName: "",
    songAuthor: "DM DOKURO",
    mapper: "Nuketime",
    difficulty: "ExpertPlus",
    bpm: 225,
    duration: 285,
    coverUrl: "",
    bsr: "25f",
    ranked: true,
    pp: 450,
  },
  {
    songName: "Crystallized",
    songSubName: "",
    songAuthor: "Camellia",
    mapper: "Hexagonial",
    difficulty: "Expert",
    bpm: 174,
    duration: 230,
    coverUrl: "",
    bsr: "1a2b",
    ranked: true,
    pp: 320,
  },
  {
    songName: "Overkill",
    songSubName: "",
    songAuthor: "RIOT",
    mapper: "Kival",
    difficulty: "ExpertPlus",
    bpm: 174,
    duration: 210,
    coverUrl: "",
    bsr: "2a4c",
    ranked: false,
    pp: 0,
  },
];

const MOCK_PLAYER = {
  name: "MockPlayer",
  avatar: "",
  country: "JP",
  worldRank: 1234,
  countryRank: 56,
  pp: 12345.67,
};

interface PhaseConfig {
  state: GameState["playState"];
  durationMs: number;
}

const PHASES: PhaseConfig[] = [
  { state: "menu", durationMs: 3000 },
  { state: "playing", durationMs: 30000 },
  { state: "paused", durationMs: 3000 },
  { state: "playing", durationMs: 15000 },
  { state: "finished", durationMs: 5000 },
];

const UPDATE_INTERVAL_MS = 100; // ~10Hz

export class MockServer {
  private callback: GameStateCallback | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private phaseIndex = 0;
  private phaseStartTime = 0;
  private songIndex = 0;

  // Live gameplay state
  private score = 0;
  private combo = 0;
  private missCount = 0;
  private accuracy = 100;
  private health = 100;
  private currentTime = 0;
  private playingElapsed = 0;

  get playerInfo() {
    return MOCK_PLAYER;
  }

  start(callback: GameStateCallback): void {
    this.callback = callback;
    this.phaseIndex = 0;
    this.songIndex = 0;
    this.phaseStartTime = Date.now();
    this.resetGameplayState();

    this.intervalId = setInterval(() => this.tick(), UPDATE_INTERVAL_MS);
    this.emit();
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callback = null;
  }

  private resetGameplayState(): void {
    this.score = 0;
    this.combo = 0;
    this.missCount = 0;
    this.accuracy = 100;
    this.health = 100;
    this.currentTime = 0;
    this.playingElapsed = 0;
  }

  private tick(): void {
    const phase = PHASES[this.phaseIndex];
    const elapsed = Date.now() - this.phaseStartTime;

    if (elapsed >= phase.durationMs) {
      this.advancePhase();
      return;
    }

    if (phase.state === "playing") {
      this.updateGameplay();
    }

    this.emit();
  }

  private advancePhase(): void {
    this.phaseIndex++;

    if (this.phaseIndex >= PHASES.length) {
      // Loop: pick next song
      this.phaseIndex = 0;
      this.songIndex = (this.songIndex + 1) % MOCK_SONGS.length;
      this.resetGameplayState();
    }

    this.phaseStartTime = Date.now();

    // Reset gameplay on new song start (first playing phase)
    if (PHASES[this.phaseIndex].state === "menu") {
      this.resetGameplayState();
    }

    this.emit();
  }

  private updateGameplay(): void {
    const song = MOCK_SONGS[this.songIndex];
    const dt = UPDATE_INTERVAL_MS / 1000;

    this.playingElapsed += dt;
    this.currentTime = Math.min(this.playingElapsed, song.duration);

    // Score: ~115 points per note, ~5 notes per second at this BPM
    const notesPerSecond = (song.bpm / 60) * 2;
    const maxNoteScore = 115;
    this.score += Math.round(
      notesPerSecond * dt * maxNoteScore * (0.85 + Math.random() * 0.15),
    );

    // Combo builds up
    this.combo += Math.round(notesPerSecond * dt);

    // Occasional miss (~2% chance per tick)
    if (Math.random() < 0.02) {
      this.missCount++;
      this.combo = 0;
      this.accuracy = Math.max(50, this.accuracy - (0.5 + Math.random()));
      this.health = Math.max(50, this.health - (5 + Math.random() * 5));
    } else {
      // Slow health recovery
      this.health = Math.min(100, this.health + dt * 2);
    }
  }

  private emit(): void {
    if (!this.callback) return;

    const song = MOCK_SONGS[this.songIndex];
    const phase = PHASES[this.phaseIndex];

    const state: GameState = {
      songName: song.songName,
      songSubName: song.songSubName,
      songAuthor: song.songAuthor,
      mapper: song.mapper,
      coverUrl: song.coverUrl,
      songHash: "",
      bsr: song.bsr,
      difficulty: song.difficulty,
      bpm: song.bpm,
      duration: song.duration,

      currentTime: this.currentTime,
      score: this.score,
      combo: this.combo,
      missCount: this.missCount,
      accuracy: Math.round(this.accuracy * 100) / 100,
      health: Math.round(this.health * 100) / 100,
      speedModifier: 1.0,

      playState: phase.state,

      ranked: song.ranked,
      pp: song.pp,
    };

    this.callback(state);
  }
}
