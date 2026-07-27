import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import { Clock, ShieldHalf, Eye, EyeOff, Lock, User, LogOut, X, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

// ==================== Login Modal ====================
function LoginModal({ isOpen, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const usernameRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(''); setPassword(''); setError(''); setShowPass(false); setLoading(false);
      setTimeout(() => usernameRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600)); // small delay for UX feel

    if (username === 'admin' && password === 'admin444') {
      setLoading(false);
      onSuccess();
    } else {
      setLoading(false);
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 24 }}
            animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Decorative Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 pt-10 pb-12 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/20">
                  <ShieldCheck size={30} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">เข้าสู่ระบบ</h2>
                <p className="text-indigo-200 text-sm mt-1">ระบบจัดการสำหรับผู้ดูแล</p>
              </div>
            </div>

            {/* Form sits over the header */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 -mt-4">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 space-y-4 mb-5">
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                  <div className="relative flex items-center">
                    <User size={16} className="absolute left-3.5 text-slate-400" />
                    <input
                      ref={usernameRef}
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(''); }}
                      placeholder="กรอก Username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3.5 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="กรอก Password"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100"
                    >
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    เข้าสู่ระบบ
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                🔒 การเชื่อมต่อได้รับการเข้ารหัส
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== Main App ====================
function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('isAdminLoggedIn') === 'true');
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('isAdminLoggedIn') === 'true' ? 'admin' : 'user');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (isAdminLoggedIn) {
        timeoutId = setTimeout(() => {
          localStorage.removeItem('isAdminLoggedIn');
          setIsAdminLoggedIn(false);
          setCurrentPage('user');
          Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'info', title: 'ออกจากระบบอัตโนมัติเนื่องจากไม่มีการใช้งานเกิน 1 นาที' });
        }, 60000);
      }
    };
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => { clearTimeout(timeoutId); events.forEach(e => window.removeEventListener(e, resetTimer)); };
  }, [isAdminLoggedIn]);

  const handleAdminButtonClick = () => {
    if (currentPage === 'admin') {
      Swal.fire({
        title: 'ออกจากระบบ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#ef4444'
      }).then(r => {
        if (r.isConfirmed) {
          localStorage.removeItem('isAdminLoggedIn');
          setIsAdminLoggedIn(false);
          setCurrentPage('user');
        }
      });
    } else if (isAdminLoggedIn) {
      setCurrentPage('admin');
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('isAdminLoggedIn', 'true');
    setIsAdminLoggedIn(true);
    setCurrentPage('admin');
    setLoginModalOpen(false);
    Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'ยินดีต้อนรับ ผู้ดูแลระบบ' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-200 selection:text-indigo-900">
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold flex items-center gap-3 text-indigo-900">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Clock size={22} strokeWidth={2.5} />
            </div>
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              Sakolraj Smart Attendance
            </span>
            <span className="sm:hidden bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              Sakolraj
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage('user')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                currentPage === 'user'
                  ? 'bg-indigo-50 text-indigo-700 shadow-inner'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Clock size={18} /> <span className="hidden md:inline">ลงเวลา</span>
            </button>
            <button
              onClick={handleAdminButtonClick}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                currentPage === 'admin'
                  ? 'bg-rose-50 text-rose-600 shadow-inner hover:bg-rose-100'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {currentPage === 'admin' ? <LogOut size={18} /> : <ShieldHalf size={18} />}
              <span className="hidden md:inline">{currentPage === 'admin' ? 'ออกจากระบบ' : 'ผู้ดูแลระบบ'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 mt-6 mb-12">
        <AnimatePresence mode="wait">
          {currentPage === 'user' ? (
            <motion.div key="user" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <UserPage />
            </motion.div>
          ) : (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <AdminPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
