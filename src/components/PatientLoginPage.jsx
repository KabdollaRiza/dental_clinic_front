import { useState } from "react";
import { COLORS, styles } from "./constants";
import { useResponsive } from "./useResponsive";

const API_BASE = "http://161.35.116.104:8080";

const TX = {
  EN: { title: "Patient Login", sub: "Login to access your patient portal", email: "Email Address", emailPh: "Enter your email", password: "Password", passwordPh: "Enter your password", btn: "Login", noAccount: "Don't have an account?", register: "Register here", fillAll: "Please fill all fields.", invalidEmail: "Invalid email format.", success: "Login successful!" },
  KZ: { title: "Пациент кіруі", sub: "Пациент порталына кіріңіз", email: "Электрондық пошта", emailPh: "Поштаңызды енгізіңіз", password: "Құпия сөз", passwordPh: "Құпия сөзіңізді енгізіңіз", btn: "Кіру", noAccount: "Аккаунтыңыз жоқ па?", register: "Тіркелу", fillAll: "Барлық өрістерді толтырыңыз.", invalidEmail: "Электрондық пошта форматы қате.", success: "Сәтті кірдіңіз!" },
  RU: { title: "Вход для пациента", sub: "Войдите в свой портал пациента", email: "Электронная почта", emailPh: "Введите вашу почту", password: "Пароль", passwordPh: "Введите пароль", btn: "Войти", noAccount: "Нет аккаунта?", register: "Зарегистрироваться", fillAll: "Заполните все поля.", invalidEmail: "Неверный формат почты.", success: "Вход выполнен!" },
};

const MailIcon = () => (
  <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = ({ show }) => (
  <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="1.8" viewBox="0 0 24 24" style={{ cursor: "pointer" }}>
    {show
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const inputWrap = (focused) => ({
  display: "flex", alignItems: "center", gap: 10,
  border: `1.5px solid ${focused ? COLORS.primary : COLORS.border}`,
  borderRadius: 8, padding: "11px 14px", background: "#fff", transition: "border-color 0.2s",
});
const inputStyle = { flex: 1, border: "none", outline: "none", fontSize: 14, color: COLORS.text, background: "transparent" };

export default function PatientLoginPage({ setPage, lang = "EN" }) {
  const tx = TX[lang] || TX.EN;
  const { isMobile } = useResponsive();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPw,    setFocusedPw]   = useState(false);
  const [msg,      setMsg]      = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) { setMsg(tx.fillAll); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMsg(tx.invalidEmail); return; }
    if (password.length < 8) { setMsg("Password must be at least 8 characters."); return; }
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(data.message || data.error || "Login failed."); return; }
      const role = (data.role || data.Role || "").toLowerCase();
      if (role !== "patient") { setMsg("Access denied. This portal is for patients only."); return; }
      const token = data.token || data.access_token || data.Token || "";
      if (token) sessionStorage.setItem("patient_token", token);
      setMsg(tx.success);
      setTimeout(() => setPage("patientDashboard"), 700);
    } catch { setMsg("Network error."); }
    finally { setLoading(false); }
  };

  return (
    <main style={styles.main}>
      <div style={{ ...styles.authWrap, alignItems: isMobile ? "flex-start" : "center", padding: isMobile ? "32px 16px 80px" : "60px 24px", overflowY: "auto" }}>
        <div style={{ ...styles.authCard, maxWidth: 480 }}>
          <h2 style={{ ...styles.authTitle, marginBottom: 6 }}>{tx.title}</h2>
          <p style={{ ...styles.authSub, marginBottom: 32 }}>{tx.sub}</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>{tx.email}</label>
            <div style={inputWrap(focusedEmail)}>
              <MailIcon />
              <input style={inputStyle} type="email" placeholder={tx.emailPh} value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedEmail(true)} onBlur={() => setFocusedEmail(false)}
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{tx.password}</label>
            <div style={inputWrap(focusedPw)}>
              <LockIcon />
              <input style={inputStyle} type={showPw ? "text" : "password"} placeholder={tx.passwordPh} value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedPw(true)} onBlur={() => setFocusedPw(false)}
                onKeyDown={e => e.key === "Enter" && submit()} />
              <span onClick={() => setShowPw(v => !v)}><EyeIcon show={showPw} /></span>
            </div>
          </div>

          {msg && <p style={{ fontSize: 13, color: msg === tx.success ? "#22c55e" : "#ef4444", marginBottom: 12, textAlign: "center" }}>{msg}</p>}

          <button onClick={submit} disabled={loading}
            style={{ ...styles.submitBtn, background: loading ? "#94A3B8" : COLORS.primary, cursor: loading ? "not-allowed" : "pointer" }}
            onMouseEnter={e => { if (!loading) e.target.style.background = COLORS.primaryDark; }}
            onMouseLeave={e => { if (!loading) e.target.style.background = COLORS.primary; }}>
            {loading ? "…" : tx.btn}
          </button>

          <p style={{ ...styles.authSwitch, marginTop: 20 }}>
            {tx.noAccount}{" "}
            <span style={styles.authLink} onClick={() => setPage("patientRegister")}>{tx.register}</span>
          </p>
        </div>
      </div>
    </main>
  );
}
