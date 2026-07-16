import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-50 text-rose-650 border border-rose-200';
      case 'TEACHER':
        return 'bg-sky-50 text-sky-650 border border-sky-200';
      default:
        return 'bg-emerald-50 text-emerald-650 border border-emerald-200';
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="relative p-2.5 bg-gradient-to-tr from-sky-500 to-sky-600 rounded-xl text-white shadow-sm transition-all duration-300">
          <BookOpen size={20} className="relative z-10" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-800 tracking-wide leading-none flex items-center gap-1">
            Gia sư Huy Hoàng
            <Sparkles size={13} className="text-sky-500 animate-pulse" />
          </span>
          <span className="text-[8px] uppercase tracking-widest text-slate-400 mt-1 font-bold">ERP Portal</span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold">
        <Link to="/" className="text-slate-600 hover:text-sky-600 transition-colors">
          Trang chủ
        </Link>
        <Link to="/" className="text-slate-600 hover:text-sky-600 transition-colors">
          Đội ngũ Gia sư
        </Link>
        <Link to="/" className="text-slate-600 hover:text-sky-600 transition-colors">
          Lớp học cần Gia sư
        </Link>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end gap-0.5 mr-1">
              <span className="text-xs font-bold text-slate-700">
                {user.fullName}
              </span>
              <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-md ${getRoleBadge(user.role)}`}>
                {user.role === 'ADMIN' ? 'Quản trị' : user.role === 'TEACHER' ? 'Gia sư' : 'Học sinh'}
              </span>
            </div>
            <Link
              to={user.role === 'ADMIN' ? '/admin' : user.role === 'TEACHER' ? '/teacher' : '/student'}
              className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-650 transition-all duration-200 flex items-center gap-1.5 text-xs font-bold border border-sky-100"
            >
              <LayoutDashboard size={13} />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
              title="Đăng xuất"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors rounded-lg"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all duration-250 active:scale-95"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
