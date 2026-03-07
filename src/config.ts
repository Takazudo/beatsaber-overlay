import type { Difficulty } from "./types";

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: "#008055",
  Normal: "#1268a1",
  Hard: "#bd5500",
  Expert: "#b52a1c",
  ExpertPlus: "#454088",
};

export const GRADE_THRESHOLDS = [
  { min: 90, grade: "SS" },
  { min: 80, grade: "S" },
  { min: 65, grade: "A" },
  { min: 50, grade: "B" },
  { min: 35, grade: "C" },
  { min: 20, grade: "D" },
  { min: 0, grade: "E" },
];

export const GRADE_COLORS: Record<string, string> = {
  SS: "#fff",
  S: "#fff",
  A: "#4caf50",
  B: "#8bc34a",
  C: "#ff9800",
  D: "#f44336",
  E: "#9e9e9e",
};
