import { useResponsive } from "./useResponsive";
import { COLORS } from "./constants";

const C = COLORS;

export function TableOrCards({ cols, items, actions, keyFn, th, td }) {
  const { isMobile } = useResponsive();

  const thStyle = th || {
    padding: "13px 18px", fontSize: 11, fontWeight: 700, color: C.muted,
    textAlign: "left", textTransform: "uppercase", letterSpacing: 0.6,
    borderBottom: `1px solid ${C.border}`,
  };
  const tdStyle = td || { padding: "14px 18px", fontSize: 14, color: C.text, borderBottom: `1px solid ${C.border}` };

  const tableStyle = {
    width: "100%", background: "#fff", border: `1px solid ${C.border}`,
    borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    borderCollapse: "collapse",
  };

  if (!isMobile) {
    return (
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={tableStyle} cellSpacing={0}>
          <thead style={{ background: "#F8F9FF" }}>
            <tr>
              {cols.map(col => <th key={col.key} style={thStyle}>{col.label}</th>)}
              {actions && <th style={thStyle} />}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={keyFn(item, idx)}>
                {cols.map(col => <td key={col.key} style={tdStyle}>{col.render(item)}</td>)}
                {actions && <td style={tdStyle}>{actions(item)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, idx) => (
        <div key={keyFn(item, idx)} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {cols.map(col => (
            <div key={col.key} style={{ marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.6, textTransform: "uppercase", flexShrink: 0, paddingTop: 2 }}>{col.label}</span>
              <span style={{ fontSize: 14, color: C.text, textAlign: "right", wordBreak: "break-word" }}>{col.render(item)}</span>
            </div>
          ))}
          {actions && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {actions(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
