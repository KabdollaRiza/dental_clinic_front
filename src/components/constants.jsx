export const COLORS = {
  primary: "#3B5BDB",
  primaryDark: "#2f4abf",
  primaryLight: "#EEF2FF",
  bg: "#F4F6FA",
  white: "#FFFFFF",
  text: "#1A1A2E",
  muted: "#6B7280",
  border: "#E5E7EB",
};

export const styles = {
  main: { flex: 1, display: "flex", flexDirection: "column" },

  // Hero
  hero: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 48px 60px", textAlign: "center" },
  heroIcon: { width: 72, height: 72, background: COLORS.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 },
  heroTitle: { fontSize: 44, fontWeight: 800, color: COLORS.text, marginBottom: 16, lineHeight: 1.15 },
  heroDesc: { fontSize: 16, color: COLORS.muted, maxWidth: 520, lineHeight: 1.7, marginBottom: 36 },
  heroBtn: { padding: "14px 36px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "background 0.2s", boxShadow: "0 4px 16px rgba(59,91,219,0.25)" },

  // Services
  servicesSection: { padding: "40px 48px 80px" },
  servicesTitle: { textAlign: "center", fontSize: 28, fontWeight: 700, color: COLORS.text, marginBottom: 36 },
  servicesGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" },
  serviceCard: { background: COLORS.white, borderRadius: 14, padding: "28px 24px", border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  serviceBadge: { display: "inline-block", background: COLORS.primary, color: "#fff", fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "3px 12px", marginBottom: 14, letterSpacing: 0.3 },
  serviceTitle: { fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 },
  serviceDesc: { fontSize: 14, color: COLORS.muted, lineHeight: 1.6 },
  servicePrice: { fontSize: 22, fontWeight: 800, color: COLORS.primary, marginTop: 16 },
  serviceBookBtn: { marginTop: 16, width: "100%", padding: "10px", background: COLORS.primaryLight, color: COLORS.primary, border: `1px solid ${COLORS.primary}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },

  // Auth card
  authWrap: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" },
  authCard: { background: COLORS.white, borderRadius: 18, padding: "44px 40px", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: `1px solid ${COLORS.border}` },
  authIcon: { width: 64, height: 64, background: COLORS.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
  authTitle: { fontSize: 26, fontWeight: 800, color: COLORS.text, textAlign: "center", marginBottom: 6 },
  authSub: { fontSize: 14, color: COLORS.muted, textAlign: "center", marginBottom: 28 },
  formGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 7 },
  input: { width: "100%", padding: "11px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, color: COLORS.text, outline: "none", boxSizing: "border-box", transition: "border 0.2s", background: COLORS.white },
  submitBtn: { width: "100%", padding: "13px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4, transition: "background 0.2s" },
  authSwitch: { textAlign: "center", marginTop: 20, fontSize: 14, color: COLORS.muted },
  authLink: { color: COLORS.primary, fontWeight: 600, cursor: "pointer", textDecoration: "none" },
  roleWrap: { display: "flex", gap: 12, marginBottom: 20 },
  roleBtn: (active) => ({ flex: 1, padding: "16px 12px", border: `2px solid ${active ? COLORS.primary : COLORS.border}`, borderRadius: 10, background: active ? COLORS.primaryLight : COLORS.white, color: active ? COLORS.primary : COLORS.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, transition: "all 0.2s" }),
};
