import type { Difficulty, OverlayParams } from "./types";

export const PORTS = {
  BS_PLUS: 2947,
  HTTP_SIRA: 6557,
  DATA_PULLER: 2946,
} as const;

export const DEFAULT_PARAMS: OverlayParams = {
  ip: "localhost",
  pid: "",
  mock: false,
  md: false,
  scpos: "bottom-left",
  pcpos: "top-right",
  scsc: 1.0,
  pcsc: 1.0,
  bg: "",
  fg: "",
  opacity: 1.0,
  radius: null,
  css: "",
};

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
] as const;

export const GRADE_COLORS: Record<string, string> = {
  SS: "#ffd700",
  S: "#c0c0c0",
  A: "#00cc44",
  B: "#2196f3",
  C: "#ff9800",
  D: "#f44336",
  E: "#9e9e9e",
};
