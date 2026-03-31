import { COLORS } from "./constants";
import { SmileIcon } from "./Icons";
import { T } from "./translation";

export default function Footer({ lang = "EN" }) {
  const tx = T[lang]?.footer || T.EN.footer;
  const col = { fontSize: 14, color: "#94A3B8", lineHeight: 1.9, cursor: "pointer" };
  const heading = { fontSize: 15, fontWeight: 700, color: "#CBD5E1", marginBottom: 16 };

  return (
    <footer style={{ background: "#0F172A", padding: "48px 80px 28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, background: COLORS.primary, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SmileIcon size={18} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Dental Clinic</span>
          </div>
          <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.75, maxWidth: 280 }}>{tx.desc}</p>
        </div>

        <div>
          <div style={heading}>{tx.quickLinks}</div>
          {tx.links.map((l) => <div key={l} style={col}>{l}</div>)}
        </div>

        <div>
          <div style={heading}>{tx.contact}</div>
          <div style={col}>{tx.email}</div>
          <div style={col}>{tx.phone}</div>
          <div style={col}>{tx.address}</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1E293B", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#475569" }}>{tx.copy}</span>
        <span style={{ fontSize: 13, color: "#475569" }}>{tx.team}</span>
      </div>
    </footer>
  );
}
