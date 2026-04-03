import { useState, useEffect } from "react";
import { COLORS } from "./constants";
import Footer from "./Footer";
import { useResponsive } from "./useResponsive";

const API_BASE = "http://localhost:8080";

const TX = {
  EN: {
    upcoming: "Upcoming Appointments", past: "Past Appointments",
    clinic: "CLINIC", doctor: "DOCTOR", dateTime: "DATE & TIME", service: "SERVICE",
    clinicDoctor: "CLINIC & DOCTOR", diagnosis: "DIAGNOSIS",
    appointments: "Appointments", medHistory: "Medical History",
    logout: "Logout", home: "Home", noUpcoming: "No upcoming appointments.", noPast: "No past appointments.",
    loading: "Loading...", patientId: "Patient ID",
  },
  KZ: {
    upcoming: "Алдағы жазылымдар", past: "Өткен жазылымдар",
    clinic: "КЛИНИКА", doctor: "ДӘРІГЕР", dateTime: "КҮНІ & УАҚЫТЫ", service: "ҚЫЗМЕТ",
    clinicDoctor: "КЛИНИКА & ДӘРІГЕР", diagnosis: "ДИАГНОЗ",
    appointments: "Жазылымдар", medHistory: "Медициналық тарих",
    logout: "Шығу", home: "Басты бет", noUpcoming: "Алдағы жазылымдар жоқ.", noPast: "Өткен жазылымдар жоқ.",
    loading: "Жүктелуде...", patientId: "Пациент ID",
  },
  RU: {
    upcoming: "Предстоящие записи", past: "Прошедшие записи",
    clinic: "КЛИНИКА", doctor: "ВРАЧ", dateTime: "ДАТА & ВРЕМЯ", service: "УСЛУГА",
    clinicDoctor: "КЛИНИКА & ВРАЧ", diagnosis: "ДИАГНОЗ",
    appointments: "Записи", medHistory: "История болезней",
    logout: "Выйти", home: "Главная", noUpcoming: "Нет предстоящих записей.", noPast: "Нет прошедших записей.",
    loading: "Загрузка...", patientId: "ID пациента",
  },
};

function decodeJWT(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return {}; }
}

function fmtDateTime(str) {
  if (!str) return "—";
  const m = str.match(/(\d{4}-\d{2}-\d{2})[\sT](\d{2}:\d{2})/);
  return m ? `${m[1]} at ${m[2]}` : str.slice(0, 16).replace("T", " at ");
}

const CalIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const BookIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const labelStyle = { fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 4 };
const valueStyle = { fontSize: 14, fontWeight: 500, color: "#1A1A2E" };

