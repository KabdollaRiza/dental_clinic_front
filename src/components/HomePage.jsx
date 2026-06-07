import { useState, useEffect, useRef } from "react";
import { COLORS } from "./constants";
import { T } from "./translation";
import { useResponsive } from "./useResponsive";

const API_BASE = "http://161.35.116.104:8080";

const PALETTE = [
  { color: "#3B5BDB", bg: "#EEF2FF", icon: "M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 14a6 6 0 0 0-4 5.5V20h20v-.5A6 6 0 0 0 18 14" },
  { color: "#10B981", bg: "#ECFDF5", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { color: "#8B5CF6", bg: "#F5F3FF", icon: "M12 3l1.5 3.5L17 7.5l-2.5 2.5.5 3.5L12 11.5 9 13.5l.5-3.5L7 7.5l3.5-.5z" },
  { color: "#EF4444", bg: "#FEF2F2", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { color: "#F59E0B", bg: "#FFFBEB", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { color: "#EC4899", bg: "#FDF2F8", icon: "M6 3h12M6 8h12M6 13l3 3-3 3M18 13l-3 3 3 3" },
];

const SPEC_COLORS = ["#3B5BDB", "#10B981", "#EC4899", "#F59E0B", "#8B5CF6", "#EF4444"];
const MOCK_RATINGS = [4.9, 5.0, 4.8, 4.7, 4.9, 4.8];
const MOCK_REVIEWS = [248, 312, 195, 167, 203, 189];

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

function DoctorAvatar({ name, size = 80 }) {
  const initials = name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "DR";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 800, color: "#fff", flexShrink: 0, margin: "0 auto" }}>
      {initials}
    </div>
  );
}

function StarRatingSmall({ rating }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={i < Math.floor(rating) ? "#F59E0B" : "#E5E7EB"} />
        </svg>
      ))}
    </span>
  );
}

