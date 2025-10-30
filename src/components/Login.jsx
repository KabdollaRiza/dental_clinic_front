import React, { useState } from "react";
import "../index.css"; 

export default function Login() {
  const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : ""; 
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage("Please fill all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Invalid email format.");
      return;
    }

    const passwordRegex = /^[a-zA-Z0-9]+$/;
    
    if (!passwordRegex.test(formData.password) || formData.password.length < 8) {
      setMessage("Password must be at least 8 characters and contain only letters and numbers.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      let data = {};
      try { data = await res.json(); } catch (_) {}

      if (!res.ok) {
        setMessage(`${data.message || "Login failed"}`);
        localStorage.removeItem("token");
        return;
      }

      if (data.success === "1" && data.token) {
        localStorage.setItem("token", data.token);
        setMessage("Login successful!");
        setTimeout(() => (window.location.href = "/"), 800);
      } else {
        localStorage.removeItem("token");
        setMessage("Invalid email or password.");
      } 
    } catch (error) {
      console.error('Login request failed:', error);
      const hint = error?.message?.includes('CORS') ? ' (CORS)' : '';
      setMessage(`${error?.message || 'Network error'}${hint}`);
    }
  };

  return (
    <div className="container">
      <form className="register_form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        {message && <p className="message">{message}</p>}

        <p className="login-link">
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}
