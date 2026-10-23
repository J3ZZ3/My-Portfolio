import { API_ERRORS, type ApiErrorBody } from "./apiErrors";

export const MAX_CHAT_BODY_BYTES = 16 * 1024;
export const MAX_CHAT_MESSAGES = 12;
export const MAX_CHAT_CONTENT_CHARS = 500;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export type ChatParseFailure = {
  ok: false;
  status: number;
  body: ApiErrorBody;
};

export type ChatParseResult = { ok: true; messages: ChatTurn[] } | ChatParseFailure;

function failure(kind: keyof typeof API_ERRORS): ChatParseFailure {
  const entry = API_ERRORS[kind];
  return { ok: false, status: entry.status, body: { error: entry.error, code: entry.code } };
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseChatRequest(input: {
  body: unknown;
  contentLength?: number | null;
}): ChatParseResult {
  if (typeof input.contentLength === "number" && input.contentLength > MAX_CHAT_BODY_BYTES) {
    return failure("bodyTooLarge");
  }

  let payload = input.body;
  if (typeof payload === "string") {
    if (byteLength(payload) > MAX_CHAT_BODY_BYTES) return failure("bodyTooLarge");
    try {
      payload = JSON.parse(payload);
    } catch {
      return failure("unreadable");
    }
  } else if (isPlainObject(payload)) {
    const encoded = JSON.stringify(payload);
    if (byteLength(encoded) > MAX_CHAT_BODY_BYTES) return failure("bodyTooLarge");
  }

  if (!isPlainObject(payload)) return failure("unreadable");

  const keys = Object.keys(payload);
  if (keys.length !== 1 || keys[0] !== "messages") return failure("unreadable");

  const messages = payload.messages;
  if (!Array.isArray(messages) || messages.length === 0) return failure("unreadable");
  if (messages.length > MAX_CHAT_MESSAGES) return failure("tooManyMessages");

  const turns: ChatTurn[] = [];
  for (const message of messages) {
    if (!isPlainObject(message)) return failure("unreadable");
    const messageKeys = Object.keys(message);
    if (messageKeys.length !== 2 || !messageKeys.includes("role") || !messageKeys.includes("content")) {
      return failure("unreadable");
    }
    if (message.role !== "user" && message.role !== "assistant") {
      return failure("unsupportedMessage");
    }
    if (typeof message.content !== "string") return failure("unreadable");
    const content = message.content.trim();
    if (content.length === 0) return failure("unreadable");
    if (content.length > MAX_CHAT_CONTENT_CHARS) return failure("messageTooLong");
    turns.push({ role: message.role, content });
  }

  return { ok: true, messages: turns };
}
