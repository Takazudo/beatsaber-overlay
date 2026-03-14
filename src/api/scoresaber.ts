import type { PlayerInfo } from "../types";

const API_BASE = "https://scoresaber.com/api";

export async function fetchPlayerInfo(
  playerId: string,
): Promise<PlayerInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/player/${playerId}/basic`);
    if (!res.ok) {
      console.warn(
        `ScoreSaber API error: ${res.status} for player ${playerId}`,
      );
      return null;
    }
    const data = await res.json();
    return {
      name: data.name ?? "",
      avatar: data.profilePicture ?? "",
      country: data.country ?? "",
      worldRank: data.rank ?? 0,
      countryRank: data.countryRank ?? 0,
      pp: data.pp ?? 0,
    };
  } catch (err) {
    console.warn("ScoreSaber API request failed (possibly CORS blocked):", err);
    return null;
  }
}
