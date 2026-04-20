# Dental Clinic — Frontend

React + Vite frontend for the Dental Clinic web application.

## Requirements

- Node.js: `22.12.0`
- npm: `11.6.0`

## Project Structure

```
dental_clinic_front/
│
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx
│   │   ├── BookingPage.jsx
│   │   ├── ChatWidget.jsx
│   │   ├── ClinicsPage.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── DoctorsPage.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── HomePage.jsx
│   │   ├── Icons.jsx
│   │   ├── LoginPage.jsx
│   │   ├── PatientDashboardPage.jsx
│   │   ├── PatientLoginPage.jsx
│   │   ├── PatientRegisterPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ServicesPage.jsx
│   │   ├── constants.jsx
│   │   ├── translation.js
│   │   └── useResponsive.js
│   ├── api.js
│   ├── App.jsx
│   ├── index.jsx
│   └── index.css
│
├── package.json
├── package-lock.json
└── README.md
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KabdollaRiza/dental_clinic_front.git
   cd dental_clinic_front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```
   Output is in the `dist/` folder.

5. **Preview production build locally**
   ```bash
   npm run preview
   ```

## Network Configuration

In development, the frontend proxies API requests to `http://localhost:8080` (backend).

In production, API requests use relative paths (`/api/...`), so the backend must be served on the same domain via a reverse proxy (e.g. nginx forwarding `/api/*` to the backend port).

## Key Dependencies

| Package | Version |
|---|---|
| react | ^19.2.0 |
| react-dom | ^19.2.0 |
| react-router-dom | ^7.9.4 |
| vite | ^8.0.0 |
