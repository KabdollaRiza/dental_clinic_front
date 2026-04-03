import { useState } from "react";
import { COLORS, styles } from "./constants";

const API_BASE = "http://localhost:8080";

const TX = {
  EN: { title: "Patient Registration", sub: "Create your patient account", fullName: "Full Name", fullNamePh: "Enter your full name", email: "Email Address", emailPh: "Enter your email", phone: "Phone", phonePh: "+7 (777) 123-4567", password: "Password", passwordPh: "Enter your password", confirm: "Confirm Password", confirmPh: "Confirm Password", btn: "Register", hasAccount: "Already have an account?", loginLink: "Login here", fillAll: "Please fill all fields.", invalidEmail: "Invalid email format.", passNoMatch: "Passwords do not match.", success: "Account created! Please log in." },
  KZ: { title: "Пациент тіркелуі", sub: "Пациент аккаунтын жасаңыз", fullName: "Толық аты", fullNamePh: "Толық атыңызды енгізіңіз", email: "Электрондық пошта", emailPh: "Поштаңызды енгізіңіз", phone: "Телефон", phonePh: "+7 (777) 123-4567", password: "Құпия сөз", passwordPh: "Құпия сөзіңізді енгізіңіз", confirm: "Құпия сөзді растау", confirmPh: "Құпия сөзді растаңыз", btn: "Тіркелу", hasAccount: "Аккаунтыңыз бар ма?", loginLink: "Кіру", fillAll: "Барлық өрістерді толтырыңыз.", invalidEmail: "Электрондық пошта форматы қате.", passNoMatch: "Құпия сөздер сәйкес емес.", success: "Аккаунт жасалды! Кіріңіз." },
  RU: { title: "Регистрация пациента", sub: "Создайте аккаунт пациента", fullName: "Полное имя", fullNamePh: "Введите ваше полное имя", email: "Электронная почта", emailPh: "Введите вашу почту", phone: "Телефон", phonePh: "+7 (777) 123-4567", password: "Пароль", passwordPh: "Введите пароль", confirm: "Подтвердите пароль", confirmPh: "Подтвердите пароль", btn: "Зарегистрироваться", hasAccount: "Уже есть аккаунт?", loginLink: "Войти", fillAll: "Заполните все поля.", invalidEmail: "Неверный формат почты.", passNoMatch: "Пароли не совпадают.", success: "Аккаунт создан! Войдите." },
};

const PersonIcon = () => (
  <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
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

function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={styles.label}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: "11px 14px", background: "#fff" }}
        onFocus={e => e.currentTarget.style.borderColor = COLORS.primary}
        onBlur={e => e.currentTarget.style.borderColor = COLORS.border}>
        {icon}
        {children}
      </div>
    </div>
  );
}

const inp = { flex: 1, border: "none", outline: "none", fontSize: 14, color: COLORS.text, background: "transparent" };

export default function PatientRegisterPage({ setPage, lang = "EN" }) {
  const tx = TX[lang] || TX.EN;
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [showCf,  setShowCf]  = useState(false);
  const [msg,     setMsg]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) { setMsg(tx.fillAll); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setMsg(tx.invalidEmail); return; }
    if (form.password !== form.confirm) { setMsg(tx.passNoMatch); return; }
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: "patient", gender: "", age: 0, push_consent: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(data.message || data.error || "Registration failed."); return; }
      setMsg(tx.success);
      setTimeout(() => setPage("patientLogin"), 1200);
    } catch { setMsg("Network error."); }
    finally { setLoading(false); }
  };

  return (
    <main style={styles.main}>
      <div style={{ ...styles.authWrap, padding: "40px 24px" }}>
        <div style={{ ...styles.authCard, maxWidth: 480 }}>
          <h2 style={{ ...styles.authTitle, marginBottom: 6 }}>{tx.title}</h2>
          <p style={{ ...styles.authSub, marginBottom: 28 }}>{tx.sub}</p>

          <Field label={tx.fullName} icon={<PersonIcon />}>
            <input style={inp} placeholder={tx.fullNamePh} value={form.name} onChange={set("name")} onKeyDown={e => e.key === "Enter" && submit()} />
          </Field>
          <Field label={tx.email} icon={<MailIcon />}>
            <input style={inp} type="email" placeholder={tx.emailPh} value={form.email} onChange={set("email")} onKeyDown={e => e.key === "Enter" && submit()} />
          </Field>
          <Field label={tx.password} icon={<LockIcon />}>
            <input style={inp} type={showPw ? "text" : "password"} placeholder={tx.passwordPh} value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && submit()} />
            <span onClick={() => setShowPw(v => !v)}><EyeIcon show={showPw} /></span>
          </Field>
          <Field label={tx.confirm} icon={<LockIcon />}>
            <input style={inp} type={showCf ? "text" : "password"} placeholder={tx.confirmPh} value={form.confirm} onChange={set("confirm")} onKeyDown={e => e.key === "Enter" && submit()} />
            <span onClick={() => setShowCf(v => !v)}><EyeIcon show={showCf} /></span>
          </Field>

          {msg && <p style={{ fontSize: 13, color: msg === tx.success ? "#22c55e" : "#ef4444", marginBottom: 12, textAlign: "center" }}>{msg}</p>}

          <button onClick={submit} disabled={loading}
            style={{ ...styles.submitBtn, background: loading ? "#94A3B8" : COLORS.primary, cursor: loading ? "not-allowed" : "pointer" }}
            onMouseEnter={e => { if (!loading) e.target.style.background = COLORS.primaryDark; }}
            onMouseLeave={e => { if (!loading) e.target.style.background = COLORS.primary; }}>
            {loading ? "…" : tx.btn}
          </button>

          <p style={{ ...styles.authSwitch, marginTop: 20 }}>
            {tx.hasAccount}{" "}
            <span style={styles.authLink} onClick={() => setPage("patientLogin")}>{tx.loginLink}</span>
          </p>
        </div>
      </div>
    </main>
  );
}
