import type { CardPosition, OverlayParams } from "./types";
import { DEFAULT_PARAMS } from "./config";

const VALID_POSITIONS: CardPosition[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  return value === "true" || value === "1" || value === "";
}

function parseNumber(
  value: string | null,
  min: number,
  max: number,
): number | undefined {
  if (value === null) return undefined;
  const n = parseFloat(value);
  if (isNaN(n)) return undefined;
  return Math.max(min, Math.min(max, n));
}

function parsePosition(value: string | null): CardPosition | undefined {
  if (value === null) return undefined;
  if (VALID_POSITIONS.includes(value as CardPosition)) {
    return value as CardPosition;
  }
  return undefined;
}

export function parseParams(): OverlayParams {
  const search = new URLSearchParams(window.location.search);

  const params: OverlayParams = { ...DEFAULT_PARAMS };

  const ip = search.get("ip");
  if (ip) params.ip = ip;

  const pid = search.get("pid");
  if (pid) params.pid = pid;

  const mock = parseBoolean(search.get("mock"));
  if (mock !== undefined) params.mock = mock;

  const md = parseBoolean(search.get("md"));
  if (md !== undefined) params.md = md;

  const scpos = parsePosition(search.get("scpos"));
  if (scpos) params.scpos = scpos;

  const pcpos = parsePosition(search.get("pcpos"));
  if (pcpos) params.pcpos = pcpos;

  const scsc = parseNumber(search.get("scsc"), 0.1, 2.0);
  if (scsc !== undefined) params.scsc = scsc;

  const pcsc = parseNumber(search.get("pcsc"), 0.1, 2.0);
  if (pcsc !== undefined) params.pcsc = pcsc;

  const bg = search.get("bg");
  if (bg) params.bg = bg;

  const fg = search.get("fg");
  if (fg) params.fg = fg;

  const opacity = parseNumber(search.get("opacity"), 0.0, 1.0);
  if (opacity !== undefined) params.opacity = opacity;

  const radius = search.get("radius");
  if (radius !== null) {
    const r = parseFloat(radius);
    if (!isNaN(r) && r >= 0) params.radius = r;
  }

  const css = search.get("css");
  if (css) params.css = css;

  return params;
}

export function applyStyleTweaks(params: OverlayParams): void {
  const rules: string[] = [];

  if (params.bg) {
    const color = params.bg.match(/^[0-9a-fA-F]{3,8}$/)
      ? `#${params.bg}`
      : params.bg;
    rules.push(`--overlay-bg: ${color};`);
  }

  if (params.fg) {
    const color = params.fg.match(/^[0-9a-fA-F]{3,8}$/)
      ? `#${params.fg}`
      : params.fg;
    rules.push(`--overlay-fg: ${color};`);
  }

  if (params.opacity !== 1.0) {
    rules.push(`--overlay-opacity: ${params.opacity};`);
  }

  if (params.radius !== null) {
    rules.push(`--overlay-radius: ${params.radius}px;`);
  }

  let cssText = "";

  if (rules.length > 0) {
    cssText += `:root { ${rules.join(" ")} }\n`;
  }

  if (params.css) {
    cssText += params.css + "\n";
  }

  if (cssText) {
    const style = document.createElement("style");
    style.setAttribute("data-overlay-tweaks", "");
    style.textContent = cssText;
    document.head.appendChild(style);
  }
}
