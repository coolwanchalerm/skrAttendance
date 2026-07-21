import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, ChevronDown, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { apiCall } from '../api';
import { resizeImage } from '../utils/imageUtils';

export default function UserPage() {
  const [time, setTime] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [phone, setPhone] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const photoInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Fetch initial data
    apiCall('apiGetEmployees')
      .then(data => {
        setEmployees(data || []);
        const depts = [...new Set((data || []).map(e => e.dept))].sort();
        setDepartments(depts);
      })
      .catch(err => {
        console.error(err);
        Swal.fire('Error', 'ไม่สามารถดึงข้อมูลพนักงานได้ โปรดตรวจสอบการเชื่อมต่อ API', 'error');
      })
      .finally(() => setLoading(false));

    return () => clearInterval(timer);
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    if (!phone) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกเบอร์โทรศัพท์', confirmButtonColor: '#4f46e5' });
      return;
    }
    if (!phone.startsWith('0') || phone.length > 10 || phone.length < 9) {
      Swal.fire({ icon: 'warning', title: 'เบอร์โทรศัพท์ไม่ถูกต้อง', text: 'ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก', confirmButtonColor: '#4f46e5' });
      return;
    }
    if (!photoFile) {
      Swal.fire({ icon: 'warning', title: 'กรุณาแนบรูปภาพ', confirmButtonColor: '#4f46e5' });
      return;
    }

    try {
      setLoading(true);
      const emp = employees.find(e => String(e.id) === String(selectedEmp));
      if (!emp) throw new Error("ไม่พบข้อมูลพนักงาน");

      const timeStr = time.toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const status = timeStr > "08:30" ? 'สาย' : 'ปกติ';
      
      const photoBase64 = await resizeImage(photoFile, 500, 0.7);

      const year = time.getFullYear();
      const month = String(time.getMonth() + 1).padStart(2, '0');
      const day = String(time.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}`;

      const newRecord = {
        id: Date.now(),
        empId: emp.id,
        empName: emp.name,
        dept: emp.dept,
        phone: phone, 
        date: localDate, 
        time: timeStr,
        status: status,
        photo: photoBase64
      };

      const result = await apiCall('apiSaveAttendance', newRecord);

      setLoading(false);
      if (result.success) {
        Swal.fire({ 
          icon: 'success', title: 'บันทึกสำเร็จ', text: `เวลา: ${timeStr} น.`, 
          timer: 3000, showConfirmButton: false 
        });
        setSelectedDept('');
        setSelectedEmp('');
        setPhone('');
        clearPhoto();
      } else {
        Swal.fire('แจ้งเตือน', result.message, 'warning');
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการบันทึก: ' + err.message, 'error');
    }
  };

  const filteredEmployees = employees.filter(e => e.dept === selectedDept);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <div className="text-indigo-600 font-bold text-lg">กำลังประมวลผล...</div>
        </div>
      )}

      <div className="glass-panel p-8 border border-white/60 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">บันทึกเวลาปฏิบัติงาน</h2>
          
          <div className="text-center mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-white/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
            <div className="text-5xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-wider">
              {time.toLocaleTimeString('th-TH', { hour12: false })}
            </div>
            <div className="text-slate-500 mt-2 font-medium text-lg">
              {time.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2">กลุ่มสาระการเรียนรู้</label>
              <div className="relative group">
                <select 
                  value={selectedDept}
                  onChange={(e) => { setSelectedDept(e.target.value); setSelectedEmp(''); }}
                  className="w-full p-3.5 pl-4 bg-white/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white appearance-none transition-all duration-300 shadow-sm"
                >
                  <option value="">-- เลือกกลุ่มสาระ --</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2">ชื่อ - นามสกุล</label>
              <div className="relative group">
                <select 
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  disabled={!selectedDept}
                  required
                  className="w-full p-3.5 pl-4 bg-white/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white appearance-none transition-all duration-300 shadow-sm disabled:opacity-60 disabled:bg-slate-50"
                >
                  <option value="">{selectedDept ? '-- เลือกลายชื่อ --' : '-- กรุณาเลือกกลุ่มสาระก่อน --'}</option>
                  {filteredEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2">เบอร์โทรศัพท์ (ยืนยันตัวตน) <span className="text-rose-500">*</span></label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full p-3.5 pl-4 bg-white/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all duration-300 font-mono tracking-wide shadow-sm" 
                placeholder="08XXXXXXXX" 
                maxLength="10" 
                inputMode="numeric"
                required 
              />
            </div>

            <div className="pt-2">
              <label className="block text-slate-700 text-sm font-semibold mb-2">หลักฐาน (รูปถ่ายใบหน้า) <span className="text-rose-500">*</span></label>
              <div className="relative w-full h-64 rounded-3xl overflow-hidden group">
                <input 
                  ref={photoInputRef}
                  id="photoInput" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  capture="user"
                  onChange={handlePhotoChange}
                />
                
                {photoPreview ? (
                  <div className="relative w-full h-full">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={clearPhoto}
                      className="absolute top-3 right-3 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 shadow-lg transform transition-transform active:scale-95"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label 
                    htmlFor="photoInput" 
                    className="flex flex-col items-center justify-center w-full h-full bg-slate-50 border-2 border-dashed border-indigo-200 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300"
                  >
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-indigo-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300">
                      <Camera size={32} />
                    </div>
                    <p className="text-slate-600 font-medium">แตะเพื่อถ่ายรูป / เลือกรูป</p>
                    <p className="text-slate-400 text-sm mt-1">ไฟล์ภาพ JPEG/PNG</p>
                  </label>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-indigo-200 transform transition-all hover:-translate-y-1 active:translate-y-0"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <CheckCircle2 size={22} />
                  <span>บันทึกเวลาปฏิบัติงาน</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
