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

export type LeaderboardFetch =
  | ({ ok: true } & LeaderboardData)
  | { ok: false; error: string };

export interface ScoreSubmitResult {
  accepted: boolean;
  message: string;
  rank?: number;
  entries: LeaderboardEntry[];
  cutoffScore?: number;
  code?: string;
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

const OFFLINE_MESSAGE = "Leaderboard uplink failed. Try again later.";
const BUSY_MESSAGE = "Channel busy. Try again shortly.";

function publicMessage(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 160 || trimmed.includes("\n")) return fallback;
  return trimmed;
}

export async function fetchLeaderboard(gameId: GameId): Promise<LeaderboardFetch> {
  try {
    const res = await fetch(`/api/leaderboard?gameId=${gameId}`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !Array.isArray(data.entries) || typeof data.cutoffScore !== "number") {
      return { ok: false, error: publicMessage(data?.error, OFFLINE_MESSAGE) };
    }
    return { ok: true, entries: data.entries, cutoffScore: data.cutoffScore };
  } catch {
    return { ok: false, error: OFFLINE_MESSAGE };
  }
}

export async function submitLeaderboardScore(
  gameId: GameId,
  playerName: string,
  score: number,
): Promise<ScoreSubmitResult> {
  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, playerName, score }),
    });
    const data = await res.json().catch(() => null);
    if (res.status === 429 || data?.code === "rate_limited") {
      return { accepted: false, message: BUSY_MESSAGE, entries: [], code: "rate_limited" };
    }
    if (data && typeof data.accepted === "boolean") {
      return {
        accepted: data.accepted,
        message: publicMessage(data.message, data.accepted ? "Score recorded." : OFFLINE_MESSAGE),
        rank: typeof data.rank === "number" ? data.rank : undefined,
        entries: Array.isArray(data.entries) ? data.entries : [],
        cutoffScore: typeof data.cutoffScore === "number" ? data.cutoffScore : undefined,
        code: typeof data.code === "string" ? data.code : undefined,
      };
    }
    return {
      accepted: false,
      message: publicMessage(data?.error, OFFLINE_MESSAGE),
      entries: [],
      code: typeof data?.code === "string" ? data.code : undefined,
    };
  } catch {
    return {
      accepted: false,
      message: OFFLINE_MESSAGE,
      entries: [],
    };
  }
}
