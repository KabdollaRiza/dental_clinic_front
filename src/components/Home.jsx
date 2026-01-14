import React from "react";
import "../index.css"; 

export default function Home() {
  return (
    <div className="page-wrapper">
      <header className="site-header">
      <div className="logo">
        <a href="/home" className="logo-link">DC</a>
      </div>
        <nav className="nav-links">
          <a href="/login">Sign in</a>
          <a href="/register">Sign up</a>
        </nav>
      </header>

      <main className="container">
        <h1 className="main-title">DENTAL CLINIC MANAGEMENT SYSTEM</h1>
        <p className="subtitle">Welcome to our website!</p>
      </main>

      <footer className="site-footer">
        <p className="team_name">Team: Interstellar</p>
      </footer>
    </div>
  );
}
