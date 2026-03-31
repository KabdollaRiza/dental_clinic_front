import { COLORS } from "./constants";

export const SmileIcon = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="10" r="1" fill={color} />
    <circle cx="15" cy="10" r="1" fill={color} />
  </svg>
);

export const PersonIcon = ({ size = 28, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CalendarIcon = ({ size = 18, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const DoctorIcon = ({ size = 28, color = COLORS.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 14a6 6 0 0 0-4 5.5V20h20v-.5A6 6 0 0 0 18 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 18h4M18 16v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AdminIcon = ({ size = 28, color = COLORS.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
  </svg>
);

export const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={COLORS.muted} strokeWidth="1.5" />
    <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9" stroke={COLORS.muted} strokeWidth="1.5" />
    <path d="M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" stroke={COLORS.muted} strokeWidth="1.5" />
    <path d="M3 12h18" stroke={COLORS.muted} strokeWidth="1.5" />
  </svg>
);
