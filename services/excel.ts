import * as XLSX from 'xlsx';
import { AttendanceRecord, User, AttendanceStatus, AttendanceType } from '../types';

export const exportToExcel = (attendanceData: AttendanceRecord[], users: User[]) => {
  const wb = XLSX.utils.book_new();
  const today = new Date();
  const monthStr = today.toISOString().slice(0, 7); // YYYY-MM
  
  // Get days in current month for Matrix
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);

  // Helper to map user ID to Name
  const getUserName = (id: string) => users.find(u => u.id === id)?.fullName || id;

  // --- Sheet 1: Presensi Matrix (Horizontal Dates) ---
  const teachers = users.filter(u => u.role === 'guru');
  
  const matrixData = teachers.map(t => {
    const row: any = {
      Nama: t.fullName,
      NUPTK: t.nuptk,
      Jabatan: t.additionalRoles?.join(', ') || 'Guru Mapel'
    };

    // Fill days
    daysArray.forEach(day => {
      const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
      const record = attendanceData.find(a => 
        a.userId === t.id && 
        a.date === dateStr && 
        a.type === AttendanceType.MAIN
      );
      
      let code = '-';
      if (record) {
        if (record.status === AttendanceStatus.PRESENT) code = 'H';
        else if (record.status === AttendanceStatus.LATE) code = 'T';
        else if (record.status === AttendanceStatus.EXCUSED) code = 'I';
        else if (record.status === AttendanceStatus.ABSENT) code = 'A';
      }
      row[String(day)] = code;
    });

    // Summary columns at the end
    const teacherRecords = attendanceData.filter(a => a.userId === t.id && a.date.startsWith(monthStr) && a.type === AttendanceType.MAIN);
    row['Total Hadir'] = teacherRecords.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
    row['Total Poin'] = teacherRecords.reduce((acc, curr) => acc + curr.points, 0);

    return row;
  });

  const wsMatrix = XLSX.utils.json_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(wb, wsMatrix, "Absensi Matrix");


  // --- Sheet 2: Detail Harian Lengkap ---
  const mainData = attendanceData
    .filter(a => a.type === AttendanceType.MAIN && a.date.startsWith(monthStr))
    .sort((a, b) => {
       if (a.date === b.date) return getUserName(a.userId).localeCompare(getUserName(b.userId));
       return a.date.localeCompare(b.date);
    })
    .map(a => {
      const u = users.find(user => user.id === a.userId);
      return {
        Tanggal: a.date,
        Nama: u?.fullName,
        NUPTK: u?.nuptk,
        Jabatan: u?.additionalRoles?.join(', '),
        Jenis_Presensi: a.type,
        Jam_Masuk: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : '-',
        Jam_Keluar: a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : '-',
        Status: a.status,
        Poin: a.points,
        Keterangan: a.notes || '-',
        Jarak: `${Math.round(a.distance)}m`
      };
    });
  const wsMain = XLSX.utils.json_to_sheet(mainData);
  XLSX.utils.book_append_sheet(wb, wsMain, "Detail Harian");

  // --- Sheet 3: Tugas Tambahan ---
  const taskData = attendanceData
    .filter(a => a.type === AttendanceType.ADDITIONAL && a.date.startsWith(monthStr))
    .map(a => {
      const u = users.find(user => user.id === a.userId);
      return {
        Tanggal: a.date,
        Nama: u?.fullName,
        Jabatan: u?.additionalRoles?.join(', '),
        Waktu_Lapor: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : '-',
        Poin: a.points
      }
    });
  const wsTask = XLSX.utils.json_to_sheet(taskData);
  XLSX.utils.book_append_sheet(wb, wsTask, "Laporan Tugas");

  XLSX.writeFile(wb, `Laporan_Presensi_${monthStr}.xlsx`);
};