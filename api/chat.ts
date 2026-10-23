import { gateChat } from "../shared/chatGate";
import { limiterRequired } from "../shared/rateLimit";
import { runChat } from "./_lib/chatHandler";
import { clientTokenFrom, contentLengthHeader, limiterStore } from "./_lib/request";

function sendResult(
  res: { setHeader: (name: string, value: string) => unknown; status: (code: number) => { json: (body: unknown) => unknown } },
  result: { status: number; body?: unknown; json?: unknown; retryAfter?: number },
) {
  if (result.retryAfter) res.setHeader("Retry-After", String(result.retryAfter));
  const payload = result.body ?? result.json;
  return res.status(result.status).json(payload);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const gated = await gateChat({
    body: req.body,
    contentLength: contentLengthHeader(req.headers?.["content-length"]),
    store: limiterStore(),
    requireStore: limiterRequired(),
    clientToken: clientTokenFrom(req),
  });

  if (!gated.ok) return sendResult(res, gated);

  const result = await runChat(gated.messages);
  return res.status(result.status).json(result.json);
}
