import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../firebase';
import { UserShieldIcon } from './IconComponents';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isBypass = localStorage.getItem('admin_bypass') === 'true';
      if (session || isBypass) {
        navigate('/admin/dashboard', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        // Success
        navigate('/admin/dashboard');

    } catch (error: any) {
        console.error("Login error:", error);
        
        // Special Fallback: If network error (Failed to fetch) AND using demo credentials, allow bypass
        if ((error.message === 'Failed to fetch' || error.message.includes('fetch')) && 
            email === 'admin@copd.com' && 
            password === 'copdadmin') {
            
            localStorage.setItem('admin_bypass', 'true');
            
            await Swal.fire({
                icon: 'warning',
                title: 'เข้าสู่ระบบแบบออฟไลน์',
                text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ระบบจะเข้าสู่โหมดสาธิต (Demo Mode) เพื่อให้ท่านทดสอบการใช้งาน',
                timer: 3000,
                showConfirmButton: false
            });
            
            navigate('/admin/dashboard');
            return;
        }

        let errorMsg = error.message;
        if (error.message === 'Invalid login credentials') errorMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        if (error.message === 'Failed to fetch') errorMsg = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต';

        Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: errorMsg,
            confirmButtonText: 'ตกลง'
        });
    } finally {
        setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
        Swal.fire('กรุณาระบุอีเมล', 'กรุณากรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน', 'warning');
        return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin/update-password',
    });
    setLoading(false);
    
    if (error) {
        Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
    } else {
        Swal.fire('ส่งอีเมลแล้ว', 'กรุณาตรวจสอบกล่องจดหมายของคุณเพื่อตั้งรหัสผ่านใหม่', 'success');
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md animate-fade-in">
        <div className="text-center mb-8">
          <UserShieldIcon className="text-5xl text-cyan-500 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-800 mt-4">เข้าสู่ระบบผู้ดูแลระบบ</h1>
          <p className="text-slate-500">Admin Login</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                อีเมล (Email Address)
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-700">
                รหัสผ่าน (Password)
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-400"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Sign In)'}
              </button>
            </div>
            <div className="text-center">
                <button 
                    type="button"
                    onClick={handleResetPassword}
                    className="text-sm text-slate-500 hover:text-cyan-600 transition-colors"
                >
                    ลืมรหัสผ่าน? (รีเซ็ตผ่านอีเมล)
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
