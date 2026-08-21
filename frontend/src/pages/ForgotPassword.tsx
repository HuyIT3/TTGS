import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, KeyRound, Lock, AlertCircle, CheckCircle,
  Eye, EyeOff, ArrowLeft, RefreshCw, Shield, ArrowRight
} from 'lucide-react';

type Step = 1 | 2;

const STEP_LABELS = ['Nhập Email', 'Đặt lại mật khẩu'];

export const ForgotPassword: React.FC = () => {
  const { apiUrl } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>(1);
  const [code, setCode] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mounted, setMounted] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gửi yêu cầu thất bại.');

      setSuccess(data.message || 'OTP đã được gửi thành công.');
      setStep(2);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải dài tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đặt lại mật khẩu thất bại.');

      setSuccess(data.message || 'Mật khẩu đã được đặt lại thành công.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) { setError('Vui lòng cung cấp email.'); return; }
    setError(null);
    setSuccess(null);
    setResendLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { label: 'Chưa nhập', color: 'bg-slate-700', text: 'text-slate-500', width: '0%' };
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: 'Yếu', color: 'bg-rose-500', text: 'text-rose-400', width: '25%' };
    if (score <= 2) return { label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-400', width: '60%' };
    if (score === 3) return { label: 'Khá mạnh', color: 'bg-indigo-500', text: 'text-indigo-400', width: '80%' };
    return { label: 'Mạnh', color: 'bg-emerald-500', text: 'text-emerald-400', width: '100%' };
  };

  const handleOtpChange = (index: number, value: string) => {
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
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtpValues(digits);
      setCode(pasteData);
      inputRefs.current[5]?.focus();
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[#080c14] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-600/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-600/[0.04] blur-3xl pointer-events-none" />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Card */}
        <div className="glass-panel rounded-3xl border border-white/[0.07] shadow-2xl shadow-black/40 overflow-hidden">

          {/* Step indicator */}
          <div className="px-8 pt-8 pb-6 border-b border-white/[0.05]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-5 group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              Quay lại đăng nhập
            </Link>

            {/* Steps */}
            <div className="flex items-center gap-3 mb-6">
              {STEP_LABELS.map((label, i) => {
                const stepNum = (i + 1) as Step;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isDone ? 'step-dot-done text-emerald-900' :
                        isActive ? 'step-dot-active text-white' :
                        'bg-white/[0.06] text-slate-500'
                      }`}>
                        {isDone ? <CheckCircle size={14} className="text-emerald-300" /> : stepNum}
                      </div>
                      <span className={`text-xs font-medium transition-colors hidden sm:block ${
                        isActive ? 'text-white' : isDone ? 'text-emerald-400/70' : 'text-slate-600'
                      }`}>
                        {label}
                      </span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`flex-1 h-px transition-all duration-500 ${isDone ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-white/[0.06]'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Icon + title */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                step === 1
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-indigo-500/10 border border-indigo-500/20'
              }`}>
                {step === 1
                  ? <KeyRound size={22} className="text-amber-400" />
                  : <Shield size={22} className="text-indigo-400" />
                }
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white mb-1">
                  {step === 1 ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {step === 1
                    ? 'Nhập email để nhận mã OTP khôi phục'
                    : `Mã OTP đã gửi tới ${email}`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="p-8">
            {/* Messages */}
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

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email đăng ký</label>
                  <div className="flex items-center input-premium rounded-xl px-4 py-3.5 gap-3 border border-white/[0.08] focus-within:border-amber-500/50 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.1)] transition-all">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer group"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi mã...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Gửi mã OTP
                      <ArrowRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                {/* OTP */}
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
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className={`otp-input w-11 h-13 text-center text-xl rounded-xl outline-none transition-all duration-200 ${digit ? 'filled' : ''}`}
                        style={{ height: '52px' }}
                      />
                    ))}
                  </div>
                  {/* OTP progress */}
                  <div className="flex gap-1">
                    {otpValues.map((digit, i) => (
                      <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${digit ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-white/[0.08]'}`} />
                    ))}
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mật khẩu mới</label>
                  <div className="flex items-center input-premium rounded-xl px-4 py-3.5 gap-3 border border-white/[0.08] focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all relative">
                    <Lock size={16} className="text-slate-500 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  {newPassword && (
                    <div className="px-1">
                      <div className="flex justify-between text-[10px] font-semibold mb-1.5">
                        <span className="text-slate-500 uppercase tracking-wider">Độ mạnh:</span>
                        <span className={strength.text}>{strength.label}</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} rounded-full transition-all duration-500`} style={{ width: strength.width }} />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white btn-gradient flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all cursor-pointer group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đặt lại...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Đặt lại mật khẩu
                      <ArrowRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                {/* Resend */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading || countdown > 0}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    {countdown > 0 ? (
                      <span className="text-slate-500">
                        Gửi lại mã sau <span className="text-indigo-400 font-bold">{countdown}s</span>
                      </span>
                    ) : (
                      <span className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5">
                        <RefreshCw size={12} className={resendLoading ? 'animate-spin' : ''} />
                        {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom trust */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-600">
          <Shield size={12} className="text-emerald-500/60" />
          Bảo mật SSL 256-bit · Dữ liệu được mã hóa
        </div>
      </div>
    </div>
  );
};
