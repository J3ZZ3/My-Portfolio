import { motion } from "framer-motion";
import { Bot, RotateCcw, Send, Terminal, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export function CommsView() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isHydratedRef = useRef(false);
  const sendingRef = useRef(false);
  const requestSeq = useRef(0);

  const sessionStatus = useMemo(
    () => (visitorId ? `VISITOR_${visitorId.slice(-6).toUpperCase()}` : "VISITOR_UNKNOWN"),
    [visitorId],
  );

  useEffect(() => {
    const existingVisitor = getCookie(VISITOR_COOKIE);
    const currentVisitor = existingVisitor || createVisitorId();
    if (!existingVisitor) {
      setCookie(VISITOR_COOKIE, currentVisitor, COOKIE_DAYS);
    }
    setVisitorId(currentVisitor);

    const stored = getCookie(CHAT_COOKIE);
    if (stored) {
      const parsed = parseSessionCookie(stored);
      if (parsed) {
        setChat(parsed.messages);
      } else {
        setChat([welcomeMessage()]);
      }
    } else {
      setChat([welcomeMessage()]);
    }

    isHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    writeChatCookie(chat);
  }, [chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRef.current) return;

    const userText = message.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!userText) return;

    sendingRef.current = true;
    const seq = ++requestSeq.current;
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: userText,
      createdAt: Date.now(),
    };

    const nextChat = [...chat, userMessage].slice(-MAX_STORED_MESSAGES);
    setChat(nextChat);
    setMessage("");
    setIsTyping(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

    try {
      const payload = nextChat.slice(-MAX_STORED_MESSAGES).map((item) => ({
        role: item.role,
        content: item.text.slice(0, MAX_MESSAGE_CHARS),
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (seq !== requestSeq.current) return;

      const replyText = res.ok && data && typeof data.reply === "string"
        ? data.reply
        : chatFailureText(res.status, data);
      setChat((prev) => [...prev, assistantMessage(replyText)].slice(-MAX_STORED_MESSAGES));
    } catch (err) {
      if (seq !== requestSeq.current) return;
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      const replyText = timedOut
        ? "Uplink timed out. Try again."
        : "Uplink lost. Check connection and try again.";
      setChat((prev) => [...prev, assistantMessage(replyText)].slice(-MAX_STORED_MESSAGES));
    } finally {
      clearTimeout(timer);
      if (seq === requestSeq.current) {
        sendingRef.current = false;
        setIsTyping(false);
      }
    }
  };

  const handleResetSession = () => {
    requestSeq.current += 1;
    sendingRef.current = false;
    setIsTyping(false);
    const nextVisitor = createVisitorId();
    setCookie(VISITOR_COOKIE, nextVisitor, COOKIE_DAYS);
    setVisitorId(nextVisitor);
    const welcome = [welcomeMessage()];
    setChat(welcome);
    writeChatCookie(welcome);
  };

  return (
    <div className="h-full w-full min-h-0 p-3 sm:p-6 flex flex-col font-terminal">
      <h2 className="text-xl md:text-2xl leading-tight font-pixel text-primary mb-6 break-words">
        COMMS_BOT
      </h2>

      <div className="flex-1 border-2 border-primary/30 bg-black/50 p-4 mb-4 overflow-hidden relative min-h-0">
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse delay-75" />
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse delay-150" />
          <button
            onClick={handleResetSession}
            className="ml-2 min-h-11 text-xs border border-primary/50 px-3 py-2 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
        </div>

        <div className="h-full overflow-y-auto pt-8 pr-1 space-y-3">
          {chat.map((item) => (
            <div
              key={item.id}
              className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] border px-3 py-2 text-sm md:text-base ${
                  item.role === "user"
                    ? "border-primary/50 text-primary bg-primary/10"
                    : "border-secondary/40 text-secondary bg-secondary/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-xs font-hud tracking-wide">
                  {item.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  {item.role === "user" ? "YOU" : "KOJI_BOT"}
                </div>
                <p className="whitespace-pre-wrap break-words">{item.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="border border-secondary/40 text-secondary bg-secondary/10 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Bot className="w-3 h-3" />
                  <span className="font-hud text-xs tracking-wide">KOJI_BOT</span>
                </div>
                <p className="mt-1 animate-pulse">typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-2 shrink-0" aria-busy={isTyping}>
        <div className="flex-1 relative">
          <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && sendingRef.current) e.preventDefault();
            }}
            maxLength={MAX_MESSAGE_CHARS}
            disabled={isTyping}
            placeholder="Ask about projects, skills, or contact details..."
            className="w-full min-h-11 bg-black border-2 border-primary/50 text-primary p-3 pl-10 font-mono focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isTyping}
          className="min-h-11 bg-primary text-black px-6 py-3 font-bold font-hud hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-60"
        >
          SEND <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-muted-foreground text-sm font-hud">
        <span>STATUS: ONLINE</span>
        <span>SESSION: {sessionStatus}</span>
        <span>STORAGE: COOKIES</span>
      </div>
    </div>
  );
}

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
}

interface ChatCookiePayload {
  messages: ChatMessage[];
  context: Record<string, unknown>;
}

const COOKIE_DAYS = 7;
const CHAT_COOKIE = "koji_chat_session";
const VISITOR_COOKIE = "koji_visitor_id";
const MAX_STORED_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 500;
const MAX_COOKIE_BYTES = 3200;
const CHAT_TIMEOUT_MS = 20_000;

function assistantMessage(text: string): ChatMessage {
  return {
    id: `${Date.now()}-assistant`,
    role: "assistant",
    text,
    createdAt: Date.now(),
  };
}

const KNOWN_CHAT_ERRORS = new Set([
  "Request could not be read.",
  "Unsupported message.",
  "Message is too long.",
  "Too many messages.",
  "Request is too large.",
  "Channel busy. Try again shortly.",
  "Uplink busy. Try again shortly.",
  "Uplink offline.",
  "Uplink failed. Try again later.",
  "Request failed.",
]);

function chatFailureText(status: number, data: unknown): string {
  if (status === 429) return "Channel busy. Try again shortly.";
  if (data && typeof data === "object") {
    const body = data as { code?: unknown; error?: unknown };
    if (body.code === "rate_limited") return "Channel busy. Try again shortly.";
    if (typeof body.error === "string" && KNOWN_CHAT_ERRORS.has(body.error)) return body.error;
  }
  return "Uplink lost. Check connection and try again.";
}

function welcomeMessage(): ChatMessage {
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    text:
      "Uplink established. I am Koji_Bot. Ask about projects, skills, experience, or how to contact me.",
    createdAt: Date.now(),
  };
}

function createVisitorId() {
  return `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-6)}`;
}

function parseSessionCookie(raw: string): ChatCookiePayload | null {
  try {
    const parsed = JSON.parse(raw) as { messages?: unknown };
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    const safeMessages = parsed.messages
      .filter((message): message is { role: ChatRole; text: string; id?: unknown; createdAt?: unknown } => {
        if (!message || typeof message !== "object") return false;
        const candidate = message as { role?: unknown; text?: unknown };
        return (candidate.role === "user" || candidate.role === "assistant") && typeof candidate.text === "string";
      })
      .slice(-MAX_STORED_MESSAGES)
      .map((message) => ({
        id: typeof message.id === "string" ? message.id : `${Date.now()}-${message.role}`,
        role: message.role,
        text: message.text.slice(0, MAX_MESSAGE_CHARS),
        createdAt: typeof message.createdAt === "number" ? message.createdAt : Date.now(),
      }))
      .filter((message) => message.text.trim().length > 0);
    return { messages: safeMessages.length ? safeMessages : [welcomeMessage()], context: {} };
  } catch {
    return null;
  }
}

function serializeChat(messages: ChatMessage[]): string {
  let kept = messages.slice(-MAX_STORED_MESSAGES).map((message) => ({
    role: message.role,
    text: message.text.slice(0, MAX_MESSAGE_CHARS),
  }));
  let payload = JSON.stringify({ messages: kept });
  while (encodeURIComponent(payload).length > MAX_COOKIE_BYTES && kept.length > 1) {
    kept = kept.slice(1);
    payload = JSON.stringify({ messages: kept });
  }
  if (encodeURIComponent(payload).length > MAX_COOKIE_BYTES) return "";
  return payload;
}

function writeChatCookie(messages: ChatMessage[]) {
  try {
    const payload = serializeChat(messages);
    if (!payload) return;
    setCookie(CHAT_COOKIE, payload, COOKIE_DAYS);
  } catch {
    // The transcript stays in memory when cookie storage rejects the write.
  }
}

function setCookie(name: string, value: string, days: number) {
  const encoded = encodeURIComponent(value);
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encoded}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const prefix = `${name}=`;
  const found = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

