import { useState } from "react";
import { COLORS, styles } from "./constants";
import { PersonIcon, DoctorIcon, AdminIcon } from "./Icons";
import { T } from "./translation";

const EyeIcon = ({ show }) => (
  <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="1.8" viewBox="0 0 24 24" style={{ cursor: "pointer", flexShrink: 0 }}>
    {show
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

export default function RegisterPage({ setPage, lang = "EN" }) {
  const tx = T[lang]?.register || T.EN.register;
  const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8080" : "";
  const [role, setRole] = useState("Doctor");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", specialization: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { setMessage(tx.invalidEmail); return; }
    const passwordRegex = /^[a-zA-Z0-9]+$/;
    if (!passwordRegex.test(formData.password) || formData.password.length < 8) { setMessage(tx.invalidPass); return; }
    if (formData.password !== formData.confirm) { setMessage(tx.passNoMatch); return; }

    try {
      const payload = {
        email: formData.email, name: formData.name, phone: formData.phone,
        specialization: role === "Doctor" ? formData.specialization : undefined,
        password: formData.password, role: role.toLowerCase(),
      };
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      let data = {};
      try { data = await res.clone().json(); } catch (_) {}
      if (!res.ok) { setMessage(data.message || "Registration failed"); return; }
      if (data.success === "1") {
        setMessage(tx.success);
        setTimeout(() => setPage("login"), 1200);
      } else { setMessage(data.message || "Registration failed"); }
    } catch (error) { setMessage(error?.message || "Network error"); }
  };

  return (
    <main style={styles.main}>
      <div style={{ ...styles.authWrap, padding: "40px 24px" }}>
        <div style={{ ...styles.authCard, maxWidth: 460 }}>
          <div style={styles.authIcon}><PersonIcon size={30} /></div>
          <h2 style={styles.authTitle}>{tx.title}</h2>
          <p style={styles.authSub}>{tx.sub}</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>{tx.roleLabel}</label>
            <div style={styles.roleWrap}>
              <button type="button" style={styles.roleBtn(role === "Doctor")} onClick={() => setRole("Doctor")}>
                <DoctorIcon size={26} color={role === "Doctor" ? COLORS.primary : COLORS.muted} />
                {tx.doctor}
              </button>
              <button type="button" style={styles.roleBtn(role === "Admin")} onClick={() => setRole("Admin")}>
                <AdminIcon size={26} color={role === "Admin" ? COLORS.primary : COLORS.muted} />
                {tx.admin}
              </button>
            </div>
          </div>

          {[
            { label: tx.name, name: "name", type: "text", ph: tx.namePh, filter: (v) => /^[A-Za-z\s]*$/.test(v) },
            { label: tx.email, name: "email", type: "email", ph: tx.emailPh },
            { label: tx.phone, name: "phone", type: "tel", ph: tx.phonePh },
          ].map(({ label, name, type, ph, filter }) => (
            <div key={name} style={styles.formGroup}>
              <label style={styles.label}>{label}</label>
              <input style={styles.input} type={type} name={name} placeholder={ph}
                value={formData[name]}
                onChange={(e) => { if (!filter || filter(e.target.value)) handleChange(e); }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)} required />
            </div>
          ))}

          {role === "Doctor" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>{tx.spec}</label>
              <input style={styles.input} type="text" name="specialization" placeholder={tx.specPh}
                value={formData.specialization} onChange={handleChange}
                onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)} />
            </div>
          )}

          {[
            { label: tx.password, name: "password", ph: tx.passwordPh, show: showPw, toggle: () => setShowPw(v => !v) },
            { label: tx.confirm,  name: "confirm",  ph: tx.confirmPh,  show: showCf, toggle: () => setShowCf(v => !v) },
          ].map(({ label, name, ph, show, toggle }) => (
            <div key={name} style={styles.formGroup}>
              <label style={styles.label}>{label}</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input style={{ ...styles.input, paddingRight: 40 }} type={show ? "text" : "password"} name={name} placeholder={ph}
                  value={formData[name]} onChange={handleChange}
                  onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                  onBlur={(e) => (e.target.style.borderColor = COLORS.border)} required />
                <span onClick={toggle} style={{ position: "absolute", right: 12 }}>
                  <EyeIcon show={show} />
                </span>
              </div>
            </div>
          ))}

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
            {tx.hasAccount}{" "}
            <a style={styles.authLink} onClick={() => setPage("login")}>{tx.loginLink}</a>
          </p>
        </div>
      </div>
    </main>
  );
}
