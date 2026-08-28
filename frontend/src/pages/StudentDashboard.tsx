import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import NotificationPanel from '../components/NotificationPanel';
import {
  BookOpen, PlusCircle, FileText, Star, MapPin, Calendar,
  Clock, DollarSign, X, Check, Eye, Search, ChevronDown,
  TrendingUp, GraduationCap, Award, Users,
} from 'lucide-react';
import { ScheduleView } from '../components/ScheduleView';
import MaterialsView from '../components/MaterialsView';
import VocabQuizView from '../components/VocabQuizView';
import ExamHallView from '../components/ExamHallView';
import HomeworkView from '../components/HomeworkView';
import AttendanceLogView from '../components/AttendanceLogView';
import CommunityHubView from '../components/CommunityHubView';

interface ActiveClass {
  id: string; tutorId: string;
  classRequest: {
    title: string; subject: string; grade: string; hourlyRate: number;
    sessionsPerWeek: number; schedule: string; location: string;
  };
  tutor: { id: string; user: { fullName: string; phone: string } };
  status: string;
}

interface Application {
  id: string; notes: string; status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  tutor: { id: string; experience: string; hourlyRate: number; user: { fullName: string; avatar?: string; phone: string } };
}

interface StudentRequest {
  id: string; title: string; subject: string; grade: string;
  hourlyRate: number; sessionsPerWeek: number; schedule: string;
  location: string; status: string; applications: Application[];
}

