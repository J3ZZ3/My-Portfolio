import Groq from "groq-sdk";
import { buildKojiSystemPrompt } from "./_lib/kojiPrompt";

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { messages } = body as {
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
      messages: [{ role: "system", content: buildKojiSystemPrompt() }, ...sanitized],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "Signal lost. Try again.";
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("[groq] chat error:", err?.message ?? err);
    return res.status(502).json({ error: "Uplink failed. Try again later." });
  }
}

