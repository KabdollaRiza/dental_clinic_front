import { useState, useEffect, useRef } from "react";
import { COLORS } from "./constants";
import { ADMIN_T } from "./translation";
import { GlobeIcon } from "./Icons";
import { useResponsive } from "./useResponsive";

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "";

const C = COLORS;

function authFetch(url, options = {}) {
  const raw = sessionStorage.getItem("token") || "";
  const authHeader = raw.startsWith("Bearer ") ? raw : (raw ? `Bearer ${raw}` : "");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authHeader) headers["Authorization"] = authHeader;
  return fetch(url, { ...options, headers });
}

function handle401(status, setMsg) {
  if (status === 401) {
    setMsg("err:Unauthorized — please log out and log in again.");
    return true;
  }
  return false;
}

function authFetchFile(url, method, file, fieldName = "image") {
  const raw = sessionStorage.getItem("token") || "";
  const authHeader = raw.startsWith("Bearer ") ? raw : (raw ? `Bearer ${raw}` : "");
  const formData = new FormData();
  formData.append(fieldName, file);
  const headers = {};
  if (authHeader) headers["Authorization"] = authHeader;
  return fetch(url, { method, headers, body: formData });
}

// Styles 
const s = {
  page: { flex: 1, background: "#F8F9FF", display: "flex", flexDirection: "column" },

  adminBar: {
    background: "#fff", borderBottom: `1px solid ${C.border}`,
    padding: "0 48px", display: "flex", alignItems: "center",
    justifyContent: "space-between", height: 72,
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  },
  adminLeft: { display: "flex", alignItems: "center", gap: 14 },
  adminIcon: {
    width: 40, height: 40, background: C.primary, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  adminTitle: { fontSize: 20, fontWeight: 800, color: C.text },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 7, background: "transparent",
    border: "none", color: C.muted, fontSize: 14, cursor: "pointer", fontWeight: 500,
  },
  adminRight: { display: "flex", alignItems: "center", gap: 16 },
  langWrap:  { position: "relative" },
  langBtn:   { display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1A1A2E", fontWeight: 500, cursor: "pointer", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", background: "transparent", transition: "border-color 0.2s" },
  langDrop:  { position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, overflow: "hidden", zIndex: 400 },
  langItem:  (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, cursor: "pointer", fontWeight: active ? 600 : 400, color: active ? C.primary : "#1A1A2E", background: active ? C.primaryLight : "transparent", transition: "background 0.15s" }),

  // Tabs
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

  // Sidebar
  sidebar: {
    width: 240, flexShrink: 0,
    background: "#fff", borderRight: `1px solid ${C.border}`,
    display: "flex", flexDirection: "column",
    overflowY: "auto",
  },
  sideBody: {
    flex: 1, overflowY: "auto",
    padding: "20px 12px",
  },
  sideLabel: {
    fontSize: 10, fontWeight: 700, color: C.muted,
    letterSpacing: 1.2, textTransform: "uppercase",
    padding: "0 14px", marginBottom: 8,
  },
  sideItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "11px 14px",
    borderRadius: 10, marginBottom: 3,
    fontSize: 14, fontWeight: active ? 700 : 500,
    color: active ? C.primary : "#374151",
    background: active ? C.primaryLight : "transparent",
    border: "none", cursor: "pointer", textAlign: "left",
    transition: "background 0.15s, color 0.15s",
    boxSizing: "border-box",
  }),
  sideCount: (active) => ({
    marginLeft: "auto", fontSize: 11, fontWeight: 700,
    background: active ? C.primary : "#F1F5F9",
    color: active ? "#fff" : C.muted,
    borderRadius: 20, padding: "2px 8px",
    minWidth: 24, textAlign: "center",
  }),

  // Content area
  wrap: { padding: "0 48px 56px", flex: 1 },
  sectionHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20, marginTop: 32,
  },
  sectionTitle: { fontSize: 22, fontWeight: 800, color: C.text },
  addBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: C.primary, color: "#fff", border: "none",
    borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer",
  },

  // Empty box
  emptyBox: {
    background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14,
    padding: "72px 24px", textAlign: "center",
  },
  emptyIcon: { width: 56, height: 56, margin: "0 auto 14px", opacity: 0.2 },
  emptyText: { fontSize: 14, color: C.muted, maxWidth: 340, margin: "0 auto" },

  // Table
  table: {
    width: "100%", background: "#fff", border: `1px solid ${C.border}`,
    borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    borderCollapse: "collapse",
  },
  thead: { background: "#F8F9FF" },
  th: {
    padding: "13px 18px", fontSize: 11, fontWeight: 700, color: C.muted,
    textAlign: "left", textTransform: "uppercase", letterSpacing: 0.6,
    borderBottom: `1px solid ${C.border}`,
  },
  td: { padding: "14px 18px", fontSize: 14, color: C.text, borderBottom: `1px solid ${C.border}` },
  editBtn: { background: "#EEF2FF", color: C.primary, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6 },
  deleteBtn: {
    background: "#FEE2E2", color: "#DC2626", border: "none",
    borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginLeft: 6,
  },
  badge: (color) => ({
    display: "inline-block",
    background: color ? color + "22" : C.primaryLight,
    color: color || C.primary,
    fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px",
  }),

  // Modal
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

  // Form
  fg: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 },
  input: {
    width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 14, color: C.text, outline: "none",
    boxSizing: "border-box", background: "#fff", transition: "border 0.2s",
  },
  textarea: {
    width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 14, color: C.text, outline: "none",
    boxSizing: "border-box", background: "#fff", resize: "vertical", minHeight: 90,
  },
  select: {
    width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 14, color: C.text, outline: "none",
    boxSizing: "border-box", background: "#fff", cursor: "pointer",
  },
  submitBtn: {
    width: "100%", padding: "14px", background: C.primary, color: "#fff",
    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
    marginTop: 4, letterSpacing: 0.2,
  },
  btn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: C.primary, color: "#fff", border: "none",
    borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
  msgOk:  { textAlign: "center", fontSize: 13, color: "#22c55e", marginTop: 12, fontWeight: 600 },
  msgErr: { textAlign: "center", fontSize: 13, color: "#ef4444", marginTop: 12, fontWeight: 600 },
  checkList: {
    border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "10px 14px", maxHeight: 140, overflowY: "auto", background: "#fff",
  },
  checkItem: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "5px 0", fontSize: 14, color: C.text, cursor: "pointer",
  },
};

// Tiny helpers
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Modal({ title, onClose, children }) {
  const { isMobile } = useResponsive();
  const modalStyle = isMobile
    ? { ...s.modal, maxWidth: "100%", margin: "0 8px", borderRadius: 12 }
    : s.modal;
  const headerStyle = isMobile
    ? { ...s.modalHeader, padding: "18px 20px 14px" }
    : s.modalHeader;
  const bodyStyle = isMobile
    ? { ...s.modalBody, padding: "16px 20px 24px" }
    : s.modalBody;
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
  return (
    <div style={s.fg}>
      {label && <label style={s.label}>{label}</label>}
      {children}
    </div>
  );
}

