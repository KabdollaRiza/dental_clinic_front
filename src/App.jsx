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
import ClinicAdminDashboard from "./components/ClinicAdminDashboard";
import ServicesPage from "./components/ServicesPage";
import PatientLoginPage from "./components/PatientLoginPage";
import PatientRegisterPage from "./components/PatientRegisterPage";
import PatientDashboardPage from "./components/PatientDashboardPage";
import DoctorsPage from "./components/DoctorsPage";
import ChatWidget from "./components/ChatWidget";

function getInitialPage() {
  const token = sessionStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        sessionStorage.removeItem("token");
        return "home";
      }
      const role = (payload.role || payload.Role || "").toLowerCase();
      if (role === "doctor") return "doctor";
      if (role === "clinic_admin") return "clinicAdmin";
      if (role === "admin") return "admin";
    } catch {}
  }
  return "home";
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [lang, setLang] = useState("RU");

  const noFooter  = page === "admin" || page === "doctor" || page === "patientDashboard" || page === "clinicAdmin";
  const noHeader  = page === "admin" || page === "doctor" || page === "patientDashboard" || page === "clinicAdmin";


  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!noHeader && <Header page={page} setPage={setPage} lang={lang} setLang={setLang} />}

      {page === "home"     && <HomePage     setPage={setPage} lang={lang} />}
      {page === "login"    && <LoginPage    setPage={setPage} lang={lang} />}
      {page === "register" && <RegisterPage setPage={setPage} lang={lang} />}
      {page === "booking"  && <BookingPage  setPage={setPage} lang={lang} />}
      {page === "clinics"  && <ClinicsPage  setPage={setPage} lang={lang} />}
      {page === "services"  && <ServicesPage setPage={setPage} lang={lang} />}
      {page === "doctors"   && <DoctorsPage  setPage={setPage} lang={lang} />}
      {page === "admin"    && <AdminDashboard key="admin-dashboard" setPage={setPage} lang={lang} setLang={setLang} />}
      {page === "doctor"      && <DoctorDashboard      setPage={setPage} lang={lang} />}
      {page === "clinicAdmin" && <ClinicAdminDashboard setPage={setPage} lang={lang} setLang={setLang} />}
      {page === "patientLogin"      && <PatientLoginPage      setPage={setPage} lang={lang} />}
      {page === "patientRegister"   && <PatientRegisterPage   setPage={setPage} lang={lang} />}
      {page === "patientDashboard"  && <PatientDashboardPage  setPage={setPage} lang={lang} />}
      
      {!noFooter && <Footer lang={lang} />}
      <ChatWidget page={page} setPage={setPage} lang={lang} />
    </div>
  );
}