import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Sun, Moon, Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/about', label: 'Giới thiệu' },
    { to: '/classes', label: 'Tìm lớp học' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'badge-rose';
      case 'TEACHER': return 'badge-indigo';
      default: return 'badge-emerald';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị';
      case 'TEACHER': return 'Gia sư';
      default: return 'Học sinh';
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-black/60 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/20'
            : 'bg-[#080c14]/80 backdrop-blur-md border-b border-white/[0.04]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-md group-hover:bg-indigo-500/30 transition-all duration-300" />
                <img
                  src={logoImg}
                  alt="Hoa Hướng Dương"
                  className="relative w-9 h-9 object-contain rounded-xl shadow-lg"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-white tracking-wide">
                  Gia sư{' '}
                  <span className="text-gradient-primary">Hoa Hướng Dương</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-medium mt-0.5">
                  ERP Platform
                </span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link-underline ${
                    isActive(link.to)
                      ? 'text-white bg-white/[0.06]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg border border-white/[0.07] hover:border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
                title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-xs font-semibold text-white/90">{user.fullName}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md tracking-wider ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : user.role === 'TEACHER' ? '/teacher' : '/student'}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-gradient text-white text-xs font-semibold shadow-lg"
                  >
                    <LayoutDashboard size={13} />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="p-2 rounded-lg border border-white/[0.07] hover:border-rose-500/30 bg-white/[0.03] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all duration-200 cursor-pointer"
                    title="Đăng xuất"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg btn-gradient shadow-lg shadow-indigo-500/20"
                  >
                    <Sparkles size={13} />
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg border border-white/[0.07] bg-white/[0.03] text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute top-16 left-0 right-0 mx-4 glass-panel rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {link.label}
              <ChevronRight size={14} className="opacity-50" />
            </Link>
          ))}

          <div className="border-t border-white/[0.06] pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 glass-card rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.fullName}</p>
                    <p className="text-xs text-slate-400">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : user.role === 'TEACHER' ? '/teacher' : '/student'}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl btn-gradient text-white font-semibold text-sm"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 font-semibold text-sm transition-all cursor-pointer"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-3 text-center rounded-xl border border-white/[0.08] text-slate-300 hover:text-white text-sm font-medium transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="py-3 text-center rounded-xl btn-gradient text-white text-sm font-semibold"
                >
                  Đăng ký ngay
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
