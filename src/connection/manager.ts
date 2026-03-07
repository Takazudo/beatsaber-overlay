import type { GameStateCallback } from "../types";
import { BSPlusAdapter } from "./bs-plus";
import { DataPullerAdapter } from "./data-puller";
import { HTTPSiraAdapter } from "./http-sira";

type Adapter = BSPlusAdapter | HTTPSiraAdapter | DataPullerAdapter;

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10000;

export class ConnectionManager {
  private ip: string;
  private callback: GameStateCallback;
  private currentAdapter: Adapter | null = null;
  private adapterIndex = 0;
  private connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private stopped = false;

  constructor(ip: string, callback: GameStateCallback) {
    this.ip = ip;
    this.callback = callback;
  }

  connect(): void {
    this.stopped = false;
    this.adapterIndex = 0;
    this.reconnectAttempts = 0;
    this.tryNextAdapter();
  }

  disconnect(): void {
    this.stopped = true;
    this.clearReconnectTimer();
    if (this.currentAdapter) {
      this.currentAdapter.disconnect();
      this.currentAdapter = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private tryNextAdapter(): void {
    if (this.stopped) return;

    this.currentAdapter?.disconnect();
    this.connected = false;

    const adapters = [
      () => new BSPlusAdapter(this.ip, this.callback),
      () => new HTTPSiraAdapter(this.ip, this.callback),
      () => new DataPullerAdapter(this.ip, this.callback),
    ];

    if (this.adapterIndex >= adapters.length) {
      this.scheduleReconnect();
      return;
    }

    const adapter = adapters[this.adapterIndex]();
    this.currentAdapter = adapter;
    adapter.connect();

    const socket = this.getPrimarySocket(adapter);
    if (!socket) {
      this.adapterIndex++;
      this.tryNextAdapter();
      return;
    }

    socket.addEventListener("open", () => {
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    socket.addEventListener("close", () => {
      if (this.stopped) return;
      this.connected = false;
      this.adapterIndex++;
      this.tryNextAdapter();
    });

    socket.addEventListener("error", () => {
      // error will trigger close
    });
  }

  private getPrimarySocket(
    adapter: Adapter,
  ): WebSocket | null {
    if (adapter instanceof BSPlusAdapter) return adapter.socket;
    if (adapter instanceof HTTPSiraAdapter) return adapter.socket;
    if (adapter instanceof DataPullerAdapter) return adapter.mapSocket;
    return null;
  }

  private scheduleReconnect(): void {
    if (this.stopped) return;
    this.clearReconnectTimer();

    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_MS,
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.adapterIndex = 0;
      this.tryNextAdapter();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
