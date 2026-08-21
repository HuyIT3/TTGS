import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, KeyRound, Lock, AlertCircle, CheckCircle, BookOpen, Ruler, PenTool, Compass, GraduationCap, Eye, EyeOff } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { apiUrl } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

      if (!response.ok) {
        throw new Error(data.message || 'Gửi yêu cầu thất bại.');
      }

      setSuccess(data.message || 'OTP đã được gửi thành công.');
      setStep(2); // Chuyển sang bước nhập OTP và reset mật khẩu
      setCountdown(60); // Kích hoạt 60s countdown
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

      if (!response.ok) {
        throw new Error(data.message || 'Đặt lại mật khẩu thất bại.');
      }

      setSuccess(data.message || 'Mật khẩu đã được đặt lại thành công.');
      
      // Chờ 2 giây rồi đưa về trang Login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Vui lòng cung cấp email.');
      return;
    }
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

      if (!response.ok) {
        throw new Error(data.message || 'Gửi lại OTP thất bại.');
      }

      setSuccess(data.message || 'Mã OTP mới đã được gửi vào email của bạn.');
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
    if (!pass) return { score: 0, label: 'Chưa nhập', color: 'bg-slate-200', text: 'text-slate-400' };
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: 'Yếu', color: 'bg-rose-500', text: 'text-rose-500 animate-pulse' };
    if (score <= 3) return { score, label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-505' };
    return { score, label: 'Mạnh', color: 'bg-emerald-500', text: 'text-emerald-500 font-bold' };
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

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
          <div className="mx-auto bg-amber-50 text-amber-500 w-12 h-12 rounded-full flex items-center justify-center border border-amber-100 shadow-sm">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-gradient-primary">
            {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            {step === 1 
              ? 'Nhập email để nhận mã OTP khôi phục mật khẩu' 
              : 'Nhập mã OTP từ email và thiết lập mật khẩu mới'
            }
          </p>
        </div>

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

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email đăng ký</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-95"
            >
              {loading ? 'Đang gửi mã...' : 'Gửi mã OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Mã OTP (6 chữ số)</label>
              <div className="flex justify-between gap-2.5 mt-1.5">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-12 text-center text-xl font-extrabold rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all text-slate-800 outline-none shadow-sm"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mật khẩu mới</label>
              <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800 border border-slate-200 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 relative">
                <Lock size={16} className="text-slate-400 mr-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {newPassword && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">Độ mạnh mật khẩu:</span>
                    <span className={getPasswordStrength(newPassword).text}>{getPasswordStrength(newPassword).label}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getPasswordStrength(newPassword).color} transition-all duration-300`} 
                      style={{ width: `${(getPasswordStrength(newPassword).score / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-95"
            >
              {loading ? 'Đang thực hiện...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {/* Resend option under Step 2 */}
        {step === 2 && (
          <div className="flex justify-between items-center text-xs px-1">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || countdown > 0}
              className="text-sky-650 hover:text-sky-700 font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {resendLoading 
                ? 'Đang gửi lại...' 
                : countdown > 0 
                  ? `Gửi lại mã (${countdown}s)` 
                  : 'Gửi lại mã OTP'
              }
            </button>
          </div>
        )}

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4 mt-2">
          Nhớ mật khẩu?{' '}
          <Link to="/login" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
