import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, BookOpen, Ruler, PenTool, Compass, GraduationCap, ShieldCheck } from 'lucide-react';

export const OtpVerify: React.FC = () => {
  const { apiUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [type, setType] = useState('VERIFY_EMAIL');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    // Lấy thông tin từ state khi navigate từ trang register/login sang
    if (location.state) {
      const state = location.state as any;
      if (state.email) setEmail(state.email);
      if (state.type) setType(state.type);
      if (state.message) setMessage(state.message);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Xác thực OTP thất bại.');
      }

      setSuccess(data.message || 'Xác thực thành công!');
      
      // Chờ 2 giây rồi chuyển về trang đăng nhập
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Vui lòng cung cấp email để gửi lại mã.');
      return;
    }

    setError(null);
    setSuccess(null);
    setResendLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gửi lại OTP thất bại.');
      }

      setSuccess(data.message || 'Mã OTP mới đã được gửi vào email của bạn.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
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
          <div className="mx-auto bg-sky-50 text-sky-500 w-12 h-12 rounded-full flex items-center justify-center border border-sky-100 shadow-sm animate-bounce">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-gradient-primary">Xác thực mã OTP</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Nhập mã xác minh được gửi tới email của bạn</p>
        </div>

        {message && !error && !success && (
          <div className="p-3.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-xl font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold animate-shake">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Địa chỉ Email</label>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border border-slate-200 bg-slate-50/50 shadow-sm">
              <Mail size={16} className="text-slate-400 mr-2.5" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm text-slate-700 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã OTP (6 chữ số)</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-xl sm:text-2xl font-bold tracking-[8px] input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border border-slate-200 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-95"
          >
            {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-4 mt-2">
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sky-600 hover:text-sky-700 font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {resendLoading ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
          </button>
          
          <Link to="/login" className="text-slate-500 hover:text-slate-700 font-semibold transition-colors">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
