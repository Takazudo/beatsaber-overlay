# WebSocket Connection

## Plugin Fallback Chain

The overlay tries to connect to Beat Saber mods in this order:

1. **BeatSaberPlus** - `ws://{ip}:2947/socket`
2. **HTTP(sira)Status** - `ws://{ip}:6557/socket`
3. **DataPuller** - `ws://{ip}:2946/BSDataPuller/MapData` + `ws://{ip}:2946/BSDataPuller/LiveData`

Default IP is `localhost`. Configurable via `?ip=` query parameter.

If connection fails, try the next plugin. Auto-reconnect on disconnect.

## Normalized Data Model

Each plugin adapter normalizes its events into a common data structure:

```typescript
interface GameState {
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
  playState: "menu" | "playing" | "paused" | "finished";

  // Ranked
  ranked: boolean;
  pp: number;
}
```

## Event Flow

1. Plugin adapter receives WebSocket message
2. Adapter parses and normalizes to `GameState`
3. Emits custom event or calls callback
4. UI components update DOM based on new state
