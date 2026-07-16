import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { apiUrl, login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    <div className="w-full min-h-[calc(100vh-73px)] flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 text-slate-850">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl flex flex-col gap-6 relative z-10 animate-fade-in-up">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Đăng ký Tài khoản</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Trở thành thành viên của Gia sư Huy Hoàng</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="text-rose-500" />
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
                ? 'bg-sky-50 border-sky-500/40 text-sky-655 shadow-sm shadow-sky-500/5'
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
                ? 'bg-sky-50 border-sky-500/40 text-sky-655 shadow-sm shadow-sky-500/5'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className="text-xs">Gia sư / Giáo viên</span>
            <span className="text-[9px] font-medium text-slate-400">Tìm lớp nhận dạy</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ và tên</label>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800">
              <User size={16} className="text-slate-405 mr-2.5" />
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
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800">
              <Mail size={16} className="text-slate-405 mr-2.5" />
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</label>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800">
              <Phone size={16} className="text-slate-405 mr-2.5" />
              <input
                type="input-tel"
                placeholder="09xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm placeholder-slate-400 text-slate-800 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mật khẩu</label>
            <div className="flex items-center input-premium rounded-xl px-3.5 py-2.5 text-slate-800">
              <Lock size={16} className="text-slate-405 mr-2.5" />
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
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