export default function HomePage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.home || T.EN.home;
  const dtx = T[lang]?.doctors || T.EN.doctors;
  const { isMobile, isTablet } = useResponsive();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef(null);

  const fetchServices = async () => {
    setLoading(true); setError("");
    try {
      const cr = await fetch(`${API_BASE}/api/clinics`);
      if (!cr.ok) throw new Error(`Server error ${cr.status}`);
      const cd = await cr.json();
      const clinicList = Array.isArray(cd) ? cd : (Array.isArray(cd.data) ? cd.data : []);
      const results = await Promise.all(
        clinicList.map(async (clinic) => {
          const id = clinic.id || clinic.Id;
          if (!id) return [];
          try {
            const r = await fetch(`${API_BASE}/api/clinics/${id}/services`);
            if (!r.ok) return [];
            const d = await r.json();
            return Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : []);
          } catch { return []; }
        })
      );
      setServices(results.flat().filter((sv) => sv.is_active !== false));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/doctors`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        const list = Array.isArray(d) ? d : (d.doctors || d.data || []);
        setDoctors(list);
      })
      .catch(() => {});
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (doctors.length < 2) return;
    const id = setInterval(() => {
      setCarouselIdx((i) => (i + 1) % doctors.length);
    }, 4000);
    return () => clearInterval(id);
  }, [doctors.length]);

  const prevDoc = () => setCarouselIdx((i) => (i - 1 + doctors.length) % doctors.length);
  const nextDoc = () => setCarouselIdx((i) => (i + 1) % doctors.length);

  const displayed = showAll ? services : services.slice(0, 6);

  const gridCols = isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
  const heroTitleSize = isMobile ? 32 : isTablet ? 42 : 58;
  const sectionPadding = isMobile ? "48px 16px 24px" : isTablet ? "56px 40px 24px" : "64px 80px 24px";

  // Carousel: show center + 2 side cards
  const visibleDocs = doctors.length > 0
    ? [-1, 0, 1].map((offset) => {
        const idx = (carouselIdx + offset + doctors.length) % doctors.length;
        return { doc: doctors[idx], offset, idx };
      })
    : [];

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8F9FF" }}>
      <style>{`
        @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .svc-card:hover { box-shadow: 0 10px 32px rgba(0,0,0,0.13) !important; transform: translateY(-3px) !important; }
        .hero-btn:hover { background: #2f4abf !important; transform: translateY(-1px) !important; }
        .view-btn:hover { background: #3B5BDB !important; color: #fff !important; }
        .carousel-card { transition: transform 0.35s ease, box-shadow 0.35s ease, opacity 0.35s ease; }
        .carousel-nav-btn:hover { background: #3B5BDB !important; color: #fff !important; }
        .carousel-book-btn:hover { background: #2f4abf !important; }
      `}</style>

      {/* HERO */}
      <section style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        minHeight: isMobile ? "auto" : 520,
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
              {tx.backendHint} <code style={{ background: "#F1F5F9", padding: "2px 6px", borderRadius: 4 }}>161.35.116.104:8080</code>
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
      {!loading && services.length <= 6 && <div style={{ height: 40 }} />}

      {/* DOCTORS CAROUSEL */}
      {doctors.length > 0 && (
        <section style={{ background: "#fff", padding: isMobile ? "48px 0 40px" : "64px 0 56px", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ textAlign: "center", padding: isMobile ? "0 16px 32px" : "0 80px 40px" }}>
            <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, color: "#0F172A", marginBottom: 12, letterSpacing: -0.5 }}>
              {dtx.meetTitle}
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 15, color: "#64748B", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              {dtx.meetSubtitle}
            </p>
          </div>

          {/* Carousel track */}
          <div
            ref={carouselRef}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? 12 : 20,
              padding: isMobile ? "0 40px 8px" : "0 80px 8px",
              minHeight: isMobile ? 320 : 380,
            }}
          >
            {/* Left arrow */}
            <button
              className="carousel-nav-btn"
              onClick={prevDoc}
              style={{
                position: "absolute",
                left: isMobile ? 4 : 24,
                zIndex: 10,
                width: isMobile ? 36 : 44,
                height: isMobile ? 36 : 44,
                borderRadius: "50%",
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                fontSize: 18,
                color: "#0F172A",
                transition: "all 0.2s",
              }}
            >
              ‹
            </button>

            {/* Cards */}
            {visibleDocs.map(({ doc, offset, idx }) => {
              const color = SPEC_COLORS[idx % SPEC_COLORS.length];
              const rating = MOCK_RATINGS[idx % MOCK_RATINGS.length];
              const reviews = MOCK_REVIEWS[idx % MOCK_REVIEWS.length];
              const isCenter = offset === 0;
              return (
                <div
                  key={`${offset}-${doc.id}`}
                  className="carousel-card"
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: isCenter ? "28px 24px 24px" : "20px 18px 18px",
                    border: "1px solid #E5E7EB",
                    borderBottom: `4px solid ${color}`,
                    boxShadow: isCenter
                      ? "0 16px 48px rgba(0,0,0,0.16)"
                      : "0 4px 16px rgba(0,0,0,0.07)",
                    width: isMobile ? (isCenter ? 240 : 140) : (isCenter ? 320 : 220),
                    flexShrink: 0,
                    opacity: isCenter ? 1 : 0.7,
                    transform: isCenter ? "scale(1) translateY(-8px)" : "scale(0.92) translateY(0)",
                    zIndex: isCenter ? 2 : 1,
                    textAlign: "center",
                    display: isMobile && !isCenter ? "none" : "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {idx < 5 && (
                    <div style={{ alignSelf: "flex-end", background: COLORS.primary, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "3px 9px", marginBottom: 8 }}>
                      Top Rated
                    </div>
                  )}
                  <DoctorAvatar name={doc.name} size={isCenter ? 88 : 64} />
                  <div style={{ fontSize: isCenter ? 16 : 13, fontWeight: 800, color: "#0F172A", marginTop: 12, marginBottom: 3 }}>
                    {doc.name}
                  </div>
                  {doc.specialization && (
                    <div style={{ fontSize: isCenter ? 12 : 11, fontWeight: 700, color, marginBottom: 8 }}>
                      {doc.specialization}
                    </div>
                  )}
                  {isCenter && (
                    <>
                      {doc.description && (
                        <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55, marginBottom: 10, WebkitLineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" }}>
                          {doc.description}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14, justifyContent: "center" }}>
                        <StarRatingSmall rating={rating} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{rating}</span>
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>({reviews})</span>
                      </div>
                      {doc.experience > 0 && (
                        <div style={{ fontSize: 12, color: "#16A34A", fontWeight: 600, marginBottom: 14 }}>
                          {doc.experience}+ {dtx.yearsExp} Experience
                        </div>
                      )}
                      <button
                        className="carousel-book-btn"
                        onClick={() => setPage("booking")}
                        style={{ width: "100%", padding: "11px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.2s" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        Book Appointment
                      </button>
                    </>
                  )}
                  {!isCenter && doc.experience > 0 && (
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                      {doc.experience}+ {dtx.yearsExp}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Right arrow */}
            <button
              className="carousel-nav-btn"
              onClick={nextDoc}
              style={{
                position: "absolute",
                right: isMobile ? 4 : 24,
                zIndex: 10,
                width: isMobile ? 36 : 44,
                height: isMobile ? 36 : 44,
                borderRadius: "50%",
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                fontSize: 18,
                color: "#0F172A",
                transition: "all 0.2s",
              }}
            >
              ›
            </button>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {doctors.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIdx(i)}
                style={{
                  width: i === carouselIdx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  background: i === carouselIdx ? COLORS.primary : "#CBD5E1",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>

          {/* View All Doctors link */}
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button
              className="view-btn"
              onClick={() => setPage("doctors")}
              style={{ padding: "11px 32px", background: "transparent", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >
              View All Doctors
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
