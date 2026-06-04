import {
  getLeaderboard,
  isValidGameId,
  submitScore,
} from "../shared/leaderboard";

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "GET") {
      const gameId = typeof req.query?.gameId === "string" ? req.query.gameId : "";
      if (!isValidGameId(gameId)) {
        return res.status(400).json({ error: "Invalid gameId. Use run, memory, or breaker." });
      }
      const result = await getLeaderboard(gameId);
      return res.status(200).json(result);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { gameId, playerName, score } = body as {
        gameId?: string;
        playerName?: string;
        score?: number;
      };

      if (!gameId || !isValidGameId(gameId)) {
        return res.status(400).json({ error: "Invalid gameId. Use run, memory, or breaker." });
      }
      if (typeof playerName !== "string" || typeof score !== "number") {
        return res.status(400).json({ error: "playerName and score are required." });
      }

      const result = await submitScore(gameId, playerName, Math.floor(score));
      const status = result.accepted ? 200 : 400;
      return res.status(status).json(result);
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("[leaderboard] error:", err?.message ?? err);
    const message =
      err?.message === "Leaderboard storage not configured"
        ? "Leaderboard offline. Storage not configured."
        : "Leaderboard request failed.";
    return res.status(503).json({ error: message });
  }
}
