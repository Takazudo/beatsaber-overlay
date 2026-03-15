import type { GameState } from "../types";
import { DIFFICULTY_COLORS, GRADE_COLORS } from "../config";
import { $, formatTime, formatScore, getGrade } from "../utils/dom";
import "./song-card.css";

export class SongCard {
  private el: HTMLElement;

  private coverEl: HTMLImageElement;
  private titleEl: HTMLElement;
  private subtitleEl: HTMLElement;
  private artistEl: HTMLElement;
  private mapperEl: HTMLElement;
  private bsrEl: HTMLElement;
  private difficultyEl: HTMLElement;
  private bpmEl: HTMLElement;
  private timeEl: HTMLElement;
  private accuracyEl: HTMLElement;
  private gradeEl: HTMLElement;
  private scoreEl: HTMLElement;
  private comboEl: HTMLElement;
  private missesEl: HTMLElement;
  private healthFillEl: HTMLElement;
  private speedEl: HTMLElement;
  private rankedEl: HTMLElement;
  private rankedBadgeEl: HTMLElement;
  private ppEl: HTMLElement;

  constructor() {
    const container = $("#song-card");
    if (!container) throw new Error("Missing #song-card container");

    container.innerHTML = `
      <div class="song-card">
        <div class="song-card__main">
          <img class="song-card__cover" alt="" />
          <div class="song-card__info">
            <div class="song-card__title"></div>
            <div class="song-card__subtitle"></div>
            <div class="song-card__artist"></div>
            <div class="song-card__mapper"></div>
            <div class="song-card__meta">
              <span class="song-card__difficulty"></span>
              <span class="song-card__bsr"></span>
              <span class="song-card__bpm"></span>
            </div>
          </div>
        </div>
        <div class="song-card__stats">
          <span class="song-card__accuracy"></span>
          <span class="song-card__grade"></span>
          <span class="song-card__score"></span>
          <span class="song-card__combo"></span>
          <span class="song-card__misses"></span>
        </div>
        <div class="song-card__bottom">
          <span class="song-card__time"></span>
          <span class="song-card__speed"></span>
          <div class="song-card__ranked">
            <span class="song-card__ranked-badge">Ranked</span>
            <span class="song-card__pp"></span>
          </div>
        </div>
        <div class="song-card__health-bar">
          <div class="song-card__health-fill"></div>
        </div>
      </div>
    `;

    this.el = container.querySelector(".song-card")!;
    this.coverEl = this.el.querySelector(".song-card__cover")!;
    this.titleEl = this.el.querySelector(".song-card__title")!;
    this.subtitleEl = this.el.querySelector(".song-card__subtitle")!;
    this.artistEl = this.el.querySelector(".song-card__artist")!;
    this.mapperEl = this.el.querySelector(".song-card__mapper")!;
    this.bsrEl = this.el.querySelector(".song-card__bsr")!;
    this.difficultyEl = this.el.querySelector(".song-card__difficulty")!;
    this.bpmEl = this.el.querySelector(".song-card__bpm")!;
    this.timeEl = this.el.querySelector(".song-card__time")!;
    this.accuracyEl = this.el.querySelector(".song-card__accuracy")!;
    this.gradeEl = this.el.querySelector(".song-card__grade")!;
    this.scoreEl = this.el.querySelector(".song-card__score")!;
    this.comboEl = this.el.querySelector(".song-card__combo")!;
    this.missesEl = this.el.querySelector(".song-card__misses")!;
    this.healthFillEl = this.el.querySelector(".song-card__health-fill")!;
    this.speedEl = this.el.querySelector(".song-card__speed")!;
    this.rankedEl = this.el.querySelector(".song-card__ranked")!;
    this.rankedBadgeEl = this.el.querySelector(".song-card__ranked-badge")!;
    this.ppEl = this.el.querySelector(".song-card__pp")!;
  }

  update(state: GameState, showMisses: boolean): void {
    // Only update cover src when the URL actually changes to avoid
    // re-triggering image loads on every frame (~10Hz)
    const currentSrc = this.coverEl.getAttribute("src") ?? "";
    if (state.coverUrl && state.coverUrl !== currentSrc) {
      this.coverEl.classList.remove("loaded");
      this.coverEl.src = state.coverUrl;
      this.coverEl.onload = () => {
        this.coverEl.classList.add("loaded");
      };
      this.coverEl.onerror = () => {
        this.coverEl.removeAttribute("src");
        this.coverEl.classList.remove("loaded");
      };
    } else if (!state.coverUrl && currentSrc) {
      this.coverEl.removeAttribute("src");
      this.coverEl.classList.remove("loaded");
    }
    this.titleEl.textContent = state.songName;
    this.subtitleEl.textContent = state.songSubName;
    this.artistEl.textContent = state.songAuthor;
    this.mapperEl.textContent = state.mapper ? `Mapped by ${state.mapper}` : "";
    this.bsrEl.textContent = state.bsr ? `!bsr ${state.bsr}` : "";

    // Difficulty
    const diffLabel =
      state.difficulty === "ExpertPlus" ? "Expert+" : state.difficulty;
    this.difficultyEl.textContent = diffLabel;
    this.difficultyEl.style.backgroundColor =
      DIFFICULTY_COLORS[state.difficulty];

    this.bpmEl.textContent = `${state.bpm} BPM`;

    // Time
    this.timeEl.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;

    // Accuracy + Grade
    const grade = getGrade(state.accuracy);
    this.accuracyEl.textContent = `${state.accuracy.toFixed(1)}%`;
    this.gradeEl.textContent = grade;
    this.gradeEl.style.color = GRADE_COLORS[grade] ?? "#fff";

    // Score + Combo
    this.scoreEl.textContent = formatScore(state.score);
    this.comboEl.textContent = `${state.combo}x`;

    // Misses
    if (showMisses) {
      this.missesEl.textContent = `${state.missCount} miss${state.missCount !== 1 ? "es" : ""}`;
      this.missesEl.style.display = "";
    } else {
      this.missesEl.style.display = "none";
    }

    // Health bar
    const healthPct = Math.max(0, Math.min(100, state.health));
    this.healthFillEl.style.width = `${healthPct}%`;
    // Green when high, red when low
    const hue = healthPct * 1.2; // 0=red, 120=green
    this.healthFillEl.style.backgroundColor = `hsl(${hue}, 80%, 50%)`;

    // Speed modifier
    if (state.speedModifier !== 1.0) {
      this.speedEl.textContent = `${state.speedModifier.toFixed(1)}x`;
      this.speedEl.style.display = "";
    } else {
      this.speedEl.style.display = "none";
    }

    // Ranked + PP
    if (state.ranked) {
      this.rankedEl.style.display = "";
      this.ppEl.textContent = `${state.pp.toFixed(1)}pp`;
    } else {
      this.rankedEl.style.display = "none";
    }
  }

  show(): void {
    this.el.classList.add("visible");
  }

  hide(): void {
    this.el.classList.remove("visible");
  }
}
