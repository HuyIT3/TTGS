import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Users,
  BookOpen,
  FileText,
  User,
  PlusCircle,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  if (!user) return null;

  const renderLinks = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { id: 'stats', label: 'Thống kê hệ thống', icon: <BarChart3 size={15} /> },
          { id: 'tutors', label: 'Duyệt hồ sơ Gia sư', icon: <GraduationCap size={15} /> },
          { id: 'users', label: 'Quản lý Người dùng', icon: <Users size={15} /> },
          { id: 'requests', label: 'Quản lý yêu cầu lớp', icon: <BookOpen size={15} /> },
        ];
      case 'TEACHER':
        return [
          { id: 'stats', label: 'Thống kê thu nhập', icon: <BarChart3 size={15} /> },
          { id: 'classes', label: 'Lớp học đang dạy', icon: <BookOpen size={15} /> },
          { id: 'apply', label: 'Ứng tuyển lớp mới', icon: <PlusCircle size={15} /> },
          { id: 'profile', label: 'Hồ sơ cá nhân', icon: <User size={15} /> },
        ];
      case 'STUDENT':
        return [
          { id: 'classes', label: 'Lớp học đang học', icon: <BookOpen size={15} /> },
          { id: 'post-request', label: 'Đăng tin tìm Gia sư', icon: <PlusCircle size={15} /> },
          { id: 'requests', label: 'Yêu cầu đã đăng', icon: <FileText size={15} /> },
        ];
      default:
        return [];
    }
  };

  const links = renderLinks();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'TEACHER':
        return 'Gia sư đối tác';
      default:
        return 'Học viên / Phụ huynh';
    }
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'from-rose-450 to-orange-450 text-white';
      case 'TEACHER':
        return 'from-sky-500 to-sky-600 text-white';
      default:
        return 'from-emerald-500 to-teal-500 text-white';
    }
  };

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-73px)] p-5 flex flex-col gap-5 shadow-sm relative z-10">
      {/* Profile Info block */}
      <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getAvatarColor(user.role)} flex items-center justify-center font-bold text-sm shadow-sm`}>
          {user.fullName.charAt(0)}
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="text-xs font-bold text-slate-800 tracking-wide truncate max-w-[130px]">{user.fullName}</h4>
          <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase leading-none">
            {getRoleLabel(user.role)}
          </span>
        </div>
      </div>

      {/* Navigation links list */}
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 relative overflow-hidden group cursor-pointer ${
                isActive
                  ? 'bg-sky-50 text-sky-650 border border-sky-100 shadow-sm shadow-sky-500/5'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-105 text-sky-600' : 'group-hover:scale-105 group-hover:text-sky-500'}`}>
                {link.icon}
              </span>
              <span>{link.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-sky-500 rounded-l-full"></div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
