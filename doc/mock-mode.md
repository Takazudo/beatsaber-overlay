# Mock Mode

## Purpose

Enable development and testing of the overlay without a running Beat Saber instance. Activated via `?mock=true` query parameter.

## Behavior

Mock mode simulates a complete gameplay session by cycling through states:

### State Cycle

1. **Menu** (3 seconds) - Player card visible, song card hidden
2. **Playing** (30 seconds) - Song card visible with live-updating data
3. **Paused** (3 seconds) - Paused state display
4. **Resume Playing** (15 seconds) - Continue with updated data
5. **Finished** (5 seconds) - Final score display
6. Loop back to Menu

### Simulated Data

During "playing" state, the mock updates at ~10Hz:

- **Score**: Increments realistically (based on note timing)
- **Combo**: Builds up, occasionally resets (simulated miss)
- **Accuracy**: Starts at 100%, gradually decreases with misses
- **Health**: Fluctuates between 50-100%
- **Time**: Advances in real-time from 0 to song duration
- **Miss count**: Increments occasionally

### Mock Song Data

Use a hardcoded set of fake songs with realistic metadata:

```typescript
const MOCK_SONGS = [
  {
    songName: "Reality Check Through The Skull",
    songAuthor: "DM DOKURO",
    mapper: "Nuketime",
    difficulty: "ExpertPlus",
    bpm: 225,
    duration: 285,
    coverUrl: "", // use placeholder
    bsr: "25f",
    ranked: true,
    pp: 450,
  },
  // ... more songs
];
```

### Mock Player Data

```typescript
const MOCK_PLAYER = {
  name: "MockPlayer",
  avatar: "", // placeholder
  country: "JP",
  worldRank: 1234,
  countryRank: 56,
  pp: 12345.67,
};
```

## Implementation

- Mock module provides the same normalized `GameState` interface as real plugin adapters
- Connection manager checks `?mock=true` and uses mock provider instead of WebSocket
- No WebSocket connections attempted in mock mode
