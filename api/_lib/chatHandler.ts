import Groq from "groq-sdk";
import { API_ERRORS } from "../../shared/apiErrors";
import type { ChatTurn } from "../../shared/chatRequest";
import { buildKojiSystemPrompt } from "../../shared/kojiPrompt";

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function runChat(messages: ChatTurn[]): Promise<{
  status: number;
  json: { reply: string } | { error: string; code: "unavailable" };
}> {
  if (!process.env.GROQ_API_KEY) {
    return {
      status: API_ERRORS.uplinkOffline.status,
      json: { error: API_ERRORS.uplinkOffline.error, code: API_ERRORS.uplinkOffline.code },
    };
  }

  try {
    const completion = await getGroq().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: buildKojiSystemPrompt() }, ...messages],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "Signal lost. Try again.";
    return { status: 200, json: { reply } };
  } catch {
    console.error("[groq] chat failed");
    return {
      status: API_ERRORS.uplinkFailed.status,
      json: { error: API_ERRORS.uplinkFailed.error, code: API_ERRORS.uplinkFailed.code },
    };
  }
}
