import { useState } from "react";
import { COLORS } from "./components/constants";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import BookingPage from "./components/BookingPage";
import AdminDashboard from "./components/AdminDashboard";
import ClinicsPage from "./components/ClinicsPage";
import DoctorDashboard from "./components/DoctorDashboard";
import ServicesPage from "./components/ServicesPage";

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("RU");

  const noFooter  = page === "admin" || page === "doctor";
  const noHeader  = page === "admin" || page === "doctor";

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!noHeader && <Header page={page} setPage={setPage} lang={lang} setLang={setLang} />}

      {page === "home"     && <HomePage     setPage={setPage} lang={lang} />}
      {page === "login"    && <LoginPage    setPage={setPage} lang={lang} />}
      {page === "register" && <RegisterPage setPage={setPage} lang={lang} />}
      {page === "booking"  && <BookingPage  setPage={setPage} lang={lang} />}
      {page === "clinics"  && <ClinicsPage  setPage={setPage} lang={lang} />}
      {page === "services"  && <ServicesPage setPage={setPage} lang={lang} />}
      {page === "admin"    && <AdminDashboard key="admin-dashboard" setPage={setPage} lang={lang} setLang={setLang} />}
      {page === "doctor"   && <DoctorDashboard setPage={setPage} lang={lang} />}
      
      {!noFooter && <Footer lang={lang} />}
    </div>
  );
}