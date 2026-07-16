import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BookOpen, DollarSign, Star, FileText, CheckCircle2, User, PlusCircle, Edit, X } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ActiveClass {
  id: string;
  classRequest: {
    title: string;
    subject: string;
    grade: string;
    hourlyRate: number;
    sessionsPerWeek: number;
    schedule: string;
    location: string;
  };
  student: {
    user: {
      fullName: string;
      phone: string;
    };
  };
  status: string;
}

interface OpenClass {
  id: string;
  title: string;
  subject: string;
  grade: string;
  hourlyRate: number;
  sessionsPerWeek: number;
  schedule: string;
  location: string;
  description: string;
}

export const TeacherDashboard: React.FC = () => {
  const { apiUrl, token, user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
  // Dashboard States
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);
  const [openClasses, setOpenClasses] = useState<OpenClass[]>([]);
  const [appliedClassIds, setAppliedClassIds] = useState<string[]>([]);
  
  // Form States for profile
  const [subjectsText, setSubjectsText] = useState(user?.tutorProfile?.subjects?.join(', ') || '');
  const [bio, setBio] = useState(user?.tutorProfile?.bio || '');
  const [experience, setExperience] = useState(user?.tutorProfile?.experience || '');
  const [hourlyRate, setHourlyRate] = useState(user?.tutorProfile?.hourlyRate || 150000);
  const [proposalNotes, setProposalNotes] = useState('');
  const [selectedClassToApply, setSelectedClassToApply] = useState<OpenClass | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Mock Fallbacks
  const mockTeacherStats = {
    overview: {
      totalClasses: 1,
      completedClasses: 0,
      totalEarnings: 1600000,
      avgRating: 5.0,
    },
    monthlyIncome: [
      { month: 'Tháng 3', income: 400000 },
      { month: 'Tháng 4', income: 800000 },
      { month: 'Tháng 5', income: 1200000 },
      { month: 'Tháng 6', income: 1600000 },
    ],
  };

  const mockActiveClasses: ActiveClass[] = [
    {
      id: 'c-act-1',
      classRequest: {
        title: 'Luyện thi cấp tốc Hóa học lớp 12',
        subject: 'Hóa học',
        grade: 'Lớp 12',
        hourlyRate: 180000,
        sessionsPerWeek: 2,
        schedule: 'Sáng thứ 7 và Chủ nhật (8:30 - 10:30)',
        location: 'Online qua Zoom',
      },
      student: {
        user: { fullName: 'Phạm Minh Quân', phone: '0945678901' }
      },
      status: 'ASSIGNED'
    }
  ];

  const mockOpenClasses: OpenClass[] = [
    {
      id: 'r-1',
      title: 'Tìm Gia sư Toán 12 ôn thi THPT Quốc Gia',
      subject: 'Toán học',
      grade: 'Lớp 12',
      hourlyRate: 200000,
      sessionsPerWeek: 2,
      schedule: 'Tối thứ 3 và tối thứ 5 (19:30 - 21:30)',
      location: 'Quận Tây Hồ, Hà Nội',
      description: 'Cần tìm gia sư dạy Toán lớp 12 lấy lại gốc hình học và ôn luyện đề thi đại học.'
    },
    {
      id: 'r-2',
      title: 'Gia sư Tiếng Anh lớp 9 luyện thi lên lớp 10',
      subject: 'Tiếng Anh',
      grade: 'Lớp 9',
      hourlyRate: 180000,
      sessionsPerWeek: 3,
      schedule: 'Chiều thứ 2, 4, 6 (15:00 - 17:00)',
      location: 'Quận Hoàn Kiếm, Hà Nội',
      description: 'Luyện đề thi tuyển sinh lớp 9 lên lớp 10 công lập, tập trung ngữ pháp và kỹ năng đọc hiểu.'
    }
  ];

  useEffect(() => {
    fetchStats();
    fetchActiveClasses();
    fetchOpenClasses();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/stats/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeacherStats(data);
      } else {
        setTeacherStats(mockTeacherStats);
      }
    } catch {
      setTeacherStats(mockTeacherStats);
    }
  };

  const fetchActiveClasses = async () => {
    try {
      const res = await fetch(`${apiUrl}/classes/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveClasses(data);
      } else {
        setActiveClasses(mockActiveClasses);
      }
    } catch {
      setActiveClasses(mockActiveClasses);
    }
  };

  const fetchOpenClasses = async () => {
    try {
      const res = await fetch(`${apiUrl}/classes/requests`);
      if (res.ok) {
        const data = await res.json();
        setOpenClasses(data.filter((r: any) => r.status === 'OPEN'));
      } else {
        setOpenClasses(mockOpenClasses);
      }
    } catch {
      setOpenClasses(mockOpenClasses);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassToApply) return;

    try {
      const res = await fetch(`${apiUrl}/classes/requests/${selectedClassToApply.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes: proposalNotes })
      });
      if (res.ok) {
        setAppliedClassIds(prev => [...prev, selectedClassToApply.id]);
        alert('Nộp đơn ứng tuyển thành công! Vui lòng chờ phê duyệt từ học sinh.');
      } else {
        const data = await res.json();
        alert(data.message || 'Hồ sơ của bạn phải được ADMIN phê duyệt mới có thể nhận lớp!');
      }
    } catch {
      // Mock success for standalone frontend preview
      setAppliedClassIds(prev => [...prev, selectedClassToApply.id]);
      alert('Ứng tuyển thành công (Giao diện thử nghiệm)!');
    } finally {
      setSelectedClassToApply(null);
      setProposalNotes('');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    const subjects = subjectsText.split(',').map((s: string) => s.trim()).filter(Boolean);

    try {
      const res = await fetch(`${apiUrl}/users/tutor-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subjects, bio, experience, hourlyRate })
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        updateUser({ tutorProfile: updatedProfile });
        setProfileMessage('Cập nhật hồ sơ thành công! Hệ thống đang chờ Admin phê duyệt lại nếu có thay đổi.');
      } else {
        setProfileMessage('Lỗi cập nhật hồ sơ từ hệ thống.');
      }
    } catch {
      // Offline fallback mock save
      const mockProfile = { id: 'mock-p', subjects, bio, experience, hourlyRate, status: 'PENDING' };
      updateUser({ tutorProfile: mockProfile });
      setProfileMessage('Lưu thông tin thành công (Giao diện thử nghiệm).');
    }
  };

  // Income chart settings
  const currentStats = teacherStats || mockTeacherStats;
  const incomeChartData = {
    labels: currentStats.monthlyIncome.map((m: any) => m.month),
    datasets: [
      {
        label: 'Thu nhập cá nhân (VND)',
        data: currentStats.monthlyIncome.map((m: any) => m.income),
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)] w-full relative bg-slate-50 text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-8 relative z-10 animate-fade-in-up">
        <div className="border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Gia sư Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-550 mt-1">Theo dõi hoạt động giảng dạy, thống kê thu nhập và tìm lớp mới phù hợp</p>
        </div>

        {/* Tab Stats */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Lớp đang dạy', count: currentStats.overview.totalClasses, icon: <BookOpen size={20} />, bg: 'bg-sky-50 text-sky-655 border-sky-100' },
                { label: 'Lớp đã kết thúc', count: currentStats.overview.completedClasses, icon: <CheckCircle2 size={20} />, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                { label: 'Tổng thu nhập', count: `${currentStats.overview.totalEarnings.toLocaleString('vi-VN')}đ`, icon: <DollarSign size={20} />, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                { label: 'Đánh giá', count: `${currentStats.overview.avgRating} / 5`, icon: <Star size={20} />, bg: 'bg-amber-50 text-amber-600 border-amber-100' },
              ].map((card, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group shadow-sm">
                  <div className={`p-3.5 rounded-xl ${card.bg} border shadow-inner`}>
                    {card.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">{card.label}</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5 block">{card.count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Income chart */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
              <h3 className="font-bold text-slate-805 text-xs sm:text-sm tracking-wide">Biểu đồ Thu nhập tích lũy theo tháng</h3>
              <div className="h-72 w-full flex items-center justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                <Line
                  data={incomeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 9 } } },
                      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } }
                    },
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Classes */}
        {activeTab === 'classes' && (
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase text-slate-450">Lớp học đang phụ trách</h3>
            {activeClasses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                Bạn chưa nhận lớp nào đang diễn ra.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeClasses.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-sky-305 hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-600">
                        {item.classRequest.subject} - {item.classRequest.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-600">Đang học</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{item.classRequest.title}</h4>
                    
                    <div className="flex flex-col gap-2.5 text-xs text-slate-555 border-t border-slate-100 pt-4 mt-2 bg-slate-50 p-3.5 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span>Học viên:</span>
                        <span className="font-bold text-slate-700">{item.student.user.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Số điện thoại:</span>
                        <span className="font-bold text-slate-700">{item.student.user.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Địa điểm:</span>
                        <span className="font-bold text-slate-700 truncate max-w-[200px]">{item.classRequest.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Lịch dạy:</span>
                        <span className="font-bold text-slate-700 text-right">{item.classRequest.schedule}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Apply (Apply classes) */}
        {activeTab === 'apply' && (
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase text-slate-450">Lớp mới đang tuyển gia sư</h3>
            {openClasses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                Không có lớp mới đăng tuyển tại thời điểm này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {openClasses.map((req) => (
                  <div key={req.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden hover:border-sky-305 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-600">
                        {req.subject} ({req.grade})
                      </span>
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {req.hourlyRate.toLocaleString('vi-VN')}đ/h
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{req.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{req.description}"
                    </p>

                    <div className="text-xs text-slate-505 flex flex-col gap-2 border-t border-slate-100 pt-3">
                      <div>Lịch học: <strong className="text-slate-700 font-bold">{req.schedule}</strong></div>
                      <div>Địa điểm: <strong className="text-slate-700 font-bold">{req.location}</strong></div>
                    </div>

                    <button
                      disabled={appliedClassIds.includes(req.id)}
                      onClick={() => setSelectedClassToApply(req)}
                      className="w-full mt-2 py-2.5 text-xs font-bold text-white btn-gradient rounded-lg shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
                    >
                      {appliedClassIds.includes(req.id) ? 'Đã nộp đơn ứng tuyển' : 'Đăng ký ứng tuyển'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl max-w-2xl shadow-md relative overflow-hidden">
            <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="text-sky-500" />
              Cập nhật thông tin gia sư
            </h3>

            {profileMessage && (
              <div className="p-4 bg-sky-50 border border-sky-100 text-sky-600 text-xs rounded-xl mb-6 font-semibold animate-pulse">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Môn dạy (Cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  required
                  placeholder="Toán học, Vật lý, Hóa học"
                  value={subjectsText}
                  onChange={(e) => setSubjectsText(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mức lương yêu cầu (đ/giờ)</label>
                <input
                  type="number"
                  required
                  placeholder="150000"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kinh nghiệm giảng dạy</label>
                <input
                  type="text"
                  required
                  placeholder="3 năm kinh nghiệm gia sư cấp 3..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giới thiệu chi tiết</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Giới thiệu bản thân, kỹ năng sư phạm và thành tích nổi bật của bạn..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient shadow-md cursor-pointer active:scale-95"
              >
                Lưu thông tin hồ sơ
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Proposal Notes Application Modal */}
      {selectedClassToApply && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleApplySubmit} className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Nộp đơn ứng tuyển lớp học</h3>
              <button
                type="button"
                onClick={() => setSelectedClassToApply(null)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="text-xs bg-sky-50 border border-sky-100 p-4 rounded-xl text-sky-600 font-semibold leading-relaxed">
                Lớp: <strong className="text-slate-800">{selectedClassToApply.title}</strong>
                <br />
                Môn: {selectedClassToApply.subject} ({selectedClassToApply.grade})
                <br />
                Học phí đề xuất: <span className="font-bold text-sky-600">{selectedClassToApply.hourlyRate.toLocaleString('vi-VN')} đ/h</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Lời giới thiệu/Đề xuất</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Gửi lời giới thiệu kèm kinh nghiệm giảng dạy môn học này đến phụ huynh để tăng cơ hội nhận lớp..."
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-xs sm:text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedClassToApply(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
              >
                Nộp đơn ứng tuyển
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
