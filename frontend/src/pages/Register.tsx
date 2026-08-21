import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Lock, Phone, UserPlus, AlertCircle,
  Eye, EyeOff, GraduationCap, BookOpen, Star, Shield,
  CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';

const FEATURES = [
  { icon: <GraduationCap size={16} />, title: 'Gia sư chất lượng', desc: 'Đội ngũ gia sư được kiểm duyệt kỹ lưỡng' },
  { icon: <BookOpen size={16} />, title: 'Học liệu phong phú', desc: 'Tài liệu, bài kiểm tra, quiz từ vựng' },
  { icon: <Star size={16} />, title: 'Đánh giá minh bạch', desc: 'Phản hồi thực từ học sinh và phụ huynh' },
  { icon: <Shield size={16} />, title: 'Bảo mật tuyệt đối', desc: 'Dữ liệu cá nhân được mã hóa an toàn' },
];

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
  const [mounted, setMounted] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = !phone || /^0\d{9}$/.test(phone);
  const isPasswordMatch = !confirmPassword || password === confirmPassword;

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'Chưa nhập', color: 'bg-slate-700', text: 'text-slate-500', width: '0%' };
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: 'Yếu', color: 'bg-rose-500', text: 'text-rose-400', width: '25%' };
    if (score <= 2) return { score, label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-400', width: '60%' };
    if (score === 3) return { score, label: 'Khá mạnh', color: 'bg-indigo-500', text: 'text-indigo-400', width: '80%' };
    return { score, label: 'Mạnh', color: 'bg-emerald-500', text: 'text-emerald-400', width: '100%' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email không đúng định dạng.'); return; }
    if (!/^0\d{9}$/.test(phone)) { setError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.'); return; }
    if (password.length < 6) { setError('Mật khẩu phải dài tối thiểu 6 ký tự.'); return; }
    if (password !== confirmPassword) { setError('Xác nhận mật khẩu không trùng khớp.'); return; }

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
        navigate('/verify-otp', { state: { email, type: 'VERIFY_EMAIL', message: data.message } });
        return;
      }

      login(data.user, data.token);
      if (data.user.role === 'TEACHER') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">

      {/* ===== LEFT PANEL — Visual ===== */}
      <div className="hidden lg:flex lg:w-[48%] auth-split-left flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full bg-indigo-600/08 blur-3xl animate-pulse-subtle" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

        {/* Top */}
        <div className={`relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              🌻
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-none">Gia sư Hoa Hướng Dương</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Nền tảng học tập thông minh</p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-4">
            Bắt đầu hành trình<br />
            <span className="text-gradient-primary">học tập</span> của bạn
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Tham gia cộng đồng hơn 5,000 học sinh và gia sư đang học tập mỗi ngày.
          </p>
        </div>

        {/* Features */}
        <div className={`relative z-10 flex flex-col gap-3 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 glass-card rounded-2xl border border-white/[0.05] hover-lift"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                {feat.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{feat.title}</p>
                <p className="text-xs text-slate-400">{feat.desc}</p>
              </div>
              <CheckCircle2 size={16} className="text-emerald-400/60 ml-auto shrink-0 mt-0.5" />
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className={`relative z-10 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <div className="flex -space-x-2">
              {['N', 'T', 'H', 'M'].map((char, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 border-2 border-[#0d1220] flex items-center justify-center text-white text-[10px] font-bold">
                  {char}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-white">+5,000 thành viên</p>
              <p className="text-[10px] text-slate-500">đã đăng ký thành công</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} fill="#f59e0b" className="text-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Form ===== */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[#080c14] relative overflow-hidden overflow-y-auto">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-500/[0.04] blur-3xl pointer-events-none" />

        <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Header */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4">
              <Sparkles size={12} />
              Miễn phí hoàn toàn
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Tạo tài khoản</h2>
            <p className="text-slate-400 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Đăng nhập
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

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            {(['STUDENT', 'TEACHER'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  role === r
                    ? 'border-indigo-500/40 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full border-2 transition-all ${role === r ? 'border-indigo-400 bg-indigo-400' : 'border-slate-600'}`} />
                  <span className={`text-xs font-bold transition-colors ${role === r ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {r === 'STUDENT' ? 'Học sinh / Phụ huynh' : 'Gia sư / Giáo viên'}
                  </span>
                </div>
                <p className={`text-[10px] transition-colors ml-5 ${role === r ? 'text-indigo-400/70' : 'text-slate-600'}`}>
                  {r === 'STUDENT' ? 'Tìm gia sư phù hợp' : 'Nhận lớp & giảng dạy'}
                </p>
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Họ và tên</label>
              <div className="flex items-center input-premium rounded-xl px-4 py-3 gap-3 border border-white/[0.08] focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all">
                <User size={15} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-slate-600 text-white focus:ring-0"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <div className={`flex items-center input-premium rounded-xl px-4 py-3 gap-3 border focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all ${
                !isEmailValid ? 'border-rose-500/40 focus-within:border-rose-500/50' : 'border-white/[0.08] focus-within:border-indigo-500/50'
              }`}>
                <Mail size={15} className="text-slate-500 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-slate-600 text-white focus:ring-0"
                />
              </div>
              {!isEmailValid && <p className="text-[11px] text-rose-400 ml-1">Email không đúng định dạng.</p>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
              <div className={`flex items-center input-premium rounded-xl px-4 py-3 gap-3 border focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all ${
                !isPhoneValid ? 'border-rose-500/40 focus-within:border-rose-500/50' : 'border-white/[0.08] focus-within:border-indigo-500/50'
              }`}>
                <Phone size={15} className="text-slate-500 shrink-0" />
                <input
                  type="tel"
                  required
                  placeholder="09xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-slate-600 text-white focus:ring-0"
                />
              </div>
              {!isPhoneValid && <p className="text-[11px] text-rose-400 ml-1">Số điện thoại gồm 10 số và bắt đầu bằng 0.</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
              <div className="flex items-center input-premium rounded-xl px-4 py-3 gap-3 border border-white/[0.08] focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all relative">
                <Lock size={15} className="text-slate-500 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-slate-600 text-white focus:ring-0 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password && (
                <div className="flex flex-col gap-1.5 px-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-500 uppercase tracking-wider">Độ mạnh:</span>
                    <span className={strength.text}>{strength.label}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} rounded-full transition-all duration-500 progress-bar-gradient`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Xác nhận mật khẩu</label>
              <div className={`flex items-center input-premium rounded-xl px-4 py-3 gap-3 border focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all relative ${
                !isPasswordMatch ? 'border-rose-500/40 focus-within:border-rose-500/50' : 'border-white/[0.08] focus-within:border-indigo-500/50'
              }`}>
                <Lock size={15} className="text-slate-500 shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-slate-600 text-white focus:ring-0 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {!isPasswordMatch && <p className="text-[11px] text-rose-400 ml-1">Mật khẩu xác nhận không khớp.</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded-md border mt-0.5 transition-all flex items-center justify-center shrink-0 cursor-pointer ${agreeTerms ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 hover:border-white/40'}`}
                onClick={() => setAgreeTerms(!agreeTerms)}
              >
                {agreeTerms && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-slate-400 leading-relaxed">
                Tôi đồng ý với{' '}
                <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Điều khoản sử dụng</span>
                {' '}và{' '}
                <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Chính sách bảo mật</span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isEmailValid || !isPhoneValid || !isPasswordMatch}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white btn-gradient flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all cursor-pointer group mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Đăng ký tài khoản</span>
                  <ArrowRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Trust badge */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <Shield size={12} className="text-emerald-500/60" />
            Bảo mật SSL 256-bit · Dữ liệu được mã hóa
          </div>
        </div>
      </div>
    </div>
  );
};
