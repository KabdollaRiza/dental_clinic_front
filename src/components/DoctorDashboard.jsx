import { useState } from "react";
import { COLORS } from "./constants";
import { SmileIcon } from "./Icons";

const P = COLORS;

const DEMO_APPOINTMENTS = [
  { id: 1, time: "09:00", patient: "John Smith",    service: "General Consultation",    date: "2026-03-13", color: "blue" },
  { id: 2, time: "10:00", patient: "Anna Petrova",  service: "Dental Implant Cons...",  date: "2026-03-11", color: "blue" },
  { id: 3, time: "10:30", patient: "Maria Garcia",  service: "Cardiology Check-up",     date: "2026-03-13", color: "blue" },
  { id: 4, time: "11:00", patient: "Michael Brown", service: "Dental Check-up",         date: "2026-03-14", color: "blue" },
  { id: 5, time: "11:00", patient: "Sofia Martinez",service: "Cavity Filling",          date: "2026-03-15", color: "blue" },
  { id: 6, time: "09:30", patient: "Sarah Johnson", service: "Dental Cleaning",         date: "2026-03-14", color: "blue" },
  { id: 7, time: "14:30", patient: "James Wilson",  service: "Orthodontic Check-up",    date: "2026-03-11", color: "yellow" },
  { id: 8, time: "14:00", patient: "David Chen",    service: "Follow-up",               date: "2026-03-13", color: "yellow" },
  { id: 9, time: "15:00", patient: "Emily Davis",   service: "Teeth Whitening",         date: "2026-03-14", color: "yellow" },
  { id:10, time: "16:00", patient: "Riza Kabdolla", service: "Root Canal Treatment",    date: "2026-03-10", color: "blue" },
];

const DEMO_PATIENTS = [
  { id: 1, name: "John Smith",    age: 45, gender: "Male",   lastVisit: "2026-03-12", diagnosis: "General Consultation",        bloodType: "B+",  allergies: "Latex",      email: "john.smith@email.com",    phone: "+7 (703) 456-7890", results: [{ name: "Dental Check-up Report", date: "2026-03-12" }, { name: "X-Ray Results", date: "2026-02-10" }] },
  { id: 2, name: "Riza Kabdolla", age: 34, gender: "Male",   lastVisit: "2026-03-10", diagnosis: "Root Canal Treatment Required", bloodType: "O+", allergies: "Penicillin", email: "riza@email.com",           phone: "+7 (701) 123-4567", results: [{ name: "Root Canal X-Ray", date: "2026-03-10" }, { name: "Pain Assessment", date: "2026-03-05" }] },
  { id: 3, name: "Anna Petrova",  age: 28, gender: "Female", lastVisit: "2026-03-11", diagnosis: "Dental Implant Consultation",  bloodType: "A+",  allergies: "None",       email: "anna.petrova@email.com",  phone: "+7 (702) 987-6543", results: [{ name: "Implant Assessment", date: "2026-03-11" }] },
  { id: 4, name: "Maria Garcia",  age: 52, gender: "Female", lastVisit: "2026-03-12", diagnosis: "Cardiology Check-up",          bloodType: "AB+", allergies: "Aspirin",    email: "maria.garcia@email.com",  phone: "+7 (705) 321-0987", results: [{ name: "ECG Report", date: "2026-03-12" }, { name: "Blood Work", date: "2026-02-28" }] },
];

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

const APPT_COLORS = {
  blue:   { bg: "#3B5BDB", text: "#fff" },
  yellow: { bg: "#F59E0B", text: "#fff" },
};

