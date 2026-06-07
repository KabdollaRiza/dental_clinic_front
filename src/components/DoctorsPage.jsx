import { useState, useEffect } from "react";
import { COLORS } from "./constants";
import { T } from "./translation";
import { useResponsive } from "./useResponsive";

const API_BASE = "http://161.35.116.104:8080";

const SPEC_COLORS = [
  "#3B5BDB", "#10B981", "#EC4899", "#F59E0B", "#8B5CF6", "#EF4444",
];


function getSpecColor(idx) {
  return SPEC_COLORS[idx % SPEC_COLORS.length];
}

function AvatarPlaceholder({ name, size = 100 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "DR";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.3,
        fontWeight: 800,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function DoctorCard({ doctor, idx, onBook }) {
  const color = getSpecColor(idx);
  const isTopRated = idx < 5;

  return (
    <div
      className="doctor-card"
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "28px 24px 24px",
        border: "1px solid #E5E7EB",
        borderBottom: `4px solid ${color}`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
    >
      {isTopRated && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: COLORS.primary,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 20,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z" />
          </svg>
          Top Rated
        </div>
      )}

      <div style={{ marginBottom: 14, position: "relative" }}>
        <AvatarPlaceholder name={doctor.name} size={96} />
      </div>

      <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
        {doctor.name}
      </div>

      {doctor.specialization && (
        <div style={{ fontSize: 13, fontWeight: 700, color: color, marginBottom: 10 }}>
          {doctor.specialization}
        </div>
      )}

      {doctor.experience > 0 && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#F0FDF4",
            border: "1px solid #BBFEDE",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            color: "#16A34A",
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
          {doctor.experience}+ years Experience
        </div>
      )}

      {doctor.description && (
        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 12, minHeight: 40 }}>
          {doctor.description}
        </p>
      )}

      <button
        className="book-btn"
        onClick={() => onBook(doctor)}
        style={{
          width: "100%",
          padding: "12px",
          background: COLORS.primary,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          transition: "background 0.2s",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Book Appointment
      </button>

    </div>
  );
}

export default function DoctorsPage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.doctors || T.EN.doctors;
  const { isMobile, isTablet } = useResponsive();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/doctors`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((d) => {
        const list = Array.isArray(d) ? d : (d.doctors || d.data || []);
        setDoctors(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cols = isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
  const pad = isMobile ? "24px 16px" : isTablet ? "40px 32px" : "56px 80px";


  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8F9FF" }}>
      <style>{`
        .doctor-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.14) !important; transform: translateY(-4px) !important; }
        .book-btn:hover { background: #2f4abf !important; }
        @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 60%, #E8F5F0 100%)",
          padding: isMobile ? "40px 16px 32px" : "60px 80px 48px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#EEF2FF",
            border: "1px solid #C7D2FE",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.primary,
            marginBottom: 18,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z" />
          </svg>
          {tx.badge}
        </div>
        <h1
          style={{
            fontSize: isMobile ? 30 : isTablet ? 40 : 52,
            fontWeight: 900,
            color: "#0F172A",
            marginBottom: 16,
            letterSpacing: -1,
            fontFamily: "'Georgia', 'Times New Roman', serif",
          }}
        >
          {tx.title}
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: "#64748B", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          {tx.subtitle}
        </p>
      </section>


      {/* Doctors Grid */}
      <section style={{ padding: pad, flex: 1 }}>
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #E5E7EB", textAlign: "center" }}>
                <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#E9EDF5", margin: "0 auto 14px", animation: "skpulse 1.5s infinite" }} />
                {[{ w: "60%", h: 18 }, { w: "45%", h: 14 }, { w: "70%", h: 12 }].map((r, j) => (
                  <div key={j} style={{ height: r.h, width: r.w, background: "#E9EDF5", borderRadius: 6, margin: "0 auto 10px", animation: "skpulse 1.5s infinite" }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <p style={{ color: "#EF4444", fontSize: 14, marginBottom: 16 }}>⚠ {error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "10px 28px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              {tx.retry}
            </button>
          </div>
        )}

        {!loading && !error && doctors.length === 0 && (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: 64, fontSize: 15 }}>{tx.noDoctors}</p>
        )}

        {!loading && !error && doctors.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 24 }}>
            {doctors.map((doc, i) => (
              <DoctorCard key={doc.id} doctor={doc} idx={i} onBook={() => setPage("booking")} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #3B5BDB 0%, #2f4abf 100%)",
          padding: isMobile ? "48px 24px" : "64px 80px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "#fff", marginBottom: 14 }}>
          {tx.ctaTitle}
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.8)", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
          {tx.ctaSubtitle}
        </p>
        <button
          onClick={() => setPage("booking")}
          style={{
            padding: isMobile ? "12px 28px" : "14px 40px",
            background: "#fff",
            color: COLORS.primary,
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {tx.ctaBtn}
        </button>
      </section>
    </main>
  );
}
