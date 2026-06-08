import { COLORS } from "./constants";
import { SmileIcon } from "./Icons";
import { T } from "./translation";
import { useResponsive } from "./useResponsive";

export default function Footer({ lang = "EN" }) {
  const tx = T[lang]?.footer || T.EN.footer;
  const { isMobile, isTablet } = useResponsive();
  const col = { fontSize: 14, color: "#94A3B8", lineHeight: 1.9, cursor: "pointer" };
  const heading = { fontSize: 15, fontWeight: 700, color: "#CBD5E1", marginBottom: 16 };

  const padding = isMobile ? "36px 20px 24px" : isTablet ? "40px 40px 24px" : "48px 80px 28px";
  const gridCols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1.4fr 1fr";
  const gridGap = isMobile ? 28 : isTablet ? 32 : 48;

  return (
    <footer style={{ background: "#0F172A", padding }}>
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: gridGap, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, background: COLORS.primary, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <SmileIcon size={18} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Dental Clinic</span>
          </div>
          <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.75, maxWidth: isMobile ? "100%" : 280, margin: 0 }}>{tx.desc}</p>
        </div>

        <div>
          <div style={heading}>{tx.contact}</div>
          <div style={{ ...col, wordBreak: "break-word" }}>{tx.email}</div>
          <div style={col}>{tx.phone}</div>
          <div style={col}>{tx.address}</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1E293B", paddingTop: 20, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 6 : 0 }}>
        <span style={{ fontSize: 13, color: "#475569" }}>{tx.copy}</span>
        <span style={{ fontSize: 13, color: "#475569" }}>{tx.team}</span>
      </div>
    </footer>
  );
}
