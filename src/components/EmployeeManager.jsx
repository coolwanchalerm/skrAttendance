import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Pencil, Trash2, Search, Building } from 'lucide-react';
import Swal from 'sweetalert2';
import { apiCall } from '../api';

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await apiCall('apiGetEmployees');
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'ไม่สามารถดึงข้อมูลพนักงานได้', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAddEmployee = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'เพิ่มพนักงานใหม่',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="รหัสพนักงาน (ID)">
        <input id="swal-input2" class="swal2-input" placeholder="ชื่อ - นามสกุล">
        <input id="swal-input3" class="swal2-input" placeholder="เบอร์โทรศัพท์">
        <input id="swal-input4" class="swal2-input" placeholder="กลุ่มสาระการเรียนรู้ / แผนก">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5',
      preConfirm: () => {
        const id = document.getElementById('swal-input1').value;
        const name = document.getElementById('swal-input2').value;
        const phone = document.getElementById('swal-input3').value;
        const dept = document.getElementById('swal-input4').value;
        
        if (!id || !name || !phone || !dept) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        return { id, name, phone, dept };
      }
    });

    if (formValues) {
      Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await apiCall('apiAddEmployee', formValues);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });
          loadEmployees();
        } else {
          Swal.fire('แจ้งเตือน', res.message, 'warning');
        }
      } catch (e) {
        Swal.fire('Error', e.message, 'error');
      }
    }
  };

  const handleEditEmployee = async (emp) => {
    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขข้อมูลพนักงาน',
      html: `
        <input id="swal-edit1" class="swal2-input" value="${emp.id}" disabled title="ไม่สามารถแก้ไขรหัสได้">
        <input id="swal-edit2" class="swal2-input" placeholder="ชื่อ - นามสกุล" value="${emp.name}">
        <input id="swal-edit3" class="swal2-input" placeholder="เบอร์โทรศัพท์" value="${emp.phone}">
        <input id="swal-edit4" class="swal2-input" placeholder="กลุ่มสาระการเรียนรู้ / แผนก" value="${emp.dept}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'อัปเดต',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5',
      preConfirm: () => {
        const id = document.getElementById('swal-edit1').value;
        const name = document.getElementById('swal-edit2').value;
        const phone = document.getElementById('swal-edit3').value;
        const dept = document.getElementById('swal-edit4').value;
        
        if (!name || !phone || !dept) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        return { id, name, phone, dept };
      }
    });

    if (formValues) {
      Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await apiCall('apiUpdateEmployee', formValues);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'อัปเดตสำเร็จ', timer: 1500, showConfirmButton: false });
          loadEmployees();
        } else {
          Swal.fire('แจ้งเตือน', res.message, 'warning');
        }
      } catch (e) {
        Swal.fire('Error', e.message, 'error');
      }
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    const confirm = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบข้อมูลของ ${name} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (confirm.isConfirmed) {
      Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await apiCall('apiDeleteEmployee', { id });
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false });
          loadEmployees();
        } else {
          Swal.fire('แจ้งเตือน', res.message, 'warning');
        }
      } catch (e) {
        Swal.fire('Error', e.message, 'error');
      }
    }
  };

  const filteredEmployees = employees.filter(e => 
    String(e.name).toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(e.id).includes(searchTerm) || 
    String(e.dept).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-indigo-600" />
            จัดการรายชื่อพนักงาน
          </h2>
          <p className="text-slate-500 mt-1">เพิ่ม ลบ แก้ไข ข้อมูลพนักงานและกลุ่มสาระการเรียนรู้</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, รหัส, แผนก..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
            />
          </div>
          <button 
            onClick={handleAddEmployee}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={18} />
            เพิ่มพนักงาน
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-medium rounded-tl-2xl w-24">รหัส</th>
                <th className="p-4 font-medium">ชื่อ - นามสกุล</th>
                <th className="p-4 font-medium w-40">เบอร์โทรศัพท์</th>
                <th className="p-4 font-medium w-64">กลุ่มสาระ / แผนก</th>
                <th className="p-4 font-medium rounded-tr-2xl w-32 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                      <p>กำลังโหลดข้อมูล...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    ไม่พบข้อมูลพนักงาน
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-mono text-sm text-slate-600">{emp.id}</td>
                    <td className="p-4 font-medium text-slate-800">{emp.name}</td>
                    <td className="p-4 text-slate-600">{emp.phone}</td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md w-max text-sm">
                        <Building size={14} className="text-slate-400" />
                        {emp.dept}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditEmployee(emp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
