const API_BASE = "https://api.beatsaver.com";

export interface BeatSaverMapInfo {
  bsr: string;
  coverUrl: string;
}

export async function fetchMapByHash(
  hash: string,
): Promise<BeatSaverMapInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/maps/hash/${hash}`);
    if (!res.ok) {
      console.warn(`BeatSaver API error: ${res.status} for hash ${hash}`);
      return null;
    }
    const data = await res.json();
    const coverUrl = data.versions?.[0]?.coverURL ?? "";
    return {
      bsr: data.id ?? "",
      coverUrl,
    };
  } catch (err) {
    console.warn("BeatSaver API request failed:", err);
    return null;
  }
}