export const StudentDashboard: React.FC = () => {
  const { apiUrl, token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');

  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Lớp 12');
  const [hourlyRate, setHourlyRate] = useState(150000);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [selectedTutorForFeedback, setSelectedTutorForFeedback] = useState<ActiveClass | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const mockActiveClasses: ActiveClass[] = [
    {
      id: 'c-act-1', tutorId: 'tut-1', status: 'ASSIGNED',
      classRequest: { title: 'Lớp Toán 12 - Ôn thi THPT Quốc Gia', subject: 'Toán học', grade: 'Lớp 12', hourlyRate: 100000, sessionsPerWeek: 3, schedule: 'T2, T4, T6 (19:00–21:00)', location: 'Quận Tây Hồ, Hà Nội' },
      tutor: { id: 'tut-1', user: { fullName: 'Dư Hoàng Huy', phone: '0327169519' } },
    },
    {
      id: 'c-act-2', tutorId: 'tut-1', status: 'ASSIGNED',
      classRequest: { title: 'Vật lý 12 - Củng cố kiến thức trọng tâm', subject: 'Vật lý', grade: 'Lớp 12', hourlyRate: 100000, sessionsPerWeek: 3, schedule: 'T3, T5, T7 (16:00–18:00)', location: 'Online qua Zoom' },
      tutor: { id: 'tut-1', user: { fullName: 'Dư Hoàng Huy', phone: '0327169519' } },
    },
  ];

  const mockRequests: StudentRequest[] = [
    {
      id: 'r-1', title: 'Tìm Gia sư Toán 12 ôn thi THPT Quốc Gia', subject: 'Toán học',
      grade: 'Lớp 12', hourlyRate: 100000, sessionsPerWeek: 2, schedule: 'Tối T3 và T5 (19:30–21:30)',
      location: 'Quận Tây Hồ, Hà Nội', status: 'OPEN',
      applications: [{
        id: 'app-1', notes: 'Chào em, anh là Dư Hoàng Huy. Anh tự tin có thể hỗ trợ em ôn thi đạt điểm mong muốn.',
        status: 'PENDING',
        tutor: { id: 'tut-1', experience: '4 năm kinh nghiệm dạy Toán-Lý-Hóa cấp 2, 3', hourlyRate: 100000, user: { fullName: 'Dư Hoàng Huy', phone: '0327169519', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' } }
      }],
    },
  ];

  useEffect(() => { fetchActiveClasses(); fetchStudentRequests(); }, [activeTab]);

  const fetchActiveClasses = async () => {
    try {
      const res = await fetch(apiUrl + '/classes/active', { headers: { Authorization: 'Bearer ' + token } });
      if (res.ok) { const d = await res.json(); setActiveClasses(d.length ? d : mockActiveClasses); }
      else setActiveClasses(mockActiveClasses);
    } catch { setActiveClasses(mockActiveClasses); }
  };

  const fetchStudentRequests = async () => {
    try {
      const res = await fetch(apiUrl + '/classes/student/requests', { headers: { Authorization: 'Bearer ' + token } });
      if (res.ok) { const d = await res.json(); setStudentRequests(d.length ? d : mockRequests); }
      else setStudentRequests(mockRequests);
    } catch { setStudentRequests(mockRequests); }
  };

  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl + '/classes/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ title, subject, grade, hourlyRate, sessionsPerWeek, schedule, location, description }),
      });
      if (res.ok) { alert('Đăng tin thành công!'); setTitle(''); setSchedule(''); setLocation(''); setDescription(''); setActiveTab('requests'); }
      else alert('Lỗi đăng tin từ máy chủ.');
    } catch {
      const mockNew: StudentRequest = { id: 'mock-r-' + Date.now(), title, subject, grade, hourlyRate, sessionsPerWeek, schedule, location, status: 'OPEN', applications: [] };
      setStudentRequests(prev => [mockNew, ...prev]);
      alert('Đăng tin thành công (Giao diện thử nghiệm)!');
      setTitle(''); setSchedule(''); setLocation(''); setDescription(''); setActiveTab('requests');
    }
  };

  const handleApplication = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await fetch(apiUrl + '/classes/applications/' + appId, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ status }),
      });
    } catch { /* continue */ }
    alert(status === 'ACCEPTED' ? 'Đã phê duyệt gia sư thành công!' : 'Đã từ chối đơn gia sư.');
    setSelectedRequest(null); fetchStudentRequests();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorForFeedback) return;
    try {
      await fetch(apiUrl + '/classes/tutors/' + selectedTutorForFeedback.tutorId + '/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ rating, comment }),
      });
    } catch { /* continue */ }
    alert('Gửi đánh giá thành công!');
    setSelectedTutorForFeedback(null); setComment(''); setRating(5);
  };

  const statCards = [
    { label: 'LỚP ĐANG HỌC', value: String(activeClasses.length || 2), icon: <BookOpen size={20} />, iconBg: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)' },
    { label: 'YÊU CẦU ĐÃ ĐĂNG', value: String(studentRequests.length || 1), icon: <FileText size={20} />, iconBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
    { label: 'GIA SƯ ĐÃ LÀM VIỆC', value: '3', icon: <Users size={20} />, iconBg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
    { label: 'TỔNG ĐÁNH GIÁ', value: '4.9 ⭐', icon: <Star size={20} />, iconBg: 'linear-gradient(135deg,#fee2e2,#fecaca)' },
  ];

  return (
    <div className="ds-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="ds-main-wrapper">
        {/* ── Topbar ── */}
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <div className="ds-topbar-search">
              <Search size={14} className="ds-topbar-search-icon" />
              <input type="text" placeholder="Tìm gia sư, lớp học, tài liệu..." className="ds-topbar-search-input" />
              <span className="ds-topbar-search-kbd">⌘K</span>
            </div>
          </div>
          <div className="ds-topbar-right">
            <NotificationPanel />
            <div className="ds-topbar-user">
              <div className="ds-topbar-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>{user?.fullName?.charAt(0) ?? 'S'}</div>
              <div className="ds-topbar-user-info">
                <span className="ds-topbar-user-name">{user?.fullName ?? 'Học viên'}</span>
                <span className="ds-topbar-user-role">Học viên</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        <main className="ds-content">

          {/* ── CLASSES TAB ── */}
          {activeTab === 'classes' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header">
                <div>
                  <h1 className="ds-page-title">Dashboard Học viên</h1>
                  <p className="ds-page-subtitle">Xem lịch học, quản lý gia sư và theo dõi tiến độ học tập.</p>
                </div>
                <button onClick={() => setActiveTab('post-request')} className="ds-btn-primary"><PlusCircle size={15} /><span>Đăng tin tìm gia sư</span></button>
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
                      <span className="text-emerald-600">↑ Hoạt động tốt</span>
                      <span className="ds-stat-note">tháng này</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active classes */}
              <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Lớp đang theo học</h2>
                {activeClasses.length === 0 ? (
                  <div className="ds-card p-16 text-center text-slate-400">
                    <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">Bạn chưa tham gia lớp học nào.</p>
                    <button onClick={() => setActiveTab('post-request')} className="ds-btn-primary mt-4 mx-auto"><PlusCircle size={14} />Đăng tin tìm gia sư</button>
                  </div>
                ) : (
                  <div className="ds-class-grid">
                    {activeClasses.map((item, i) => (
                      <div key={item.id} className="ds-class-card" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="ds-class-card-head">
                          <span className="ds-tag ds-tag-blue">{item.classRequest.subject} · {item.classRequest.grade}</span>
                          <span className="ds-badge ds-badge-ready">Đang học</span>
                        </div>
                        <h4 className="ds-class-card-title">{item.classRequest.title}</h4>
                        <div className="ds-class-card-meta">
                          <div className="ds-class-meta-row"><GraduationCap size={13} className="text-slate-400" /><span>Gia sư: <strong>{item.tutor.user.fullName}</strong></span></div>
                          <div className="ds-class-meta-row"><FileText size={13} className="text-slate-400" /><span>SĐT: <strong>{item.tutor.user.phone}</strong></span></div>
                          <div className="ds-class-meta-row"><MapPin size={13} className="text-slate-400" /><span className="truncate">{item.classRequest.location}</span></div>
                          <div className="ds-class-meta-row"><Clock size={13} className="text-slate-400" /><span>{item.classRequest.schedule}</span></div>
                        </div>
                        <div className="ds-class-card-footer">
                          <span className="ds-class-rate">{item.classRequest.hourlyRate.toLocaleString('vi-VN')}đ<small>/h</small></span>
                          <button onClick={() => setSelectedTutorForFeedback(item)} className="ds-action-btn ds-action-btn-primary"><Star size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SCHEDULE TAB ── */}
          {activeTab === 'schedule' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header"><div><h1 className="ds-page-title">Thời khóa biểu học tập</h1><p className="ds-page-subtitle">Lịch học chi tiết theo ngày.</p></div></div>
              <div className="ds-card p-0 overflow-hidden"><ScheduleView activeClasses={activeClasses as any} role="STUDENT" /></div>
            </div>
          )}

          {/* ── POST REQUEST TAB ── */}
          {activeTab === 'post-request' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header"><div><h1 className="ds-page-title">Đăng tin tìm gia sư</h1><p className="ds-page-subtitle">Mô tả yêu cầu và chờ gia sư phù hợp ứng tuyển.</p></div></div>
              <div className="ds-card max-w-2xl">
                <div className="ds-card-header pb-4 border-b border-slate-100">
                  <h3 className="ds-card-title flex items-center gap-2"><PlusCircle size={16} className="text-indigo-500" />Thông tin yêu cầu</h3>
                </div>
                <div className="p-6">
                  <form onSubmit={handlePostRequest} className="flex flex-col gap-5">
                    <div className="ds-form-group">
                      <label className="ds-label">Tiêu đề yêu cầu</label>
                      <input type="text" required placeholder="Tìm gia sư Toán lớp 12 luyện thi THPT..." value={title} onChange={e => setTitle(e.target.value)} className="ds-input" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="ds-form-group">
                        <label className="ds-label">Môn học</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)} className="ds-input cursor-pointer">
                          {['Toán học','Vật lý','Hóa học','Tiếng Anh','Ngữ văn','Sinh học','Tin học'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="ds-form-group">
                        <label className="ds-label">Trình độ / Lớp</label>
                        <input type="text" required placeholder="Lớp 12" value={grade} onChange={e => setGrade(e.target.value)} className="ds-input" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="ds-form-group">
                        <label className="ds-label">Học phí đề xuất (đ/giờ)</label>
                        <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="ds-input" />
                      </div>
                      <div className="ds-form-group">
                        <label className="ds-label">Số buổi / tuần</label>
                        <input type="number" required value={sessionsPerWeek} onChange={e => setSessionsPerWeek(Number(e.target.value))} className="ds-input" />
                      </div>
                    </div>
                    <div className="ds-form-group">
                      <label className="ds-label">Lịch biểu</label>
                      <input type="text" required placeholder="Tối thứ 2 và chiều thứ 6..." value={schedule} onChange={e => setSchedule(e.target.value)} className="ds-input" />
                    </div>
                    <div className="ds-form-group">
                      <label className="ds-label">Địa điểm học</label>
                      <input type="text" required placeholder="Quận Cầu Giấy, Hà Nội hoặc Online" value={location} onChange={e => setLocation(e.target.value)} className="ds-input" />
                    </div>
                    <div className="ds-form-group">
                      <label className="ds-label">Mô tả yêu cầu</label>
                      <textarea required rows={4} placeholder="Nêu rõ mục tiêu học, yêu cầu gia sư..." value={description} onChange={e => setDescription(e.target.value)} className="ds-input resize-none" />
                    </div>
                    <button type="submit" className="ds-btn-primary justify-center"><PlusCircle size={15} />Đăng tin ngay</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── REQUESTS TAB ── */}
          {activeTab === 'requests' && (
            <div className="ds-page ds-page-animate">
              <div className="ds-page-header">
                <div><h1 className="ds-page-title">Yêu cầu gia sư đã đăng</h1><p className="ds-page-subtitle">Xem trạng thái và danh sách gia sư ứng tuyển.</p></div>
                <button onClick={() => setActiveTab('post-request')} className="ds-btn-primary"><PlusCircle size={15} /><span>Đăng tin mới</span></button>
              </div>
              {studentRequests.length === 0 ? (
                <div className="ds-card p-16 text-center text-slate-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">Bạn chưa đăng tin tìm gia sư nào.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {studentRequests.map((req, i) => (
                    <div key={req.id} className="ds-card" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex gap-2 flex-wrap">
                            <span className="ds-tag ds-tag-blue">{req.subject} · {req.grade}</span>
                            <span className={`ds-badge ${req.status === 'OPEN' ? 'ds-badge-info' : 'ds-badge-processing'}`}>
                              {req.status === 'OPEN' ? 'Đang tuyển gia sư' : 'Đã giao lớp'}
                            </span>
                          </div>
                          {req.status === 'OPEN' && req.applications.length > 0 && (
                            <button onClick={() => setSelectedRequest(req)} className="ds-btn-primary" style={{ padding: '7px 14px', fontSize: 11 }}>
                              <Eye size={14} /><span>Xem ứng cử viên ({req.applications.length})</span>
                            </button>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-3">{req.title}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div><DollarSign size={12} className="inline mr-1 text-indigo-400" /><strong className="text-slate-700">{req.hourlyRate.toLocaleString('vi-VN')}đ/h</strong></div>
                          <div><Calendar size={12} className="inline mr-1 text-indigo-400" /><strong className="text-slate-700">{req.sessionsPerWeek} buổi/tuần</strong></div>
                          <div className="truncate"><Clock size={12} className="inline mr-1 text-indigo-400" /><strong className="text-slate-700">{req.schedule}</strong></div>
                          <div className="truncate"><MapPin size={12} className="inline mr-1 text-indigo-400" /><strong className="text-slate-700">{req.location}</strong></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── OTHER TABS ── */}
          {activeTab === 'materials' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Kho học liệu & Phòng luyện đề</h1><p className="ds-page-subtitle">Luyện đề tự chấm điểm trực tuyến.</p></div></div><MaterialsView /></div>}
          {activeTab === 'vocab-quiz' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Từ vựng & Quiz</h1><p className="ds-page-subtitle">Luyện từ vựng và làm bài quiz nhanh.</p></div></div><VocabQuizView /></div>}
          {activeTab === 'exam-hall' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Phòng thi thử</h1><p className="ds-page-subtitle">Thi thử với đề thi chuẩn hóa.</p></div></div><ExamHallView /></div>}
          {activeTab === 'homework' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Bài tập về nhà</h1><p className="ds-page-subtitle">Xem và nộp bài tập từ gia sư.</p></div></div><HomeworkView /></div>}
          {activeTab === 'attendance-log' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Lịch sử điểm danh</h1><p className="ds-page-subtitle">Theo dõi lịch sử buổi học.</p></div></div><AttendanceLogView /></div>}
          {activeTab === 'community' && <div className="ds-page ds-page-animate"><div className="ds-page-header"><div><h1 className="ds-page-title">Cộng đồng học tập</h1><p className="ds-page-subtitle">Hỏi đáp và chia sẻ với cộng đồng.</p></div></div><CommunityHubView /></div>}

        </main>
      </div>

      {/* Applications Modal */}
      {selectedRequest && (
        <div className="ds-modal-overlay">
          <div className="ds-modal" style={{ maxWidth: 640 }}>
            <div className="ds-modal-header">
              <div>
                <h3 className="ds-modal-title">Gia sư ứng tuyển</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedRequest.title}</p>
              </div>
              <button className="ds-modal-close" onClick={() => setSelectedRequest(null)}><X size={15} /></button>
            </div>
            <div className="ds-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {selectedRequest.applications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Chưa có gia sư nào ứng tuyển.</div>
              ) : (
                selectedRequest.applications.map(app => (
                  <div key={app.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 items-center">
                        <img src={app.tutor.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} alt={app.tutor.user.fullName} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{app.tutor.user.fullName}</h4>
                          <span className="text-xs text-indigo-600 font-semibold">{app.tutor.experience}</span>
                        </div>
                      </div>
                      <span className="ds-tag ds-tag-blue text-xs">{app.tutor.hourlyRate.toLocaleString('vi-VN')}đ/h</span>
                    </div>
                    <p className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-slate-100">"{app.notes}"</p>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleApplication(app.id, 'REJECTED')} className="ds-action-btn ds-action-btn-danger" style={{ width: 'auto', padding: '6px 14px', borderRadius: 8, gap: 4, display: 'flex', alignItems: 'center', fontSize: 12 }}>
                        <X size={14} /><span>Từ chối</span>
                      </button>
                      <button onClick={() => handleApplication(app.id, 'ACCEPTED')} className="ds-btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
                        <Check size={14} /><span>Phê duyệt</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedTutorForFeedback && (
        <div className="ds-modal-overlay">
          <form onSubmit={handleFeedbackSubmit} className="ds-modal">
            <div className="ds-modal-header">
              <h3 className="ds-modal-title">Đánh giá Gia sư</h3>
              <button type="button" className="ds-modal-close" onClick={() => setSelectedTutorForFeedback(null)}><X size={15} /></button>
            </div>
            <div className="ds-modal-body">
              <div className="text-center text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-2 rounded-lg uppercase tracking-wide">
                Gia sư: {selectedTutorForFeedback.tutor.user.fullName}
              </div>
              <div className="flex justify-center gap-2 py-2">
                {[1,2,3,4,5].map(star => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95">
                    <Star size={28} className={star <= rating ? 'text-amber-400' : 'text-slate-300'} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Ý kiến phản hồi</label>
                <textarea required rows={4} placeholder="Chia sẻ cảm nhận về gia sư và chất lượng giảng dạy..." value={comment} onChange={e => setComment(e.target.value)} className="ds-input resize-none" />
              </div>
            </div>
            <div className="ds-modal-footer">
              <button type="button" onClick={() => setSelectedTutorForFeedback(null)} className="ds-btn-secondary">Hủy</button>
              <button type="submit" className="ds-btn-primary">Gửi đánh giá</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
