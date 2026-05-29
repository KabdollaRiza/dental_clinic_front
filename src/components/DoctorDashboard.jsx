import { useState, useEffect, useRef } from "react";
import { COLORS } from "./constants";
import { SmileIcon, GlobeIcon } from "./Icons";

const P = COLORS;
const API_BASE = "http://localhost:8080";

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(atob(base64).split("").map(c =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join("")));
  } catch { return {}; }
}

function getAuthHeader() {
  const raw = localStorage.getItem("token") || "";
  // Backend stores token with "Bearer " prefix already
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
}


function getWeekDates(base) {
  const d = new Date(base);
  const day = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

function fmt(date) {
  return date.toISOString().split("T")[0];
}

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const HOURS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

const TR = {
  EN: {
    locale: "en-US",
    days: ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"],
    schedule: "My Schedule", ai: "AI Analysis", records: "Medical Records",
    logout: "Logout", role: "Medical Professional",
    today: "Today", week: "Week",
    aiTitle: "AI Analysis", aiSub: "Upload an X-ray or photo — AI will detect pathologies",
    aiDrop: "Click or drag a file here", aiDropHint: "PNG, JPG, JPEG — X-ray or photo",
    aiAnalyze: "Analyze", aiAnalyzing: "Analyzing...", aiReset: "Reset",
    aiDone: "Analysis complete", aiOriginal: "ORIGINAL", aiResult: "AI RESULT",
    aiDownload: "Download result", aiNew: "New analysis",
    aiError: "Please upload an image.", aiServerError: "Could not get result. Make sure the AI server is running (uvicorn main:app).",
    pending: "Pending", completed: "Completed", fillIn: "Fill in", edit: "Edit",
    needsFilling: "records need to be filled", allUpToDate: "All records are up to date",
    filterAll: "All", filterPending: "Needs filling", filterDone: "Completed",
    noRecords: "No records found.", loadingRecords: "Loading records...",
    diagnosis: "Diagnosis:", notes: "Notes:", saveChanges: "Save Changes", cancel: "Cancel",
    failedSave: "Failed to save. Please try again.", networkError: "Network error. Please try again.",
    enterDiagnosis: "Enter diagnosis", enterNotes: "Enter medical notes, treatment plan, observations...",
  },
  RU: {
    locale: "ru-RU",
    days: ["ПОНЕДЕЛЬНИК","ВТОРНИК","СРЕДА","ЧЕТВЕРГ","ПЯТНИЦА","СУББОТА","ВОСКРЕСЕНЬЕ"],
    schedule: "Моё расписание", ai: "ИИ Анализ", records: "Медкарты",
    logout: "Выйти", role: "Врач",
    today: "Сегодня", week: "Неделя",
    aiTitle: "ИИ Анализ", aiSub: "Загрузите рентген или фото — ИИ выделит патологии",
    aiDrop: "Нажмите или перетащите файл", aiDropHint: "PNG, JPG, JPEG — рентген или фото",
    aiAnalyze: "Анализировать", aiAnalyzing: "Анализирую...", aiReset: "Сбросить",
    aiDone: "Анализ завершён", aiOriginal: "ОРИГИНАЛ", aiResult: "РЕЗУЛЬТАТ ИИ",
    aiDownload: "Скачать результат", aiNew: "Новый анализ",
    aiError: "Пожалуйста, загрузите изображение.", aiServerError: "Не удалось получить результат. Убедитесь, что ИИ-сервер запущен (uvicorn main:app).",
    pending: "Ожидает", completed: "Заполнено", fillIn: "Заполнить", edit: "Изменить",
    needsFilling: "карт требуют заполнения", allUpToDate: "Все карты заполнены",
    filterAll: "Все", filterPending: "Требуют заполнения", filterDone: "Заполнены",
    noRecords: "Записей не найдено.", loadingRecords: "Загрузка...",
    diagnosis: "Диагноз:", notes: "Заметки:", saveChanges: "Сохранить", cancel: "Отмена",
    failedSave: "Не удалось сохранить. Попробуйте снова.", networkError: "Ошибка сети. Попробуйте снова.",
    enterDiagnosis: "Введите диагноз", enterNotes: "Заметки, план лечения, наблюдения...",
  },
  KZ: {
    locale: "kk-KZ",
    days: ["ДҮЙСЕНБІ","СЕЙСЕНБІ","СӘРСЕНБІ","БЕЙСЕНБІ","ЖҰМА","СЕНБІ","ЖЕКСЕНБІ"],
    schedule: "Менің кестем", ai: "ЖИ Талдау", records: "Медкарталар",
    logout: "Шығу", role: "Дәрігер",
    today: "Бүгін", week: "Апта",
    aiTitle: "ЖИ Талдау", aiSub: "Рентген немесе фото жүктеңіз — ЖИ патологияларды анықтайды",
    aiDrop: "Басыңыз немесе файлды сүйреңіз", aiDropHint: "PNG, JPG, JPEG — рентген немесе фото",
    aiAnalyze: "Талдау", aiAnalyzing: "Талдануда...", aiReset: "Тазалау",
    aiDone: "Талдау аяқталды", aiOriginal: "ТҮПНҰСҚА", aiResult: "ЖИ НӘТИЖЕСІ",
    aiDownload: "Нәтижені жүктеу", aiNew: "Жаңа талдау",
    aiError: "Суретті жүктеңіз.", aiServerError: "Нәтиже алу мүмкін болмады. ЖИ сервері іске қосылғанын тексеріңіз.",
    pending: "Күтуде", completed: "Толтырылды", fillIn: "Толтыру", edit: "Өзгерту",
    needsFilling: "карта толтыруды қажет етеді", allUpToDate: "Барлық карталар толтырылды",
    filterAll: "Барлығы", filterPending: "Толтыруды қажет етеді", filterDone: "Толтырылды",
    noRecords: "Жазба табылмады.", loadingRecords: "Жүктелуде...",
    diagnosis: "Диагноз:", notes: "Ескертпелер:", saveChanges: "Сақтау", cancel: "Бас тарту",
    failedSave: "Сақтау мүмкін болмады.", networkError: "Желі қатесі.",
    enterDiagnosis: "Диагнозды енгізіңіз", enterNotes: "Ескертпелер, емдеу жоспары...",
  },
};

const APPT_COLORS = {
  blue:   { bg: "#3B5BDB", text: "#fff" },
  yellow: { bg: "#F59E0B", text: "#fff" },
};

const st = {
  shell:    { display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F8F9FF" },
  body:     { display: "flex", flex: 1 },

  // Sidebar
  sidebar:  (open) => ({ width: open ? 240 : 68, background: P.primary, display: "flex", flexDirection: "column", minHeight: "100%", transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }),
  sideTop:  (open) => ({ padding: open ? "32px 24px 24px" : "24px 10px 20px", display: "flex", flexDirection: "column", alignItems: open ? "flex-start" : "center" }),
  avatarWrap:{ width: 44, height: 44, background: "rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, flexShrink: 0 },
  doctorName:{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden" },
  doctorRole:{ fontSize: 12, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" },
  navList:  { padding: "8px 0", flex: 1 },
  navItem:  (active, open) => ({
    display: "flex", alignItems: "center", gap: open ? 12 : 0, padding: open ? "13px 24px" : "13px 0",
    justifyContent: open ? "flex-start" : "center",
    cursor: "pointer", fontSize: 14, fontWeight: active ? 700 : 500,
    color: active ? "#fff" : "rgba(255,255,255,0.7)",
    background: active ? "rgba(255,255,255,0.18)" : "transparent",
    borderRadius: active ? (open ? "0 24px 24px 0" : "12px") : 0,
    marginRight: active && open ? 16 : 0,
    marginLeft: active && !open ? 8 : 0,
    marginRight2: active && !open ? 8 : 0,
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  }),
  logoutItem: (open) => ({ display: "flex", alignItems: "center", gap: open ? 10 : 0, padding: open ? "16px 24px" : "16px 0", justifyContent: open ? "flex-start" : "center", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: "auto", whiteSpace: "nowrap" }),
  toggleBtn: { position: "absolute", top: 20, right: -12, width: 24, height: 24, background: "#fff", border: `1.5px solid ${P.primary}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" },

  // Main content
  main:     { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  content:  { flex: 1, padding: "32px 40px", overflowY: "auto" },

  // Page header
  pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  pageTitleRow:{ display: "flex", alignItems: "center", gap: 14 },
  pageTitleIcon:{ width: 44, height: 44, background: P.primaryLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  pageTitle: { fontSize: 28, fontWeight: 900, color: "#0F172A" },
  pageDate:  { fontSize: 14, color: "#64748B", marginTop: 2 },
  navBtns:   { display: "flex", alignItems: "center", gap: 10 },
  todayBtn:  { padding: "8px 20px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#0F172A" },
  arrowBtn:  { width: 34, height: 34, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 },

  // Calendar grid
  calWrap:   { background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" },
  calHead:   { display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)", borderBottom: "1px solid #E5E7EB" },
  calHeadCell:{ padding: "14px 8px", textAlign: "center" },
  dayLabel:  { fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.8, textTransform: "uppercase" },
  dayNum:    (today) => ({
    fontSize: 22, fontWeight: 800, color: today ? P.primary : "#0F172A",
    background: today ? P.primaryLight : "transparent",
    borderRadius: "50%", width: 36, height: 36, display: "flex",
    alignItems: "center", justifyContent: "center", margin: "4px auto 0",
  }),
  calBody:   { display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)" },
  timeCell:  { padding: "0 12px", display: "flex", alignItems: "flex-start", paddingTop: 8, color: "#94A3B8", fontSize: 13, fontWeight: 500 },
  dayCol:    { borderLeft: "1px solid #F1F5F9", minHeight: 72, position: "relative", padding: "4px" },
  apptBlock: (color) => ({
    background: APPT_COLORS[color]?.bg || P.primary,
    color: APPT_COLORS[color]?.text || "#fff",
    borderRadius: 8, padding: "6px 10px", marginBottom: 4,
    fontSize: 13, cursor: "pointer", transition: "opacity 0.15s",
  }),
  apptTime:  { fontSize: 12, fontWeight: 700, marginBottom: 2 },
  apptName:  { fontWeight: 600, marginBottom: 1 },
  apptSvc:   { fontSize: 11, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  // Patients page
  patientsHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 4 },
  patientsSub:    { fontSize: 14, color: "#64748B", marginBottom: 28, marginLeft: 58 },
  patientsGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  patientCard:    { background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  patientCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  patientLeft:    { display: "flex", alignItems: "center", gap: 14 },
  patientAvatar:  (color) => ({ width: 48, height: 48, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }),
  patientName:    { fontSize: 16, fontWeight: 800, color: "#0F172A" },
  patientMeta:    { fontSize: 13, color: "#64748B" },
  viewBtn:        { display: "flex", alignItems: "center", gap: 6, background: P.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  patientInfo:    { fontSize: 13, color: "#64748B", lineHeight: 2 },
  highlight:      (color) => ({ color, fontWeight: 700 }),
  divider:        { borderTop: "1px solid #F1F5F9", margin: "14px 0 10px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  resultsCount:   { fontSize: 13, color: "#94A3B8" },
  docIcon:        { color: "#94A3B8" },

  // Modal
  overlay:  { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 },
  modal:    { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" },
  modalHead:{ background: P.primary, borderRadius: "16px 16px 0 0", padding: "28px 32px", display: "flex", alignItems: "center", gap: 20, position: "relative" },
  modalAvatar:{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff" },
  modalName:{ fontSize: 24, fontWeight: 900, color: "#fff" },
  modalMeta:{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  closeBtn: { position: "absolute", top: 16, right: 20, background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", opacity: 0.8 },
  modalBody:{ padding: "28px 32px" },
  section:  { marginBottom: 24 },
  secHead:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  secTitle: { fontSize: 17, fontWeight: 800, color: "#0F172A" },
  infoBox:  { background: "#F8F9FF", borderRadius: 10, padding: "16px 20px" },
  infoRow:  { fontSize: 14, color: "#0F172A", lineHeight: 2.1 },
  infoKey:  { color: "#64748B", marginRight: 4 },
  editBtn:  { display: "flex", alignItems: "center", gap: 6, background: P.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  resultItem:{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8F9FF", borderRadius: 10, padding: "14px 18px", marginBottom: 8 },
  resultLeft:{ display: "flex", alignItems: "center", gap: 12 },
  resultName:{ fontSize: 14, fontWeight: 600, color: "#0F172A" },
  resultDate:{ fontSize: 12, color: "#94A3B8", marginTop: 2 },
  viewLink: { color: P.primary, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "none", border: "none" },
  uploadBtn:{ display: "flex", alignItems: "center", gap: 6, background: P.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" },

  // Edit form
  editField:{ marginBottom: 16 },
  editLabel:{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 6, display: "block" },
  editInput:{ width: "100%", padding: "10px 14px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  editTextarea:{ width: "100%", padding: "10px 14px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", minHeight: 90, resize: "vertical" },
  saveBtn:  { flex: 1, padding: "12px", background: P.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  cancelBtn:{ flex: 1, padding: "12px", background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" },

  // Medical Records
  filterRow:   { display: "flex", gap: 8, marginBottom: 24 },
  filterBtn:   (active) => ({ padding: "8px 18px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: active ? P.primary : "#F1F5F9", color: active ? "#fff" : "#64748B", transition: "all 0.15s" }),
  recGrid:     { display: "flex", flexDirection: "column", gap: 12 },
  recCard:     (done) => ({ background: "#fff", borderRadius: 14, padding: "18px 22px", border: `1px solid ${done ? "#D1FAE5" : "#FEF3C7"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }),
  recLeft:     { display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 },
  recAvatar:   (color) => ({ width: 44, height: 44, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }),
  recPatient:  { fontSize: 15, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  recDate:     { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  recDiag:     { fontSize: 13, color: "#64748B", marginTop: 3, fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  statusBadge: (done) => ({ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700, background: done ? "#D1FAE5" : "#FEF3C7", color: done ? "#065F46" : "#92400E", flexShrink: 0 }),
  editRecBtn:  { display: "flex", alignItems: "center", gap: 6, background: P.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 },
};

const AVATAR_COLORS = ["#3B5BDB","#10B981","#8B5CF6","#EF4444","#F59E0B","#EC4899"];
function avatarColor(name) { let h = 0; for (const c of name) h += c.charCodeAt(0); return AVATAR_COLORS[h % AVATAR_COLORS.length]; }

// Icons 
const CalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="3" stroke={P.primary} strokeWidth="2"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke={P.primary} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const DocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={P.primary} strokeWidth="2"/>
    <polyline points="14 2 14 8 20 8" stroke={P.primary} strokeWidth="2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const ClipboardIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <rect x="9" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth="2"/>
    <path d="M9 12h6M9 16h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M16 17l5-5-5-5M21 12H9M13 22H5a2 2 0 01-2-2V4a2 2 0 012-2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Medical Records modal
function MedicalRecordModal({ record, onClose, onSaved, t }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ diagnosis: record.diagnosis || "", notes: record.notes || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isDone = !!(record.diagnosis || record.notes);

  const hc = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("diagnosis", editData.diagnosis);
      formData.append("notes", editData.notes);
      const res = await fetch(`${API_BASE}/api/medical-records/${record.id}`, {
        method: "PUT",
        headers: { Authorization: getAuthHeader() },
        body: formData,
      });
      if (res.ok) {
        onSaved({ ...record, ...editData });
        setEditing(false);
      } else {
        setError(t.failedSave);
      }
    } catch {
      setError(t.networkError);
    } finally {
      setSaving(false);
    }
  };

  const patientName = record.patient_name || record.name || record.email || "Patient";
  const apptDate = record.appointment_date || record.created_at || "";

  return (
    <div style={st.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={st.modal}>
        <div style={st.modalHead}>
          <div style={st.modalAvatar}>{initials(patientName)}</div>
          <div>
            <div style={st.modalName}>{patientName}</div>
            <div style={st.modalMeta}>{apptDate ? apptDate.slice(0, 10) : "—"}</div>
          </div>
          <div style={{ position: "absolute", top: 16, right: 56, ...st.statusBadge(!isDone ? false : true), background: isDone ? "rgba(209,250,229,0.25)" : "rgba(254,243,199,0.25)", color: isDone ? "#D1FAE5" : "#FEF3C7" }}>
            {isDone ? t.completed : t.pending}
          </div>
          <button style={st.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={st.modalBody}>
          {!editing ? (
            <div style={st.section}>
              <div style={st.secHead}>
                <span style={st.secTitle}>{t.records}</span>
                <button style={st.editBtn} onClick={() => setEditing(true)}>
                  <EditIcon /> {isDone ? t.edit : t.fillIn}
                </button>
              </div>
              <div style={st.infoBox}>
                <div style={st.infoRow}>
                  <span style={st.infoKey}>{t.diagnosis}</span>
                  {editData.diagnosis ? <span style={{ color: "#0F172A" }}>{editData.diagnosis}</span> : <span style={{ color: "#94A3B8", fontStyle: "italic" }}>—</span>}
                </div>
                <div style={st.infoRow}>
                  <span style={st.infoKey}>{t.notes}</span>
                  {editData.notes ? <span style={{ color: "#0F172A" }}>{editData.notes}</span> : <span style={{ color: "#94A3B8", fontStyle: "italic" }}>—</span>}
                </div>
              </div>
            </div>
          ) : (
            <div style={st.section}>
              <div style={st.secHead}>
                <span style={st.secTitle}>{t.records}</span>
              </div>
              <div style={st.editField}>
                <label style={st.editLabel}>{t.diagnosis}</label>
                <input style={st.editInput} name="diagnosis" value={editData.diagnosis} onChange={hc}
                  placeholder={t.enterDiagnosis}
                  onFocus={(e) => (e.target.style.borderColor = P.primary)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
              </div>
              <div style={st.editField}>
                <label style={st.editLabel}>{t.notes}</label>
                <textarea style={st.editTextarea} name="notes" value={editData.notes} onChange={hc}
                  placeholder={t.enterNotes}
                  onFocus={(e) => (e.target.style.borderColor = P.primary)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
              </div>
              {error && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{error}</div>}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={{ ...st.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                  {saving ? "..." : t.saveChanges}
                </button>
                <button style={st.cancelBtn} onClick={() => { setEditing(false); setError(""); }}>
                  {t.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Medical Records view
function MedicalRecordsView({ t }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/doctors-test/my-medical-records`, {
      headers: { Authorization: getAuthHeader() },
    })
      .then(r => { console.log("medical-records status:", r.status); return r.json(); })
      .then(data => {
        console.log("medical-records response:", data);
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.records) ? data.records : []));
        setRecords(list);
      })
      .catch((e) => { console.error("medical-records error:", e); setRecords([]); })
      .finally(() => setLoading(false));
  }, []);

  const isDone = (r) => !!(r.diagnosis || r.notes);

  const filtered = filter === "pending"
    ? records.filter(r => !isDone(r))
    : filter === "done"
      ? records.filter(r => isDone(r))
      : records;

  const pendingCount = records.filter(r => !isDone(r)).length;

  const handleSaved = (updated) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelected(updated);
  };

  return (
    <div>
      <div style={{ ...st.patientsHeader, marginBottom: 8 }}>
        <div style={st.pageTitleIcon}><ClipboardIcon size={20} color={P.primary} /></div>
        <div style={st.pageTitle}>{t.records}</div>
      </div>
      <div style={{ ...st.patientsSub, marginBottom: 20 }}>
        {pendingCount > 0
          ? <span style={{ color: "#D97706", fontWeight: 600 }}>{pendingCount} {t.needsFilling}</span>
          : t.allUpToDate}
      </div>

      <div style={st.filterRow}>
        {[["all", t.filterAll], ["pending", t.filterPending], ["done", t.filterDone]].map(([val, label]) => (
          <button key={val} style={st.filterBtn(filter === val)} onClick={() => setFilter(val)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>{t.loadingRecords}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>{t.noRecords}</div>
      ) : (
        <div style={st.recGrid}>
          {filtered.map(r => {
            const done = isDone(r);
            const patientName = r.patient_name || r.name || r.email || "Patient";
            const color = avatarColor(patientName);
            const date = r.appointment_date || r.created_at || "";
            return (
              <div key={r.id} style={st.recCard(done)}>
                <div style={st.recLeft}>
                  <div style={st.recAvatar(color)}>{initials(patientName)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={st.recPatient}>{patientName}</div>
                    <div style={st.recDate}>{date ? date.slice(0, 10) : "—"}</div>
                    {r.diagnosis && <div style={st.recDiag}>{r.diagnosis}</div>}
                  </div>
                </div>
                <span style={st.statusBadge(done)}>{done ? t.completed : t.pending}</span>
                <button style={st.editRecBtn} onClick={() => setSelected(r)}>
                  <EditIcon /> {done ? t.edit : t.fillIn}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <MedicalRecordModal
          record={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
          t={t}
        />
      )}
    </div>
  );
}

//Patient Detail Modal
function PatientModal({ patient, onClose }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    diagnosis: patient.diagnosis,
    bloodType: patient.bloodType,
    allergies: patient.allergies,
    medications: "",
    notes: "",
  });

  const hc = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  return (
    <div style={st.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={st.modal}>
        <div style={st.modalHead}>
          <div style={st.modalAvatar}>{initials(patient.name)}</div>
          <div>
            <div style={st.modalName}>{patient.name}</div>
            <div style={st.modalMeta}>{patient.age} years • {patient.gender}</div>
          </div>
          <button style={st.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={st.modalBody}>
          <div style={st.section}>
            <div style={st.secHead}>
              <span style={st.secTitle}>Contact Information</span>
            </div>
            <div style={st.infoBox}>
              <div style={st.infoRow}><span style={st.infoKey}>Email:</span>{patient.email}</div>
              <div style={st.infoRow}><span style={st.infoKey}>Phone:</span>{patient.phone}</div>
            </div>
          </div>

          {!editing ? (
            <div style={st.section}>
              <div style={st.secHead}>
                <span style={st.secTitle}>Medical Information</span>
                <button style={st.editBtn} onClick={() => setEditing(true)}>
                  <EditIcon /> Edit
                </button>
              </div>
              <div style={st.infoBox}>
                <div style={st.infoRow}><span style={st.infoKey}>Last Visit:</span>{patient.lastVisit}</div>
                <div style={st.infoRow}><span style={st.infoKey}>Diagnosis:</span>{editData.diagnosis}</div>
                <div style={st.infoRow}>
                  <span style={st.infoKey}>Blood Type:</span>
                  <span style={st.highlight(P.primary)}>{editData.bloodType}</span>
                </div>
                <div style={st.infoRow}>
                  <span style={st.infoKey}>Allergies:</span>
                  <span style={st.highlight("#EF4444")}>{editData.allergies}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={st.section}>
              <div style={st.secHead}>
                <span style={st.secTitle}>Edit Medical Information</span>
              </div>
              <div style={st.editField}>
                <label style={st.editLabel}>Diagnosis:</label>
                <input style={st.editInput} name="diagnosis" value={editData.diagnosis} onChange={hc}
                  onFocus={(e) => (e.target.style.borderColor = P.primary)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
              </div>
              <div style={st.editField}>
                <label style={st.editLabel}>Blood Type:</label>
                <input style={st.editInput} name="bloodType" value={editData.bloodType} onChange={hc}
                  onFocus={(e) => (e.target.style.borderColor = P.primary)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
              </div>
              <div style={st.editField}>
                <label style={st.editLabel}>Allergies:</label>
                <input style={st.editInput} name="allergies" value={editData.allergies} onChange={hc}
                  onFocus={(e) => (e.target.style.borderColor = P.primary)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
              </div>
              <div style={st.editField}>
                <label style={st.editLabel}>Medications:</label>
                <input style={st.editInput} name="medications" value={editData.medications} onChange={hc}
                  placeholder="Enter current medications"
                  onFocus={(e) => (e.target.style.borderColor = P.primary)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
              </div>
              <div style={st.editField}>
                <label style={st.editLabel}>Additional Notes:</label>
                <textarea style={st.editTextarea} name="notes" value={editData.notes} onChange={hc}
                  placeholder="Enter additional medical notes"
                  onFocus={(e) => (e.target.style.borderColor = P.primary)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={st.saveBtn} onClick={() => setEditing(false)}>
                  💾 Save Changes
                </button>
                <button style={st.cancelBtn} onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={st.section}>
            <div style={st.secHead}>
              <span style={st.secTitle}>Medical Results</span>
              <button style={st.uploadBtn}><UploadIcon /> Upload Result</button>
            </div>
            {patient.results.map((r, i) => (
              <div key={i} style={st.resultItem}>
                <div style={st.resultLeft}>
                  <DocIcon />
                  <div>
                    <div style={st.resultName}>{r.name}</div>
                    <div style={st.resultDate}>{r.date}</div>
                  </div>
                </div>
                <button style={st.viewLink}>View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Schedule View
function ScheduleView({ doctorId, t }) {
  const [baseDate, setBaseDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const weekDates = getWeekDates(baseDate);
  const todayStr = fmt(new Date());

  useEffect(() => {
    if (!doctorId) return;
    fetch(`${API_BASE}/api/appointment`, {
      headers: { Authorization: getAuthHeader() },
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        console.log("All appointments:", list.length, "doctorId:", doctorId);
        console.log("Sample doctor_ids:", list.slice(0, 3).map(a => a.doctor_id));
        const filtered = list.filter(a => a.doctor_id === doctorId);
        console.log("Filtered for Alisher:", filtered.length, filtered);
        setAppointments(filtered);
      })
      .catch((e) => console.error("Appointments fetch error:", e));
  }, [doctorId]);

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };
  const goToday  = () => setBaseDate(new Date());

  const locale = t.locale || "en-US";
  const weekLabel = t.locale === "en-US"
    ? `${weekDates[0].toLocaleDateString(locale, { month: "long", day: "numeric" })} – ${weekDates[6].toLocaleDateString(locale, { day: "numeric" })}, ${weekDates[0].getFullYear()}`
    : `${weekDates[0].toLocaleDateString(locale, { day: "numeric", month: "long" })} – ${weekDates[6].toLocaleDateString(locale, { day: "numeric", month: "long" })}, ${weekDates[0].getFullYear()}`;

  const getAppts = (date) => {
    const dateStr = fmt(date);
    return appointments
      .filter(a => a.start_time && a.start_time.startsWith(dateStr))
      .map(a => ({
        id: a.id,
        time: a.start_time.slice(11, 16),
        patient: a.name || a.email || "Patient",
        color: "blue",
      }));
  };

  return (
    <div>
      <div style={st.pageHeader}>
        <div style={st.pageTitleRow}>
          <div style={st.pageTitleIcon}><CalIcon /></div>
          <div>
            <div style={st.pageTitle}>{t.schedule}</div>
            <div style={st.pageDate}>{weekLabel}</div>
          </div>
        </div>
        <div style={st.navBtns}>
          <button style={st.arrowBtn} onClick={prevWeek}>‹</button>
          <button style={st.todayBtn} onClick={goToday}>{t.today}</button>
          <button style={st.arrowBtn} onClick={nextWeek}>›</button>
        </div>
      </div>

      <div style={st.calWrap}>
        <div style={st.calHead}>
          <div />
          {weekDates.map((d, i) => {
            const isToday = fmt(d) === todayStr;
            return (
              <div key={i} style={st.calHeadCell}>
                <div style={st.dayLabel}>{(t.days || DAYS)[i]}</div>
                <div style={st.dayNum(isToday)}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>

        {HOURS.map((hour) => (
          <div key={hour} style={st.calBody}>
            <div style={st.timeCell}>{hour}</div>
            {weekDates.map((d, di) => {
              const appts = getAppts(d).filter(a => a.time.startsWith(hour.slice(0, 2)));
              return (
                <div key={di} style={{ ...st.dayCol, borderTop: "1px solid #F1F5F9" }}>
                  {appts.map(a => (
                    <div key={a.id} style={st.apptBlock(a.color)}>
                      <div style={st.apptTime}>{a.time}</div>
                      <div style={st.apptName}>{a.patient}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const AI_BASE = "http://localhost:8000";

function AIAnalysisView({ t }) {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [dragging, setDragging]   = useState(false);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) { setError(t.aiError); return; }
    setFile(f);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${AI_BASE}/predict`, { method: "POST", body: form });
      if (!res.ok) throw new Error("server error");
      const blob = await res.blob();
      setResult(URL.createObjectURL(blob));
    } catch (e) {
      setError(t.aiServerError);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(""); };

  return (
    <div>
      <div style={st.patientsHeader}>
        <div style={st.pageTitleIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke={P.primary} strokeWidth="2"/>
            <path d="M12 8v4l3 3" stroke={P.primary} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={st.pageTitle}>{t.aiTitle}</div>
      </div>
      <div style={st.patientsSub}>{t.aiSub}</div>

      {!result ? (
        <div style={{ maxWidth: 560 }}>
          {/* Drop zone */}
          <div
            style={{
              border: `2px dashed ${dragging ? P.primary : "#CBD5E1"}`,
              borderRadius: 16, padding: "40px 24px", textAlign: "center",
              background: dragging ? "rgba(99,102,241,0.04)" : "#F8FAFC",
              cursor: "pointer", transition: "all 0.2s", marginBottom: 20,
            }}
            onClick={() => document.getElementById("ai-file-input").click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input id="ai-file-input" type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])} />
            {preview ? (
              <img src={preview} alt="preview"
                style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 10, objectFit: "contain" }} />
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12, opacity: 0.4 }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  {t.aiDrop}
                </div>
                <div style={{ fontSize: 13, color: "#94A3B8" }}>{t.aiDropHint}</div>
              </>
            )}
          </div>

          {error && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 14 }}>{error}</div>}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{
                flex: 1, padding: "12px 0", background: file ? P.primary : "#E5E7EB",
                color: file ? "#fff" : "#9CA3AF", border: "none", borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: file ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onClick={handleAnalyze} disabled={!file || loading}
            >
              {loading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  {t.aiAnalyzing}
                </>
              ) : t.aiAnalyze}
            </button>
            {file && (
              <button
                style={{
                  padding: "12px 20px", background: "#fff", border: "1px solid #E5E7EB",
                  borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151",
                }}
                onClick={reset}
              >{t.aiReset}</button>
            )}
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ maxWidth: 700 }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 24,
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#10B981", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="22 4 12 14.01 9 11.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {t.aiDone}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8, fontWeight: 600 }}>{t.aiOriginal}</div>
                <img src={preview} alt="original"
                  style={{ width: "100%", borderRadius: 10, objectFit: "contain", maxHeight: 340, background: "#F8FAFC" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8, fontWeight: 600 }}>{t.aiResult}</div>
                <img src={result} alt="result"
                  style={{ width: "100%", borderRadius: 10, objectFit: "contain", maxHeight: 340, background: "#F8FAFC" }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{
                padding: "11px 28px", background: P.primary, color: "#fff", border: "none",
                borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
              onClick={() => { const a = document.createElement("a"); a.href = result; a.download = "ai-result.jpg"; a.click(); }}
            >{t.aiDownload}</button>
            <button
              style={{
                padding: "11px 28px", background: "#fff", border: "1px solid #E5E7EB",
                borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151",
              }}
              onClick={reset}
            >{t.aiNew}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const LANGS = ["RU", "EN", "KZ"];

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "KZ", label: "Қазақша" },
  { code: "RU", label: "Русский" },
];

export default function DoctorDashboard({ setPage, lang: propLang = "RU" }) {
  const [view, setView] = useState("schedule");
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("Doctor");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState(propLang);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const t = TR[lang] || TR.RU;
  const curLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("token") || "";
    if (!raw) return;
    const claims = parseJwt(raw);
    const email = claims.email || "";

    fetch(`${API_BASE}/api/doctors`, {
      headers: { Authorization: getAuthHeader() },
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const me = list.find(d => d.email === email);
        if (me) {
          setDoctorId(me.id);
          setDoctorName(me.name || "Doctor");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={st.shell}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div style={{ width: 36, height: 36, background: P.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SmileIcon size={20} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>Dental Clinic</span>
        </div>
        <div style={{ position: "relative" }} ref={langRef}>
          <button
            onClick={() => setLangOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1A1A2E", fontWeight: 500, cursor: "pointer", border: `1px solid ${langOpen ? P.primary : "#E5E7EB"}`, borderRadius: 8, padding: "6px 12px", background: "transparent" }}
          >
            <GlobeIcon />
            <span>{curLang.code}</span>
            <span style={{ fontSize: 10, marginLeft: 2, display: "inline-block", transform: langOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
          </button>
          {langOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, overflow: "hidden", zIndex: 200 }}>
              {LANGUAGES.map(l => (
                <div
                  key={l.code}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = "#F8F9FF"; }}
                  onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = "transparent"; }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, cursor: "pointer", fontWeight: l.code === lang ? 600 : 400, color: l.code === lang ? P.primary : "#1A1A2E", background: l.code === lang ? COLORS.primaryLight : "transparent" }}
                >
                  <span>{l.label}</span>
                  {l.code === lang && <span style={{ marginLeft: "auto", color: P.primary, fontSize: 14 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div style={st.body}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <aside style={st.sidebar(sidebarOpen)}>
          <div style={st.sideTop(sidebarOpen)}>
            <div style={st.avatarWrap}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            {sidebarOpen && (
              <>
                <div style={st.doctorName}>{doctorName}</div>
                <div style={st.doctorRole}>{t.role}</div>
              </>
            )}
          </div>

          <nav style={st.navList}>
            {[
              { key: "schedule", label: t.schedule, icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )},
              { key: "ai", label: t.ai, icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12h4l2-4 2 8 2-4h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { key: "records", label: t.records, icon: <ClipboardIcon size={18} /> },
            ].map(({ key, label, icon }) => (
              <div key={key} style={st.navItem(view === key, sidebarOpen)} onClick={() => setView(key)} title={!sidebarOpen ? label : ""}>
                {icon}
                {sidebarOpen && label}
              </div>
            ))}
          </nav>

          <div style={st.logoutItem(sidebarOpen)} onClick={() => { localStorage.removeItem("token"); setPage("login"); }} title={!sidebarOpen ? t.logout : ""}>
            <LogoutIcon />
            {sidebarOpen && t.logout}
          </div>
        </aside>
          <div style={st.toggleBtn} onClick={() => setSidebarOpen(o => !o)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d={sidebarOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} stroke={P.primary} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <main style={st.main}>
          <div style={st.content}>
            {view === "schedule" && <ScheduleView doctorId={doctorId} t={t} />}
            {view === "ai"       && <AIAnalysisView t={t} />}
            {view === "records"  && <MedicalRecordsView t={t} />}
          </div>
        </main>
      </div>
    </div>
  );
}
