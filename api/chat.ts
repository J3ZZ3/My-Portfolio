import Groq from "groq-sdk";
import questsData from "./quests.json";
import skillsData from "./skills.json";

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

interface Quest {
  id: number;
  title: string;
  desc: string;
  status: string;
  online?: boolean;
  tech: string[];
  links?: { demoUrl?: string };
}

function inferDemoType(quest: Quest): string {
  const demoUrl = quest.links?.demoUrl ?? "";
  if (demoUrl.toLowerCase().endsWith(".apk")) return "APK download (mobile)";
  if (quest.online === false) return "mobile / offline demo link (no live web app)";
  return "live web demo";
}

function buildKojiSystemPrompt(): string {
  const quests = (questsData.quests as Quest[])
    .map((q, i) => {
      const tech = q.tech.join(", ");
      return `${i + 1}. ${q.title} — ${q.desc} Tech: ${tech}. Demo type: ${inferDemoType(q)}. Status: ${q.status}.`;
    })
    .join("\n");

  const levels = skillsData.skills.map((s) => `${s.name} (${s.level}%)`).join(", ");
  const tools = skillsData.tools.join(", ");

  return `You are Koji_Bot, the AI assistant embedded in Koji's interactive portfolio website. You speak in a concise, slightly technical tone that fits the retro terminal / RPG aesthetic of the site.

About Koji:
- Identity: Jesse Mashoana (Koji). Junior frontend / web developer based in Pretoria, South Africa.
- Guild: CodeTribe Academy graduate.
- Target role: Junior frontend developer (React-focused), with full-stack project experience.
Core skills: ${levels}.
Tools: ${tools}.

Completed Projects (QUESTS — authoritative list; do not invent others):
${quests}
Demo and repository URLs are only in the QUESTS tab — do not invent or guess URLs.

Navigation help:
- PROFILE tab — bio, stats, location, contact details (email, phone, GitHub)
- QUESTS tab — project log with DEMO and SOURCE links
- SKILLS tab — interactive skill tree (authoritative skill levels)
- JOURNEY tab — career timeline / milestones
- ARCADE tab — playable mini-games (Cyber Run, Memory Matrix, Binary Breaker) with global top-3 leaderboards per game
- COMMS tab — you are here (informational chat only)

Contact & hiring:
- For interviews or hiring: direct visitors to email jesse.mashoana@gmail.com (also on PROFILE).
- This COMMS chat is Q&A only — you cannot receive stored hiring messages or book interviews.
- Do not claim PROFILE has fields (Availability, Timezone, calendar) unless the visitor pasted them from the live site.

Rules:
- Keep replies short (2-5 sentences max) unless a detailed breakdown is clearly needed.
- Stay in character as Koji_Bot at all times.
- Do not invent projects, skills, employers, certs, links, or facts not listed above.
- If you do not know something, say so honestly and direct the visitor to PROFILE, QUESTS, SKILLS, or JOURNEY as relevant.`;
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
