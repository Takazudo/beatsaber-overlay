import { PORTS } from "../config";
import type { GameState, GameStateCallback } from "../types";
import { DEFAULT_STATE, parseDifficulty } from "./shared";

interface BSPlusMapInfo {
  level_id: string;
  song_name: string;
  song_sub_name: string;
  song_author: string;
  mapper: string;
  BSRKey: string;
  coverRaw: string;
  songHash: string;
  duration: number;
  BPM: number;
  difficulty: string;
  characteristic: string;
  PP: number;
  Star: number;
}

interface BSPlusScoreEvent {
  time: number;
  score: number;
  accuracy: number;
  combo: number;
  missCount: number;
  currentHealth: number;
}

interface BSPlusMessage {
  _type: string;
  _event: string;
  protocolVersion?: number;
  gameVersion?: string;
  mapInfoChanged?: BSPlusMapInfo;
  scoreEvent?: BSPlusScoreEvent;
  gameStateChanged?: string;
  pauseTime?: number;
  resumeTime?: number;
}

export class BSPlusAdapter {
  private ws: WebSocket | null = null;
  private state: GameState;

  constructor(
    private ip: string,
    private callback: GameStateCallback,
  ) {
    this.state = { ...DEFAULT_STATE };
  }

  connect(): void {
    const url = `ws://${this.ip}:${PORTS.BS_PLUS}/socket`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      // Connection established, waiting for handshake
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: BSPlusMessage = JSON.parse(event.data);
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

  private handleMessage(msg: BSPlusMessage): void {
    if (msg._type === "handshake") {
      // Handshake received, connection is ready
      return;
    }

    if (msg._event === "mapInfoChanged" && msg.mapInfoChanged) {
      const info = msg.mapInfoChanged;
      this.state = {
        ...this.state,
        songName: info.song_name,
        songSubName: info.song_sub_name,
        songAuthor: info.song_author,
        mapper: info.mapper,
        bsr: info.BSRKey,
        songHash: info.songHash ?? "",
        coverUrl: info.coverRaw
          ? `data:image/png;base64,${info.coverRaw}`
          : "",
        duration: info.duration / 1000,
        bpm: info.BPM,
        difficulty: parseDifficulty(info.difficulty),
        pp: info.PP,
        ranked: info.PP > 0,
      };
      this.callback({ ...this.state });
    }

    if (msg._event === "scoreEvent" && msg.scoreEvent) {
      const score = msg.scoreEvent;
      this.state = {
        ...this.state,
        currentTime: score.time / 1000,
        score: score.score,
        accuracy: score.accuracy * 100,
        combo: score.combo,
        missCount: score.missCount,
        health: score.currentHealth * 100,
      };
      this.callback({ ...this.state });
    }

    if (msg._event === "gameStateChanged" && msg.gameStateChanged) {
      const stateMap: Record<string, GameState["playState"]> = {
        Menu: "menu",
        Playing: "playing",
        Paused: "paused",
        Finished: "finished",
      };
      this.state = {
        ...this.state,
        playState: stateMap[msg.gameStateChanged] ?? "menu",
      };
      if (this.state.playState === "menu") {
        this.state = { ...DEFAULT_STATE };
      }
      this.callback({ ...this.state });
    }

    if (msg._event === "pauseTime" && msg.pauseTime !== undefined) {
      this.state = {
        ...this.state,
        playState: "paused",
        currentTime: msg.pauseTime / 1000,
      };
      this.callback({ ...this.state });
    }

    if (msg._event === "resumeTime" && msg.resumeTime !== undefined) {
      this.state = {
        ...this.state,
        playState: "playing",
        currentTime: msg.resumeTime / 1000,
      };
      this.callback({ ...this.state });
    }
  }

  get socket(): WebSocket | null {
    return this.ws;
  }
}
