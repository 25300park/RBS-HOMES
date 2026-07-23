"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  units?: UnitCard[];
}

interface UnitCard {
  id: number;
  title: string;
  price: number | null;
  bed: number | null;
  bath: number | null;
  url: string;
}

function getOrCreateSessionId(): string {
  const key = "chatbotSessionId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || !sessionId) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Sorry, something went wrong. Please try again.",
          units: data.units?.length > 0 ? data.units : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window fixed right-5 bottom-32 md:bottom-20 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-orange-500 text-white">
            <span className="font-semibold text-sm">RBS HOMES Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-70 transition-opacity"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-80">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400 text-center pt-6">
                Hi! How can I help you find a property today?
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i}>
                <div
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-orange-500 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
                {/* Unit cards */}
                {m.units && m.units.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.units.map((u) => (
                      <Link
                        key={u.id}
                        href={u.url}
                        target="_blank"
                        className="block border border-gray-200 rounded-lg px-3 py-2 hover:bg-orange-50 transition-colors"
                      >
                        <p className="text-sm font-semibold text-gray-800 truncate">{u.title}</p>
                        <p className="text-xs text-orange-500 font-bold mt-0.5">
                          {u.price ? `₱ ${Number(u.price).toLocaleString()}` : "Price TBD"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[u.bed != null && `${u.bed} bed`, u.bath != null && `${u.bath} bath`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 text-sm px-3 py-2 rounded-2xl rounded-bl-sm">
                  Typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about properties..."
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="chatbot-toggle fixed right-5 bottom-20 md:bottom-5 z-50 w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors animate-fade-in"
        aria-label="Open chat"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </>
  );
}
