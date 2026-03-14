import { PORTS } from "../config";
import type { GameState, GameStateCallback } from "../types";
import { DEFAULT_STATE, parseDifficulty } from "./shared";

interface SiraBeatmap {
  songName?: string;
  songSubName?: string;
  songAuthorName?: string;
  levelAuthorName?: string;
  songCover?: string;
  songHash?: string;
  levelId?: string;
  songBPM?: number;
  noteJumpSpeed?: number;
  songTimeOffset?: number;
  length?: number;
  start?: number;
  paused?: number;
  difficulty?: string;
  difficultyEnum?: string;
  characteristic?: string;
  notesCount?: number;
  bombsCount?: number;
  obstaclesCount?: number;
  maxScore?: number;
  maxRank?: string;
  environmentName?: string;
  color?: Record<string, unknown>;
}

interface SiraPerformance {
  rawScore?: number;
  score?: number;
  currentMaxScore?: number;
  rank?: string;
  passedNotes?: number;
  hitNotes?: number;
  missedNotes?: number;
  lastNoteScore?: number;
  passedBombs?: number;
  hitBombs?: number;
  combo?: number;
  maxCombo?: number;
  multiplier?: number;
  multiplierProgress?: number;
  batteryEnergy?: number | null;
  currentSongTime?: number;
  softFailed?: boolean;
}

interface SiraStatus {
  beatmap?: SiraBeatmap;
  performance?: SiraPerformance;
  mod?: Record<string, unknown>;
}

interface SiraMessage {
  event: string;
  time: number;
  status: SiraStatus;
}

export class HTTPSiraAdapter {
  private ws: WebSocket | null = null;
  private state: GameState;

  constructor(
    private ip: string,
    private callback: GameStateCallback,
  ) {
    this.state = { ...DEFAULT_STATE };
  }

  connect(): void {
    const url = `ws://${this.ip}:${PORTS.HTTP_SIRA}/socket`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const msg: SiraMessage = JSON.parse(event.data);
        this.handleMessage(msg);
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
  }

  private handleMessage(msg: SiraMessage): void {
    const { event, status } = msg;

    if (event === "hello" || event === "songStart") {
      this.updateFromStatus(status);
      this.state.playState = event === "hello" ? "menu" : "playing";
      if (event === "songStart") {
        this.state.missCount = 0;
      }
      this.callback({ ...this.state });
      return;
    }

    if (event === "scoreChanged") {
      this.updatePerformance(status.performance);
      this.callback({ ...this.state });
      return;
    }

    if (event === "noteMissed") {
      this.updatePerformance(status.performance);
      this.state.missCount =
        (status.performance?.passedNotes ?? 0) -
        (status.performance?.hitNotes ?? 0);
      this.callback({ ...this.state });
      return;
    }

    if (event === "pause") {
      this.state.playState = "paused";
      this.updatePerformance(status.performance);
      this.callback({ ...this.state });
      return;
    }

    if (event === "resume") {
      this.state.playState = "playing";
      this.updatePerformance(status.performance);
      this.callback({ ...this.state });
      return;
    }

    if (event === "finished") {
      this.state.playState = "finished";
      this.updatePerformance(status.performance);
      this.callback({ ...this.state });
      return;
    }

    if (event === "menu") {
      this.state = { ...DEFAULT_STATE };
      this.callback({ ...this.state });
      return;
    }
  }

  private updateFromStatus(status: SiraStatus): void {
    const beatmap = status.beatmap;
    if (beatmap) {
      this.state.songName = beatmap.songName ?? "";
      this.state.songSubName = beatmap.songSubName ?? "";
      this.state.songAuthor = beatmap.songAuthorName ?? "";
      this.state.mapper = beatmap.levelAuthorName ?? "";
      this.state.songHash = beatmap.songHash ?? "";
      this.state.coverUrl = beatmap.songCover
        ? `data:image/png;base64,${beatmap.songCover}`
        : "";
      this.state.bpm = beatmap.songBPM ?? 0;
      this.state.duration = beatmap.length
        ? beatmap.length / 1000
        : 0;
      this.state.difficulty = parseDifficulty(beatmap.difficulty);
    }
    this.updatePerformance(status.performance);
  }

  private updatePerformance(perf?: SiraPerformance): void {
    if (!perf) return;
    this.state.score = perf.score ?? perf.rawScore ?? this.state.score;
    this.state.combo = perf.combo ?? this.state.combo;
    this.state.currentTime = perf.currentSongTime ?? this.state.currentTime;
    this.state.health =
      perf.batteryEnergy != null
        ? perf.batteryEnergy * 100
        : this.state.health;

    if (perf.currentMaxScore && perf.currentMaxScore > 0) {
      const rawScore = perf.rawScore ?? perf.score ?? 0;
      this.state.accuracy = (rawScore / perf.currentMaxScore) * 100;
    }
  }

  get socket(): WebSocket | null {
    return this.ws;
  }
}
