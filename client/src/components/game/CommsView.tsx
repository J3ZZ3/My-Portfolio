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
    setCookie(
      CHAT_COOKIE,
      JSON.stringify({
        messages: chat.slice(-MAX_COOKIE_MESSAGES),
        context: {},
      }),
      COOKIE_DAYS,
    );
  }, [chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message.trim();
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: userText,
      createdAt: Date.now(),
    };

    const nextChat = [...chat, userMessage].slice(-MAX_TOTAL_MESSAGES);
    setChat(nextChat);
    setMessage("");
    setIsTyping(true);

    try {
      const payload = nextChat.map((m) => ({ role: m.role, content: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      const data = await res.json();
      const replyText: string = res.ok
        ? (data.reply ?? "No response received.")
        : (data.error ?? "Uplink error. Try again.");

      const reply: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: replyText,
        createdAt: Date.now(),
      };
      setChat((prev) => [...prev, reply].slice(-MAX_TOTAL_MESSAGES));
    } catch {
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: "Uplink lost. Check connection and try again.",
        createdAt: Date.now(),
      };
      setChat((prev) => [...prev, errorMsg].slice(-MAX_TOTAL_MESSAGES));
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetSession = () => {
    const nextVisitor = createVisitorId();
    setCookie(VISITOR_COOKIE, nextVisitor, COOKIE_DAYS);
    setVisitorId(nextVisitor);
    setChat([welcomeMessage()]);
    setCookie(
      CHAT_COOKIE,
      JSON.stringify({ messages: [welcomeMessage()], context: {} }),
      COOKIE_DAYS,
    );
  };

  return (
    <div className="h-full w-full p-6 flex flex-col font-terminal">
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
            className="ml-2 text-[10px] border border-primary/50 px-2 py-1 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
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

      <form onSubmit={handleSend} className="flex gap-4">
        <div className="flex-1 relative">
          <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about projects, skills, or contact details..."
            className="w-full bg-black border-2 border-primary/50 text-primary p-3 pl-10 font-mono focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-black px-8 py-3 font-bold font-hud hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] transition-all uppercase flex items-center gap-2"
        >
          SEND <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 flex justify-between text-muted-foreground text-sm font-hud">
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
const MAX_TOTAL_MESSAGES = 30;
const MAX_COOKIE_MESSAGES = 12;

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
    const parsed = JSON.parse(raw) as ChatCookiePayload;
    if (!parsed || !Array.isArray(parsed.messages) || typeof parsed.context !== "object") {
      return null;
    }
    const safeMessages = parsed.messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
      .slice(-MAX_COOKIE_MESSAGES)
      .map((m) => ({
        id: typeof m.id === "string" ? m.id : `${Date.now()}-${m.role}`,
        role: m.role,
        text: m.text,
        createdAt: typeof m.createdAt === "number" ? m.createdAt : Date.now(),
      }));
    return { messages: safeMessages.length ? safeMessages : [welcomeMessage()], context: parsed.context || {} };
  } catch {
    return null;
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

