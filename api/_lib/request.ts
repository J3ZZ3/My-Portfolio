import { tryGetRedis } from "./leaderboard";
import { counterStore } from "./counters";
import { identityFromHeaders, type CounterStore } from "../../shared/rateLimit";

type HeaderValue = string | string[] | undefined;

export function contentLengthHeader(value: HeaderValue): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function limiterStore(): CounterStore | null {
  const redis = tryGetRedis();
  return redis ? counterStore(redis) : null;
}

export function clientTokenFrom(request: {
  headers: Record<string, HeaderValue>;
  socket?: { remoteAddress?: string | null };
}): string {
  return identityFromHeaders(request.headers, request.socket?.remoteAddress);
}
