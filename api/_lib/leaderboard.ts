import { Redis } from "@upstash/redis";
import {
  GAME_IDS,
  INVALID_NAME_MESSAGE,
  INVALID_SCORE_MESSAGE,
  isValidGameId,
  sanitizePlayerName,
  validateScore,
  type GameId,
} from "../../shared/leaderboardRules";

export { GAME_IDS, isValidGameId, type GameId };

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  cutoffScore: number;
}

export interface SubmitResult extends LeaderboardResult {
  accepted: boolean;
  rank?: number;
  message: string;
}

const MAX_STORED = 100;
const TOP_N = 3;

function redisKey(gameId: GameId): string {
  return `lb:${gameId}`;
}

function getUpstashEnv(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL ??
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.STORAGE_UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.STORAGE_UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export function tryGetRedis(): Redis | null {
  const env = getUpstashEnv();
  if (!env) return null;
  return new Redis({ url: env.url, token: env.token });
}

function getRedis(): Redis {
  const redis = tryGetRedis();
  if (!redis) throw new Error("Leaderboard storage not configured");
  return redis;
}

function parseMember(member: string): { name: string; ts: number } {
  const colon = member.indexOf(":");
  if (colon === -1) return { name: member, ts: 0 };
  const ts = Number(member.slice(0, colon));
  const name = member.slice(colon + 1);
  return { name, ts: Number.isFinite(ts) ? ts : 0 };
}

function formatMember(name: string): string {
  return `${Date.now()}:${name}`;
}

export function scoreQualifies(score: number, cutoffScore: number, entryCount: number): boolean {
  if (!Number.isInteger(score) || score <= 0) return false;
  if (entryCount < TOP_N) return true;
  return score > cutoffScore;
}

async function fetchRawTop(redis: Redis, gameId: GameId, count: number) {
  const key = redisKey(gameId);
  const raw = await redis.zrange(key, 0, count - 1, { rev: true, withScores: true });

  const entries: { name: string; score: number; ts: number }[] = [];
  if (!raw || raw.length === 0) return entries;

  for (let i = 0; i < raw.length; i += 2) {
    const member = String(raw[i]);
    const score = Number(raw[i + 1]);
    const { name, ts } = parseMember(member);
    entries.push({ name, score, ts });
  }

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.ts - b.ts;
  });

  return entries;
}

function toLeaderboardResult(entries: { name: string; score: number }[]): LeaderboardResult {
  const top = entries.slice(0, TOP_N).map((e, i) => ({
    rank: i + 1,
    name: e.name,
    score: e.score,
  }));
  const cutoffScore = top.length >= TOP_N ? top[TOP_N - 1].score : 0;
  return { entries: top, cutoffScore };
}

export async function getLeaderboard(gameId: GameId): Promise<LeaderboardResult> {
  const redis = getRedis();
  const raw = await fetchRawTop(redis, gameId, TOP_N);
  return toLeaderboardResult(raw);
}

export async function submitScore(
  gameId: GameId,
  playerName: string,
  score: number,
): Promise<SubmitResult> {
  const name = sanitizePlayerName(playerName);
  if (!name) {
    return {
      accepted: false,
      message: INVALID_NAME_MESSAGE,
      entries: [],
      cutoffScore: 0,
    };
  }

  const checkedScore = validateScore(gameId, score);
  if (checkedScore === null) {
    return {
      accepted: false,
      message: INVALID_SCORE_MESSAGE,
      entries: [],
      cutoffScore: 0,
    };
  }

  const redis = getRedis();
  const current = await fetchRawTop(redis, gameId, TOP_N);
  const { cutoffScore } = toLeaderboardResult(current);

  if (!scoreQualifies(checkedScore, cutoffScore, current.length)) {
    const refreshed = await getLeaderboard(gameId);
    return {
      accepted: false,
      message: "Score did not qualify for the top 3.",
      ...refreshed,
    };
  }

  const key = redisKey(gameId);
  await redis.zadd(key, { score: checkedScore, member: formatMember(name) });

  const count = await redis.zcard(key);
  if (count > MAX_STORED) {
    await redis.zremrangebyrank(key, 0, count - MAX_STORED - 1);
  }

  const updated = await getLeaderboard(gameId);
  const rank = updated.entries.find((e) => e.name === name && e.score === checkedScore)?.rank;

  return {
    accepted: true,
    rank,
    message: rank
      ? `Congratulations! You ranked #${rank} on the leaderboard.`
      : "Score recorded. Check the leaderboard for your rank.",
    ...updated,
  };
}
