import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, LogIn, AlertCircle, Eye, EyeOff,
  GraduationCap, Star, Shield, Users, Sparkles, ArrowRight
} from 'lucide-react';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

const STATS = [
  { value: '100+', label: 'Gia sư chất lượng', icon: <GraduationCap size={18} /> },
  { value: '350+', label: 'Lớp học thành công', icon: <Star size={18} /> },
  { value: '98%', label: 'Học sinh tiến bộ', icon: <Shield size={18} /> },
  { value: '5k+', label: 'Người dùng tin tưởng', icon: <Users size={18} /> },
];

const TESTIMONIALS = [
  { name: 'Nguyễn Minh Khoa', role: 'Học sinh lớp 12', text: 'Nhờ hệ thống này tôi tìm được gia sư Toán rất giỏi, điểm tăng đáng kể!', avatar: 'N' },
  { name: 'Trần Thị Hoa', role: 'Phụ huynh', text: 'Giao diện dễ dùng, gia sư nhiệt tình. Rất hài lòng với dịch vụ.', avatar: 'T' },
];

export const Login: React.FC = () => {
  const { apiUrl, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [googleRoleModal, setGoogleRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSuccess = async (idToken: string, role?: 'STUDENT' | 'TEACHER') => {
    setError(null);
    setGoogleLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role: role || 'STUDENT' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng nhập Google thất bại.');
      login(data.user, data.token);
      if (data.user.role === 'ADMIN') navigate('/admin');
      else if (data.user.role === 'TEACHER') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
      setGoogleRoleModal(false);
      setPendingGoogleToken(null);
    }
  };

  const { signInWithGoogle, loading: gisLoading } = useGoogleLogin({
    onSuccess: (idToken) => {
      // Show role selector for first-time users; existing users will just log in
      setPendingGoogleToken(idToken);
      setGoogleRoleModal(true);
    },
    onError: (err) => setError(err),
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
          navigate('/verify-otp', { state: { email, type: 'VERIFY_EMAIL', message: 'Tài khoản của bạn chưa được xác minh.' } });
          return;
        }
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      login(data.user, data.token);

      if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }

      if (data.user.role === 'ADMIN') navigate('/admin');
      else if (data.user.role === 'TEACHER') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">

      {/* ===== LEFT PANEL — Visual ===== */}
      <div className="hidden lg:flex lg:w-[52%] auth-split-left flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated mesh orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-violet-600/08 blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-600/05 blur-3xl" />

        {/* Dot grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

        {/* Top: Logo */}
        <div className={`relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              🌻
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-none">Gia sư Hoa Hướng Dương</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Nền tảng kết nối học tập thông minh</p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-4">
            Nâng tầm<br />
            <span className="text-gradient-primary">tri thức</span> cùng<br />
            gia sư tốt nhất
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            Kết nối với hơn 100 gia sư chất lượng cao. Học mọi nơi, mọi lúc với lộ trình cá nhân hóa.
          </p>
        </div>

        {/* Stats grid */}
        <div className={`relative z-10 grid grid-cols-2 gap-3 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-4 hover-lift border border-white/[0.06]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-indigo-400">{stat.icon}</span>
                <span className="text-2xl font-extrabold text-gradient-primary">{stat.value}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className={`relative z-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="glass-card rounded-2xl p-5 border border-white/[0.06] overflow-hidden">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="#f59e0b" className="text-amber-400" />
              ))}
            </div>
            <div key={testimonialIdx} className="animate-fade-in">
              <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
                "{TESTIMONIALS[testimonialIdx].text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
                  {TESTIMONIALS[testimonialIdx].avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{TESTIMONIALS[testimonialIdx].name}</p>
                  <p className="text-[10px] text-slate-500">{TESTIMONIALS[testimonialIdx].role}</p>
                </div>
              </div>
            </div>
            {/* Dots indicator */}
            <div className="flex gap-1 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${i === testimonialIdx ? 'w-6 bg-indigo-400' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Form ===== */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#080c14] relative overflow-hidden">
        {/* Background subtle glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/[0.04] blur-3xl pointer-events-none" />

        <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-5">
              <Sparkles size={12} />
              Chào mừng trở lại
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Đăng nhập</h2>
            <p className="text-slate-400 text-sm">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-shake">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span className="text-rose-300 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <div className="flex items-center input-premium rounded-xl px-4 py-3.5 gap-3 border border-white/[0.08] focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all">
                <Mail size={16} className="text-slate-500 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-slate-600 text-white focus:ring-0"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
              <div className="flex items-center input-premium rounded-xl px-4 py-3.5 gap-3 border border-white/[0.08] focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all relative">
                <Lock size={16} className="text-slate-500 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-slate-600 text-white focus:ring-0 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer group">
                <div className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center cursor-pointer ${rememberMe ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 hover:border-white/40'}`}
                  onClick={() => setRememberMe(!rememberMe)}>
                  {rememberMe && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-xs">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white btn-gradient flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all cursor-pointer group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Đăng nhập</span>
                  <ArrowRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hoặc đăng nhập bằng</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Social Login */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={gisLoading || googleLoading}
              className="flex-1 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-300 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {gisLoading || googleLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99C6.2 7.54 8.87 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.74-2.38 3.58l3.69 2.87c2.16-1.99 3.74-4.92 3.74-8.55z" />
                  <path fill="#FBBC05" d="M5.24 14.73c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 7.12C.5 8.91 0 10.9 0 13s.5 4.09 1.39 5.88l3.85-3.15z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.03.69-2.35 1.1-4.27 1.1-3.13 0-5.8-2.5-6.76-5.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z" />
                </svg>
              )}
              {gisLoading || googleLoading ? 'Đang xử lý...' : 'Google'}
            </button>
            <button
              type="button"
              onClick={() => alert('Chức năng đăng nhập bằng Facebook đang được triển khai.')}
              className="flex-1 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-300 transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <Shield size={12} className="text-emerald-500/60" />
            Bảo mật SSL 256-bit · Dữ liệu được mã hóa
          </div>
        </div>
      </div>

      {/* Google Role Selector Modal */}
      {googleRoleModal && pendingGoogleToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel rounded-3xl border border-white/[0.1] shadow-2xl shadow-black/60 p-8 w-full max-w-sm mx-4 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-amber-500/20">
                🌻
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1">Chọn vai trò</h3>
              <p className="text-slate-400 text-sm">Bạn muốn tham gia với tư cách gì?</p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {(['STUDENT', 'TEACHER'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedGoogleRole(role)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    selectedGoogleRole === role
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border-2 transition-all ${selectedGoogleRole === role ? 'border-indigo-400 bg-indigo-400' : 'border-slate-600'}`} />
                    <span className={`text-sm font-bold ${selectedGoogleRole === role ? 'text-indigo-300' : 'text-slate-300'}`}>
                      {role === 'STUDENT' ? '📚 Học sinh / Phụ huynh' : '🎓 Gia sư / Giáo viên'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ml-5 ${selectedGoogleRole === role ? 'text-indigo-400/70' : 'text-slate-500'}`}>
                    {role === 'STUDENT' ? 'Tìm gia sư phù hợp' : 'Nhận lớp và giảng dạy'}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setGoogleRoleModal(false); setPendingGoogleToken(null); }}
                className="flex-1 py-3 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white text-sm font-semibold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleGoogleSuccess(pendingGoogleToken!, selectedGoogleRole)}
                disabled={googleLoading}
                className="flex-1 py-3 rounded-xl btn-gradient text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {googleLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                ) : (
                  'Xác nhận'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
