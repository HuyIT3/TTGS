import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import {
  Users, GraduationCap, BookOpen, DollarSign, Check, X,
  Trash2, Edit3, UserPlus, Cpu, Activity, MessageSquare,
  Award, Calendar, TrendingUp, TrendingDown, FileText,
  Search, Bell, ChevronDown, Download, Filter, RotateCcw,
  FileSpreadsheet, Database, BarChart2, RefreshCw,
  ChevronLeft, ChevronRight, MoreVertical, Shield, ShieldAlert
} from 'lucide-react';
import AttendanceLogView from '../components/AttendanceLogView';
import CommunityHubView from '../components/CommunityHubView';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

interface UserItem {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  isActive: boolean;
}

interface TutorItem {
  id: string;
  subjects: string[];
  experience: string;
  hourlyRate: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

interface ClassRequestItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  hourlyRate: number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  student: {
    user: {
      fullName: string;
    };
  };
  tutorName?: string;
}

export const AdminDashboard: React.FC = () => {
  const { apiUrl, token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [analyticsTab, setAnalyticsTab] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Stats & Entities State
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [tutorsList, setTutorsList] = useState<TutorItem[]>([]);
  const [requestsList, setRequestsList] = useState<ClassRequestItem[]>([]);

  // Modal display states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserItem | null>(null);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [selectedRequestForEdit, setSelectedRequestForEdit] = useState<ClassRequestItem | null>(null);
  const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
  const [selectedRequestForAssign, setSelectedRequestForAssign] = useState<ClassRequestItem | null>(null);

  // User form input fields
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'ADMIN' | 'TEACHER' | 'STUDENT'>('STUDENT');
  const [userIsActive, setUserIsActive] = useState(true);

  // Class request form input fields
  const [reqTitle, setReqTitle] = useState('');
  const [reqSubject, setReqSubject] = useState('Toán học');
  const [reqGrade, setReqGrade] = useState('Lớp 12');
  const [reqRate, setReqRate] = useState(100000);
  const [reqStatus, setReqStatus] = useState<'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED'>('OPEN');
  const [reqTutorId, setReqTutorId] = useState('');

  // AI Chatbot Settings Prompt State
  const [chatbotPrompt, setChatbotPrompt] = useState(() => {
    return localStorage.getItem('ttgs_chatbot_system_prompt') ||
      `Bạn là một trợ lý AI thông minh toàn năng (General AI Assistant), đồng thời tích hợp dữ liệu học vụ của Trung tâm Gia sư Hoa Hướng Dương (Hoa Hướng Dương Tutor Center).\nHãy trả lời bất kỳ câu hỏi nào của người dùng bằng tiếng Việt thân thiện, lịch sự (bao gồm trả lời kiến thức chung, làm văn, giải bài tập, v.v.).`;
  });

  const mockStats = {
    overview: {
      totalUsers: 6,
      totalTutors: 3,
      totalStudents: 2,
      activeClasses: 1,
      totalRevenue: 2400000,
    },
    dailyStats: [
      { date: '2026-01-01', revenue: 300000 },
      { date: '2026-02-01', revenue: 450000 },
      { date: '2026-03-01', revenue: 380000 },
      { date: '2026-04-01', revenue: 600000 },
      { date: '2026-05-01', revenue: 520000 },
      { date: '2026-06-01', revenue: 680000 },
      { date: '2026-07-01', revenue: 750000 },
      { date: '2026-08-01', revenue: 640000 },
      { date: '2026-09-01', revenue: 580000 },
      { date: '2026-10-01', revenue: 700000 },
      { date: '2026-11-01', revenue: 820000 },
      { date: '2026-12-01', revenue: 760000 },
    ],
    subjectStats: [
      { subject: 'Toán học', count: 42 },
      { subject: 'Tiếng Anh', count: 28 },
      { subject: 'Vật lý', count: 15 },
      { subject: 'Hóa học', count: 10 },
    ],
  };

  const mockUsers: UserItem[] = [
    { id: 'u-1', email: 'admin@huyhoang.com', fullName: 'Huy Hoàng Admin', role: 'ADMIN', isActive: true },
    { id: 'u-2', email: 'tutor1@huyhoang.com', fullName: 'Dư Hoàng Huy', role: 'TEACHER', isActive: true },
    { id: 'u-3', email: 'tutor2@huyhoang.com', fullName: 'Cao Vũ Băng Truyền', role: 'TEACHER', isActive: true },
    { id: 'u-4', email: 'tutor3@huyhoang.com', fullName: 'Lê Hoàng Nam', role: 'TEACHER', isActive: true },
    { id: 'u-5', email: 'student1@huyhoang.com', fullName: 'Tuệ Vương', role: 'STUDENT', isActive: true },
    { id: 'u-6', email: 'student2@huyhoang.com', fullName: 'Hoàng Mai Chi', role: 'STUDENT', isActive: false },
  ];

  const mockTutors: TutorItem[] = [
    {
      id: 'tut-1',
      subjects: ['Toán học', 'Vật lý'],
      experience: '4 năm kinh nghiệm dạy và ôn thi thpt toán lý hóa cấp 2,3',
      hourlyRate: 100000,
      status: 'APPROVED',
      user: { fullName: 'Dư Hoàng Huy', email: 'tutor1@huyhoang.com', phone: '0327169519' }
    },
    {
      id: 'tut-2',
      subjects: ['Tiếng Anh', 'Ngữ văn'],
      experience: '3 năm giảng dạy tại trung tâm gia sư tiếng anh',
      hourlyRate: 100000,
      status: 'APPROVED',
      user: { fullName: 'Cao Vũ Băng Truyền', email: 'tutor2@huyhoang.com', phone: '0923456789' }
    },
    {
      id: 'tut-3',
      subjects: ['Hóa học', 'Sinh học'],
      experience: '2 năm làm gia sư',
      hourlyRate: 150000,
      status: 'PENDING',
      user: { fullName: 'Lê Hoàng Nam', email: 'tutor3@huyhoang.com', phone: '0934567890' }
    }
  ];

  const mockRequests: ClassRequestItem[] = [
    {
      id: 'req-1',
      title: 'Tìm Gia sư Toán 12 ôn thi THPT Quốc Gia',
      subject: 'Toán học',
      grade: 'Lớp 12',
      hourlyRate: 100000,
      status: 'OPEN',
      student: { user: { fullName: 'Tuệ Vương' } }
    },
    {
      id: 'req-2',
      title: 'Gia sư Tiếng Anh lớp 9 luyện thi lên lớp 10',
      subject: 'Tiếng Anh',
      grade: 'Lớp 9',
      hourlyRate: 100000,
      status: 'OPEN',
      student: { user: { fullName: 'Hoàng Mai Chi' } }
    },
    {
      id: 'req-3',
      title: 'Luyện thi cấp tốc Hóa học lớp 12',
      subject: 'Hóa học',
      grade: 'Lớp 12',
      hourlyRate: 180000,
      status: 'ASSIGNED',
      student: { user: { fullName: 'Tuệ Vương' } },
      tutorName: 'Dư Hoàng Huy'
    },
    {
      id: 'req-4',
      title: 'Học Vật lý lớp 11 nâng cao',
      subject: 'Vật lý',
      grade: 'Lớp 11',
      hourlyRate: 120000,
      status: 'COMPLETED',
      student: { user: { fullName: 'Tuệ Vương' } },
      tutorName: 'Dư Hoàng Huy'
    },
    {
      id: 'req-5',
      title: 'Ôn tập Ngữ văn THPT',
      subject: 'Ngữ văn',
      grade: 'Lớp 12',
      hourlyRate: 90000,
      status: 'CANCELLED',
      student: { user: { fullName: 'Hoàng Mai Chi' } }
    },
  ];

  // Persistent localStorage fallback
  useEffect(() => {
    const savedUsers = localStorage.getItem('ttgs_admin_users');
    if (savedUsers) {
      setUsersList(JSON.parse(savedUsers));
    } else {
      fetchUsers();
    }
    const savedRequests = localStorage.getItem('ttgs_admin_requests');
    if (savedRequests) {
      setRequestsList(JSON.parse(savedRequests));
    } else {
      fetchRequests();
    }
    fetchStats();
    fetchTutors();
  }, [activeTab]);

  useEffect(() => {
    if (usersList.length > 0) {
      localStorage.setItem('ttgs_admin_users', JSON.stringify(usersList));
    }
  }, [usersList]);

  useEffect(() => {
    if (requestsList.length > 0) {
      localStorage.setItem('ttgs_admin_requests', JSON.stringify(requestsList));
    }
  }, [requestsList]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/stats/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats(mockStats);
      }
    } catch {
      setStats(mockStats);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        setUsersList(mockUsers);
      }
    } catch {
      setUsersList(mockUsers);
    }
  };

  const fetchTutors = async () => {
    setTutorsList(mockTutors);
    try {
      const res = await fetch(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const tutors = data
          .filter((u: any) => u.role === 'TEACHER' && u.tutorProfile)
          .map((u: any) => ({
            id: u.tutorProfile.id,
            subjects: u.tutorProfile.subjects,
            experience: u.tutorProfile.experience,
            hourlyRate: u.tutorProfile.hourlyRate,
            status: u.tutorProfile.status,
            user: { fullName: u.fullName, email: u.email, phone: u.phone }
          }));
        if (tutors.length) setTutorsList(tutors);
      }
    } catch {}
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${apiUrl}/classes/requests`);
      if (res.ok) {
        const data = await res.json();
        setRequestsList(data);
      } else {
        setRequestsList(mockRequests);
      }
    } catch {
      setRequestsList(mockRequests);
    }
  };

  // User CRUD handlers
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName.trim() || !userEmail.trim()) return;
    const newUser: UserItem = {
      id: `u-custom-${Date.now()}`,
      email: userEmail,
      fullName: userFullName,
      phone: userPhone,
      role: userRole,
      isActive: userIsActive,
    };
    setUsersList(prev => [newUser, ...prev]);
    setShowAddUserModal(false);
    setUserFullName(''); setUserEmail(''); setUserPhone('');
    setUserRole('STUDENT'); setUserIsActive(true);
  };

  const handleEditUserClick = (userItem: UserItem) => {
    setSelectedUserForEdit(userItem);
    setUserFullName(userItem.fullName);
    setUserEmail(userItem.email);
    setUserPhone(userItem.phone || '');
    setUserRole(userItem.role);
    setUserIsActive(userItem.isActive);
    setShowEditUserModal(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setUsersList(prev => prev.map(u => u.id === selectedUserForEdit.id ? {
      ...u, fullName: userFullName, email: userEmail, phone: userPhone, role: userRole, isActive: userIsActive,
    } : u));
    setShowEditUserModal(false);
    setSelectedUserForEdit(null);
    setUserFullName(''); setUserEmail(''); setUserPhone('');
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
      setUsersList(prev => prev.filter(u => u.id !== userId));
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`${apiUrl}/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
      }
    } catch {
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    }
  };

  const updateTutorStatus = async (tutorId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${apiUrl}/users/tutors/${tutorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchTutors();
      } else {
        setTutorsList(prev => prev.map(t => t.id === tutorId ? { ...t, status } : t));
      }
    } catch {
      setTutorsList(prev => prev.map(t => t.id === tutorId ? { ...t, status } : t));
    }
  };

  const handleEditRequestClick = (req: ClassRequestItem) => {
    setSelectedRequestForEdit(req);
    setReqTitle(req.title); setReqSubject(req.subject); setReqGrade(req.grade);
    setReqRate(req.hourlyRate); setReqStatus(req.status);
    setShowEditRequestModal(true);
  };

  const handleEditRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForEdit) return;
    setRequestsList(prev => prev.map(r => r.id === selectedRequestForEdit.id ? {
      ...r, title: reqTitle, subject: reqSubject, grade: reqGrade, hourlyRate: reqRate, status: reqStatus,
    } : r));
    setShowEditRequestModal(false);
    setSelectedRequestForEdit(null);
  };

  const handleDeleteRequest = (reqId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tuyển gia sư này?')) {
      setRequestsList(prev => prev.filter(r => r.id !== reqId));
    }
  };

  const handleAssignTutorClick = (req: ClassRequestItem) => {
    setSelectedRequestForAssign(req);
    setShowAssignTutorModal(true);
  };

  const handleAssignTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForAssign || !reqTutorId) return;
    const tutor = tutorsList.find(t => t.id === reqTutorId);
    if (!tutor) return;
    setRequestsList(prev => prev.map(r => r.id === selectedRequestForAssign.id ? {
      ...r, status: 'ASSIGNED', tutorName: tutor.user.fullName
    } : r));
    setShowAssignTutorModal(false);
    setSelectedRequestForAssign(null);
    setReqTutorId('');
  };

  const handleSaveChatbotPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ttgs_chatbot_system_prompt', chatbotPrompt);
    alert('Đã cập nhật chỉ thị hệ thống cho AI Chatbot thành công!');
  };

  // ── Charts data ──────────────────────────────────────────────────────────
  const currentStats = stats || mockStats;

  const monthLabels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const yearLabels = ['2022', '2023', '2024', '2025', '2026'];

  const analyticsDataMap = {
    monthly: {
      labels: monthLabels,
      data: currentStats.dailyStats.map((d: any) => d.revenue / 1000),
    },
    quarterly: {
      labels: quarterLabels,
      data: [1130000, 1800000, 2120000, 2280000].map(v => v / 1000),
    },
    yearly: {
      labels: yearLabels,
      data: [3200000, 4800000, 6100000, 7400000, 2400000].map(v => v / 1000),
    },
  };

  const activeAnalytics = analyticsDataMap[analyticsTab];

  const revenueChartData = {
    labels: activeAnalytics.labels,
    datasets: [
      {
        label: 'Doanh thu (nghìn đ)',
        data: activeAnalytics.data,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        tension: 0.45,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const totalSessions = currentStats.subjectStats.reduce((a: number, s: any) => a + s.count, 0);
  const confirmed = Math.round(totalSessions * 0.67);
  const pending = Math.round(totalSessions * 0.18);
  const cancelled = Math.round(totalSessions * 0.07);
  const refunded = totalSessions - confirmed - pending - cancelled;

  const doughnutData = {
    labels: ['Đã xác nhận', 'Chờ xử lý', 'Đã hủy', 'Hoàn tiền'],
    datasets: [{
      data: [confirmed, pending, cancelled, refunded],
      backgroundColor: ['#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const subjectBarData = {
    labels: currentStats.subjectStats.map((s: any) => s.subject),
    datasets: [{
      label: 'Số lớp học',
      data: currentStats.subjectStats.map((s: any) => s.count),
      backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444'],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  // Top performing subjects (for progress bars)
  const maxSubjectCount = Math.max(...currentStats.subjectStats.map((s: any) => s.count));
  const topSubjects = [...currentStats.subjectStats]
    .sort((a: any, b: any) => b.count - a.count)
    .map((s: any) => ({
      name: s.subject,
      count: s.count,
      pct: Math.round((s.count / maxSubjectCount) * 100),
    }));

  // Learner insights
  const newLearners = currentStats.overview.totalStudents;
  const repeatLearners = Math.round(currentStats.overview.totalUsers * 0.6);
  const verifiedProfiles = currentStats.overview.totalTutors;

  // ── Generated reports mock data ──────────────────────────────────────────
  const mockReports = [
    { id: 'RPT-1005', name: 'Báo cáo Doanh thu Tháng', category: 'Tài chính', generatedBy: 'Huy Hoàng Admin', date: '12/08/2026', status: 'ready' },
    { id: 'RPT-1004', name: 'Hiệu suất Gia sư', category: 'Vận hành', generatedBy: 'Huy Hoàng Admin', date: '10/08/2026', status: 'ready' },
    { id: 'RPT-1003', name: 'Thống kê Học viên', category: 'Khách hàng', generatedBy: 'Huy Hoàng Admin', date: '08/08/2026', status: 'processing' },
    { id: 'RPT-1002', name: 'Báo cáo Lớp học theo Môn', category: 'Vận hành', generatedBy: 'Huy Hoàng Admin', date: '05/08/2026', status: 'ready' },
    { id: 'RPT-1001', name: 'Báo cáo Gia sư Hợp tác', category: 'Đối tác', generatedBy: 'Huy Hoàng Admin', date: '02/08/2026', status: 'failed' },
  ];

  // ── Render helpers ───────────────────────────────────────────────────────
  const StatCard = ({
    label, value, icon, iconBg, change, changePositive, note
  }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    iconBg: string;
    change?: string;
    changePositive?: boolean;
    note?: string;
  }) => (
    <div className="ds-stat-card">
      <div className="ds-stat-card-top">
        <div>
          <p className="ds-stat-label">{label}</p>
          <p className="ds-stat-value">{value}</p>
        </div>
        <div className="ds-stat-icon" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      {change && (
        <div className="ds-stat-change">
          {changePositive !== undefined && (
            changePositive
              ? <TrendingUp size={13} className="text-emerald-500" />
              : <TrendingDown size={13} className="text-rose-500" />
          )}
          <span className={changePositive ? 'text-emerald-600' : 'text-rose-500'}>
            {change}
          </span>
          {note && <span className="ds-stat-note">{note}</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="ds-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ds-main-wrapper">
        {/* ── Top Header Bar ── */}
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <button className="ds-topbar-menu-btn" aria-label="Toggle menu">
              <div className="w-4 flex flex-col gap-1">
                <span className="block h-0.5 w-4 bg-slate-500 rounded" />
                <span className="block h-0.5 w-3 bg-slate-500 rounded" />
                <span className="block h-0.5 w-4 bg-slate-500 rounded" />
              </div>
            </button>
            <div className="ds-topbar-search">
              <Search size={14} className="ds-topbar-search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm báo cáo, thống kê..."
                className="ds-topbar-search-input"
              />
              <span className="ds-topbar-search-kbd">⌘K</span>
            </div>
          </div>
          <div className="ds-topbar-right">
            <button className="ds-topbar-icon-btn" aria-label="Notifications">
              <Bell size={17} />
              <span className="ds-topbar-notif-dot" />
            </button>
            <div className="ds-topbar-user">
              <div className="ds-topbar-avatar">
                {user?.fullName?.charAt(0) ?? 'A'}
              </div>
              <div className="ds-topbar-user-info">
                <span className="ds-topbar-user-name">{user?.fullName ?? 'Admin'}</span>
                <span className="ds-topbar-user-role">Quản trị viên</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="ds-content">

          {/* ════════════════════════════════════════════
              TAB: STATS / DASHBOARD
          ════════════════════════════════════════════ */}
          {activeTab === 'stats' && (
            <div className="ds-page">
              {/* Page Header */}
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Thống kê & Báo cáo</h1>
                  <p className="ds-page-subtitle">Phân tích lớp học, doanh thu, gia sư và hiệu suất vận hành.</p>
                </div>
                <button className="ds-btn-date-range">
                  <Calendar size={14} />
                  <span>T8 1 – T8 31, 2026</span>
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* ── 4 Stat Cards ── */}
              <div className="ds-stat-grid">
                <StatCard
                  label="TỔNG DOANH THU"
                  value={`${(currentStats.overview.totalRevenue / 1000).toLocaleString('vi-VN')}K đ`}
                  icon={<DollarSign size={20} />}
                  iconBg="linear-gradient(135deg,#e0e7ff,#c7d2fe)"
                  change="↑ 15.3%"
                  changePositive={true}
                  note="so với tháng trước"
                />
                <StatCard
                  label="TỔNG LỚP HỌC"
                  value={String(totalSessions)}
                  icon={<BookOpen size={20} />}
                  iconBg="linear-gradient(135deg,#ede9fe,#ddd6fe)"
                  change="↑ 8.4%"
                  changePositive={true}
                  note="so với tháng trước"
                />
                <StatCard
                  label="GIÁ TRỊ TB / LỚP"
                  value={`${Math.round(currentStats.overview.totalRevenue / Math.max(totalSessions, 1) / 1000)}K đ`}
                  icon={<Award size={20} />}
                  iconBg="linear-gradient(135deg,#d1fae5,#a7f3d0)"
                  change="↑ 6.7%"
                  changePositive={true}
                  note="so với tháng trước"
                />
                <StatCard
                  label="TỈ LỆ HỦY LỚP"
                  value="3.4%"
                  icon={<X size={20} />}
                  iconBg="linear-gradient(135deg,#fee2e2,#fecaca)"
                  change="↓ 1.2%"
                  changePositive={false}
                  note="so với tháng trước"
                />
              </div>

              {/* ── Charts Row ── */}
              <div className="ds-charts-row">
                {/* Revenue Analytics */}
                <div className="ds-card ds-chart-main">
                  <div className="ds-card-header">
                    <div>
                      <h3 className="ds-card-title">Phân tích Doanh thu</h3>
                      <div className="ds-analytics-tabs">
                        {(['monthly', 'quarterly', 'yearly'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setAnalyticsTab(t)}
                            className={`ds-analytics-tab ${analyticsTab === t ? 'ds-analytics-tab-active' : ''}`}
                          >
                            {t === 'monthly' ? 'Theo tháng' : t === 'quarterly' ? 'Theo quý' : 'Theo năm'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button className="ds-btn-export">
                      <Download size={13} />
                      <span>Xuất</span>
                      <ChevronDown size={12} />
                    </button>
                  </div>
                  <div className="ds-chart-area">
                    <Line
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        scales: {
                          y: {
                            grid: { color: '#f1f5f9' },
                            ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => `${v}K` }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8', font: { size: 10 } }
                          }
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#f8fafc',
                            bodyColor: '#cbd5e1',
                            padding: 10,
                            cornerRadius: 8,
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Report Summary Doughnut */}
                <div className="ds-card ds-chart-side">
                  <div className="ds-card-header">
                    <h3 className="ds-card-title">Tổng quan lớp học</h3>
                  </div>
                  <div className="ds-doughnut-wrap">
                    <div className="ds-doughnut-chart">
                      <Doughnut
                        data={doughnutData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: '68%',
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: '#1e293b',
                              titleColor: '#f8fafc',
                              bodyColor: '#cbd5e1',
                              padding: 10,
                              cornerRadius: 8,
                            }
                          }
                        }}
                      />
                      <div className="ds-doughnut-center">
                        <span className="ds-doughnut-num">{totalSessions}</span>
                        <span className="ds-doughnut-sub">Tổng số</span>
                      </div>
                    </div>
                    <div className="ds-doughnut-legend">
                      {[
                        { label: 'Đã xác nhận', count: confirmed, pct: '67%', color: '#6366f1' },
                        { label: 'Chờ xử lý', count: pending, pct: '18%', color: '#f59e0b' },
                        { label: 'Đã hủy', count: cancelled, pct: '7%', color: '#ef4444' },
                        { label: 'Hoàn tiền', count: refunded, pct: '8%', color: '#8b5cf6' },
                      ].map(item => (
                        <div key={item.label} className="ds-legend-item">
                          <span className="ds-legend-dot" style={{ background: item.color }} />
                          <span className="ds-legend-label">{item.label}</span>
                          <span className="ds-legend-pct">{item.pct}</span>
                          <span className="ds-legend-count">({item.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Reports Table Row ── */}
              <div className="ds-reports-row">
                {/* Generated Reports Table */}
                <div className="ds-card ds-table-card">
                  <div className="ds-card-header ds-table-header">
                    <h3 className="ds-card-title">Danh sách Báo cáo</h3>
                    <div className="ds-filter-bar">
                      <button className="ds-filter-btn">
                        <Filter size={12} />
                        <span>Loại</span>
                        <ChevronDown size={11} />
                      </button>
                      <button className="ds-filter-btn">
                        <span>Trạng thái</span>
                        <ChevronDown size={11} />
                      </button>
                      <button className="ds-filter-btn">
                        <Calendar size={12} />
                        <span>Ngày</span>
                        <ChevronDown size={11} />
                      </button>
                      <button className="ds-filter-reset">
                        <RotateCcw size={11} />
                        <span>Đặt lại</span>
                      </button>
                    </div>
                  </div>
                  <div className="ds-table-wrap">
                    <table className="ds-table">
                      <thead>
                        <tr>
                          <th>Mã báo cáo</th>
                          <th>Tên báo cáo</th>
                          <th>Danh mục</th>
                          <th>Tạo bởi</th>
                          <th>Ngày</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockReports.map(r => (
                          <tr key={r.id}>
                            <td className="ds-table-id">{r.id}</td>
                            <td className="ds-table-name">{r.name}</td>
                            <td>{r.category}</td>
                            <td>{r.generatedBy}</td>
                            <td>{r.date}</td>
                            <td>
                              <span className={`ds-badge ${
                                r.status === 'ready' ? 'ds-badge-ready' :
                                r.status === 'processing' ? 'ds-badge-processing' :
                                'ds-badge-failed'
                              }`}>
                                {r.status === 'ready' ? 'Sẵn sàng' :
                                 r.status === 'processing' ? 'Đang xử lý' : 'Lỗi'}
                              </span>
                            </td>
                            <td>
                              <button className="ds-table-action-btn" aria-label="More actions">
                                <MoreVertical size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="ds-table-footer">
                    <span className="ds-table-info">Hiển thị 1–5 / 5 báo cáo</span>
                    <div className="ds-pagination">
                      <button className="ds-page-btn" aria-label="Previous"><ChevronLeft size={13} /></button>
                      <button className="ds-page-btn ds-page-btn-active">1</button>
                      <button className="ds-page-btn" aria-label="Next"><ChevronRight size={13} /></button>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="ds-side-widgets">
                  {/* Top Performing Subjects */}
                  <div className="ds-card">
                    <div className="ds-card-header">
                      <h3 className="ds-card-title">Môn học nổi bật</h3>
                    </div>
                    <div className="ds-progress-list">
                      {topSubjects.map((s, i) => (
                        <div key={i} className="ds-progress-item">
                          <div className="ds-progress-row">
                            <span className="ds-progress-label">{s.name}</span>
                            <span className="ds-progress-pct">{s.pct}%</span>
                          </div>
                          <div className="ds-progress-track">
                            <div
                              className="ds-progress-fill"
                              style={{
                                width: `${s.pct}%`,
                                background: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'][i % 5]
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Export */}
                    <div className="ds-quick-export">
                      <p className="ds-quick-export-title">Xuất nhanh</p>
                      <div className="ds-quick-export-btns">
                        <button className="ds-export-btn ds-export-pdf">
                          <FileText size={14} />
                          <span>PDF</span>
                        </button>
                        <button className="ds-export-btn ds-export-excel">
                          <FileSpreadsheet size={14} />
                          <span>Excel</span>
                        </button>
                        <button className="ds-export-btn ds-export-csv">
                          <Database size={14} />
                          <span>CSV</span>
                        </button>
                      </div>
                      <button className="ds-generate-btn">
                        <BarChart2 size={15} />
                        <span>Tạo báo cáo mới</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Bottom Row: Bar chart + Insights ── */}
              <div className="ds-bottom-row">
                {/* Bookings by Subject bar chart */}
                <div className="ds-card ds-bar-card">
                  <div className="ds-card-header">
                    <h3 className="ds-card-title">Lớp học theo Môn</h3>
                    <button className="ds-filter-btn">
                      <span>Tháng này</span>
                      <ChevronDown size={11} />
                    </button>
                  </div>
                  <div className="ds-bar-chart-area">
                    <Bar
                      data={subjectBarData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                          x: {
                            grid: { color: '#f1f5f9' },
                            ticks: { color: '#94a3b8', font: { size: 10 } }
                          },
                          y: {
                            grid: { display: false },
                            ticks: { color: '#475569', font: { size: 11 } }
                          }
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#f8fafc',
                            bodyColor: '#cbd5e1',
                            padding: 10,
                            cornerRadius: 8,
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Learner Insights */}
                <div className="ds-card ds-insights-card">
                  <div className="ds-card-header">
                    <h3 className="ds-card-title">Thống kê Học viên</h3>
                  </div>
                  <div className="ds-insights-grid">
                    <div className="ds-insight-item">
                      <div className="ds-insight-icon" style={{ background: '#ede9fe' }}>
                        <Users size={20} style={{ color: '#7c3aed' }} />
                      </div>
                      <div className="ds-insight-info">
                        <span className="ds-insight-label">Học viên mới</span>
                        <span className="ds-insight-value">{newLearners}</span>
                        <span className="ds-insight-change ds-insight-up">↑ 12.4%</span>
                      </div>
                    </div>
                    <div className="ds-insight-item">
                      <div className="ds-insight-icon" style={{ background: '#d1fae5' }}>
                        <RefreshCw size={20} style={{ color: '#059669' }} />
                      </div>
                      <div className="ds-insight-info">
                        <span className="ds-insight-label">Gia sư hoạt động</span>
                        <span className="ds-insight-value">{repeatLearners}</span>
                        <span className="ds-insight-change ds-insight-up">↑ 9.1%</span>
                      </div>
                    </div>
                    <div className="ds-insight-item">
                      <div className="ds-insight-icon" style={{ background: '#d1fae5' }}>
                        <Shield size={20} style={{ color: '#10b981' }} />
                      </div>
                      <div className="ds-insight-info">
                        <span className="ds-insight-label">Gia sư đã duyệt</span>
                        <span className="ds-insight-value">{verifiedProfiles}</span>
                        <span className="ds-insight-change ds-insight-up">↑ 10.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB: TUTORS APPROVAL
          ════════════════════════════════════════════ */}
          {activeTab === 'tutors' && (
            <div className="ds-page">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Duyệt hồ sơ Gia sư</h1>
                  <p className="ds-page-subtitle">Xem xét và phê duyệt hồ sơ gia sư đối tác mới.</p>
                </div>
              </div>
              <div className="ds-card">
                <div className="ds-table-wrap">
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th>Gia sư</th>
                        <th>Môn dạy</th>
                        <th>Kinh nghiệm</th>
                        <th>Học phí đề xuất</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tutorsList.map((tutor) => (
                        <tr key={tutor.id}>
                          <td>
                            <div className="ds-table-user">
                              <div className="ds-table-user-avatar" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                                {tutor.user.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="ds-table-user-name">{tutor.user.fullName}</p>
                                <p className="ds-table-user-email">{tutor.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {tutor.subjects.map((sub, idx) => (
                                <span key={idx} className="ds-tag ds-tag-blue">{sub}</span>
                              ))}
                            </div>
                          </td>
                          <td className="ds-table-muted">{tutor.experience}</td>
                          <td className="ds-table-highlight">{tutor.hourlyRate.toLocaleString('vi-VN')}đ/h</td>
                          <td>
                            <span className={`ds-badge ${
                              tutor.status === 'APPROVED' ? 'ds-badge-ready' :
                              tutor.status === 'REJECTED' ? 'ds-badge-failed' :
                              'ds-badge-processing'
                            }`}>
                              {tutor.status === 'APPROVED' ? 'Đã duyệt' :
                               tutor.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-2">
                              {tutor.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => updateTutorStatus(tutor.id, 'APPROVED')}
                                    className="ds-action-btn ds-action-btn-success"
                                    title="Duyệt hồ sơ"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => updateTutorStatus(tutor.id, 'REJECTED')}
                                    className="ds-action-btn ds-action-btn-danger"
                                    title="Từ chối"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB: USERS MANAGEMENT
          ════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="ds-page">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Quản lý Người dùng</h1>
                  <p className="ds-page-subtitle">Quản lý tài khoản học viên, gia sư và quản trị viên.</p>
                </div>
                <button
                  onClick={() => { setUserFullName(''); setUserEmail(''); setUserPhone(''); setUserRole('STUDENT'); setUserIsActive(true); setShowAddUserModal(true); }}
                  className="ds-btn-primary"
                >
                  <UserPlus size={15} />
                  <span>Thêm tài khoản</span>
                </button>
              </div>
              <div className="ds-card">
                <div className="ds-table-wrap">
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th>Người dùng</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className="ds-table-user">
                              <div className="ds-table-user-avatar" style={{
                                background: userItem.role === 'ADMIN' ? '#fee2e2' : userItem.role === 'TEACHER' ? '#e0e7ff' : '#d1fae5',
                                color: userItem.role === 'ADMIN' ? '#dc2626' : userItem.role === 'TEACHER' ? '#4f46e5' : '#059669',
                              }}>
                                {userItem.fullName.charAt(0)}
                              </div>
                              <span className="ds-table-user-name">{userItem.fullName}</span>
                            </div>
                          </td>
                          <td className="ds-table-muted">{userItem.email}</td>
                          <td className="ds-table-muted">{userItem.phone || 'Chưa cập nhật'}</td>
                          <td>
                            <span className={`ds-tag ${
                              userItem.role === 'ADMIN' ? 'ds-tag-red' :
                              userItem.role === 'TEACHER' ? 'ds-tag-blue' : 'ds-tag-green'
                            }`}>
                              {userItem.role === 'ADMIN' ? 'Quản trị' : userItem.role === 'TEACHER' ? 'Gia sư' : 'Học sinh'}
                            </span>
                          </td>
                          <td>
                            <span className={`ds-badge ${userItem.isActive ? 'ds-badge-ready' : 'ds-badge-failed'}`}>
                              {userItem.isActive ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleEditUserClick(userItem)} className="ds-action-btn ds-action-btn-default" title="Sửa">
                                <Edit3 size={13} />
                              </button>
                              {userItem.role !== 'ADMIN' && (
                                <button
                                  onClick={() => toggleUserStatus(userItem.id)}
                                  className={`ds-action-btn ${userItem.isActive ? 'ds-action-btn-danger' : 'ds-action-btn-success'}`}
                                  title={userItem.isActive ? 'Khóa' : 'Mở khóa'}
                                >
                                  {userItem.isActive ? <ShieldAlert size={13} /> : <Shield size={13} />}
                                </button>
                              )}
                              {userItem.id.startsWith('u-custom-') && (
                                <button onClick={() => handleDeleteUser(userItem.id)} className="ds-action-btn ds-action-btn-danger" title="Xóa">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB: CLASS REQUESTS
          ════════════════════════════════════════════ */}
          {activeTab === 'requests' && (
            <div className="ds-page">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Quản lý yêu cầu lớp học</h1>
                  <p className="ds-page-subtitle">Xem xét, phân công gia sư cho các yêu cầu tìm lớp.</p>
                </div>
              </div>
              <div className="ds-card">
                <div className="ds-table-wrap">
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th>Lớp yêu cầu</th>
                        <th>Học sinh đăng</th>
                        <th>Môn học</th>
                        <th>Học phí</th>
                        <th>Gia sư chỉ định</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestsList.map((request) => (
                        <tr key={request.id}>
                          <td className="ds-table-name">{request.title}</td>
                          <td className="ds-table-muted">{request.student.user.fullName}</td>
                          <td>
                            <span className="ds-tag ds-tag-blue">{request.subject}</span>
                            <span className="ds-table-muted ml-1">{request.grade}</span>
                          </td>
                          <td className="ds-table-highlight">{request.hourlyRate.toLocaleString('vi-VN')}đ/h</td>
                          <td className="ds-table-highlight" style={{ color: '#6366f1' }}>{request.tutorName || 'Chưa giao lớp'}</td>
                          <td>
                            <span className={`ds-badge ${
                              request.status === 'OPEN' ? 'ds-badge-processing' :
                              request.status === 'ASSIGNED' ? 'ds-badge-info' :
                              request.status === 'COMPLETED' ? 'ds-badge-ready' : 'ds-badge-failed'
                            }`}>
                              {request.status === 'OPEN' ? 'Đang tuyển' :
                               request.status === 'ASSIGNED' ? 'Đã giao' :
                               request.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleEditRequestClick(request)} className="ds-action-btn ds-action-btn-default" title="Sửa">
                                <Edit3 size={13} />
                              </button>
                              {request.status === 'OPEN' && (
                                <button onClick={() => handleAssignTutorClick(request)} className="ds-action-btn ds-action-btn-primary" title="Giao lớp">
                                  <GraduationCap size={13} />
                                </button>
                              )}
                              <button onClick={() => handleDeleteRequest(request.id)} className="ds-action-btn ds-action-btn-danger" title="Xóa">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB: CHATBOT CONFIG
          ════════════════════════════════════════════ */}
          {activeTab === 'chatbot-config' && (
            <div className="ds-page">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Cấu hình AI Chatbot</h1>
                  <p className="ds-page-subtitle">Tùy chỉnh hành vi và câu lệnh hệ thống cho trợ lý AI.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 ds-card">
                  <div className="ds-card-header">
                    <h3 className="ds-card-title flex items-center gap-2">
                      <Cpu size={16} className="text-indigo-500" />
                      Câu lệnh hệ thống (System Prompt)
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-medium mb-4">
                      💡 Câu lệnh này chỉ thị AI về vai trò, giọng điệu và quy tắc hội thoại.
                    </div>
                    <form onSubmit={handleSaveChatbotPrompt} className="flex flex-col gap-4">
                      <textarea
                        rows={8}
                        value={chatbotPrompt}
                        onChange={(e) => setChatbotPrompt(e.target.value)}
                        placeholder="Nhập hướng dẫn cho chatbot..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                      <button type="submit" className="ds-btn-primary">
                        <Check size={15} />
                        <span>Cập nhật chỉ thị Chatbot AI</span>
                      </button>
                    </form>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="ds-card p-5">
                    <h4 className="ds-card-title mb-4">Hiệu suất Trợ lý AI</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tổng hội thoại</span>
                        <strong className="text-base font-black text-slate-700 block mt-1">142 lượt</strong>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Độ chính xác</span>
                        <strong className="text-base font-black text-emerald-600 block mt-1">98.5%</strong>
                      </div>
                    </div>
                  </div>
                  <div className="ds-card p-5 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                    <h4 className="ds-card-title flex items-center gap-1.5">
                      <Activity size={14} className="text-indigo-500 animate-pulse" />
                      Nhật ký gần đây
                    </h4>
                    {[
                      { user: 'Tuệ Vương', msg: 'Hôm nay tôi có lịch học Toán 12 không?', reply: 'Hôm nay bạn có buổi học Toán lúc 19:00 cùng gia sư Trần Thị Lan.' },
                      { user: 'Lê Hoàng Nam', msg: 'Làm thế nào để được duyệt hồ sơ dạy nhanh?', reply: 'Vui lòng cập nhật đầy đủ bằng cấp và kinh nghiệm trong mục Hồ sơ.' },
                      { user: 'Cao Vũ Băng Truyền', msg: 'Xem thông tin lớp tôi dạy?', reply: 'Bạn hiện có lớp Tiếng Anh lớp 9 với học sinh Hoàng Mai Chi.' }
                    ].map((log, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                        <div className="flex justify-between mb-1">
                          <strong className="text-slate-700">{log.user}</strong>
                          <span className="text-slate-400">Vừa xong</span>
                        </div>
                        <p className="text-slate-500 italic mb-1">"{log.msg}"</p>
                        <p className="text-indigo-600 font-medium">→ {log.reply}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB: SESSION AUDIT
          ════════════════════════════════════════════ */}
          {activeTab === 'session-audit' && (
            <div className="ds-page">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Giám sát Buổi học</h1>
                  <p className="ds-page-subtitle">Theo dõi điểm danh và nhật ký buổi dạy của gia sư.</p>
                </div>
              </div>
              <AttendanceLogView />
            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB: COMMUNITY
          ════════════════════════════════════════════ */}
          {activeTab === 'community' && (
            <div className="ds-page">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Cộng đồng & Hỏi đáp</h1>
                  <p className="ds-page-subtitle">Quản lý diễn đàn, câu hỏi và bài đăng của cộng đồng.</p>
                </div>
              </div>
              <CommunityHubView />
            </div>
          )}

        </main>
      </div>

      {/* ════ MODALS ════ */}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="ds-modal-overlay">
          <form onSubmit={handleAddUserSubmit} className="ds-modal">
            <div className="ds-modal-header">
              <h3 className="ds-modal-title">Thêm tài khoản người dùng mới</h3>
              <button type="button" onClick={() => setShowAddUserModal(false)} className="ds-modal-close"><X size={15} /></button>
            </div>
            <div className="ds-modal-body">
              <div className="ds-form-group">
                <label className="ds-label">Họ và tên</label>
                <input type="text" required placeholder="Nguyễn Văn A..." value={userFullName} onChange={e => setUserFullName(e.target.value)} className="ds-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="ds-form-group">
                  <label className="ds-label">Email</label>
                  <input type="email" required placeholder="email@gmail.com" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="ds-input" />
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Số điện thoại</label>
                  <input type="tel" placeholder="0912345678" value={userPhone} onChange={e => setUserPhone(e.target.value)} className="ds-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="ds-form-group">
                  <label className="ds-label">Vai trò</label>
                  <select value={userRole} onChange={e => setUserRole(e.target.value as any)} className="ds-input">
                    <option value="STUDENT">Học sinh / Phụ huynh</option>
                    <option value="TEACHER">Gia sư đối tác</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Trạng thái</label>
                  <select value={userIsActive ? 'ACTIVE' : 'BLOCKED'} onChange={e => setUserIsActive(e.target.value === 'ACTIVE')} className="ds-input">
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="BLOCKED">Đã khóa</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="ds-modal-footer">
              <button type="button" onClick={() => setShowAddUserModal(false)} className="ds-btn-secondary">Hủy</button>
              <button type="submit" className="ds-btn-primary">Tạo tài khoản</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {showEditUserModal && selectedUserForEdit && (
        <div className="ds-modal-overlay">
          <form onSubmit={handleEditUserSubmit} className="ds-modal">
            <div className="ds-modal-header">
              <h3 className="ds-modal-title">Chỉnh sửa tài khoản</h3>
              <button type="button" onClick={() => setShowEditUserModal(false)} className="ds-modal-close"><X size={15} /></button>
            </div>
            <div className="ds-modal-body">
              <div className="ds-form-group">
                <label className="ds-label">Họ và tên</label>
                <input type="text" required value={userFullName} onChange={e => setUserFullName(e.target.value)} className="ds-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="ds-form-group">
                  <label className="ds-label">Email</label>
                  <input type="email" disabled value={userEmail} className="ds-input opacity-60 cursor-not-allowed" />
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Số điện thoại</label>
                  <input type="tel" value={userPhone} onChange={e => setUserPhone(e.target.value)} className="ds-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="ds-form-group">
                  <label className="ds-label">Vai trò</label>
                  <select value={userRole} onChange={e => setUserRole(e.target.value as any)} className="ds-input">
                    <option value="STUDENT">Học sinh / Phụ huynh</option>
                    <option value="TEACHER">Gia sư đối tác</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Trạng thái</label>
                  <select value={userIsActive ? 'ACTIVE' : 'BLOCKED'} onChange={e => setUserIsActive(e.target.value === 'ACTIVE')} className="ds-input">
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="BLOCKED">Đã khóa</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="ds-modal-footer">
              <button type="button" onClick={() => setShowEditUserModal(false)} className="ds-btn-secondary">Hủy</button>
              <button type="submit" className="ds-btn-primary">Lưu chỉnh sửa</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT CLASS REQUEST */}
      {showEditRequestModal && selectedRequestForEdit && (
        <div className="ds-modal-overlay">
          <form onSubmit={handleEditRequestSubmit} className="ds-modal">
            <div className="ds-modal-header">
              <h3 className="ds-modal-title">Chỉnh sửa tin yêu cầu lớp</h3>
              <button type="button" onClick={() => setShowEditRequestModal(false)} className="ds-modal-close"><X size={15} /></button>
            </div>
            <div className="ds-modal-body">
              <div className="ds-form-group">
                <label className="ds-label">Tiêu đề lớp</label>
                <input type="text" required value={reqTitle} onChange={e => setReqTitle(e.target.value)} className="ds-input" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="ds-form-group">
                  <label className="ds-label">Môn học</label>
                  <input type="text" required value={reqSubject} onChange={e => setReqSubject(e.target.value)} className="ds-input" />
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Lớp / Trình độ</label>
                  <input type="text" required value={reqGrade} onChange={e => setReqGrade(e.target.value)} className="ds-input" />
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Học phí (đ/h)</label>
                  <input type="number" required value={reqRate} onChange={e => setReqRate(Number(e.target.value))} className="ds-input" />
                </div>
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Trạng thái lớp</label>
                <select value={reqStatus} onChange={e => setReqStatus(e.target.value as any)} className="ds-input">
                  <option value="OPEN">Đang tìm Gia sư</option>
                  <option value="ASSIGNED">Đã giao lớp</option>
                  <option value="COMPLETED">Đã kết thúc</option>
                  <option value="CANCELLED">Hủy bỏ</option>
                </select>
              </div>
            </div>
            <div className="ds-modal-footer">
              <button type="button" onClick={() => setShowEditRequestModal(false)} className="ds-btn-secondary">Hủy</button>
              <button type="submit" className="ds-btn-primary">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ASSIGN TUTOR */}
      {showAssignTutorModal && selectedRequestForAssign && (
        <div className="ds-modal-overlay">
          <form onSubmit={handleAssignTutorSubmit} className="ds-modal">
            <div className="ds-modal-header">
              <h3 className="ds-modal-title">Giao lớp cho gia sư</h3>
              <button type="button" onClick={() => setShowAssignTutorModal(false)} className="ds-modal-close"><X size={15} /></button>
            </div>
            <div className="ds-modal-body">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-medium leading-relaxed mb-2">
                Lớp: <strong>{selectedRequestForAssign.title}</strong><br />
                Môn: {selectedRequestForAssign.subject} ({selectedRequestForAssign.grade})<br />
                Học sinh: {selectedRequestForAssign.student.user.fullName}
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Chọn gia sư đối tác</label>
                <select required value={reqTutorId} onChange={e => setReqTutorId(e.target.value)} className="ds-input">
                  <option value="">-- Chọn một gia sư được duyệt --</option>
                  {tutorsList.filter(t => t.status === 'APPROVED').map(t => (
                    <option key={t.id} value={t.id}>
                      {t.user.fullName} ({t.subjects.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ds-modal-footer">
              <button type="button" onClick={() => setShowAssignTutorModal(false)} className="ds-btn-secondary">Hủy</button>
              <button type="submit" disabled={!reqTutorId} className="ds-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Xác nhận chỉ định</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
