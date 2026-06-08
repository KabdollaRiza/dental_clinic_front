import { useState, useEffect, useRef } from "react";
import { COLORS } from "./constants";
import { ADMIN_T } from "./translation";
import { GlobeIcon } from "./Icons";
import { useResponsive } from "./useResponsive";
import { TableOrCards } from "./TableOrCards";

const API_BASE = "http://161.35.116.104:8080";
const C = COLORS;

const msgTxt = m => m.slice(m.indexOf(':') + 1);

function authFetch(url, options = {}) {
  const raw = sessionStorage.getItem("token") || "";
  const authHeader = raw.startsWith("Bearer ") ? raw : (raw ? `Bearer ${raw}` : "");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (authHeader) headers["Authorization"] = authHeader;
  return fetch(url, { ...options, headers });
}

function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return {}; }
}

const LANGUAGES = [
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "KZ", label: "Қазақша", flag: "🇰🇿" },
  { code: "RU", label: "Русский", flag: "🇷🇺" },
];

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const s = {
  page: { flex: 1, background: "#F8F9FF", display: "flex", flexDirection: "column", minHeight: "100vh" },
  bar: { background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  barLeft: { display: "flex", alignItems: "center", gap: 14 },
  barIcon: { width: 40, height: 40, background: C.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  barTitle: { fontSize: 18, fontWeight: 800, color: C.text },
  barSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  barRight: { display: "flex", alignItems: "center", gap: 16 },
  langWrap: { position: "relative" },
  langBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1A1A2E", fontWeight: 500, cursor: "pointer", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", background: "transparent" },
  langDrop: { position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, overflow: "hidden", zIndex: 400 },
  langItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, cursor: "pointer", fontWeight: active ? 600 : 400, color: active ? C.primary : "#1A1A2E", background: active ? C.primaryLight : "transparent" }),
  logoutBtn: { display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", fontWeight: 500 },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: { width: 220, flexShrink: 0, background: "#fff", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflowY: "auto" },
  sideBody: { flex: 1, padding: "20px 12px" },
  sideLabel: { fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", padding: "0 14px", marginBottom: 8 },
  sideItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 14px", borderRadius: 10, marginBottom: 3, fontSize: 14, fontWeight: active ? 700 : 500, color: active ? C.primary : "#374151", background: active ? C.primaryLight : "transparent", border: "none", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }),
  content: { flex: 1, overflowY: "auto", padding: "0 48px 56px" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20, marginTop: 32 },
  sectionTitle: { fontSize: 22, fontWeight: 800, color: C.text },
  table: { width: "100%", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderCollapse: "collapse" },
  thead: { background: "#F8F9FF" },
  th: { padding: "13px 18px", fontSize: 11, fontWeight: 700, color: C.muted, textAlign: "left", textTransform: "uppercase", letterSpacing: 0.6, borderBottom: `1px solid ${C.border}` },
  td: { padding: "14px 18px", fontSize: 14, color: C.text, borderBottom: `1px solid ${C.border}` },
  badge: (color) => ({ display: "inline-block", background: color ? color + "22" : C.primaryLight, color: color || C.primary, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px" }),
  emptyBox: { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "60px 24px", textAlign: "center" },
  emptyText: { fontSize: 14, color: C.muted },
  loading: { padding: "80px 48px", textAlign: "center", color: C.muted, fontSize: 15 },
  addBtn: { display: "flex", alignItems: "center", gap: 6, background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  editBtn: { background: "#EEF2FF", color: C.primary, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6 },
  deleteBtn: { background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  submitBtn: { width: "100%", padding: "14px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  msgOk: { textAlign: "center", fontSize: 13, color: "#22c55e", marginTop: 12, fontWeight: 600 },
  msgErr: { textAlign: "center", fontSize: 13, color: "#ef4444", marginTop: 12, fontWeight: 600 },
  fg: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 },
  input: { width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", background: "#fff" },
  textarea: { width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", background: "#fff", resize: "vertical", minHeight: 80 },
  select: { width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", background: "#fff", cursor: "pointer" },
  checkList: { border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", maxHeight: 140, overflowY: "auto", background: "#fff" },
  checkItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.text, marginBottom: 6, cursor: "pointer" },

  sideCount: (active) => ({
    marginLeft: "auto", fontSize: 11, fontWeight: 700,
    background: active ? C.primary : "#F1F5F9",
    color: active ? "#fff" : C.muted,
    borderRadius: 20, padding: "2px 8px",
    minWidth: 24, textAlign: "center",
  }),
  tabsRow: {
    background: "#fff", borderBottom: `1px solid ${C.border}`,
    display: "flex", padding: "0 48px",
  },
  tab: (active) => ({
    display: "flex", alignItems: "center", gap: 7,
    padding: "16px 20px", fontSize: 14,
    fontWeight: active ? 700 : 500,
    color: active ? C.primary : C.muted,
    borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
    cursor: "pointer", background: "none", border: "none",
    marginBottom: -1, transition: "all 0.15s", whiteSpace: "nowrap",
  }),
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
  },
  modal: {
    background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640,
    maxHeight: "90vh", overflowY: "auto", position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "28px 32px 20px", borderBottom: `1px solid ${C.border}`,
  },
  modalTitle: { fontSize: 20, fontWeight: 800, color: C.text },
  closeBtn: {
    background: "none", border: "none", fontSize: 24,
    cursor: "pointer", color: C.muted, lineHeight: 1, padding: "0 4px",
  },
  modalBody: { padding: "24px 32px 32px" },
};

// ── UI helpers ─────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  const { isMobile } = useResponsive();
  const modalStyle = isMobile ? { ...s.modal, maxWidth: "100%", margin: "0 8px", borderRadius: 12 } : s.modal;
  const headerStyle = isMobile ? { ...s.modalHeader, padding: "18px 20px 14px" } : s.modalHeader;
  const bodyStyle = isMobile ? { ...s.modalBody, padding: "16px 20px 24px" } : s.modalBody;
  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <span style={{ ...s.modalTitle, fontSize: isMobile ? 17 : 20 }}>{title}</span>
          <button style={s.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={bodyStyle}>{children}</div>
      </div>
    </div>
  );
}

function FG({ label, children }) {
  return <div style={s.fg}>{label && <label style={s.label}>{label}</label>}{children}</div>;
}

function Inp({ name, value, onChange, placeholder, type = "text" }) {
  return <input style={s.input} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} />;
}

function Sel({ name, value, onChange, children, disabled }) {
  return (
    <select style={{ ...s.select, opacity: disabled ? 0.6 : 1 }} name={name} value={value} onChange={onChange} disabled={disabled}>
      {children}
    </select>
  );
}

function Empty({ text }) {
  return <div style={s.emptyBox}><p style={s.emptyText}>{text}</p></div>;
}

// ── Profile Modal ──────────────────────────────────────────────────────────────

function ProfileModal({ tx, onClose }) {
  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "" });
  const [emailForm, setEmailForm] = useState({ new_email: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const changePassword = async () => {
    if (!pwForm.old_password || !pwForm.new_password) return;
    setSavingPw(true);
    try {
      const res = await authFetch(`${API_BASE}/api/users/update-password`, { method: "POST", body: JSON.stringify(pwForm) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setPwMsg("err:" + (d.message || d.error || "Failed")); return; }
      setPwMsg("ok:"); setPwForm({ old_password: "", new_password: "" });
    } catch (e) { setPwMsg("err:" + e.message); }
    finally { setSavingPw(false); }
  };

  const changeEmail = async () => {
    if (!emailForm.new_email) return;
    setSavingEmail(true);
    try {
      const res = await authFetch(`${API_BASE}/api/users/update-email`, { method: "POST", body: JSON.stringify(emailForm) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setEmailMsg("err:" + (d.message || d.error || "Failed")); return; }
      setEmailMsg("ok:"); setEmailForm({ new_email: "" });
    } catch (e) { setEmailMsg("err:" + e.message); }
    finally { setSavingEmail(false); }
  };

  return (
    <Modal title={tx.profileSettings || "Profile Settings"} onClose={onClose}>
      <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>{tx.changePassword || "Change Password"}</p>
        <FG label={tx.oldPassword || "Current Password"}><Inp type="password" name="old_password" value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} placeholder={tx.oldPasswordPh || "Enter current password"} /></FG>
        <FG label={tx.newPasswordLabel || "New Password"}><Inp type="password" name="new_password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} placeholder={tx.passwordPlaceholder || "Enter new password"} /></FG>
        <button style={{ ...s.submitBtn, opacity: savingPw ? 0.7 : 1 }} onClick={changePassword} disabled={savingPw}>{tx.changePassword || "Change Password"}</button>
        {pwMsg && <p style={pwMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{pwMsg.startsWith("ok:") ? (tx.passwordChanged || "Password changed!") : msgTxt(pwMsg)}</p>}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>{tx.changeEmail || "Change Email"}</p>
        <FG label={tx.newEmail || "New Email"}><Inp type="email" name="new_email" value={emailForm.new_email} onChange={e => setEmailForm({ new_email: e.target.value })} placeholder={tx.newEmailPh || "Enter new email"} /></FG>
        <button style={{ ...s.submitBtn, opacity: savingEmail ? 0.7 : 1 }} onClick={changeEmail} disabled={savingEmail}>{tx.changeEmail || "Change Email"}</button>
        {emailMsg && <p style={emailMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{emailMsg.startsWith("ok:") ? (tx.emailChanged || "Verification sent!") : msgTxt(emailMsg)}</p>}
      </div>
    </Modal>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

const CLINIC_TABS = [
  { key: "appointments", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
  { key: "doctors",      icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
  { key: "services",     icon: "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4l3 3" },
  { key: "schedule",     icon: "M12 8v4l3 3M12 2a10 10 0 100 20A10 10 0 0012 2z" },
  { key: "addresses",    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" },
  { key: "clinic",       icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" },
  { key: "inventory",    icon: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" },
  { key: "reports",      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

// ── Appointments ───────────────────────────────────────────────────────────────

function AppointmentsView({ appointments, setAppointments, doctors, services, addresses, tx }) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const EMPTY = { name: "", email: "", doctor_id: "", service_id: "", clinic_address_id: "", date: "", start_time: "" };
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [editStatusAppt, setEditStatusAppt] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const STATUS_OPTIONS = [
    { value: "pending",   label: tx.statusPending   || "Pending" },
    { value: "booked",    label: tx.statusBooked    || "Booked" },
    { value: "completed", label: tx.statusCompleted || "Completed" },
    { value: "cancelled", label: tx.statusCancelled || "Cancelled" },
  ];

  const updateStatus = async () => {
    if (!editStatus) return;
    try {
      const res = await authFetch(`${API_BASE}/api/appointment/${editStatusAppt.id}`, { method: "PUT", body: JSON.stringify({ status: editStatus }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setStatusMsg("err:" + (d.message || "Failed")); return; }
      setAppointments(prev => prev.map(a => a.id === editStatusAppt.id ? { ...a, status: editStatus } : a));
      setStatusMsg("ok:"); setTimeout(() => { setEditStatusAppt(null); setStatusMsg(""); }, 800);
    } catch (e) { setStatusMsg("err:" + e.message); }
  };

  const hc = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    const { doctor_id, service_id, clinic_address_id, date } = form;
    if (!doctor_id || !service_id || !clinic_address_id || !date) { setSlots([]); return; }
    setLoadingSlots(true);
    authFetch(`${API_BASE}/api/schedule/available-slots?doctor_id=${doctor_id}&service_id=${service_id}&clinic_address_id=${clinic_address_id}&date=${date}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setSlots(Array.isArray(d) ? d : []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.doctor_id, form.service_id, form.clinic_address_id, form.date]);

  const submit = async () => {
    if (!form.name || !form.email || !form.doctor_id || !form.service_id || !form.clinic_address_id || !form.start_time) {
      setMsg("err:" + tx.allFieldsRequired); return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, doctor_id: form.doctor_id, service_id: form.service_id, clinic_address_id: form.clinic_address_id, start_time: form.start_time };
      const r = await authFetch(`${API_BASE}/api/appointment`, { method: "POST", body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("err:" + (d.message || d.error || "Failed")); return; }
      setAppointments(prev => [...prev, { ...payload, id: d.appointment_id || d.id || String(Date.now()), status: "pending" }]);
      setMsg("ok:" + tx.appointmentBooked);
      setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); setSlots([]); }, 1200);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const statusColor = (st) => st === "completed" ? "#22c55e" : st === "cancelled" ? "#ef4444" : "#F59E0B";

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageAppointments}</span>
        <button style={s.addBtn} onClick={() => { setOpen(true); setMsg(""); }}>{tx.addAppointment}</button>
      </div>

      {appointments.length === 0 ? <Empty text={tx.noAppointments} /> : (
        <TableOrCards
          cols={[
            { key: "name",    label: tx.patientName,      render: a => <b>{a.name || a.email || "—"}</b> },
            { key: "doctor",  label: tx.colDoctor,        render: a => doctors.find(d => d.id === a.doctor_id)?.name || "—" },
            { key: "service", label: tx.colService,       render: a => services.find(sv => sv.id === a.service_id)?.name || "—" },
            { key: "time",    label: tx.colTime,          render: a => a.start_time ? a.start_time.slice(0,16).replace("T"," ") : "—" },
            { key: "status",  label: tx.colStatus||"Status", render: a => <span style={s.badge(statusColor(a.status))}>{a.status || "—"}</span> },
          ]}
          items={appointments}
          keyFn={a => a.id}
          actions={a => (
            <button style={s.editBtn} onClick={() => { setEditStatusAppt(a); setEditStatus(a.status || ""); setStatusMsg(""); }}>{tx.editApptStatus || "Edit Status"}</button>
          )}
          th={s.th} td={s.td}
        />
      )}

      {editStatusAppt && (
        <Modal title={tx.editApptStatus || "Edit Status"} onClose={() => { setEditStatusAppt(null); setStatusMsg(""); }}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            {doctors.find(d => d.id === editStatusAppt.doctor_id)?.name || "—"}<br/>
            {editStatusAppt.start_time?.slice(0,16).replace("T"," ")}
          </p>
          <FG label={tx.colStatus || "Status"}>
            <Sel name="status" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
              <option value="">{tx.selectStatus || "— Select —"}</option>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Sel>
          </FG>
          <button style={s.submitBtn} onClick={updateStatus}>{tx.invSaveChanges}</button>
          {statusMsg && <p style={statusMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{statusMsg.startsWith("ok:") ? (tx.statusUpdated || "Updated!") : msgTxt(statusMsg)}</p>}
        </Modal>
      )}

      {open && (
        <Modal title={tx.modalAddAppointment} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); setSlots([]); }}>
          <FG label={tx.patientName}><Inp name="name" value={form.name} onChange={hc} placeholder={tx.fullNamePh} /></FG>
          <FG label={tx.colEmail}><Inp name="email" type="email" value={form.email} onChange={hc} placeholder={tx.patientEmailPh} /></FG>
          <FG label={tx.colDoctor}>
            <Sel name="doctor_id" value={form.doctor_id} onChange={hc}>
              <option value="">—</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Sel>
          </FG>
          <FG label={tx.colService}>
            <Sel name="service_id" value={form.service_id} onChange={hc}>
              <option value="">—</option>
              {services.map(sv => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
            </Sel>
          </FG>
          <FG label={tx.clinicAddressLabel}>
            <Sel name="clinic_address_id" value={form.clinic_address_id} onChange={hc}>
              <option value="">—</option>
              {addresses.map(a => <option key={a.id} value={a.id}>{[a.street, a.building, a.city].filter(Boolean).join(", ")}</option>)}
            </Sel>
          </FG>
          <FG label={tx.selectDate}><Inp name="date" type="date" value={form.date} onChange={hc} /></FG>
          <FG label={tx.timeSlotLabel}>
            {loadingSlots
              ? <p style={{ fontSize: 13, color: C.muted }}>{tx.loadingSlots}</p>
              : (!form.doctor_id || !form.service_id || !form.clinic_address_id || !form.date)
              ? <p style={{ fontSize: 13, color: C.muted }}>{tx.fillFieldsForSlots}</p>
              : slots.length === 0
              ? <p style={{ fontSize: 13, color: "#ef4444" }}>{tx.noSlotsForDate}</p>
              : (
                <Sel name="start_time" value={form.start_time} onChange={hc}>
                  <option value="">{tx.chooseTime}</option>
                  {slots.map(sl => {
                    const t = sl.start_time || sl.StartTime || sl;
                    return <option key={t} value={t}>{typeof t === "string" ? t.slice(11, 16) : t}</option>;
                  })}
                </Sel>
              )
            }
          </FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
            {saving ? tx.booking : tx.modalAddAppointment}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}
    </>
  );
}

// ── Doctors ────────────────────────────────────────────────────────────────────

function DoctorsView({ doctors, setDoctors, clinicId, services, tx }) {
  const EMPTY = { name: "", email: "", specialization: "", experience: "", password: "", is_active: true, service_ids: [] };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [editDoc, setEditDoc] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState("");

  const hc = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const toggleSv = (id) => setForm(f => ({ ...f, service_ids: f.service_ids.includes(id) ? f.service_ids.filter(x => x !== id) : [...f.service_ids, id] }));

  const submit = async () => {
    if (!form.name || !form.email) { setMsg("err:" + tx.nameEmailRequired); return; }
    if (!form.password) { setMsg("err:" + tx.passwordRequired); return; }
    if (doctors.some(d => d.email.toLowerCase() === form.email.toLowerCase())) { setMsg("err:" + tx.doctorEmailExists); return; }
    setSaving(true);
    try {
      const r = await authFetch(`${API_BASE}/api/doctors`, {
        method: "POST",
        body: JSON.stringify({ ...form, clinic_id: clinicId, experience: parseInt(form.experience) || 0 }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("err:" + (d.message || "Failed")); return; }
      setDoctors(prev => [...prev, { ...form, clinic_id: clinicId, id: d.data?.id || d.data?.Id || d.doctor_id || d.id || String(Date.now()) }]);
      if (d.confirmation_code) { setConfirmCode(d.confirmation_code); }
      else { setSaved(true); setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); setSaved(false); }, 2000); }
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const updateDoctor = async () => {
    if (!editDoc) return;
    try {
      const payload = { name: editForm.name, email: editForm.email, specialization: editForm.specialization, experience: parseInt(editForm.experience) || 0, new_password: editForm.new_password || "", is_active: !!editForm.is_active };
      const r = await authFetch(`${API_BASE}/api/doctors/${editDoc.id}`, { method: "PUT", body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setEditMsg("err:" + (d.message || "Failed")); return; }
      setDoctors(prev => prev.map(doc => doc.id === editDoc.id ? { ...doc, ...payload } : doc));
      setEditMsg("ok:Updated!"); setTimeout(() => { setEditDoc(null); setEditMsg(""); }, 1000);
    } catch (e) { setEditMsg("err:" + e.message); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      const r = await authFetch(`${API_BASE}/api/doctors/${id}`, { method: "DELETE" });
      if (!r.ok) { const d = await r.json().catch(() => ({})); alert(d.message || d.error || "Delete failed"); return; }
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (e) { alert(e.message); }
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageDoctors}</span>
        <button style={s.addBtn} onClick={() => { setOpen(true); setMsg(""); setConfirmCode(""); setSaved(false); }}>{tx.addDoctor}</button>
      </div>

      {doctors.length === 0 ? <Empty text={tx.noDoctors} /> : (
        <TableOrCards
          cols={[
            { key: "name",   label: tx.colName,   render: d => <b>{d.name}</b> },
            { key: "email",  label: tx.colEmail,  render: d => d.email },
            { key: "spec",   label: tx.colSpec,   render: d => d.specialization || "—" },
            { key: "exp",    label: tx.colExp,    render: d => d.experience ? `${d.experience} ${tx.yearsAbbr}` : "—" },
            { key: "status", label: tx.colStatus, render: d => <span style={s.badge(d.is_active !== false ? "#22c55e" : "#94A3B8")}>{d.is_active !== false ? tx.active : tx.inactive}</span> },
          ]}
          items={doctors}
          keyFn={d => d.id}
          actions={d => (
            <>
              <button style={s.editBtn} onClick={() => { setEditDoc(d); setEditForm({ ...d, new_password: "" }); setEditMsg(""); }}>{tx.invEdit}</button>
              <button style={s.deleteBtn} onClick={() => del(d.id)}>{tx.delete}</button>
            </>
          )}
          th={s.th} td={s.td}
        />
      )}

      {editDoc && (
        <Modal title={tx.editDoctor} onClose={() => { setEditDoc(null); setEditMsg(""); }}>
          <FG label={tx.fullName}><Inp value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></FG>
          <FG label={tx.emailAddr}><Inp type="email" value={editForm.email || ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></FG>
          <FG label={tx.colSpec}><Inp value={editForm.specialization || ""} onChange={e => setEditForm(f => ({ ...f, specialization: e.target.value }))} placeholder={tx.specPh} /></FG>
          <FG label={tx.yearsExp}><Inp type="number" value={editForm.experience || ""} onChange={e => setEditForm(f => ({ ...f, experience: e.target.value }))} placeholder={tx.expPh} /></FG>
          <FG label={tx.newPasswordLabel}><Inp type="password" value={editForm.new_password || ""} onChange={e => setEditForm(f => ({ ...f, new_password: e.target.value }))} placeholder={tx.keepCurrentPassword} /></FG>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.text, marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={!!editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} />
            {tx.accountActive}
          </label>
          <button style={s.submitBtn} onClick={updateDoctor}>{tx.invSaveChanges}</button>
          {editMsg && <p style={editMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(editMsg)}</p>}
        </Modal>
      )}

      {open && (
        <Modal title={tx.modalAddDoctor} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); setConfirmCode(""); setSaved(false); }}>
          {confirmCode ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>{tx.addedOk}</p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{tx.confirmationCodeSentEmail}</p>
              <div style={{ background: "#F0FDF4", border: "2px solid #22c55e", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{tx.confirmationCodeLabel}</p>
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 8, color: "#166534", fontFamily: "monospace" }}>{confirmCode}</div>
              </div>
              <button style={{ ...s.submitBtn, background: "#22c55e" }} onClick={() => navigator.clipboard?.writeText(confirmCode)}>{tx.copyCode}</button>
              <button style={{ ...s.submitBtn, background: C.muted, marginTop: 10 }} onClick={() => { setOpen(false); setForm(EMPTY); setMsg(""); setConfirmCode(""); setSaved(false); }}>{tx.close}</button>
            </div>
          ) : saved ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", marginBottom: 8 }}>{tx.addedOk}</p>
            </div>
          ) : (
            <>
              <FG label={tx.fullName}><Inp name="name" value={form.name} onChange={hc} placeholder={tx.doctorNamePh} /></FG>
              <FG label={tx.emailAddr}><Inp name="email" type="email" value={form.email} onChange={hc} placeholder={tx.doctorEmailPh} /></FG>
              <FG label={tx.passwordLabel}><Inp name="password" type="password" value={form.password} onChange={hc} placeholder={tx.passwordPlaceholder} /></FG>
              <FG label={tx.colSpec}><Inp name="specialization" value={form.specialization} onChange={hc} placeholder={tx.specPh} /></FG>
              <FG label={tx.yearsExp}><Inp name="experience" type="number" value={form.experience} onChange={hc} placeholder={tx.expPh} /></FG>
              <FG label={tx.services}>
                <div style={s.checkList}>
                  {services.length === 0
                    ? <p style={{ color: C.muted, fontSize: 13 }}>{tx.noServicesForClinic}</p>
                    : services.map(sv => (
                      <label key={sv.id} style={s.checkItem}>
                        <input type="checkbox" checked={form.service_ids.includes(sv.id)} onChange={() => toggleSv(sv.id)} />
                        {sv.name}
                      </label>
                    ))
                  }
                </div>
              </FG>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.text, marginBottom: 16, cursor: "pointer" }}>
                <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                {tx.accountActive}
              </label>
              <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
                {saving ? (tx.invSaving || "...") : tx.modalAddDoctor}
              </button>
              {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
            </>
          )}
        </Modal>
      )}
    </>
  );
}

// ── Services ───────────────────────────────────────────────────────────────────

function ServicesView({ services, setServices, clinicId, tx }) {
  const [editSvc, setEditSvc] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState("");

  const [attachOpen, setAttachOpen] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [attachForm, setAttachForm] = useState({ service_id: "", price: "", duration: "", is_active: true });
  const [attachMsg, setAttachMsg] = useState("");
  const [attachSaving, setAttachSaving] = useState(false);

  const openAttach = async () => {
    setAttachOpen(true);
    setAttachMsg("");
    setAttachForm({ service_id: "", price: "", duration: "", is_active: true });
    try {
      const r = await authFetch(`${API_BASE}/api/services`);
      const d = await r.json().catch(() => []);
      const list = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
      const attachedIds = new Set(services.map(s => s.id));
      setAllServices(list.filter(s => !attachedIds.has(s.id)));
    } catch (_) { setAllServices([]); }
  };

  const attachSubmit = async () => {
    if (!attachForm.service_id || !attachForm.price) { setAttachMsg("err:" + tx.namePriceRequired); return; }
    const dur = parseInt(attachForm.duration, 10) || 0;
    if (dur > 0 && dur % 30 !== 0) { setAttachMsg("err:" + tx.durationMultiple); return; }
    setAttachSaving(true);
    try {
      const r = await authFetch(`${API_BASE}/api/add-clinics/${clinicId}/services`, {
        method: "POST",
        body: JSON.stringify({ service_id: attachForm.service_id, price: parseFloat(attachForm.price) || 0, duration: dur, is_active: attachForm.is_active }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setAttachMsg("err:" + (d.message || d.error || "Failed")); return; }
      const svc = allServices.find(s => s.id === attachForm.service_id);
      const newId = d.service_id || d.id || attachForm.service_id;
      setServices(prev => [...prev, { id: newId, name: svc?.name || "", description: svc?.description || "", price: parseFloat(attachForm.price) || 0, duration: dur, is_active: attachForm.is_active }]);
      setAttachMsg("ok:" + tx.addedOk);
      setTimeout(() => { setAttachOpen(false); setAttachForm({ service_id: "", price: "", duration: "", is_active: true }); setAttachMsg(""); }, 1200);
    } catch (e) { setAttachMsg("err:" + e.message); }
    finally { setAttachSaving(false); }
  };

  const updateService = async () => {
    if (!editSvc) return;
    try {
      const payload = { price: parseFloat(editForm.price) || 0, duration: parseInt(editForm.duration, 10) || 0, is_active: editForm.is_active };
      const r = await authFetch(`${API_BASE}/api/clinics/${clinicId}/services/${editSvc.id}`, { method: "PUT", body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setEditMsg("err:" + (d.message || "Failed")); return; }
      setServices(prev => prev.map(sv => sv.id === editSvc.id ? { ...sv, ...payload } : sv));
      setEditMsg("ok:Updated!"); setTimeout(() => { setEditSvc(null); setEditMsg(""); }, 1000);
    } catch (e) { setEditMsg("err:" + e.message); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      await authFetch(`${API_BASE}/api/clinics/${clinicId}/services/${id}`, { method: "DELETE" });
      setServices(prev => prev.filter(sv => sv.id !== id));
    } catch (e) { alert(e.message); }
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageServices}</span>
        <button style={s.addBtn} onClick={openAttach}>{tx.attachService || "Прикрепить услугу"}</button>
      </div>

      {services.length === 0 ? <Empty text={tx.noServices} /> : (
        <TableOrCards
          cols={[
            { key: "name",     label: tx.colName,     render: sv => <b>{sv.name}</b> },
            { key: "desc",     label: tx.colDesc,     render: sv => sv.description?.length > 40 ? sv.description.slice(0,40)+"…" : sv.description || "—" },
            { key: "price",    label: tx.colPrice,    render: sv => <span style={s.badge()}>{Number(sv.price || 0).toLocaleString()} ₸</span> },
            { key: "duration", label: tx.colDuration, render: sv => sv.duration ? `${sv.duration} ${tx.minLabel}` : "—" },
            { key: "status",   label: tx.colStatus,   render: sv => <span style={s.badge(sv.is_active !== false ? "#22c55e" : "#94A3B8")}>{sv.is_active !== false ? tx.active : tx.inactive}</span> },
          ]}
          items={services}
          keyFn={sv => sv.id}
          actions={sv => (
            <>
              <button style={s.editBtn} onClick={() => { setEditSvc(sv); setEditForm({ price: String(sv.price), duration: String(sv.duration), is_active: sv.is_active }); setEditMsg(""); }}>{tx.invEdit}</button>
              <button style={s.deleteBtn} onClick={() => del(sv.id)}>{tx.delete}</button>
            </>
          )}
          th={s.th} td={s.td}
        />
      )}

      {editSvc && (
        <Modal title={tx.editService} onClose={() => { setEditSvc(null); setEditMsg(""); }}>
          <div style={{ marginBottom: 12, padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, fontSize: 14, color: "#374151" }}>
            <b>{editSvc.name}</b>{editSvc.description ? ` — ${editSvc.description}` : ""}
          </div>
          <FG label={tx.price}><Inp type="number" value={editForm.price || ""} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} /></FG>
          <FG label={tx.duration}>
            <Sel value={editForm.duration || ""} onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))}>
              <option value="">—</option>
              {[30,60,90,120,150,180].map(d => <option key={d} value={d}>{d} {tx.minLabel}</option>)}
            </Sel>
          </FG>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>
            <input type="checkbox" checked={!!editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} />{tx.markActive}
          </label>
          <button style={s.submitBtn} onClick={updateService}>{tx.invSaveChanges}</button>
          {editMsg && <p style={editMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(editMsg)}</p>}
        </Modal>
      )}

      {attachOpen && (
        <Modal title={tx.attachService || "Прикрепить услугу"} onClose={() => { setAttachOpen(false); setAttachMsg(""); }}>
          <FG label={tx.serviceName || "Услуга"}>
            {allServices.length === 0 ? (
              <div style={{ padding: "10px 14px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 8, fontSize: 13, color: "#92400E" }}>
                ⚠ Нет доступных услуг для прикрепления
              </div>
            ) : (
              <Sel value={attachForm.service_id} onChange={e => setAttachForm(f => ({ ...f, service_id: e.target.value }))}>
                <option value="">Выберите услугу…</option>
                {allServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Sel>
            )}
          </FG>
          <FG label={tx.price}><Inp type="number" value={attachForm.price} onChange={e => setAttachForm(f => ({ ...f, price: e.target.value }))} placeholder={tx.pricePh} /></FG>
          <FG label={tx.duration}>
            <Sel value={attachForm.duration} onChange={e => setAttachForm(f => ({ ...f, duration: e.target.value }))}>
              <option value="">{tx.selectDurationPh}</option>
              {[30,60,90,120,150,180].map(d => <option key={d} value={d}>{d} {tx.minLabel}</option>)}
            </Sel>
          </FG>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>
            <input type="checkbox" checked={!!attachForm.is_active} onChange={e => setAttachForm(f => ({ ...f, is_active: e.target.checked }))} />{tx.markActive}
          </label>
          <button style={{ ...s.submitBtn, opacity: attachSaving ? 0.7 : 1 }} onClick={attachSubmit} disabled={attachSaving}>
            {attachSaving ? tx.adding : (tx.attachService || "Прикрепить")}
          </button>
          {attachMsg && <p style={attachMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(attachMsg)}</p>}
        </Modal>
      )}
    </>
  );
}

// ── Schedule ───────────────────────────────────────────────────────────────────

function ScheduleView({ doctors, addresses, tx }) {
  const DAY_NAMES = tx.dayNames || ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const [schedules, setSchedules] = useState([]);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editSc, setEditSc] = useState(null);
  const [editForm, setEditForm] = useState({ start_time: "09:00", end_time: "18:00" });
  const EMPTY_WH = { clinic_address_id: "", day_of_week: "1", start_time: "09:00", end_time: "18:00" };
  const [whForm, setWhForm] = useState(EMPTY_WH);
  const [genForm, setGenForm] = useState({ from_date: "", to_date: "" });

  const loadSchedule = async (docId) => {
    if (!docId) { setSchedules([]); return; }
    setLoadingDoc(true);
    try {
      const r = await authFetch(`${API_BASE}/api/schedule/doctors/${docId}/working-hours`);
      if (r.ok) { const d = await r.json(); setSchedules(Array.isArray(d) ? d : []); }
      else setSchedules([]);
    } catch (_) { setSchedules([]); }
    finally { setLoadingDoc(false); }
  };

  const submitWorkingHours = async () => {
    if (!selectedDoc || !whForm.clinic_address_id || !whForm.start_time || !whForm.end_time) { setMsg("err:" + tx.allFieldsRequired); return; }
    setSaving(true);
    try {
      const payload = { clinic_address_id: whForm.clinic_address_id, day_of_week: parseInt(whForm.day_of_week), start_time: whForm.start_time, end_time: whForm.end_time };
      const r = await authFetch(`${API_BASE}/api/schedule/doctors/${selectedDoc}/working-hours`, { method: "POST", body: JSON.stringify(payload) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:" + tx.addedOk); setShowHoursModal(false); setWhForm(EMPTY_WH); loadSchedule(selectedDoc);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const submitGenerate = async () => {
    if (!genForm.from_date || !genForm.to_date) { setMsg("err:" + tx.repNoDate); return; }
    setSaving(true);
    try {
      const r = await authFetch(`${API_BASE}/api/schedule/generate`, { method: "POST", body: JSON.stringify({ from_date: genForm.from_date, to_date: genForm.to_date }) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:" + tx.invUpdated); setShowGenModal(false); setGenForm({ from_date: "", to_date: "" });
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const submitEdit = async () => {
    if (!editForm.start_time || !editForm.end_time) { setMsg("err:" + tx.allFieldsRequired); return; }
    setSaving(true);
    try {
      const id = editSc.Id || editSc.id;
      const r = await authFetch(`${API_BASE}/api/schedule/working-hours/${id}`, { method: "PUT", body: JSON.stringify({ start_time: editForm.start_time, end_time: editForm.end_time }) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:" + tx.invUpdated); setEditSc(null); loadSchedule(selectedDoc);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (sc) => {
    if (!window.confirm(tx.deleteWorkHoursConfirm)) return;
    try {
      const id = sc.Id || sc.id;
      const r = await authFetch(`${API_BASE}/api/schedule/working-hours/${id}`, { method: "DELETE" });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:Deleted!"); loadSchedule(selectedDoc);
    } catch (e) { setMsg("err:" + e.message); }
  };

  const getAddrLabel = (id) => {
    const a = addresses.find(x => x.id === id);
    if (!a) return id?.slice(0, 8) || "—";
    return [a.street, a.building, a.city].filter(Boolean).join(", ") || id?.slice(0, 8);
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <span style={s.sectionTitle}>{tx.scheduleTitle}</span>
        <button style={{ ...s.addBtn, background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` }} onClick={() => { setShowGenModal(true); setMsg(""); }}>
          {tx.generateSlots}
        </button>
      </div>

      {msg && <p style={{ ...(msg.startsWith("ok:") ? s.msgOk : s.msgErr), textAlign: "left", marginBottom: 16 }}>{msgTxt(msg)}</p>}

      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 28px", marginBottom: 20 }}>
        <FG label={tx.selectDoctorLabel}>
          <Sel value={selectedDoc} onChange={e => { setSelectedDoc(e.target.value); loadSchedule(e.target.value); setMsg(""); }}>
            <option value="">{tx.chooseDoctor}</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Sel>
        </FG>
        {selectedDoc && schedules.length < 7 && (
          <button style={{ ...s.addBtn, marginTop: 4 }} onClick={() => {
            const used = new Set(schedules.map(sc => String(sc.Day_of_week ?? sc.day_of_week)));
            const free = ["1","2","3","4","5","6","0"].find(d => !used.has(d)) || "1";
            setWhForm({ ...EMPTY_WH, day_of_week: free }); setShowHoursModal(true); setMsg("");
          }}>+ {tx.addWorkingHours}</button>
        )}
      </div>

      {selectedDoc && (
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {loadingDoc
            ? <p style={{ padding: 24, color: C.muted }}>{tx.invLoading}</p>
            : schedules.length === 0
            ? <p style={{ padding: 24, color: C.muted }}>{tx.noWorkingHours}</p>
            : (
              <TableOrCards
                cols={[
                  { key: "day",   label: tx.colDay,     render: sc => DAY_NAMES[sc.Day_of_week ?? sc.day_of_week] },
                  { key: "addr",  label: tx.colAddress, render: sc => getAddrLabel(sc.Clinic_address_id || sc.clinic_address_id) },
                  { key: "start", label: tx.colStart,   render: sc => (sc.Start_time || sc.start_time || "").slice(0,5) },
                  { key: "end",   label: tx.colEnd,     render: sc => (sc.End_time   || sc.end_time   || "").slice(0,5) },
                ]}
                items={schedules}
                keyFn={(sc, i) => sc.Id || sc.id || i}
                actions={sc => (
                  <>
                    <button style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, background: C.primaryLight, color: C.primary, border: `1px solid ${C.primary}`, borderRadius: 7, cursor: "pointer" }} onClick={() => { setEditSc(sc); setEditForm({ start_time: (sc.Start_time || sc.start_time || "09:00").slice(0,5), end_time: (sc.End_time || sc.end_time || "18:00").slice(0,5) }); setMsg(""); }}>{tx.invEdit}</button>
                    <button style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 7, cursor: "pointer" }} onClick={() => handleDelete(sc)}>{tx.delete}</button>
                  </>
                )}
                th={s.th} td={s.td}
              />
            )
          }
        </div>
      )}

      {showHoursModal && (
        <Modal title={tx.addWorkingHours} onClose={() => setShowHoursModal(false)}>
          <FG label={tx.clinicAddressLabel}>
            <Sel value={whForm.clinic_address_id} onChange={e => setWhForm(f => ({ ...f, clinic_address_id: e.target.value }))}>
              <option value="">{tx.selectAddress}</option>
              {addresses.map(a => <option key={a.id} value={a.id}>{getAddrLabel(a.id)}</option>)}
            </Sel>
          </FG>
          <FG label={tx.dayOfWeekLabel}>
            <Sel value={whForm.day_of_week} onChange={e => setWhForm(f => ({ ...f, day_of_week: e.target.value }))}>
              {[["1",1],["2",2],["3",3],["4",4],["5",5],["6",6],["0",0]]
                .filter(([v]) => !schedules.some(sc => String(sc.Day_of_week ?? sc.day_of_week) === v))
                .map(([v, idx]) => <option key={v} value={v}>{DAY_NAMES[idx]}</option>)}
            </Sel>
          </FG>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.startTimeLabel}><Inp name="start_time" type="time" value={whForm.start_time} onChange={e => setWhForm(f => ({ ...f, start_time: e.target.value }))} /></FG>
            <FG label={tx.endTimeLabel}><Inp name="end_time" type="time" value={whForm.end_time} onChange={e => setWhForm(f => ({ ...f, end_time: e.target.value }))} /></FG>
          </div>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submitWorkingHours} disabled={saving}>{saving ? tx.invSaving : tx.saveWorkingHours}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}

      {editSc && (
        <Modal title={tx.editWorkingHours} onClose={() => setEditSc(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.startTimeLabel}><Inp type="time" value={editForm.start_time} onChange={e => setEditForm(f => ({ ...f, start_time: e.target.value }))} /></FG>
            <FG label={tx.endTimeLabel}><Inp type="time" value={editForm.end_time} onChange={e => setEditForm(f => ({ ...f, end_time: e.target.value }))} /></FG>
          </div>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submitEdit} disabled={saving}>{saving ? tx.invSaving : tx.invSaveChanges}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}

      {showGenModal && (
        <Modal title={tx.generateSlotsTitle} onClose={() => setShowGenModal(false)}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{tx.generateSlotsDesc}</p>
          <FG label={tx.fromDate}><Inp type="date" value={genForm.from_date} onChange={e => setGenForm(f => ({ ...f, from_date: e.target.value }))} /></FG>
          <FG label={tx.toDate}><Inp type="date" value={genForm.to_date} onChange={e => setGenForm(f => ({ ...f, to_date: e.target.value }))} /></FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submitGenerate} disabled={saving}>{saving ? tx.generating : tx.generateSlots}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}
    </div>
  );
}

// ── Addresses ──────────────────────────────────────────────────────────────────

function AddressesView({ clinicId, addresses, setAddresses, tx }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ country: "", city: "", street: "", building: "" });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const hc = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.country || !form.city || !form.street) { setMsg("err:" + tx.addrRequiredFields); return; }
    setSaving(true);
    try {
      const payload = { country: form.country, city: form.city, street: form.street, building: form.building || "", latitude: 0, longitude: 0 };
      const r1 = await authFetch(`${API_BASE}/api/address`, { method: "POST", body: JSON.stringify(payload) });
      const d1 = await r1.json().catch(() => ({}));
      if (!r1.ok) { setMsg("err:" + (d1.message || d1.error || "Failed")); return; }
      const addrId = d1.Address_id || d1.address_id || d1.data?.id || d1.id;
      if (!addrId) { setMsg("err:No address_id returned"); return; }
      await authFetch(`${API_BASE}/api/clinics/${clinicId}/address`, { method: "POST", body: JSON.stringify({ address_id: addrId, is_main: false }) });
      setAddresses(prev => [...prev, { ...payload, id: addrId, clinic_id: clinicId }]);
      setMsg("ok:" + tx.addedOk);
      setTimeout(() => { setOpen(false); setForm({ country: "", city: "", street: "", building: "" }); setMsg(""); }, 1200);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      await authFetch(`${API_BASE}/api/clinics/${clinicId}/address/${id}`, { method: "DELETE" });
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (_) {}
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageAddresses}</span>
        <button style={s.addBtn} onClick={() => setOpen(true)}>{tx.addAddress}</button>
      </div>
      {addresses.length === 0 ? <Empty text={tx.noAddresses} /> : (
        <TableOrCards
          cols={[
            { key: "country",  label: tx.country,  render: a => a.country  || "—" },
            { key: "city",     label: tx.city,     render: a => a.city     || "—" },
            { key: "street",   label: tx.street,   render: a => a.street   || "—" },
            { key: "building", label: tx.building, render: a => a.building || "—" },
          ]}
          items={addresses}
          keyFn={a => a.id}
          actions={a => <button style={s.deleteBtn} onClick={() => del(a.id)}>{tx.delete}</button>}
          th={s.th} td={s.td}
        />
      )}
      {open && (
        <Modal title={tx.modalAddAddress} onClose={() => { setOpen(false); setForm({ country: "", city: "", street: "", building: "" }); setMsg(""); }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.country}><Inp name="country" value={form.country} onChange={hc} placeholder={tx.countryPh} /></FG>
            <FG label={tx.city}><Inp name="city" value={form.city} onChange={hc} placeholder={tx.cityPh} /></FG>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.street}><Inp name="street" value={form.street} onChange={hc} placeholder={tx.streetPh} /></FG>
            <FG label={tx.building}><Inp name="building" value={form.building} onChange={hc} placeholder={tx.buildingPh} /></FG>
          </div>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>{saving ? tx.invSaving : tx.modalAddAddress}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}
    </>
  );
}

// ── Clinic info ────────────────────────────────────────────────────────────────

function ClinicView({ clinicData, setClinicData, tx }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  if (!clinicData) return <Empty text={tx.noClinics} />;

  const openEdit = () => { setForm({ name: clinicData.name || "", description: clinicData.description || "", phone: clinicData.phone || "", email: clinicData.email || "", website: clinicData.website || "" }); setMsg(""); setOpen(true); };

  const save = async () => {
    if (!form.name || !form.phone || !form.email) { setMsg("err:" + tx.nameRequired); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, description: form.description, phone: form.phone, email: form.email, website: form.website, is_active: clinicData.is_active };
      const r = await authFetch(`${API_BASE}/api/clinics/${clinicData.id}`, { method: "PUT", body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("err:" + (d.message || "Failed")); return; }
      setClinicData(prev => ({ ...prev, ...payload }));
      setMsg("ok:" + tx.addedOk); setTimeout(() => { setOpen(false); setMsg(""); }, 1000);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const hc = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const fields = [
    [tx.colName, clinicData.name], [tx.description, clinicData.description],
    [tx.phoneNum, clinicData.phone], [tx.emailAddr, clinicData.email],
    [tx.websiteUrl, clinicData.website], [tx.colStatus, clinicData.is_active !== false ? tx.active : tx.inactive],
  ];

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageClinics}</span>
        <button style={s.addBtn} onClick={openEdit}>{tx.invEdit}</button>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
          {fields.filter(([, v]) => v).map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 15, color: C.text, fontWeight: label === tx.colName ? 700 : 400 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      {open && (
        <Modal title={tx.editClinic} onClose={() => { setOpen(false); setMsg(""); }}>
          <FG label={tx.clinicName}><Inp name="name" value={form.name} onChange={hc} placeholder={tx.clinicNamePh} /></FG>
          <FG label={tx.description}><Inp name="description" value={form.description} onChange={hc} placeholder={tx.descPh} /></FG>
          <FG label={tx.phoneNum}><Inp name="phone" value={form.phone} onChange={hc} placeholder={tx.phonePh} /></FG>
          <FG label={tx.emailAddr}><Inp name="email" type="email" value={form.email} onChange={hc} placeholder={tx.emailClinicPh} /></FG>
          <FG label={tx.websiteUrl}><Inp name="website" value={form.website} onChange={hc} placeholder={tx.websitePh} /></FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>{saving ? tx.invSaving : tx.invSaveChanges}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}
    </>
  );
}

// ── Inventory ──────────────────────────────────────────────────────────────────

function ProductsSubTab({ products, setProducts, loading, tx }) {
  const EMPTY = { name: "", unit: "piece" };
  const UNITS = ["piece","ml","mg","box","pack","bottle","tablet","vial"];
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name) { setMsg("err:" + tx.invNameRequired); return; }
    setSaving(true);
    try {
      const r = await authFetch(`${API_BASE}/api/products`, { method: "POST", body: JSON.stringify({ name: form.name, unit: form.unit }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("err:" + (d.message || d.error || "Failed")); return; }
      setProducts(prev => [...prev, { id: d.id || d.Id || d.product_id || String(Date.now()), name: form.name, unit: form.unit }]);
      setMsg("ok:" + tx.invProductAdded); setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); }, 1200);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const updateProd = async () => {
    if (!editProd) return;
    setSaving(true);
    try {
      const r = await authFetch(`${API_BASE}/api/products/${editProd.id}`, { method: "PUT", body: JSON.stringify({ name: editForm.name, unit: editForm.unit }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setEditMsg("err:" + (d.message || "Failed")); return; }
      setProducts(prev => prev.map(p => p.id === editProd.id ? { ...p, ...editForm } : p));
      setEditMsg("ok:" + tx.invUpdated); setTimeout(() => { setEditProd(null); setEditMsg(""); }, 1000);
    } catch (e) { setEditMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try { await authFetch(`${API_BASE}/api/products/${id}`, { method: "DELETE" }); setProducts(prev => prev.filter(p => p.id !== id)); } catch (_) {}
  };

  if (loading) return <p style={{ color: C.muted, padding: "24px 0" }}>{tx.invLoadingProducts}</p>;

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.invProducts}</span>
        <button style={s.addBtn} onClick={() => setOpen(true)}>{tx.invAddProduct}</button>
      </div>
      {products.length === 0 ? <Empty text={tx.invNoProducts} /> : (
        <TableOrCards
          cols={[
            { key: "name", label: tx.colName,  render: p => <b>{p.name}</b> },
            { key: "unit", label: tx.invUnit,  render: p => <span style={s.badge()}>{p.unit || "—"}</span> },
          ]}
          items={products}
          keyFn={p => p.id}
          actions={p => (
            <>
              <button style={s.editBtn} onClick={() => { setEditProd(p); setEditForm({ name: p.name, unit: p.unit || "piece" }); setEditMsg(""); }}>{tx.invEdit}</button>
              <button style={s.deleteBtn} onClick={() => del(p.id)}>{tx.delete}</button>
            </>
          )}
          th={s.th} td={s.td}
        />
      )}
      {editProd && (
        <Modal title={tx.invEditProduct} onClose={() => setEditProd(null)}>
          <FG label={tx.colName}><Inp value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></FG>
          <FG label={tx.invUnit}><Sel value={editForm.unit || "piece"} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</Sel></FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={updateProd} disabled={saving}>{tx.invSaveChanges}</button>
          {editMsg && <p style={editMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(editMsg)}</p>}
        </Modal>
      )}
      {open && (
        <Modal title={tx.invAddProductModal} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <FG label={tx.invProductName}><Inp name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={tx.productNamePh} /></FG>
          <FG label={tx.invUnit}><Sel name="unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</Sel></FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>{saving ? tx.adding : tx.invAddProductModal}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}
    </>
  );
}

function StockSubTab({ addresses, products, tx }) {
  const [selectedAddr, setSelectedAddr] = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editInv, setEditInv] = useState(null);
  const [addForm, setAddForm] = useState({ product_id: "", quantity: "" });
  const [editQty, setEditQty] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const loadInv = async (addrId) => {
    if (!addrId) { setInventory([]); return; }
    setLoading(true);
    try {
      const r = await authFetch(`${API_BASE}/api/clinic-addresses/${addrId}/inventory`);
      if (r.ok) { const d = await r.json(); setInventory(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : [])); } else setInventory([]);
    } catch (_) { setInventory([]); }
    finally { setLoading(false); }
  };

  const addStock = async () => {
    if (!addForm.product_id || !addForm.quantity) { setMsg("err:" + tx.invAllFields); return; }
    setSaving(true);
    try {
      const r = await authFetch(`${API_BASE}/api/clinic-addresses/${selectedAddr}/inventory`, { method: "POST", body: JSON.stringify({ product_id: addForm.product_id, quantity: parseInt(addForm.quantity) }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("err:" + (d.message || d.error || "Failed")); return; }
      setMsg("ok:" + tx.invStockAdded); setOpen(false); setAddForm({ product_id: "", quantity: "" }); loadInv(selectedAddr);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const updateStock = async () => {
    if (!editInv || editQty === "") return;
    setSaving(true);
    try {
      const invId = editInv.id || editInv.Id;
      const r = await authFetch(`${API_BASE}/api/clinic-addresses/${selectedAddr}/inventory/${invId}`, { method: "PUT", body: JSON.stringify({ quantity: parseInt(editQty) }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:" + tx.invUpdated); setEditInv(null); loadInv(selectedAddr);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const getProd = (id) => products.find(p => p.id === id);
  const getAddrLabel = (a) => [a.street, a.building, a.city].filter(Boolean).join(", ") || a.id?.slice(0, 8);

  return (
    <div>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.invStock}</span>
        {selectedAddr && <button style={s.addBtn} onClick={() => { setOpen(true); setMsg(""); }}>{tx.invAddStock}</button>}
      </div>
      {msg && <p style={{ ...(msg.startsWith("ok:") ? s.msgOk : s.msgErr), textAlign: "left", marginBottom: 16 }}>{msgTxt(msg)}</p>}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <FG label={tx.invSelectAddr}>
          <Sel value={selectedAddr} onChange={e => { setSelectedAddr(e.target.value); loadInv(e.target.value); setMsg(""); }}>
            <option value="">{tx.invChooseAddr}</option>
            {addresses.map(a => <option key={a.id} value={a.id}>{getAddrLabel(a)}</option>)}
          </Sel>
        </FG>
      </div>
      {selectedAddr && (loading ? <p style={{ color: C.muted, padding: "16px 0" }}>{tx.invLoading}</p> : inventory.length === 0 ? <Empty text={tx.invNoStock} /> : (
        <TableOrCards
          cols={[
            { key: "product", label: tx.invProduct, render: item => { const prod = getProd(item.product_id || item.ProductId); return <b>{prod?.name || "—"}</b>; } },
            { key: "unit",    label: tx.invUnit,    render: item => { const prod = getProd(item.product_id || item.ProductId); return prod?.unit || "—"; } },
            { key: "qty",     label: tx.invQty,     render: item => <span style={{ ...s.badge(), background: "#EFF6FF", color: "#1D4ED8" }}>{item.quantity ?? item.Quantity ?? "—"}</span> },
          ]}
          items={inventory}
          keyFn={(item, i) => item.id || item.Id || i}
          actions={item => (
            <button style={s.editBtn} onClick={() => { setEditInv(item); setEditQty(String(item.quantity ?? item.Quantity ?? "")); setMsg(""); }}>{tx.invEdit}</button>
          )}
          th={s.th} td={s.td}
        />
      ))}
      {editInv && (
        <Modal title={tx.invUpdateStock} onClose={() => setEditInv(null)}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{getProd(editInv.product_id || editInv.ProductId)?.name || tx.invProduct}</p>
          <FG label={tx.invNewQty}><Inp type="number" value={editQty} onChange={e => setEditQty(e.target.value)} placeholder={tx.quantityPh} /></FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={updateStock} disabled={saving}>{saving ? tx.invSaving : tx.invSaveQty}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}
      {open && (
        <Modal title={tx.invAddStockModal} onClose={() => { setOpen(false); setAddForm({ product_id: "", quantity: "" }); setMsg(""); }}>
          <FG label={tx.invProduct}>
            <Sel value={addForm.product_id} onChange={e => setAddForm(f => ({ ...f, product_id: e.target.value }))}>
              <option value="">— {tx.invProduct} —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
            </Sel>
          </FG>
          <FG label={tx.invQtyToAdd}><Inp type="number" value={addForm.quantity} onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))} placeholder={tx.quantityAddPh} /></FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={addStock} disabled={saving}>{saving ? tx.adding : tx.invAddStockModal}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}
    </div>
  );
}

function MaterialsSubTab({ services, products, tx }) {
  const [selectedSvc, setSelectedSvc] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loadingMats, setLoadingMats] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product_id: "", quantity_required: "" });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const loadMats = async (svcId) => {
    if (!svcId) { setMaterials([]); return; }
    setLoadingMats(true);
    try {
      const r = await authFetch(`${API_BASE}/api/clinic-services/${svcId}/materials`);
      const raw = await r.text();
      const d = (() => { try { return JSON.parse(raw); } catch (_) { return null; } })();
      if (r.ok && d !== null) setMaterials(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.materials) ? d.materials : []);
      else setMaterials([]);
    } catch (_) { setMaterials([]); }
    finally { setLoadingMats(false); }
  };

  const addMaterial = async () => {
    if (!form.product_id || !form.quantity_required) { setMsg("err:" + tx.invAllFields); return; }
    setSaving(true);
    try {
      const r = await authFetch(`${API_BASE}/api/clinic-services/${selectedSvc}/materials`, { method: "POST", body: JSON.stringify({ product_id: form.product_id, quantity_required: parseInt(form.quantity_required) }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("err:" + (d.message || d.error || "Failed")); return; }
      setMsg("ok:" + tx.invMaterialAssigned); setOpen(false); setForm({ product_id: "", quantity_required: "" }); loadMats(selectedSvc);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const delMat = async (matId) => {
    if (!window.confirm(tx.invRemoveConfirm)) return;
    try { await authFetch(`${API_BASE}/api/clinic-services/${selectedSvc}/materials/${matId}`, { method: "DELETE" }); setMaterials(prev => prev.filter(m => (m.id || m.Id) !== matId)); } catch (_) {}
  };

  const getProd = (id) => products.find(p => p.id === id);

  return (
    <div>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.invMaterials}</span>
        {selectedSvc && <button style={s.addBtn} onClick={() => { setOpen(true); setMsg(""); }}>{tx.invAssignMaterial}</button>}
      </div>
      {msg && <p style={{ ...(msg.startsWith("ok:") ? s.msgOk : s.msgErr), textAlign: "left", marginBottom: 16 }}>{msgTxt(msg)}</p>}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <FG label={tx.invService}>
          <Sel value={selectedSvc} onChange={e => { setSelectedSvc(e.target.value); loadMats(e.target.value); setMsg(""); }}>
            <option value="">{tx.invChooseService}</option>
            {services.map(sv => <option key={sv.id} value={sv.id}>{sv.name || `Service ${sv.id}`}</option>)}
          </Sel>
        </FG>
      </div>
      {selectedSvc && (loadingMats ? <p style={{ color: C.muted, padding: "16px 0" }}>{tx.invLoading}</p> : materials.length === 0 ? <Empty text={tx.invNoMaterials} /> : (
        <TableOrCards
          cols={[
            { key: "product", label: tx.invProduct, render: m => { const prod = getProd(m.product_id || m.ProductId); return <b>{prod?.name || "—"}</b>; } },
            { key: "qty",     label: tx.invPerAppt, render: m => { const prod = getProd(m.product_id || m.ProductId); return <span style={{ ...s.badge(), background: "#F0FDF4", color: "#16A34A" }}>{m.quantity_required ?? m.QuantityRequired ?? "—"} {prod?.unit || ""}</span>; } },
          ]}
          items={materials}
          keyFn={(m, i) => m.id || m.Id || i}
          actions={m => <button style={s.deleteBtn} onClick={() => delMat(m.id || m.Id)}>{tx.invRemove}</button>}
          th={s.th} td={s.td}
        />
      ))}
      {open && (
        <Modal title={tx.invAssignMaterialModal} onClose={() => { setOpen(false); setForm({ product_id: "", quantity_required: "" }); setMsg(""); }}>
          <FG label={tx.invProduct}>
            <Sel value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
              <option value="">— {tx.invProduct} —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
            </Sel>
          </FG>
          <FG label={tx.invQtyPerAppt}><Inp type="number" value={form.quantity_required} onChange={e => setForm(f => ({ ...f, quantity_required: e.target.value }))} placeholder={tx.quantityPerApptPh} /></FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={addMaterial} disabled={saving}>{saving ? tx.invSaving : tx.invAssignBtn}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msgTxt(msg)}</p>}
        </Modal>
      )}
    </div>
  );
}

function InventoryStatusSubTab({ clinicId, addresses, tx }) {
  const [selectedAddr, setSelectedAddr] = useState("");
  const [status,       setStatus]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [msg,          setMsg]          = useState("");

  const loadStatus = async (addrId) => {
    if (!clinicId || !addrId) return;
    setLoading(true); setMsg(""); setStatus([]);
    try {
      const r = await authFetch(`${API_BASE}/api/clinics/${clinicId}/clinic-addresses/${addrId}/inventory-status`);
      const d = await r.json().catch(() => ({}));
      if (r.ok) setStatus(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []));
      else setMsg("err:" + (d.message || d.error || "Failed"));
    } catch (e) { setMsg("err:" + e.message); }
    finally { setLoading(false); }
  };

  const outOfStock = status.filter(item => item.color === "red" || (item.quantity ?? item.Quantity) === 0);
  const inStock    = status.filter(item => item.color !== "red" && (item.quantity ?? item.Quantity) > 0);
  const getAddrLabel = (a) => [a.street, a.building, a.city].filter(Boolean).join(", ") || a.id?.slice(0, 8);

  return (
    <div>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <FG label={tx.invSelectAddr}>
          <Sel value={selectedAddr} onChange={e => { setSelectedAddr(e.target.value); loadStatus(e.target.value); }}>
            <option value="">{tx.invChooseAddr}</option>
            {addresses.map(a => <option key={a.id} value={a.id}>{getAddrLabel(a)}</option>)}
          </Sel>
        </FG>
      </div>

      {msg && <p style={s.msgErr}>{msg.slice(4)}</p>}
      {loading && <p style={{ color: C.muted, padding: "12px 0" }}>{tx.invLoading}</p>}

      {selectedAddr && !loading && status.length > 0 && (
        <div>
          {outOfStock.length > 0 && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#DC2626", display: "inline-block" }} />
                <span style={{ fontWeight: 700, color: "#DC2626", fontSize: 15 }}>{tx.invOutOfStock} ({outOfStock.length})</span>
              </div>
              {outOfStock.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < outOfStock.length - 1 ? "1px solid #FECACA" : "none" }}>
                  <span style={{ fontWeight: 600, color: "#991B1B" }}>{item.product_name || item.name || "—"}</span>
                  <span style={{ background: "#DC2626", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>0 {item.unit || ""}</span>
                </div>
              ))}
            </div>
          )}
          {inStock.length > 0 && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
                <span style={{ fontWeight: 700, color: "#16A34A", fontSize: 15 }}>{tx.invInStock} ({inStock.length})</span>
              </div>
              {inStock.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < inStock.length - 1 ? "1px solid #BBF7D0" : "none" }}>
                  <span style={{ color: "#166534" }}>{item.product_name || item.name || "—"}</span>
                  <span style={{ background: "#22C55E", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 13, fontWeight: 600 }}>{item.quantity ?? item.Quantity ?? 0} {item.unit || ""}</span>
                </div>
              ))}
            </div>
          )}
          {outOfStock.length === 0 && (
            <p style={{ color: "#16A34A", fontWeight: 600, fontSize: 15, padding: "12px 0" }}>✓ {tx.invAllInStock}</p>
          )}
        </div>
      )}
      {selectedAddr && !loading && status.length === 0 && !msg && <Empty text={tx.invNoStock || "Нет данных"} />}
    </div>
  );
}

function InventoryView({ addresses, services, clinicId, tx }) {
  const [subTab, setSubTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLP] = useState(true);

  useEffect(() => {
    setLP(true);
    authFetch(`${API_BASE}/api/products`).then(r => r.ok ? r.json() : []).then(d => setProducts(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []))).catch(() => {}).finally(() => setLP(false));
  }, []);

  const SUB_TABS = [
    { key: "products",  label: tx.invProducts,  icon: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" },
    { key: "stock",     label: tx.invStock,     icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
    { key: "materials", label: tx.invMaterials, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { key: "status",    label: tx.invStatus,    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginTop: 28, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
        {SUB_TABS.map(st => (
          <button key={st.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 14, fontWeight: subTab === st.key ? 700 : 500, color: subTab === st.key ? C.primary : C.muted, borderBottom: subTab === st.key ? `2px solid ${C.primary}` : "2px solid transparent", background: "none", border: "none", cursor: "pointer", marginBottom: -1 }} onClick={() => setSubTab(st.key)}>
            <Icon d={st.icon} size={14} />{st.label}
          </button>
        ))}
      </div>
      {subTab === "products"  && <ProductsSubTab products={products} setProducts={setProducts} loading={loadingProducts} tx={tx} />}
      {subTab === "stock"     && <StockSubTab addresses={addresses} products={products} tx={tx} />}
      {subTab === "materials" && <MaterialsSubTab services={services} products={products} tx={tx} />}
      {subTab === "status"    && <InventoryStatusSubTab clinicId={clinicId} addresses={addresses} tx={tx} />}
    </div>
  );
}

// ── Reports ────────────────────────────────────────────────────────────────────

function ReportsView({ clinicId, addresses, tx }) {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + "01";
  const [subTab, setSubTab] = useState("appointments");
  const [addressId, setAddressId] = useState("");
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const SUB_TABS = [
    { key: "appointments", label: tx.tabs?.appointments || "Appointments", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
    { key: "revenue",      label: tx.repRevenue,                           icon: "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4l3 3" },
    { key: "doctors",      label: tx.tabs?.doctors || "Doctors",           icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
    { key: "inventory",    label: tx.tabs?.inventory || "Inventory",       icon: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" },
  ];

  const runReport = async () => {
    if (!from || !to) { setError(tx.repNoDate); return; }
    setError(""); setData(null); setLoading(true);
    try {
      let url = `${API_BASE}/api/clinics/${clinicId}/reports/${subTab}?from=${from}&to=${to}`;
      if (addressId) url += `&clinic_address_id=${addressId}`;
      const r = await authFetch(url);
      const json = await r.json();
      if (!r.ok) { setError(json.error || "Request failed."); return; }
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const exportReport = async (fmt) => {
    let url = `${API_BASE}/api/clinics/${clinicId}/reports/${subTab}?from=${from}&to=${to}&format=${fmt}`;
    if (addressId) url += `&clinic_address_id=${addressId}`;
    const r = await authFetch(url);
    const blob = await r.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `report_${subTab}_${from}_${to}.${fmt}`; a.click();
  };

  const col = { padding: "10px 14px", fontSize: 13, textAlign: "left", borderBottom: `1px solid ${C.border}` };
  const th  = { ...col, fontWeight: 700, color: C.muted, background: "#F8F9FF", fontSize: 12 };

  const renderTable = () => {
    if (!data || data.length === 0) return <Empty text={tx.repNoData} />;
    if (subTab === "appointments") return (
      <table style={s.table} cellSpacing={0}><thead><tr><th style={th}>{tx.repStatus}</th><th style={th}>{tx.repCount}</th></tr></thead>
        <tbody>{data.map((row, i) => <tr key={i}><td style={col}><span style={{ background: row.status === "completed" ? "#d1fae5" : row.status === "cancelled" ? "#fee2e2" : "#fef9c3", color: row.status === "completed" ? "#065f46" : row.status === "cancelled" ? "#991b1b" : "#92400e", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{row.status}</span></td><td style={col}>{row.appointment_count}</td></tr>)}</tbody>
      </table>
    );
    if (subTab === "revenue") return (
      <table style={s.table} cellSpacing={0}><thead><tr><th style={th}>{tx.invService}</th><th style={th}>{tx.tabs?.appointments}</th><th style={th}>{tx.repUnitPrice}</th><th style={th}>{tx.repTotalRevenue}</th></tr></thead>
        <tbody>
          {data.map((row, i) => <tr key={i}><td style={col}>{row.service_name}</td><td style={col}>{row.appointment_count}</td><td style={col}>{Number(row.unit_price).toLocaleString()}</td><td style={{ ...col, fontWeight: 700, color: C.primary }}>{Number(row.total_revenue).toLocaleString()}</td></tr>)}
          <tr style={{ background: "#F8F9FF" }}><td style={{ ...col, fontWeight: 700 }} colSpan={3}>{tx.repTotal}</td><td style={{ ...col, fontWeight: 700, color: C.primary }}>{data.reduce((sum, r) => sum + Number(r.total_revenue), 0).toLocaleString()}</td></tr>
        </tbody>
      </table>
    );
    if (subTab === "doctors") return (
      <table style={s.table} cellSpacing={0}><thead><tr><th style={th}>{tx.colDoctor}</th><th style={th}>{tx.colSpec}</th><th style={th}>{tx.tabs?.appointments}</th><th style={th}>{tx.repCompleted}</th><th style={th}>{tx.repRevenue}</th><th style={th}>{tx.repAvgRating}</th></tr></thead>
        <tbody>{data.map((row, i) => <tr key={i}><td style={col}>{row.doctor_name}</td><td style={col}>{row.specialization}</td><td style={col}>{row.appointment_count}</td><td style={col}>{row.completed_count}</td><td style={{ ...col, color: C.primary, fontWeight: 600 }}>{Number(row.revenue).toLocaleString()}</td><td style={col}>{row.average_rating > 0 ? `⭐ ${Number(row.average_rating).toFixed(1)}` : "—"}</td></tr>)}</tbody>
      </table>
    );
    if (subTab === "inventory") return (
      <table style={s.table} cellSpacing={0}><thead><tr><th style={th}>{tx.invProduct}</th><th style={th}>{tx.invUnit}</th><th style={th}>{tx.repInStock}</th><th style={th}>{tx.repRestocked}</th><th style={th}>{tx.repUsed}</th><th style={th}>{tx.repAdjusted}</th></tr></thead>
        <tbody>{data.map((row, i) => <tr key={i}><td style={col}>{row.product_name}</td><td style={col}>{row.unit}</td><td style={{ ...col, fontWeight: 600 }}>{row.current_quantity}</td><td style={{ ...col, color: "#16a34a" }}>{row.restocked_quantity > 0 ? `+${row.restocked_quantity}` : "—"}</td><td style={{ ...col, color: row.used_quantity > 0 ? "#dc2626" : C.muted }}>{row.used_quantity > 0 ? `-${row.used_quantity}` : "—"}</td><td style={col}>{row.adjustment_quantity !== 0 ? row.adjustment_quantity : "—"}</td></tr>)}</tbody>
      </table>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginTop: 28, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
        {SUB_TABS.map(st => (
          <button key={st.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 14, fontWeight: subTab === st.key ? 700 : 500, color: subTab === st.key ? C.primary : C.muted, borderBottom: subTab === st.key ? `2px solid ${C.primary}` : "2px solid transparent", background: "none", border: "none", cursor: "pointer", marginBottom: -1 }} onClick={() => { setSubTab(st.key); setData(null); setError(""); }}>
            <Icon d={st.icon} size={14} />{st.label}
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 24px", marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 180 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{tx.repAddressOpt}</label>
          <Sel value={addressId} onChange={e => setAddressId(e.target.value)}>
            <option value="">{tx.repAllAddresses}</option>
            {addresses.map(a => <option key={a.id} value={a.id}>{[a.street, a.building, a.city].filter(Boolean).join(", ") || a.id?.slice(0, 8)}</option>)}
          </Sel>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{tx.repFrom}</label>
          <input type="date" style={{ ...s.input, width: 150 }} value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{tx.repTo}</label>
          <input type="date" style={{ ...s.input, width: 150 }} value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <button style={{ ...s.addBtn, height: 40, paddingTop: 0, paddingBottom: 0 }} onClick={runReport} disabled={loading}>{loading ? tx.invLoading : tx.repRunReport}</button>
        {data && data.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...s.addBtn, background: "#2563eb", height: 40, paddingTop: 0, paddingBottom: 0, fontSize: 13 }} onClick={() => exportReport("csv")}>CSV</button>
            <button style={{ ...s.addBtn, background: "#2563eb", height: 40, paddingTop: 0, paddingBottom: 0, fontSize: 13 }} onClick={() => exportReport("pdf")}>PDF</button>
          </div>
        )}
      </div>
      {error && <p style={{ color: "#ef4444", marginBottom: 16, fontSize: 14 }}>{error}</p>}
      <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {!data && !loading && <div style={{ padding: "40px 24px", textAlign: "center", color: C.muted, fontSize: 14 }}>{tx.repPrompt}</div>}
        {loading && <div style={{ padding: "40px 24px", textAlign: "center", color: C.muted, fontSize: 14 }}>{tx.invLoading}</div>}
        {data && !loading && <div style={{ overflowX: "auto" }}>{renderTable()}</div>}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ClinicAdminDashboard({ setPage, lang: propLang, setLang: propSetLang }) {
  const [localLang, setLocalLang] = useState(propLang || "RU");
  const lang = propLang || localLang;
  const setLang = propSetLang || setLocalLang;
  const tx = ADMIN_T[lang] || ADMIN_T.EN;
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const { isMobile } = useResponsive();

  const [tab, setTab] = useState("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [clinicName, setClinicName] = useState("");
  const [clinicData, setClinicData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const init = async () => {
      const raw = sessionStorage.getItem("token") || "";
      const claims = parseJwt(raw);
      const email = (claims.email || claims.Email || "").toLowerCase();
      try {
        const r = await authFetch(`${API_BASE}/api/clinic-admins`);
        if (!r.ok) { setLoading(false); return; }
        const list = await r.json().then(d => Array.isArray(d) ? d : []);
        const me = list.find(a => (a.email || "").toLowerCase() === email);
        if (!me) { setLoading(false); return; }
        setAdminInfo(me);
        await Promise.all([
          authFetch(`${API_BASE}/api/clinics/${me.clinic_id}`).then(r => r.ok ? r.json() : null).then(d => { if (d) { const c = d.data || d; setClinicData(c); setClinicName(c.name || ""); } }).catch(() => {}),
          authFetch(`${API_BASE}/api/doctors`).then(r => r.ok ? r.json() : []).then(d => setDoctors((Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : [])).filter(doc => doc.clinic_id === me.clinic_id))).catch(() => {}),
          authFetch(`${API_BASE}/api/clinics/${me.clinic_id}/services`).then(r => r.ok ? r.json() : []).then(d => setServices(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []))).catch(() => {}),
          authFetch(`${API_BASE}/api/clinics/${me.clinic_id}/address`).then(r => r.ok ? r.json() : []).then(d => setAddresses(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []))).catch(() => {}),
          authFetch(`${API_BASE}/api/appointment`).then(r => r.ok ? r.json() : []).then(d => setAppointments(Array.isArray(d) ? d : [])).catch(() => {}),
        ]);
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const clinicDoctorIds = new Set(doctors.map(d => d.id));
  const filteredAppointments = appointments.filter(a => clinicDoctorIds.has(a.doctor_id));
  const clinicId = adminInfo?.clinic_id;

  const counts = {
    appointments: filteredAppointments.length,
    doctors:      doctors.length,
    services:     services.length,
    schedule:     0,
    addresses:    addresses.length,
    clinic:       0,
    inventory:    0,
    reports:      0,
  };

  const tabLabel = (key) => ({
    appointments: tx.tabs?.appointments || "Appointments",
    doctors:      tx.tabs?.doctors      || "Doctors",
    services:     tx.tabs?.services     || "Services",
    schedule:     tx.tabs?.schedule     || "Schedule",
    addresses:    tx.tabs?.addresses    || "Addresses",
    clinic:       tx.tabs?.clinics      || "Clinic",
    inventory:    tx.tabs?.inventory    || "Inventory",
    reports:      tx.tabs?.reports      || "Reports",
  })[key] || key;

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={{ ...s.bar, padding: isMobile ? "0 12px" : "0 48px", height: isMobile ? 56 : 72 }}>
        <div style={s.barLeft}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", color: C.muted, flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, cursor: "pointer" }} onClick={() => setPage("home")}>
            <div style={{ ...s.barIcon, width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
              <svg width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" stroke="#fff" strokeWidth="2"/>
                <rect x="13" y="3" width="8" height="8" rx="2" stroke="#fff" strokeWidth="2"/>
                <rect x="3" y="13" width="8" height="8" rx="2" stroke="#fff" strokeWidth="2"/>
                <rect x="13" y="13" width="8" height="8" rx="2" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <div style={{ ...s.barTitle, fontSize: isMobile ? 14 : undefined }}>{adminInfo?.name || "Clinic Admin"}</div>
              {clinicName && !isMobile && <div style={s.barSub}>{clinicName}</div>}
            </div>
          </div>
        </div>
        <div style={{ ...s.barRight, gap: isMobile ? 8 : 16 }}>
          {/* Language switcher — header only on desktop */}
          {!isMobile && (
            <div style={s.langWrap} ref={langRef}>
              <button style={{ ...s.langBtn, borderColor: langOpen ? C.primary : C.border }} onClick={() => setLangOpen(o => !o)}>
                <GlobeIcon />
                <span>{lang}</span>
                <span style={{ fontSize: 10, marginLeft: 2, display: "inline-block", transform: langOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
              </button>
              {langOpen && (
                <div style={s.langDrop}>
                  {LANGUAGES.map(l => (
                    <div key={l.code} style={s.langItem(l.code === lang)}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      onMouseEnter={(e) => { if (l.code !== lang) e.currentTarget.style.background = "#F8F9FF"; }}
                      onMouseLeave={(e) => { if (l.code !== lang) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 20 }}>{l.flag}</span><span>{l.label}</span>
                      {l.code === lang && <span style={{ marginLeft: "auto", color: C.primary }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button style={{ ...s.logoutBtn, color: C.primary }} onClick={() => setProfileOpen(true)} title={tx.profileSettings || "Profile Settings"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!isMobile && (tx.profileSettings || "Profile Settings")}
          </button>
          <button style={s.logoutBtn} onClick={() => { sessionStorage.removeItem("token"); setPage("login"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M16 17l5-5-5-5M21 12H9M13 22H5a2 2 0 01-2-2V4a2 2 0 012-2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {!isMobile && tx.logout}
          </button>
        </div>
      </div>
      {profileOpen && <ProfileModal tx={tx} onClose={() => setProfileOpen(false)} />}

      {/* ── Mobile backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 150 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div style={s.body}>
        {/* ── Sidebar — always rendered, overlay on mobile ── */}
        <nav style={isMobile ? {
          ...s.sidebar,
          position: "fixed", left: 0, top: 0, bottom: 0,
          height: "100dvh", zIndex: 200,
          width: 260,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.15)" : "none",
        } : {
          ...s.sidebar,
          width: sidebarOpen ? 220 : 0,
          overflow: "hidden",
          transition: "width 0.25s ease",
          flexShrink: 0,
        }}>
          <div style={{ ...s.sideBody, paddingTop: isMobile ? 60 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8 2 5 5 5 8c0 2.5 1.5 4.5 3 5.5V20a1 1 0 002 0v-2h4v2a1 1 0 002 0v-6.5c1.5-1 3-3 3-5.5 0-3-3-6-7-6z" fill="white"/>
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", letterSpacing: 0.2 }}>Dental Clinic</span>
            </div>
            <div style={s.sideLabel}>{tx.sidebarNav}</div>
            {CLINIC_TABS.map(t => (
              <button key={t.key} style={s.sideItem(tab === t.key)} onClick={() => { setTab(t.key); if (isMobile) setSidebarOpen(false); }}>
                <Icon d={t.icon} size={16} />
                <span style={{ flex: 1 }}>{tabLabel(t.key)}</span>
                {counts[t.key] > 0 && <span style={s.sideCount(tab === t.key)}>{counts[t.key]}</span>}
              </button>
            ))}

            {/* Language switcher inside sidebar on mobile */}
            {isMobile && (
              <div style={{ marginTop: 24 }}>
                <div style={s.sideLabel}>{tx.language || "ЯЗЫК"}</div>
                {LANGUAGES.map(l => (
                  <div key={l.code} style={{ ...s.langItem(l.code === lang), borderRadius: 10, marginBottom: 2 }}
                    onClick={() => { setLang(l.code); setSidebarOpen(false); }}
                  >
                    <span style={{ fontSize: 20 }}>{l.flag}</span>
                    <span style={{ fontSize: 14 }}>{l.label}</span>
                    {l.code === lang && <span style={{ marginLeft: "auto", color: C.primary }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {loading ? (
            <div style={s.loading}>{tx.invLoading}</div>
          ) : (
            <div style={{ ...s.content, padding: isMobile ? "0 12px 40px" : "0 48px 56px" }}>
              {tab === "appointments" && clinicId && (
                <AppointmentsView appointments={filteredAppointments} setAppointments={setAppointments} doctors={doctors} services={services} addresses={addresses} tx={tx} />
              )}
              {tab === "doctors" && clinicId && (
                <DoctorsView doctors={doctors} setDoctors={setDoctors} clinicId={clinicId} services={services} tx={tx} />
              )}
              {tab === "services" && clinicId && (
                <ServicesView services={services} setServices={setServices} clinicId={clinicId} tx={tx} />
              )}
              {tab === "schedule" && (
                <ScheduleView doctors={doctors} addresses={addresses} tx={tx} />
              )}
              {tab === "addresses" && clinicId && (
                <AddressesView clinicId={clinicId} addresses={addresses} setAddresses={setAddresses} tx={tx} />
              )}
              {tab === "clinic" && (
                <ClinicView clinicData={clinicData} setClinicData={setClinicData} tx={tx} />
              )}
              {tab === "inventory" && (
                <>
                  <div style={s.sectionHeader}><span style={s.sectionTitle}>{tx.tabs?.inventory || "Inventory"}</span></div>
                  <InventoryView addresses={addresses} services={services} clinicId={clinicId} tx={tx} />
                </>
              )}
              {tab === "reports" && clinicId && (
                <>
                  <div style={s.sectionHeader}><span style={s.sectionTitle}>{tx.tabs?.reports || "Reports"}</span></div>
                  <ReportsView clinicId={clinicId} addresses={addresses} tx={tx} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
