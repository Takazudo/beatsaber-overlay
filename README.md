# BeatSaber Overlay

A lightweight streaming overlay for Beat Saber. Displays real-time gameplay data (score, accuracy, combo, song info) by connecting to Beat Saber mods via WebSocket. Designed to be used as a browser source in OBS or similar streaming software.

Live: <https://takazudo.github.io/beatsaber-overlay/>

Mock demo: <https://takazudo.github.io/beatsaber-overlay/?mock=true>

## Features

- Real-time song card with cover art, title, artist, mapper, difficulty, BPM, accuracy, score, combo, misses, health bar, speed modifier, ranked status, and PP
- Player card with ScoreSaber profile (avatar, country flag, world/country rank, PP)
- Connects to 3 Beat Saber mods with automatic fallback: BeatSaberPlus, HTTP(sira)Status, DataPuller
- Mock mode for testing without Beat Saber
- Style customization via URL query parameters
- Static site — no backend required, hosted on GitHub Pages
- Outfit Light 300 font for a clean, modern look

## Setup for Streaming

### 1. Install a Beat Saber Mod

You need one of the following mods installed in Beat Saber:

| Mod | WebSocket Port |
|-----|---------------|
| [BeatSaberPlus](https://github.com/nicemicro/BeatSaberPlus) | 2947 |
| [HTTP(sira)Status](https://github.com/denpadokei/HttpSiraStatus) | 6557 |
| [DataPuller](https://github.com/ReadieFur/BSDataPuller) | 2946 |

The overlay tries each in order and connects to whichever is available.

### 2. Add Browser Source in OBS

1. In OBS, add a **Browser Source**
2. Set the URL to:

```
https://takazudo.github.io/beatsaber-overlay/
```

3. Set width to `1920` and height to `1080` (match your stream resolution)
4. Check **"Shutdown source when not visible"** (optional, saves resources)

### 3. Configure with URL Parameters

Customize the overlay by appending query parameters to the URL. For example:

```
https://takazudo.github.io/beatsaber-overlay/?pid=76561198012345678&md=true&scpos=bottom-right
```

## URL Parameters

### Connection

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `ip` | string | `localhost` | Beat Saber mod server IP address. Use this if Beat Saber runs on a different PC |
| `mock` | boolean | `false` | Enable mock mode for testing without Beat Saber |

### Player Card

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `pid` | string | *(none)* | ScoreSaber player ID. Player card is hidden if not set. Find your ID on [scoresaber.com](https://scoresaber.com/) |

### Display

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `md` | boolean | `false` | Show miss counter during gameplay |

### Positioning

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `scpos` | string | `bottom-left` | Song card position |
| `pcpos` | string | `top-right` | Player card position |

Valid positions: `top-left`, `top-right`, `bottom-left`, `bottom-right`

### Scaling

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `scsc` | number | `1.0` | Song card scale (0.1 - 2.0) |
| `pcsc` | number | `1.0` | Player card scale (0.1 - 2.0) |

### Style Tweaks

Custom CSS overrides for streamer customization:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `bg` | string | *(none)* | Card background color (hex without `#`, e.g. `1a1a2e`) |
| `fg` | string | *(none)* | Text color (hex without `#`) |
| `opacity` | number | `1.0` | Card opacity (0.0 - 1.0) |
| `radius` | number | `12` | Border radius in px |
| `css` | string | *(none)* | Raw CSS to inject (URL-encoded) |

#### Style Examples

Dark blue background with white text at 80% opacity:

```
?bg=1a1a2e&fg=ffffff&opacity=0.8
```

Sharp corners with custom background:

```
?radius=0&bg=000000
```

Custom blur effect:

```
?css=.song-card{backdrop-filter:blur(20px)}
```

## Mock Mode

Add `?mock=true` to the URL to test the overlay without Beat Saber. Mock mode simulates a complete gameplay session:

1. **Menu** (3s) — Player card visible
2. **Playing** (30s) — Song card with live-updating score, combo, accuracy, time
3. **Paused** (3s) — Paused state
4. **Playing** (15s) — Resumes with continued data
5. **Finished** (5s) — Final score display
6. Loops back to menu with the next song

The mock cycles through 3 hardcoded songs with realistic score progression, occasional misses, and health fluctuations.

## Display Details

### Song Card

Shown during gameplay (playing, paused, finished states):

- Cover art (hidden if unavailable)
- Song title, artist, mapper
- BSR key
- Difficulty badge (color-coded)
- BPM
- Elapsed time / total duration
- Accuracy percentage with letter grade
- Score (formatted with commas)
- Combo count
- Miss counter (when enabled)
- Health bar (color shifts green to red)
- Speed modifier (shown when not 1.0x)
- Ranked badge with PP value

### Player Card

Shown on the menu screen (between songs):

- Profile avatar
- Country flag emoji
- Player name
- World rank
- Country rank
- Performance Points (PP)

### Accuracy Grades

| Range | Grade |
|-------|-------|
| 90%+ | SS |
| 80%+ | S |
| 65%+ | A |
| 50%+ | B |
| 35%+ | C |
| 20%+ | D |
| <20% | E |

### Difficulty Colors

| Difficulty | Color |
|-----------|-------|
| Easy | #008055 |
| Normal | #1268a1 |
| Hard | #bd5500 |
| Expert | #b52a1c |
| Expert+ | #454088 |

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/Takazudo/beatsaber-overlay.git
cd beatsaber-overlay
npm install
```

### Dev Server

```bash
npm run dev
```

Open <http://localhost:5173/beatsaber-overlay/?mock=true> to test with mock data.

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- Vite
- TypeScript (strict)
- Vanilla JS (no framework, no jQuery)
- CSS with custom properties
- Outfit (Google Fonts, Light 300)

## Architecture

```
src/
  main.ts                  # Bootstrap
  types.ts                 # Shared type definitions
  config.ts                # Constants and defaults
  params.ts                # URL query parameter parsing + style tweaks
  style.css                # Global styles and CSS custom properties
  index.html               # Entry point
  connection/
    manager.ts             # WebSocket connection manager with fallback
    bs-plus.ts             # BeatSaberPlus adapter (port 2947)
    http-sira.ts           # HTTP(sira)Status adapter (port 6557)
    data-puller.ts         # DataPuller adapter (port 2946)
    shared.ts              # Shared defaults and utilities
  components/
    song-card.ts / .css    # Song/gameplay display
    player-card.ts / .css  # Player stats display
  api/
    scoresaber.ts          # ScoreSaber API client
    beatsaver.ts           # BeatSaver API client
  mock/
    mock-server.ts         # Mock data provider for testing
  utils/
    dom.ts                 # DOM helper utilities
```

## Credits

Inspired by [HyldraZolxy/BeatSaber-Overlay](https://github.com/HyldraZolxy/BeatSaber-Overlay), which is no longer hosted. This is a modern rewrite with Vite, TypeScript, and additional features (mock mode, style tweaks).

## License

MIT
