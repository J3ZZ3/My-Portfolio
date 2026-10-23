import type { Express } from "express";
import type { Server } from "http";
import { gateChat } from "../shared/chatGate";
import { limiterRequired } from "../shared/rateLimit";
import { runChat } from "../api/_lib/chatHandler";
import { handleLeaderboardRequest } from "../api/_lib/leaderboardHandler";
import { clientTokenFrom, contentLengthHeader, limiterStore } from "../api/_lib/request";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    const gated = await gateChat({
      body: req.body,
      contentLength: contentLengthHeader(req.headers["content-length"]),
      store: limiterStore(),
      requireStore: limiterRequired(),
      clientToken: clientTokenFrom(req),
    });

    if (!gated.ok) {
      if (gated.retryAfter) res.setHeader("Retry-After", String(gated.retryAfter));
      return res.status(gated.status).json(gated.body);
    }

    const result = await runChat(gated.messages);
    return res.status(result.status).json(result.json);
  });

  app.get("/api/leaderboard", async (req, res) => {
    const result = await handleLeaderboardRequest({
      method: "GET",
      queryGameId: typeof req.query.gameId === "string" ? req.query.gameId : "",
      body: undefined,
      contentLength: null,
      clientToken: clientTokenFrom(req),
    });
    return res.status(result.status).json(result.json);
  });

  app.post("/api/leaderboard", async (req, res) => {
    const result = await handleLeaderboardRequest({
      method: "POST",
      queryGameId: "",
      body: req.body,
      contentLength: contentLengthHeader(req.headers["content-length"]),
      clientToken: clientTokenFrom(req),
    });
    if (result.retryAfter) res.setHeader("Retry-After", String(result.retryAfter));
    return res.status(result.status).json(result.json);
  });

  return httpServer;
}
