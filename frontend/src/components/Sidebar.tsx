import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3, Users, BookOpen, FileText, User, PlusCircle,
  GraduationCap, Calendar, Award, Timer, MessageSquare,
  ChevronRight
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
          { id: 'stats', label: 'Thống kê hệ thống', icon: <BarChart3 size={16} /> },
          { id: 'tutors', label: 'Duyệt hồ sơ Gia sư', icon: <GraduationCap size={16} /> },
          { id: 'users', label: 'Quản lý Người dùng', icon: <Users size={16} /> },
          { id: 'requests', label: 'Quản lý yêu cầu lớp', icon: <BookOpen size={16} /> },
          { id: 'session-audit', label: 'Giám sát buổi học', icon: <Calendar size={16} /> },
          { id: 'community', label: 'Cộng đồng & Hỏi đáp', icon: <MessageSquare size={16} /> },
          { id: 'chatbot-config', label: 'Cấu hình AI Chatbot', icon: <Award size={16} /> },
        ];
      case 'TEACHER':
        return [
          { id: 'stats', label: 'Thống kê thu nhập', icon: <BarChart3 size={16} /> },
          { id: 'classes', label: 'Lớp học đang dạy', icon: <BookOpen size={16} /> },
          { id: 'schedule', label: 'Thời khóa biểu dạy', icon: <Calendar size={16} /> },
          { id: 'materials', label: 'Học liệu & Đề thi', icon: <FileText size={16} /> },
          { id: 'vocab-quiz', label: 'Từ vựng & Quiz', icon: <Award size={16} /> },
          { id: 'exam-hall', label: 'Quản lý thi thử', icon: <Timer size={16} /> },
          { id: 'homework', label: 'Quản lý Bài tập', icon: <FileText size={16} /> },
          { id: 'attendance-log', label: 'Điểm danh & Báo cáo', icon: <Calendar size={16} /> },
          { id: 'community', label: 'Cộng đồng & Hỏi đáp', icon: <MessageSquare size={16} /> },
          { id: 'apply', label: 'Ứng tuyển lớp mới', icon: <PlusCircle size={16} /> },
          { id: 'profile', label: 'Hồ sơ cá nhân', icon: <User size={16} /> },
        ];
      case 'STUDENT':
        return [
          { id: 'classes', label: 'Lớp học đang học', icon: <BookOpen size={16} /> },
          { id: 'schedule', label: 'Thời khóa biểu học', icon: <Calendar size={16} /> },
          { id: 'materials', label: 'Học liệu & Đề thi', icon: <FileText size={16} /> },
          { id: 'vocab-quiz', label: 'Luyện từ vựng (Quiz)', icon: <Award size={16} /> },
          { id: 'exam-hall', label: 'Luyện đề & Thi thử', icon: <Timer size={16} /> },
          { id: 'homework', label: 'Bài tập về nhà', icon: <FileText size={16} /> },
          { id: 'attendance-log', label: 'Nhật ký học tập', icon: <Calendar size={16} /> },
          { id: 'community', label: 'Cộng đồng & Hỏi đáp', icon: <MessageSquare size={16} /> },
          { id: 'post-request', label: 'Đăng tin tìm Gia sư', icon: <PlusCircle size={16} /> },
          { id: 'requests', label: 'Yêu cầu đã đăng', icon: <FileText size={16} /> },
        ];
      default:
        return [];
    }
  };

  const links = renderLinks();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'TEACHER': return 'Gia sư đối tác';
      default: return 'Học viên';
    }
  };

  const getAvatarGradient = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'from-rose-500 via-orange-500 to-amber-500';
      case 'TEACHER': return 'from-indigo-500 via-violet-500 to-purple-600';
      default: return 'from-emerald-400 via-teal-500 to-cyan-500';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'badge-rose';
      case 'TEACHER': return 'badge-indigo';
      default: return 'badge-emerald';
    }
  };

  return (
    <aside className="w-full md:w-64 bg-[#0a0e1a]/90 backdrop-blur-xl border-r border-white/[0.05] min-h-[calc(100vh-64px)] p-4 flex flex-col gap-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Profile Info */}
      <div className="relative flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <div className="relative shrink-0">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getAvatarGradient(user.role)} flex items-center justify-center font-bold text-white text-sm shadow-lg`}>
            {user.fullName.charAt(0)}
          </div>
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0e1a] shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
          <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md tracking-wider mt-0.5 ${getRoleBadge(user.role)}`}>
            {getRoleLabel(user.role)}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1 relative z-10">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-1">Menu chính</p>
        {links.map((link, index) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group cursor-pointer animate-fade-in-left ${
                isActive
                  ? 'sidebar-active-pill text-indigo-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className={`transition-all duration-200 shrink-0 ${
                isActive
                  ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                  : 'text-slate-500 group-hover:text-slate-300 group-hover:scale-110'
              }`}>
                {link.icon}
              </span>
              <span className="truncate">{link.label}</span>
              {isActive && (
                <ChevronRight size={12} className="ml-auto text-indigo-400/60 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="mt-auto pt-3 border-t border-white/[0.05] relative z-10">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/15">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-400 font-medium">Hệ thống hoạt động bình thường</span>
        </div>
      </div>
    </aside>
  );
};
