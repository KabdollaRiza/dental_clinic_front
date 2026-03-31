import { useState } from "react";
import { COLORS, styles } from "./constants";
import { PersonIcon } from "./Icons";
import { T } from "./translation";

export default function LoginPage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.login || T.EN.login;
  const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8080" : "";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { setMessage(tx.fillAll); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { setMessage(tx.invalidEmail); return; }
    const passwordRegex = /^[a-zA-Z0-9]+$/;
    if (!passwordRegex.test(formData.password) || formData.password.length < 8) { setMessage(tx.invalidPass); return; }

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok) { localStorage.removeItem("token"); setMessage(data.message || "Login failed"); return; }

      const token = data.token || data.access_token || data.Token || data.AccessToken || data.jwt || "";
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
      const role = (data.role || data.Role || "admin").toLowerCase();
      if (res.ok) {
        setMessage(tx.success);
        setTimeout(() => { if (role === "doctor") setPage("doctor"); else setPage("admin"); }, 800);
      } else {
        setMessage(tx.invalidPass);
      }
    } catch (error) {
      setMessage(error?.message || "Network error");
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.authWrap}>
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
            <input style={styles.input} type="password" name="password" placeholder={tx.passwordPh}
              value={formData.password} onChange={handleChange}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)} required />
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
