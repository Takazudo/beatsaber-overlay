import { PORTS } from "../config";
import type { Difficulty, GameState, GameStateCallback } from "../types";

const DEFAULT_STATE: GameState = {
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

interface MapData {
  GameVersion?: string;
  PluginVersion?: string;
  InLevel?: boolean;
  LevelPaused?: boolean;
  LevelFinished?: boolean;
  LevelFailed?: boolean;
  LevelQuit?: boolean;
  Hash?: string;
  SongName?: string;
  SongSubName?: string;
  SongAuthor?: string;
  Mapper?: string;
  BSRKey?: string;
  coverImage?: string;
  Duration?: number;
  BPM?: number;
  Difficulty?: string;
  NJS?: number;
  Modifiers?: Record<string, unknown>;
  ModifiersMultiplier?: number;
  PracticeMode?: boolean;
  PP?: number;
  Star?: number;
  IsMultiplayer?: boolean;
  PreviousRecord?: number;
  PreviousBSR?: string;
}

interface LiveData {
  Score?: number;
  ScoreWithMultipliers?: number;
  MaxScore?: number;
  MaxScoreWithMultipliers?: number;
  Rank?: string;
  FullCombo?: boolean;
  Combo?: number;
  Misses?: number;
  Accuracy?: number;
  BlockHitScore?: number[];
  PlayerHealth?: number;
  TimeElapsed?: number;
  UnixTimestamp?: number;
}

function parseDifficulty(raw?: string): Difficulty {
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

export class DataPullerAdapter {
  private mapWs: WebSocket | null = null;
  private liveWs: WebSocket | null = null;
  private state: GameState;

  constructor(
    private ip: string,
    private callback: GameStateCallback,
  ) {
    this.state = { ...DEFAULT_STATE };
  }

  connect(): void {
    const baseUrl = `ws://${this.ip}:${PORTS.DATA_PULLER}/BSDataPuller`;

    this.mapWs = new WebSocket(`${baseUrl}/MapData`);
    this.mapWs.onmessage = (event) => {
      try {
        const data: MapData = JSON.parse(event.data);
        this.handleMapData(data);
      } catch {
        // Ignore malformed messages
      }
    };
    this.mapWs.onerror = () => {
      this.mapWs?.close();
    };

    this.liveWs = new WebSocket(`${baseUrl}/LiveData`);
    this.liveWs.onmessage = (event) => {
      try {
        const data: LiveData = JSON.parse(event.data);
        this.handleLiveData(data);
      } catch {
        // Ignore malformed messages
      }
    };
    this.liveWs.onerror = () => {
      this.liveWs?.close();
    };
  }

  disconnect(): void {
    for (const ws of [this.mapWs, this.liveWs]) {
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.close();
      }
    }
    this.mapWs = null;
    this.liveWs = null;
  }

  private handleMapData(data: MapData): void {
    this.state.songName = data.SongName ?? this.state.songName;
    this.state.songSubName = data.SongSubName ?? this.state.songSubName;
    this.state.songAuthor = data.SongAuthor ?? this.state.songAuthor;
    this.state.mapper = data.Mapper ?? this.state.mapper;
    this.state.bsr = data.BSRKey ?? this.state.bsr;
    this.state.duration = data.Duration ?? this.state.duration;
    this.state.bpm = data.BPM ?? this.state.bpm;
    this.state.difficulty = parseDifficulty(data.Difficulty);
    this.state.pp = data.PP ?? 0;
    this.state.ranked = (data.PP ?? 0) > 0;
    this.state.speedModifier = data.ModifiersMultiplier ?? 1;

    if (data.coverImage) {
      this.state.coverUrl = data.coverImage.startsWith("data:")
        ? data.coverImage
        : `data:image/png;base64,${data.coverImage}`;
    }

    if (data.LevelPaused) {
      this.state.playState = "paused";
    } else if (data.LevelFinished || data.LevelFailed) {
      this.state.playState = "finished";
    } else if (data.LevelQuit) {
      this.state.playState = "menu";
    } else if (data.InLevel) {
      this.state.playState = "playing";
    } else {
      this.state.playState = "menu";
    }

    this.callback({ ...this.state });
  }

  private handleLiveData(data: LiveData): void {
    this.state.score = data.ScoreWithMultipliers ?? data.Score ?? this.state.score;
    this.state.combo = data.Combo ?? this.state.combo;
    this.state.missCount = data.Misses ?? this.state.missCount;
    this.state.accuracy = data.Accuracy ?? this.state.accuracy;
    this.state.health = data.PlayerHealth ?? this.state.health;
    this.state.currentTime = data.TimeElapsed ?? this.state.currentTime;

    this.callback({ ...this.state });
  }

  get mapSocket(): WebSocket | null {
    return this.mapWs;
  }

  get liveSocket(): WebSocket | null {
    return this.liveWs;
  }
}
