export type ApiErrorCode = "invalid_request" | "rate_limited" | "unavailable";

export interface ApiErrorBody {
  error: string;
  code: ApiErrorCode;
}

export const API_ERRORS = {
  unreadable: { status: 400, error: "Request could not be read.", code: "invalid_request" },
  unsupportedMessage: { status: 400, error: "Unsupported message.", code: "invalid_request" },
  messageTooLong: { status: 400, error: "Message is too long.", code: "invalid_request" },
  tooManyMessages: { status: 400, error: "Too many messages.", code: "invalid_request" },
  bodyTooLarge: { status: 413, error: "Request is too large.", code: "invalid_request" },
  rateLimited: { status: 429, error: "Channel busy. Try again shortly.", code: "rate_limited" },
  busy: { status: 503, error: "Uplink busy. Try again shortly.", code: "unavailable" },
  uplinkOffline: { status: 503, error: "Uplink offline.", code: "unavailable" },
  uplinkFailed: { status: 502, error: "Uplink failed. Try again later.", code: "unavailable" },
  requestFailed: { status: 500, error: "Request failed.", code: "unavailable" },
  invalidGame: { status: 400, error: "Invalid game.", code: "invalid_request" },
  leaderboardOffline: { status: 503, error: "Leaderboard offline.", code: "unavailable" },
} as const satisfies Record<string, { status: number; error: string; code: ApiErrorCode }>;

export function apiErrorBody(error: string, code: ApiErrorCode): ApiErrorBody {
  return { error, code };
}
