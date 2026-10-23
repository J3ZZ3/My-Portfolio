export const GAME_IDS = ["run", "memory", "breaker", "chess"] as const;
export type GameId = (typeof GAME_IDS)[number];

export const NAME_MIN = 2;
export const NAME_MAX = 16;
export const INVALID_NAME_MESSAGE = "Invalid player name. Use 2-16 letters, numbers, or spaces.";
export const INVALID_SCORE_MESSAGE = "Invalid score.";

const SCORE_MAX: Record<GameId, number> = {
  run: 1_000_000,
  memory: 500,
  breaker: 1_000,
  chess: 100,
};

export function isValidGameId(id: string): id is GameId {
  return (GAME_IDS as readonly string[]).includes(id);
}

export function sanitizePlayerName(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) return null;
  if (!/^[a-zA-Z0-9 ]+$/.test(trimmed)) return null;
  return trimmed;
}

export function validateScore(gameId: GameId, score: unknown): number | null {
  if (typeof score !== "number" || !Number.isInteger(score)) return null;
  if (score <= 0 || score > SCORE_MAX[gameId]) return null;
  return score;
}