function Input({ name, value, onChange, placeholder, type = "text" }) {
  return (
    <input
      style={s.input} type={type} name={name} value={value}
      placeholder={placeholder} onChange={onChange}
      onFocus={(e) => (e.target.style.borderColor = C.primary)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  );
}

function Sel({ name, value, onChange, children }) {
  return (
    <select style={s.select} name={name} value={value} onChange={onChange}
      onFocus={(e) => (e.target.style.borderColor = C.primary)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}>
      {children}
    </select>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={s.emptyBox}>
      <svg style={s.emptyIcon} viewBox="0 0 24 24" fill="none">
        <path d={icon} stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={s.emptyText}>{text}</p>
    </div>
  );
}

// Tab definitions 
const TABS = [
  { key: "addresses",    label: "Addresses",    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" },
  { key: "clinics",      label: "Clinics",      icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" },
  { key: "doctors",      label: "Doctors",      icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
  { key: "services",     label: "Services",     icon: "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4l3 3" },
  { key: "appointments", label: "Appointments", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
  { key: "reviews",      label: "Reviews",      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { key: "schedule",     label: "Schedule",     icon: "M12 8v4l3 3M12 2a10 10 0 100 20A10 10 0 0012 2z" },
  { key: "inventory",    label: "Inventory",    icon: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" },
  { key: "reports",      label: "Reports",      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { key: "clinic_admins", label: "Clinic Admins", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { key: "users",        label: "Users",        icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
];

// PROFILE MODAL
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
    <Modal title={tx.profileSettings} onClose={onClose}>
      <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>{tx.changePassword}</p>
        <FG label={tx.oldPassword}><Input type="password" value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} placeholder={tx.oldPasswordPh} /></FG>
        <FG label={tx.newPasswordLabel}><Input type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} placeholder={tx.passwordPlaceholder} /></FG>
        <button style={{ ...s.submitBtn, opacity: savingPw ? 0.7 : 1 }} onClick={changePassword} disabled={savingPw}>{tx.changePassword}</button>
        {pwMsg && <p style={pwMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{pwMsg.startsWith("ok:") ? tx.passwordChanged : pwMsg.slice(3)}</p>}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>{tx.changeEmail}</p>
        <FG label={tx.newEmail}><Input type="email" value={emailForm.new_email} onChange={e => setEmailForm({ new_email: e.target.value })} placeholder={tx.newEmailPh} /></FG>
        <button style={{ ...s.submitBtn, opacity: savingEmail ? 0.7 : 1 }} onClick={changeEmail} disabled={savingEmail}>{tx.changeEmail}</button>
        {emailMsg && <p style={emailMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{emailMsg.startsWith("ok:") ? tx.emailChanged : emailMsg.slice(3)}</p>}
      </div>
    </Modal>
  );
}

// CLINIC LOGO MODAL
function ClinicLogoModal({ clinic, onClose, onUpdate, tx }) {
  const [file, setFile]   = useState(null);
  const [msg,  setMsg]    = useState("");
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState(clinic.logo_url || "");

  const upload = async () => {
    if (!file) { setMsg("err:Please select a file"); return; }
    setSaving(true);
    try {
      const res = await authFetchFile(`${API_BASE}/api/clinics/${clinic.id}/logo`, "PUT", file, "logo");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Upload failed")); return; }
      const url = data.url || data.logo_url || data.image_url || data.data?.url || "";
      setLogoUrl(url);
      onUpdate(clinic.id, url);
      setFile(null);
      setMsg("ok:Logo uploaded!");
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const deleteLogo = async () => {
    if (!window.confirm("Delete logo?")) return;
    try {
      await authFetch(`${API_BASE}/api/clinics/${clinic.id}/logo`, { method: "DELETE" });
      setLogoUrl("");
      onUpdate(clinic.id, "");
      setMsg("ok:Logo deleted");
    } catch (e) { setMsg("err:" + e.message); }
  };

  return (
    <Modal title={`Logo — ${clinic.name}`} onClose={onClose}>
      {logoUrl ? (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img src={logoUrl} alt="clinic logo" style={{ maxWidth: 220, maxHeight: 140, borderRadius: 10, border: `1px solid ${C.border}`, objectFit: "contain" }} />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 13, marginBottom: 8 }}>{tx.noLogoSet}</div>
      )}
      <FG label={tx.newLogoFile}>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ width: "100%", fontSize: 14, padding: "8px 0" }} />
      </FG>
      <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={upload} disabled={saving || !file}>
        {saving ? tx.uploading : tx.uploadLogo}
      </button>
      {logoUrl && (
        <button style={{ ...s.submitBtn, background: "#DC2626", marginTop: 10 }} onClick={deleteLogo}>
          {tx.deleteLogo}
        </button>
      )}
      {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
    </Modal>
  );
}

// ADDRESS COVER MODAL
function AddressCoverModal({ address, onClose, onUpdate, tx }) {
  const [file, setFile]     = useState(null);
  const [msg,  setMsg]      = useState("");
  const [saving, setSaving] = useState(false);
  const [coverUrl, setCoverUrl] = useState(address.cover_url || "");

  const upload = async () => {
    if (!file) { setMsg("err:Please select a file"); return; }
    setSaving(true);
    try {
      const res = await authFetchFile(`${API_BASE}/api/clinic-addresses/${address.id}/cover`, "PUT", file, "cover");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Upload failed")); return; }
      const url = data.url || data.cover_url || data.image_url || data.data?.url || "";
      setCoverUrl(url);
      onUpdate(address.id, url);
      setFile(null);
      setMsg("ok:Cover uploaded!");
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const deleteCover = async () => {
    if (!window.confirm("Delete cover?")) return;
    try {
      await authFetch(`${API_BASE}/api/clinic-addresses/${address.id}/cover`, { method: "DELETE" });
      setCoverUrl("");
      onUpdate(address.id, "");
      setMsg("ok:Cover deleted");
    } catch (e) { setMsg("err:" + e.message); }
  };

  const addrLabel = [address.address_name, address.street, address.city].filter(Boolean).join(", ");

  return (
    <Modal title={`Cover — ${addrLabel}`} onClose={onClose}>
      {coverUrl ? (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img src={coverUrl} alt="cover" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 10, border: `1px solid ${C.border}`, objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 13, marginBottom: 8 }}>{tx.noCoverSet}</div>
      )}
      <FG label={tx.newCoverFile}>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ width: "100%", fontSize: 14, padding: "8px 0" }} />
      </FG>
      <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={upload} disabled={saving || !file}>
        {saving ? tx.uploading : tx.uploadCover}
      </button>
      {coverUrl && (
        <button style={{ ...s.submitBtn, background: "#DC2626", marginTop: 10 }} onClick={deleteCover}>
          {tx.deleteCover}
        </button>
      )}
      {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
    </Modal>
  );
}

// ADDRESS GALLERY MODAL
function AddressGalleryModal({ address, onClose, tx }) {
  const [images,   setImages]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [addFile,  setAddFile]  = useState(null);
  const [updFiles, setUpdFiles] = useState({});
  const [msg,      setMsg]      = useState("");
  const [saving,   setSaving]   = useState(false);

  const addrLabel = [address.address_name, address.street, address.city].filter(Boolean).join(", ");

  useEffect(() => {
    setLoading(true);
    authFetch(`${API_BASE}/api/clinic-addresses/${address.id}/gallery`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setImages(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address.id]);

  const addImage = async () => {
    if (!addFile) { setMsg("err:Please select a file"); return; }
    setSaving(true);
    try {
      const res = await authFetchFile(`${API_BASE}/api/clinic-addresses/${address.id}/gallery`, "POST", addFile, "image");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Upload failed")); return; }
      const newImg = data.data || data.image || data;
      setImages(prev => [...prev, newImg]);
      setAddFile(null);
      setMsg("ok:Image added!");
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const updateImage = async (imgId) => {
    const file = updFiles[imgId];
    if (!file) { setMsg("err:Please select a file to replace"); return; }
    setSaving(true);
    try {
      const res = await authFetchFile(`${API_BASE}/api/clinic-addresses/${address.id}/gallery/${imgId}`, "PUT", file, "image");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Update failed")); return; }
      const updated = data.data || data.image || data;
      setImages(prev => prev.map(img => (img.id || img.Id) === imgId ? { ...img, ...updated } : img));
      setUpdFiles(prev => { const n = { ...prev }; delete n[imgId]; return n; });
      setMsg("ok:Image updated!");
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const deleteImage = async (imgId) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await authFetch(`${API_BASE}/api/clinic-addresses/${address.id}/gallery/${imgId}`, { method: "DELETE" });
      setImages(prev => prev.filter(img => (img.id || img.Id) !== imgId));
      setMsg("ok:Image deleted");
    } catch (e) { setMsg("err:" + e.message); }
  };

  return (
    <Modal title={`Gallery — ${addrLabel}`} onClose={onClose}>
      {msg && <p style={{ ...(msg.startsWith("ok:") ? s.msgOk : s.msgErr), marginBottom: 12 }}>{msg.slice(3)}</p>}

      {loading ? (
        <p style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: "20px 0" }}>{tx.invLoading}</p>
      ) : images.length === 0 ? (
        <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "16px 0" }}>{tx.noGalleryImages}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          {images.map(img => {
            const id  = img.id || img.Id;
            const url = img.url || img.image_url || img.URL || "";
            return (
              <div key={id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: "#F8F9FF" }}>
                {url && <img src={url} alt="" style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />}
                <div style={{ padding: "8px 8px 10px" }}>
                  <input type="file" accept="image/*" onChange={e => setUpdFiles(prev => ({ ...prev, [id]: e.target.files?.[0] }))}
                    style={{ fontSize: 11, width: "100%", marginBottom: 6 }} />
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "4px 0", background: C.primaryLight, color: C.primary, border: "none", borderRadius: 6, cursor: "pointer" }}
                      onClick={() => updateImage(id)} disabled={saving || !updFiles[id]}>
                      {tx.btnUpdate}
                    </button>
                    <button
                      style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "4px 0", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 6, cursor: "pointer" }}
                      onClick={() => deleteImage(id)}>
                      {tx.delete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>{tx.addNewImage}</p>
        <input type="file" accept="image/*" onChange={e => setAddFile(e.target.files?.[0] || null)}
          style={{ fontSize: 14, width: "100%", marginBottom: 10 }} />
        <button style={{ ...s.submitBtn, opacity: (saving || !addFile) ? 0.7 : 1 }} onClick={addImage} disabled={saving || !addFile}>
          {saving ? tx.uploading : tx.addToGallery}
        </button>
      </div>
    </Modal>
  );
}

// DOCTOR PHOTO MODAL
function DoctorPhotoModal({ doctor, onClose, onUpdate, tx }) {
  const [file, setFile]     = useState(null);
  const [msg,  setMsg]      = useState("");
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(
    doctor.photo_url ? `${API_BASE}${doctor.photo_url}` : ""
  );

  const upload = async () => {
    if (!file) { setMsg("err:Please select a file"); return; }
    setSaving(true);
    try {
      const res = await authFetchFile(`${API_BASE}/api/doctors/${doctor.id}/photo`, "POST", file, "photo");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Upload failed")); return; }
      const url = data.url || data.photo_url || data.image_url || data.data?.url || "";
      const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
      setPhotoUrl(fullUrl);
      onUpdate(doctor.id, url);
      setFile(null);
      setMsg("ok:Photo uploaded!");
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const deletePhoto = async () => {
    if (!window.confirm("Delete photo?")) return;
    try {
      await authFetch(`${API_BASE}/api/doctors/${doctor.id}/photo`, { method: "DELETE" });
      setPhotoUrl("");
      onUpdate(doctor.id, "");
      setMsg("ok:Photo deleted");
    } catch (e) { setMsg("err:" + e.message); }
  };

  return (
    <Modal title={`${tx.btnPhoto} — ${doctor.name}`} onClose={onClose}>
      {photoUrl ? (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img src={photoUrl} alt="doctor photo" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.border}` }} />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 13, marginBottom: 8 }}>{tx.noPhotoSet}</div>
      )}
      <FG label={tx.newPhotoFile}>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ width: "100%", fontSize: 14, padding: "8px 0" }} />
      </FG>
      <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={upload} disabled={saving || !file}>
        {saving ? tx.uploading : tx.uploadPhoto}
      </button>
      {photoUrl && (
        <button style={{ ...s.submitBtn, background: "#DC2626", marginTop: 10 }} onClick={deletePhoto}>
          {tx.deletePhoto}
        </button>
      )}
      {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
    </Modal>
  );
}

// CLINICS TAB
function ClinicsTab({ clinics, setClinics, tx, addresses, setAddresses }) {
  const [open, setOpen] = useState(false);
  const [editClinic, setEditClinic] = useState(null);
  const [editForm2,  setEditForm2]  = useState({});
  const [editMsg2,   setEditMsg2]   = useState("");
  const [logoClinic, setLogoClinic] = useState(null);

  const handleLogoUpdate = (clinicId, url) => {
    setClinics(prev => prev.map(c => c.id === clinicId ? { ...c, logo_url: url } : c));
  };
 
  const EMPTY = { name: "", description: "", phone: "", email: "", website: "", is_active: true, address_id: "" };
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const hc = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async () => {
    if (!form.name || !form.phone || !form.email) {
      setMsg("err:" + tx.nameRequired);
      return;
    }
    if (clinics.some(c => c.email.toLowerCase() === form.email.toLowerCase())) {
      setMsg("err:A clinic with this email already exists.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:        form.name,
        description: form.description,
        phone:       form.phone,
        email:       form.email,
        website:     form.website,
        is_active:   form.is_active,
        address_id:  form.address_id,
      };
      const res = await authFetch(`${API_BASE}/api/clinics`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (handle401(res.status, setMsg)) return;
      if (!res.ok) {
        setMsg("err:" + (data.message || data.error || "Failed to add clinic"));
        return;
      }
      const clinicId = data.data?.id || data.data?.Id || data.clinic_id || data.id || data.Id;
      const newClinic = { ...payload, id: clinicId };
      setClinics((prev) => [...prev, newClinic]);

      if (form.address_id && clinicId) {
        try {
          await authFetch(`${API_BASE}/api/clinics/${clinicId}/address`, {
            method: "POST",
            body: JSON.stringify({ address_id: form.address_id, is_main: true }),
          });
          setAddresses(prev => prev.map(a =>
            a.id === form.address_id ? { ...a, clinic_id: clinicId } : a
          ));
        } catch (_) {}
      }

      setMsg("ok:" + tx.addedOk);
    } catch (e) {
      setMsg("err:" + e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateClinic = async () => {
    if (!editClinic) return;
    try {
      const payload = { name: editForm2.name, description: editForm2.description, phone: editForm2.phone, email: editForm2.email, website: editForm2.website, is_active: editForm2.is_active };
      const res = await authFetch(`${API_BASE}/api/clinics/${editClinic.id}`, { method: "PUT", body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setEditMsg2("err:" + (data.message || "Failed")); return; }
      setClinics(prev => prev.map(c => c.id === editClinic.id ? { ...c, ...payload } : c));
      setEditMsg2("ok:Updated!"); setTimeout(() => { setEditClinic(null); setEditMsg2(""); }, 1000);
    } catch (e) { setEditMsg2("err:" + e.message); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      await authFetch(`${API_BASE}/api/clinics/${id}`, { method: "DELETE" });
      setClinics((prev) => prev.filter((c) => c.id !== id));
    } catch (_) {}
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageClinics}</span>
        <button style={s.addBtn} onClick={() => setOpen(true)}>{tx.addClinic}</button>
      </div>

      {clinics.length === 0 ? (
        <Empty
          icon="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"
          text={tx.noClinics}
        />
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={s.table} cellSpacing={0}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>{tx.colName}</th>
              <th style={s.th}>{tx.colDesc}</th>
              <th style={s.th}>{tx.colPhone}</th>
              <th style={s.th}>{tx.colEmail}</th>
              <th style={s.th}>{tx.colWebsite}</th>
              <th style={s.th}>{tx.colStatus}</th>
              <th style={s.th}>{tx.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr key={c.id}>
                <td style={s.td}><b>{c.name}</b></td>
                <td style={s.td}>{c.description?.length > 30 ? c.description.slice(0,30)+"…" : c.description || "—"}</td>
                <td style={s.td}>{c.phone || "—"}</td>
                <td style={s.td}>{c.email || "—"}</td>
                <td style={s.td}>{c.website || "—"}</td>
                <td style={s.td}>
                  <span style={s.badge(c.is_active ? "#22c55e" : "#94A3B8")}>
                    {c.is_active ? tx.active : tx.inactive}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }}>
                    <button style={s.editBtn} onClick={() => { setEditClinic(c); setEditForm2({...c}); setEditMsg2(""); }}>{tx.invEdit}</button>
                    <button style={{ ...s.editBtn, marginRight: 0, background: "#E0F2FE", color: "#0369A1" }} onClick={() => setLogoClinic(c)}>{tx.btnLogo}</button>
                    <button style={{ ...s.deleteBtn, marginLeft: 0 }} onClick={() => del(c.id)}>{tx.delete}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Edit Clinic Modal */}
      {editClinic && (
        <Modal title={tx.editClinic} onClose={() => { setEditClinic(null); setEditMsg2(""); }}>
          <FG label={tx.clinicName}><Input name="name" value={editForm2.name||""} onChange={(e)=>setEditForm2({...editForm2,name:e.target.value})} /></FG>
          <FG label={tx.description}><textarea style={s.textarea} name="description" value={editForm2.description||""} onChange={(e)=>setEditForm2({...editForm2,description:e.target.value})} onFocus={(e)=>(e.target.style.borderColor=C.primary)} onBlur={(e)=>(e.target.style.borderColor=C.border)} /></FG>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <FG label={tx.phoneNum}><Input value={editForm2.phone||""} onChange={(e)=>setEditForm2({...editForm2,phone:e.target.value})} /></FG>
            <FG label={tx.emailAddr}><Input type="email" value={editForm2.email||""} onChange={(e)=>setEditForm2({...editForm2,email:e.target.value})} /></FG>
          </div>
          <FG label={tx.websiteUrl}><Input value={editForm2.website||""} onChange={(e)=>setEditForm2({...editForm2,website:e.target.value})} /></FG>
          <FG label=""><label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,cursor:"pointer"}}><input type="checkbox" checked={!!editForm2.is_active} onChange={(e)=>setEditForm2({...editForm2,is_active:e.target.checked})} />{tx.setActive}</label></FG>
          <button style={s.submitBtn} onClick={updateClinic}>{tx.invSaveChanges}</button>
          {editMsg2 && <p style={editMsg2.startsWith("ok:") ? s.msgOk : s.msgErr}>{editMsg2.slice(3)}</p>}
        </Modal>
      )}

      {open && (
        <Modal title={tx.modalAddClinic} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <FG label={tx.clinicName}>
            <Input name="name" value={form.name} onChange={hc} placeholder={tx.clinicNamePh} />
          </FG>
          <FG label={tx.description}>
            <textarea style={s.textarea} name="description" value={form.description} onChange={hc}
              placeholder={tx.descPh}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </FG>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.phoneNum}>
              <Input name="phone" value={form.phone} onChange={hc} placeholder={tx.phonePh} />
            </FG>
            <FG label={tx.emailAddr}>
              <Input name="email" type="email" value={form.email} onChange={hc} placeholder={tx.emailClinicPh} />
            </FG>
          </div>
          <FG label={tx.websiteUrl}>
            <Input name="website" value={form.website} onChange={hc} placeholder={tx.websitePh} />
          </FG>
          <FG label={tx.assignAddress}>
            {addresses.length === 0 ? (
              <div style={{ padding: "10px 14px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 8, fontSize: 13, color: "#92400E" }}>
                ⚠ {tx.noAddressesYet}
              </div>
            ) : (
              <Sel name="address_id" value={form.address_id} onChange={hc}>
                <option value="">{tx.selectAddress}</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {[a.street, a.building, a.city, a.country].filter(Boolean).join(", ")}
                  </option>
                ))}
              </Sel>
            )}
          </FG>
          <FG label="">
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={hc} />
              {tx.setActive}
            </label>
          </FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
            {saving ? tx.creating : tx.modalAddClinic}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}

      {logoClinic && (
        <ClinicLogoModal
          clinic={logoClinic}
          onClose={() => setLogoClinic(null)}
          onUpdate={handleLogoUpdate}
          tx={tx}
        />
      )}
    </>
  );
}

// DOCTORS TAB
function DoctorsTab({ doctors, setDoctors, clinics, services, tx }) {
  const [open, setOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editDocForm, setEditDocForm] = useState({});
  const [editDocMsg,  setEditDocMsg]  = useState("");
  const [photoDoc, setPhotoDoc] = useState(null);

  const handlePhotoUpdate = (docId, url) => {
    setDoctors(prev => prev.map(d => d.id === docId ? { ...d, photo_url: url } : d));
  };
  const EMPTY = { name: "", email: "", specialization: "", experience: "", clinic_id: "", service_ids: [], password: "", is_active: true };
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [clinicServices, setClinicServices] = useState([]);
  const [confirmationCode, setConfirmationCode] = useState("");

  const hc = (e) => {
    const { name, value } = e.target;
    if (name === "clinic_id") {
      setForm((f) => ({ ...f, clinic_id: value, service_ids: [] }));
      setClinicServices([]);
      if (value) {
        fetch(`${API_BASE}/api/clinics/${value}/services`)
          .then(r => r.ok ? r.json() : [])
          .then(d => setClinicServices(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : [])))
          .catch(() => setClinicServices([]));
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };
  const toggleSv = (id) => setForm((f) => ({
    ...f,
    service_ids: f.service_ids.includes(id) ? f.service_ids.filter((x) => x !== id) : [...f.service_ids, id],
  }));

  const submit = async () => {
    if (!form.name || !form.email) { setMsg("err:" + tx.nameEmailRequired); return; }
    if (!form.password) { setMsg("err:" + tx.passwordRequired); return; }
    if (doctors.some(d => d.email.toLowerCase() === form.email.toLowerCase())) {
      setMsg("err:" + tx.doctorEmailExists); return;
    }
    try {
      const res = await authFetch(`${API_BASE}/api/doctors`, {
        method: "POST",
        body: JSON.stringify({ ...form, experience: parseInt(form.experience) || 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || "Failed")); return; }
      setDoctors((prev) => [...prev, { ...form, id: data.data?.id || data.data?.Id || data.doctor_id || data.id || data.Id || String(Date.now()) }]);
      if (data.confirmation_code) {
        setConfirmationCode(data.confirmation_code);
        setMsg("ok:" + tx.addedOk);
      } else {
        setMsg("ok:" + tx.addedOk);
        setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); }, 1200);
      }
    } catch (e) { alert(e.message); }
  };

  const updateDoctor = async () => {
    if (!editDoc) return;
    try {
      const payload = { name: editDocForm.name, email: editDocForm.email, specialization: editDocForm.specialization, experience: parseInt(editDocForm.experience)||0, new_password: editDocForm.new_password || "", is_active: !!editDocForm.is_active };
      const res = await authFetch(`${API_BASE}/api/doctors/${editDoc.id}`, { method: "PUT", body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setEditDocMsg("err:" + (data.message || "Failed")); return; }
      setDoctors(prev => prev.map(d => d.id === editDoc.id ? { ...d, ...payload } : d));
      setEditDocMsg("ok:Updated!"); setTimeout(() => { setEditDoc(null); setEditDocMsg(""); }, 1000);
    } catch (e) { setEditDocMsg("err:" + e.message); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/doctors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || data.error || "Delete failed — doctor may have linked appointments or schedule.");
        return;
      }
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (e) { setMsg("err:" + e.message); }
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageDoctors}</span>
        <button style={s.addBtn} onClick={() => setOpen(true)}>{tx.addDoctor}</button>
      </div>
      {doctors.length === 0 ? (
        <Empty icon="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" text={tx.noDoctors} />
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={s.table} cellSpacing={0}>
          <thead style={s.thead}><tr>
            <th style={s.th}>{tx.colName}</th><th style={s.th}>{tx.colEmail}</th>
            <th style={s.th}>{tx.colSpec}</th><th style={s.th}>{tx.colExp}</th><th style={s.th}>{tx.colActions}</th>
          </tr></thead>
          <tbody>{doctors.map((d) => (
            <tr key={d.id}>
              <td style={s.td}><b>{d.name}</b></td>
              <td style={s.td}>{d.email}</td>
              <td style={s.td}>{d.specialization || "—"}</td>
              <td style={s.td}>{d.experience ? `${d.experience} ${tx.yearsAbbr}` : "—"}</td>
              <td style={s.td}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }}>
                  <button style={s.editBtn} onClick={() => { setEditDoc(d); setEditDocForm({ ...d, new_password: "", is_active: d.is_active ?? true }); setEditDocMsg(""); }}>{tx.invEdit}</button>
                  <button style={{ ...s.editBtn, marginRight: 0, background: "#FDF4FF", color: "#7C3AED" }} onClick={() => setPhotoDoc(d)}>{tx.btnPhoto}</button>
                  <button style={{ ...s.deleteBtn, marginLeft: 0 }} onClick={() => del(d.id)}>{tx.delete}</button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        </div>
      )}
      {editDoc && (
        <Modal title={tx.editDoctor} onClose={() => { setEditDoc(null); setEditDocMsg(""); }}>
          <FG label={tx.fullName}><Input value={editDocForm.name||""} onChange={(e)=>setEditDocForm({...editDocForm,name:e.target.value})} /></FG>
          <FG label={tx.emailAddr}><Input type="email" value={editDocForm.email||""} onChange={(e)=>setEditDocForm({...editDocForm,email:e.target.value})} /></FG>
          <FG label={tx.colSpec}><Input value={editDocForm.specialization||""} onChange={(e)=>setEditDocForm({...editDocForm,specialization:e.target.value})} /></FG>
          <FG label={tx.yearsExp}><Input type="number" value={editDocForm.experience||""} onChange={(e)=>setEditDocForm({...editDocForm,experience:e.target.value})} /></FG>
          <FG label={tx.newPasswordLabel}><Input type="password" value={editDocForm.new_password||""} onChange={(e)=>setEditDocForm({...editDocForm,new_password:e.target.value})} placeholder={tx.keepCurrentPassword} /></FG>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.text, marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={!!editDocForm.is_active} onChange={(e)=>setEditDocForm({...editDocForm,is_active:e.target.checked})} />
            {tx.accountActive}
          </label>
          <button style={s.submitBtn} onClick={updateDoctor}>{tx.invSaveChanges}</button>
          {editDocMsg && <p style={editDocMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{editDocMsg.slice(3)}</p>}
        </Modal>
      )}
      {photoDoc && (
        <DoctorPhotoModal
          doctor={photoDoc}
          onClose={() => setPhotoDoc(null)}
          onUpdate={handlePhotoUpdate}
          tx={tx}
        />
      )}
      {open && (
        <Modal title={tx.modalAddDoctor} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); setConfirmationCode(""); }}>
          {confirmationCode ? (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>{tx.addedOk}</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                  {tx.confirmationCodeSentEmail || "Код подтверждения отправлен на email доктора. Сохраните его."}
                </p>
              </div>
              <div style={{ background: "#F0FDF4", border: "2px solid #22c55e", borderRadius: 12, padding: "20px 24px", textAlign: "center", marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#15803D", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                  {tx.confirmationCodeLabel || "Код подтверждения"}
                </p>
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 8, color: "#166534", fontFamily: "monospace" }}>
                  {confirmationCode}
                </div>
              </div>
              <button
                style={{ ...s.submitBtn, background: "#22c55e" }}
                onClick={() => { navigator.clipboard?.writeText(confirmationCode); }}
              >
                {tx.copyCode || "Скопировать код"}
              </button>
              <button
                style={{ ...s.submitBtn, background: C.muted, marginTop: 10 }}
                onClick={() => { setOpen(false); setForm(EMPTY); setMsg(""); setConfirmationCode(""); }}
              >
                {tx.close || "Закрыть"}
              </button>
            </div>
          ) : (
            <>
              <FG label={tx.fullName}><Input name="name" value={form.name} onChange={hc} placeholder={tx.doctorNamePh} /></FG>
              <FG label={tx.emailAddr}><Input name="email" type="email" value={form.email} onChange={hc} placeholder={tx.doctorEmailPh} /></FG>
              <FG label={tx.passwordLabel}><Input name="password" type="password" value={form.password} onChange={hc} placeholder={tx.passwordPlaceholder} /></FG>
              <FG label={tx.colSpec}><Input name="specialization" value={form.specialization} onChange={hc} placeholder={tx.specPh} /></FG>
              <FG label={tx.yearsExp}><Input name="experience" type="number" value={form.experience} onChange={hc} placeholder={tx.expPh} /></FG>
              <FG label={tx.assignClinic}>
                <Sel name="clinic_id" value={form.clinic_id} onChange={hc}>
                  <option value="">{tx.selectClinic}</option>
                  {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Sel>
              </FG>
              <FG label={tx.services}>
                <div style={s.checkList}>
                  {clinicServices.length === 0
                    ? <p style={{ color: C.muted, fontSize: 13, margin: "6px 0" }}>
                        {form.clinic_id ? tx.noServicesForClinic : tx.selectClinicFirst}
                      </p>
                    : clinicServices.map((sv) => (
                      <label key={sv.id} style={s.checkItem}>
                        <input type="checkbox" checked={form.service_ids.includes(sv.id)} onChange={() => toggleSv(sv.id)} />
                        {sv.name}
                      </label>
                    ))
                  }
                </div>
              </FG>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.text, marginBottom: 16, cursor: "pointer" }}>
                <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                {tx.accountActive}
              </label>
              <button style={s.submitBtn} onClick={submit}>{tx.modalAddDoctor}</button>
              {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
            </>
          )}
        </Modal>
      )}
    </>
  );
}

// SERVICES TAB
function ServicesTab({ services, setServices, clinics, tx }) {
  const [open, setOpen] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [editSvcForm, setEditSvcForm] = useState({});
  const [editSvcMsg,  setEditSvcMsg]  = useState("");
  const EMPTY = { name: "", description: "", price: "", duration: "", clinic_id: "", is_active: true };
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const hc = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async () => {
    if (!form.name || !form.price) { setMsg("err:" + tx.namePriceRequired); return; }
    if (!form.clinic_id) { setMsg("err:" + tx.selectClinicRequired); return; }
    const dur = parseInt(form.duration, 10) || 0;
    if (dur > 0 && dur % 30 !== 0) { setMsg("err:" + tx.durationMultiple); return; }
    setSaving(true);
    try {
      // Step 1: create global catalog entry (name + description only)
      const res1 = await authFetch(`${API_BASE}/api/services`, {
        method: "POST",
        body: JSON.stringify({ name: form.name, description: form.description }),
      });
      const data1 = await res1.json().catch(() => ({}));
      if (!res1.ok) { setMsg("err:" + (data1.message || data1.error || JSON.stringify(data1))); return; }

      const catalogId = data1.service_id || data1.ServiceID || data1.id || data1.Id;
      if (!catalogId) { setMsg("err:Failed to get service ID"); return; }

      // Step 2: assign to clinic with price / duration
      const res2 = await authFetch(`${API_BASE}/api/add-clinics/${form.clinic_id}/services`, {
        method: "POST",
        body: JSON.stringify({
          service_id: catalogId,
          price: parseFloat(form.price) || 0,
          duration: dur,
          is_active: form.is_active,
        }),
      });
      const data2 = await res2.json().catch(() => ({}));
      if (!res2.ok) { setMsg("err:" + (data2.message || data2.error || JSON.stringify(data2))); return; }

      const clinicServiceId = data2.service_id || data2.ServiceID || data2.id || data2.Id || String(Date.now());
      setServices((prev) => [...prev, {
        id: clinicServiceId,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price) || 0,
        duration: dur,
        clinic_id: form.clinic_id,
        is_active: form.is_active,
      }]);
      setMsg("ok:" + tx.addedOk);
      setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); }, 1200);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const updateService = async () => {
    if (!editSvc) return;
    try {
      const payload = { name: editSvcForm.name, description: editSvcForm.description, price: parseFloat(editSvcForm.price)||0, duration: parseInt(editSvcForm.duration,10)||0, is_active: editSvcForm.is_active };
      const res = await authFetch(`${API_BASE}/api/services/${editSvc.id}`, { method: "PUT", body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setEditSvcMsg("err:" + (data.message || "Failed")); return; }
      setServices(prev => prev.map(sv => sv.id === editSvc.id ? { ...sv, ...payload } : sv));
      setEditSvcMsg("ok:Updated!"); setTimeout(() => { setEditSvc(null); setEditSvcMsg(""); }, 1000);
    } catch (e) { setEditSvcMsg("err:" + e.message); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || data.error || "Delete failed.");
        return;
      }
      setServices((prev) => prev.filter((sv) => sv.id !== id));
    } catch (e) { alert(e.message); }
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageServices}</span>
        <button style={s.addBtn} onClick={() => setOpen(true)}>{tx.addService}</button>
      </div>
      {services.length === 0 ? (
        <Empty icon="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4l3 3" text={tx.noServices} />
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={s.table} cellSpacing={0}>
          <thead style={s.thead}><tr>
            <th style={s.th}>{tx.colName}</th><th style={s.th}>{tx.colDesc}</th>
            <th style={s.th}>{tx.colPrice}</th><th style={s.th}>{tx.colDuration}</th>
            <th style={s.th}>{tx.colServiceStatus}</th><th style={s.th}>{tx.colActions}</th>
          </tr></thead>
          <tbody>{services.map((sv) => (
            <tr key={sv.id}>
              <td style={s.td}><b>{sv.name}</b></td>
              <td style={s.td}>{sv.description?.length > 40 ? sv.description.slice(0, 40) + "…" : sv.description || "—"}</td>
              <td style={s.td}><span style={s.badge()}>{Number(sv.price).toLocaleString()} ₸</span></td>
              <td style={s.td}>{sv.duration ? `${sv.duration} ${tx.minLabel}` : "—"}</td>
              <td style={s.td}>
                <span style={s.badge(sv.is_active ? "#22c55e" : "#94A3B8")}>
                  {sv.is_active ? tx.active : tx.inactive}
                </span>
              </td>
              <td style={s.td}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }}>
                  <button style={s.editBtn} onClick={() => { setEditSvc(sv); setEditSvcForm({...sv, price: String(sv.price), duration: String(sv.duration)}); setEditSvcMsg(""); }}>{tx.invEdit}</button>
                  <button style={{ ...s.deleteBtn, marginLeft: 0 }} onClick={() => del(sv.id)}>{tx.delete}</button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        </div>
      )}
      {editSvc && (
        <Modal title={tx.editService} onClose={() => { setEditSvc(null); setEditSvcMsg(""); }}>
          <FG label={tx.serviceName}><Input value={editSvcForm.name||""} onChange={(e)=>setEditSvcForm({...editSvcForm,name:e.target.value})} /></FG>
          <FG label={tx.description}><textarea style={s.textarea} value={editSvcForm.description||""} onChange={(e)=>setEditSvcForm({...editSvcForm,description:e.target.value})} onFocus={(e)=>(e.target.style.borderColor=C.primary)} onBlur={(e)=>(e.target.style.borderColor=C.border)} /></FG>
          <FG label={tx.price}><Input type="number" value={editSvcForm.price||""} onChange={(e)=>setEditSvcForm({...editSvcForm,price:e.target.value})} /></FG>
          <FG label={tx.duration}><Sel value={editSvcForm.duration||""} onChange={(e)=>setEditSvcForm({...editSvcForm,duration:e.target.value})}><option value="">—</option>{[30,60,90,120,150,180].map(d=><option key={d} value={d}>{d} {tx.minLabel}</option>)}</Sel></FG>
          <FG label=""><label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,cursor:"pointer"}}><input type="checkbox" checked={!!editSvcForm.is_active} onChange={(e)=>setEditSvcForm({...editSvcForm,is_active:e.target.checked})} />{tx.markActive}</label></FG>
          <button style={s.submitBtn} onClick={updateService}>{tx.invSaveChanges}</button>
          {editSvcMsg && <p style={editSvcMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{editSvcMsg.slice(3)}</p>}
        </Modal>
      )}
      {open && (
        <Modal title={tx.modalAddService} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <FG label={tx.serviceName}><Input name="name" value={form.name} onChange={hc} placeholder={tx.serviceNamePh} /></FG>
          <FG label={tx.description}>
            <textarea style={s.textarea} name="description" value={form.description} onChange={hc}
              placeholder={tx.serviceDescPh}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </FG>
          <FG label={tx.price}><Input name="price" type="number" value={form.price} onChange={hc} placeholder={tx.pricePh} /></FG>
          <FG label={tx.duration}>
            <Sel name="duration" value={form.duration} onChange={hc}>
              <option value="">{tx.selectDurationPh}</option>
              {[30,60,90,120,150,180].map(d => <option key={d} value={d}>{d} {tx.minLabel}</option>)}
            </Sel>
          </FG>
          <FG label={tx.assignClinic}>
            <Sel name="clinic_id" value={form.clinic_id} onChange={hc}>
              <option value="">{tx.selectClinic}</option>
              {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Sel>
          </FG>
          <FG label="">
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={hc} />
              {tx.markActive}
            </label>
          </FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
            {saving ? tx.adding : tx.modalAddService}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}
    </>
  );
}

// ADDRESSES TAB — 2-step: fill address → assign clinic
function AddressesTab({ addresses, setAddresses, clinics, tx }) {
  const [open, setOpen]         = useState(false);
  const [coverAddr, setCoverAddr]     = useState(null);
  const [galleryAddr, setGalleryAddr] = useState(null);
  const [editAddr, setEditAddr]       = useState(null);
  const [editAddrForm, setEditAddrForm] = useState({});
  const [editAddrMsg,  setEditAddrMsg]  = useState("");
  const EMPTY = { country: "", city: "", street: "", building: "" };
  const [form, setForm]     = useState(EMPTY);
  const [msg,  setMsg]      = useState("");
  const [saving, setSaving] = useState(false);

  const handleCoverUpdate = (addrId, url) => {
    setAddresses(prev => prev.map(a => a.id === addrId ? { ...a, cover_url: url } : a));
  };

  const updateAddr = async () => {
    if (!editAddr) return;
    if (!editAddrForm.country || !editAddrForm.city || !editAddrForm.street) {
      setEditAddrMsg("err:" + tx.addrRequiredFields); return;
    }
    try {
      const payload = {
        country:   editAddrForm.country,
        city:      editAddrForm.city,
        street:    editAddrForm.street,
        building:  editAddrForm.building || "",
        latitude:  0,
        longitude: 0,
      };
      const addrId = editAddr.addr_id || editAddr.id;
      const res = await authFetch(`${API_BASE}/api/address/${addrId}`, {
        method: "PUT", body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setEditAddrMsg("err:" + (data.message || data.error || "Failed")); return; }
      setAddresses(prev => prev.map(a => a.id === editAddr.id ? { ...a, ...payload } : a));
      setEditAddrMsg("ok:" + tx.addedOk);
      setTimeout(() => { setEditAddr(null); setEditAddrMsg(""); }, 1000);
    } catch (e) { setEditAddrMsg("err:" + e.message); }
  };

  const hc = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isDuplicate = (f) => addresses.some(a =>
    a.street?.trim().toLowerCase()   === f.street.trim().toLowerCase() &&
    a.building?.trim().toLowerCase() === f.building.trim().toLowerCase() &&
    a.city?.trim().toLowerCase()     === f.city.trim().toLowerCase()
  );

  // STEP 1: POST /api/address → CreateRequest → get Address_id from CreateResponse
  const submit = async () => {
    if (!form.country || !form.city || !form.street) {
      setMsg("err:" + tx.addrRequiredFields); return;
    }
    if (isDuplicate(form)) {
      setMsg("err:" + tx.addressExists); return;
    }
    setSaving(true);
    try {
      const payload = {
        country:   form.country,
        city:      form.city,
        street:    form.street,
        building:  form.building || "",
        latitude:  0,
        longitude: 0,
      };
      const res  = await authFetch(`${API_BASE}/api/address`, {
        method: "POST", body: JSON.stringify(payload),
      });
      const raw  = await res.text();
      const data = (() => { try { return JSON.parse(raw); } catch(_){return {};} })();
      if (!res.ok) {
        setMsg("err:" + res.status + ": " + (data.message || data.error || raw || "Failed")); return;
      }
      const addrId = data.Address_id || data.address_id || data.data?.id || data.id;
      if (!addrId) {
        setMsg("err:Backend did not return address_id."); return;
      }
      setAddresses(prev => [...prev, { ...payload, id: addrId, clinic_id: "" }]);
      setMsg("ok:" + tx.addedOk);
      setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); }, 1200);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  // DELETE: no clinic → DELETE /api/address/{id} with clinic → DELETE /api/clinics/{clinicId}/address/{id}
  const del = async (id, clinicId) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      if (clinicId) {
        await authFetch(`${API_BASE}/api/clinics/${clinicId}/address/${id}`, { method: "DELETE" });
      } else {
        await authFetch(`${API_BASE}/api/address/${id}`, { method: "DELETE" });
      }
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (_) {}
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageAddresses}</span>
        <button style={s.addBtn} onClick={() => setOpen(true)}>{tx.addAddress}</button>
      </div>

      {addresses.length === 0 ? (
        <Empty icon="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" text={tx.noAddresses} />
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={s.table} cellSpacing={0}>
          <thead style={s.thead}><tr>
            <th style={s.th}>{tx.country}</th>
            <th style={s.th}>{tx.city}</th>
            <th style={s.th}>{tx.street}</th>
            <th style={s.th}>{tx.building}</th>
            <th style={s.th}>{tx.colClinic}</th>
            <th style={s.th}>{tx.colActions}</th>
          </tr></thead>
          <tbody>{addresses.map((a) => (
            <tr key={a.id}>
              <td style={s.td}>{a.country  || "—"}</td>
              <td style={s.td}>{a.city     || "—"}</td>
              <td style={s.td}>{a.street   || "—"}</td>
              <td style={s.td}>{a.building || "—"}</td>
              <td style={s.td}>
                {a.clinic_id
                  ? <span style={s.badge()}>{clinics.find(c => c.id === a.clinic_id)?.name || "Assigned"}</span>
                  : <span style={{ fontSize: 12, color: "#94A3B8" }}>—</span>
                }
              </td>
              <td style={s.td}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }}>
                  <button style={s.editBtn} onClick={() => { setEditAddr(a); setEditAddrForm({...a}); setEditAddrMsg(""); }}>{tx.invEdit}</button>
                  <button style={{ ...s.editBtn, marginRight: 0, background: "#FFF7ED", color: "#D97706" }} onClick={() => setCoverAddr(a)}>{tx.btnCover}</button>
                  <button style={{ ...s.editBtn, marginRight: 0, background: "#F5F3FF", color: "#7C3AED" }} onClick={() => setGalleryAddr(a)}>{tx.btnGallery}</button>
                  <button style={{ ...s.deleteBtn, marginLeft: 0 }} onClick={() => del(a.id, a.clinic_id)}>{tx.delete}</button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        </div>
      )}

      {open && (
        <Modal title={tx.modalAddAddress} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.country}><Input name="country" value={form.country} onChange={hc} placeholder={tx.countryPh} /></FG>
            <FG label={tx.city}><Input name="city" value={form.city} onChange={hc} placeholder={tx.cityPh} /></FG>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.street}><Input name="street" value={form.street} onChange={hc} placeholder={tx.streetPh} /></FG>
            <FG label={tx.building}><Input name="building" value={form.building} onChange={hc} placeholder={tx.buildingPh} /></FG>
          </div>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
            {saving ? tx.invSaving : tx.modalAddAddress}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}

      {editAddr && (
        <Modal title={tx.editAddress} onClose={() => { setEditAddr(null); setEditAddrMsg(""); }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.country}><Input value={editAddrForm.country||""} onChange={(e)=>setEditAddrForm({...editAddrForm,country:e.target.value})} placeholder={tx.countryPh} /></FG>
            <FG label={tx.city}><Input value={editAddrForm.city||""} onChange={(e)=>setEditAddrForm({...editAddrForm,city:e.target.value})} placeholder={tx.cityPh} /></FG>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.street}><Input value={editAddrForm.street||""} onChange={(e)=>setEditAddrForm({...editAddrForm,street:e.target.value})} placeholder={tx.streetPh} /></FG>
            <FG label={tx.building}><Input value={editAddrForm.building||""} onChange={(e)=>setEditAddrForm({...editAddrForm,building:e.target.value})} placeholder={tx.buildingPh} /></FG>
          </div>
          <button style={s.submitBtn} onClick={updateAddr}>{tx.invSaveChanges}</button>
          {editAddrMsg && <p style={editAddrMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{editAddrMsg.slice(3)}</p>}
        </Modal>
      )}

      {coverAddr && (
        <AddressCoverModal
          address={coverAddr}
          onClose={() => setCoverAddr(null)}
          onUpdate={handleCoverUpdate}
          tx={tx}
        />
      )}

      {galleryAddr && (
        <AddressGalleryModal
          address={galleryAddr}
          onClose={() => setGalleryAddr(null)}
          tx={tx}
        />
      )}
    </>
  );
}

// APPOINTMENTS CALENDAR TAB — Google Calendar style
const STATUS_COLORS = { booked: "#3B5BDB", completed: "#22c55e", cancelled: "#EF4444", pending: "#F59E0B" };
const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
// daysShort comes from tx.daysShort (per language)

function getWeekDates(base) {
  const d = new Date(base);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}
function fmtDate(d) { return d.toISOString().split("T")[0]; }
function fmtTime(iso) {
  if (!iso) return "—";
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : "—";
}

function AppointmentsTab({ appointments, setAppointments, addresses, doctors, services, clinics, tx }) {
  const [baseDate,   setBaseDate]   = useState(new Date());
  const [showModal,  setShowModal]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");
  const [slots,      setSlots]      = useState([]);
  const [loadSlots,  setLoadSlots]  = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [editStatusAppt, setEditStatusAppt] = useState(null);
  const [editStatus,     setEditStatus]     = useState("");
  const [statusMsg,      setStatusMsg]      = useState("");

  const STATUS_OPTIONS = [
    { value: "pending",   label: tx.statusPending },
    { value: "booked",    label: tx.statusBooked },
    { value: "completed", label: tx.statusCompleted },
    { value: "cancelled", label: tx.statusCancelled },
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

  const EMPTY = { clinic_id: "", doctor_id: "", clinic_address_id: "", service_id: "", slot_id: "", date: "", name: "", email: "" };
  const [form, setForm] = useState(EMPTY);

  const assignedAddresses = addresses.filter(a => a.clinic_id);
  const filteredAddresses = form.clinic_id ? assignedAddresses.filter(a => a.clinic_id === form.clinic_id) : assignedAddresses;
  const filteredDoctors   = form.clinic_id ? doctors.filter(d => d.clinic_id === form.clinic_id) : doctors;

  const weekDates = getWeekDates(baseDate);
  const todayStr  = fmtDate(new Date());

  const weekLabel = `${weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${weekDates[6].toLocaleDateString("en-US", { day: "numeric" })}, ${weekDates[0].getFullYear()}`;

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate()-7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate()+7); setBaseDate(d); };

  const getCellAppts = (date, hour) => {
    const dateStr = fmtDate(date);
    return appointments.filter(a => {
      const apptDate = (a.date || a.Date || a.start_time || a.Start_time || "").slice(0,10);
      const apptHour = (a.start_time || a.Start_time || "").slice(11,13) || "";
      return apptDate === dateStr && (apptHour === hour.slice(0,2) || !apptHour);
    });
  };

  const fetchSlots = async (dId, sId, caId, dt) => {
    if (!dId || !sId || !caId || !dt) { setSlots([]); return; }
    setLoadSlots(true);
    try {
      const r = await authFetch(`${API_BASE}/api/schedule/available-slots?doctor_id=${dId}&service_id=${sId}&clinic_address_id=${caId}&date=${dt}`);
      if (r.ok) { const d = await r.json(); const raw = Array.isArray(d) ? d : []; const seen = new Set(); setSlots(raw.filter(sl => { if (seen.has(sl.slot_start)) return false; seen.add(sl.slot_start); return true; })); }
      else setSlots([]);
    } catch(_) { setSlots([]); }
    finally { setLoadSlots(false); }
  };

  const handleFormChange = (field, value) => {
    if (field === "clinic_id") {
      setForm({ ...EMPTY, clinic_id: value });
      setSlots([]);
      setFilteredServices([]);
      if (value) {
        Promise.all([
          authFetch(`${API_BASE}/api/clinics/${value}/services`).then(r => r.ok ? r.json() : []),
          authFetch(`${API_BASE}/api/services`).then(r => r.ok ? r.json() : []),
        ]).then(([clinicD, catD]) => {
          const clinicSvcs = Array.isArray(clinicD) ? clinicD : (Array.isArray(clinicD?.data) ? clinicD.data : []);
          const catalog = Array.isArray(catD) ? catD : (Array.isArray(catD?.data) ? catD.data : []);
          const nameToId = {};
          catalog.forEach(sv => { nameToId[sv.name] = sv.id; });
          setFilteredServices(clinicSvcs.map(sv => ({ ...sv, _catalog_id: nameToId[sv.name] || sv.id })));
        }).catch(() => setFilteredServices([]));
      }
      return;
    }
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (["doctor_id","service_id","clinic_address_id","date"].includes(field)) {
      fetchSlots(updated.doctor_id, updated.service_id, updated.clinic_address_id, updated.date);
      if (field !== "date") setForm(f => ({ ...f, slot_id: "" }));
    }
  };

  const submit = async () => {
    if (!form.doctor_id || !form.clinic_address_id || !form.service_id || !form.slot_id || !form.date || !form.name.trim() || !form.email.trim()) {
      setMsg("err:" + tx.allFieldsRequired); return;
    }
    setSaving(true);
    try {
      const payload = { doctor_id: form.doctor_id, clinic_address_id: form.clinic_address_id, service_id: form.service_id, slot_id: form.slot_id, date: form.date, name: form.name.trim(), email: form.email.trim() };
      const res  = await authFetch(`${API_BASE}/api/appointment`, { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Failed")); return; }
      const slot = slots.find(sl => sl.id === form.slot_id);
      setAppointments(prev => [...prev, {
        ...payload,
        id: data.Appointment_id || data.appointment_id || data.data?.id || String(Date.now()),
        start_time: slot?.slot_start || form.date + "T" + "09:00:00Z",
        end_time:   slot?.slot_end,
        status: "booked",
      }]);
      setMsg("ok:" + tx.appointmentBooked);
      setSlots([]);
      setTimeout(() => { setShowModal(false); setForm(EMPTY); setMsg(""); }, 1200);
    } catch(e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/api/appointment/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (data.success !== "1") return;
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (_) {}
  };

  const getName = (arr, id) => arr.find(x => x.id === id)?.name || "—";

  return (
    <div style={{ paddingTop: 24 }}>
      {/* ── Calendar header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ width: 32, height: 32, border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 16 }} onClick={prevWeek}>‹</button>
            <button style={{ padding: "6px 16px", border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={() => setBaseDate(new Date())}>{tx.today}</button>
            <button style={{ width: 32, height: 32, border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 16 }} onClick={nextWeek}>›</button>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{weekLabel}</span>
        </div>
        <button style={s.addBtn} onClick={() => { setShowModal(true); setForm(EMPTY); setSlots([]); setMsg(""); }}>
          + {tx.addAppointment}
        </button>
      </div>

      {/* ── Weekly calendar grid ── */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", minWidth: 600 }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", borderBottom: `1px solid ${C.border}`, background: "#F8F9FF" }}>
          <div />
          {weekDates.map((d, i) => {
            const isToday = fmtDate(d) === todayStr;
            return (
              <div key={i} style={{ padding: "12px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 4 }}>{(tx.daysShort || ["MON","TUE","WED","THU","FRI","SAT","SUN"])[i]}</div>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: isToday ? C.primary : "transparent", color: isToday ? "#fff" : "#0F172A", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time rows */}
        {HOURS.map(hour => (
          <div key={hour} style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", borderTop: `1px solid #F1F5F9`, minHeight: 64 }}>
            <div style={{ padding: "8px 10px", fontSize: 12, color: "#94A3B8", fontWeight: 500, paddingTop: 6 }}>{hour}</div>
            {weekDates.map((d, di) => {
              const appts = getCellAppts(d, hour);
              return (
                <div key={di} style={{ borderLeft: `1px solid #F1F5F9`, padding: "3px 4px", minHeight: 64 }}>
                  {appts.map(a => (
                    <div key={a.id}
                      style={{ background: STATUS_COLORS[a.status] || C.primary, color: "#fff", borderRadius: 6, padding: "4px 8px", marginBottom: 3, fontSize: 11, cursor: "pointer", position: "relative" }}
                      title={`${getName(doctors, a.doctor_id)} — ${getName(services, a.service_id)}`}
                    >
                      <div style={{ fontWeight: 700 }}>{fmtTime(a.start_time || a.Start_time)}</div>
                      <div style={{ opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getName(doctors, a.doctor_id)}</div>
                      <div style={{ opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getName(services, a.service_id)}</div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditStatusAppt(a); setEditStatus(a.status || ""); setStatusMsg(""); }}
                        style={{ position: "absolute", top: 2, right: 18, background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 10, opacity: 0.85, padding: 0, lineHeight: 1 }}
                      >✎</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if(window.confirm(tx.deleteApptConfirm)) del(a.id); }}
                        style={{ position: "absolute", top: 2, right: 4, background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, opacity: 0.7, padding: 0, lineHeight: 1 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      </div>

      {/* ── New Appointment Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px 20px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{tx.addAppointment}</span>
              <button style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted }} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={{ padding: "24px 28px 28px" }}>

              <FG label={tx.colClinic}>
                <Sel value={form.clinic_id} onChange={(e) => handleFormChange("clinic_id", e.target.value)}>
                  <option value="">{tx.selectClinic}</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Sel>
              </FG>

              <FG label={tx.selectDoctor}>
                <Sel value={form.doctor_id} onChange={(e) => handleFormChange("doctor_id", e.target.value)}>
                  <option value="">{tx.selectDoctor}</option>
                  {filteredDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Sel>
              </FG>

              <FG label={tx.clinicAddressLabel}>
                {filteredAddresses.length === 0
                  ? <p style={{ fontSize: 13, color: "#F59E0B" }}>{form.clinic_id ? tx.noAddressForClinic : tx.selectClinicFirst}</p>
                  : <Sel value={form.clinic_address_id} onChange={(e) => handleFormChange("clinic_address_id", e.target.value)}>
                      <option value="">{tx.selectAddress}</option>
                      {filteredAddresses.map(a => (
                        <option key={a.id} value={a.id}>
                          {[a.address_name, a.address_building].filter(Boolean).join(", ") || a.id.slice(0, 8)}
                        </option>
                      ))}
                    </Sel>
                }
              </FG>

              <FG label={tx.selectService}>
                <Sel value={form.service_id} onChange={(e) => handleFormChange("service_id", e.target.value)}>
                  <option value="">{tx.selectService}</option>
                  {filteredServices.map(sv => <option key={sv.id} value={sv._catalog_id || sv.id}>{sv.name} ({sv.duration} min)</option>)}
                </Sel>
              </FG>

              <FG label={tx.selectDate}>
                <Input name="date" type="date" value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleFormChange("date", e.target.value)} />
              </FG>

              <FG label={tx.timeSlotLabel}>
                {loadSlots
                  ? <p style={{ fontSize: 13, color: C.muted }}>{tx.loadingSlots}</p>
                  : !form.doctor_id || !form.clinic_address_id || !form.service_id || !form.date
                  ? <p style={{ fontSize: 13, color: C.muted }}>{tx.fillFieldsForSlots}</p>
                  : slots.length === 0
                  ? <p style={{ fontSize: 13, color: "#F59E0B" }}>{tx.noSlotsForDate}</p>
                  : <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {slots.map(sl => (
                        <button key={sl.id}
                          style={{ padding: "9px 0", border: `2px solid ${form.slot_id === sl.id ? C.primary : C.border}`, borderRadius: 8, background: form.slot_id === sl.id ? C.primary : "#fff", color: form.slot_id === sl.id ? "#fff" : C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                          onClick={() => setForm(f => ({ ...f, slot_id: sl.id }))}>
                          {fmtTime(sl.slot_start)}
                        </button>
                      ))}
                    </div>
                }
              </FG>

              <FG label={tx.patientName}>
                <Input name="name" value={form.name} placeholder={tx.fullNamePh}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </FG>

              <FG label={tx.emailLabel}>
                <Input name="email" type="email" value={form.email} placeholder={tx.patientEmailPh}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </FG>

              <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
                {saving ? tx.booking : tx.addAppointment}
              </button>
              {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Status Modal ── */}
      {editStatusAppt && (
        <Modal title={tx.editApptStatus} onClose={() => { setEditStatusAppt(null); setStatusMsg(""); }}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            {getName(doctors, editStatusAppt.doctor_id)} — {getName(services, editStatusAppt.service_id)}<br/>
            {editStatusAppt.start_time?.slice(0,16).replace("T"," ")}
          </p>
          <FG label={tx.colStatus}>
            <Sel value={editStatus} onChange={e => setEditStatus(e.target.value)}>
              <option value="">{tx.selectStatus}</option>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Sel>
          </FG>
          <button style={s.submitBtn} onClick={updateStatus}>{tx.invSaveChanges}</button>
          {statusMsg && <p style={statusMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{statusMsg.startsWith("ok:") ? tx.statusUpdated : statusMsg.slice(3)}</p>}
        </Modal>
      )}
    </div>
  );
}

// REVIEWS TAB
function ReviewsTab({ appointments, doctors, tx }) {
  const reviews = appointments.filter(a => a.is_reviewed);

  const getDoctor = (id) => doctors.find(d => (d.id || d.Id) === id)?.name || "—";

  const Stars = ({ n }) => (
    <span style={{ color: n > 0 ? "#F59E0B" : "#D1D5DB", letterSpacing: 1 }}>
      {"★".repeat(n) + "☆".repeat(5 - n)}
    </span>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>{tx.manageReviews}</h2>
        <span style={{ fontSize: 13, color: "#6B7280" }}>{reviews.length} {tx.reviewsCount}</span>
      </div>

      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280", fontSize: 14 }}>{tx.noReviews}</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }} cellSpacing={0}>
            <thead>
              <tr style={{ background: "#F8F9FF" }}>
                {[tx.colPatient, tx.colDoctor, tx.colDoctorRating, tx.colClinicRating, tx.colClinicComment, tx.colDate].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 12, color: "#6B7280", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((a, i) => (
                <tr key={a.id || i} style={{ borderBottom: "1px solid #F1F5F9" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F8FAFF"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>{a.name || a.Name || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>{getDoctor(a.doctor_id || a.Doctor_id)}</td>
                  <td style={{ padding: "12px 14px" }}><Stars n={a.doctor_rating || 0} /></td>
                  <td style={{ padding: "12px 14px" }}><Stars n={a.clinic_rating || 0} /></td>
                  <td style={{ padding: "12px 14px", color: "#6B7280", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.clinic_comment || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {(a.start_time || a.Start_time || "").slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// SCHEDULE TAB
function ScheduleTab({ doctors, addresses, tx }) {
  const DAY_NAMES = tx.dayNames || ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [schedules,    setSchedules]   = useState([]);
  const [loadingDoc,   setLoadingDoc]  = useState(false);
  const [selectedDoc,  setSelectedDoc] = useState("");
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showGenModal,   setShowGenModal]   = useState(false);
  const [saving,       setSaving]      = useState(false);
  const [msg,          setMsg]         = useState("");
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editForm,     setEditForm]    = useState({ start_time: "09:00", end_time: "18:00" });

  const EMPTY_WH = { clinic_address_id: "", day_of_week: "1", start_time: "09:00", end_time: "18:00" };
  const [whForm, setWhForm] = useState(EMPTY_WH);

  const EMPTY_GEN = { from_date: "", to_date: "" };
  const [genForm, setGenForm] = useState(EMPTY_GEN);

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

  const handleDocChange = (id) => { setSelectedDoc(id); loadSchedule(id); };

  const submitWorkingHours = async () => {
    if (!selectedDoc || !whForm.clinic_address_id || !whForm.start_time || !whForm.end_time) {
      setMsg("err:All fields are required."); return;
    }
    setSaving(true);
    try {
      const payload = {
        clinic_address_id: whForm.clinic_address_id,
        day_of_week: parseInt(whForm.day_of_week),
        start_time: whForm.start_time,
        end_time: whForm.end_time,
      };
      const res = await authFetch(`${API_BASE}/api/schedule/doctors/${selectedDoc}/working-hours`, {
        method: "POST", body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:Working hours added!");
      setShowHoursModal(false);
      setWhForm(EMPTY_WH);
      loadSchedule(selectedDoc);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const submitGenerate = async () => {
    if (!genForm.from_date || !genForm.to_date) { setMsg("err:Both dates are required."); return; }
    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/api/schedule/generate`, {
        method: "POST", body: JSON.stringify({ from_date: genForm.from_date, to_date: genForm.to_date }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:Slots generated successfully!");
      setShowGenModal(false);
      setGenForm(EMPTY_GEN);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (sc) => {
    setEditingSchedule(sc);
    setEditForm({
      start_time: (sc.Start_time || sc.start_time || "09:00").slice(0, 5),
      end_time: (sc.End_time || sc.end_time || "18:00").slice(0, 5),
    });
    setMsg("");
  };

  const submitEdit = async () => {
    if (!editForm.start_time || !editForm.end_time) { setMsg("err:Both times are required."); return; }
    const id = editingSchedule.Id || editingSchedule.id;
    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/api/schedule/working-hours/${id}`, {
        method: "PUT", body: JSON.stringify({ start_time: editForm.start_time, end_time: editForm.end_time }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:Working hours updated!");
      setEditingSchedule(null);
      loadSchedule(selectedDoc);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (sc) => {
    if (!window.confirm(tx.deleteWorkHoursConfirm)) return;
    const id = sc.Id || sc.id;
    try {
      const res = await authFetch(`${API_BASE}/api/schedule/working-hours/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg("err:" + (d.message || "Failed")); return; }
      setMsg("ok:Deleted!");
      loadSchedule(selectedDoc);
    } catch (e) { setMsg("err:" + e.message); }
  };

  const getAddrLabel = (id) => {
    const a = addresses.find(x => x.id === id);
    if (!a) return id?.slice(0, 8) || "—";
    return [a.address_name, a.address_building].filter(Boolean).join(", ") || id?.slice(0, 8);
  };

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <span style={s.sectionTitle}>{tx.scheduleTitle}</span>
        <button style={{ ...s.addBtn, background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` }} onClick={() => { setShowGenModal(true); setMsg(""); }}>
          {tx.generateSlots}
        </button>
      </div>

      {msg && (
        <p style={msg.startsWith("ok:") ? { ...s.msgOk, textAlign: "left", marginBottom: 16 } : { ...s.msgErr, textAlign: "left", marginBottom: 16 }}>
          {msg.slice(3)}
        </p>
      )}

      {/* Doctor selector */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 28px", marginBottom: 20 }}>
        <FG label={tx.selectDoctorLabel}>
          <Sel value={selectedDoc} onChange={(e) => handleDocChange(e.target.value)}>
            <option value="">{tx.chooseDoctor}</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Sel>
        </FG>

        {selectedDoc && schedules.length < 7 && (
          <button style={s.addBtn} onClick={() => {
            const usedDays = new Set(schedules.map(sc => String(sc.Day_of_week ?? sc.day_of_week)));
            const firstFree = ["1","2","3","4","5","6","0"].find(d => !usedDays.has(d)) || "1";
            setWhForm({ ...EMPTY_WH, day_of_week: firstFree });
            setShowHoursModal(true);
            setMsg("");
          }}>
            + {tx.addWorkingHours}
          </button>
        )}
      </div>

      {/* Working hours table */}
      {selectedDoc && (
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {loadingDoc
            ? <p style={{ padding: 24, color: C.muted, fontSize: 14 }}>{tx.invLoading}</p>
            : schedules.length === 0
            ? <p style={{ padding: 24, color: C.muted, fontSize: 14 }}>{tx.noWorkingHours}</p>
            : (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={s.table} cellSpacing={0}>
                <thead>
                  <tr style={{ background: "#F8F9FF" }}>
                    {[tx.colDay, tx.colAddress, tx.colStart, tx.colEnd, ""].map(h => (
                      <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((sc, i) => (
                    <tr key={sc.Id || sc.id || i} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: "14px 18px", fontSize: 14 }}>{DAY_NAMES[sc.Day_of_week ?? sc.day_of_week] || sc.Day_of_week}</td>
                      <td style={{ padding: "14px 18px", fontSize: 14 }}>{getAddrLabel(sc.Clinic_address_id || sc.clinic_address_id)}</td>
                      <td style={{ padding: "14px 18px", fontSize: 14 }}>{(sc.Start_time || sc.start_time || "").slice(0, 5)}</td>
                      <td style={{ padding: "14px 18px", fontSize: 14 }}>{(sc.End_time || sc.end_time || "").slice(0, 5)}</td>
                      <td style={{ padding: "10px 18px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleEdit(sc)}
                            style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, background: C.primaryLight, color: C.primary, border: `1px solid ${C.primary}`, borderRadius: 7, cursor: "pointer" }}
                          >{tx.invEdit}</button>
                          <button
                            onClick={() => handleDelete(sc)}
                            style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 7, cursor: "pointer" }}
                          >{tx.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )
          }
        </div>
      )}

      {/* Add Working Hours Modal */}
      {showHoursModal && (
        <Modal title={tx.addWorkingHours} onClose={() => setShowHoursModal(false)}>
          <FG label={tx.clinicAddressLabel}>
            <Sel value={whForm.clinic_address_id} onChange={(e) => setWhForm(f => ({ ...f, clinic_address_id: e.target.value }))}>
              <option value="">{tx.selectAddress}</option>
              {addresses.map(a => (
                <option key={a.id} value={a.id}>
                  {[a.address_name, a.address_building].filter(Boolean).join(", ") || a.id}
                </option>
              ))}
            </Sel>
          </FG>
          <FG label={tx.dayOfWeekLabel}>
            <Sel value={whForm.day_of_week} onChange={(e) => setWhForm(f => ({ ...f, day_of_week: e.target.value }))}>
              {[
                { value: "1", label: DAY_NAMES[1] },
                { value: "2", label: DAY_NAMES[2] },
                { value: "3", label: DAY_NAMES[3] },
                { value: "4", label: DAY_NAMES[4] },
                { value: "5", label: DAY_NAMES[5] },
                { value: "6", label: DAY_NAMES[6] },
                { value: "0", label: DAY_NAMES[0] },
              ].filter(d => !schedules.some(sc => String(sc.Day_of_week ?? sc.day_of_week) === d.value))
               .map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </Sel>
          </FG>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.startTimeLabel}>
              <Input name="start_time" type="time" value={whForm.start_time}
                onChange={(e) => setWhForm(f => ({ ...f, start_time: e.target.value }))} />
            </FG>
            <FG label={tx.endTimeLabel}>
              <Input name="end_time" type="time" value={whForm.end_time}
                onChange={(e) => setWhForm(f => ({ ...f, end_time: e.target.value }))} />
            </FG>
          </div>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submitWorkingHours} disabled={saving}>
            {saving ? tx.invSaving : tx.saveWorkingHours}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}

      {/* Edit Working Hours Modal */}
      {editingSchedule && (
        <Modal title={tx.editWorkingHours} onClose={() => setEditingSchedule(null)}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            {DAY_NAMES[editingSchedule.Day_of_week ?? editingSchedule.day_of_week]} — {getAddrLabel(editingSchedule.Clinic_address_id || editingSchedule.clinic_address_id)}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.startTimeLabel}>
              <Input name="start_time" type="time" value={editForm.start_time}
                onChange={(e) => setEditForm(f => ({ ...f, start_time: e.target.value }))} />
            </FG>
            <FG label={tx.endTimeLabel}>
              <Input name="end_time" type="time" value={editForm.end_time}
                onChange={(e) => setEditForm(f => ({ ...f, end_time: e.target.value }))} />
            </FG>
          </div>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submitEdit} disabled={saving}>
            {saving ? tx.invSaving : tx.invSaveChanges}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}

      {/* Generate Slots Modal */}
      {showGenModal && (
        <Modal title={tx.generateSlotsTitle} onClose={() => setShowGenModal(false)}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
            {tx.generateSlotsDesc}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.fromDate}>
              <Input name="from_date" type="date" value={genForm.from_date}
                onChange={(e) => setGenForm(f => ({ ...f, from_date: e.target.value }))} />
            </FG>
            <FG label={tx.toDate}>
              <Input name="to_date" type="date" value={genForm.to_date}
                onChange={(e) => setGenForm(f => ({ ...f, to_date: e.target.value }))} />
            </FG>
          </div>
          <button style={{ ...s.submitBtn, background: "#10b981", opacity: saving ? 0.7 : 1 }} onClick={submitGenerate} disabled={saving}>
            {saving ? tx.generating : tx.generateSlots}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}
    </div>
  );
}

// PRODUCTS SUB-TAB
function ProductsSubTab({ products, setProducts, loading, tx }) {
  const EMPTY = { name: "", unit: "piece" };
  const [form, setForm]     = useState(EMPTY);
  const [msg,  setMsg]      = useState("");
  const [open, setOpen]     = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg,  setEditMsg]  = useState("");
  const [saving, setSaving]     = useState(false);

  const UNITS = ["piece","ml","mg","box","pack","bottle","tablet","vial"];

  const submit = async () => {
    if (!form.name) { setMsg("err:" + tx.invNameRequired); return; }
    setSaving(true);
    try {
      const res  = await authFetch(`${API_BASE}/api/products`, { method: "POST", body: JSON.stringify({ name: form.name, unit: form.unit }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Failed")); return; }
      const id = data.id || data.Id || data.product_id || String(Date.now());
      setProducts(prev => [...prev, { id, name: form.name, unit: form.unit }]);
      setMsg("ok:" + tx.invProductAdded);
      setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); }, 1200);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const updateProd = async () => {
    if (!editProd) return;
    setSaving(true);
    try {
      const res  = await authFetch(`${API_BASE}/api/products/${editProd.id}`, { method: "PUT", body: JSON.stringify({ name: editForm.name, unit: editForm.unit }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setEditMsg("err:" + (data.message || "Failed")); return; }
      setProducts(prev => prev.map(p => p.id === editProd.id ? { ...p, ...editForm } : p));
      setEditMsg("ok:" + tx.invUpdated);
      setTimeout(() => { setEditProd(null); setEditMsg(""); }, 1000);
    } catch (e) { setEditMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      await authFetch(`${API_BASE}/api/products/${id}`, { method: "DELETE" });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (_) {}
  };

  if (loading) return <p style={{ color: C.muted, padding: "24px 0" }}>{tx.invLoadingProducts}</p>;

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.invProducts}</span>
        <button style={s.addBtn} onClick={() => setOpen(true)}>{tx.invAddProduct}</button>
      </div>

      {products.length === 0 ? (
        <Empty icon="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" text={tx.invNoProducts} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={s.table} cellSpacing={0}>
            <thead style={s.thead}><tr>
              <th style={s.th}>{tx.colName}</th><th style={s.th}>{tx.invUnit}</th><th style={s.th}>{tx.colActions}</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={s.td}><b>{p.name}</b></td>
                  <td style={s.td}><span style={s.badge()}>{p.unit || "—"}</span></td>
                  <td style={s.td}>
                    <button style={s.editBtn} onClick={() => { setEditProd(p); setEditForm({ name: p.name, unit: p.unit || "piece" }); setEditMsg(""); }}>{tx.invEdit}</button>
                    <button style={s.deleteBtn} onClick={() => del(p.id)}>{tx.delete}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editProd && (
        <Modal title={tx.invEditProduct} onClose={() => setEditProd(null)}>
          <FG label={tx.colName}><Input value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></FG>
          <FG label={tx.invUnit}>
            <Sel value={editForm.unit || "piece"} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </Sel>
          </FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={updateProd} disabled={saving}>{tx.invSaveChanges}</button>
          {editMsg && <p style={editMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{editMsg.slice(3)}</p>}
        </Modal>
      )}

      {open && (
        <Modal title={tx.invAddProductModal} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <FG label={tx.invProductName}><Input name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={tx.productNamePh} /></FG>
          <FG label={tx.invUnit}>
            <Sel name="unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </Sel>
          </FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
            {saving ? tx.adding : tx.invAddProductModal}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}
    </>
  );
}

// STOCK SUB-TAB
function StockSubTab({ addresses, clinics, products, tx }) {
  const [selectedAddr, setSelectedAddr] = useState("");
  const [inventory,    setInventory]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [open,         setOpen]         = useState(false);
  const [editInv,      setEditInv]      = useState(null);
  const [addForm,      setAddForm]      = useState({ product_id: "", quantity: "" });
  const [editQty,      setEditQty]      = useState("");
  const [msg,          setMsg]          = useState("");
  const [saving,       setSaving]       = useState(false);

  const loadInventory = async (addrId) => {
    if (!addrId) { setInventory([]); return; }
    setLoading(true);
    try {
      const r = await authFetch(`${API_BASE}/api/clinic-addresses/${addrId}/inventory`);
      if (r.ok) { const d = await r.json(); setInventory(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : [])); }
      else setInventory([]);
    } catch (_) { setInventory([]); }
    finally { setLoading(false); }
  };

  const handleAddrChange = (id) => { setSelectedAddr(id); loadInventory(id); setMsg(""); };

  const addStock = async () => {
    if (!addForm.product_id || !addForm.quantity) { setMsg("err:" + tx.invAllFields); return; }
    setSaving(true);
    try {
      const res  = await authFetch(`${API_BASE}/api/clinic-addresses/${selectedAddr}/inventory`, {
        method: "POST", body: JSON.stringify({ product_id: addForm.product_id, quantity: parseInt(addForm.quantity) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Failed")); return; }
      setMsg("ok:" + tx.invStockAdded);
      setOpen(false);
      setAddForm({ product_id: "", quantity: "" });
      loadInventory(selectedAddr);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const updateStock = async () => {
    if (!editInv || editQty === "") return;
    setSaving(true);
    try {
      const invId = editInv.id || editInv.Id;
      const res   = await authFetch(`${API_BASE}/api/clinic-addresses/${selectedAddr}/inventory/${invId}`, {
        method: "PUT", body: JSON.stringify({ quantity: parseInt(editQty) }),
      });
      const data  = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || "Failed")); return; }
      setMsg("ok:" + tx.invUpdated);
      setEditInv(null);
      loadInventory(selectedAddr);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const getProd   = (id) => products.find(p => p.id === id);
  const getAddrLabel = (a) => [a.address_name, a.address_building].filter(Boolean).join(", ") || [a.street, a.building, a.city].filter(Boolean).join(", ") || a.id?.slice(0, 8);
  const getClinicName = (a) => clinics.find(c => c.id === a.clinic_id)?.name || "";

  return (
    <div>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.invStock}</span>
        {selectedAddr && <button style={s.addBtn} onClick={() => { setOpen(true); setMsg(""); }}>{tx.invAddStock}</button>}
      </div>

      {msg && <p style={{ ...(msg.startsWith("ok:") ? s.msgOk : s.msgErr), textAlign: "left", marginBottom: 16 }}>{msg.slice(3)}</p>}

      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <FG label={tx.invSelectAddr}>
          <Sel value={selectedAddr} onChange={e => handleAddrChange(e.target.value)}>
            <option value="">{tx.invChooseAddr}</option>
            {addresses.map(a => (
              <option key={a.id} value={a.id}>
                {getClinicName(a) ? `${getClinicName(a)} — ` : ""}{getAddrLabel(a)}
              </option>
            ))}
          </Sel>
        </FG>
      </div>

      {selectedAddr && (
        loading ? <p style={{ color: C.muted, padding: "16px 0" }}>{tx.invLoading}</p> :
        inventory.length === 0 ? (
          <Empty icon="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" text={tx.invNoStock} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table} cellSpacing={0}>
              <thead style={s.thead}><tr>
                <th style={s.th}>{tx.invProduct}</th><th style={s.th}>{tx.invUnit}</th><th style={s.th}>{tx.invQty}</th><th style={s.th}>{tx.colActions}</th>
              </tr></thead>
              <tbody>
                {inventory.map((item, i) => {
                  const pid  = item.product_id || item.ProductId || item.product?.id;
                  const prod = getProd(pid);
                  return (
                    <tr key={item.id || item.Id || i}>
                      <td style={s.td}><b>{prod?.name || pid?.slice(0, 8) || "—"}</b></td>
                      <td style={s.td}>{prod?.unit || "—"}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge(), background: "#EFF6FF", color: "#1D4ED8" }}>
                          {item.quantity ?? item.Quantity ?? "—"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button style={s.editBtn} onClick={() => { setEditInv(item); setEditQty(String(item.quantity ?? item.Quantity ?? "")); setMsg(""); }}>{tx.invEdit}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {editInv && (
        <Modal title={tx.invUpdateStock} onClose={() => setEditInv(null)}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            {getProd(editInv.product_id || editInv.ProductId)?.name || tx.invProduct}
          </p>
          <FG label={tx.invNewQty}>
            <Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} placeholder={tx.quantityPh} />
          </FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={updateStock} disabled={saving}>
            {saving ? tx.invSaving : tx.invSaveQty}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
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
          <FG label={tx.invQtyToAdd}>
9
          </FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={addStock} disabled={saving}>
            {saving ? tx.adding : tx.invAddStockModal}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}
    </div>
  );
}

// MATERIALS SUB-TAB
function MaterialsSubTab({ clinics, products, tx }) {
  const [selectedClinic,  setSelectedClinic]  = useState("");
  const [clinicServices,  setClinicServices]  = useState([]);
  const [loadingSvcs,     setLoadingSvcs]     = useState(false);
  const [selectedSvc,     setSelectedSvc]     = useState("");
  const [materials,       setMaterials]       = useState([]);
  const [loadingMats,     setLoadingMats]     = useState(false);
  const [open,            setOpen]            = useState(false);
  const [form,            setForm]            = useState({ product_id: "", quantity_required: "" });
  const [msg,             setMsg]             = useState("");
  const [saving,          setSaving]          = useState(false);

  const handleClinicChange = async (clinicId) => {
    setSelectedClinic(clinicId);
    setSelectedSvc("");
    setMaterials([]);
    setClinicServices([]);
    setMsg("");
    if (!clinicId) return;
    setLoadingSvcs(true);
    try {
      const r = await authFetch(`${API_BASE}/api/clinics/${clinicId}/services`);
      if (r.ok) {
        const d = await r.json();
        setClinicServices(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []));
      }
    } catch (_) {}
    finally { setLoadingSvcs(false); }
  };

  const loadMaterials = async (svcId) => {
    if (!svcId) { setMaterials([]); return; }
    setLoadingMats(true);
    try {
      const r = await authFetch(`${API_BASE}/api/clinic-services/${svcId}/materials`);
      const raw = await r.text();
      const d = (() => { try { return JSON.parse(raw); } catch(_) { return null; } })();
      if (r.ok && d !== null) {
        const list = Array.isArray(d) ? d
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d?.materials) ? d.materials
          : d && typeof d === "object" && !Array.isArray(d) ? [d]
          : [];
        setMaterials(list);
      } else setMaterials([]);
    } catch (_) { setMaterials([]); }
    finally { setLoadingMats(false); }
  };

  const handleSvcChange = (id) => { setSelectedSvc(id); loadMaterials(id); setMsg(""); };

  const addMaterial = async () => {
    if (!form.product_id || !form.quantity_required) { setMsg("err:" + tx.invAllFields); return; }
    setSaving(true);
    try {
      const res  = await authFetch(`${API_BASE}/api/clinic-services/${selectedSvc}/materials`, {
        method: "POST", body: JSON.stringify({ product_id: form.product_id, quantity_required: parseInt(form.quantity_required) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Failed")); return; }
      setMsg("ok:" + tx.invMaterialAssigned);
      setOpen(false);
      setForm({ product_id: "", quantity_required: "" });
      loadMaterials(selectedSvc);
    } catch (e) { setMsg("err:" + e.message); }
    finally { setSaving(false); }
  };

  const delMaterial = async (matId) => {
    if (!window.confirm(tx.invRemoveConfirm)) return;
    try {
      await authFetch(`${API_BASE}/api/clinic-services/${selectedSvc}/materials/${matId}`, { method: "DELETE" });
      setMaterials(prev => prev.filter(m => (m.id || m.Id) !== matId));
    } catch (_) {}
  };

  const getProd = (id) => products.find(p => p.id === id);

  return (
    <div>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.invMaterials}</span>
        {selectedSvc && <button style={s.addBtn} onClick={() => { setOpen(true); setMsg(""); }}>{tx.invAssignMaterial}</button>}
      </div>

      {msg && <p style={{ ...(msg.startsWith("ok:") ? s.msgOk : s.msgErr), textAlign: "left", marginBottom: 16 }}>{msg.slice(3)}</p>}

      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <FG label={tx.colClinic}>
          <Sel value={selectedClinic} onChange={e => handleClinicChange(e.target.value)}>
            <option value="">{tx.invChooseClinic}</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Sel>
        </FG>
        {selectedClinic && (
          <FG label={tx.invService}>
            {loadingSvcs
              ? <p style={{ fontSize: 13, color: C.muted }}>{tx.invLoading}</p>
              : <Sel value={selectedSvc} onChange={e => handleSvcChange(e.target.value)}>
                  <option value="">{tx.invChooseService}</option>
                  {clinicServices.map(sv => (
                    <option key={sv.id} value={sv.id}>
                      {sv.name || sv.Name || sv.service_name || sv.ServiceName || sv.title || `Service ${sv.id}`}
                    </option>
                  ))}
                </Sel>
            }
          </FG>
        )}
      </div>

      {selectedSvc && (
        loadingMats ? <p style={{ color: C.muted, padding: "16px 0" }}>{tx.invLoading}</p> :
        materials.length === 0 ? (
          <Empty icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" text={tx.invNoMaterials} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table} cellSpacing={0}>
              <thead style={s.thead}><tr>
                <th style={s.th}>{tx.invProduct}</th><th style={s.th}>{tx.invPerAppt}</th><th style={s.th}>{tx.colActions}</th>
              </tr></thead>
              <tbody>
                {materials.map((m, i) => {
                  const pid  = m.product_id || m.ProductId;
                  const prod = getProd(pid);
                  return (
                    <tr key={m.id || m.Id || i}>
                      <td style={s.td}><b>{prod?.name || pid?.slice(0, 8) || "—"}</b></td>
                      <td style={s.td}>
                        <span style={{ ...s.badge(), background: "#F0FDF4", color: "#16A34A" }}>
                          {m.quantity_required ?? m.QuantityRequired ?? "—"} {prod?.unit || ""}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button style={s.deleteBtn} onClick={() => delMaterial(m.id || m.Id)}>{tx.invRemove}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {open && (
        <Modal title={tx.invAssignMaterialModal} onClose={() => { setOpen(false); setForm({ product_id: "", quantity_required: "" }); setMsg(""); }}>
          <FG label={tx.invProduct}>
            <Sel value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
              <option value="">— {tx.invProduct} —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
            </Sel>
          </FG>
          <FG label={tx.invQtyPerAppt}>
            <Input type="number" value={form.quantity_required} onChange={e => setForm(f => ({ ...f, quantity_required: e.target.value }))} placeholder={tx.quantityPerApptPh} />
          </FG>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={addMaterial} disabled={saving}>
            {saving ? tx.invSaving : tx.invAssignBtn}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}
    </div>
  );
}

// INVENTORY TAB
function InventoryTab({ addresses, services, clinics, tx }) {
  const [subTab, setSubTab] = useState("products");
  const [products, setProducts]   = useState([]);
  const [loadingProducts, setLP]  = useState(true);

  useEffect(() => {
    setLP(true);
    authFetch(`${API_BASE}/api/products`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setProducts(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : [])))
      .catch(() => {})
      .finally(() => setLP(false));
  }, []);

  const SUB_TABS = [
    { key: "products",  label: tx.invProducts, icon: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" },
    { key: "stock",     label: tx.invStock,    icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
    { key: "materials", label: tx.invMaterials, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginTop: 28, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
        {SUB_TABS.map(st => (
          <button
            key={st.key}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", fontSize: 14,
              fontWeight: subTab === st.key ? 700 : 500,
              color: subTab === st.key ? C.primary : C.muted,
              borderBottom: subTab === st.key ? `2px solid ${C.primary}` : "2px solid transparent",
              background: "none", border: "none",
              cursor: "pointer", marginBottom: -1,
            }}
            onClick={() => setSubTab(st.key)}
          >
            <Icon d={st.icon} size={14} />
            {st.label}
          </button>
        ))}
      </div>

      {subTab === "products"  && <ProductsSubTab products={products} setProducts={setProducts} loading={loadingProducts} tx={tx} />}
      {subTab === "stock"     && <StockSubTab    addresses={addresses} clinics={clinics} products={products} tx={tx} />}
      {subTab === "materials" && <MaterialsSubTab clinics={clinics} products={products} tx={tx} />}
    </div>
  );
}

// REPORTS TAB
function ReportsTab({ clinics, addresses, tx }) {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + "01";

  const [subTab,     setSubTab]     = useState("appointments");
  const [clinicId,   setClinicId]   = useState("");
  const [addressId,  setAddressId]  = useState("");
  const [from,       setFrom]       = useState(firstOfMonth);
  const [to,         setTo]         = useState(today);
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const clinicAddresses = addresses.filter(a => a.clinic_id === clinicId);

  const SUB_TABS = [
    { key: "appointments", label: tx.tabs.appointments, icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
    { key: "revenue",      label: tx.repRevenue,        icon: "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4l3 3" },
    { key: "doctors",      label: tx.tabs.doctors,      icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
    { key: "inventory",    label: tx.tabs.inventory,    icon: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" },
  ];

  const runReport = async () => {
    if (!clinicId) { setError(tx.repNoClinic); return; }
    if (!from || !to) { setError(tx.repNoDate); return; }
    setError(""); setData(null); setLoading(true);
    try {
      let url = `${API_BASE}/api/clinics/${clinicId}/reports/${subTab}?from=${from}&to=${to}`;
      if (addressId) url += `&clinic_address_id=${addressId}`;
      const r = await authFetch(url);
      const json = await r.json();
      if (!r.ok) { setError(json.error || "Request failed."); return; }
      const rows = Array.isArray(json.data) ? json.data : [];
      setData(rows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (fmt) => {
    if (!clinicId) return;
    let url = `${API_BASE}/api/clinics/${clinicId}/reports/${subTab}?from=${from}&to=${to}&format=${fmt}`;
    if (addressId) url += `&clinic_address_id=${addressId}`;
    const r = await authFetch(url);
    const blob = await r.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `report_${subTab}_${from}_${to}.${fmt}`;
    a.click();
  };

  const colStyle = { padding: "10px 14px", fontSize: 13, textAlign: "left", borderBottom: `1px solid ${C.border}` };
  const thStyle  = { ...colStyle, fontWeight: 700, color: C.muted, background: "#F8F9FF", fontSize: 12 };

  function renderTable() {
    if (!data || data.length === 0) return <Empty icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" text={tx.repNoData} />;

    if (subTab === "appointments") return (
      <table style={s.table} cellSpacing={0}><thead><tr>
        <th style={thStyle}>{tx.repStatus}</th><th style={thStyle}>{tx.repCount}</th>
      </tr></thead><tbody>
        {data.map((row, i) => <tr key={i}>
          <td style={colStyle}><span style={{ background: row.status === "completed" ? "#d1fae5" : row.status === "cancelled" ? "#fee2e2" : "#fef9c3", color: row.status === "completed" ? "#065f46" : row.status === "cancelled" ? "#991b1b" : "#92400e", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{row.status}</span></td>
          <td style={colStyle}>{row.appointment_count}</td>
        </tr>)}
      </tbody></table>
    );

    if (subTab === "revenue") return (
      <table style={s.table} cellSpacing={0}><thead><tr>
        <th style={thStyle}>{tx.invService}</th><th style={thStyle}>{tx.tabs.appointments}</th><th style={thStyle}>{tx.repUnitPrice}</th><th style={thStyle}>{tx.repTotalRevenue}</th>
      </tr></thead><tbody>
        {data.map((row, i) => <tr key={i}>
          <td style={colStyle}>{row.service_name}</td>
          <td style={colStyle}>{row.appointment_count}</td>
          <td style={colStyle}>{Number(row.unit_price).toLocaleString()}</td>
          <td style={{ ...colStyle, fontWeight: 700, color: C.primary }}>{Number(row.total_revenue).toLocaleString()}</td>
        </tr>)}
        <tr style={{ background: "#F8F9FF" }}>
          <td style={{ ...colStyle, fontWeight: 700 }} colSpan={3}>{tx.repTotal}</td>
          <td style={{ ...colStyle, fontWeight: 700, color: C.primary }}>{data.reduce((s, r) => s + Number(r.total_revenue), 0).toLocaleString()}</td>
        </tr>
      </tbody></table>
    );

    if (subTab === "doctors") return (
      <table style={s.table} cellSpacing={0}><thead><tr>
        <th style={thStyle}>{tx.colDoctor}</th><th style={thStyle}>{tx.colSpec}</th><th style={thStyle}>{tx.tabs.appointments}</th><th style={thStyle}>{tx.repCompleted}</th><th style={thStyle}>{tx.repRevenue}</th><th style={thStyle}>{tx.repAvgRating}</th>
      </tr></thead><tbody>
        {data.map((row, i) => <tr key={i}>
          <td style={colStyle}>{row.doctor_name}</td>
          <td style={colStyle}>{row.specialization}</td>
          <td style={colStyle}>{row.appointment_count}</td>
          <td style={colStyle}>{row.completed_count}</td>
          <td style={{ ...colStyle, color: C.primary, fontWeight: 600 }}>{Number(row.revenue).toLocaleString()}</td>
          <td style={colStyle}>{row.average_rating > 0 ? `⭐ ${Number(row.average_rating).toFixed(1)}` : "—"}</td>
        </tr>)}
      </tbody></table>
    );

    if (subTab === "inventory") return (
      <table style={s.table} cellSpacing={0}><thead><tr>
        <th style={thStyle}>{tx.invProduct}</th><th style={thStyle}>{tx.invUnit}</th><th style={thStyle}>{tx.repInStock}</th><th style={thStyle}>{tx.repRestocked}</th><th style={thStyle}>{tx.repUsed}</th><th style={thStyle}>{tx.repAdjusted}</th>
      </tr></thead><tbody>
        {data.map((row, i) => <tr key={i}>
          <td style={colStyle}>{row.product_name}</td>
          <td style={colStyle}>{row.unit}</td>
          <td style={{ ...colStyle, fontWeight: 600 }}>{row.current_quantity}</td>
          <td style={{ ...colStyle, color: "#16a34a" }}>{row.restocked_quantity > 0 ? `+${row.restocked_quantity}` : "—"}</td>
          <td style={{ ...colStyle, color: row.used_quantity > 0 ? "#dc2626" : C.muted }}>{row.used_quantity > 0 ? `-${row.used_quantity}` : "—"}</td>
          <td style={colStyle}>{row.adjustment_quantity !== 0 ? row.adjustment_quantity : "—"}</td>
        </tr>)}
      </tbody></table>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginTop: 28, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
        {SUB_TABS.map(st => (
          <button key={st.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 14, fontWeight: subTab === st.key ? 700 : 500, color: subTab === st.key ? C.primary : C.muted, borderBottom: subTab === st.key ? `2px solid ${C.primary}` : "2px solid transparent", background: "none", border: "none", cursor: "pointer", marginBottom: -1 }}
            onClick={() => { setSubTab(st.key); setData(null); setError(""); }}>
            <Icon d={st.icon} size={14} />{st.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 24px", marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{tx.colClinic}</label>
          <select style={s.select} value={clinicId} onChange={e => { setClinicId(e.target.value); setAddressId(""); setData(null); }}>
            <option value="">— {tx.selectClinic} —</option>
            {clinics.map(c => <option key={c.id || c.Id} value={c.id || c.Id}>{c.name || c.Name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 180 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{tx.repAddressOpt}</label>
          <select style={s.select} value={addressId} onChange={e => setAddressId(e.target.value)} disabled={!clinicId}>
            <option value="">{tx.repAllAddresses}</option>
            {clinicAddresses.map(a => <option key={a.id} value={a.id}>{a.address_name || a.street || a.id}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{tx.repFrom}</label>
          <input type="date" style={{ ...s.input, width: 150 }} value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{tx.repTo}</label>
          <input type="date" style={{ ...s.input, width: 150 }} value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <button style={{ ...s.btn, height: 40, paddingTop: 0, paddingBottom: 0 }} onClick={runReport} disabled={loading}>
          {loading ? tx.invLoading : tx.repRunReport}
        </button>
        {data && data.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...s.btn, background: "#2563eb", height: 40, paddingTop: 0, paddingBottom: 0, fontSize: 13 }} onClick={() => exportReport("csv")}>CSV</button>
            <button style={{ ...s.btn, background: "#2563eb", height: 40, paddingTop: 0, paddingBottom: 0, fontSize: 13 }} onClick={() => exportReport("pdf")}>PDF</button>
          </div>
        )}
      </div>

      {error && <p style={{ color: C.danger, marginBottom: 16, fontSize: 14 }}>{error}</p>}

      <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {!data && !loading && (
          <div style={{ padding: "40px 24px", textAlign: "center", color: C.muted, fontSize: 14 }}>
            {tx.repPrompt}
          </div>
        )}
        {loading && <div style={{ padding: "40px 24px", textAlign: "center", color: C.muted, fontSize: 14 }}>{tx.invLoading}</div>}
        {data && !loading && <div style={{ overflowX: "auto" }}>{renderTable()}</div>}
      </div>
    </div>
  );
}

// USERS TAB
function UsersTab({ users, setUsers, tx }) {
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState("");

  const roleLabel = (r) => ({
    patient: tx.rolePatient, doctor: tx.roleDoctor,
    admin: tx.roleAdmin, clinic_admin: tx.roleClinicAdmin,
  })[r] || r;

  const openEdit = (u) => { setEditUser(u); setEditForm({ name: u.name || "", email: u.email || "", role: u.role || "patient", age: u.age || "", gender: u.gender || "" }); setEditMsg(""); };

  const save = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/users/${editUser.id}`, { method: "PUT", body: JSON.stringify({ name: editForm.name, email: editForm.email, role: editForm.role, age: Number(editForm.age) || 0, gender: editForm.gender }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setEditMsg("err:" + (data.message || data.error || "Failed")); return; }
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm, age: Number(editForm.age) || 0 } : u));
      setEditMsg("ok:ok"); setTimeout(() => { setEditUser(null); setEditMsg(""); }, 900);
    } catch (e) { setEditMsg("err:" + e.message); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.deleteUserConfirm)) return;
    try {
      await authFetch(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (_) {}
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageUsers}</span>
      </div>
      {users.length === 0 ? (
        <Empty icon="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" text={tx.noUsers} />
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={s.table} cellSpacing={0}>
            <thead style={s.thead}><tr>
              <th style={s.th}>{tx.colName}</th>
              <th style={s.th}>{tx.colEmail}</th>
              <th style={s.th}>{tx.colRole}</th>
              <th style={s.th}>{tx.colAge}</th>
              <th style={s.th}>{tx.colGender}</th>
              <th style={s.th}>{tx.colActions}</th>
            </tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id}>
                <td style={s.td}><b>{u.name || "—"}</b></td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}><span style={s.badge(u.role === "admin" ? "#7C3AED" : u.role === "doctor" ? "#0369A1" : u.role === "clinic_admin" ? "#D97706" : "#22c55e")}>{roleLabel(u.role)}</span></td>
                <td style={s.td}>{u.age || "—"}</td>
                <td style={s.td}>{u.gender || "—"}</td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={s.editBtn} onClick={() => openEdit(u)}>{tx.invEdit}</button>
                    <button style={{ ...s.deleteBtn, marginLeft: 0 }} onClick={() => del(u.id)}>{tx.delete}</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {editUser && (
        <Modal title={tx.editUser} onClose={() => { setEditUser(null); setEditMsg(""); }}>
          <FG label={tx.fullName}><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></FG>
          <FG label={tx.colEmail}><Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></FG>
          <FG label={tx.colRole}>
            <Sel value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
              <option value="patient">{tx.rolePatient}</option>
              <option value="doctor">{tx.roleDoctor}</option>
              <option value="admin">{tx.roleAdmin}</option>
              <option value="clinic_admin">{tx.roleClinicAdmin}</option>
            </Sel>
          </FG>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.colAge}><Input type="number" value={editForm.age} onChange={e => setEditForm(f => ({ ...f, age: e.target.value }))} /></FG>
            <FG label={tx.colGender}><Input value={editForm.gender} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))} /></FG>
          </div>
          <button style={s.submitBtn} onClick={save}>{tx.invSaveChanges}</button>
          {editMsg && <p style={editMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{editMsg.startsWith("ok:") ? tx.addedOk : editMsg.slice(3)}</p>}
        </Modal>
      )}
    </>
  );
}

// CLINIC ADMINS TAB
function ClinicAdminsTab({ clinicAdmins, setClinicAdmins, clinics, tx }) {
  const [open, setOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState("");
  const EMPTY = { clinic_id: "", name: "", email: "", password: "", is_active: true };
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");

  const hc = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.password || !form.clinic_id) {
      setMsg("err:" + tx.allFieldsRequired); return;
    }
    try {
      const res = await authFetch(`${API_BASE}/api/clinic-admins`, {
        method: "POST",
        body: JSON.stringify({ clinic_id: form.clinic_id, name: form.name, email: form.email, password: form.password, is_active: form.is_active }),
      });
      const data = await res.json().catch(() => ({}));
      if (handle401(res.status, setMsg)) return;
      if (!res.ok) { setMsg("err:" + (data.message || data.error || "Failed")); return; }
      const newId = data.clinic_admin_id || data.id || String(Date.now());
      setClinicAdmins(prev => [...prev, { ...form, id: newId }]);
      setMsg("ok:" + tx.addedOk);
      setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); }, 1200);
    } catch (e) { setMsg("err:" + e.message); }
  };

  const updateAdmin = async () => {
    if (!editAdmin) return;
    try {
      const payload = { clinic_id: editForm.clinic_id, name: editForm.name, email: editForm.email, new_password: editForm.new_password || "", is_active: !!editForm.is_active };
      const res = await authFetch(`${API_BASE}/api/clinic-admins/${editAdmin.id}`, { method: "PUT", body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setEditMsg("err:" + (data.message || "Failed")); return; }
      setClinicAdmins(prev => prev.map(a => a.id === editAdmin.id ? { ...a, ...payload } : a));
      setEditMsg("ok:Updated!"); setTimeout(() => { setEditAdmin(null); setEditMsg(""); }, 1000);
    } catch (e) { setEditMsg("err:" + e.message); }
  };

  const del = async (id) => {
    if (!window.confirm(tx.confirmDelete)) return;
    try {
      await authFetch(`${API_BASE}/api/clinic-admins/${id}`, { method: "DELETE" });
      setClinicAdmins(prev => prev.filter(a => a.id !== id));
    } catch (_) {}
  };

  return (
    <>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>{tx.manageClinicAdmins}</span>
        <button style={s.addBtn} onClick={() => setOpen(true)}>{tx.addClinicAdmin}</button>
      </div>

      {clinicAdmins.length === 0 ? (
        <Empty icon="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" text={tx.noClinicAdmins} />
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={s.table} cellSpacing={0}>
            <thead style={s.thead}><tr>
              <th style={s.th}>{tx.colName}</th>
              <th style={s.th}>{tx.colEmail}</th>
              <th style={s.th}>{tx.colClinic}</th>
              <th style={s.th}>{tx.colStatus}</th>
              <th style={s.th}>{tx.colActions}</th>
            </tr></thead>
            <tbody>{clinicAdmins.map((a) => (
              <tr key={a.id}>
                <td style={s.td}><b>{a.name}</b></td>
                <td style={s.td}>{a.email}</td>
                <td style={s.td}>{clinics.find(c => c.id === a.clinic_id)?.name || "—"}</td>
                <td style={s.td}>
                  <span style={s.badge(a.is_active !== false ? "#22c55e" : "#94A3B8")}>
                    {a.is_active !== false ? tx.active : tx.inactive}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }}>
                    <button style={s.editBtn} onClick={() => { setEditAdmin(a); setEditForm({ ...a, new_password: "" }); setEditMsg(""); }}>{tx.invEdit}</button>
                    <button style={{ ...s.deleteBtn, marginLeft: 0 }} onClick={() => del(a.id)}>{tx.delete}</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {editAdmin && (
        <Modal title={tx.editClinicAdmin} onClose={() => { setEditAdmin(null); setEditMsg(""); }}>
          <FG label={tx.fullName}><Input value={editForm.name||""} onChange={e => setEditForm({...editForm,name:e.target.value})} /></FG>
          <FG label={tx.emailAddr}><Input type="email" value={editForm.email||""} onChange={e => setEditForm({...editForm,email:e.target.value})} /></FG>
          <FG label={tx.assignClinic}>
            <Sel value={editForm.clinic_id||""} onChange={e => setEditForm({...editForm,clinic_id:e.target.value})}>
              <option value="">{tx.selectClinic}</option>
              {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Sel>
          </FG>
          <FG label={tx.newPasswordLabel}><Input type="password" value={editForm.new_password||""} onChange={e => setEditForm({...editForm,new_password:e.target.value})} placeholder={tx.keepCurrentPassword} /></FG>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.text, marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={!!editForm.is_active} onChange={e => setEditForm({...editForm,is_active:e.target.checked})} />
            {tx.accountActive}
          </label>
          <button style={s.submitBtn} onClick={updateAdmin}>{tx.invSaveChanges}</button>
          {editMsg && <p style={editMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{editMsg.slice(3)}</p>}
        </Modal>
      )}

      {open && (
        <Modal title={tx.modalAddClinicAdmin} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <FG label={tx.fullName}><Input name="name" value={form.name} onChange={hc} placeholder={tx.doctorNamePh} /></FG>
          <FG label={tx.emailAddr}><Input name="email" type="email" value={form.email} onChange={hc} placeholder={tx.doctorEmailPh} /></FG>
          <FG label={tx.passwordLabel}><Input name="password" type="password" value={form.password} onChange={hc} placeholder={tx.passwordPlaceholder} /></FG>
          <FG label={tx.assignClinic}>
            <Sel name="clinic_id" value={form.clinic_id} onChange={hc}>
              <option value="">{tx.selectClinic}</option>
              {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Sel>
          </FG>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.text, marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={e => setForm(f => ({...f,is_active:e.target.checked}))} />
            {tx.accountActive}
          </label>
          <button style={s.submitBtn} onClick={submit}>{tx.modalAddClinicAdmin}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}
    </>
  );
}

// MAIN
const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "KZ", label: "Қазақша" },
  { code: "RU", label: "Русский" },
];

export default function AdminDashboard({ setPage, lang: propLang, setLang: propSetLang }) {
  const [localLang, setLocalLang] = useState(propLang || "EN");
  const lang = propLang || localLang;
  const setLang = propSetLang || setLocalLang;
  const tx = ADMIN_T[lang] || ADMIN_T.EN;
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [tab, setTab] = useState("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clinics,      setClinics]      = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [services,     setServices]     = useState([]);
  const [addresses,    setAddresses]    = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clinicAdmins, setClinicAdmins] = useState([]);
  const [users,        setUsers]        = useState([]);
  const [profileOpen,  setProfileOpen]  = useState(false);

  const normalize = (item) => {
    const id =
      item.data?.id        || item.data?.Id        ||
      item.id              || item.Id              || item.ID              ||
      item.clinic_id       || item.ClinicId        || item.ClinicID        ||
      item.service_id      || item.ServiceId       || item.ServiceID       ||
      item.doctor_id       || item.DoctorId        || item.DoctorID        ||
      item.appointment_id  || item.AppointmentId   || item.AppointmentID   ||
      item.address_id      || item.AddressId       || item.AddressID       ||
      item.uuid            || item.UUID            || item.Uuid            ||
      Object.values(item).find(v => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v)) ||
      "";

    return { ...item, id, name: item.name || item.Name || "" };
  };
  const loadAll = async () => {
    const load = async (path, setter, key) => {
      try {
        const r = await authFetch(`${API_BASE}${path}`);
        if (!r.ok) return;
        const d = await r.json();
        let list = Array.isArray(d) ? d
          : Array.isArray(d.data) ? d.data
          : d.data && typeof d.data === 'object' ? [d.data]
          : Array.isArray(d[key]) ? d[key]
          : [];
        setter(list.map(normalize));
      } catch (_) {}
    };
    await load("/api/clinics", setClinics, "clinics");
    await Promise.all([
      load("/api/doctors",        setDoctors,      "doctors"),
      load("/api/services",       setServices,     "services"),
      load("/api/appointment",    setAppointments, "appointment"),
      load("/api/clinic-admins",  setClinicAdmins, "clinic_admins"),
      load("/api/users",          setUsers,        "users"),
    ]);

    // Load addresses: GET /api/clinics/{id}/address for each clinic
    try {
      const cr = await authFetch(`${API_BASE}/api/clinics`);
      if (cr.ok) {
        const cd = await cr.json();
        const clinicList = Array.isArray(cd) ? cd : (Array.isArray(cd.data) ? cd.data : []);
        const allAddresses = [];
        await Promise.all(clinicList.map(async (clinic) => {
          const clinicId = clinic.id || clinic.Id || clinic.ID ||
            Object.values(clinic).find(v => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v));
          if (!clinicId) return;
          try {
            const ar = await authFetch(`${API_BASE}/api/clinics/${clinicId}/address`);
            if (!ar.ok) return;
            const ad = await ar.json();
            const addrList = Array.isArray(ad) ? ad : (Array.isArray(ad.data) ? ad.data : []);
            for (const entry of addrList) {
              const clinicAddressId = entry.id || entry.Id;      
              const addressId       = entry.address_id || entry.Address_id; 
              if (!clinicAddressId) continue;
              try {
                const dr = await authFetch(`${API_BASE}/api/address/${addressId}`);
                if (dr.ok) {
                  const detail = await dr.json();
                  allAddresses.push({
                    id:           clinicAddressId,
                    addr_id:      addressId,
                    clinic_id:    clinicId,
                    is_main:      entry.is_main,
                    address_name:     entry.address_name     || "",
                    address_building: entry.address_building || "",
                    country:      detail.country  || "",
                    city:         detail.city     || "",
                    street:       detail.street   || "",
                    building:     detail.building || "",
                  });
                }
              } catch (_) {}
            }
          } catch (_) {}
        }));
        setAddresses(allAddresses);
      }
    } catch (_) {}
  };

  useEffect(() => { loadAll(); }, []);

  const counts = {
    clinics:      clinics.length,
    doctors:      doctors.length,
    services:     services.length,
    addresses:    addresses.length,
    appointments: appointments.length,
    reviews:      appointments.filter(a => a.is_reviewed).length,
    schedule:      0,
    inventory:     0,
    reports:       0,
    clinic_admins: clinicAdmins.length,
    users:         users.length,
  };

  const { isMobile } = useResponsive();
  const adminBarStyle = { ...s.adminBar, padding: isMobile ? "0 16px" : "0 48px", height: isMobile ? 58 : 72 };
  const tabsRowStyle  = { ...s.tabsRow, padding: isMobile ? "0 8px" : "0 48px", overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch" };
  const wrapStyle     = { ...s.wrap,    padding: isMobile ? "0 16px 40px" : "0 48px 56px" };

  return (
    <main style={s.page}>
      <div style={adminBarStyle}>
        <div style={s.adminLeft}>
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", color: C.muted }}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}
          <div
            style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
            onClick={() => setPage("home")}
            title="Go to Home"
          >
            <div style={s.adminIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" stroke="#fff" strokeWidth="2"/>
                <rect x="13" y="3" width="8" height="8" rx="2" stroke="#fff" strokeWidth="2"/>
                <rect x="3" y="13" width="8" height="8" rx="2" stroke="#fff" strokeWidth="2"/>
                <rect x="13" y="13" width="8" height="8" rx="2" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
            <span style={s.adminTitle}>{tx.title}</span>
          </div>
        </div>
        <div style={s.adminRight}>
          {/* Language switcher */}
          <div style={s.langWrap} ref={langRef}>
            <button
              style={{ ...s.langBtn, borderColor: langOpen ? C.primary : C.border }}
              onClick={() => setLangOpen(o => !o)}
            >
              <GlobeIcon />
              <span>{lang}</span>
              <span style={{ fontSize: 10, marginLeft: 2, transition: "transform 0.2s", display: "inline-block", transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </button>
            {langOpen && (
              <div style={s.langDrop}>
                {LANGUAGES.map(l => (
                  <div
                    key={l.code}
                    style={s.langItem(l.code === lang)}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    onMouseEnter={(e) => { if (l.code !== lang) e.currentTarget.style.background = "#F8F9FF"; }}
                    onMouseLeave={(e) => { if (l.code !== lang) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 20 }}>{l.flag}</span>
                    <span>{l.label}</span>
                    {l.code === lang && <span style={{ marginLeft: "auto", color: C.primary }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button style={{ ...s.logoutBtn, color: C.primary }} onClick={() => setProfileOpen(true)} title={tx.profileSettings}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!isMobile && tx.profileSettings}
          </button>
          <button style={s.logoutBtn} onClick={() => { sessionStorage.removeItem("token"); setPage("login"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M16 17l5-5-5-5M21 12H9M13 22H5a2 2 0 01-2-2V4a2 2 0 012-2h8"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {tx.logout}
          </button>
        </div>
      </div>
      {profileOpen && <ProfileModal tx={tx} onClose={() => setProfileOpen(false)} />}

      {isMobile && (
        <div style={tabsRowStyle}>
          {TABS.map((t) => (
            <button key={t.key} style={s.tab(tab === t.key)} onClick={() => setTab(t.key)}>
              <Icon d={t.icon} size={15} />
              {tx.tabs[t.key]} ({counts[t.key]})
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {!isMobile && (
          <nav style={{ ...s.sidebar, width: sidebarOpen ? 240 : 0, overflow: "hidden", transition: "width 0.25s ease" }}>
            <div style={s.sideBody}>
              <div style={s.sideLabel}>{tx.sidebarNav}</div>
              {TABS.map((t) => (
                <button key={t.key} style={s.sideItem(tab === t.key)} onClick={() => setTab(t.key)}>
                  <Icon d={t.icon} size={16} />
                  <span style={{ flex: 1 }}>{tx.tabs[t.key]}</span>
                  <span style={s.sideCount(tab === t.key)}>{counts[t.key]}</span>
                </button>
              ))}
            </div>
          </nav>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={wrapStyle}>
            {tab === "clinics"      && <ClinicsTab      clinics={clinics}           setClinics={setClinics} setPage={setPage} tx={tx} addresses={addresses} setAddresses={setAddresses} />}
            {tab === "doctors"      && <DoctorsTab       doctors={doctors}           setDoctors={setDoctors}     clinics={clinics} services={services} tx={tx} />}
            {tab === "services"     && <ServicesTab      services={services}         setServices={setServices}   clinics={clinics} tx={tx} />}
            {tab === "addresses"    && <AddressesTab     addresses={addresses}       setAddresses={setAddresses} clinics={clinics} tx={tx} />}
            {tab === "appointments" && <AppointmentsTab  appointments={appointments} setAppointments={setAppointments} addresses={addresses} doctors={doctors} services={services} clinics={clinics} tx={tx} />}
            {tab === "reviews"      && <ReviewsTab       appointments={appointments} doctors={doctors} tx={tx} />}
            {tab === "schedule"     && <ScheduleTab      doctors={doctors} addresses={addresses} tx={tx} />}
        {tab === "inventory"    && <InventoryTab     addresses={addresses} services={services} clinics={clinics} tx={tx} />}
            {tab === "reports"       && <ReportsTab       clinics={clinics} addresses={addresses} tx={tx} />}
            {tab === "clinic_admins" && <ClinicAdminsTab  clinicAdmins={clinicAdmins} setClinicAdmins={setClinicAdmins} clinics={clinics} tx={tx} />}
            {tab === "users"         && <UsersTab          users={users} setUsers={setUsers} tx={tx} />}
          </div>
        </div>
      </div>
    </main>
  );
}
