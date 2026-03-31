import { useState, useRef, useEffect } from "react";
import { COLORS } from "./constants";
import { SmileIcon, CalendarIcon, GlobeIcon } from "./Icons";

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "KZ", label: "Қазақша" },
  { code: "RU", label: "Русский"},
];

const NAV_LABELS = {
  EN: { appointments: "My Appointments", login: "Login", clinics: "Clinics", services: "Services", portal: "Patient Portal" },
  KZ: { appointments: "Жазылымдарым",   login: "Кіру",  clinics: "Клиникалар", services: "Қызметтер", portal: "Пациент порталы" },
  RU: { appointments: "Мои записи",      login: "Войти", clinics: "Клиники",    services: "Услуги",    portal: "Портал пациента" },
};

const h = {
  header: { background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 48px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  logo:   { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logoIcon: { width: 40, height: 40, background: COLORS.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 18, fontWeight: 700, color: "#1A1A2E" },
  nav:    { display: "flex", alignItems: "center", gap: 10 },
  primaryBtn: { padding: "8px 18px", borderRadius: 8, border: "none", background: COLORS.primary, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" },
  outlineBtn: (active) => ({ padding: "8px 18px", borderRadius: 8, border: active ? `1.5px solid ${COLORS.primary}` : "1.5px solid #E5E7EB", background: active ? COLORS.primaryLight : "transparent", color: active ? COLORS.primary : "#1A1A2E", fontSize: 14, fontWeight: active ? 600 : 500, cursor: "pointer", transition: "all 0.2s" }),

  // Language dropdown
  langWrap:  { position: "relative" },
  langBtn:   { display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1A1A2E", fontWeight: 500, cursor: "pointer", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 12px", background: "transparent", transition: "border-color 0.2s" },
  dropdown:  { position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, overflow: "hidden", zIndex: 200 },
  langItem:  (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, cursor: "pointer", fontWeight: active ? 600 : 400, color: active ? COLORS.primary : "#1A1A2E", background: active ? COLORS.primaryLight : "transparent", transition: "background 0.15s" }),
  check:     { marginLeft: "auto", color: COLORS.primary, fontSize: 14 },
};

export default function Header({ page, setPage, lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const showFullNav = ["home", "clinics", "services", "booking"].includes(page);
  const t    = NAV_LABELS[lang] || NAV_LABELS.EN;
  const cur  = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header style={h.header}>
      {/* Logo */}
      <div style={h.logo} onClick={() => setPage("home")}>
        <div style={h.logoIcon}><SmileIcon size={22} /></div>
        <span style={h.logoText}>Dental Clinic</span>
      </div>

      {/* Center nav */}
      {showFullNav && (
        <nav style={h.nav}>
          <button style={h.primaryBtn} onClick={() => setPage("booking")}>
            <CalendarIcon size={16} />
            {t.appointments}
          </button>
          <button style={h.outlineBtn(page === "login")}   onClick={() => setPage("login")}>{t.login}</button>
          <button style={h.outlineBtn(page === "clinics")} onClick={() => setPage("clinics")}>{t.clinics}</button>
          <button style={h.outlineBtn(page === "services")} onClick={() => setPage("services")}>{t.services}</button>
          <button style={h.outlineBtn(false)}>{t.portal}</button>
        </nav>
      )}

      {/* Language switcher */}
      <div style={h.langWrap} ref={ref}>
        <button
          style={{ ...h.langBtn, borderColor: open ? COLORS.primary : "#E5E7EB" }}
          onClick={() => setOpen((o) => !o)}
        >
          <GlobeIcon />
          <span>{cur.flag} {cur.code}</span>
          <span style={{ fontSize: 10, marginLeft: 2, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
        </button>

        {open && (
          <div style={h.dropdown}>
            {LANGUAGES.map((l) => (
              <div
                key={l.code}
                style={h.langItem(l.code === lang)}
                onClick={() => { setLang(l.code); setOpen(false); }}
                onMouseEnter={(e) => { if (l.code !== lang) e.currentTarget.style.background = "#F8F9FF"; }}
                onMouseLeave={(e) => { if (l.code !== lang) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 20 }}>{l.flag}</span>
                <span>{l.label}</span>
                {l.code === lang && <span style={h.check}>✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
