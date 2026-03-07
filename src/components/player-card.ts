import type { PlayerInfo } from "../types";
import { $ } from "../utils/dom";
import "./player-card.css";

function countryCodeToFlag(code: string): string {
  if (code.length < 2) return "";
  const upper = code.toUpperCase();
  const offset = 0x1f1e6 - 65; // 'A' = 65
  return String.fromCodePoint(
    upper.charCodeAt(0) + offset,
    upper.charCodeAt(1) + offset,
  );
}

export class PlayerCard {
  private el: HTMLElement;

  private avatarEl: HTMLImageElement;
  private flagEl: HTMLElement;
  private nameEl: HTMLElement;
  private worldRankEl: HTMLElement;
  private countryRankEl: HTMLElement;
  private countryFlagEl: HTMLElement;
  private ppEl: HTMLElement;

  constructor() {
    const container = $("#player-card");
    if (!container) throw new Error("Missing #player-card container");

    container.innerHTML = `
      <div class="player-card">
        <img class="player-card__avatar" src="" alt="Avatar" />
        <div class="player-card__info">
          <div class="player-card__name">
            <span class="player-card__flag"></span>
            <span class="player-card__name-text"></span>
          </div>
          <div class="player-card__ranks">
            <span class="player-card__world-rank"></span>
            <span class="player-card__country-rank">
              <span class="player-card__country-flag"></span>
            </span>
          </div>
          <div class="player-card__pp"></div>
        </div>
      </div>
    `;

    this.el = container.querySelector(".player-card")!;
    this.avatarEl = this.el.querySelector(".player-card__avatar")!;
    this.flagEl = this.el.querySelector(".player-card__flag")!;
    this.nameEl = this.el.querySelector(".player-card__name-text")!;
    this.worldRankEl = this.el.querySelector(".player-card__world-rank")!;
    this.countryRankEl = this.el.querySelector(".player-card__country-rank")!;
    this.countryFlagEl = this.el.querySelector(".player-card__country-flag")!;
    this.ppEl = this.el.querySelector(".player-card__pp")!;
  }

  update(info: PlayerInfo): void {
    this.avatarEl.src = info.avatar;
    this.nameEl.textContent = info.name;

    const flag = countryCodeToFlag(info.country);
    this.flagEl.textContent = flag;
    this.countryFlagEl.textContent = flag;

    this.worldRankEl.textContent = info.worldRank.toLocaleString("en-US");
    // Country rank text goes after the flag span inside the element
    // We need to set the rank number after the flag
    const rankText = info.countryRank.toLocaleString("en-US");
    this.countryFlagEl.textContent = flag;
    // Set rank text after the flag span
    const textNode = this.countryRankEl.childNodes[1];
    if (textNode) {
      textNode.textContent = rankText;
    } else {
      this.countryRankEl.appendChild(document.createTextNode(rankText));
    }

    this.ppEl.textContent = `${info.pp.toLocaleString("en-US")}pp`;
  }

  show(): void {
    this.el.classList.add("visible");
  }

  hide(): void {
    this.el.classList.remove("visible");
  }
}
