import "./style.css";
// Component CSS - will exist after merge with UI topic
// import "./components/song-card.css";
// import "./components/player-card.css";

import type { GameState } from "./types";
import { parseParams, applyStyleTweaks } from "./params";
import { MockServer } from "./mock/mock-server";
import { fetchPlayerInfo } from "./api/scoresaber";

// These imports will resolve after merging with connection and UI topics.
// They're kept as dynamic imports so the app doesn't crash if modules aren't available yet.
async function loadConnectionManager() {
  try {
    const mod = await import("./connection/manager");
    return mod.ConnectionManager;
  } catch {
    console.warn("ConnectionManager not available yet (pre-merge)");
    return null;
  }
}

async function loadComponents() {
  try {
    const [songCard, playerCard] = await Promise.all([
      import("./components/song-card"),
      import("./components/player-card"),
    ]);
    return {
      SongCard: songCard.SongCard,
      PlayerCard: playerCard.PlayerCard,
    };
  } catch {
    console.warn("UI components not available yet (pre-merge)");
    return null;
  }
}

async function main() {
  // 1. Parse URL params
  const params = parseParams();

  // 2. Apply style tweaks
  applyStyleTweaks(params);

  // 3. Load UI components
  const components = await loadComponents();

  let songCard: { update: (state: GameState) => void } | null = null;
  let playerCard: {
    update: (info: {
      name: string;
      avatar: string;
      country: string;
      worldRank: number;
      countryRank: number;
      pp: number;
    }) => void;
    show: () => void;
    hide: () => void;
  } | null = null;

  if (components) {
    const app = document.getElementById("app");
    if (app) {
      songCard = new components.SongCard(app, {
        position: params.scpos,
        scale: params.scsc,
        showMissCounter: params.md,
      });
      playerCard = new components.PlayerCard(app, {
        position: params.pcpos,
        scale: params.pcsc,
      });
    }
  }

  // 4. State update handler
  function onGameStateUpdate(state: GameState) {
    songCard?.update(state);

    if (state.playState === "menu") {
      playerCard?.show();
    } else {
      playerCard?.hide();
    }
  }

  // 5. Start data source
  if (params.mock) {
    const mock = new MockServer();
    mock.start(onGameStateUpdate);

    // Use mock player data for player card
    if (playerCard) {
      playerCard.update(mock.playerInfo);
    }
  } else {
    const ConnectionManager = await loadConnectionManager();
    if (ConnectionManager) {
      const manager = new ConnectionManager(params.ip, onGameStateUpdate);
      manager.start();
    }
  }

  // 6. Fetch ScoreSaber player info if pid is set
  if (params.pid && playerCard) {
    const info = await fetchPlayerInfo(params.pid);
    if (info) {
      playerCard.update(info);
    }
  }
}

main();
