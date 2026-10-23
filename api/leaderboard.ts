import { handleLeaderboardRequest } from "./_lib/leaderboardHandler";
import { clientTokenFrom, contentLengthHeader } from "./_lib/request";

export default async function handler(req: any, res: any) {
  const result = await handleLeaderboardRequest({
    method: req.method ?? "GET",
    queryGameId: typeof req.query?.gameId === "string" ? req.query.gameId : "",
    body: req.body,
    contentLength: contentLengthHeader(req.headers?.["content-length"]),
    clientToken: clientTokenFrom(req),
  });

  if (result.retryAfter) res.setHeader("Retry-After", String(result.retryAfter));
  return res.status(result.status).json(result.json);
}
