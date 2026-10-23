import { createHash } from "node:crypto";
import { API_ERRORS, type ApiErrorBody } from "./apiErrors";

export const CHAT_BURST_LIMIT = 8;
export const CHAT_BURST_WINDOW_SECONDS = 60;
export const CHAT_DAILY_LIMIT = 40;
export const CHAT_DAILY_WINDOW_SECONDS = 24 * 60 * 60;
export const LEADERBOARD_SUBMIT_LIMIT = 10;
export const LEADERBOARD_SUBMIT_WINDOW_SECONDS = 10 * 60;

export interface CounterStore {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
  ttl(key: string): Promise<number>;
}

export type LimitDecision =
  | { status: "allowed" }
  | { status: "limited"; retryAfterSeconds: number }
  | { status: "unavailable" };

export interface LimitHttpResponse {
  status: 429 | 503;
  body: ApiErrorBody;
  retryAfter?: number;
}

type HeaderValue = string | string[] | undefined;

export interface ClientIdentityInput {
  platform: "vercel" | "node";
  headers: Record<string, HeaderValue>;
  socketAddress?: string | null;
}

function headerValue(headers: Record<string, HeaderValue>, name: string): string {
  const raw = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw ?? "";
}

function isIpv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const octet = Number(part);
    return octet >= 0 && octet <= 255;
  });
}

function isIpv6(value: string): boolean {
  if (!value || value.length > 45 || value.includes(",")) return false;
  if (!/^[0-9a-fA-F:]+$/.test(value)) return false;
  const groups = value.split("::");
  if (groups.length > 2) return false;
  const segments = value.split(":").filter((segment) => segment.length > 0);
  return segments.length >= 2 && segments.length <= 8 && segments.every((segment) => /^[0-9a-fA-F]{1,4}$/.test(segment) || segment.includes("."));
}

function isSingleIp(value: string): boolean {
  const trimmed = value.trim();
  return isIpv4(trimmed) || isIpv6(trimmed);
}

export function hashClientToken(token: string): string {
  return createHash("sha256").update(`portfolio-rl:${token}`).digest("hex").slice(0, 32);
}

export function trustedClientToken(input: ClientIdentityInput): string {
  if (input.platform === "vercel") {
    const realIp = headerValue(input.headers, "x-real-ip").trim();
    if (isSingleIp(realIp)) return realIp;
    const forwarded = headerValue(input.headers, "x-forwarded-for").split(",")[0]?.trim() ?? "";
    if (isSingleIp(forwarded)) return forwarded;
    return "unidentified";
  }

  const socketAddress = input.socketAddress?.trim() || "local";
  return socketAddress;
}

export function rateLimitKey(scope: string, token: string): string {
  return `rl:${scope}:${hashClientToken(token)}`;
}

export async function consumeFixedWindow(
  store: CounterStore,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<LimitDecision> {
  try {
    const count = await store.incr(key);
    if (count === 1) await store.expire(key, windowSeconds);
    if (count > limit) {
      let retryAfterSeconds = windowSeconds;
      try {
        const ttl = await store.ttl(key);
        if (ttl > 0) retryAfterSeconds = ttl;
      } catch {
        retryAfterSeconds = windowSeconds;
      }
      return { status: "limited", retryAfterSeconds };
    }
    return { status: "allowed" };
  } catch {
    return { status: "unavailable" };
  }
}

export async function enforceLimit(options: {
  store: CounterStore | null;
  requireStore: boolean;
  checks: { key: string; limit: number; windowSeconds: number }[];
}): Promise<LimitDecision> {
  if (!options.store) {
    return options.requireStore ? { status: "unavailable" } : { status: "allowed" };
  }

  for (const check of options.checks) {
    const decision = await consumeFixedWindow(options.store, check.key, check.limit, check.windowSeconds);
    if (decision.status !== "allowed") return decision;
  }
  return { status: "allowed" };
}

export function limitHttpResponse(decision: LimitDecision): LimitHttpResponse | null {
  if (decision.status === "allowed") return null;
  if (decision.status === "limited") {
    return {
      status: API_ERRORS.rateLimited.status,
      body: { error: API_ERRORS.rateLimited.error, code: API_ERRORS.rateLimited.code },
      retryAfter: decision.retryAfterSeconds,
    };
  }
  return {
    status: API_ERRORS.busy.status,
    body: { error: API_ERRORS.busy.error, code: API_ERRORS.busy.code },
  };
}

export function chatLimitChecks(token: string) {
  return [
    {
      key: rateLimitKey("chat:burst", token),
      limit: CHAT_BURST_LIMIT,
      windowSeconds: CHAT_BURST_WINDOW_SECONDS,
    },
    {
      key: rateLimitKey("chat:day", token),
      limit: CHAT_DAILY_LIMIT,
      windowSeconds: CHAT_DAILY_WINDOW_SECONDS,
    },
  ];
}

export function leaderboardSubmitChecks(token: string) {
  return [
    {
      key: rateLimitKey("lb", token),
      limit: LEADERBOARD_SUBMIT_LIMIT,
      windowSeconds: LEADERBOARD_SUBMIT_WINDOW_SECONDS,
    },
  ];
}

export function limiterRequired(): boolean {
  return Boolean(process.env.VERCEL);
}

export function identityFromHeaders(
  headers: Record<string, HeaderValue>,
  socketAddress?: string | null,
): string {
  return trustedClientToken({
    platform: limiterRequired() ? "vercel" : "node",
    headers,
    socketAddress,
  });
}
