import type { OverlayParams } from "./types";

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
