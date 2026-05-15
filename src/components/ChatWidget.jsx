import { useState, useEffect, useRef } from "react";
import { COLORS } from "./constants";

const API_BASE = "http://localhost:8080";

function fmtSlot(slot) {
  if (!slot?.slot_start) return "";
  // Strip timezone suffix so the time is treated as local (backend stores local time as UTC)
  const local = slot.slot_start.replace("Z", "").replace(/[+-]\d{2}:\d{2}$/, "");
  const d = new Date(local);
  return d.toLocaleString("ru-RU", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function getNextDates(count = 7) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("ru-RU", {
      weekday: "short", day: "numeric", month: "short",
    });
    dates.push({ iso, label });
  }
  return dates;
}

const ChatIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <line x1="12" y1="3" x2="12" y2="7"/>
    <circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/>
  </svg>
);

const WELCOME = "Привет! Я помогу вам записаться к врачу. Напишите, например: «Хочу записаться на приём».";

export default function ChatWidget({ page }) {
  const [open, setOpen]                   = useState(false);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [started, setStarted]             = useState(false);
  const [choiceRequired, setChoiceRequired] = useState(false);
  const [choiceType, setChoiceType]       = useState("");
  const [choices, setChoices]             = useState([]);
  const [currentStep, setCurrentStep]     = useState("");
  const [appointmentDone, setAppointmentDone] = useState(false);
  const [fallbackServices, setFallbackServices] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const endRef    = useRef(null);
  const inputRef  = useRef(null);
  const chatRef   = useRef(null);

  const noWidget = page === "admin" || page === "doctor";

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", content: WELCOME }]);
    }
    if (open && !started) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const loadAvailableServices = async (tok) => {
    const clinicsRes = await fetch(`${API_BASE}/api/clinics`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (!clinicsRes.ok) throw new Error();
    const clinicsData = await clinicsRes.json();
    const clinicList = Array.isArray(clinicsData?.data) ? clinicsData.data : (Array.isArray(clinicsData) ? clinicsData : []);

    const perClinic = await Promise.all(
      clinicList.map((c) =>
        fetch(`${API_BASE}/api/clinics/${c.id}/services`, {
          headers: { Authorization: `Bearer ${tok}` },
        })
          .then((r) => (r.ok ? r.json() : []))
          .then((d) => (Array.isArray(d) ? d : []))
          .catch(() => [])
      )
    );

    const activeNames = new Set(
      perClinic.flat()
        .filter((s) => s.is_active !== false)
        .map((s) => s.name)
    );

    const _tryValid = (t) => { try { const r = t.replace(/^Bearer\s+/i,""); const p = JSON.parse(atob(r.split(".")[1])); return !p.exp || Date.now()/1000 < p.exp; } catch(_){return false;} };
    const _pt = localStorage.getItem("patient_token") || ""; const _at = localStorage.getItem("token") || "";
    const _best = (_tryValid(_pt) ? _pt : (_tryValid(_at) ? _at : tok)).replace(/^Bearer\s+/i, "");
    const globalRes = await fetch(`${API_BASE}/api/services`, {
      headers: _best ? { Authorization: `Bearer ${_best}` } : {},
    });
    if (!globalRes.ok) throw new Error();
    const all = await globalRes.json();
    return (Array.isArray(all) ? all : []).filter((s) => activeNames.has(s.name));
  };

  useEffect(() => {
    if (open && fallbackServices.length === 0) {
      const tok = getToken();
      if (!tok) return;
      loadAvailableServices(tok)
        .then((list) => setFallbackServices(list))
        .catch(() => setFallbackServices([]));
    }
  }, [open]);

  const getToken = () => {
    const raw = localStorage.getItem("patient_token") || "";
    return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
  };

  const addBot = (content, extra = {}) =>
    setMessages((prev) => [...prev, { role: "bot", content, ...extra }]);

  const addUser = (content) =>
    setMessages((prev) => [...prev, { role: "user", content }]);

  // Save backend state silently (fire-and-forget, no UI update)
  const saveBackendState = (payload) => {
    const token = getToken();
    return fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  // Full backend call that drives slot/date/booking steps
  const callChat = async (payload) => {
    const token = getToken();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const step = data.state?.step || "";
      setCurrentStep(step);

      if (data.appointment_id) {
        addBot("Запись успешно создана!", { appointmentId: data.appointment_id });
        setAppointmentDone(true);
        setChoiceRequired(false);
        setChoiceType("");
        setChoices([]);
        return;
      }

      if (data.choice_required && data.choice_type === "slot") {
        addBot("Выберите время:");
        setChoiceRequired(true);
        setChoiceType("slot");
        const seen = new Set();
        const uniqueSlots = (data.available_slots || []).filter((s) => {
          if (seen.has(s.slot_start)) return false;
          seen.add(s.slot_start);
          return true;
        });
        setChoices(uniqueSlots);
        return;
      }

      if (step === "collect_date" || step === "collect_time") {
        addBot("Выберите дату:");
        setChoiceRequired(false);
        setChoiceType("");
        setChoices([]);
        return;
      }

      if (data.reply?.includes("No available slots")) {
        addBot("На эту дату нет свободных слотов. Выберите другую дату.");
        setChoiceRequired(false);
        setChoiceType("");
        setChoices([]);
        return;
      }

    } catch (e) {
      addBot(`Ошибка: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: user sends first free-text message → show all services
  const handleSend = () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setStarted(true);
    addUser(msg);

    const showServices = (list) => {
      addBot("Хорошо! Выберите нужную услугу:");
      setChoiceRequired(true);
      setChoiceType("service");
      setChoices(list);
    };

    if (fallbackServices.length > 0) {
      showServices(fallbackServices);
    } else {
      setLoading(true);
      const tok = getToken();
      loadAvailableServices(tok)
        .then((list) => {
          setFallbackServices(list);
          showServices(list);
        })
        .catch(() => {
          addBot("Не удалось загрузить услуги. Попробуйте ещё раз.");
          setStarted(false);
        })
        .finally(() => setLoading(false));
    }
  };

  // Step 2: user picks service → save to backend + fetch all clinics
  const handleServicePicked = async (serviceId) => {
    setChoiceRequired(false);
    setLoading(true);
    try {
      const tok = getToken();
      const [, clinicsRes] = await Promise.all([
        saveBackendState({ choice_type: "service", choice_id: serviceId }),
        fetch(`${API_BASE}/api/clinics`, { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const json = await clinicsRes.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      if (list.length === 0) {
        addBot("Нет доступных клиник. Попробуйте позже.");
        return;
      }
      addBot("Выберите клинику:");
      setChoiceRequired(true);
      setChoiceType("frontend_clinic");
      setChoices(list);
    } catch (e) {
      addBot(`Ошибка: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: user picks clinic → fetch its addresses
  const handleClinicPicked = async (clinicId) => {
    setSelectedClinicId(clinicId);
    setChoiceRequired(false);
    setLoading(true);
    try {
      const tok = getToken();
      const res = await fetch(`${API_BASE}/api/clinics/${clinicId}/address`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const addresses = await res.json();
      const list = Array.isArray(addresses) ? addresses : [];
      if (list.length === 0) {
        addBot("У этой клиники нет адресов. Выберите другую клинику.");
        return;
      }
      if (list.length === 1) {
        await handleAddressPicked(list[0].id, clinicId);
      } else {
        addBot("Выберите адрес клиники:");
        setChoiceRequired(true);
        setChoiceType("frontend_address");
        setChoices(list);
      }
    } catch (e) {
      addBot(`Ошибка: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: address resolved → save clinic to backend + fetch doctors for this clinic
  const handleAddressPicked = async (addressId, clinicId) => {
    const cid = clinicId || selectedClinicId;
    setChoiceRequired(false);
    setLoading(true);
    try {
      const tok = getToken();
      const [, doctorsRes] = await Promise.all([
        saveBackendState({ choice_type: "clinic", choice_id: addressId }),
        fetch(`${API_BASE}/api/doctors`, { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const doctors = await doctorsRes.json();
      const list = (Array.isArray(doctors) ? doctors : [])
        .filter((d) => d.clinic_id === cid);
      const display = list.length > 0 ? list : (Array.isArray(doctors) ? doctors : []);
      if (display.length === 0) {
        addBot("Нет доступных врачей. Попробуйте позже.");
        return;
      }
      addBot("Выберите врача:");
      setChoiceRequired(true);
      setChoiceType("frontend_doctor");
      setChoices(display);
    } catch (e) {
      addBot(`Ошибка: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 5+: doctor picked → backend drives date → slot → booking
  const handleDoctorPicked = (doctorId) => {
    setChoiceRequired(false);
    callChat({ choice_type: "doctor", choice_id: doctorId });
  };

  const handleChoice = (type, id, label) => {
    addUser(label);
    if (type === "service") {
      handleServicePicked(id);
    } else if (type === "frontend_clinic") {
      handleClinicPicked(id);
    } else if (type === "frontend_address") {
      handleAddressPicked(id);
    } else if (type === "frontend_doctor") {
      handleDoctorPicked(id);
    } else {
      // date / slot — fully backend-driven
      setChoiceRequired(false);
      callChat({ choice_type: type, choice_id: id });
    }
  };

  const handleReset = async () => {
    const token = getToken();
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/ai/chat/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setChoiceRequired(false);
      setChoiceType("");
      setChoices([]);
      setStarted(false);
      setCurrentStep("");
      setAppointmentDone(false);
      setFallbackServices([]);
      setSelectedClinicId("");
      setMessages([{ role: "bot", content: "Бронирование сброшено. Напишите что-нибудь, чтобы начать снова." }]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const token = getToken();
  if (noWidget || !token) return null;

  const showInput      = !started;
  const showChoices    = started && choiceRequired && choices.length > 0;
  const showDatePicker = started && !choiceRequired && !appointmentDone && !loading &&
                         (currentStep === "collect_date" || currentStep === "collect_time");
  const showDone       = appointmentDone && !loading;

  const btnStyle = (danger = false) => ({
    textAlign: "left", padding: "8px 12px",
    background: COLORS.white,
    border: `1.5px solid ${danger ? "#EF4444" : COLORS.primary}`,
    borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
    color: danger ? "#EF4444" : COLORS.primary,
    fontWeight: 600, fontSize: 13,
    opacity: loading ? 0.6 : 1,
    transition: "background 0.15s",
    width: "100%",
  });

  const ChoiceButton = ({ label, sub, onClick, danger }) => (
    <button
      onClick={onClick}
      disabled={loading}
      style={btnStyle(danger)}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.background = danger ? "#FEF2F2" : COLORS.primaryLight;
      }}
      onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.white; }}
    >
      {label}
      {sub && (
        <span style={{ display: "block", fontWeight: 400, fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
          {sub}
        </span>
      )}
    </button>
  );

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="AI Ассистент"
          style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 1000,
            width: 56, height: 56, borderRadius: "50%",
            background: COLORS.primary, color: "#fff",
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(59,91,219,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primaryDark)}
          onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.primary)}
        >
          <ChatIcon />
        </button>
      )}

      {open && (
        <div ref={chatRef} style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1000,
          width: 360, height: 540,
          background: COLORS.white, borderRadius: 18,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: COLORS.primary, color: "#fff",
            padding: "13px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BotIcon />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>AI Ассистент</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Запись к врачу</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleReset}
                disabled={loading}
                style={{
                  background: "rgba(255,255,255,0.18)", border: "none",
                  color: "#fff", borderRadius: 6, padding: "5px 10px",
                  fontSize: 12, cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600, opacity: loading ? 0.6 : 1,
                }}
              >
                Сброс
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.18)", border: "none",
                  color: "#fff", width: 30, height: 30, borderRadius: 6,
                  cursor: "pointer", fontSize: 18, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "14px 12px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%", padding: "9px 13px",
                  borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  background: msg.role === "user" ? COLORS.primary : COLORS.primaryLight,
                  color: msg.role === "user" ? "#fff" : COLORS.text,
                  fontSize: 13.5, lineHeight: 1.55, wordBreak: "break-word",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 16px", borderRadius: "14px 14px 14px 3px",
                  background: COLORS.primaryLight, color: COLORS.muted,
                  fontSize: 18, letterSpacing: 3,
                }}>
                  •••
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Bottom panel */}
          <div style={{
            borderTop: `1px solid ${COLORS.border}`,
            padding: "10px 12px",
            background: COLORS.bg,
            flexShrink: 0,
          }}>
            {/* 1. Initial text input */}
            {showInput && (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Например: хочу на чистку зубов..."
                  disabled={loading}
                  style={{
                    flex: 1, padding: "9px 12px",
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: 8, fontSize: 13.5,
                    outline: "none", background: COLORS.white,
                    color: COLORS.text, opacity: loading ? 0.6 : 1,
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  style={{
                    width: 38, height: 38,
                    background: COLORS.primary, color: "#fff",
                    border: "none", borderRadius: 8,
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !input.trim() ? 0.5 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SendIcon />
                </button>
              </div>
            )}

            {/* 2. Selection buttons */}
            {showChoices && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 190, overflowY: "auto" }}>
                {choices.map((c, i) => {
                  let label = "", sub = "", id = "";
                  if (choiceType === "service") {
                    label = c.name; sub = c.description || ""; id = c.id;
                  } else if (choiceType === "frontend_clinic") {
                    label = c.name; sub = c.description || ""; id = c.id;
                  } else if (choiceType === "frontend_address") {
                    label = c.address_name || "Адрес"; sub = c.address_building || ""; id = c.id;
                  } else if (choiceType === "frontend_doctor") {
                    label = c.name; sub = c.specialization || ""; id = c.id;
                  } else if (choiceType === "clinic") {
                    label = c.clinic_name; sub = `${c.price} тг · ${c.duration} мин`; id = c.clinic_address_id;
                  } else if (choiceType === "doctor") {
                    label = c.name; sub = c.specialization || ""; id = c.id;
                  } else if (choiceType === "slot") {
                    label = fmtSlot(c); id = c.id;
                  }
                  return (
                    <ChoiceButton key={i} label={label} sub={sub}
                      onClick={() => handleChoice(choiceType, id, label)} />
                  );
                })}
              </div>
            )}

            {/* 3. Date picker */}
            {showDatePicker && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 190, overflowY: "auto" }}>
                {getNextDates(7).map((d) => (
                  <ChoiceButton key={d.iso} label={d.label}
                    onClick={() => handleChoice("date", d.iso, d.label)} />
                ))}
              </div>
            )}

            {/* 4. Appointment booked */}
            {showDone && (
              <button
                onClick={handleReset}
                style={{
                  width: "100%", padding: "10px",
                  background: COLORS.primaryLight,
                  border: `1.5px solid ${COLORS.primary}`,
                  borderRadius: 8, color: COLORS.primary,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
              >
                Записаться ещё раз
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
