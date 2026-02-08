
import { supabase } from './supabase';
import { User, AttendanceRecord, SchoolConfig, Role, AttendanceType, AttendanceStatus } from '../types';

// Helper untuk mapping data dari Supabase (snake_case) ke App (camelCase)
const mapUserFromDB = (u: any): User => ({
  id: u.id,
  username: u.username,
  password: u.password,
  fullName: u.full_name,
  nuptk: u.nuptk || '',
  role: u.role as Role,
  isActive: u.is_active,
  subjects: u.subjects || [],
  additionalRoles: u.additional_roles || [],
  specificActiveDays: u.specific_active_days || []
});

const mapAttendanceFromDB = (a: any): AttendanceRecord => ({
  id: a.id,
  userId: a.user_id,
  date: a.date,
  checkInTime: a.check_in_time,
  checkOutTime: a.check_out_time,
  type: a.type as AttendanceType,
  status: a.status as AttendanceStatus,
  locationLat: a.location_lat,
  locationLng: a.location_lng,
  distance: a.distance,
  points: a.points,
  notes: a.notes,
  substitutionLink: a.substitution_link
});

// --- API METHODS (ASYNC) ---

export const getConfig = async (): Promise<SchoolConfig> => {
  const { data, error } = await supabase.from('school_config').select('*').limit(1).single();
  if (error || !data) {
    // Fallback default jika DB kosong/error
    return {
      schoolName: 'Setup Database Dulu',
      schoolAddress: '-',
      latitude: -6.2, longitude: 106.8,
      radiusMeters: 50, startHour: 6, minCheckOutHour: 14, endHour: 17, activeDays: [1,2,3,4,5]
    };
  }
  return {
    schoolName: data.school_name,
    schoolAddress: data.school_address,
    latitude: data.latitude,
    longitude: data.longitude,
    radiusMeters: data.radius_meters,
    startHour: data.start_hour,
    minCheckOutHour: data.min_check_out_hour,
    endHour: data.end_hour,
    activeDays: data.active_days
  };
};

export const updateConfig = async (config: SchoolConfig) => {
  // Update baris pertama
  const { error } = await supabase.from('school_config').update({
    school_name: config.schoolName,
    school_address: config.schoolAddress,
    latitude: config.latitude,
    longitude: config.longitude,
    radius_meters: config.radiusMeters,
    start_hour: config.startHour,
    min_check_out_hour: config.minCheckOutHour,
    end_hour: config.endHour,
    active_days: config.activeDays
  }).gt('id', 0); // Hack update all/first
  
  if (error) console.error('Error config update', error);
};

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*').order('full_name');
  if (error) return [];
  return data.map(mapUserFromDB);
};

export const saveUser = async (user: User) => {
  // Check if ID exists (UUID check logic usually handled by UI state, here simplified)
  // Upsert handling
  const payload = {
    username: user.username,
    password: user.password,
    full_name: user.fullName,
    nuptk: user.nuptk,
    role: user.role,
    is_active: user.isActive,
    subjects: user.subjects,
    additional_roles: user.additionalRoles,
    specific_active_days: user.specificActiveDays
  };

  if (user.id && user.id.length > 10) { // Assuming valid UUID length
    await supabase.from('users').update(payload).eq('id', user.id);
  } else {
    await supabase.from('users').insert([payload]);
  }
};

export const deleteUser = async (userId: string) => {
  await supabase.from('users').delete().eq('id', userId);
};

export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
  if (error) return [];
  return data.map(mapAttendanceFromDB);
};

export const saveAttendance = async (record: AttendanceRecord) => {
  const payload = {
    user_id: record.userId,
    date: record.date,
    check_in_time: record.checkInTime,
    check_out_time: record.checkOutTime,
    type: record.type,
    status: record.status,
    location_lat: record.locationLat,
    location_lng: record.locationLng,
    distance: record.distance,
    points: record.points,
    notes: record.notes,
    substitution_link: record.substitutionLink
  };

  if (record.id && record.id.length > 10) {
     await supabase.from('attendance').update(payload).eq('id', record.id);
  } else {
     await supabase.from('attendance').insert([payload]);
  }
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

export const getTeacherCSVTemplate = () => {
  const headers = "Nama Lengkap,Username,Password,NUPTK (Opsional),Mata Pelajaran (Pisahkan Koma),Jabatan (Pisahkan Koma)";
  const example = "Budi Santoso,budi123,rahasia,12345678,Matematika,Wali Kelas";
  return `${headers}\n${example}`;
};
