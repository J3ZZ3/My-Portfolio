export type GameId = "run" | "memory" | "breaker" | "chess";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  cutoffScore: number;
}

export function qualifiesForLeaderboard(
  score: number,
  entryCount: number,
  cutoffScore: number,
): boolean {
  if (!Number.isFinite(score) || score <= 0) return false;
  if (entryCount < 3) return true;
  return score > cutoffScore;
}

export async function fetchLeaderboard(gameId: GameId): Promise<LeaderboardData> {
  try {
    const res = await fetch(`/api/leaderboard?gameId=${gameId}`);
    if (!res.ok) return { entries: [], cutoffScore: 0 };
    const text = await res.text();
    return JSON.parse(text) as LeaderboardData;
  } catch {
    return { entries: [], cutoffScore: 0 };
  }
}

export async function submitLeaderboardScore(
  gameId: GameId,
  playerName: string,
  score: number,
): Promise<{ accepted: boolean; message: string; rank?: number; entries: LeaderboardEntry[] }> {
  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, playerName, score }),
    });
    const text = await res.text();
    const data = JSON.parse(text);
    return data;
  } catch {
    return {
      accepted: false,
      message: "Leaderboard uplink failed. Try again later.",
      entries: [],
    };
  }
}
