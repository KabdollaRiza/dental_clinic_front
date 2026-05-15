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
  const [allDoctors, setAllDoctors] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [slots,     setSlots]     = useState([]);

  const [clinicId,         setClinicId]         = useState("");
  const [clinicAddressId,  setClinicAddressId]   = useState("");
  const [serviceId,        setServiceId]         = useState("");
  const [doctorId,         setDoctorId]          = useState("");
  const [date,             setDate]              = useState("");
  const [slotId,           setSlotId]            = useState("");

  const filteredDoctors = clinicId ? allDoctors.filter(d => d.clinic_id === clinicId) : [];

  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");

  const [loadingSlots,   setLoadingSlots]   = useState(false);
  const [message,        setMessage]        = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [booked,         setBooked]         = useState(false);
  const [bookedSlotIds,  setBookedSlotIds]  = useState(new Set());

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
    slotBtn:  (sel, booked) => ({ padding: "10px 0", border: `2px solid ${booked ? "#E5E7EB" : sel ? COLORS.primary : COLORS.border}`, borderRadius: 8, background: booked ? "#F3F4F6" : sel ? COLORS.primary : COLORS.white, color: booked ? "#C1C7D0" : sel ? "#fff" : COLORS.text, fontSize: 13, fontWeight: 600, cursor: booked ? "not-allowed" : "pointer", textAlign: "center", transition: "all 0.15s" }),
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
    load("/api/doctors",  setAllDoctors);

    // Pre-select clinic if coming from ClinicsPage
    try {
      const saved = sessionStorage.getItem("selectedClinic");
      if (saved) {
        const clinic = JSON.parse(saved);
        if (clinic?.id) handleClinicChange(clinic.id);
        sessionStorage.removeItem("selectedClinic");
      }
    } catch (_) {}

    // Pre-fill name & email and load booked slot IDs if patient is logged in
    const token = localStorage.getItem("patient_token");
    if (token) {
      try {
        const claims = JSON.parse(atob(token.split(".")[1]));
        if (claims.name  || claims.Name)  setName(claims.name  || claims.Name);
        if (claims.email || claims.Email) setEmail(claims.email || claims.Email);
      } catch (_) {}
      const loadBooked = async () => {
        try {
          const r = await fetch(`${API_BASE}/api/appointment/my-appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const appts = await r.json();
            const list = Array.isArray(appts) ? appts : (Array.isArray(appts?.data) ? appts.data : []);
            // Normalize to "YYYY-MM-DD HH:MM" — backend uses space separator, slots use T
            const times = new Set(
              list.map(a => {
                const t = a.start_time || a.Start_time || a.slot_start || a.SlotStart;
                return t ? t.replace("T", " ").slice(0, 16) : null;
              }).filter(Boolean)
            );
            setBookedSlotIds(times);
          }
        } catch (_) {}
      };
      loadBooked();
    }
  }, []);

  const handleClinicChange = async (id) => {
    setClinicId(id);
    setClinicAddressId(""); setServiceId(""); setDoctorId(""); setSlotId(""); setSlots([]);
    if (!id) { setAddresses([]); setServices([]); return; }
    try {
      const r = await fetch(`${API_BASE}/api/clinics/${id}/address`);
      if (!r.ok) { setAddresses([]); }
      else {
        const d = await r.json();
        const list = Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : []);
        const enriched = list.map(a => {
          const label = [a.address_name, a.address_building].filter(Boolean).join(", ");
          return { ...a, _label: label || a.id };
        });
        setAddresses(enriched);
      }
    } catch (_) { setAddresses([]); }
    try {
      const r = await fetch(`${API_BASE}/api/clinics/${id}/services`);
      if (r.ok) {
        const d = await r.json();
        const clinicSvcs = Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : []);

        // The clinic services response returns clinic_service.id (junction table),
        // but available-slots and appointment APIs need the catalog service_id.
        // Cross-reference by name using the global catalog.
        try {
          const _tryValid = (t) => { try { const r = t.replace(/^Bearer\s+/i,""); const p = JSON.parse(atob(r.split(".")[1])); return !p.exp || Date.now()/1000 < p.exp; } catch(_){return false;} };
          const _pt = localStorage.getItem("patient_token") || ""; const _at = localStorage.getItem("token") || "";
          const rawToken = _tryValid(_pt) ? _pt : _at;
          const token = rawToken.replace(/^Bearer\s+/i, "");
          const catR = await fetch(`${API_BASE}/api/services`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
          if (catR.ok) {
            const catD = await catR.json();
            const catalog = Array.isArray(catD) ? catD : (Array.isArray(catD.data) ? catD.data : []);
            const nameToId = {};
            catalog.forEach(sv => { nameToId[sv.name] = sv.id; });
            setServices(clinicSvcs.map(sv => ({ ...sv, _catalog_id: nameToId[sv.name] || null })));
            return;
          }
        } catch (_) {}

        setServices(clinicSvcs);
      } else { setServices([]); }
    } catch (_) { setServices([]); }
  };

  const fetchSlots = async (dId, sId, caId, dt) => {
    if (!dId || !sId || !caId || !dt) { setSlots([]); return; }
    setLoadingSlots(true); setSlotId("");
    try {
      const url = `${API_BASE}/api/schedule/available-slots?doctor_id=${dId}&service_id=${sId}&clinic_address_id=${caId}&date=${dt}`;
      const r = await fetch(url);
      if (r.ok) {
        const d = await r.json();
        const raw = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
        const seen = new Set();
        const unique = raw.filter(s => { if (seen.has(s.slot_start)) return false; seen.add(s.slot_start); return true; });
        setSlots(unique);
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
      const token = rawToken.replace(/^Bearer\s+/i, "");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/appointment`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage(data.message || data.error || "Booking failed."); return; }
      setBooked(true);
      const bookedSlot = slots.find(sl => sl.id === slotId);
      if (bookedSlot?.slot_start) {
        setBookedSlotIds(prev => new Set([...prev, bookedSlot.slot_start.replace("T", " ").slice(0, 16)]));
      }
      setMessage(tx.success);
      setTimeout(() => {
        setBooked(false);
        setClinicId(""); setClinicAddressId(""); setServiceId(""); setDoctorId("");
        setDate(""); setSlotId(""); setSlots([]); setName(""); setEmail("");
        setPage("home");
      }, 2500);
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
              <label style={bs.label}>{tx.branch}</label>
              <select style={bs.select} value={clinicAddressId}
                onChange={(e) => handleParamChange("clinicAddressId", e.target.value)}>
                <option value="">{tx.chooseBranch}</option>
                {addresses.map(a => (
                  <option key={a.id} value={a.id}>
                    {a._label || a.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          {clinicId && addresses.length === 0 && (
            <p style={bs.warn}>{tx.noAddresses}</p>
          )}
        </div>

        {clinicId && (
          <div style={bs.card}>
            <div style={bs.stepHead}>
              <div style={bs.stepNum(!!clinicAddressId)}>2</div>
              <span style={bs.stepTitle}>{tx.step2}</span>
            </div>
            {services.length === 0
              ? <p style={bs.muted}>{tx.noServices}</p>
              : <div style={bs.svcGrid}>
                  {services.map(sv => (
                    <div key={sv.id} style={bs.svcCard(serviceId === (sv._catalog_id || sv.id))}
                      onClick={() => { const sid = sv._catalog_id || sv.id; setServiceId(sid); fetchSlots(doctorId, sid, clinicAddressId, date); setSlotId(""); }}>
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
                  {filteredDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
                ? <p style={bs.muted}>{tx.loadingSlots}</p>
                : !doctorId || !date || !clinicAddressId
                ? <p style={bs.muted}>{tx.selectToSeeSlots}</p>
                : slots.length === 0
                ? <p style={bs.warn}>{tx.noSlots}</p>
                : <div style={bs.slotGrid}>
                    {slots.filter(sl => !bookedSlotIds.has((sl.slot_start || "").replace("T", " ").slice(0, 16))).map(sl => (
                      <button key={sl.id} style={bs.slotBtn(slotId === sl.id, false)}
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
                <input style={bs.input} type="email" value={email} placeholder={tx.emailPh}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                  onBlur={(e)  => (e.target.style.borderColor = COLORS.border)} />
              </div>
            </div>

            {allReady && (
              <div style={{ background: COLORS.primaryLight, borderRadius: 10, padding: "14px 18px", marginBottom: 16, fontSize: isMobile ? 13 : 14 }}>
                <b>{tx.summary}</b> {selectedSvc?.name} · {date} · {fmtTime(slots.find(s => s.id === slotId)?.slot_start)} – {(() => { const sl = slots.find(s => s.id === slotId); if (!sl || !selectedSvc?.duration) return "—"; const end = new Date(new Date(sl.slot_start).getTime() + selectedSvc.duration * 60000); return end.toISOString().match(/T(\d{2}:\d{2})/)?.[1] || "—"; })()}
              </div>
            )}

            <button style={bs.submitBtn(!!allReady && !submitting && !booked)} onClick={handleSubmit} disabled={!allReady || submitting || booked}>
              {submitting ? tx.bookingProgress : tx.bookBtn}
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
