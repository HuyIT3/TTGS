import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, BookOpen, Ruler, PenTool, Compass, GraduationCap } from 'lucide-react';

export const Login: React.FC = () => {
  const { apiUrl, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'TÀI_KHOẢN_CHƯA_XÁC_MINH') {
          // Điều hướng sang trang xác nhận OTP
          navigate('/verify-otp', { state: { email, type: 'VERIFY_EMAIL', message: 'Tài khoản của bạn chưa được xác minh. Vui lòng xác thực mã OTP.' } });
          return;
        }
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      login(data.user, data.token);

      // Điều hướng tương ứng với vai trò
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (data.user.role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-73px)] flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 bg-notebook-grid text-slate-850">
      {/* Educational Floating Icons */}
      <BookOpen className="absolute text-sky-400/20 w-16 h-16 top-12 left-10 sm:left-24 animate-float-slow -z-10" />
      <Ruler className="absolute text-indigo-400/20 w-14 h-14 bottom-16 left-6 sm:left-32 animate-float-slower -z-10" />
      <PenTool className="absolute text-sky-500/20 w-12 h-12 top-20 right-8 sm:right-32 animate-float-fast -z-10" />
      <Compass className="absolute text-amber-500/15 w-16 h-16 bottom-24 right-10 sm:right-24 animate-float-slow -z-10" />
      <GraduationCap className="absolute text-indigo-500/10 w-24 h-24 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow -z-20" />

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-slate-200/80 p-8 rounded-3xl shadow-2xl shadow-sky-950/5 flex flex-col gap-6 relative z-10 animate-fade-in-up">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-gradient-primary">Chào mừng trở lại</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Đăng nhập hệ thống Gia sư Huy Hoàng</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border border-slate-200 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
              <Mail size={16} className="text-slate-400 mr-2.5" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm placeholder-slate-400 text-slate-800 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mật khẩu</label>
              <Link to="/forgot-password" className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border border-slate-200 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
              <Lock size={16} className="text-slate-400 mr-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm placeholder-slate-400 text-slate-800 focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-95"
          >
            {loading ? 'Đang xác thực...' : (
              <>
                <LogIn size={16} />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4 mt-2">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};


