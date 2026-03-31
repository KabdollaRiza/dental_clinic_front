import { useState, useEffect } from "react";
import { COLORS } from "./constants";
import { T } from "./translation";

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080" : "";

const Icon = ({ d, size = 16, color = "#64748B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PhoneIcon = () => <Icon d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />;
const MailIcon  = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />;
const SearchIcon = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" size={18} color="#94A3B8" />;
const ArrowRight = () => <Icon d="M9 18l6-6-6-6" size={18} color="#fff" />;

const CLINIC_IMGS = [
  "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80",
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80",
  "https://images.unsplash.com/photo-1598256989014-f5e7e0c2a48b?w=600&q=80",
  "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80",
];

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB" }}>
      <div style={{ height: 200, background: "#E9EDF5", animation: "skpulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "24px" }}>
        {[{ w: "65%", h: 22 }, { w: "80%", h: 14 }, { w: "60%", h: 14 }, { w: "40%", h: 14 }].map((r, i) => (
          <div key={i} style={{ height: r.h, width: r.w, background: "#E9EDF5", borderRadius: 6, marginBottom: 12, animation: "skpulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
  );
}

function ClinicCard({ clinic, index, onViewServices, tx }) {
  const imgSrc = CLINIC_IMGS[index % CLINIC_IMGS.length];
  return (
    <div className="clinic-card" style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s" }}>
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img src={imgSrc} alt={clinic.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.style.display = "none"; e.target.parentNode.style.background = "#CBD5E1"; }} />
        {clinic.is_active && (
          <div style={{ position: "absolute", top: 14, right: 14, background: "#fff", borderRadius: 20, padding: "5px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontSize: 12, fontWeight: 700, color: "#22c55e" }}>
            ● {tx.active}
          </div>
        )}
      </div>

      <div style={{ padding: "22px 24px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 14 }}>{clinic.name}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16, flex: 1 }}>
          {clinic.description && (
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55, marginBottom: 4 }}>{clinic.description}</div>
          )}
          {clinic.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748B" }}>
              <PhoneIcon /><span>{clinic.phone}</span>
            </div>
          )}
          {clinic.email && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748B" }}>
              <MailIcon /><span>{clinic.email}</span>
            </div>
          )}
          {clinic.website && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748B" }}>
              <Icon d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" size={16} />
              <a href={clinic.website} target="_blank" rel="noreferrer" style={{ color: COLORS.primary, textDecoration: "none" }}>
                {clinic.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>

        {(clinic.services_count > 0 || clinic.is_active) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            {clinic.is_active && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#22c55e", background: "#f0fdf4", padding: "3px 10px", borderRadius: 20 }}>● {tx.active}</span>
            )}
            {clinic.services_count > 0 && (
              <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary }}>
                {clinic.services_count} {tx.servicesAvail}
              </span>
            )}
          </div>
        )}

        <button
          className="view-services-btn"
          onClick={() => onViewServices(clinic)}
          style={{ width: "100%", padding: "12px 16px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
        >
          {tx.viewServices} <ArrowRight />
        </button>
      </div>
    </div>
  );
}

export default function ClinicsPage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.clinics || T.EN.clinics;
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("active");

  const fetchClinics = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API_BASE}/api/clinics`);
      if (!r.ok) { const text = await r.text(); throw new Error(`Server error ${r.status}: ${text.trim()}`); }
      const d = await r.json();
      const list = Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : d.clinics || []);
      const enriched = await Promise.all(list.map(async (clinic) => {
        try {
          const sr = await fetch(`${API_BASE}/api/clinics/${clinic.id}/services`);
          if (sr.ok) {
            const svs = await sr.json();
            const raw = Array.isArray(svs) ? svs : (Array.isArray(svs.data) ? svs.data : svs.services || []);
            return { ...clinic, services_count: raw.filter(sv => sv.is_active !== false).length };
          }
        } catch (_) {}
        return clinic;
      }));
      setClinics(enriched);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClinics(); }, []);

  const filtered = clinics
    .filter((c) => {
      const q = search.toLowerCase();
      return !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (b.is_active !== a.is_active) return b.is_active ? 1 : -1;
      return 0;
    });

  const handleViewServices = (clinic) => {
    sessionStorage.setItem("selectedClinic", JSON.stringify(clinic));
    setPage("booking");
  };

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8F9FF" }}>
      <style>{`
        @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .clinic-card:hover { box-shadow: 0 12px 36px rgba(0,0,0,0.12) !important; transform: translateY(-4px) !important; }
        .view-services-btn:hover { background: #2f4abf !important; }
      `}</style>

      <section style={{ padding: "56px 80px 40px", textAlign: "center", background: "linear-gradient(135deg, #EEF2FF 0%, #F8F9FF 60%, #ECFDF5 100%)" }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: "#0F172A", marginBottom: 12, letterSpacing: -0.5 }}>
          {tx.title}
        </h1>
        <p style={{ fontSize: 16, color: "#64748B", marginBottom: 36 }}>{tx.subtitle}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 280 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><SearchIcon /></span>
            <input
              style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, color: "#0F172A", outline: "none", background: "#fff", boxSizing: "border-box" }}
              placeholder={tx.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
            />
          </div>
          <select
            style={{ padding: "11px 16px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, color: "#0F172A", outline: "none", background: "#fff", cursor: "pointer" }}
            value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="active">{tx.activeFirst}</option>
            <option value="name">{tx.sortByName}</option>
          </select>
        </div>
      </section>

      <section style={{ padding: "40px 80px 60px" }}>
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <p style={{ color: "#EF4444", fontSize: 14, marginBottom: 16 }}>⚠ {error}</p>
            <button onClick={fetchClinics} style={{ padding: "10px 28px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {tx.retry}
            </button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🦷</div>
            <p style={{ color: "#94A3B8", fontSize: 16, fontWeight: 500 }}>
              {search ? `${tx.noResults} "${search}"` : tx.noClinic}
            </p>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 24 }}>
              {filtered.length} {tx.found}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
              {filtered.map((clinic, i) => (
                <ClinicCard key={clinic.id} clinic={clinic} index={i} onViewServices={handleViewServices} tx={tx} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
