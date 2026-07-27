import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Pencil, Trash2, Search, Building, X, Save, Phone, Hash, User, ChevronDown, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { apiCall } from '../api';

// ==================== Employee Form Modal ====================
function EmployeeFormModal({ isOpen, onClose, onSubmit, initialData, departments, nextId }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({ id: '', name: '', phone: '', dept: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(isEdit
        ? { id: initialData.id, name: initialData.name, phone: initialData.phone, dept: initialData.dept }
        : { id: nextId, name: '', phone: '', dept: '' }
      );
      setErrors({});
    }
  }, [isOpen, isEdit, initialData, nextId]);

  const validate = () => {
    const errs = {};
    if (!form.id.trim()) errs.id = 'กรุณากรอกรหัสพนักงาน';
    if (!form.name.trim()) errs.name = 'กรุณากรอกชื่อ - นามสกุล';
    if (!form.phone.trim()) {
      errs.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^0\d{9}$/.test(form.phone.replace(/\D/g, ''))) {
      errs.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0';
    }
    if (!form.dept) errs.dept = 'กรุณาเลือกกลุ่มสาระ';
    return errs;
  };

  const handleChange = (field, value) => {
    if (field === 'phone') value = value.replace(/\D/g, '').slice(0, 10);
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  const fields = [
    {
      id: 'id', label: 'รหัสพนักงาน', icon: Hash, type: 'text',
      placeholder: 'เช่น 001', disabled: isEdit,
      hint: isEdit ? 'ไม่สามารถแก้ไขรหัสได้' : null,
    },
    {
      id: 'name', label: 'ชื่อ - นามสกุล', icon: User, type: 'text',
      placeholder: 'เช่น นายสมชาย ใจดี',
    },
    {
      id: 'phone', label: 'เบอร์โทรศัพท์', icon: Phone, type: 'tel',
      placeholder: '0812345678', maxLength: 10,
      hint: '10 หลัก ขึ้นต้นด้วย 0',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className={`px-8 pt-8 pb-6 ${isEdit ? 'bg-gradient-to-br from-violet-50 to-purple-50' : 'bg-gradient-to-br from-indigo-50 to-blue-50'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl shadow-sm ${isEdit ? 'bg-violet-100 text-violet-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {isEdit ? <Pencil size={22} /> : <Plus size={22} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {isEdit ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {isEdit ? `รหัส: ${initialData?.id}` : 'กรอกข้อมูลให้ครบถ้วน'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              {fields.map(({ id, label, icon: Icon, type, placeholder, disabled, hint, maxLength }) => (
                <div key={id}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                  <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                    errors[id]
                      ? 'border-rose-300 bg-rose-50/50'
                      : disabled
                      ? 'border-slate-100 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-indigo-200 focus-within:border-indigo-400 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
                  }`}>
                    <div className={`pl-4 ${disabled ? 'text-slate-300' : errors[id] ? 'text-rose-400' : 'text-slate-400'}`}>
                      <Icon size={18} />
                    </div>
                    <input
                      type={type}
                      value={form[id]}
                      onChange={e => handleChange(id, e.target.value)}
                      placeholder={placeholder}
                      disabled={disabled}
                      maxLength={maxLength}
                      inputMode={type === 'tel' ? 'numeric' : undefined}
                      className="w-full py-3 px-3 bg-transparent outline-none text-slate-800 placeholder-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium"
                    />
                    {hint && !errors[id] && (
                      <span className="pr-4 text-xs text-slate-400 whitespace-nowrap">{hint}</span>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors[id] && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1"
                      >
                        <AlertCircle size={12} /> {errors[id]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">กลุ่มสาระ / แผนก</label>
                <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                  errors.dept
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-white hover:border-indigo-200 focus-within:border-indigo-400 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
                }`}>
                  <div className={`pl-4 ${errors.dept ? 'text-rose-400' : 'text-slate-400'}`}>
                    <Building size={18} />
                  </div>
                  <select
                    value={form.dept}
                    onChange={e => handleChange('dept', e.target.value)}
                    className="w-full py-3 px-3 bg-transparent outline-none text-slate-800 text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="">-- เลือกกลุ่มสาระ --</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="pr-4 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                  </div>
                </div>
                <AnimatePresence>
                  {errors.dept && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1"
                    >
                      <AlertCircle size={12} /> {errors.dept}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-all text-sm ${
                    isEdit
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-200 hover:-translate-y-0.5'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200 hover:-translate-y-0.5'
                  } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'กำลังบันทึก...' : isEdit ? 'อัปเดตข้อมูล' : 'บันทึกพนักงาน'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== Main Component ====================
export default function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await apiCall('apiGetEmployees');
      setEmployees(data || []);
    } catch (err) {
      Swal.fire('Error', 'ไม่สามารถดึงข้อมูลพนักงานได้', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadEmployees(); }, []);

  const departments = [...new Set(employees.map(e => e.dept).filter(Boolean))].sort();

  const getNextId = () => {
    if (employees.length === 0) return '001';
    const maxId = employees.reduce((max, e) => {
      const num = parseInt(String(e.id).replace(/\D/g, ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return String(maxId + 1).padStart(3, '0');
  };

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (emp) => { setEditTarget(emp); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSubmit = async (form) => {
    const action = editTarget ? 'apiUpdateEmployee' : 'apiAddEmployee';
    try {
      const res = await apiCall(action, form);
      if (res.success) {
        closeModal();
        Swal.fire({ icon: 'success', title: editTarget ? 'อัปเดตสำเร็จ' : 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
        loadEmployees();
      } else {
        Swal.fire('แจ้งเตือน', res.message, 'warning');
      }
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      html: `<p class="text-slate-600">คุณต้องการลบข้อมูลของ <span class="font-bold text-slate-800">${name}</span> ใช่หรือไม่?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ลบออก',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const res = await apiCall('apiDeleteEmployee', { id });
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
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
    <>
      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
        departments={departments}
        nextId={getNextId()}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-600" />
              จัดการรายชื่อพนักงาน
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              พนักงานทั้งหมด <span className="font-semibold text-indigo-600">{employees.length}</span> คน
              &nbsp;·&nbsp;
              <span className="font-semibold text-purple-600">{departments.length}</span> กลุ่มสาระ
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, แผนก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-sm"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 font-semibold text-sm hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={18} />
              เพิ่มพนักงาน
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-50/60 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 w-24">รหัส</th>
                  <th className="p-4">ชื่อ - นามสกุล</th>
                  <th className="p-4 w-44">เบอร์โทรศัพท์</th>
                  <th className="p-4">กลุ่มสาระ / แผนก</th>
                  <th className="p-4 w-32 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        <p className="text-sm">กำลังโหลดข้อมูล...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={36} className="opacity-30" />
                        <p className="text-sm">{searchTerm ? 'ไม่พบผลการค้นหา' : 'ยังไม่มีข้อมูลพนักงาน'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, i) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="p-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{emp.id}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{emp.name}</td>
                      <td className="p-4 text-slate-600 font-mono text-sm">{emp.phone}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg w-max text-sm font-medium">
                          <Building size={13} />
                          {emp.dept}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(emp)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="แก้ไข"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id, emp.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="ลบ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </>
  );
}
