import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { ScheduleView } from '../components/ScheduleView';
import NotificationPanel from '../components/NotificationPanel';
import TeacherSalaryView from '../components/TeacherSalaryView';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import {
  BookOpen, DollarSign, Star, FileText, CheckCircle2, User,
  Search, ChevronDown, TrendingUp, Clock, MapPin,
  Calendar, Award, Edit, X, Plus,
} from 'lucide-react';
import MaterialsView from '../components/MaterialsView';
import VocabQuizView from '../components/VocabQuizView';
import ExamHallView from '../components/ExamHallView';
import HomeworkView from '../components/HomeworkView';
import AttendanceLogView from '../components/AttendanceLogView';
import CommunityHubView from '../components/CommunityHubView';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ActiveClass {
  id: string;
  classRequest: {
    title: string; subject: string; grade: string; hourlyRate: number;
    sessionsPerWeek: number; schedule: string; location: string;
  };
  student: { user: { fullName: string; phone: string } };
  status: string;
}

interface OpenClass {
  id: string; title: string; subject: string; grade: string;
  hourlyRate: number; sessionsPerWeek: number; schedule: string;
  location: string; description: string;
}

export const TeacherDashboard: React.FC = () => {
  const { apiUrl, token, user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');

  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);
  const [openClasses, setOpenClasses] = useState<OpenClass[]>([]);
  const [appliedClassIds, setAppliedClassIds] = useState<string[]>([]);

  const [subjectsText, setSubjectsText] = useState(user?.tutorProfile?.subjects?.join(', ') || '');
  const [bio, setBio] = useState(user?.tutorProfile?.bio || '');
  const [experience, setExperience] = useState(user?.tutorProfile?.experience || '');
  const [hourlyRate, setHourlyRate] = useState(user?.tutorProfile?.hourlyRate || 150000);
  const [proposalNotes, setProposalNotes] = useState('');
  const [selectedClassToApply, setSelectedClassToApply] = useState<OpenClass | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const mockTeacherStats = {
    overview: { totalClasses: 3, completedClasses: 12, totalEarnings: 8400000, avgRating: 4.8 },
    monthlyIncome: [
      { month: 'T1', income: 600000 }, { month: 'T2', income: 900000 },
      { month: 'T3', income: 750000 }, { month: 'T4', income: 1200000 },
      { month: 'T5', income: 1050000 }, { month: 'T6', income: 1350000 },
      { month: 'T7', income: 1500000 }, { month: 'T8', income: 1050000 },
    ],
  };

  const mockActiveClasses: ActiveClass[] = [
    {
      id: 'c-1', status: 'ASSIGNED',
      classRequest: { title: 'Ôn thi THPT Toán 12', subject: 'Toán học', grade: 'Lớp 12', hourlyRate: 100000, sessionsPerWeek: 3, schedule: 'T2, T4, T6 (19:00–21:00)', location: 'Quận Tây Hồ, Hà Nội' },
      student: { user: { fullName: 'Tuệ Vương', phone: '0912345678' } },
    },
    {
      id: 'c-2', status: 'ASSIGNED',
      classRequest: { title: 'Vật lý lớp 11 nâng cao', subject: 'Vật lý', grade: 'Lớp 11', hourlyRate: 120000, sessionsPerWeek: 2, schedule: 'T3, T7 (16:00–18:00)', location: 'Online qua Zoom' },
      student: { user: { fullName: 'Hoàng Mai Chi', phone: '0923456789' } },
    },
  ];

  const mockOpenClasses: OpenClass[] = [
    { id: 'o-1', title: 'Tìm gia sư Hóa học lớp 12', subject: 'Hóa học', grade: 'Lớp 12', hourlyRate: 150000, sessionsPerWeek: 2, schedule: 'Tối thứ 3 và 5', location: 'Quận Đống Đa, Hà Nội', description: 'Cần gia sư có kinh nghiệm luyện thi THPT.' },
    { id: 'o-2', title: 'Gia sư Tiếng Anh giao tiếp cấp tốc', subject: 'Tiếng Anh', grade: 'Đại học', hourlyRate: 200000, sessionsPerWeek: 3, schedule: 'T2, T4, T6 buổi sáng', location: 'Online hoặc quận Hoàng Mai', description: 'Luyện IELTS từ 5.5 lên 7.0 trong 3 tháng.' },
  ];

  useEffect(() => {
    fetchStats(); fetchActiveClasses(); fetchOpenClasses();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/stats/teacher`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTeacherStats(await res.json());
      else setTeacherStats(mockTeacherStats);
    } catch { setTeacherStats(mockTeacherStats); }
  };

  const fetchActiveClasses = async () => {
    try {
      const res = await fetch(`${apiUrl}/classes/active`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setActiveClasses(d.length ? d : mockActiveClasses); }
      else setActiveClasses(mockActiveClasses);
    } catch { setActiveClasses(mockActiveClasses); }
  };

  const fetchOpenClasses = async () => {
    try {
      const res = await fetch(`${apiUrl}/classes/requests`);
      if (res.ok) { const d = await res.json(); setOpenClasses(d.filter((r: any) => r.status === 'OPEN')); }
      else setOpenClasses(mockOpenClasses);
    } catch { setOpenClasses(mockOpenClasses); }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassToApply) return;
    try {
      const res = await fetch(`${apiUrl}/classes/requests/${selectedClassToApply.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: proposalNotes }),
      });
      if (res.ok) setAppliedClassIds(prev => [...prev, selectedClassToApply.id]);
      else { const d = await res.json(); alert(d.message || 'Hồ sơ phải được ADMIN phê duyệt!'); }
    } catch { setAppliedClassIds(prev => [...prev, selectedClassToApply.id]); }
    finally { setSelectedClassToApply(null); setProposalNotes(''); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    const subjects = subjectsText.split(',').map(s => s.trim()).filter(Boolean);
    try {
      const res = await fetch(`${apiUrl}/users/tutor-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subjects, bio, experience, hourlyRate }),
      });
      if (res.ok) { updateUser({ tutorProfile: await res.json() }); setProfileMessage('Cập nhật hồ sơ thành công!'); }
      else setProfileMessage('Lỗi cập nhật hồ sơ.');
    } catch {
      updateUser({ tutorProfile: { id: 'mock-p', subjects, bio, experience, hourlyRate, status: 'PENDING' } });
      setProfileMessage('Lưu thông tin thành công (Giao diện thử nghiệm).');
    }
  };

  const currentStats = teacherStats || mockTeacherStats;

  const incomeChartData = {
    labels: currentStats.monthlyIncome.map((m: any) => m.month),
    datasets: [{
      label: 'Thu nhập (VND)',
      data: currentStats.monthlyIncome.map((m: any) => m.income / 1000),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      tension: 0.45,
      fill: true,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const statCards = [
    { label: 'LỚP ĐANG DẠY', value: String(currentStats.overview.totalClasses), icon: <BookOpen size={20} />, iconBg: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', change: '↑ 1 lớp mới', up: true },
    { label: 'ĐÃ HOÀN THÀNH', value: String(currentStats.overview.completedClasses), icon: <CheckCircle2 size={20} />, iconBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', change: '↑ 8.4%', up: true },
    { label: 'TỔNG THU NHẬP', value: `${(currentStats.overview.totalEarnings / 1000000).toFixed(1)}M đ`, icon: <DollarSign size={20} />, iconBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', change: '↑ 15.3%', up: true },
    { label: 'ĐÁNH GIÁ TB', value: `${currentStats.overview.avgRating} ⭐`, icon: <Star size={20} />, iconBg: 'linear-gradient(135deg,#fee2e2,#fecaca)', change: '+0.2 điểm', up: true },
  ];

  return (
    <div className="ds-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="ds-main-wrapper">
        {/* ── Top Header ── */}
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <div className="ds-topbar-search">
              <Search size={14} className="ds-topbar-search-icon" />
              <input type="text" placeholder="Tìm kiếm lớp học, tài liệu..." className="ds-topbar-search-input" />
              <span className="ds-topbar-search-kbd">⌘K</span>
            </div>
          </div>
          <div className="ds-topbar-right">
            <NotificationPanel />
            <div className="ds-topbar-user">
              <div className="ds-topbar-avatar" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>{user?.fullName?.charAt(0) ?? 'T'}</div>
              <div className="ds-topbar-user-info">
                <span className="ds-topbar-user-name">{user?.fullName ?? 'Gia sư'}</span>
                <span className="ds-topbar-user-role">Gia sư đối tác</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        <main className="ds-content">

          {/* ── STATS TAB ── */}
          {activeTab === 'stats' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Dashboard Gia sư</h1>
                  <p className="ds-page-subtitle">Theo dõi thu nhập, lớp học và hiệu suất giảng dạy của bạn.</p>
                </div>
                <button className="ds-btn-date-range"><Calendar size={14} /><span>T8 2026</span><ChevronDown size={13} /></button>
              </div>

              {/* Stat cards */}
              <div className="ds-stat-grid">
                {statCards.map((c, i) => (
                  <div key={i} className="ds-stat-card" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="ds-stat-card-top">
                      <div>
                        <p className="ds-stat-label">{c.label}</p>
                        <p className="ds-stat-value">{c.value}</p>
                      </div>
                      <div className="ds-stat-icon" style={{ background: c.iconBg }}>{c.icon}</div>
                    </div>
                    <div className="ds-stat-change">
                      <TrendingUp size={13} className="text-emerald-500" />
                      <span className="text-emerald-600">{c.change}</span>
                      <span className="ds-stat-note">so với tháng trước</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Income chart */}
              <div className="ds-card">
                <div className="ds-card-header">
                  <h3 className="ds-card-title">Thu nhập theo tháng</h3>
                  <span className="text-xs text-slate-400 font-medium">Nghìn VND</span>
                </div>
                <div className="ds-chart-area" style={{ height: 260 }}>
                  <Line
                    data={incomeChartData}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      interaction: { mode: 'index', intersect: false },
                      scales: {
                        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => `${v}K` } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1', padding: 10, cornerRadius: 8 },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Active classes quick overview */}
              <div className="ds-card">
                <div className="ds-card-header">
                  <h3 className="ds-card-title">Lớp đang phụ trách</h3>
                  <button onClick={() => setActiveTab('classes')} className="ds-btn-export text-indigo-600">Xem tất cả →</button>
                </div>
                <div className="ds-table-wrap">
                  <table className="ds-table">
                    <thead><tr><th>Tên lớp</th><th>Học viên</th><th>Môn học</th><th>Lịch dạy</th><th>Học phí</th></tr></thead>
                    <tbody>
                      {(activeClasses.length ? activeClasses : mockActiveClasses).slice(0, 3).map(c => (
                        <tr key={c.id}>
                          <td className="ds-table-name">{c.classRequest.title}</td>
                          <td className="ds-table-muted">{c.student.user.fullName}</td>
                          <td><span className="ds-tag ds-tag-blue">{c.classRequest.subject}</span></td>
                          <td className="ds-table-muted">{c.classRequest.schedule}</td>
                          <td className="ds-table-highlight">{c.classRequest.hourlyRate.toLocaleString('vi-VN')}đ/h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CLASSES TAB ── */}
          {activeTab === 'classes' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Lớp đang phụ trách</h1>
                  <p className="ds-page-subtitle">Danh sách các lớp học bạn đang giảng dạy.</p>
                </div>
              </div>
              {activeClasses.length === 0 ? (
                <div className="ds-card p-16 text-center text-slate-400">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">Bạn chưa nhận lớp nào đang diễn ra.</p>
                </div>
              ) : (
                <div className="ds-class-grid">
                  {activeClasses.map((item, i) => (
                    <div key={item.id} className="ds-class-card" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="ds-class-card-head">
                        <span className="ds-tag ds-tag-blue">{item.classRequest.subject} · {item.classRequest.grade}</span>
                        <span className="ds-badge ds-badge-ready">Đang dạy</span>
                      </div>
                      <h4 className="ds-class-card-title">{item.classRequest.title}</h4>
                      <div className="ds-class-card-meta">
                        <div className="ds-class-meta-row">
                          <User size={13} className="text-slate-400" />
                          <span>Học viên: <strong>{item.student.user.fullName}</strong></span>
                        </div>
                        <div className="ds-class-meta-row">
                          <FileText size={13} className="text-slate-400" />
                          <span>SĐT: <strong>{item.student.user.phone}</strong></span>
                        </div>
                        <div className="ds-class-meta-row">
                          <MapPin size={13} className="text-slate-400" />
                          <span className="truncate">{item.classRequest.location}</span>
                        </div>
                        <div className="ds-class-meta-row">
                          <Clock size={13} className="text-slate-400" />
                          <span>{item.classRequest.schedule}</span>
                        </div>
                      </div>
                      <div className="ds-class-card-footer">
                        <span className="ds-class-rate">{item.classRequest.hourlyRate.toLocaleString('vi-VN')}đ<small>/h</small></span>
                        <span className="text-xs text-slate-400">{item.classRequest.sessionsPerWeek} buổi/tuần</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SCHEDULE TAB ── */}
          {activeTab === 'schedule' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Thời khóa biểu giảng dạy</h1>
                  <p className="ds-page-subtitle">Lịch dạy chi tiết theo ngày dựa trên các lớp đang hoạt động.</p>
                </div>
              </div>
              <div className="ds-card p-0 overflow-hidden"><ScheduleView activeClasses={activeClasses as any} role="TEACHER" /></div>
            </div>
          )}

          {/* ── APPLY TAB ── */}
          {activeTab === 'apply' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Lớp mới đang tuyển gia sư</h1>
                  <p className="ds-page-subtitle">Ứng tuyển lớp phù hợp với chuyên môn của bạn.</p>
                </div>
              </div>
              {openClasses.length === 0 ? (
                <div className="ds-card p-16 text-center text-slate-400">
                  <Award size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">Không có lớp mới đăng tuyển hiện tại.</p>
                </div>
              ) : (
                <div className="ds-class-grid">
                  {openClasses.map((req, i) => (
                    <div key={req.id} className="ds-class-card" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="ds-class-card-head">
                        <span className="ds-tag ds-tag-blue">{req.subject} · {req.grade}</span>
                        <span className="ds-table-highlight text-sm font-bold">{req.hourlyRate.toLocaleString('vi-VN')}đ/h</span>
                      </div>
                      <h4 className="ds-class-card-title">{req.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">"{req.description}"</p>
                      <div className="ds-class-card-meta">
                        <div className="ds-class-meta-row"><Clock size={13} className="text-slate-400" /><span>{req.schedule}</span></div>
                        <div className="ds-class-meta-row"><MapPin size={13} className="text-slate-400" /><span>{req.location}</span></div>
                      </div>
                      <button
                        disabled={appliedClassIds.includes(req.id)}
                        onClick={() => setSelectedClassToApply(req)}
                        className="ds-btn-primary w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {appliedClassIds.includes(req.id) ? '✓ Đã nộp đơn' : 'Đăng ký ứng tuyển'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Hồ sơ cá nhân</h1>
                  <p className="ds-page-subtitle">Cập nhật thông tin giảng dạy và kinh nghiệm của bạn.</p>
                </div>
              </div>
              <div className="ds-card max-w-2xl">
                <div className="ds-card-header pb-4 border-b border-slate-100 mb-0">
                  <h3 className="ds-card-title flex items-center gap-2"><User size={16} className="text-indigo-500" />Thông tin Gia sư</h3>
                </div>
                <div className="p-6">
                  {profileMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg mb-4 font-semibold">{profileMessage}</div>
                  )}
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                    <div className="ds-form-group">
                      <label className="ds-label">Môn dạy (cách nhau bởi dấu phẩy)</label>
                      <input type="text" required placeholder="Toán học, Vật lý..." value={subjectsText} onChange={e => setSubjectsText(e.target.value)} className="ds-input" />
                    </div>
                    <div className="ds-form-group">
                      <label className="ds-label">Học phí yêu cầu (đ/giờ)</label>
                      <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="ds-input" />
                    </div>
                    <div className="ds-form-group">
                      <label className="ds-label">Kinh nghiệm giảng dạy</label>
                      <input type="text" required placeholder="3 năm kinh nghiệm..." value={experience} onChange={e => setExperience(e.target.value)} className="ds-input" />
                    </div>
                    <div className="ds-form-group">
                      <label className="ds-label">Giới thiệu chi tiết</label>
                      <textarea required rows={4} placeholder="Giới thiệu bản thân, kỹ năng sư phạm..." value={bio} onChange={e => setBio(e.target.value)} className="ds-input resize-none" />
                    </div>
                    <button type="submit" className="ds-btn-primary"><Edit size={15} /><span>Lưu hồ sơ</span></button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── OTHER TABS ── */}
          {activeTab === 'materials' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Học liệu & Đề thi</h1><p className="ds-page-subtitle">Tải đề PDF và tạo phiếu trắc nghiệm tự động.</p></div></div><MaterialsView /></div>}
          {activeTab === 'vocab-quiz' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Từ vựng & Quiz</h1><p className="ds-page-subtitle">Quản lý bộ từ vựng và bài quiz cho học viên.</p></div></div><VocabQuizView /></div>}
          {activeTab === 'exam-hall' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Phòng thi thử</h1><p className="ds-page-subtitle">Tạo và quản lý bài thi thử cho học viên.</p></div></div><ExamHallView /></div>}
          {activeTab === 'homework' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Quản lý Bài tập</h1><p className="ds-page-subtitle">Giao và theo dõi bài tập về nhà.</p></div></div><HomeworkView /></div>}
          {activeTab === 'attendance-log' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Điểm danh & Báo cáo</h1><p className="ds-page-subtitle">Ghi nhận điểm danh và xem báo cáo buổi học.</p></div></div><AttendanceLogView /></div>}
          {activeTab === 'community' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Cộng đồng & Hỏi đáp</h1><p className="ds-page-subtitle">Trao đổi kiến thức với cộng đồng gia sư.</p></div></div><CommunityHubView /></div>}
          {activeTab === 'salary' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Bảng lương của tôi</h1>
                  <p className="ds-page-subtitle">Xem lịch sử nhận lương và tổng thu nhập từ trung tâm.</p>
                </div>
              </div>
              <TeacherSalaryView />
            </div>
          )}

        </main>
      </div>

      {/* Apply Modal */}
      {selectedClassToApply && (
        <div className="ds-modal-overlay">
          <form onSubmit={handleApplySubmit} className="ds-modal">
            <div className="ds-modal-header">
              <h3 className="ds-modal-title">Nộp đơn ứng tuyển</h3>
              <button type="button" onClick={() => setSelectedClassToApply(null)} className="ds-modal-close"><X size={15} /></button>
            </div>
            <div className="ds-modal-body">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 text-xs font-medium">
                Lớp: <strong>{selectedClassToApply.title}</strong><br />
                Môn: {selectedClassToApply.subject} ({selectedClassToApply.grade}) · {selectedClassToApply.hourlyRate.toLocaleString('vi-VN')}đ/h
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Lời giới thiệu / Đề xuất</label>
                <textarea required rows={4} placeholder="Giới thiệu kinh nghiệm giảng dạy môn này..." value={proposalNotes} onChange={e => setProposalNotes(e.target.value)} className="ds-input resize-none" />
              </div>
            </div>
            <div className="ds-modal-footer">
              <button type="button" onClick={() => setSelectedClassToApply(null)} className="ds-btn-secondary">Hủy</button>
              <button type="submit" className="ds-btn-primary">Nộp đơn ứng tuyển</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
