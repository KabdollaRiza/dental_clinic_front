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
  const raw = localStorage.getItem("token") || "";
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
  { key: "schedule",     label: "Schedule",     icon: "M12 8v4l3 3M12 2a10 10 0 100 20A10 10 0 0012 2z" },
];

// CLINICS TAB
function ClinicsTab({ clinics, setClinics, tx, addresses, setAddresses }) {
  const [open, setOpen] = useState(false);
  const [editClinic, setEditClinic] = useState(null);
  const [editForm2,  setEditForm2]  = useState({});
  const [editMsg2,   setEditMsg2]   = useState("");
 
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
                  <button style={s.editBtn} onClick={() => { setEditClinic(c); setEditForm2({...c}); setEditMsg2(""); }}>Edit</button>
                  <button style={s.deleteBtn} onClick={() => del(c.id)}>{tx.delete}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Edit Clinic Modal */}
      {editClinic && (
        <Modal title="Edit Clinic" onClose={() => { setEditClinic(null); setEditMsg2(""); }}>
          <FG label={tx.clinicName}><Input name="name" value={editForm2.name||""} onChange={(e)=>setEditForm2({...editForm2,name:e.target.value})} /></FG>
          <FG label={tx.description}><textarea style={s.textarea} name="description" value={editForm2.description||""} onChange={(e)=>setEditForm2({...editForm2,description:e.target.value})} onFocus={(e)=>(e.target.style.borderColor=C.primary)} onBlur={(e)=>(e.target.style.borderColor=C.border)} /></FG>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <FG label={tx.phoneNum}><Input value={editForm2.phone||""} onChange={(e)=>setEditForm2({...editForm2,phone:e.target.value})} /></FG>
            <FG label={tx.emailAddr}><Input type="email" value={editForm2.email||""} onChange={(e)=>setEditForm2({...editForm2,email:e.target.value})} /></FG>
          </div>
          <FG label={tx.websiteUrl}><Input value={editForm2.website||""} onChange={(e)=>setEditForm2({...editForm2,website:e.target.value})} /></FG>
          <FG label=""><label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,cursor:"pointer"}}><input type="checkbox" checked={!!editForm2.is_active} onChange={(e)=>setEditForm2({...editForm2,is_active:e.target.checked})} />{tx.setActive}</label></FG>
          <button style={s.submitBtn} onClick={updateClinic}>Save Changes</button>
          {editMsg2 && <p style={editMsg2.startsWith("ok:") ? s.msgOk : s.msgErr}>{editMsg2.slice(3)}</p>}
        </Modal>
      )}

      {open && (
        <Modal title={tx.modalAddClinic} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <FG label={tx.clinicName}>
            <Input name="name" value={form.name} onChange={hc} placeholder="e.g. SmileDent Astana" />
          </FG>
          <FG label={tx.description}>
            <textarea style={s.textarea} name="description" value={form.description} onChange={hc}
              placeholder={tx.descPh}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </FG>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.phoneNum}>
              <Input name="phone" value={form.phone} onChange={hc} placeholder="+7 (7172) 55-66-77" />
            </FG>
            <FG label={tx.emailAddr}>
              <Input name="email" type="email" value={form.email} onChange={hc} placeholder="contact@clinic.kz" />
            </FG>
          </div>
          <FG label={tx.websiteUrl}>
            <Input name="website" value={form.website} onChange={hc} placeholder="https://clinic.kz" />
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
    </>
  );
}

