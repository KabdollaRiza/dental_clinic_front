import { useState, useEffect, useRef } from "react";
import { COLORS } from "./constants";

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "";

// Qwen AI proxy endpoint — replace with your actual proxy URL
const AI_PROXY_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_MODEL     = "qwen/qwen3-235b-a22b:free";


const w = {
  // Floating button
  fab: {
    position: "fixed", bottom: 28, right: 28, zIndex: 9000,
    width: 56, height: 56, borderRadius: "50%",
    background: COLORS.primary, color: "#fff",
    border: "none", cursor: "pointer",
    boxShadow: "0 4px 20px rgba(59,91,219,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  // Chat window
  window: (open) => ({
    position: "fixed", bottom: 96, right: 28, zIndex: 8999,
    width: 360, height: 520,
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    opacity: open ? 1 : 0,
    transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
    pointerEvents: open ? "all" : "none",
    transition: "opacity 0.22s ease, transform 0.22s ease",
  }),
  header: {
    background: COLORS.primary, color: "#fff",
    padding: "16px 20px", display: "flex",
    alignItems: "center", justifyContent: "space-between",
    flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  },
  headerTitle: { fontSize: 15, fontWeight: 700 },
  headerSub:   { fontSize: 11, opacity: 0.8, marginTop: 1 },
  closeBtn: {
    background: "none", border: "none", color: "#fff",
    fontSize: 20, cursor: "pointer", opacity: 0.8, lineHeight: 1, padding: 0,
  },
  // Messages area
  messages: {
    flex: 1, overflowY: "auto", padding: "16px 14px",
    display: "flex", flexDirection: "column", gap: 10,
  },
  bubble: (role) => ({
    maxWidth: "82%",
    alignSelf: role === "user" ? "flex-end" : "flex-start",
    background: role === "user" ? COLORS.primary : COLORS.bg,
    color: role === "user" ? "#fff" : COLORS.text,
    borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    padding: "10px 14px",
    fontSize: 13, lineHeight: 1.55,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  }),
  systemBubble: {
    alignSelf: "center",
    background: "#dcfce7", color: "#166534",
    borderRadius: 10, padding: "8px 14px",
    fontSize: 12, fontWeight: 600,
    border: "1px solid #bbf7d0",
  },
  typing: {
    alignSelf: "flex-start",
    background: COLORS.bg, borderRadius: "16px 16px 16px 4px",
    padding: "10px 16px", fontSize: 20, color: COLORS.muted,
    letterSpacing: 3,
  },
  // Input area
  inputRow: {
    padding: "12px 14px", borderTop: `1px solid ${COLORS.border}`,
    display: "flex", gap: 8, flexShrink: 0,
    background: COLORS.white,
  },
  input: {
    flex: 1, padding: "10px 14px",
    border: `1.5px solid ${COLORS.border}`, borderRadius: 10,
    fontSize: 13, color: COLORS.text, outline: "none",
    resize: "none", fontFamily: "inherit",
    background: COLORS.white,
    transition: "border 0.2s",
  },
  sendBtn: (en) => ({
    width: 40, height: 40, borderRadius: "50%",
    background: en ? COLORS.primary : COLORS.border,
    border: "none", cursor: en ? "pointer" : "default",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "background 0.2s",
    alignSelf: "flex-end",
  }),
};

const SYSTEM_PROMPT = (slots, doctors, services) => `Ты — вежливый AI-консультант стоматологической клиники.
Помогай пациентам выбрать удобное время записи и отвечай на вопросы о клинике.

Доступные врачи: ${JSON.stringify(doctors.map(d => ({ id: d.id, name: d.name, specialization: d.specialization })))}
Доступные услуги: ${JSON.stringify(services.map(s => ({ id: s.id, name: s.name, duration: s.duration, price: s.price })))}
Свободные слоты на сегодня и ближайшие дни: ${JSON.stringify(slots.slice(0, 30))}

Если пациент хочет записаться и ты знаешь все необходимые данные (doctor_id, clinic_address_id, service_id, slot_id, date, name, email),
верни в конце ответа JSON-блок СТРОГО в таком формате (ничего лишнего внутри блока):
[BOOKING]{"doctor_id":"...","clinic_address_id":"...","service_id":"...","slot_id":"...","date":"YYYY-MM-DD","name":"...","email":"..."}[/BOOKING]

Если каких-то данных не хватает — спроси пациента. Отвечай на языке пациента.`;

export default function ChatWidget() {
  const [open,     setOpen]    = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Здравствуйте! 👋 Я AI-консультант клиники. Могу помочь записаться к врачу или ответить на вопросы. Чем могу помочь?" },
  ]);
  const [input,    setInput]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [slots] = useState([]);
  const [doctors,  setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Load context data on mount
  useEffect(() => {
    const load = async (path, setter) => {
      try {
        const r = await fetch(`${API_BASE}${path}`);
        if (!r.ok) return;
        const d = await r.json();
        const list = Array.isArray(d) ? d : Array.isArray(d.data) ? d.data : [];
        setter(list);
      } catch (_) {}
    };
    load("/api/doctors",  setDoctors);
    load("/api/services", setServices);
    // Load today's slots for a general overview (no specific doctor/service/address)
    // We'll fetch with whatever we have; even an empty array gives context
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const addMessage = (role, text, type) =>
    setMessages(prev => [...prev, { role, text, type }]);

  // Parse [BOOKING]...[/BOOKING] block from AI response
  const parseBooking = (text) => {
    const match = text.match(/\[BOOKING\]([\s\S]*?)\[\/BOOKING\]/);
    if (!match) return null;
    try { return JSON.parse(match[1].trim()); } catch (_) { return null; }
  };

  const cleanText = (text) =>
    text.replace(/\[BOOKING\][\s\S]*?\[\/BOOKING\]/g, "").trim();

  const handleBooking = async (booking) => {
    try {
      const token = localStorage.getItem("token") || "";
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/appointment`, {
        method: "POST",
        headers,
        body: JSON.stringify(booking),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success === "1") {
        addMessage("system", "✅ Запись успешно создана! Ждём вас в клинике.");
      } else {
        addMessage("system", `⚠️ Не удалось создать запись: ${data.message || "попробуйте ещё раз."}`);
      }
    } catch (_e) {
      addMessage("system", "⚠️ Ошибка сети при создании записи.");
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    addMessage("user", text);
    setLoading(true);

    // Build conversation history for the AI
    const history = messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role, content: m.text }));
    history.push({ role: "user", content: text });

    try {
      const aiToken = import.meta.env?.VITE_OPENROUTER_KEY || "";
      const res = await fetch(AI_PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiToken}`,
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT(slots, doctors, services) },
            ...history,
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error?.message || data?.message || `OpenRouter error ${res.status}`;
        addMessage("assistant", `⚠️ ${errMsg}`);
        return;
      }
      const aiText = data.choices?.[0]?.message?.content || "Извините, не удалось получить ответ.";

      const booking = parseBooking(aiText);
      const displayText = cleanText(aiText);

      addMessage("assistant", displayText);

      if (booking) {
        await handleBooking(booking);
      }
    } catch (_e) {
      addMessage("assistant", "Извините, произошла ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat window */}
      <div style={w.window(open)}>
        {/* Header */}
        <div style={w.header}>
          <div style={w.headerLeft}>
            <div style={w.avatar}>🦷</div>
            <div>
              <div style={w.headerTitle}>AI Консультант</div>
              <div style={w.headerSub}>Онлайн · отвечает мгновенно</div>
            </div>
          </div>
          <button style={w.closeBtn} onClick={() => setOpen(false)}>×</button>
        </div>

        {/* Messages */}
        <div style={w.messages}>
          {messages.map((m, i) =>
            m.type === "system" || m.role === "system" ? (
              <div key={i} style={w.systemBubble}>{m.text}</div>
            ) : (
              <div key={i} style={w.bubble(m.role)}>{m.text}</div>
            )
          )}
          {loading && <div style={w.typing}>···</div>}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={w.inputRow}>
          <textarea
            ref={inputRef}
            rows={1}
            style={w.input}
            value={input}
            placeholder="Напишите сообщение…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
            onBlur={(e)  => (e.target.style.borderColor = COLORS.border)}
          />
          <button style={w.sendBtn(!!input.trim() && !loading)} onClick={handleSend} disabled={!input.trim() || loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                stroke={input.trim() && !loading ? "#fff" : COLORS.muted}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        style={w.fab}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(59,91,219,0.55)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.boxShadow = "0 4px 20px rgba(59,91,219,0.4)"; }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </>
  );
}
