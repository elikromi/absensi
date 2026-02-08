import { User, AttendanceRecord, SchoolConfig, Role, AttendanceType, AttendanceStatus } from '../types';

// Initial Mock Data
const DEFAULT_CONFIG: SchoolConfig = {
  schoolName: 'SMA Negeri 1 Contoh',
  schoolAddress: 'Jl. Pendidikan No. 1, Jakarta',
  latitude: -6.2088, // Example: Jakarta
  longitude: 106.8456,
  radiusMeters: 100,
  startHour: 6, // Jam mulai Absen Masuk
  minCheckOutHour: 14, // Jam minimal Absen Pulang
  endHour: 17, // Batas akhir/Jam Operasional
  activeDays: [1, 2, 3, 4, 5] // Mon-Fri
};

const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    password: 'smamter123', // Updated per request
    fullName: 'Administrator Sekolah',
    nuptk: '000000',
    role: Role.ADMIN,
    isActive: true
  },
  {
    id: 'u2',
    username: 'budi',
    password: '123',
    fullName: 'Budi Santoso, S.Pd',
    nuptk: '12345678',
    role: Role.GURU,
    subjects: ['Matematika'],
    additionalRoles: ['Wali Kelas'],
    isActive: true,
    specificActiveDays: [1, 2, 3, 4, 5]
  },
  {
    id: 'u3',
    username: 'siti',
    password: '123',
    fullName: 'Siti Aminah, M.Pd',
    nuptk: '87654321',
    role: Role.GURU,
    subjects: ['Bahasa Indonesia'],
    additionalRoles: ['Wakasek'],
    isActive: true
  }
];

// Local Storage Helper
const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultVal;
  return JSON.parse(stored);
};

const setStorage = <T>(key: string, val: T) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- API SIMULATION ---

export const getConfig = (): SchoolConfig => {
  return getStorage('app_config', DEFAULT_CONFIG);
};

export const updateConfig = (config: SchoolConfig) => {
  setStorage('app_config', config);
};

export const getUsers = (): User[] => {
  return getStorage('app_users', DEFAULT_USERS);
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  setStorage('app_users', users);
};

export const deleteUser = (userId: string) => {
  const users = getUsers().filter(u => u.id !== userId);
  setStorage('app_users', users);
};

export const getAttendance = (): AttendanceRecord[] => {
  return getStorage('app_attendance', []);
};

export const saveAttendance = (record: AttendanceRecord) => {
  const list = getAttendance();
  const index = list.findIndex(r => r.id === record.id);
  if (index >= 0) {
    list[index] = record;
  } else {
    list.push(record);
  }
  setStorage('app_attendance', list);
};

export const deleteAttendance = (id: string) => {
  const list = getAttendance().filter(r => r.id !== id);
  setStorage('app_attendance', list);
};

export const calculatePoints = (status: AttendanceStatus, type: AttendanceType): number => {
  if (type === AttendanceType.ADDITIONAL) return 5;
  switch (status) {
    case AttendanceStatus.PRESENT: return 10;
    case AttendanceStatus.LATE: return 5;
    case AttendanceStatus.EXCUSED: return 0;
    case AttendanceStatus.ABSENT: return 0;
    default: return 0;
  }
};

export const resetDatabase = () => {
  localStorage.removeItem('app_config');
  localStorage.removeItem('app_users');
  localStorage.removeItem('app_attendance');
  // Re-initialize with defaults
  setStorage('app_config', DEFAULT_CONFIG);
  setStorage('app_users', DEFAULT_USERS);
};