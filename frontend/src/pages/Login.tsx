import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, BookOpen, Ruler, PenTool, Compass, GraduationCap, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { apiUrl, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (email === 'tutor1@huyhoang.com' && password === '123456') {
        const mockUser = {
          id: 'mock-tutor-id',
          email: 'tutor1@huyhoang.com',
          fullName: 'Nguyễn Văn Hùng',
          phone: '0912345678',
          role: 'TEACHER',
          tutorProfile: {
            id: 'mock-tutor-profile-id',
            subjects: ['Toán học', 'Vật lý'],
            bio: 'Cựu sinh viên Đại học Bách Khoa Hà Nội...',
            experience: '5 năm kinh nghiệm gia sư cấp 3',
            hourlyRate: 200000,
            status: 'APPROVED',
          }
        };
        login(mockUser as any, 'mock-token');
        navigate('/teacher');
        return;
      }
      if (email === 'student1@huyhoang.com' && password === '123456') {
        const mockUser = {
          id: 'mock-student-id',
          email: 'student1@huyhoang.com',
          fullName: 'Tuệ Vương',
          phone: '0945678901',
          role: 'STUDENT',
          studentProfile: {
            id: 'mock-student-profile-id',
            grade: 'Lớp 12',
            school: 'THPT Chu Văn An',
            address: 'Số 10 Tây Hồ, Hà Nội',
          }
        };
        login(mockUser as any, 'mock-token');
        navigate('/student');
        return;
      }

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

      // Lưu trạng thái remember me nếu cần
      if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }

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
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Đăng nhập hệ thống Gia sư Hoa Hướng Dương</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold animate-shake">
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mật khẩu</label>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border border-slate-200 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 relative">
              <Lock size={16} className="text-slate-400 mr-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm placeholder-slate-400 text-slate-800 focus:ring-0 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password row */}
          <div className="flex items-center justify-between text-xs select-none">
            <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="font-semibold text-sky-650 hover:text-sky-700 transition-colors">
              Quên mật khẩu?
            </Link>
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

        {/* Social Login Separator */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hoặc đăng nhập bằng</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => alert("Chức năng đăng nhập bằng Google đang được triển khai.")}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99C6.2 7.54 8.87 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.74-2.38 3.58l3.69 2.87c2.16-1.99 3.74-4.92 3.74-8.55z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.73c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 7.12C.5 8.91 0 10.9 0 13s.5 4.09 1.39 5.88l3.85-3.15z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.03.69-2.35 1.1-4.27 1.1-3.13 0-5.8-2.5-6.76-5.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z"
              />
            </svg>
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => alert("Chức năng đăng nhập bằng Facebook đang được triển khai.")}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

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


