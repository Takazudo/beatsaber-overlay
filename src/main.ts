import "./style.css";

import type { GameState } from "./types";
import { parseParams, applyStyleTweaks } from "./params";
import { MockServer } from "./mock/mock-server";
import { ConnectionManager } from "./connection/manager";
import { SongCard } from "./components/song-card";
import { PlayerCard } from "./components/player-card";
import { fetchPlayerInfo } from "./api/scoresaber";
import { fetchMapByHash } from "./api/beatsaver";

function main() {
  // 1. Parse URL params
  const params = parseParams();

  // 2. Apply style tweaks
  applyStyleTweaks(params);

  // 3. Set up UI components
  const songCard = new SongCard();
  const playerCard = new PlayerCard();

  // Apply positioning and scaling
  const songCardEl = document.getElementById("song-card");
  const playerCardEl = document.getElementById("player-card");

  if (songCardEl) {
    songCardEl.classList.add(params.scpos);
    if (params.scsc !== 1.0) {
      songCardEl.style.transform = `scale(${params.scsc})`;
    }
  }
  if (playerCardEl) {
    playerCardEl.classList.add(params.pcpos);
    if (params.pcsc !== 1.0) {
      playerCardEl.style.transform = `scale(${params.pcsc})`;
    }
  }

  // 4. State update handler
  let lastSongHash = "";
  let beatSaverCoverUrl = "";
  let beatSaverBsr = "";

  function onGameStateUpdate(state: GameState) {
    // Apply persisted BeatSaver data to every state update
    if (beatSaverCoverUrl && state.songHash === lastSongHash) {
      state.coverUrl = beatSaverCoverUrl;
    }
    if (beatSaverBsr && !state.bsr && state.songHash === lastSongHash) {
      state.bsr = beatSaverBsr;
    }

    songCard.update(state, params.md);

    if (state.playState === "playing" || state.playState === "paused") {
      songCard.show();
      playerCard.hide();
    } else if (state.playState === "menu") {
      songCard.hide();
      playerCard.show();
    } else if (state.playState === "finished") {
      songCard.show();
      playerCard.hide();
    }

    // Fetch cover + BSR from BeatSaver when a new song starts
    if (state.songHash && state.songHash !== lastSongHash) {
      lastSongHash = state.songHash;
      beatSaverCoverUrl = "";
      beatSaverBsr = "";
      fetchMapByHash(state.songHash).then((mapInfo) => {
        if (mapInfo) {
          if (mapInfo.coverUrl) {
            beatSaverCoverUrl = mapInfo.coverUrl;
          }
          if (mapInfo.bsr) {
            beatSaverBsr = mapInfo.bsr;
          }
        }
      });
    }
  }

  // 5. Start data source
  if (params.mock) {
    const mock = new MockServer();
    mock.start(onGameStateUpdate);

    // Use mock player data for player card
    playerCard.update(mock.playerInfo);
    playerCard.show();
  } else {
    const manager = new ConnectionManager(params.ip, onGameStateUpdate);
    manager.connect();
  }

  // 6. Fetch ScoreSaber player info if pid is set (skip in mock mode)
  if (params.pid && !params.mock) {
    fetchPlayerInfo(params.pid).then((info) => {
      if (info) {
        playerCard.update(info);
      }
    });
  }
}

main();
