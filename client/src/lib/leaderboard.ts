export type GameId = "run" | "memory" | "breaker";

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
  const res = await fetch(`/api/leaderboard?gameId=${gameId}`);
  if (!res.ok) {
    return { entries: [], cutoffScore: 0 };
  }
  return res.json();
}

export async function submitLeaderboardScore(
  gameId: GameId,
  playerName: string,
  score: number,
): Promise<{ accepted: boolean; message: string; rank?: number; entries: LeaderboardEntry[] }> {
  const res = await fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, playerName, score }),
  });
  const data = await res.json();
  return data;
}
