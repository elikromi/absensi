export enum Role {
  ADMIN = 'admin',
  GURU = 'guru'
}

export interface User {
  id: string;
  username: string;
  password?: string; // In real app, never store plain text
  fullName: string;
  nuptk: string;
  role: Role;
  subjects?: string[];
  additionalRoles?: string[]; // e.g., 'Wali Kelas', 'Pembina OSIS'
  isActive: boolean;
  specificActiveDays?: number[]; // 0=Sunday, 1=Monday... Overrides global config if present
}

export interface SchoolConfig {
  schoolName: string;
  schoolAddress: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // e.g., 50 meters
  startHour: number; // 0-23 (Earliest Check-in)
  minCheckOutHour: number; // 0-23 (Earliest Check-out)
  endHour: number; // 0-23 (Late threshold usually, or end of day)
  activeDays: number[]; // 0=Sunday, 1=Monday, etc.
}

export enum AttendanceType {
  MAIN = 'Utama',
  ADDITIONAL = 'Tugas Tambahan'
}

export enum AttendanceStatus {
  PRESENT = 'Hadir',
  LATE = 'Terlambat',
  EXCUSED = 'Izin/Sakit',
  ABSENT = 'Alpha'
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string | null; // ISO String
  checkOutTime: string | null; // ISO String
  type: AttendanceType;
  status: AttendanceStatus;
  locationLat: number;
  locationLng: number;
  distance: number; // Distance from school in meters
  points: number;
  notes?: string; // For excuse/substitution task
  substitutionLink?: string; // Link to task if absent
}

export interface LeaderboardEntry {
  userId: string;
  fullName: string;
  totalPoints: number;
  attendanceCount: number;
  additionalRoles?: string[];
}