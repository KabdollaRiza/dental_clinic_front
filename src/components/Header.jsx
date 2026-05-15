import { useState, useRef, useEffect } from "react";
import { COLORS } from "./constants";
import { SmileIcon, GlobeIcon } from "./Icons";
import { useResponsive } from "./useResponsive";

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "KZ", label: "Қазақша" },
  { code: "RU", label: "Русский"},
];

const NAV_LABELS = {
  EN: { appointments: "My Appointments", login: "Login", clinics: "Clinics", doctors: "Our Doctors", services: "Services", portal: "Patient Portal", doctor: "Doctor", admin: "Admin" },
  KZ: { appointments: "Жазылымдарым",   login: "Кіру",  clinics: "Клиникалар", doctors: "Дәрігерлер", services: "Қызметтер", portal: "Пациент порталы", doctor: "Дәрігер", admin: "Әкімші" },
  RU: { appointments: "Мои записи",      login: "Войти", clinics: "Клиники",    doctors: "Наши врачи", services: "Услуги",    portal: "Портал пациента", doctor: "Врач", admin: "Админ" },
};

const h = {
  header: { background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 48px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  headerMobile: { background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 16px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  logo:   { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logoIcon: { width: 40, height: 40, background: COLORS.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 18, fontWeight: 700, color: "#1A1A2E" },
  nav:    { display: "flex", alignItems: "center", gap: 10 },
  primaryBtn: { padding: "8px 18px", borderRadius: 8, border: "none", background: COLORS.primary, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" },
  outlineBtn: (active) => ({ padding: "8px 18px", borderRadius: 8, border: active ? `1.5px solid ${COLORS.primary}` : "1.5px solid #E5E7EB", background: active ? COLORS.primaryLight : "transparent", color: active ? COLORS.primary : "#1A1A2E", fontSize: 14, fontWeight: active ? 600 : 500, cursor: "pointer", transition: "all 0.2s" }),

  langWrap:  { position: "relative" },
  langBtn:   { display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1A1A2E", fontWeight: 500, cursor: "pointer", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 12px", background: "transparent", transition: "border-color 0.2s" },
  dropdown:  { position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, overflow: "hidden", zIndex: 200 },
  langItem:  (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, cursor: "pointer", fontWeight: active ? 600 : 400, color: active ? COLORS.primary : "#1A1A2E", background: active ? COLORS.primaryLight : "transparent", transition: "background 0.15s" }),
  check:     { marginLeft: "auto", color: COLORS.primary, fontSize: 14 },

  // Mobile menu overlay
  mobileMenu: { position: "fixed", top: 60, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 99 },
  mobileMenuPanel: { background: "#fff", padding: "16px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" },
  mobileNavBtn: (active) => ({ padding: "12px 16px", borderRadius: 8, border: active ? `1.5px solid ${COLORS.primary}` : "1.5px solid #E5E7EB", background: active ? COLORS.primaryLight : "transparent", color: active ? COLORS.primary : "#1A1A2E", fontSize: 15, fontWeight: active ? 600 : 500, cursor: "pointer", textAlign: "left", width: "100%" }),
};

function HamburgerIcon({ open }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

export default function Header({ page, setPage, lang, setLang }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref  = useRef(null);
  const { isMobile } = useResponsive();
  const showFullNav = ["home", "clinics", "doctors", "services", "booking"].includes(page);
  const t    = NAV_LABELS[lang] || NAV_LABELS.EN;
  const cur  = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const adminToken = localStorage.getItem("token");
  let loggedInRole = "";
  if (adminToken) {
    try {
      const payload = JSON.parse(atob(adminToken.split(".")[1]));
      if (!payload.exp || Date.now() / 1000 < payload.exp) {
        loggedInRole = (payload.role || payload.Role || "").toLowerCase();
      }
    } catch {}
  }
  const hasAdminToken = !!(adminToken && (loggedInRole === "admin" || loggedInRole === "doctor"));
  const dashboardPage = loggedInRole === "doctor" ? "doctor" : "admin";
  const dashboardLabel = loggedInRole === "doctor" ? t.doctor : t.admin;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu when page changes
  useEffect(() => { setMenuOpen(false); }, [page]);

  const handleNavClick = (dest) => {
    if (dest === "patientPortal") {
      const pt = localStorage.getItem("patient_token");
      setPage(pt ? "patientDashboard" : "patientLogin");
    } else {
      setPage(dest);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <header style={isMobile ? h.headerMobile : h.header}>
        {/* Logo */}
        <div style={h.logo} onClick={() => setPage("home")}>
          <div style={{ ...h.logoIcon, width: isMobile ? 34 : 40, height: isMobile ? 34 : 40 }}>
            <SmileIcon size={isMobile ? 18 : 22} />
          </div>
          <span style={{ ...h.logoText, fontSize: isMobile ? 16 : 18 }}>Dental Clinic</span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10 }}>
          {/* Desktop nav */}
          {!isMobile && showFullNav && (
            <nav style={h.nav}>
              {hasAdminToken
                ? <button style={h.outlineBtn(false)} onClick={() => setPage(dashboardPage)}>{dashboardLabel}</button>
                : <button style={h.outlineBtn(page === "login")} onClick={() => setPage("login")}>{t.login}</button>
              }
              <button style={h.outlineBtn(page === "clinics")} onClick={() => setPage("clinics")}>{t.clinics}</button>
              <button style={h.outlineBtn(page === "doctors")} onClick={() => setPage("doctors")}>{t.doctors}</button>
              <button style={h.outlineBtn(page === "services")} onClick={() => setPage("services")}>{t.services}</button>
              <button style={h.outlineBtn(page === "patientLogin" || page === "patientDashboard")} onClick={() => handleNavClick("patientPortal")}>{t.portal}</button>
            </nav>
          )}

          {/* Language switcher */}
          <div style={h.langWrap} ref={ref}>
            <button
              style={{ ...h.langBtn, borderColor: open ? COLORS.primary : "#E5E7EB", padding: isMobile ? "5px 8px" : "6px 12px" }}
              onClick={() => setOpen((o) => !o)}
            >
              <GlobeIcon />
              <span>{cur.code}</span>
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
                    <span>{l.label}</span>
                    {l.code === lang && <span style={h.check}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hamburger button - mobile only */}
          {isMobile && showFullNav && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {isMobile && menuOpen && (
        <div style={h.mobileMenu} onClick={() => setMenuOpen(false)}>
          <div style={h.mobileMenuPanel} onClick={(e) => e.stopPropagation()}>
            {hasAdminToken
              ? <button style={h.mobileNavBtn(false)} onClick={() => { setMenuOpen(false); setPage(dashboardPage); }}>{dashboardLabel}</button>
              : <button style={h.mobileNavBtn(page === "login")} onClick={() => handleNavClick("login")}>{t.login}</button>
            }
            <button style={h.mobileNavBtn(page === "clinics")}  onClick={() => handleNavClick("clinics")}>{t.clinics}</button>
            <button style={h.mobileNavBtn(page === "doctors")}  onClick={() => handleNavClick("doctors")}>{t.doctors}</button>
            <button style={h.mobileNavBtn(page === "services")} onClick={() => handleNavClick("services")}>{t.services}</button>
            <button style={h.mobileNavBtn(page === "patientLogin" || page === "patientDashboard")} onClick={() => handleNavClick("patientPortal")}>{t.portal}</button>
          </div>
        </div>
      )}
    </>
  );
}
