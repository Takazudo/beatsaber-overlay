import { PORTS } from "../config";
import type { GameState, GameStateCallback } from "../types";
import { DEFAULT_STATE, parseDifficulty } from "./shared";

interface BSPlusMapInfo {
  level_id: string;
  name: string;
  sub_name: string;
  artist: string;
  mapper: string;
  BSRKey: string;
  coverRaw: string;
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
  mapInfo?: BSPlusMapInfo;
  score?: BSPlusScoreEvent;
  gameState?: string;
  pause?: number;
  resume?: number;
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

    if (msg._event === "mapInfo" && msg.mapInfo) {
      const info = msg.mapInfo;
      // Derive songHash from level_id by stripping "custom_level_" prefix
      const songHash = info.level_id
        ? info.level_id.replace(/^custom_level_/i, "")
        : "";
      this.state = {
        ...this.state,
        songName: info.name,
        songSubName: info.sub_name,
        songAuthor: info.artist,
        mapper: info.mapper,
        bsr: info.BSRKey,
        songHash,
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

    if (msg._event === "score" && msg.score) {
      const score = msg.score;
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

    if (msg._event === "gameState" && msg.gameState) {
      const stateMap: Record<string, GameState["playState"]> = {
        Menu: "menu",
        Playing: "playing",
        Paused: "paused",
        Finished: "finished",
      };
      this.state = {
        ...this.state,
        playState: stateMap[msg.gameState] ?? "menu",
      };
      if (this.state.playState === "menu") {
        this.state = { ...DEFAULT_STATE };
      }
      this.callback({ ...this.state });
    }

    if (msg._event === "pause" && msg.pause !== undefined) {
      this.state = {
        ...this.state,
        playState: "paused",
        currentTime: msg.pause / 1000,
      };
      this.callback({ ...this.state });
    }

    if (msg._event === "resume" && msg.resume !== undefined) {
      this.state = {
        ...this.state,
        playState: "playing",
        currentTime: msg.resume / 1000,
      };
      this.callback({ ...this.state });
    }
  }

  get socket(): WebSocket | null {
    return this.ws;
  }
}
