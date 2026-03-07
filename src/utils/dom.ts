import { GRADE_THRESHOLDS } from "../config";

export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function $$(selector: string): NodeListOf<HTMLElement> {
  return document.querySelectorAll(selector);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatScore(score: number): string {
  return score.toLocaleString("en-US");
}

export function getGrade(accuracy: number): string {
  const entry = GRADE_THRESHOLDS.find((t) => accuracy >= t.min);
  return entry ? entry.grade : "E";
}
