import type { Express } from "express";
import { createServer, type Server } from "http";
import Groq from "groq-sdk";
import { buildKojiSystemPrompt } from "../shared/kojiPrompt";
import {
  getLeaderboard,
  isValidGameId,
  submitScore,
} from "../shared/leaderboard";

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const sanitized = messages
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0,
      )
      .slice(-12);

    if (sanitized.length === 0) {
      return res.status(400).json({ error: "no valid messages provided" });
    }

    try {
      const completion = await getGroq().chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: buildKojiSystemPrompt() },
          ...sanitized,
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content?.trim() ?? "Signal lost. Try again.";
      return res.json({ reply });
    } catch (err: any) {
      console.error("[groq] chat error:", err?.message ?? err);
      return res.status(502).json({ error: "Uplink failed. Try again later." });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const gameId = typeof req.query.gameId === "string" ? req.query.gameId : "";
      if (!isValidGameId(gameId)) {
        return res.status(400).json({ error: "Invalid gameId. Use run, memory, or breaker." });
      }
      const result = await getLeaderboard(gameId);
      return res.json(result);
    } catch (err: any) {
      console.error("[leaderboard] GET error:", err?.message ?? err);
      return res.status(503).json({ error: "Leaderboard offline. Storage not configured." });
    }
  });

  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { gameId, playerName, score } = req.body as {
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
      return res.status(result.accepted ? 200 : 400).json(result);
    } catch (err: any) {
      console.error("[leaderboard] POST error:", err?.message ?? err);
      return res.status(503).json({ error: "Leaderboard offline. Storage not configured." });
    }
  });

  return httpServer;
}
