# Architecture

## Overview

A static web overlay for Beat Saber streamers. Displays real-time gameplay data (score, song info, combo, accuracy) by connecting to Beat Saber mods via WebSocket. Hosted on GitHub Pages.

## Tech Stack

- **Vite** - Build tool and dev server
- **TypeScript** - All source code
- **Vanilla JS** - No framework, no jQuery
- **CSS Modules or vanilla CSS** with custom properties
- **ES Modules** - Native module system

## Directory Structure

```
/
├── doc/                    # Spec and documentation
├── src/
│   ├── index.html          # Entry point
│   ├── main.ts             # Bootstrap
│   ├── style.css           # Global styles
│   ├── types.ts            # Shared type definitions
│   ├── config.ts           # Constants, defaults, enums
│   ├── params.ts           # URL query parameter parsing
│   ├── connection/
│   │   ├── manager.ts      # WebSocket connection manager with fallback
│   │   ├── bs-plus.ts      # BeatSaberPlus adapter (port 2947)
│   │   ├── http-sira.ts    # HTTP(sira)Status adapter (port 6557)
│   │   └── data-puller.ts  # DataPuller adapter (port 2946)
│   ├── components/
│   │   ├── song-card.ts    # Song/gameplay display
│   │   └── player-card.ts  # Player stats display
│   ├── api/
│   │   ├── scoresaber.ts   # ScoreSaber API client
│   │   └── beatsaver.ts    # BeatSaver API client
│   ├── mock/
│   │   └── mock-server.ts  # Mock WebSocket data for testing
│   └── utils/
│       └── dom.ts          # DOM helper utilities
├── public/
│   └── fonts/              # Font assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

## No Backend Required

- ScoreSaber and BeatSaver APIs are called directly from the browser
- If CORS is an issue, degrade gracefully (hide player card)
- All WebSocket connections are to localhost (Beat Saber mods)
- GitHub Pages serves static files only
