import { useState, useEffect } from "react";
import { COLORS } from "./constants";
import { T } from "./translation";

const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080" : "";

const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const ClinicIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const PriceIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="12" y1="15" x2="12" y2="9"/><path d="M8 12h8"/></svg>;

export default function ServicesPage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.services || T.EN.services;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [clinic, setClinic] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/services`);
        const d = await r.json();
        setServices(Array.isArray(d) ? d : d.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filtered = services.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesClinic = clinic === "All" || s.clinic_name === clinic;
    const matchesPrice = !maxPrice || s.price <= parseFloat(maxPrice);
    return matchesSearch && matchesClinic && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === "priceLow") return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    if (sortBy === "duration") return a.duration - b.duration;
    return a.name?.localeCompare(b.name);
  });

  const clinicsList = ["All", ...new Set(services.map(s => s.clinic_name).filter(Boolean))];

  return (
    <main style={{ flex: 1, background: "#F8F9FF", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>{tx.title}</h1>
          <p style={{ color: "#64748B" }}>{tx.subtitle}</p>
        </header>

        <section style={{ background: "#fff", padding: "32px", borderRadius: 16, border: "1px solid #E5E7EB", marginBottom: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
            <FilterInput label={tx.searchLabel} icon={<SearchIcon />} value={search} onChange={setSearch} placeholder={tx.searchPh} />
            <FilterSelect label={tx.clinicLabel} icon={<ClinicIcon />} value={clinic} onChange={setClinic} options={clinicsList} />
            <FilterInput label={tx.priceLabel} icon={<PriceIcon />} value={maxPrice} onChange={setMaxPrice} placeholder={tx.pricePh} type="number" />
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}>{tx.sortBy}:</span>
            <SortBtn active={sortBy === "name"} onClick={() => setSortBy("name")}>{tx.sortName}</SortBtn>
            <SortBtn active={sortBy === "priceLow"} onClick={() => setSortBy("priceLow")}>{tx.sortPriceLow}</SortBtn>
            <SortBtn active={sortBy === "priceHigh"} onClick={() => setSortBy("priceHigh")}>{tx.sortPriceHigh}</SortBtn>
            <SortBtn active={sortBy === "duration"} onClick={() => setSortBy("duration")}>{tx.sortDuration}</SortBtn>
          </div>
        </section>

        <p style={{ marginBottom: 24, color: "#64748B", fontSize: 14 }}>
          {tx.showing} <strong>{filtered.length}</strong> {tx.servicesCount}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
          {filtered.map(s => (
            <ServiceCard key={s.id} service={s} tx={tx} onBook={() => setPage("booking")} />
          ))}
        </div>
        
        {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Услуги не найдены</div>
        )}
      </div>
    </main>
  );
}

const FilterInput = ({ label, icon, value, onChange, placeholder, type="text" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", display: "flex", alignItems: "center", gap: 6 }}>{icon} {label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} 
           style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #E2E8F0", outline: "none", fontSize: 14 }} />
  </div>
);

const FilterSelect = ({ label, icon, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", display: "flex", alignItems: "center", gap: 6 }}>{icon} {label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} 
            style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", outline: "none", fontSize: 14, cursor: "pointer" }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const SortBtn = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{ 
    padding: "8px 20px", borderRadius: 8, border: "none", fontSize: 14, cursor: "pointer", transition: "all 0.2s",
    background: active ? COLORS.primary : "#F1F5F9", color: active ? "#fff" : "#64748B", fontWeight: 600
  }}>{children}</button>
);

function ServiceCard({ service, tx, onBook }) {
  return (
    <div style={{ background: "#fff", padding: "32px", borderRadius: 20, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 16, transition: "transform 0.2s", cursor: "default" }}>
      <div style={{ width: 48, height: 48, background: "#EFF6FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      </div>
      
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", marginBottom: 12 }}>{service.name}</h3>
        <div style={{ height: 2, width: 32, background: "#E2E8F0", marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: "#64748B", lineHeight: "1.5", minHeight: "45px" }}>{service.description || "Описание временно отсутствует..."}</p>
      </div>

      <div style={{ fontSize: 14, color: "#94A3B8", display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>📍</span> 
            <span style={{ fontWeight: 500, color: "#475569" }}>{service.clinic_name || "Клиника не указана"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🕒</span> 
            <span>{service.duration} {tx.min}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid #F1F5F9" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>{service.price} ₸</div>
        <button onClick={onBook} style={{ 
            padding: "10px 24px", background: COLORS.primary, color: "#fff", 
            border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer",
            boxShadow: `0 4px 14px ${COLORS.primary}40`
        }}>{tx.bookNow}</button>
      </div>
    </div>
  );
}