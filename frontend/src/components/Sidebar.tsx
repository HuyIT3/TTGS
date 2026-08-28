import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, BookOpen, FileText, User, PlusCircle,
  GraduationCap, Calendar, Award, Timer, MessageSquare,
  ChevronRight, LayoutDashboard, LogOut, Home, DollarSign,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderLinks = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { id: 'stats', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { id: 'tutors', label: 'Duyệt hồ sơ Gia sư', icon: <GraduationCap size={18} /> },
          { id: 'users', label: 'Quản lý Người dùng', icon: <Users size={18} /> },
          { id: 'requests', label: 'Quản lý yêu cầu lớp', icon: <BookOpen size={18} /> },
          { id: 'session-audit', label: 'Giám sát buổi học', icon: <Calendar size={18} /> },
          { id: 'community', label: 'Cộng đồng & Hỏi đáp', icon: <MessageSquare size={18} /> },
          { id: 'chatbot-config', label: 'Cấu hình AI Chatbot', icon: <Award size={18} /> },
        ];
      case 'TEACHER':
        return [
          { id: 'stats', label: 'Thống kê thu nhập', icon: <BarChart3 size={18} /> },
          { id: 'classes', label: 'Lớp học đang dạy', icon: <BookOpen size={18} /> },
          { id: 'schedule', label: 'Thời khóa biểu dạy', icon: <Calendar size={18} /> },
          { id: 'materials', label: 'Học liệu & Đề thi', icon: <FileText size={18} /> },
          { id: 'vocab-quiz', label: 'Từ vựng & Quiz', icon: <Award size={18} /> },
          { id: 'exam-hall', label: 'Quản lý thi thử', icon: <Timer size={18} /> },
          { id: 'homework', label: 'Quản lý Bài tập', icon: <FileText size={18} /> },
          { id: 'attendance-log', label: 'Điểm danh & Báo cáo', icon: <Calendar size={18} /> },
          { id: 'community', label: 'Cộng đồng & Hỏi đáp', icon: <MessageSquare size={18} /> },
          { id: 'apply', label: 'Ứng tuyển lớp mới', icon: <PlusCircle size={18} /> },
          { id: 'salary', label: 'Bảng lương', icon: <DollarSign size={18} /> },
          { id: 'profile', label: 'Hồ sơ cá nhân', icon: <User size={18} /> },
        ];
      case 'STUDENT':
        return [
          { id: 'classes', label: 'Lớp học đang học', icon: <BookOpen size={18} /> },
          { id: 'schedule', label: 'Thời khóa biểu học', icon: <Calendar size={18} /> },
          { id: 'materials', label: 'Học liệu & Đề thi', icon: <FileText size={18} /> },
          { id: 'vocab-quiz', label: 'Luyện từ vựng (Quiz)', icon: <Award size={18} /> },
          { id: 'exam-hall', label: 'Luyện đề & Thi thử', icon: <Timer size={18} /> },
          { id: 'homework', label: 'Bài tập về nhà', icon: <FileText size={18} /> },
          { id: 'attendance-log', label: 'Nhật ký học tập', icon: <Calendar size={18} /> },
          { id: 'community', label: 'Cộng đồng & Hỏi đáp', icon: <MessageSquare size={18} /> },
          { id: 'post-request', label: 'Đăng tin tìm Gia sư', icon: <PlusCircle size={18} /> },
          { id: 'requests', label: 'Yêu cầu đã đăng', icon: <FileText size={18} /> },
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

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#6366f1';
      case 'TEACHER': return '#8b5cf6';
      default: return '#10b981';
    }
  };

  const systemTitle = user.role === 'ADMIN'
    ? 'Trung tâm Gia sư'
    : user.role === 'TEACHER'
    ? 'Gia sư Platform'
    : 'Học tập Platform';

  return (
    <aside className="ds-sidebar">
      {/* Logo / Brand */}
      <div className="ds-sidebar-brand">
        <div className="ds-sidebar-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#6366f1" opacity="0.15" />
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="#6366f1" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="ds-sidebar-brand-text">
          <span className="ds-sidebar-brand-name">{systemTitle}</span>
          <span className="ds-sidebar-brand-sub">Management System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="ds-sidebar-nav">
        <span className="ds-sidebar-section-label">MAIN MENU</span>
        {links.map((link, index) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{ animationDelay: `${index * 25}ms` }}
              className={`ds-sidebar-item ${isActive ? 'ds-sidebar-item-active' : ''}`}
            >
              <span className="ds-sidebar-item-icon">{link.icon}</span>
              <span className="ds-sidebar-item-label">{link.label}</span>
              {isActive && <ChevronRight size={14} className="ds-sidebar-item-arrow" />}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ margin: '12px 0 8px', height: 1, background: '#e2e8f0' }} />
        <span className="ds-sidebar-section-label">SYSTEM</span>

        {/* Home button */}
        <button
          onClick={() => navigate('/')}
          className="ds-sidebar-item"
        >
          <span className="ds-sidebar-item-icon"><Home size={18} /></span>
          <span className="ds-sidebar-item-label">Về trang chủ</span>
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="ds-sidebar-item ds-sidebar-logout"
        >
          <span className="ds-sidebar-item-icon"><LogOut size={18} /></span>
          <span className="ds-sidebar-item-label">Đăng xuất</span>
        </button>
      </nav>

      {/* Decorative landscape illustration */}
      <div className="ds-sidebar-illustration">
        <svg viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          {/* Sky */}
          <rect width="220" height="110" fill="#e8f4fd" rx="12" />
          {/* Sun */}
          <circle cx="170" cy="30" r="16" fill="#fbbf24" opacity="0.7" />
          <circle cx="170" cy="30" r="10" fill="#f59e0b" opacity="0.5" />
          {/* Clouds */}
          <ellipse cx="40" cy="28" rx="20" ry="10" fill="white" opacity="0.8" />
          <ellipse cx="55" cy="24" rx="15" ry="9" fill="white" opacity="0.9" />
          <ellipse cx="30" cy="26" rx="12" ry="7" fill="white" opacity="0.7" />
          <ellipse cx="120" cy="22" rx="18" ry="8" fill="white" opacity="0.7" />
          <ellipse cx="134" cy="18" rx="13" ry="7" fill="white" opacity="0.8" />
          {/* Mountains back */}
          <polygon points="0,80 40,40 80,80" fill="#93c5fd" opacity="0.6" />
          <polygon points="30,80 75,35 120,80" fill="#60a5fa" opacity="0.5" />
          <polygon points="100,80 145,42 190,80" fill="#93c5fd" opacity="0.55" />
          <polygon points="150,80 185,48 220,80" fill="#60a5fa" opacity="0.5" />
          {/* Snow caps */}
          <polygon points="40,40 48,52 32,52" fill="white" opacity="0.9" />
          <polygon points="75,35 83,49 67,49" fill="white" opacity="0.9" />
          <polygon points="145,42 153,56 137,56" fill="white" opacity="0.9" />
          {/* Ground */}
          <rect y="78" width="220" height="32" fill="#bbf7d0" rx="4" />
          {/* Trees */}
          <rect x="18" y="65" width="5" height="18" fill="#6b7280" opacity="0.5" rx="1" />
          <polygon points="20,50 10,68 30,68" fill="#4ade80" opacity="0.85" />
          <polygon points="20,44 12,60 28,60" fill="#22c55e" opacity="0.8" />
          <rect x="55" y="60" width="5" height="22" fill="#6b7280" opacity="0.5" rx="1" />
          <polygon points="57,44 46,64 68,64" fill="#4ade80" opacity="0.85" />
          <polygon points="57,38 48,56 66,56" fill="#22c55e" opacity="0.8" />
          <rect x="190" y="65" width="5" height="18" fill="#6b7280" opacity="0.5" rx="1" />
          <polygon points="192,50 182,68 202,68" fill="#4ade80" opacity="0.85" />
          <polygon points="192,44 184,60 200,60" fill="#22c55e" opacity="0.8" />
          {/* Hot air balloon */}
          <ellipse cx="100" cy="48" rx="14" ry="18" fill="#f97316" opacity="0.8" />
          <ellipse cx="100" cy="48" rx="7" ry="18" fill="#fbbf24" opacity="0.5" />
          <rect x="94" y="64" width="12" height="7" rx="2" fill="#92400e" opacity="0.7" />
          <line x1="94" y1="65" x2="96" y2="64" stroke="#92400e" strokeWidth="1" opacity="0.6" />
          <line x1="106" y1="65" x2="104" y2="64" stroke="#92400e" strokeWidth="1" opacity="0.6" />
          {/* Road */}
          <path d="M80,110 L110,78 L140,110" fill="#d1d5db" opacity="0.6" />
          <line x1="110" y1="78" x2="110" y2="110" stroke="white" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.8" />
          {/* Path / River */}
          <path d="M0,95 Q55,88 110,92 Q165,97 220,90" stroke="#93c5fd" strokeWidth="4" fill="none" opacity="0.5" />
        </svg>
      </div>

      {/* User profile at bottom */}
      <div className="ds-sidebar-profile">
        <div
          className="ds-sidebar-avatar"
          style={{ background: `linear-gradient(135deg, ${getAvatarColor(user.role)}, ${getAvatarColor(user.role)}99)` }}
        >
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="ds-sidebar-profile-info">
          <span className="ds-sidebar-profile-name">{user.fullName}</span>
          <span className="ds-sidebar-profile-role">{getRoleLabel(user.role)}</span>
        </div>
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="ds-sidebar-logout-icon"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
};
