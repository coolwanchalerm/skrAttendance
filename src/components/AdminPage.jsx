import React, { useState, useEffect, useMemo } from 'react';
import { apiCall } from '../api';
import Swal from 'sweetalert2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { 
  Users, Clock, UserX, AlertCircle, Upload, Download, 
  RotateCcw, Search, Filter, Edit, Trash2, Image as ImageIcon,
  ChevronLeft, ChevronRight, LayoutDashboard, Database
} from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminPage() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recs, emps] = await Promise.all([
        apiCall('apiGetRecords'),
        apiCall('apiGetEmployees')
      ]);
      setRecords(recs || []);
      setEmployees(emps || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'โหลดข้อมูลไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!records.length && !employees.length) return [];
    
    const recordsForDate = records.filter(r => r.date === filterDate);
    const combined = employees.map(emp => {
      const existing = recordsForDate.find(r => String(r.empId) === String(emp.id));
      if (existing) return existing;
      return {
        id: 'missing_' + emp.id, empId: emp.id, empName: emp.name, dept: emp.dept,
        date: filterDate, time: '-', status: 'ไม่ลงเวลา', photo: null, isMissing: true
      };
    });

    let filtered = combined.filter(rec => {
      const matchStatus = filterStatus === 'all' ? true : rec.status === filterStatus;
      const matchSearch = rec.empName.toLowerCase().includes(filterSearch.toLowerCase()) || 
                          rec.dept.toLowerCase().includes(filterSearch.toLowerCase());
      return matchStatus && matchSearch;
    });

    return filtered.sort((a, b) => {
      if (a.status === 'ไม่ลงเวลา' && b.status !== 'ไม่ลงเวลา') return 1;
      if (a.status !== 'ไม่ลงเวลา' && b.status === 'ไม่ลงเวลา') return -1;
      return (b.date + b.time).localeCompare(a.date + a.time);
    });
  }, [records, employees, filterDate, filterStatus, filterSearch]);

  const stats = useMemo(() => {
    const normal = filteredRecords.filter(r => r.status === 'ปกติ').length;
    const late = filteredRecords.filter(r => r.status === 'สาย').length;
    const absent = filteredRecords.filter(r => r.status === 'ไม่ลงเวลา').length;
    return { total: filteredRecords.length, normal, late, absent };
  }, [filteredRecords]);

  const deptStats = useMemo(() => {
    const counts = {};
    filteredRecords.filter(r => r.status !== 'ไม่ลงเวลา').forEach(r => {
      counts[r.dept] = (counts[r.dept] || 0) + 1;
    });
    return counts;
  }, [filteredRecords]);

  // Pagination
  const totalPages = rowsPerPage === 'all' ? 1 : Math.ceil(filteredRecords.length / rowsPerPage);
  const displayData = rowsPerPage === 'all' ? filteredRecords : filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title: 'ลบข้อมูล?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', confirmButtonColor: '#ef4444' });
    if (r.isConfirmed) {
      setLoading(true);
      const res = await apiCall('apiDeleteRecord', { id });
      if (res.success) {
        Swal.fire('สำเร็จ', 'ลบข้อมูลแล้ว', 'success');
        loadData();
      } else {
        Swal.fire('Error', res.message, 'error');
        setLoading(false);
      }
    }
  };

  const handleEdit = async (id, currentTime) => {
    const { value: newTime } = await Swal.fire({
      title: 'แก้ไขเวลา',
      html: `<input id="swal-time" type="time" class="swal2-input" value="${currentTime}">`,
      showCancelButton: true,
      preConfirm: () => document.getElementById('swal-time').value
    });

    if (newTime) {
      setLoading(true);
      const status = newTime > "08:30" ? 'สาย' : 'ปกติ';
      const res = await apiCall('apiUpdateRecord', { id, time: newTime, status });
      if (res.success) {
        Swal.fire('สำเร็จ', 'อัพเดทเวลาแล้ว', 'success');
        loadData();
      } else {
        Swal.fire('Error', res.message, 'error');
        setLoading(false);
      }
    }
  };

  const exportExcel = () => {
    const data = filteredRecords.map(rec => ({
      'วันที่': format(new Date(rec.date), 'dd MMM yy'),
      'เวลา': rec.time,
      'ชื่อ - นามสกุล': rec.empName,
      'กลุ่มสาระ': rec.dept,
      'สถานะ': rec.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Report_${filterDate}.xlsx`);
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const newEmp = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const [id, name, phone, dept] = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (id && name) newEmp.push({ id, name, phone: phone || '', dept: dept || 'ทั่วไป' });
      }
      if (newEmp.length > 0) {
        setLoading(true);
        const res = await apiCall('apiImportEmployees', newEmp);
        if (res.success) {
          Swal.fire('สำเร็จ', `นำเข้า ${newEmp.length} รายชื่อ`, 'success');
          loadData();
        } else {
          Swal.fire('Error', res.message, 'error');
          setLoading(false);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const viewPhoto = (url) => {
    let fileId = null;
    try {
      if (url.includes('id=')) {
        fileId = url.split('id=')[1].split('&')[0];
      } else if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1].split('/')[0];
      }
    } catch (e) {}

    if (fileId) {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
    } else {
      Swal.fire({ imageUrl: url, showConfirmButton: false, showCloseButton: true, width: 'auto' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mb-4"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-slate-500 text-sm">ภาพรวมการลงเวลาประจำวัน</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="พนักงานทั้งหมด" value={stats.total} icon={Users} color="from-blue-500 to-cyan-500" />
        <StatCard title="มาปกติ" value={stats.normal} icon={Clock} color="from-emerald-500 to-teal-500" />
        <StatCard title="มาสาย" value={stats.late} icon={AlertCircle} color="from-orange-400 to-amber-500" />
        <StatCard title="ไม่ลงเวลา" value={stats.absent} icon={UserX} color="from-rose-500 to-pink-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-white/60">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div> สัดส่วนการมาทำงาน
          </h3>
          <div className="h-64 relative">
            <Doughnut 
              data={{
                labels: ['ปกติ', 'สาย', 'ไม่ลงเวลา'],
                datasets: [{ data: [stats.normal, stats.late, stats.absent], backgroundColor: ['#10b981', '#f97316', '#ef4444'], borderWidth: 0 }]
              }}
              options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>
        <div className="glass-panel p-6 border border-white/60">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <div className="w-2 h-6 bg-purple-500 rounded-full"></div> สถิติแยกตามกลุ่มสาระฯ
          </h3>
          <div className="h-64">
            <Bar 
              data={{
                labels: Object.keys(deptStats),
                datasets: [{ label: 'มาทำงาน', data: Object.values(deptStats), backgroundColor: '#8b5cf6', borderRadius: 6 }]
              }}
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } } }}
            />
          </div>
        </div>
      </div>

      {/* Data Management & Table */}
      <div className="glass-panel p-6 border border-white/60">
        {/* Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto bg-slate-50 p-2 rounded-xl">
            <div className="flex items-center gap-2 px-2 text-slate-500 text-sm font-medium">
              <Database size={16} /> ฐานข้อมูล
            </div>
            <label className="cursor-pointer bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 text-sm py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-sm">
              <Upload size={16} /> นำเข้าพนักงาน (CSV)
              <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="pl-3 text-slate-400"><Search size={16} /></div>
              <input type="text" placeholder="ค้นหาชื่อ..." value={filterSearch} onChange={e => {setFilterSearch(e.target.value); setCurrentPage(1);}} className="p-2 pl-2 outline-none text-sm w-32 sm:w-48" />
            </div>
            
            <input type="date" value={filterDate} onChange={e => {setFilterDate(e.target.value); setCurrentPage(1);}} className="border border-slate-200 p-2 rounded-lg text-sm bg-white outline-none shadow-sm" />
            
            <select value={filterStatus} onChange={e => {setFilterStatus(e.target.value); setCurrentPage(1);}} className="border border-slate-200 p-2 rounded-lg text-sm bg-white outline-none shadow-sm">
              <option value="all">ทุกสถานะ</option>
              <option value="ปกติ">ปกติ</option>
              <option value="สาย">สาย</option>
              <option value="ไม่ลงเวลา">ไม่ลงเวลา</option>
            </select>
            
            <button onClick={() => {setFilterDate(format(new Date(), 'yyyy-MM-dd')); setFilterStatus('all'); setFilterSearch(''); setCurrentPage(1);}} className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition" title="Reset">
              <RotateCcw size={18} />
            </button>
            
            <button onClick={exportExcel} className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 flex items-center gap-2 shadow-sm shadow-emerald-200 transition text-sm font-medium ml-auto xl:ml-0">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <th className="py-4 px-6 border-b border-slate-200">วันที่</th>
                <th className="py-4 px-6 border-b border-slate-200">เวลา</th>
                <th className="py-4 px-6 border-b border-slate-200">ชื่อ - นามสกุล</th>
                <th className="py-4 px-6 border-b border-slate-200">กลุ่มสาระ</th>
                <th className="py-4 px-6 border-b border-slate-200 text-center">หลักฐาน</th>
                <th className="py-4 px-6 border-b border-slate-200 text-center">สถานะ</th>
                <th className="py-4 px-6 border-b border-slate-200 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm">
              {displayData.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-slate-400"><div className="flex flex-col items-center gap-2"><Filter size={32} className="opacity-50" />ไม่มีข้อมูลตามเงื่อนไข</div></td></tr>
              ) : (
                displayData.map((rec, i) => {
                  const emp = employees.find(e => String(e.id) === String(rec.empId));
                  return (
                    <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-6 whitespace-nowrap text-slate-600">{format(new Date(rec.date), 'dd MMM yy')}</td>
                      <td className="py-3 px-6 font-mono text-slate-700 font-medium">{rec.time}</td>
                      <td className="py-3 px-6 font-medium text-slate-800">
                        {rec.empName}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">{emp?.phone || '-'}</div>
                      </td>
                      <td className="py-3 px-6 text-slate-600">{rec.dept}</td>
                      <td className="py-3 px-6 text-center">
                        {rec.photo && !rec.photo.startsWith('Error') ? (
                          <button onClick={() => viewPhoto(rec.photo)} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-2 rounded-lg transition-colors inline-block">
                            <ImageIcon size={18} />
                          </button>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          rec.status === 'สาย' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          rec.status === 'ไม่ลงเวลา' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                          'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        {!rec.isMissing ? (
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => handleEdit(rec.id, rec.time)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded transition"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(rec.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition"><Trash2 size={16} /></button>
                          </div>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span>แสดง</span>
            <select value={rowsPerPage} onChange={e => {setRowsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1);}} className="border border-slate-200 rounded p-1 outline-none">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value="all">ทั้งหมด</option>
            </select>
            <span>รายการ</span>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-slate-200 disabled:opacity-50 hover:bg-slate-50"><ChevronLeft size={16} /></button>
            <span className="py-1.5 px-3 bg-slate-50 rounded border border-slate-100">หน้า {currentPage} / {totalPages || 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1.5 rounded border border-slate-200 disabled:opacity-50 hover:bg-slate-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group`}>
      <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <p className="text-white/80 font-medium mb-1">{title}</p>
        <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
