import React, { useState } from 'react';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import { Clock, ShieldHalf } from 'lucide-react';
import Swal from 'sweetalert2';

function App() {
  const [currentPage, setCurrentPage] = useState('user');

  const checkAdminLogin = () => {
    Swal.fire({
      html: `
        <div class="flex flex-col items-center pt-4">
          <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-half"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 22V2"/></svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">เข้าสู่ระบบ Admin</h2>
          <input type="text" id="login-username" class="swal2-input" placeholder="Username" />
          <input type="password" id="login-password" class="swal2-input" placeholder="Password" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'เข้าสู่ระบบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5',
      preConfirm: () => {
        return {
          u: document.getElementById('login-username').value,
          p: document.getElementById('login-password').value
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value.u === 'admin' && result.value.p === 'admin444') {
          setCurrentPage('admin');
          Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'ยินดีต้อนรับ ผู้ดูแลระบบ'
          });
        } else {
          Swal.fire('Error', 'ข้อมูลไม่ถูกต้อง', 'error');
        }
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      confirmButtonColor: '#ef4444'
    }).then((r) => {
      if (r.isConfirmed) setCurrentPage('user');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-200 selection:text-indigo-900">
      {/* Navbar - Glassmorphism style */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
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
              onClick={currentPage === 'admin' ? handleLogout : checkAdminLogin}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                currentPage === 'admin'
                  ? 'bg-rose-50 text-rose-600 shadow-inner hover:bg-rose-100'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <ShieldHalf size={18} />
              <span className="hidden md:inline">{currentPage === 'admin' ? 'ออกจากระบบ' : 'ผู้ดูแลระบบ'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 mt-6 mb-12">
        {currentPage === 'user' ? <UserPage /> : <AdminPage />}
      </main>
    </div>
  );
}

export default App;
