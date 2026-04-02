import { useState, useEffect } from "react";
import { COLORS } from "./constants";
import { T } from "./translation";
import { useResponsive } from "./useResponsive";

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080" : "";

const PALETTE = [
  { color: "#3B5BDB", bg: "#EEF2FF", icon: "M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 14a6 6 0 0 0-4 5.5V20h20v-.5A6 6 0 0 0 18 14" },
  { color: "#10B981", bg: "#ECFDF5", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { color: "#8B5CF6", bg: "#F5F3FF", icon: "M12 3l1.5 3.5L17 7.5l-2.5 2.5.5 3.5L12 11.5 9 13.5l.5-3.5L7 7.5l3.5-.5z" },
  { color: "#EF4444", bg: "#FEF2F2", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { color: "#F59E0B", bg: "#FFFBEB", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { color: "#EC4899", bg: "#FDF2F8", icon: "M6 3h12M6 8h12M6 13l3 3-3 3M18 13l-3 3 3 3" },
];

function getCfg(i) { return PALETTE[i % PALETTE.length]; }

function CategoryIcon({ d, color, bg }) {
  return (
    <div style={{ width: 56, height: 56, background: bg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d={d} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid #E5E7EB", borderLeft: "4px solid #E5E7EB" }}>
      {[{ w: "56px", h: 56 }, { w: "70%", h: 20 }, { w: "100%", h: 13 }, { w: "85%", h: 13 }, { w: "35%", h: 20 }].map((r, i) => (
        <div key={i} style={{ height: r.h, width: r.w, background: "#E9EDF5", borderRadius: 6, marginBottom: 12, animation: "skpulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

export default function HomePage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.home || T.EN.home;
  const { isMobile, isTablet } = useResponsive();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const fetchServices = () => {
    setLoading(true); setError("");
    fetch(`${API_BASE}/api/services`)
      .then(async (r) => {
        if (!r.ok) { const text = await r.text(); throw new Error(`Server error ${r.status}: ${text.trim()}`); }
        return r.json();
      })
      .then((d) => {
        const list = Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : d.services || []);
        setServices(list.filter((sv) => sv.is_active !== false));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const displayed = showAll ? services : services.slice(0, 6);

  const gridCols = isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
  const heroPadding = isMobile ? "32px 20px" : isTablet ? "0 0 0 40px" : "0 0 0 80px";
  const heroTitleSize = isMobile ? 32 : isTablet ? 42 : 58;
  const sectionPadding = isMobile ? "48px 16px 24px" : isTablet ? "56px 40px 24px" : "64px 80px 24px";

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8F9FF" }}>
      <style>{`
        @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .svc-card:hover { box-shadow: 0 10px 32px rgba(0,0,0,0.13) !important; transform: translateY(-3px) !important; }
        .hero-btn:hover { background: #2f4abf !important; transform: translateY(-1px) !important; }
        .view-btn:hover { background: #3B5BDB !important; color: #fff !important; }
      `}</style>

      {/* HERO */}
      <section style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        minHeight: isMobile ? "auto" : 520,
        padding: isMobile ? "0" : "0",
        background: "linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 50%, #E8F5F0 100%)",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          flex: isMobile ? "unset" : "0 0 45%",
          padding: isMobile ? "40px 20px 32px" : isTablet ? "60px 32px 60px 40px" : "60px 48px 60px 80px",
          zIndex: 1,
          order: isMobile ? 2 : 1,
        }}>
          <h1 style={{ fontSize: heroTitleSize, fontWeight: 900, color: "#0F172A", lineHeight: 1.08, marginBottom: 24, letterSpacing: isMobile ? -0.5 : -2, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {tx.heroTitle}
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: "#64748B", lineHeight: 1.75, marginBottom: 32, maxWidth: isMobile ? "100%" : 400 }}>
            {tx.heroSub}
          </p>
          <button
            className="hero-btn"
            style={{ padding: isMobile ? "13px 28px" : "16px 40px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 12, fontSize: isMobile ? 15 : 17, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 6px 24px rgba(59,91,219,0.4)", letterSpacing: 0.2 }}
            onClick={() => setPage("booking")}
          >
            {tx.heroBtn}
          </button>
        </div>

        <div style={{
          flex: isMobile ? "unset" : "0 0 55%",
          height: isMobile ? 220 : "auto",
          alignSelf: isMobile ? "stretch" : "stretch",
          overflow: "hidden",
          borderRadius: isMobile ? 0 : "20px 0 0 20px",
          marginLeft: isMobile ? 0 : "auto",
          order: isMobile ? 1 : 2,
        }}>
          <img
            src="https://images.unsplash.com/photo-1629909615184-74f495363b67?w=1000&q=85"
            alt="Dental Clinic"
            style={{ width: "100%", height: "100%", minHeight: isMobile ? 220 : 520, objectFit: "cover", objectPosition: "center", display: "block" }}
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1000&q=85"; }}
          />
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: sectionPadding }}>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? 26 : 36, fontWeight: 800, color: "#0F172A", marginBottom: 32, letterSpacing: -0.5 }}>
          {tx.servicesTitle}
        </h2>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <p style={{ color: "#EF4444", fontSize: 14, marginBottom: 16 }}>⚠ {error}</p>
            <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 20 }}>
              {tx.backendHint} <code style={{ background: "#F1F5F9", padding: "2px 6px", borderRadius: 4 }}>localhost:8080</code>
            </p>
            <button onClick={fetchServices} style={{ padding: "10px 28px", background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {tx.retry}
            </button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: 48, fontSize: 15 }}>{tx.noServices}</p>
        )}

        {!loading && !error && services.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 24 }}>
            {displayed.map((sv, i) => {
              const cfg = getCfg(i);
              return (
                <div key={sv.id} className="svc-card" style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid #E5E7EB", borderLeft: `4px solid ${cfg.color}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s" }}>
                  <CategoryIcon d={cfg.icon} color={cfg.color} bg={cfg.bg} />
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>{sv.name}</div>
                  <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, flex: 1 }}>{sv.description}</div>
                  {sv.duration > 0 && (
                    <div style={{ fontSize: 12, color: cfg.color, fontWeight: 600, marginTop: 12 }}>⏱ {sv.duration} {tx.min}</div>
                  )}
                  <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color, marginTop: 8 }}>
                    ₸ {Number(sv.price).toLocaleString()} KZT
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {!loading && !error && services.length > 6 && (
        <div style={{ textAlign: "center", padding: "28px 0 56px" }}>
          <button
            className="view-btn"
            style={{ padding: "12px 36px", background: "transparent", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? tx.showLess : tx.viewAll}
          </button>
        </div>
      )}
      {!loading && services.length <= 6 && <div style={{ height: 56 }} />}
    </main>
  );
}
