import { API_ERRORS, type ApiErrorBody } from "./apiErrors";
import { parseChatRequest, type ChatTurn } from "./chatRequest";
import {
  chatLimitChecks,
  enforceLimit,
  limitHttpResponse,
  type CounterStore,
} from "./rateLimit";

export async function gateChat(input: {
  body: unknown;
  contentLength: number | null;
  store: CounterStore | null;
  requireStore: boolean;
  clientToken: string;
}): Promise<
  | { ok: true; messages: ChatTurn[] }
  | { ok: false; status: number; body: ApiErrorBody; retryAfter?: number }
> {
  const limited = limitHttpResponse(
    await enforceLimit({
      store: input.store,
      requireStore: input.requireStore,
      checks: chatLimitChecks(input.clientToken),
    }),
  );
  if (limited) {
    return { ok: false, status: limited.status, body: limited.body, retryAfter: limited.retryAfter };
  }

  const parsed = parseChatRequest({ body: input.body, contentLength: input.contentLength });
  if (!parsed.ok) return parsed;
  return { ok: true, messages: parsed.messages };
}