export default function PatientDashboardPage({ setPage, lang = "EN" }) {
  const tx = TX[lang] || TX.EN;
  const { isMobile } = useResponsive();
  const [tab,          setTab]          = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadError,    setLoadError]    = useState("");

  const raw     = localStorage.getItem("patient_token") || "";
  const token   = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
  const claims  = token ? decodeJWT(token) : {};
  const name    = claims.name || claims.Name || claims.email || "Patient";
  const userId  = claims.user_id || claims.UserID || claims.sub || "";
  const initials = name.trim().charAt(0).toUpperCase();
  const shortId = userId ? "#" + userId.slice(0, 5).toUpperCase() : "#—";

  useEffect(() => {
    if (!token) { setPage("patientLogin"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/api/appointment/my-appointments`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_BASE}/api/doctors`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_BASE}/api/services`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([appts, docs, svcs]) => {
      const list = Array.isArray(appts) ? appts : (Array.isArray(appts?.data) ? appts.data : []);
      const docList = Array.isArray(docs) ? docs : (Array.isArray(docs?.data) ? docs.data : []);
      const svcList = Array.isArray(svcs) ? svcs : (Array.isArray(svcs?.data) ? svcs.data : []);
      setAppointments(list);
      setDoctors(docList);
      setServices(svcList);
    }).catch(() => setLoadError("Failed to load your data. Please refresh."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getName = (arr, id) => arr.find(x => (x.id || x.Id) === id)?.name || arr.find(x => (x.id || x.Id) === id)?.Name || "—";

  const now = new Date();
  const upcoming = appointments.filter(a => new Date(a.start_time || a.Start_time) >= now);
  const past     = appointments.filter(a => new Date(a.start_time || a.Start_time) <  now);

  const logout = () => {
    localStorage.removeItem("patient_token");
    setPage("home");
  };

  // ── Mobile top bar ───────────────────────────────────────────────────
  const mobileTopBar = isMobile ? (
    <div style={{ background: "#fff", borderBottom: `1px solid ${COLORS.border}`, padding: "12px 16px" }}>
      {/* User info row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #3B5BDB)", color: "#fff", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>{tx.patientId}: {shortId}</div>
        </div>
        <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <HomeIcon /> {tx.home}
        </button>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "none", background: "#FEF2F2", color: "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <LogoutIcon /> {tx.logout}
        </button>
      </div>
      {/* Tab buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setTab("appointments")}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 12px", borderRadius: 8, border: "none", background: tab === "appointments" ? COLORS.primary : "#F1F5F9", color: tab === "appointments" ? "#fff" : COLORS.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <CalIcon /> {tx.appointments}
        </button>
        <button
          onClick={() => setTab("history")}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 12px", borderRadius: 8, border: "none", background: tab === "history" ? COLORS.primary : "#F1F5F9", color: tab === "history" ? "#fff" : COLORS.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <BookIcon /> {tx.medHistory}
        </button>
      </div>
    </div>
  ) : null;

  // ── Desktop sidebar ────────────────────────────────────────────────
  const sidebar = !isMobile ? (
    <aside style={{ width: 220, minHeight: "calc(100vh - 72px)", background: "#fff", borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", padding: "28px 16px", position: "sticky", top: 0, alignSelf: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #3B5BDB)", color: "#fff", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          {initials}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, textAlign: "center" }}>{name}</div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{tx.patientId}: {shortId}</div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <button
          onClick={() => setTab("appointments")}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", background: tab === "appointments" ? COLORS.primary : "transparent", color: tab === "appointments" ? "#fff" : COLORS.muted, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
        >
          <CalIcon /> {tx.appointments}
        </button>
        <button
          onClick={() => setTab("history")}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", background: tab === "history" ? COLORS.primary : "transparent", color: tab === "history" ? "#fff" : COLORS.muted, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
        >
          <BookIcon /> {tx.medHistory}
        </button>
      </nav>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
        <button
          onClick={() => setPage("home")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          <HomeIcon /> {tx.home}
        </button>
        <button
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#EF4444", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          <LogoutIcon /> {tx.logout}
        </button>
      </div>
    </aside>
  ) : null;

  // ── Appointment cards ─────────────────────────────────────────────
  const UpcomingCard = ({ a }) => (
    <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: isMobile ? "16px" : "22px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: COLORS.text, marginBottom: 14 }}>
        {getName(services, a.service_id || a.Service_id)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "10px" : "14px 32px" }}>
        <div>
          <div style={labelStyle}>{tx.clinic}</div>
          <div style={valueStyle}>—</div>
        </div>
        <div>
          <div style={labelStyle}>{tx.doctor}</div>
          <div style={valueStyle}>{getName(doctors, a.doctor_id || a.Doctor_id)}</div>
        </div>
        <div>
          <div style={labelStyle}>{tx.dateTime}</div>
          <div style={valueStyle}>{fmtDateTime(a.start_time || a.Start_time)}</div>
        </div>
      </div>
    </div>
  );

  const PastCard = ({ a }) => (
    <div style={{ background: "#F8FAFF", borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: isMobile ? "14px" : "20px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "10px" : "12px 32px", marginBottom: 12 }}>
        <div>
          <div style={labelStyle}>{tx.clinicDoctor}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>—</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>{getName(doctors, a.doctor_id || a.Doctor_id)}</div>
        </div>
        <div>
          <div style={labelStyle}>{tx.service}</div>
          <div style={valueStyle}>{getName(services, a.service_id || a.Service_id)}</div>
        </div>
      </div>
      {(a.diagnosis || a.Diagnosis) && (
        <div>
          <div style={labelStyle}>{tx.diagnosis}</div>
          <div style={{ fontSize: 14, color: COLORS.muted, fontStyle: "italic" }}>{a.diagnosis || a.Diagnosis}</div>
        </div>
      )}
    </div>
  );

  // ── Main content ──────────────────────────────────────────────────
  const content = (
    <div style={{ flex: 1, padding: isMobile ? "20px 16px" : "32px 36px", background: COLORS.bg, minHeight: isMobile ? "auto" : "calc(100vh - 72px)" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>{tx.loading}</div>
      ) : loadError ? (
        <div style={{ textAlign: "center", padding: 60, color: "#ef4444" }}>{loadError}</div>
      ) : tab === "appointments" ? (
        <>
          <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>{tx.upcoming}</h2>
          {upcoming.length === 0
            ? <div style={{ color: COLORS.muted, fontSize: 14, marginBottom: 28 }}>{tx.noUpcoming}</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                {upcoming.map((a, i) => <UpcomingCard key={a.id || i} a={a} />)}
              </div>
          }

          <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>{tx.past}</h2>
          {past.length === 0
            ? <div style={{ color: COLORS.muted, fontSize: 14 }}>{tx.noPast}</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {past.map((a, i) => <PastCard key={a.id || i} a={a} />)}
              </div>
          }
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.muted, fontSize: 15 }}>
          {tx.medHistory} — coming soon
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {isMobile ? (
        <>
          {mobileTopBar}
          {content}
        </>
      ) : (
        <div style={{ display: "flex", flex: 1 }}>
          {sidebar}
          {content}
        </div>
      )}
      <Footer lang={lang} />
    </div>
  );
}
