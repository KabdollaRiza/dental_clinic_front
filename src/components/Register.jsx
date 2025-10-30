import React, { useState } from "react";
import "../index.css"; 

export default function Register() {
  const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : ""; 
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    age: "",
    gender: "",
    password: "",
    push_consent: false,
    role: "user",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    const passwordRegex = /^[a-zA-Z0-9]+$/;

    if (!passwordRegex.test(formData.password) || formData.password.length < 8) {
      setMessage("Password must be at least 8 characters and contain only letters and numbers.");
      return;
    }

    try {
      const payload = {
        email: formData.email,
        name: formData.name,
        age: Math.max(0, Number(formData.age) || 0),
        gender: formData.gender,
        password: formData.password,
        push_consent: !!formData.push_consent,
        role: "user",
      };

      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      let rawText = "";
      try {
        data = await res.clone().json();
      } catch (_) {
        try { rawText = await res.text(); } catch (_) {}
      }

      if (!res.ok) {
        setMessage(`${data.message || rawText || "Registration failed"}`);
        return;
      }

      if (data.success === "1") {
        setMessage("successfully created");
        setTimeout(() => (window.location.href = "/login"), 1200);
      } else {
        setMessage(`${data.message || rawText || "Registration failed"}`);
      }
    } catch (error) {
      console.error('Register request failed:', error);
      const hint = error?.message?.includes('CORS') ? ' (CORS)' : '';
      setMessage(`${error?.message || 'Network error'}${hint}`);
    }
  };

  return (
    <div className="container">
      <form className="register_form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={(e)=>{
            const value = e.target.value;
            if(/^[A-Za-z\s]*$/.test(value)){
              handleChange(e);
            }
          }}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          min="0"
          step="1"
          required
        />
        <div className="gender">
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              onChange={handleChange}
              required
            />{" "}
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              onChange={handleChange}
            />{" "}
            Male
          </label>
        </div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <label>
          <input
            type="checkbox"
            name="push_consent"
            checked={formData.push_consent}
            onChange={handleChange}
          />{" "}
          I agree to receive notifications
        </label>

        <button type="submit">Register</button>

        {message && <p className="message">{message}</p>}

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}
