import { API_ERRORS, type ApiErrorBody } from "../../shared/apiErrors";
import { MAX_CHAT_BODY_BYTES } from "../../shared/chatRequest";
import {
  INVALID_NAME_MESSAGE,
  INVALID_SCORE_MESSAGE,
  isValidGameId,
  sanitizePlayerName,
  validateScore,
} from "../../shared/leaderboardRules";
import {
  enforceLimit,
  leaderboardSubmitChecks,
  limitHttpResponse,
  limiterRequired,
} from "../../shared/rateLimit";
import { getLeaderboard, submitScore } from "./leaderboard";
import { limiterStore } from "./request";

export interface LeaderboardHttpResult {
  status: number;
  json: unknown;
  retryAfter?: number;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResult(status: number, error: string, code: ApiErrorBody["code"]): LeaderboardHttpResult {
  return { status, json: { error, code } };
}

function readBody(
  body: unknown,
  contentLength: number | null,
): { ok: true; value: unknown } | LeaderboardHttpResult & { ok: false } {
  if (typeof contentLength === "number" && contentLength > MAX_CHAT_BODY_BYTES) {
    return {
      ok: false,
      ...errorResult(API_ERRORS.bodyTooLarge.status, API_ERRORS.bodyTooLarge.error, API_ERRORS.bodyTooLarge.code),
    };
  }

  if (typeof body === "string") {
    if (byteLength(body) > MAX_CHAT_BODY_BYTES) {
      return {
        ok: false,
        ...errorResult(API_ERRORS.bodyTooLarge.status, API_ERRORS.bodyTooLarge.error, API_ERRORS.bodyTooLarge.code),
      };
    }
    try {
      return { ok: true, value: JSON.parse(body) as unknown };
    } catch {
      return {
        ok: false,
        ...errorResult(API_ERRORS.unreadable.status, API_ERRORS.unreadable.error, API_ERRORS.unreadable.code),
      };
    }
  }

  return { ok: true, value: body };
}

export async function handleLeaderboardRequest(input: {
  method: string;
  queryGameId: string;
  body: unknown;
  contentLength: number | null;
  clientToken: string;
}): Promise<LeaderboardHttpResult> {
  try {
    if (input.method === "GET") {
      if (!isValidGameId(input.queryGameId)) {
        return errorResult(API_ERRORS.invalidGame.status, API_ERRORS.invalidGame.error, API_ERRORS.invalidGame.code);
      }
      return { status: 200, json: await getLeaderboard(input.queryGameId) };
    }

    if (input.method !== "POST") {
      return { status: 405, json: { error: "Method Not Allowed" } };
    }

    const limited = limitHttpResponse(
      await enforceLimit({
        store: limiterStore(),
        requireStore: limiterRequired(),
        checks: leaderboardSubmitChecks(input.clientToken),
      }),
    );
    if (limited) {
      return { status: limited.status, json: limited.body, retryAfter: limited.retryAfter };
    }

    const parsed = readBody(input.body, input.contentLength);
    if (!parsed.ok) return parsed;
    if (!isPlainObject(parsed.value)) {
      return errorResult(API_ERRORS.unreadable.status, API_ERRORS.unreadable.error, API_ERRORS.unreadable.code);
    }

    const { gameId, playerName, score } = parsed.value;
    if (typeof gameId !== "string" || !isValidGameId(gameId)) {
      return errorResult(API_ERRORS.invalidGame.status, API_ERRORS.invalidGame.error, API_ERRORS.invalidGame.code);
    }
    if (typeof playerName !== "string" || typeof score !== "number") {
      return errorResult(API_ERRORS.unreadable.status, API_ERRORS.unreadable.error, API_ERRORS.unreadable.code);
    }

    const name = sanitizePlayerName(playerName);
    if (!name) {
      return {
        status: 400,
        json: { accepted: false, message: INVALID_NAME_MESSAGE, entries: [], cutoffScore: 0 },
      };
    }

    const checked = validateScore(gameId, score);
    if (checked === null) {
      return {
        status: 400,
        json: { accepted: false, message: INVALID_SCORE_MESSAGE, entries: [], cutoffScore: 0 },
      };
    }

    const result = await submitScore(gameId, name, checked);
    return { status: result.accepted ? 200 : 400, json: result };
  } catch {
    console.error("[leaderboard] request failed");
    return errorResult(
      API_ERRORS.leaderboardOffline.status,
      API_ERRORS.leaderboardOffline.error,
      API_ERRORS.leaderboardOffline.code,
    );
  }
}
