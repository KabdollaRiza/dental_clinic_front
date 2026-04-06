# Bug Report — Dental Clinic Frontend

> Last checked: 2026-04-03
> Legend: 🔴 Critical · 🟡 Medium · 🟢 Low · 🔧 Frontend fix · 📢 Backend team

---

## 🔴 Critical

- [x] 🔧 **LoginPage: unreachable error branch** — `LoginPage.jsx:38`
  Removed redundant `if (res.ok)` check. Error handling now works correctly.

- [x] 🔧 **ServicesPage: no `r.ok` check before parsing JSON** — `ServicesPage.jsx:26-31`
  Added `r.ok` check, error state, and user-visible error message.

- [ ] 📢 **Slots never marked as booked in `doctor_time_slots`** — backend `appointment_service.go`
  After creating an appointment the backend never updates slot status to `"booked"`. Frontend already checks `sl.status` — backend just needs to update it after booking.

- [x] 🔧 **BookingPage: `branchCount` scoped inside map, always resets to 0** — `BookingPage.jsx`
  Replaced `Promise.all` + map with a `for...of` loop so `branchCount` increments correctly across iterations.

---

## 🟡 Medium

- [x] 🔧 **BookingPage: `serviceId` not reset when clinic changes** — `BookingPage.jsx`
  Added `setServiceId("")` to `handleClinicChange`.

- [x] 🔧 **BookingPage: slots endpoint doesn't handle wrapped `{ data: [...] }` response** — `BookingPage.jsx`
  Added `d?.data` fallback consistent with all other endpoints.

- [x] 🔧 **BookingPage: `patient_token` vs `token` confusion** — `BookingPage.jsx`
  Unified token stripping with `replace(/^Bearer\s+/i, "")` to handle both formats.

- [x] 🔧 **ServicesPage: no error message shown to user on fetch failure** — `ServicesPage.jsx`
  Added `error` state shown to user when fetch fails or returns non-ok status.

- [x] 🔧 **ClinicsPage: selected clinic saved to `sessionStorage` but never read** — `BookingPage.jsx`
  BookingPage now reads `selectedClinic` from sessionStorage on mount and pre-selects the clinic, then clears the value.

---

## 🟢 Low

- [x] 🔧 **LoginPage vs PatientLoginPage: inconsistent password validation**
  Added minimum 8-character check to PatientLoginPage to match admin login.

- [x] 🔧 **BookingPage: form state not reset after successful booking** — `BookingPage.jsx`
  All form fields are now cleared before navigating to home after a successful booking.

- [x] 🔧 **ServicesPage: price filter allows negative numbers** — `ServicesPage.jsx`
  Added `min="0"` to the number input.

- [x] 🔧 **JWT token decoded without format check** — `BookingPage.jsx`
  Already wrapped in try/catch — safe.

- [x] 🔧 **PatientDashboardPage: no feedback shown if all fetches fail on load**
  Added `loadError` state with `.catch()` on Promise.all, displayed in the content area.

---

## Status

| Severity | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| 🔴 Critical | 4 | 3 | 1 (backend) |
| 🟡 Medium | 5 | 5 | 0 |
| 🟢 Low | 5 | 5 | 0 |
