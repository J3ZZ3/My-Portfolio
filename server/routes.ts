import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are Koji_Bot, the AI assistant embedded in Koji's interactive portfolio website. You speak in a concise, slightly technical tone that fits the retro terminal / RPG aesthetic of the site.

About Koji:
- Junior frontend developer based in Pretoria, South Africa
- Guild: CodeTribe
- Core skills: JavaScript (80%), CSS (85%), React.js (75%), HTML (75%), React Native (65%)
- Tools: JavaScript, HTML5, CSS3, React.js, Git, GitHub, Firebase, MongoDB, Supabase, React Native (Expo), Postman

Completed Projects (QUESTS):
1. Online Marketplace — React + Node.js + Firebase + Redux. Buy and sell marketplace.
2. Employee Management System — React + Firebase + Node.js + Express. CRUD app with auth and admin.
3. Audio Recorder App — React Native. Voice note recording and management.
4. Weather App — React + CSS + WeatherAPI + Axios. Real-time weather with hourly and weekly forecasts.

Navigation help:
- PROFILE tab — summary of skills, stats, and location
- QUESTS tab — detailed project log with links
- SKILLS tab — interactive skill tree
- ARCADE tab — playable mini-game demos
- COMMS tab — you are here (chatbot)

Rules:
- Keep replies short (2-5 sentences max) unless a detailed breakdown is clearly needed.
- Stay in character as Koji_Bot at all times.
- If asked about contact or hiring, tell the visitor to reach out via the contact details in the PROFILE section or to leave a message here in the COMMS chat.
- Do not invent projects, skills, or facts not listed above.
- If you do not know something, say so honestly and direct the visitor to the relevant section.`;

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
          { role: "system", content: SYSTEM_PROMPT },
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

  return httpServer;
}