const st = {
  shell:    { display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F8F9FF" },
  body:     { display: "flex", flex: 1 },

  // Sidebar
  sidebar:  { width: 240, background: P.primary, display: "flex", flexDirection: "column", minHeight: "100%" },
  sideTop:  { padding: "32px 24px 24px" },
  avatarWrap:{ width: 56, height: 56, background: "rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  doctorName:{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4 },
  doctorRole:{ fontSize: 13, color: "rgba(255,255,255,0.7)" },
  navList:  { padding: "8px 0", flex: 1 },
  navItem:  (active) => ({
    display: "flex", alignItems: "center", gap: 12, padding: "13px 24px",
    cursor: "pointer", fontSize: 14, fontWeight: active ? 700 : 500,
    color: active ? "#fff" : "rgba(255,255,255,0.7)",
    background: active ? "rgba(255,255,255,0.18)" : "transparent",
    borderRadius: active ? "0 24px 24px 0" : 0,
    marginRight: active ? 16 : 0,
    transition: "all 0.15s",
  }),
  logoutItem:{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: "auto" },

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
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M16 17l5-5-5-5M21 12H9M13 22H5a2 2 0 01-2-2V4a2 2 0 012-2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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
function ScheduleView() {
  const [baseDate, setBaseDate] = useState(new Date("2026-03-16"));
  const weekDates = getWeekDates(baseDate);
  const todayStr = fmt(new Date());

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };
  const goToday  = () => setBaseDate(new Date());

  const weekLabel = `${weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${weekDates[6].toLocaleDateString("en-US", { day: "numeric" })}, ${weekDates[0].getFullYear()}`;

  const getAppts = (date) => DEMO_APPOINTMENTS.filter(a => a.date === fmt(date));

  return (
    <div>
      <div style={st.pageHeader}>
        <div style={st.pageTitleRow}>
          <div style={st.pageTitleIcon}><CalIcon /></div>
          <div>
            <div style={st.pageTitle}>My Schedule</div>
            <div style={st.pageDate}>{weekLabel}</div>
          </div>
        </div>
        <div style={st.navBtns}>
          <button style={st.arrowBtn} onClick={prevWeek}>‹</button>
          <button style={st.todayBtn} onClick={goToday}>Today</button>
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
                <div style={st.dayLabel}>{DAYS[i]}</div>
                <div style={st.dayNum(isToday)}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>

        {HOURS.map((hour) => (
          <div key={hour} style={st.calBody}>
            <div style={st.timeCell}>{hour}</div>
            {weekDates.map((d, di) => {
              const appts = getAppts(d).filter(a => a.time.startsWith(hour.slice(0,2)));
              return (
                <div key={di} style={{ ...st.dayCol, borderTop: "1px solid #F1F5F9" }}>
                  {appts.map(a => (
                    <div key={a.id} style={st.apptBlock(a.color)}>
                      <div style={st.apptTime}>{a.time}</div>
                      <div style={st.apptName}>{a.patient}</div>
                      <div style={st.apptSvc}>{a.service}</div>
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

function PatientsView() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div style={st.patientsHeader}>
        <div style={st.pageTitleIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
              stroke={P.primary} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={st.pageTitle}>Patients</div>
      </div>
      <div style={st.patientsSub}>View and manage your patients</div>

      <div style={st.patientsGrid}>
        {DEMO_PATIENTS.map((p) => {
          const color = avatarColor(p.name);
          return (
            <div key={p.id} style={st.patientCard}>
              <div style={st.patientCardTop}>
                <div style={st.patientLeft}>
                  <div style={st.patientAvatar(color)}>{initials(p.name)}</div>
                  <div>
                    <div style={st.patientName}>{p.name}</div>
                    <div style={st.patientMeta}>{p.age} years • {p.gender}</div>
                  </div>
                </div>
                <button style={st.viewBtn} onClick={() => setSelected(p)}>
                  <EyeIcon /> View
                </button>
              </div>

              <div style={st.patientInfo}>
                <div><span style={{ color: "#94A3B8" }}>Last Visit: </span>{p.lastVisit}</div>
                <div><span style={{ color: "#94A3B8" }}>Diagnosis: </span>{p.diagnosis}</div>
                <div>
                  <span style={{ color: "#94A3B8" }}>Blood Type: </span>
                  <span style={st.highlight(P.primary)}>{p.bloodType}</span>
                </div>
                <div>
                  <span style={{ color: "#94A3B8" }}>Allergies: </span>
                  <span style={st.highlight("#EF4444")}>{p.allergies}</span>
                </div>
              </div>

              <div style={st.divider}>
                <span style={st.resultsCount}>{p.results.length} results on file</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#94A3B8" strokeWidth="2"/>
                  <polyline points="14 2 14 8 20 8" stroke="#94A3B8" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <PatientModal patient={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default function DoctorDashboard({ setPage, lang: _lang = "EN" }) {
  const [view, setView] = useState("schedule");

  const doctorName = "Dr. Riza Kabdolla";

  return (
    <div style={st.shell}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 48px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div style={{ width: 40, height: 40, background: P.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SmileIcon size={22} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>Dental Clinic</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 12px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2"/></svg>
          <span>EN ▼</span>
        </div>
      </header>

      <div style={st.body}>
        <aside style={st.sidebar}>
          <div style={st.sideTop}>
            <div style={st.avatarWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="#fff" strokeWidth="2"/>
                <path d="M16 3H8L6 7h12l-2-4z" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
            <div style={st.doctorName}>{doctorName}</div>
            <div style={st.doctorRole}>Medical Professional</div>
          </div>

          <nav style={st.navList}>
            <div style={st.navItem(view === "schedule")} onClick={() => setView("schedule")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              My Schedule
            </div>
            <div style={st.navItem(view === "patients")} onClick={() => setView("patients")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Patients
            </div>
          </nav>

          <div style={st.logoutItem} onClick={() => { localStorage.removeItem("token"); setPage("login"); }}>
            <LogoutIcon /> Logout
          </div>
        </aside>

        <main style={st.main}>
          <div style={st.content}>
            {view === "schedule" && <ScheduleView />}
            {view === "patients" && <PatientsView />}
          </div>
        </main>
      </div>
    </div>
  );
}
