import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

export const OtpVerify: React.FC = () => {
  const { apiUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [type, setType] = useState('VERIFY_EMAIL');
  const [code, setCode] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mounted, setMounted] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
    if (location.state) {
      const state = location.state as any;
      if (state.email) setEmail(state.email);
      if (state.type) setType(state.type);
      if (state.message) setMessage(state.message);
    }
    setCountdown(60);
  }, [location]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = '';
      setOtpValues(newOtpValues);
      setCode(newOtpValues.join(''));
      return;
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = cleanValue.substring(cleanValue.length - 1);
    setOtpValues(newOtpValues);
    setCode(newOtpValues.join(''));

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        setCode(newOtpValues.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
        setCode(newOtpValues.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtpValues(digits);
      setCode(pasteData);
      inputRefs.current[5]?.focus();
    }
  };

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
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError('Vui lòng cung cấp email để gửi lại mã.'); return; }
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
      if (!response.ok) throw new Error(data.message || 'Gửi lại OTP thất bại.');

      setSuccess(data.message || 'Mã OTP mới đã được gửi vào email.');
      setCountdown(60);
      setOtpValues(Array(6).fill(''));
      setCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  // Countdown circle
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (countdown / 60) * circumference;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[#080c14] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-violet-600/[0.04] blur-3xl pointer-events-none" />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-8 border border-white/[0.07] shadow-2xl shadow-black/40">

          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6 group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại đăng nhập
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-16 h-16 mb-5">
              {/* Circular countdown ring */}
              {countdown > 0 && (
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="url(#countdown-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                  <defs>
                    <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
              <div className={`absolute inset-1.5 rounded-full flex items-center justify-center ${
                success ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-indigo-500/10 border border-indigo-500/20'
              }`}>
                {success
                  ? <CheckCircle size={24} className="text-emerald-400" />
                  : <ShieldCheck size={24} className="text-indigo-400" />
                }
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-1.5">Xác thực OTP</h2>
            <p className="text-slate-400 text-sm">
              Nhập mã 6 chữ số được gửi tới<br />
              <span className="text-indigo-300 font-semibold">{email || 'email của bạn'}</span>
            </p>
          </div>

          {/* Messages */}
          {message && !error && !success && (
            <div className="mb-5 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
              <Mail size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-indigo-300 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-shake">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <span className="text-rose-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 animate-scale-in">
              <CheckCircle size={15} className="text-emerald-400 shrink-0" />
              <span className="text-emerald-300 text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <div className="flex items-center input-premium rounded-xl px-4 py-3 gap-3 border border-white/[0.08] focus-within:border-indigo-500/50 transition-all">
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
            </div>

            {/* OTP Boxes */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Mã OTP (6 chữ số)</label>
              <div className="flex justify-between gap-2">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`otp-input w-12 h-14 text-center text-xl rounded-2xl outline-none transition-all duration-200 ${
                      digit ? 'filled animate-bounce-in' : ''
                    }`}
                  />
                ))}
              </div>
              {/* Progress indicator */}
              <div className="flex gap-1 justify-center">
                {otpValues.map((digit, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                      digit ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-white/[0.08]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white btn-gradient flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Xác nhận OTP
                </>
              )}
            </button>
          </form>

          {/* Footer actions */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
              className="flex items-center gap-1.5 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40"
            >
              {countdown > 0 ? (
                <span className="text-slate-500 text-xs">
                  Gửi lại sau{' '}
                  <span className="font-bold text-indigo-400">{countdown}s</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300">
                  <RefreshCw size={13} className={resendLoading ? 'animate-spin' : ''} />
                  {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
