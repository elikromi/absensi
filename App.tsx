
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, LogOut, FileText, User as UserIcon, Settings, 
  BarChart, Upload, CheckCircle, XCircle, AlertTriangle, 
  Award, Calendar, Menu, Plus, Trash2, Edit, Download, AlertOctagon,
  Eye, Save, Users, BookOpen, Shield, ExternalLink, Clock, Moon, Sun,
  ChevronRight, Database, RefreshCw, FileDown, Loader2
} from 'lucide-react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

import { 
  User, Role, SchoolConfig, AttendanceRecord, AttendanceType, AttendanceStatus, LeaderboardEntry 
} from './types';
import * as GeoService from './services/geo';
import * as DBService from './services/db';
import * as ExcelService from './services/excel';

// --- COMPONENTS ---

const Card = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 transition-colors duration-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = 'primary', disabled = false, className = '' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md shadow-blue-200 dark:shadow-none",
    secondary: "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200 dark:shadow-none",
    outline: "border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full p-2 border rounded-lg outline-none transition-colors duration-200
      bg-white dark:bg-slate-950 
      border-gray-300 dark:border-slate-700 
      text-gray-900 dark:text-white 
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
      placeholder-gray-400 dark:placeholder-slate-500
      ${props.className}`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
    {...props}
    className={`w-full p-2 border rounded-lg outline-none transition-colors duration-200
      bg-white dark:bg-slate-950 
      border-gray-300 dark:border-slate-700 
      text-gray-900 dark:text-white 
      focus:ring-2 focus:ring-blue-500
      ${props.className}`}
  >
    {props.children}
  </select>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg relative max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XCircle />
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b dark:border-slate-700 pb-2">{title}</h3>
        {children}
      </Card>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8 text-blue-600">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);

// --- PAGES ---

// 1. LANDING PAGE & LEADERBOARD
const Leaderboard = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const conf = await DBService.getConfig();
      setConfig(conf);
      
      const records = await DBService.getAttendance();
      const users = await DBService.getUsers();
      
      const pointsMap: Record<string, number> = {};
      records
        .filter(r => r.type === AttendanceType.MAIN) 
        .forEach(r => {
          pointsMap[r.userId] = (pointsMap[r.userId] || 0) + r.points;
        });

      const list = users
        .filter(u => u.role === Role.GURU)
        .map(u => ({
          userId: u.id,
          fullName: u.fullName,
          totalPoints: pointsMap[u.id] || 0,
          attendanceCount: records.filter(r => r.userId === u.id && r.type === AttendanceType.MAIN).length
        }))
        .sort((a,b) => b.totalPoints - a.totalPoints)
        .slice(0, 5); // Top 5

      setLeaders(list);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors">
      <nav className="bg-white dark:bg-slate-900 shadow-sm p-4 sticky top-0 z-10 border-b dark:border-slate-800">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-lg">GeoPresensi</span>
          </div>
          <Button variant="primary" onClick={onLoginClick} className="text-sm px-4 py-1.5">
            Login Guru/Admin
          </Button>
        </div>
      </nav>

      <div className="bg-blue-600 dark:bg-blue-800 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Presensi Guru Modern & Akurat</h1>
        <p className="opacity-90 max-w-xl mx-auto text-xl font-medium">
          {config?.schoolName || 'Memuat Data Sekolah...'}
        </p>
        <p className="opacity-75 text-sm mt-1">{config?.schoolAddress}</p>
      </div>

      <div className="max-w-3xl mx-auto -mt-10 p-4 relative z-10">
        <Card className="shadow-2xl border-none">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Award className="text-yellow-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-center">Top Guru Bulan Ini</h2>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {leaders.map((l, index) => (
                <div key={l.userId} className="flex items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 transform transition hover:-translate-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' : 
                      index === 1 ? 'bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-gray-200' : 
                      index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400' : 'bg-white dark:bg-slate-900 border dark:border-slate-600'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{l.fullName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{l.attendanceCount} Kehadiran</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{l.totalPoints}</span>
                    <span className="text-xs text-gray-400 block">Poin</span>
                  </div>
                </div>
              ))}
              {leaders.length === 0 && <p className="text-center text-gray-400">Belum ada data presensi.</p>}
            </div>
          )}
        </Card>
      </div>
      
      <div className="text-center text-gray-400 text-sm py-12">
        &copy; {new Date().getFullYear()} {config?.schoolName || 'GeoPresensi'}. Powered by Supabase.
      </div>
    </div>
  );
};

// 2. LOGIN PAGE
const LoginPage = ({ onLogin, onBack }: { onLogin: (u: User) => void, onBack: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<SchoolConfig | null>(null);

  useEffect(() => { DBService.getConfig().then(setConfig); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const users = await DBService.getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      if (user && user.isActive) {
        onLogin(user);
      } else {
        setError('Username atau password salah / Akun non-aktif');
      }
    } catch (err) {
      setError('Gagal terhubung ke database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-blue-100 dark:border-slate-800 relative">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
           &larr; Kembali
        </button>
        <div className="text-center mb-8 mt-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-blue-600 dark:text-blue-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">GeoPresensi</h1>
          <p className="font-medium text-blue-700 dark:text-blue-400">{config?.schoolName || 'Loading...'}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Username</label>
            <Input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
            <Input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password"
            />
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">{error}</p>}
          <Button className="w-full" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk Aplikasi'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

// 3. TEACHER DASHBOARD
const TeacherDashboard = ({ user }: { user: User }) => {
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [currentLoc, setCurrentLoc] = useState<GeolocationPosition | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [attendanceToday, setAttendanceToday] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [attendanceRate, setAttendanceRate] = useState(100);
  const [tasksDoneToday, setTasksDoneToday] = useState<string[]>([]);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subReason, setSubReason] = useState('');
  const [subLink, setSubLink] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentDay = new Date().getDay(); 

  useEffect(() => {
    refreshData();
    watchLocation();
  }, []);

  const refreshData = async () => {
    const conf = await DBService.getConfig();
    setConfig(conf);

    const allRecords = await DBService.getAttendance();
    const myRecord = allRecords.find(r => r.userId === user.id && r.date === todayStr && r.type === AttendanceType.MAIN);
    setAttendanceToday(myRecord || null);
    
    const myTasks = allRecords
      .filter(r => r.userId === user.id && r.date === todayStr && r.type === AttendanceType.ADDITIONAL)
      .map(r => r.notes || '');
    setTasksDoneToday(myTasks);

    const myHistory = allRecords.filter(r => r.userId === user.id && r.type === AttendanceType.MAIN).sort((a,b) => b.date.localeCompare(a.date));
    setHistory(myHistory);

    const totalRecorded = myHistory.length;
    const presentOrLate = myHistory.filter(h => h.status === AttendanceStatus.PRESENT || h.status === AttendanceStatus.LATE).length;
    if (totalRecorded > 0) {
      setAttendanceRate(Math.round((presentOrLate / totalRecorded) * 100));
    }
  };

  const watchLocation = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentLoc(pos);
          DBService.getConfig().then(c => {
              const dist = GeoService.calculateDistance(
                pos.coords.latitude,
                pos.coords.longitude,
                c.latitude,
                c.longitude
              );
              setDistance(dist);
              setLoadingLoc(false);
          });
        },
        (err) => {
          console.error(err);
          setLoadingLoc(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleCheckIn = async () => {
    if (!currentLoc || distance === null || !config) return;
    
    if (distance > config.radiusMeters) {
      alert(`Anda berada di luar radius sekolah! (${Math.round(distance)}m)`);
      return;
    }

    const now = new Date();
    const hour = now.getHours();

    if (hour < config.startHour) {
      alert(`Presensi belum dibuka. Dimulai pukul ${config.startHour}:00`);
      return;
    }

    let status = AttendanceStatus.PRESENT;
    if (hour > config.startHour) status = AttendanceStatus.LATE;

    const newRecord: AttendanceRecord = {
      // Use placeholder ID, DB will generate UUID
      id: '', 
      userId: user.id,
      date: todayStr,
      checkInTime: now.toISOString(),
      checkOutTime: null,
      type: AttendanceType.MAIN,
      status: status,
      locationLat: currentLoc.coords.latitude,
      locationLng: currentLoc.coords.longitude,
      distance: distance,
      points: DBService.calculatePoints(status, AttendanceType.MAIN)
    };

    await DBService.saveAttendance(newRecord);
    refreshData();
    alert('Berhasil Check-in!');
  };

  const handleCheckOut = async () => {
    if (!attendanceToday || !config) return;
    const now = new Date();
    const hour = now.getHours();

    if (hour < config.minCheckOutHour) {
      alert(`Belum waktunya pulang. Minimal check-out pukul ${config.minCheckOutHour}:00`);
      return;
    }

    const updatedRecord = {
      ...attendanceToday,
      checkOutTime: now.toISOString()
    };
    await DBService.saveAttendance(updatedRecord);
    refreshData();
    alert('Berhasil Check-out!');
  };

  const handleAdditionalTask = async (role: string) => {
    if (tasksDoneToday.includes(role)) return;

    const record: AttendanceRecord = {
      id: '',
      userId: user.id,
      date: todayStr,
      checkInTime: new Date().toISOString(),
      checkOutTime: new Date().toISOString(), 
      type: AttendanceType.ADDITIONAL,
      status: AttendanceStatus.PRESENT,
      locationLat: 0,
      locationLng: 0,
      distance: 0,
      points: 5,
      notes: role
    };
    await DBService.saveAttendance(record);
    refreshData();
  };

  const submitSubstitution = async () => {
    const newRecord: AttendanceRecord = {
      id: '',
      userId: user.id,
      date: todayStr,
      checkInTime: null,
      checkOutTime: null,
      type: AttendanceType.MAIN,
      status: AttendanceStatus.EXCUSED,
      locationLat: 0,
      locationLng: 0,
      distance: 0,
      points: 0,
      notes: subReason,
      substitutionLink: subLink
    };
    await DBService.saveAttendance(newRecord);
    refreshData();
    setShowSubForm(false);
  };

  if (!config) return <LoadingSpinner />;

  // Determine working day
  const isWorkingDay = user.specificActiveDays && user.specificActiveDays.length > 0
    ? user.specificActiveDays.includes(currentDay)
    : config.activeDays.includes(currentDay);

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-100">
      {/* HEADER & WARNINGS */}
      {attendanceRate < 50 && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded flex items-center gap-3">
          <AlertOctagon />
          <div>
            <p className="font-bold">Peringatan Kehadiran</p>
            <p className="text-sm">Tingkat kehadiran Anda rendah ({attendanceRate}%). Harap tingkatkan kedisiplinan.</p>
          </div>
        </div>
      )}

      {/* STATUS CARD */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 text-white border-none shadow-lg">
        <h2 className="text-xl font-bold mb-2">Halo, {user.fullName}</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="opacity-90">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                Jarak: {loadingLoc ? 'Mencari...' : distance ? `${Math.round(distance)} meter` : 'GPS Nonaktif'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${distance && distance <= config.radiusMeters ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                {distance && distance <= config.radiusMeters ? 'Dalam Radius' : 'Luar Radius'}
              </span>
            </div>

            {!isWorkingDay && (
              <p className="text-xs bg-white/20 px-2 py-1 rounded inline-block mt-2 font-medium">
                Hari ini bukan jadwal wajib Anda. Presensi bersifat opsional.
              </p>
            )}
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center backdrop-blur-sm min-w-[120px]">
             <p className="text-sm opacity-80">Total Poin</p>
             <p className="text-3xl font-bold">{history.reduce((acc, curr) => acc + curr.points, 0)}</p>
          </div>
        </div>
      </Card>

      {/* ACTION CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <CheckCircle className="text-blue-600 dark:text-blue-400" /> Presensi Harian
          </h3>
          
          {!attendanceToday ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Silakan lakukan presensi masuk.</p>
              <Button 
                onClick={handleCheckIn} 
                className="w-full py-4 text-lg"
                disabled={!distance || distance > config.radiusMeters}
              >
                {distance && distance > config.radiusMeters ? 'CHECK IN SEKARANG' : 'Mendekat ke Sekolah'}
              </Button>
              <button 
                onClick={() => setShowSubForm(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center mt-2"
              >
                Tidak bisa hadir? Kirim Tugas/Izin
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
                <p className="text-green-800 dark:text-green-300 font-medium">Sudah Check-In: {new Date(attendanceToday.checkInTime!).toLocaleTimeString()}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Status: {attendanceToday.status}</p>
              </div>
              
              {!attendanceToday.checkOutTime && attendanceToday.status !== AttendanceStatus.EXCUSED && attendanceToday.status !== AttendanceStatus.ABSENT ? (
                <Button onClick={handleCheckOut} variant="outline" className="w-full">CHECK OUT (Pulang)</Button>
              ) : (
                <Button disabled variant="secondary" className="w-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                  SELESAI
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* ADDITIONAL TASK */}
        <Card>
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Award className="text-orange-500" /> Tugas Tambahan
          </h3>
          {user.additionalRoles && user.additionalRoles.length > 0 ? (
            <div className="space-y-3">
              {user.additionalRoles.map(role => {
                const isDone = tasksDoneToday.includes(role);
                return (
                  <div key={role} className="flex justify-between items-center p-3 border dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{role}</span>
                    <Button 
                      onClick={() => handleAdditionalTask(role)} 
                      variant={isDone ? "success" : "secondary"}
                      disabled={isDone}
                      className="text-xs min-w-[80px]"
                    >
                      {isDone ? 'Selesai' : 'Lapor'}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Tidak ada tugas tambahan.</p>
          )}
        </Card>
      </div>

      {/* SUBSTITUTION MODAL */}
      {showSubForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-none">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Form Ketidakhadiran</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Alasan</label>
                <textarea 
                  className="w-full p-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Alasan tidak hadir..."
                  rows={3}
                  value={subReason}
                  onChange={e => setSubReason(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Link Tugas</label>
                <Input 
                  type="text"
                  placeholder="Link Tugas Pengganti (GDrive/dll)"
                  value={subLink}
                  onChange={e => setSubLink(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" onClick={() => setShowSubForm(false)}>Batal</Button>
                <Button onClick={submitSubstitution}>Kirim</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* HISTORY TABLE */}
      <Card>
        <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Riwayat Bulan Ini</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
              <tr>
                <th className="p-3 border-b dark:border-slate-700">Tanggal</th>
                <th className="p-3 border-b dark:border-slate-700">Tipe</th>
                <th className="p-3 border-b dark:border-slate-700">Masuk</th>
                <th className="p-3 border-b dark:border-slate-700">Keluar</th>
                <th className="p-3 border-b dark:border-slate-700">Status</th>
                <th className="p-3 border-b dark:border-slate-700">Poin</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className="border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {new Date(h.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{h.type}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{h.checkInTime ? new Date(h.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{h.checkOutTime ? new Date(h.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      h.status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 
                      h.status === AttendanceStatus.LATE ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                      h.status === AttendanceStatus.ABSENT ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-blue-600 dark:text-blue-400">+{h.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// 4. ADMIN DASHBOARD
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'reports' | 'settings'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // CRUD Teacher State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  
  // Settings State
  const [editConfig, setEditConfig] = useState<SchoolConfig | null>(null);

  // Report State
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null);
  const [viewingTaskUrl, setViewingTaskUrl] = useState<string | null>(null);
  const [lbCategory, setLbCategory] = useState<'Guru' | 'Wali Kelas' | 'Wakasek'>('Guru');

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const u = await DBService.getUsers();
    setUsers(u);
    const a = await DBService.getAttendance();
    setAttendance(a);
    const c = await DBService.getConfig();
    setConfig(c);
    setEditConfig(c);
    setLoading(false);
  };

  const handleExport = () => {
    ExcelService.exportToExcel(attendance, users);
  };

  // --- USER CRUD HANDLERS ---
  const handleSaveUser = async () => {
    if (!formData.username || !formData.fullName) return alert('Data tidak lengkap');
    
    const newUser: User = {
      id: editingUser ? editingUser.id : '', // Let DB handle ID gen if empty
      username: formData.username,
      password: formData.password || editingUser?.password || '123456',
      fullName: formData.fullName,
      nuptk: formData.nuptk || '',
      role: (formData.role as Role) || Role.GURU,
      isActive: formData.isActive ?? true,
      subjects: typeof formData.subjects === 'string' ? (formData.subjects as string).split(',') : formData.subjects,
      additionalRoles: typeof formData.additionalRoles === 'string' ? (formData.additionalRoles as string).split(',') : formData.additionalRoles,
      specificActiveDays: formData.specificActiveDays
    };
    
    await DBService.saveUser(newUser);
    refresh();
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Yakin ingin menghapus guru ini?')) {
      await DBService.deleteUser(id);
      refresh();
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(',');
        if (cols.length >= 2) {
          const u: User = {
            id: '',
            fullName: cols[0]?.trim(),
            username: cols[1]?.trim(),
            password: cols[2]?.trim() || '123456',
            nuptk: cols[3]?.trim() || '',
            role: Role.GURU,
            isActive: true,
            subjects: cols[4] ? cols[4].split(',').map(s=>s.trim()) : [],
            additionalRoles: cols[5] ? cols[5].split(',').map(s=>s.trim()) : []
          };
          await DBService.saveUser(u);
          count++;
        }
      }
      alert(`Berhasil import ${count} guru.`);
      refresh();
    };
    reader.readAsText(file);
  };

  const filteredAttendance = attendance.filter(a => {
    const monthMatch = a.date.startsWith(reportMonth);
    const teacherMatch = filterTeacher === 'all' || a.userId === filterTeacher;
    return monthMatch && teacherMatch;
  });

  const handleUpdateStatus = async (record: AttendanceRecord, newStatus: AttendanceStatus) => {
    const updated = { ...record, status: newStatus };
    await DBService.saveAttendance(updated);
    setEditingAttendance(null);
    refresh();
  };

  const handleSaveConfig = async () => {
    if (!editConfig) return;
    if (editConfig.startHour >= editConfig.endHour || editConfig.minCheckOutHour >= editConfig.endHour) {
      alert('Format waktu tidak valid! Pastikan Jam Mulai < Pulang < Selesai.');
      return;
    }
    await DBService.updateConfig(editConfig);
    setConfig(editConfig);
    alert('Pengaturan disimpan ke Cloud');
  };

  const toggleUserDay = (dayIndex: number) => {
    const current = formData.specificActiveDays || config?.activeDays || [];
    const newDays = current.includes(dayIndex)
      ? current.filter(d => d !== dayIndex)
      : [...current, dayIndex];
    setFormData({...formData, specificActiveDays: newDays.sort()});
  };

  const getLeaderboard = (roleFilter: string) => {
    const pointsMap: Record<string, number> = {};
    attendance.filter(r => r.type === AttendanceType.MAIN).forEach(r => { 
      pointsMap[r.userId] = (pointsMap[r.userId] || 0) + r.points; 
    });
    
    return users
      .filter(u => u.role === Role.GURU)
      .filter(u => roleFilter === 'Guru' ? true : u.additionalRoles?.includes(roleFilter))
      .map(u => ({
        id: u.id,
        name: u.fullName,
        points: pointsMap[u.id] || 0,
        roles: u.additionalRoles
      }))
      .sort((a,b) => b.points - a.points)
      .slice(0, 5);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-20 text-gray-800 dark:text-gray-100">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full">
          {(['overview', 'teachers', 'reports', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-300' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'overview' ? 'Dashboard' : tab === 'teachers' ? 'Data Guru' : tab === 'reports' ? 'Laporan' : 'Pengaturan'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
           <p className="text-sm font-bold text-gray-500 dark:text-slate-400 self-center hidden md:block">{config?.schoolName}</p>
           <Button onClick={handleExport} variant="outline" className="text-sm">
            <Download className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center border-l-4 border-blue-500">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Guru</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{users.filter(u => u.role === Role.GURU).length}</p>
            </Card>
            <Card className="text-center border-l-4 border-green-500">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Presensi Hari Ini</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.type === AttendanceType.MAIN).length}
              </p>
            </Card>
            <Card className="text-center border-l-4 border-red-500">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ketidakhadiran Bulan Ini</p>
              <p className="text-3xl font-bold text-red-500 dark:text-red-400">
                 {filteredAttendance.filter(a => a.status === AttendanceStatus.ABSENT).length}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <Card>
              <h3 className="font-bold mb-4 text-gray-700 dark:text-gray-200">Grafik Kehadiran (7 Hari Terakhir)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={attendance.slice(-50).reduce((acc: any[], curr) => {
                      const existing = acc.find(a => a.name === curr.date);
                      if (existing) {
                         if(curr.status === AttendanceStatus.PRESENT) existing.hadir++;
                         if(curr.status === AttendanceStatus.LATE) existing.telat++;
                      } else {
                         acc.push({ name: curr.date, hadir: curr.status === AttendanceStatus.PRESENT?1:0, telat: curr.status === AttendanceStatus.LATE?1:0 });
                      }
                      return acc;
                  }, []).slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-10" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="hadir" fill="#2563EB" name="Hadir" />
                    <Bar dataKey="telat" fill="#F59E0B" name="Terlambat" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Split Leaderboard */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><Award className="text-yellow-500"/> Top Poin</h3>
                <div className="flex bg-gray-100 dark:bg-slate-800 rounded p-1 text-xs">
                  {(['Guru', 'Wali Kelas', 'Wakasek'] as const).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setLbCategory(cat)}
                      className={`px-3 py-1 rounded transition-colors ${
                        lbCategory === cat 
                          ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-300 font-bold' 
                          : 'text-gray-500 dark:text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                 {getLeaderboard(lbCategory).map((u, idx) => (
                   <div key={u.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-800 rounded border border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx===0?'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400':'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {idx+1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{u.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{u.roles?.join(', ') || 'Guru Mapel'}</p>
                        </div>
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{u.points}</span>
                   </div>
                 ))}
                 {getLeaderboard(lbCategory).length === 0 && <p className="text-center text-gray-400 text-sm">Tidak ada data.</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'teachers' && (
        <Card>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
             <h3 className="font-bold text-gray-700 dark:text-gray-200">Manajemen Data Guru</h3>
             <div className="flex flex-wrap gap-2">
                <Button onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(DBService.getTeacherCSVTemplate());
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "template_guru.csv");
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }} variant="secondary" className="text-xs">
                   <FileDown className="w-4 h-4" /> Template CSV
                </Button>
                <label className="cursor-pointer bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Import CSV
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                </label>
                <Button onClick={() => { setEditingUser(null); setFormData({}); setIsUserModalOpen(true); }} className="text-sm">
                  <Plus className="w-4 h-4" /> Tambah Guru
                </Button>
             </div>
           </div>
           
           <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="p-3 border-b dark:border-slate-700 text-gray-600 dark:text-slate-300">Nama</th>
                  <th className="p-3 border-b dark:border-slate-700 text-gray-600 dark:text-slate-300">NUPTK</th>
                  <th className="p-3 border-b dark:border-slate-700 text-gray-600 dark:text-slate-300">Username</th>
                  <th className="p-3 border-b dark:border-slate-700 text-gray-600 dark:text-slate-300">Role</th>
                  <th className="p-3 border-b dark:border-slate-700 text-gray-600 dark:text-slate-300">Hari Wajib</th>
                  <th className="p-3 border-b dark:border-slate-700 text-gray-600 dark:text-slate-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{u.fullName}</td>
                    <td className="p-3 text-gray-500 dark:text-gray-400">{u.nuptk}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{u.username}</td>
                    <td className="p-3">
                      {u.additionalRoles?.map(r => (
                        <span key={r} className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded mr-1">{r}</span>
                      ))}
                      {u.role === Role.ADMIN && <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs px-2 py-0.5 rounded">Admin</span>}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                       {u.specificActiveDays ? u.specificActiveDays.length + ' Hari' : 'Mengikuti Sekolah'}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => { setEditingUser(u); setFormData(u); setIsUserModalOpen(true); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 dark:text-red-400 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
           </div>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card>
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-200">Laporan & Validasi</h3>
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
               <div className="w-full md:w-auto">
                 <label className="text-xs text-gray-500 dark:text-slate-400 block mb-1">Filter Guru</label>
                 <Select 
                   value={filterTeacher}
                   onChange={(e) => setFilterTeacher(e.target.value)}
                 >
                   <option value="all">Semua Guru</option>
                   {users.filter(u => u.role === Role.GURU).map(u => (
                     <option key={u.id} value={u.id}>{u.fullName}</option>
                   ))}
                 </Select>
               </div>
               <div className="w-full md:w-auto">
                 <label className="text-xs text-gray-500 dark:text-slate-400 block mb-1">Pilih Bulan</label>
                 <Input 
                   type="month" 
                   value={reportMonth}
                   onChange={(e) => setReportMonth(e.target.value)}
                 />
               </div>
            </div>
          </div>

          {/* Matrix View for Monthly Report */}
          <div className="overflow-x-auto pb-4">
             <h4 className="font-bold text-sm text-gray-600 dark:text-slate-300 mb-2">Matrix Kehadiran (H=Hadir, T=Telat, I=Izin, A=Alpha)</h4>
             <table className="w-full text-xs text-center border-collapse">
               <thead>
                 <tr>
                   <th className="border dark:border-slate-700 p-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-left min-w-[150px] sticky left-0 z-10">Nama Guru</th>
                   {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                     <th key={d} className="border dark:border-slate-700 p-1 min-w-[30px] text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800">{d}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                  {users.filter(u => u.role === Role.GURU && (filterTeacher === 'all' || u.id === filterTeacher)).map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="border dark:border-slate-700 p-2 text-left sticky left-0 bg-white dark:bg-slate-900 font-medium text-gray-800 dark:text-gray-200">{user.fullName}</td>
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                        const dateStr = `${reportMonth}-${String(day).padStart(2, '0')}`;
                        const record = attendance.find(a => a.userId === user.id && a.date === dateStr && a.type === AttendanceType.MAIN);
                        let cellBg = 'bg-white dark:bg-slate-900';
                        let text = '-';
                        let textColor = 'text-gray-400 dark:text-slate-600';
                        if (record) {
                          if (record.status === AttendanceStatus.PRESENT) { text = 'H'; cellBg = 'bg-green-100 dark:bg-green-900/40'; textColor='text-green-900 dark:text-green-200'; }
                          else if (record.status === AttendanceStatus.LATE) { text = 'T'; cellBg = 'bg-yellow-100 dark:bg-yellow-900/40'; textColor='text-yellow-900 dark:text-yellow-200'; }
                          else if (record.status === AttendanceStatus.ABSENT) { text = 'A'; cellBg = 'bg-red-100 dark:bg-red-900/40'; textColor='text-red-900 dark:text-red-200'; }
                          else { text = 'I'; cellBg = 'bg-blue-100 dark:bg-blue-900/40'; textColor='text-blue-900 dark:text-blue-200'; }
                        }
                        return (
                          <td key={day} className={`border dark:border-slate-700 p-1 font-bold ${cellBg} ${textColor}`}>{text}</td>
                        );
                      })}
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>

          <div className="mt-8">
            <h4 className="font-bold text-sm text-gray-600 dark:text-slate-300 mb-2">Detail & Edit Presensi</h4>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                  <tr>
                    <th className="p-3 text-gray-600 dark:text-slate-300">Tanggal</th>
                    <th className="p-3 text-gray-600 dark:text-slate-300">Nama Guru</th>
                    <th className="p-3 text-gray-600 dark:text-slate-300">Status</th>
                    <th className="p-3 text-gray-600 dark:text-slate-300">Masuk/Keluar</th>
                    <th className="p-3 text-gray-600 dark:text-slate-300">Keterangan/Tugas</th>
                    <th className="p-3 text-gray-600 dark:text-slate-300">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.sort((a,b) => b.date.localeCompare(a.date)).map(record => {
                    const user = users.find(u => u.id === record.userId);
                    const isEditing = editingAttendance?.id === record.id;
                    
                    return (
                      <tr key={record.id} className="border-t dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{record.date}</td>
                        <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{user?.fullName || 'Unknown'}</td>
                        <td className="p-3">
                          {isEditing ? (
                            <Select 
                              value={record.status}
                              onChange={(e) => handleUpdateStatus(record, e.target.value as AttendanceStatus)}
                            >
                              {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              record.status === AttendanceStatus.PRESENT ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                              record.status === AttendanceStatus.ABSENT ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 
                              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}>
                              {record.status}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-gray-500 dark:text-gray-400">
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'} - 
                          {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                        </td>
                        <td className="p-3">
                          {record.notes && <div className="text-xs italic text-gray-600 dark:text-gray-400 mb-1">"{record.notes}"</div>}
                          {record.substitutionLink && (
                            <button 
                              onClick={() => setViewingTaskUrl(record.substitutionLink || null)}
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs hover:underline"
                            >
                              <Eye className="w-3 h-3" /> Lihat Tugas
                            </button>
                          )}
                        </td>
                        <td className="p-3">
                          <button onClick={() => setEditingAttendance(isEditing ? null : record)} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAttendance.length === 0 && <p className="text-center p-4 text-gray-400">Tidak ada data untuk filter ini.</p>}
            </div>
          </div>
        </Card>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* NOTE: Backup/Restore is disabled because Supabase manages data integrity */}
          <Card>
            <h3 className="font-bold mb-4 text-lg border-b dark:border-slate-700 pb-2 text-gray-800 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5" /> Identitas & Lokasi
            </h3>
            {editConfig && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-slate-300">Nama Sekolah</label>
                    <Input 
                      type="text" 
                      value={editConfig.schoolName || ''}
                      onChange={e => setEditConfig({...editConfig, schoolName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-slate-300">Alamat</label>
                    <Input 
                      type="text" 
                      value={editConfig.schoolAddress || ''}
                      onChange={e => setEditConfig({...editConfig, schoolAddress: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-3 text-sm">Titik Koordinat Sekolah</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Latitude</label>
                      <Input type="number" step="any" value={editConfig.latitude} onChange={e => setEditConfig({...editConfig, latitude: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Longitude</label>
                      <Input type="number" step="any" value={editConfig.longitude} onChange={e => setEditConfig({...editConfig, longitude: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Radius (Meter)</label>
                      <Input type="number" value={editConfig.radiusMeters} onChange={e => setEditConfig({...editConfig, radiusMeters: parseInt(e.target.value)})} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {editConfig && (
            <Card>
              <h3 className="font-bold mb-4 text-lg border-b dark:border-slate-700 pb-2 text-gray-800 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5" /> Aturan Waktu Presensi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30 flex flex-col justify-between">
                  <div>
                      <label className="block text-sm font-bold text-green-800 dark:text-green-300 mb-1">Jam Buka Absen</label>
                      <p className="text-xs text-green-600 dark:text-green-400 mb-2">Waktu paling awal guru bisa melakukan Check-In.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="text-center text-lg font-bold" min={0} max={23} value={editConfig.startHour} onChange={e => setEditConfig({...editConfig, startHour: parseInt(e.target.value)})} />
                    <span className="text-sm font-medium">.00 WIB</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex flex-col justify-between">
                  <div>
                      <label className="block text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-1">Min. Jam Pulang</label>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">Guru tidak bisa Check-Out sebelum jam ini.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="text-center text-lg font-bold" min={0} max={23} value={editConfig.minCheckOutHour} onChange={e => setEditConfig({...editConfig, minCheckOutHour: parseInt(e.target.value)})} />
                    <span className="text-sm font-medium">.00 WIB</span>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col justify-between">
                  <div>
                      <label className="block text-sm font-bold text-red-800 dark:text-red-300 mb-1">Batas Akhir Ops.</label>
                      <p className="text-xs text-red-600 dark:text-red-400 mb-2">Batas sistem menutup presensi harian.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="text-center text-lg font-bold" min={0} max={23} value={editConfig.endHour} onChange={e => setEditConfig({...editConfig, endHour: parseInt(e.target.value)})} />
                    <span className="text-sm font-medium">.00 WIB</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveConfig}>
              <Save className="w-4 h-4" /> Simpan Konfigurasi
            </Button>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? "Edit Guru" : "Tambah Guru Baru"}>
         <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nama Lengkap</label>
              <Input type="text" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Username</label>
                <Input type="text" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
                <Input type="text" placeholder="Default: 123456" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">NUPTK</label>
              <Input type="text" value={formData.nuptk || ''} onChange={e => setFormData({...formData, nuptk: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Mata Pelajaran</label>
              <Input type="text" placeholder="Pisahkan dengan koma" value={formData.subjects?.toString() || ''} onChange={e => setFormData({...formData, subjects: e.target.value.split(',')})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tugas Tambahan</label>
              <Input type="text" placeholder="Contoh: Wali Kelas, Pembina OSIS" value={formData.additionalRoles?.toString() || ''} onChange={e => setFormData({...formData, additionalRoles: e.target.value.split(',')})} />
            </div>
            <div>
               <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Hari Wajib Hadir</label>
               <div className="flex flex-wrap gap-2">
                 {['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'].map((day, idx) => {
                    const isSpecific = formData.specificActiveDays && formData.specificActiveDays.length > 0;
                    const isActive = isSpecific 
                      ? formData.specificActiveDays!.includes(idx) 
                      : (config?.activeDays || []).includes(idx);
                    
                    let btnClass = 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500';
                    if (isActive) {
                      btnClass = isSpecific 
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-700 dark:text-blue-300' 
                        : 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-700 dark:text-green-300';
                    }

                    return (
                     <button 
                       key={day}
                       onClick={() => toggleUserDay(idx)}
                       className={`px-3 py-1 text-xs rounded-full border transition-colors ${btnClass}`}
                     >
                       {day}
                     </button>
                    );
                 })}
               </div>
               <p className="text-[10px] text-gray-500 mt-2">*Hijau = Default Sekolah, Biru = Khusus Guru ini</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
               <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>Batal</Button>
               <Button onClick={handleSaveUser}>Simpan</Button>
            </div>
         </div>
      </Modal>

      {/* TASK PREVIEW MODAL */}
      {viewingTaskUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col relative">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800 rounded-t-xl">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Preview Tugas
              </h3>
              <div className="flex gap-2">
                <a 
                  href={viewingTaskUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <ExternalLink className="w-3 h-3" /> Buka di Tab Baru
                </a>
                <button onClick={() => setViewingTaskUrl(null)} className="text-gray-500 hover:text-red-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-slate-950 p-2 overflow-hidden">
               <iframe 
                 src={viewingTaskUrl} 
                 className="w-full h-full border dark:border-slate-700 rounded bg-white" 
                 title="Preview Tugas"
                 onError={(e) => alert('Gagal memuat preview. Silakan buka di tab baru.')}
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for persisted session
    const savedUser = localStorage.getItem('geo_presensi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
    
    // Check dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('geo_presensi_user', JSON.stringify(loggedInUser));
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('geo_presensi_user');
    setView('landing');
  };

  // View Routing
  if (view === 'landing') {
    return <Leaderboard onLoginClick={() => setView('login')} />;
  }

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />;
  }

  // Dashboard View (User is logged in)
  if (!user) return <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="font-bold text-gray-800 dark:text-white hidden sm:block">GeoPresensi</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l dark:border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 dark:text-white">{user.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {user.role === Role.ADMIN ? (
          <AdminDashboard />
        ) : (
          <TeacherDashboard user={user} />
        )}
      </main>
    </div>
  );
};

export default App;
