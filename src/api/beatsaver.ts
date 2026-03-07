const API_BASE = "https://api.beatsaver.com";

export async function fetchBsrByHash(hash: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/maps/hash/${hash}`);
    if (!res.ok) {
      console.warn(`BeatSaver API error: ${res.status} for hash ${hash}`);
      return null;
    }
    const data = await res.json();
    return data.id ?? null;
  } catch (err) {
    console.warn("BeatSaver API request failed:", err);
    return null;
  }
}