// DOCTORS TAB
function DoctorsTab({ doctors, setDoctors, clinics, services, tx }) {
  const [open, setOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editDocForm, setEditDocForm] = useState({});
  const [editDocMsg,  setEditDocMsg]  = useState("");
  const EMPTY = { name: "", email: "", specialization: "", experience: "", clinic_id: "", service_ids: [] };
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");

  const hc = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleSv = (id) => setForm((f) => ({
    ...f,
    service_ids: f.service_ids.includes(id) ? f.service_ids.filter((x) => x !== id) : [...f.service_ids, id],
  }));

  const clinicServices = services.filter((sv) => !form.clinic_id || sv.clinic_id === form.clinic_id);

  const submit = async () => {
    if (!form.name || !form.email) { setMsg("err:" + tx.nameEmailRequired); return; }
    if (doctors.some(d => d.email.toLowerCase() === form.email.toLowerCase())) {
      setMsg("err:A doctor with this email already exists."); return;
    }
    try {
      const res = await authFetch(`${API_BASE}/api/doctors`, {
        method: "POST",
        body: JSON.stringify({ ...form, experience: parseInt(form.experience) || 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || "Failed")); return; }
      setDoctors((prev) => [...prev, { ...form, id: data.data?.id || data.data?.Id || data.doctor_id || data.id || data.Id || String(Date.now()) }]);
      setMsg("ok:" + tx.addedOk);
      setTimeout(() => { setOpen(false); setForm(EMPTY); setMsg(""); }, 1200);
    } catch (e) { alert(e.message); }
  };

  const updateDoctor = async () => {
    if (!editDoc) return;
    try {
      const payload = { name: editDocForm.name, email: editDocForm.email, specialization: editDocForm.specialization, experience: parseInt(editDocForm.experience)||0 };
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
              <td style={s.td}>{d.experience ? `${d.experience} yrs` : "—"}</td>
              <td style={s.td}>
                <button style={s.editBtn} onClick={() => { setEditDoc(d); setEditDocForm({...d}); setEditDocMsg(""); }}>Edit</button>
                <button style={s.deleteBtn} onClick={() => del(d.id)}>{tx.delete}</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        </div>
      )}
      {editDoc && (
        <Modal title="Edit Doctor" onClose={() => { setEditDoc(null); setEditDocMsg(""); }}>
          <FG label={tx.fullName}><Input value={editDocForm.name||""} onChange={(e)=>setEditDocForm({...editDocForm,name:e.target.value})} /></FG>
          <FG label={tx.emailAddr}><Input type="email" value={editDocForm.email||""} onChange={(e)=>setEditDocForm({...editDocForm,email:e.target.value})} /></FG>
          <FG label={tx.colSpec}><Input value={editDocForm.specialization||""} onChange={(e)=>setEditDocForm({...editDocForm,specialization:e.target.value})} /></FG>
          <FG label={tx.yearsExp}><Input type="number" value={editDocForm.experience||""} onChange={(e)=>setEditDocForm({...editDocForm,experience:e.target.value})} /></FG>
          <button style={s.submitBtn} onClick={updateDoctor}>Save Changes</button>
          {editDocMsg && <p style={editDocMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{editDocMsg.slice(3)}</p>}
        </Modal>
      )}
      {open && (
        <Modal title={tx.modalAddDoctor} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <FG label={tx.fullName}><Input name="name" value={form.name} onChange={hc} placeholder="Dr. John Smith" /></FG>
          <FG label={tx.emailAddr}><Input name="email" type="email" value={form.email} onChange={hc} placeholder="doctor@clinic.kz" /></FG>
          <FG label={tx.colSpec}><Input name="specialization" value={form.specialization} onChange={hc} placeholder="e.g. Orthodontics" /></FG>
          <FG label={tx.yearsExp}><Input name="experience" type="number" value={form.experience} onChange={hc} placeholder="e.g. 5" /></FG>
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
          <button style={s.submitBtn} onClick={submit}>{tx.modalAddDoctor}</button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
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
    if (dur > 0 && dur % 30 !== 0) { setMsg("err:Duration must be a multiple of 30 minutes (e.g. 30, 60, 90)."); return; }
    if (services.some(sv => sv.name.toLowerCase() === form.name.toLowerCase() && sv.clinic_id === form.clinic_id)) {
      setMsg("err:This service already exists for this clinic."); return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price) || 0,
        duration: parseInt(form.duration, 10) || 0,
        clinic_id: form.clinic_id, is_active: form.is_active,
      };
      const res = await authFetch(`${API_BASE}/api/services`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("err:" + (data.message || data.error || JSON.stringify(data))); return; }
      setServices((prev) => [...prev, { ...payload, id: data.data?.id || data.data?.Id || data.service_id || data.id || data.Id || String(Date.now()) }]);
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
              <td style={s.td}>{sv.duration ? `${sv.duration} min` : "—"}</td>
              <td style={s.td}>
                <span style={s.badge(sv.is_active ? "#22c55e" : "#94A3B8")}>
                  {sv.is_active ? tx.active : tx.inactive}
                </span>
              </td>
              <td style={s.td}><button style={s.editBtn} onClick={() => { setEditSvc(sv); setEditSvcForm({...sv, price: String(sv.price), duration: String(sv.duration)}); setEditSvcMsg(""); }}>Edit</button><button style={s.deleteBtn} onClick={() => del(sv.id)}>{tx.delete}</button></td>
            </tr>
          ))}</tbody>
        </table>
        </div>
      )}
      {editSvc && (
        <Modal title="Edit Service" onClose={() => { setEditSvc(null); setEditSvcMsg(""); }}>
          <FG label={tx.serviceName}><Input value={editSvcForm.name||""} onChange={(e)=>setEditSvcForm({...editSvcForm,name:e.target.value})} /></FG>
          <FG label={tx.description}><textarea style={s.textarea} value={editSvcForm.description||""} onChange={(e)=>setEditSvcForm({...editSvcForm,description:e.target.value})} onFocus={(e)=>(e.target.style.borderColor=C.primary)} onBlur={(e)=>(e.target.style.borderColor=C.border)} /></FG>
          <FG label={tx.price}><Input type="number" value={editSvcForm.price||""} onChange={(e)=>setEditSvcForm({...editSvcForm,price:e.target.value})} /></FG>
          <FG label={tx.duration}><Sel value={editSvcForm.duration||""} onChange={(e)=>setEditSvcForm({...editSvcForm,duration:e.target.value})}><option value="">—</option>{[30,60,90,120,150,180].map(d=><option key={d} value={d}>{d} min</option>)}</Sel></FG>
          <FG label=""><label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,cursor:"pointer"}}><input type="checkbox" checked={!!editSvcForm.is_active} onChange={(e)=>setEditSvcForm({...editSvcForm,is_active:e.target.checked})} />{tx.markActive}</label></FG>
          <button style={s.submitBtn} onClick={updateService}>Save Changes</button>
          {editSvcMsg && <p style={editSvcMsg.startsWith("ok:") ? s.msgOk : s.msgErr}>{editSvcMsg.slice(3)}</p>}
        </Modal>
      )}
      {open && (
        <Modal title={tx.modalAddService} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <FG label={tx.serviceName}><Input name="name" value={form.name} onChange={hc} placeholder="e.g. Dental Check-up" /></FG>
          <FG label={tx.description}>
            <textarea style={s.textarea} name="description" value={form.description} onChange={hc}
              placeholder={tx.serviceDescPh}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </FG>
          <FG label={tx.price}><Input name="price" type="number" value={form.price} onChange={hc} placeholder="e.g. 5000" /></FG>
          <FG label={tx.duration}>
            <Sel name="duration" value={form.duration} onChange={hc}>
              <option value="">— Select duration —</option>
              {[30,60,90,120,150,180].map(d => <option key={d} value={d}>{d} min</option>)}
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
  const [open, setOpen]     = useState(false);
  const EMPTY = { country: "", city: "", street: "", building: "" };
  const [form, setForm]     = useState(EMPTY);
  const [msg,  setMsg]      = useState("");
  const [saving, setSaving] = useState(false);

  const hc = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isDuplicate = (f) => addresses.some(a =>
    a.street?.trim().toLowerCase()   === f.street.trim().toLowerCase() &&
    a.building?.trim().toLowerCase() === f.building.trim().toLowerCase() &&
    a.city?.trim().toLowerCase()     === f.city.trim().toLowerCase()
  );

  // STEP 1: POST /api/address → CreateRequest → get Address_id from CreateResponse
  const submit = async () => {
    if (!form.country || !form.city || !form.street) {
      setMsg("err:Country, city and street are required."); return;
    }
    if (isDuplicate(form)) {
      setMsg("err:This address already exists."); return;
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
                <button style={s.deleteBtn} onClick={() => del(a.id, a.clinic_id)}>{tx.delete}</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        </div>
      )}

      {open && (
        <Modal title={tx.modalAddAddress} onClose={() => { setOpen(false); setForm(EMPTY); setMsg(""); }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.country}><Input name="country" value={form.country} onChange={hc} placeholder="e.g. Kazakhstan" /></FG>
            <FG label={tx.city}><Input name="city" value={form.city} onChange={hc} placeholder="e.g. Astana" /></FG>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label={tx.street}><Input name="street" value={form.street} onChange={hc} placeholder="e.g. Kabanbay Batyr Ave" /></FG>
            <FG label={tx.building}><Input name="building" value={form.building} onChange={hc} placeholder="e.g. 42" /></FG>
          </div>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
            {saving ? "Saving…" : tx.modalAddAddress}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}
    </>
  );
}

// APPOINTMENTS CALENDAR TAB — Google Calendar style
const STATUS_COLORS = { booked: "#3B5BDB", completed: "#22c55e", cancelled: "#EF4444", pending: "#F59E0B" };
const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const DAYS_SHORT = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

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

  const EMPTY = { clinic_id: "", doctor_id: "", clinic_address_id: "", service_id: "", slot_id: "", date: "", name: "", email: "" };
  const [form, setForm] = useState(EMPTY);

  const assignedAddresses = addresses.filter(a => a.clinic_id);
  const filteredAddresses = form.clinic_id ? assignedAddresses.filter(a => a.clinic_id === form.clinic_id) : assignedAddresses;
  const filteredDoctors   = form.clinic_id ? doctors.filter(d => d.clinic_id === form.clinic_id) : doctors;
  const filteredServices  = form.clinic_id ? services.filter(s => s.clinic_id === form.clinic_id) : services;

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
      setMsg("err:All fields are required."); return;
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
      setMsg("ok:Appointment booked!");
      setTimeout(() => { setShowModal(false); setForm(EMPTY); setSlots([]); setMsg(""); }, 1200);
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
            <button style={{ padding: "6px 16px", border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={() => setBaseDate(new Date())}>Today</button>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 4 }}>{DAYS_SHORT[i]}</div>
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
                        onClick={(e) => { e.stopPropagation(); if(window.confirm("Delete this appointment?")) del(a.id); }}
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

              <FG label="Clinic">
                <Sel value={form.clinic_id} onChange={(e) => handleFormChange("clinic_id", e.target.value)}>
                  <option value="">— Select clinic —</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Sel>
              </FG>

              <FG label={tx.selectDoctor}>
                <Sel value={form.doctor_id} onChange={(e) => handleFormChange("doctor_id", e.target.value)}>
                  <option value="">{tx.selectDoctor}</option>
                  {filteredDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Sel>
              </FG>

              <FG label="Clinic Address">
                {filteredAddresses.length === 0
                  ? <p style={{ fontSize: 13, color: "#F59E0B" }}>{form.clinic_id ? "No addresses for this clinic." : "Select a clinic first."}</p>
                  : <Sel value={form.clinic_address_id} onChange={(e) => handleFormChange("clinic_address_id", e.target.value)}>
                      <option value="">— Select address —</option>
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
                  {filteredServices.map(sv => <option key={sv.id} value={sv.id}>{sv.name} ({sv.duration} min)</option>)}
                </Sel>
              </FG>

              <FG label={tx.selectDate}>
                <Input name="date" type="date" value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleFormChange("date", e.target.value)} />
              </FG>

              <FG label="Time Slot">
                {loadSlots
                  ? <p style={{ fontSize: 13, color: C.muted }}>Loading slots…</p>
                  : !form.doctor_id || !form.clinic_address_id || !form.service_id || !form.date
                  ? <p style={{ fontSize: 13, color: C.muted }}>Fill all fields above to see slots.</p>
                  : slots.length === 0
                  ? <p style={{ fontSize: 13, color: "#F59E0B" }}>No available slots for this date.</p>
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
                <Input name="name" value={form.name} placeholder="Full name"
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </FG>

              <FG label="Email">
                <Input name="email" type="email" value={form.email} placeholder="patient@email.com"
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </FG>

              <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
                {saving ? "Booking…" : tx.addAppointment}
              </button>
              {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SCHEDULE TAB
function ScheduleTab({ doctors, addresses }) {
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [schedules,    setSchedules]   = useState([]);
  const [loadingDoc,   setLoadingDoc]  = useState(false);
  const [selectedDoc,  setSelectedDoc] = useState("");
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showGenModal,   setShowGenModal]   = useState(false);
  const [saving,       setSaving]      = useState(false);
  const [msg,          setMsg]         = useState("");

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

  const getAddrLabel = (id) => {
    const a = addresses.find(x => x.id === id);
    if (!a) return id?.slice(0, 8) || "—";
    return [a.address_name, a.address_building].filter(Boolean).join(", ") || id?.slice(0, 8);
  };

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <span style={s.sectionTitle}>Schedule Management</span>
        <button style={{ ...s.addBtn, background: "#10b981" }} onClick={() => { setShowGenModal(true); setMsg(""); }}>
          ⚡ Generate Slots
        </button>
      </div>

      {msg && (
        <p style={msg.startsWith("ok:") ? { ...s.msgOk, textAlign: "left", marginBottom: 16 } : { ...s.msgErr, textAlign: "left", marginBottom: 16 }}>
          {msg.slice(3)}
        </p>
      )}

      {/* Doctor selector */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 28px", marginBottom: 20 }}>
        <FG label="Select Doctor to manage working hours">
          <Sel value={selectedDoc} onChange={(e) => handleDocChange(e.target.value)}>
            <option value="">— Choose a doctor —</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Sel>
        </FG>

        {selectedDoc && (
          <button style={s.addBtn} onClick={() => { setShowHoursModal(true); setWhForm(EMPTY_WH); setMsg(""); }}>
            + Add Working Hours
          </button>
        )}
      </div>

      {/* Working hours table */}
      {selectedDoc && (
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {loadingDoc
            ? <p style={{ padding: 24, color: C.muted, fontSize: 14 }}>Loading…</p>
            : schedules.length === 0
            ? <p style={{ padding: 24, color: C.muted, fontSize: 14 }}>No working hours set for this doctor yet.</p>
            : (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={s.table} cellSpacing={0}>
                <thead>
                  <tr style={{ background: "#F8F9FF" }}>
                    {["Day", "Address", "Start", "End"].map(h => (
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
        <Modal title="Add Working Hours" onClose={() => setShowHoursModal(false)}>
          <FG label="Clinic Address">
            <Sel value={whForm.clinic_address_id} onChange={(e) => setWhForm(f => ({ ...f, clinic_address_id: e.target.value }))}>
              <option value="">— Select address —</option>
              {addresses.map(a => (
                <option key={a.id} value={a.id}>
                  {[a.address_name, a.address_building].filter(Boolean).join(", ") || a.id}
                </option>
              ))}
            </Sel>
          </FG>
          <FG label="Day of Week">
            <Sel value={whForm.day_of_week} onChange={(e) => setWhForm(f => ({ ...f, day_of_week: e.target.value }))}>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="0">Sunday</option>
            </Sel>
          </FG>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label="Start Time">
              <Input name="start_time" type="time" value={whForm.start_time}
                onChange={(e) => setWhForm(f => ({ ...f, start_time: e.target.value }))} />
            </FG>
            <FG label="End Time">
              <Input name="end_time" type="time" value={whForm.end_time}
                onChange={(e) => setWhForm(f => ({ ...f, end_time: e.target.value }))} />
            </FG>
          </div>
          <button style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={submitWorkingHours} disabled={saving}>
            {saving ? "Saving…" : "Save Working Hours"}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}

      {/* Generate Slots Modal */}
      {showGenModal && (
        <Modal title="Generate Time Slots" onClose={() => setShowGenModal(false)}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
            Generates 30-minute slots for all doctors based on their working hours, for the selected date range.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FG label="From Date">
              <Input name="from_date" type="date" value={genForm.from_date}
                onChange={(e) => setGenForm(f => ({ ...f, from_date: e.target.value }))} />
            </FG>
            <FG label="To Date">
              <Input name="to_date" type="date" value={genForm.to_date}
                onChange={(e) => setGenForm(f => ({ ...f, to_date: e.target.value }))} />
            </FG>
          </div>
          <button style={{ ...s.submitBtn, background: "#10b981", opacity: saving ? 0.7 : 1 }} onClick={submitGenerate} disabled={saving}>
            {saving ? "Generating…" : "⚡ Generate Slots"}
          </button>
          {msg && <p style={msg.startsWith("ok:") ? s.msgOk : s.msgErr}>{msg.slice(3)}</p>}
        </Modal>
      )}
    </div>
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
  const [clinics,      setClinics]      = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [services,     setServices]     = useState([]);
  const [addresses,    setAddresses]    = useState([]);
  const [appointments, setAppointments] = useState([]);

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
      load("/api/doctors",      setDoctors,      "doctors"),
      load("/api/services",     setServices,     "services"),
      load("/api/appointment", setAppointments, "appointment"),
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
    schedule:     0,
  };

  const { isMobile } = useResponsive();
  const adminBarStyle = { ...s.adminBar, padding: isMobile ? "0 16px" : "0 48px", height: isMobile ? 58 : 72 };
  const tabsRowStyle  = { ...s.tabsRow, padding: isMobile ? "0 8px" : "0 48px", overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch" };
  const wrapStyle     = { ...s.wrap,    padding: isMobile ? "0 16px 40px" : "0 48px 56px" };

  return (
    <main style={s.page}>
      <div style={adminBarStyle}>
        <div style={s.adminLeft}>
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
              <span>{LANGUAGES.find(l => l.code === lang)?.flag} {lang}</span>
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
          <button style={s.logoutBtn} onClick={() => setPage("login")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M16 17l5-5-5-5M21 12H9M13 22H5a2 2 0 01-2-2V4a2 2 0 012-2h8"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {tx.logout}
          </button>
        </div>
      </div>

      <div style={tabsRowStyle}>
        {TABS.map((t) => (
          <button key={t.key} style={s.tab(tab === t.key)} onClick={() => setTab(t.key)}>
            <Icon d={t.icon} size={15} />
            {tx.tabs[t.key]} ({counts[t.key]})
          </button>
        ))}
      </div>

      <div style={wrapStyle}>
        {tab === "clinics"      && <ClinicsTab      clinics={clinics}           setClinics={setClinics} setPage={setPage} tx={tx} addresses={addresses} setAddresses={setAddresses} />}
        {tab === "doctors"      && <DoctorsTab       doctors={doctors}           setDoctors={setDoctors}     clinics={clinics} services={services} tx={tx} />}
        {tab === "services"     && <ServicesTab      services={services}         setServices={setServices}   clinics={clinics} tx={tx} />}
        {tab === "addresses"    && <AddressesTab     addresses={addresses}       setAddresses={setAddresses} clinics={clinics} tx={tx} />}
        {tab === "appointments" && <AppointmentsTab  appointments={appointments} setAppointments={setAppointments} addresses={addresses} doctors={doctors} services={services} clinics={clinics} tx={tx} />}
        {tab === "schedule"     && <ScheduleTab      doctors={doctors} addresses={addresses} />}
      </div>
    </main>
  );
}
