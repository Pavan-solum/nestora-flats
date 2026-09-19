"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CHAT_QUICK_PROMPTS, getChatbotReply } from "@/lib/chatbot";

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
  links?: { label: string; href: string }[];
};

const welcome: Message = {
  id: "welcome",
  role: "bot",
  text: "Hi! I’m Nestora Assist. Ask about buying, selling, Bengaluru areas, or contacting a Nestora agent.",
  links: [
    { label: "Buy with Nestora", href: "/enquiry?intent=buy" },
    { label: "Sell with Nestora", href: "/enquiry?intent=sell" },
  ],
};

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      const reply = getChatbotReply(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: reply.text,
          links: reply.links,
        },
      ]);
      setTyping(false);
    }, 450);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="chatbot">
      {open && (
        <section
          className="chatbot-panel"
          role="dialog"
          aria-label="Nestora Assist chatbot"
          aria-modal="false"
        >
          <header className="chatbot-header">
            <div>
              <p className="font-display text-lg leading-none">Nestora Assist</p>
              <p className="mt-1 text-xs text-white/75">Broker help · Buy & sell</p>
            </div>
            <button
              type="button"
              className="chatbot-icon-btn"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-bubble ${
                  msg.role === "user" ? "chatbot-bubble--user" : "chatbot-bubble--bot"
                }`}
              >
                <p>{msg.text}</p>
                {msg.links && msg.links.length > 0 && (
                  <div className="chatbot-links">
                    {msg.links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className="chatbot-link"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="chatbot-bubble chatbot-bubble--bot chatbot-typing">
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chatbot-quick">
            {CHAT_QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="chatbot-quick-btn"
                onClick={() => send(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about flats, areas, agents…"
              aria-label="Chat message"
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary !min-h-11 !px-4" disabled={typing}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chatbot-launcher"
        aria-label={open ? "Close Nestora Assist" : "Open Nestora Assist"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="chatbot-launcher__dot" aria-hidden="true" />
        <span className="chatbot-launcher__label">{open ? "Close" : "Chat"}</span>
      </button>
    </div>
  );
}
