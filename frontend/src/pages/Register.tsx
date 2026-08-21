import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle, BookOpen, Ruler, PenTool, Compass, GraduationCap, Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
  const { apiUrl, login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time validation check
  const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = !phone || /^0\d{9}$/.test(phone);
  const isPasswordMatch = !confirmPassword || password === confirmPassword;

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'Chưa nhập', color: 'bg-slate-200', text: 'text-slate-400' };
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: 'Yếu', color: 'bg-rose-500', text: 'text-rose-500 animate-pulse' };
    if (score <= 3) return { score, label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-505' };
    return { score, label: 'Mạnh', color: 'bg-emerald-500', text: 'text-emerald-500 font-bold' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không đúng định dạng.');
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      setError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải dài tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      if (data.requiresVerification) {
        // Chuyển sang trang nhập OTP xác thực email
        navigate('/verify-otp', { state: { email, type: 'VERIFY_EMAIL', message: data.message } });
        return;
      }

      login(data.user, data.token);

      if (data.user.role === 'TEACHER') {
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

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-slate-200/80 p-8 rounded-3xl shadow-2xl shadow-sky-950/5 flex flex-col gap-5 relative z-10 animate-fade-in-up">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-gradient-primary">Đăng ký Tài khoản</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Trở thành thành viên của Gia sư Hoa Hướng Dương</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold animate-shake">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all duration-300 flex flex-col items-center gap-1 cursor-pointer active:scale-95 ${
              role === 'STUDENT'
                ? 'bg-sky-50/80 border-sky-500/50 text-sky-700 shadow-sm shadow-sky-500/5'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className="text-xs">Học sinh / Phụ huynh</span>
            <span className="text-[9px] font-medium text-slate-400">Cần tìm gia sư dạy</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('TEACHER')}
            className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all duration-300 flex flex-col items-center gap-1 cursor-pointer active:scale-95 ${
              role === 'TEACHER'
                ? 'bg-sky-50/80 border-sky-500/50 text-sky-700 shadow-sm shadow-sky-500/5'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className="text-xs">Gia sư / Giáo viên</span>
            <span className="text-[9px] font-medium text-slate-400">Tìm lớp nhận dạy</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ và tên</label>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border border-slate-200 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
              <User size={16} className="text-slate-400 mr-2.5" />
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm placeholder-slate-400 text-slate-800 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
            <div className={`flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border shadow-sm focus-within:ring-2 ${
              !isEmailValid 
                ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-105' 
                : 'border-slate-200 focus-within:border-sky-500 focus-within:ring-sky-100'
            }`}>
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
            {!isEmailValid && (
              <span className="text-[10px] text-rose-500 font-semibold ml-1">Email không đúng định dạng.</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</label>
            <div className={`flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border shadow-sm focus-within:ring-2 ${
              !isPhoneValid 
                ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-105' 
                : 'border-slate-200 focus-within:border-sky-500 focus-within:ring-sky-100'
            }`}>
              <Phone size={16} className="text-slate-400 mr-2.5" />
              <input
                type="tel"
                required
                placeholder="09xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm placeholder-slate-400 text-slate-800 focus:ring-0"
              />
            </div>
            {!isPhoneValid && (
              <span className="text-[10px] text-rose-500 font-semibold ml-1">Số điện thoại gồm 10 số và bắt đầu bằng số 0.</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mật khẩu</label>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border border-slate-200 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 relative">
              <Lock size={16} className="text-slate-400 mr-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Tối thiểu 6 ký tự"
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
            {password && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Độ mạnh mật khẩu:</span>
                  <span className={getPasswordStrength(password).text}>{getPasswordStrength(password).label}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrength(password).color} transition-all duration-300`} 
                    style={{ width: `${(getPasswordStrength(password).score / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xác nhận mật khẩu</label>
            <div className={`flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border shadow-sm focus-within:ring-2 relative ${
              !isPasswordMatch 
                ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-105' 
                : 'border-slate-200 focus-within:border-sky-500 focus-within:ring-sky-100'
            }`}>
              <Lock size={16} className="text-slate-400 mr-2.5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm placeholder-slate-400 text-slate-800 focus:ring-0 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isPasswordMatch && (
              <span className="text-[10px] text-rose-500 font-semibold ml-1">Mật khẩu xác nhận không khớp.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isEmailValid || !isPhoneValid || !isPasswordMatch}
            className="w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-95"
          >
            {loading ? 'Đang khởi tạo...' : (
              <>
                <UserPlus size={16} />
                <span>Đăng ký tài khoản</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4 mt-2">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};


