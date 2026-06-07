# Dental Clinic — Frontend

React + Vite frontend for the Dental Clinic web application.

## Live URLs

| Service | URL |
|---|---|
| Frontend | http://161.35.116.104:3000/ |
| Backend API | http://161.35.116.104:8080/ |
| ML Service (X-ray) | http://161.35.116.104:8001/ |

## Requirements

- Node.js: `22.12.0`
- npm: `11.6.0`
- Python: `3.10+` (for ML service)

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
├── main.py       ← ML service (X-ray analysis)
├── best.pt       ← YOLO model weights
├── package.json
├── package-lock.json
└── README.md
```

## Installation & Setup

### 1. Frontend

```bash
git clone https://github.com/KabdollaRiza/dental_clinic_front.git
cd dental_clinic_front
npm install
```

**Development server:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
```
Output goes to `dist/` folder.

**Serve production build:**
```bash
npm run preview
```

---

### 2. ML Service (X-ray Analysis)

The ML service uses YOLO (`best.pt`) to detect pathologies in X-ray images.  
`main.py` and `best.pt` must be in the same folder.

**Install dependencies:**
```bash
pip install fastapi uvicorn ultralytics pillow
```

**Run ML server:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

**Run in background (Linux/server):**
```bash
nohup uvicorn main:app --host 0.0.0.0 --port 8001 &
```

ML API endpoint: `POST http://161.35.116.104:8001/predict`  
Interactive docs: `http://161.35.116.104:8001/docs`

---

### 3. Backend (Go)

The Go backend must be running on port `8080`.  
See the backend repository for setup instructions.

---

## How it all connects

```
Browser
  │
  ├── → http://161.35.116.104:8080   (Backend API — auth, clinics, doctors, booking)
  └── → http://161.35.116.104:8001   (ML Service — X-ray analysis, Doctor Dashboard)
```

The ML service is called **directly from the browser** on the Doctor Dashboard page when a doctor uploads an X-ray image.

## Key Dependencies

| Package | Version |
|---|---|
| react | ^19.2.0 |
| react-dom | ^19.2.0 |
| react-router-dom | ^7.9.4 |
| vite | ^8.0.0 |
| fastapi | latest |
| ultralytics (YOLO) | latest |
| pillow | latest |
