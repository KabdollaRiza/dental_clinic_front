import { useState, useEffect } from "react";
import { COLORS } from "./constants";
import { T } from "./translation";
import { useResponsive } from "./useResponsive";

const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:8080" : "";

const fmtTime = (iso) => {
  if (!iso) return "—";
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : "—";
};

export default function BookingPage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.booking || T.EN.booking;
  const { isMobile } = useResponsive();

  const [clinics,   setClinics]   = useState([]);
  const [services,  setServices]  = useState([]);
  const [doctors,   setDoctors]   = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [slots,     setSlots]     = useState([]);

  const [clinicId,         setClinicId]         = useState("");
  const [clinicAddressId,  setClinicAddressId]   = useState("");
  const [serviceId,        setServiceId]         = useState("");
  const [doctorId,         setDoctorId]          = useState("");
  const [date,             setDate]              = useState("");
  const [slotId,           setSlotId]            = useState("");

  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message,      setMessage]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  // Responsive style values
  const wrapPadding = isMobile ? "24px 16px" : "36px 24px";
  const cardPadding = isMobile ? "20px 16px" : "28px";
  const twoColGrid  = isMobile ? "1fr" : "1fr 1fr";
  const svcGridCols = isMobile ? "1fr" : "1fr 1fr";
  const slotGridCols = isMobile ? "repeat(3, 1fr)" : "repeat(4, 1fr)";

  const bs = {
    page:     { flex: 1, display: "flex", flexDirection: "column", background: COLORS.bg },
    wrap:     { maxWidth: 860, margin: "0 auto", padding: wrapPadding, width: "100%", boxSizing: "border-box" },
    backLink: { display: "inline-flex", alignItems: "center", gap: 6, color: COLORS.primary, fontSize: 14, fontWeight: 500, cursor: "pointer", marginBottom: 24 },
    title:    { fontSize: isMobile ? 22 : 28, fontWeight: 800, color: COLORS.text, marginBottom: 6 },
    sub:      { fontSize: isMobile ? 13 : 15, color: COLORS.muted, marginBottom: 28 },
    card:     { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: cardPadding, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
    stepHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 18 },
    stepNum:  (active) => ({ width: 28, height: 28, borderRadius: "50%", background: active ? COLORS.primary : COLORS.border, color: active ? "#fff" : COLORS.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }),
    stepTitle:{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: COLORS.text },
    select:   { width: "100%", padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, color: COLORS.text, background: COLORS.white, outline: "none", cursor: "pointer", boxSizing: "border-box" },
    input:    { width: "100%", padding: "12px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, color: COLORS.text, outline: "none", boxSizing: "border-box", background: COLORS.white, transition: "border 0.2s" },
    label:    { display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 7 },
    fg:       { marginBottom: 18 },
    row:      { display: "grid", gridTemplateColumns: twoColGrid, gap: 16, marginBottom: 0 },
    svcGrid:  { display: "grid", gridTemplateColumns: svcGridCols, gap: 14 },
    svcCard:  (sel) => ({ border: `2px solid ${sel ? COLORS.primary : COLORS.border}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", background: sel ? COLORS.primaryLight : COLORS.white, transition: "all 0.15s" }),
    slotGrid: { display: "grid", gridTemplateColumns: slotGridCols, gap: 10 },
    slotBtn:  (sel) => ({ padding: "10px 0", border: `2px solid ${sel ? COLORS.primary : COLORS.border}`, borderRadius: 8, background: sel ? COLORS.primary : COLORS.white, color: sel ? "#fff" : COLORS.text, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center", transition: "all 0.15s" }),
    submitBtn:(en) => ({ width: "100%", padding: "14px", border: "none", borderRadius: 10, background: en ? COLORS.primary : "#C9D0E0", color: en ? "#fff" : "#8a94a8", fontSize: 15, fontWeight: 700, cursor: en ? "pointer" : "not-allowed", marginTop: 8 }),
    muted:    { fontSize: 13, color: COLORS.muted, padding: "8px 0" },
    warn:     { fontSize: 13, color: "#F59E0B", padding: "8px 0" },
  };

  useEffect(() => {
    const load = async (path, setter) => {
      try {
        const r = await fetch(`${API_BASE}${path}`);
        if (r.ok) {
          const d = await r.json();
          setter(Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : []));
        }
      } catch (_) {}
    };
    load("/api/clinics",  setClinics);
    load("/api/services", setServices);
    load("/api/doctors",  setDoctors);

    // Pre-fill name & email if patient is logged in
    const token = localStorage.getItem("patient_token");
    if (token) {
      try {
        const claims = JSON.parse(atob(token.split(".")[1]));
        if (claims.name  || claims.Name)  setName(claims.name  || claims.Name);
        if (claims.email || claims.Email) setEmail(claims.email || claims.Email);
      } catch (_) {}
    }
  }, []);

  const handleClinicChange = async (id) => {
    setClinicId(id);
    setClinicAddressId(""); setSlotId(""); setSlots([]);
    if (!id) { setAddresses([]); return; }
    try {
      const r = await fetch(`${API_BASE}/api/clinics/${id}/address`);
      if (!r.ok) { setAddresses([]); return; }
      const d = await r.json();
      const list = Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : []);
      const token = localStorage.getItem("token") || "";
      const authHeaders = token ? { "Authorization": `Bearer ${token}` } : {};
      let branchCount = 0;
      const enriched = await Promise.all(
        list.map(async (a) => {
          try {
            const ar = await fetch(`${API_BASE}/api/address/${a.address_id}`, { headers: authHeaders });
            if (ar.ok) {
              const ad = await ar.json();
              const label = [ad.street, ad.building, ad.city].filter(Boolean).join(", ");
              if (label) return { ...a, _label: label };
            }
          } catch (_) {}
          branchCount++;
          return { ...a, _label: a.is_main ? "Main Branch" : `Branch ${branchCount}` };
        })
      );
      setAddresses(enriched);
    } catch (_) { setAddresses([]); }
  };

  const fetchSlots = async (dId, sId, caId, dt) => {
    if (!dId || !sId || !caId || !dt) { setSlots([]); return; }
    setLoadingSlots(true); setSlotId("");
    try {
      const url = `${API_BASE}/api/schedule/available-slots?doctor_id=${dId}&service_id=${sId}&clinic_address_id=${caId}&date=${dt}`;
      const r = await fetch(url);
      if (r.ok) {
        const d = await r.json();
        const raw = Array.isArray(d) ? d : [];
        const seen = new Set();
        setSlots(raw.filter(sl => { if (seen.has(sl.slot_start)) return false; seen.add(sl.slot_start); return true; }));
      } else { setSlots([]); }
    } catch (_) { setSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleParamChange = (field, value) => {
    const updated = { doctorId, serviceId, clinicAddressId, date, [field]: value };
    if (field === "doctorId")        setDoctorId(value);
    if (field === "serviceId")       setServiceId(value);
    if (field === "clinicAddressId") setClinicAddressId(value);
    if (field === "date")            setDate(value);
    setSlotId("");
    fetchSlots(updated.doctorId, updated.serviceId, updated.clinicAddressId, updated.date);
  };

  const handleSubmit = async () => {
    if (!doctorId || !clinicAddressId || !serviceId || !slotId || !date || !name || !email) return;
    setSubmitting(true);
    try {
      const payload = {
        doctor_id:         doctorId,
        clinic_address_id: clinicAddressId,
        service_id:        serviceId,
        slot_id:           slotId,
        date:              date,
        name:              name,
        email:             email,
      };
      const rawToken = localStorage.getItem("patient_token") || localStorage.getItem("token") || "";
      const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/appointment`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage(data.message || data.error || "Booking failed."); return; }
      setMessage(tx.success);
      setTimeout(() => setPage("home"), 2500);
    } catch (e) { setMessage(e.message || "Network error"); }
    finally { setSubmitting(false); }
  };

  const allReady = doctorId && clinicAddressId && serviceId && slotId && date && name.trim() && email.trim();
  const selectedSvc = services.find(s => s.id === serviceId);

  return (
    <main style={bs.page}>
      <div style={bs.wrap}>
        <div style={bs.backLink} onClick={() => setPage("home")}>← {tx.back.replace("← ", "")}</div>
        <h1 style={bs.title}>{tx.title}</h1>
        <p style={bs.sub}>{tx.sub}</p>

        <div style={bs.card}>
          <div style={bs.stepHead}>
            <div style={bs.stepNum(true)}>1</div>
            <span style={bs.stepTitle}>{tx.step1}</span>
          </div>
          <select style={bs.select} value={clinicId} onChange={(e) => handleClinicChange(e.target.value)}>
            <option value="">{tx.chooseClinic}</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {clinicId && addresses.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <label style={bs.label}>Branch / Address</label>
              <select style={bs.select} value={clinicAddressId}
                onChange={(e) => handleParamChange("clinicAddressId", e.target.value)}>
                <option value="">— Select branch —</option>
                {addresses.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.is_main ? "★ " : ""}{a._label || a.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          {clinicId && addresses.length === 0 && (
            <p style={bs.warn}>⚠ This clinic has no addresses yet.</p>
          )}
        </div>

        {clinicId && (
          <div style={bs.card}>
            <div style={bs.stepHead}>
              <div style={bs.stepNum(!!clinicAddressId)}>2</div>
              <span style={bs.stepTitle}>{tx.step2}</span>
            </div>
            {services.length === 0
              ? <p style={bs.muted}>No services available.</p>
              : <div style={bs.svcGrid}>
                  {services.map(sv => (
                    <div key={sv.id} style={bs.svcCard(serviceId === sv.id)}
                      onClick={() => { setServiceId(sv.id); fetchSlots(doctorId, sv.id, clinicAddressId, date); setSlotId(""); }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{sv.name}</div>
                      {sv.description && <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>{sv.description}</div>}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {sv.duration && <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>⏱ {sv.duration} min</span>}
                        {sv.price && <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.primary }}>₸ {Number(sv.price).toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {serviceId && (
          <div style={bs.card}>
            <div style={bs.stepHead}>
              <div style={bs.stepNum(true)}>3</div>
              <span style={bs.stepTitle}>{tx.completeBooking}</span>
            </div>

            <div style={bs.row}>
              <div style={bs.fg}>
                <label style={bs.label}>{tx.doctor}</label>
                <select style={{ ...bs.select }} value={doctorId}
                  onChange={(e) => handleParamChange("doctorId", e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                  onBlur={(e)  => (e.target.style.borderColor = COLORS.border)}>
                  <option value="">{tx.chooseDoctor}</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={bs.fg}>
                <label style={bs.label}>{tx.date}</label>
                <input style={bs.input} type="date" value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleParamChange("date", e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                  onBlur={(e)  => (e.target.style.borderColor = COLORS.border)} />
              </div>
            </div>

            <div style={bs.fg}>
              <label style={bs.label}>{tx.time}</label>
              {loadingSlots
                ? <p style={bs.muted}>Loading slots…</p>
                : !doctorId || !date || !clinicAddressId
                ? <p style={bs.muted}>Select doctor, branch and date to see available slots.</p>
                : slots.length === 0
                ? <p style={bs.warn}>⚠ No available slots for this date. Try a different date or doctor.</p>
                : <div style={bs.slotGrid}>
                    {slots.map(sl => (
                      <button key={sl.id} style={bs.slotBtn(slotId === sl.id)}
                        onClick={() => setSlotId(sl.id)}>
                        {fmtTime(sl.slot_start)}
                      </button>
                    ))}
                  </div>
              }
            </div>

            <div style={bs.row}>
              <div style={bs.fg}>
                <label style={bs.label}>{tx.fullName}</label>
                <input style={bs.input} type="text" value={name} placeholder={tx.fullNamePh}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                  onBlur={(e)  => (e.target.style.borderColor = COLORS.border)} />
              </div>
              <div style={bs.fg}>
                <label style={bs.label}>Email</label>
                <input style={bs.input} type="email" value={email} placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                  onBlur={(e)  => (e.target.style.borderColor = COLORS.border)} />
              </div>
            </div>

            {allReady && (
              <div style={{ background: COLORS.primaryLight, borderRadius: 10, padding: "14px 18px", marginBottom: 16, fontSize: isMobile ? 13 : 14 }}>
                <b>Summary:</b> {selectedSvc?.name} · {date} · {fmtTime(slots.find(s => s.id === slotId)?.slot_start)} – {fmtTime(slots.find(s => s.id === slotId)?.slot_end)}
              </div>
            )}

            <button style={bs.submitBtn(!!allReady && !submitting)} onClick={handleSubmit} disabled={!allReady || submitting}>
              {submitting ? "Booking…" : tx.bookBtn}
            </button>
            {message && (
              <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, fontWeight: 600, color: message === tx.success ? "#22c55e" : "#ef4444" }}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
