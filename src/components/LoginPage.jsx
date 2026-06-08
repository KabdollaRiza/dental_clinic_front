import { useState } from "react";
import { COLORS, styles } from "./constants";
import { PersonIcon } from "./Icons";
import { T } from "./translation";
import { useResponsive } from "./useResponsive";

const EyeIcon = ({ show }) => (
  <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="1.8" viewBox="0 0 24 24" style={{ cursor: "pointer", flexShrink: 0 }}>
    {show
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

export default function LoginPage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.login || T.EN.login;
  const API_BASE = "http://161.35.116.104:8080";
  const { isMobile } = useResponsive();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { setMessage(tx.fillAll); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { setMessage(tx.invalidEmail); return; }

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok) { setMessage(data.message || "Login failed"); return; }

      const token = data.token || data.access_token || data.Token || data.AccessToken || data.jwt || "";
      const role = (data.role || data.Role || "").toLowerCase();

      if (role === "patient") {
        if (token) sessionStorage.setItem("patient_token", token);
        setMessage(tx.success);
        setTimeout(() => setPage("patientDashboard"), 700);
      } else {
        if (token) sessionStorage.setItem("token", token);
        setMessage(tx.success);
        setTimeout(() => {
          if (role === "doctor") setPage("doctor");
          else if (role === "clinic_admin") setPage("clinicAdmin");
          else setPage("admin");
        }, 700);
      }
    } catch (error) {
      setMessage(error?.message || "Network error");
    }
  };

  return (
    <main style={styles.main}>
      <div style={{ ...styles.authWrap, alignItems: isMobile ? "flex-start" : "center", padding: isMobile ? "32px 16px 80px" : "60px 24px", overflowY: "auto" }}>
        <div style={styles.authCard}>
          <div style={styles.authIcon}><PersonIcon size={30} /></div>
          <h2 style={styles.authTitle}>{tx.title}</h2>
          <p style={styles.authSub}>{tx.sub}</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>{tx.email}</label>
            <input style={styles.input} type="email" name="email" placeholder={tx.emailPh}
              value={formData.email} onChange={handleChange}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{tx.password}</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input style={{ ...styles.input, paddingRight: 40 }} type={showPw ? "text" : "password"} name="password" placeholder={tx.passwordPh}
                value={formData.password} onChange={handleChange}
                onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)} required />
              <span onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: 12 }}>
                <EyeIcon show={showPw} />
              </span>
            </div>
          </div>

          <button style={styles.submitBtn} onClick={handleSubmit}
            onMouseEnter={(e) => (e.target.style.background = COLORS.primaryDark)}
            onMouseLeave={(e) => (e.target.style.background = COLORS.primary)}>
            {tx.btn}
          </button>

          {message && (
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: message === tx.success ? "#22c55e" : "#ef4444" }}>
              {message}
            </p>
          )}

          <p style={styles.authSwitch}>
            {tx.noAccount}{" "}
            <a style={styles.authLink} onClick={() => setPage("register")}>{tx.register}</a>
          </p>
        </div>
      </div>
    </main>
  );
}
