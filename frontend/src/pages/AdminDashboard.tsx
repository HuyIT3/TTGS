import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Line, Doughnut } from 'react-chartjs-2';
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
} from 'chart.js';
import { Users, GraduationCap, BookOpen, DollarSign, Check, X, ShieldAlert } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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
}

export const AdminDashboard: React.FC = () => {
  const { apiUrl, token } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
  // States
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [tutorsList, setTutorsList] = useState<TutorItem[]>([]);
  const [requestsList, setRequestsList] = useState<ClassRequestItem[]>([]);

  // Mock Fallbacks
  const mockStats = {
    overview: {
      totalUsers: 6,
      totalTutors: 3,
      totalStudents: 2,
      activeClasses: 1,
      totalRevenue: 2400000,
    },
    dailyStats: [
      { date: '2026-06-30', revenue: 300000 },
      { date: '2026-07-01', revenue: 450000 },
      { date: '2026-07-02', revenue: 200000 },
      { date: '2026-07-03', revenue: 600000 },
      { date: '2026-07-04', revenue: 350000 },
      { date: '2026-07-05', revenue: 500000 },
      { date: '2026-07-06', revenue: 700000 },
    ],
    subjectStats: [
      { subject: 'Toán học', count: 3 },
      { subject: 'Tiếng Anh', count: 2 },
      { subject: 'Vật lý', count: 1 },
      { subject: 'Hóa học', count: 1 },
    ],
  };

  const mockUsers: UserItem[] = [
    { id: 'u-1', email: 'admin@huyhoang.com', fullName: 'Huy Hoàng Admin', role: 'ADMIN', isActive: true },
    { id: 'u-2', email: 'tutor1@huyhoang.com', fullName: 'Nguyễn Văn Hùng', role: 'TEACHER', isActive: true },
    { id: 'u-3', email: 'tutor2@huyhoang.com', fullName: 'Trần Thị Lan', role: 'TEACHER', isActive: true },
    { id: 'u-4', email: 'tutor3@huyhoang.com', fullName: 'Lê Hoàng Nam', role: 'TEACHER', isActive: true },
    { id: 'u-5', email: 'student1@huyhoang.com', fullName: 'Phạm Minh Quân', role: 'STUDENT', isActive: true },
    { id: 'u-6', email: 'student2@huyhoang.com', fullName: 'Hoàng Mai Chi', role: 'STUDENT', isActive: false },
  ];

  const mockTutors: TutorItem[] = [
    {
      id: 'tut-1',
      subjects: ['Toán học', 'Vật lý'],
      experience: '5 năm kinh nghiệm gia sư cấp 3',
      hourlyRate: 200000,
      status: 'APPROVED',
      user: { fullName: 'Nguyễn Văn Hùng', email: 'tutor1@huyhoang.com', phone: '0912345678' }
    },
    {
      id: 'tut-2',
      subjects: ['Tiếng Anh', 'Ngữ văn'],
      experience: '3 năm dạy tại Trung tâm ngoại ngữ và gia sư',
      hourlyRate: 180000,
      status: 'APPROVED',
      user: { fullName: 'Trần Thị Lan', email: 'tutor2@huyhoang.com', phone: '0923456789' }
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
      hourlyRate: 200000,
      status: 'OPEN',
      student: { user: { fullName: 'Phạm Minh Quân' } }
    },
    {
      id: 'req-2',
      title: 'Gia sư Tiếng Anh lớp 9 luyện thi lên lớp 10',
      subject: 'Tiếng Anh',
      grade: 'Lớp 9',
      hourlyRate: 180000,
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
      student: { user: { fullName: 'Phạm Minh Quân' } }
    }
  ];

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchTutors();
    fetchRequests();
  }, [activeTab]);

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
    // We map tutor profile list from users or dedicated endpoint.
    // For simplicity, we can fetch users and extract tutors, or mock it.
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

  const toggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`${apiUrl}/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Refresh
        fetchUsers();
      } else {
        // Toggle locally for mock demonstration
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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

  // Chart setup
  const revenueChartData = {
    labels: (stats || mockStats).dailyStats.map((d: any) => {
      const dateObj = new Date(d.date);
      return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Doanh thu phí dịch vụ (VND)',
        data: (stats || mockStats).dailyStats.map((d: any) => d.revenue),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const subjectChartData = {
    labels: (stats || mockStats).subjectStats.map((s: any) => s.subject),
    datasets: [
      {
        label: 'Số lớp học',
        data: (stats || mockStats).subjectStats.map((s: any) => s.count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
      },
    ],
  };

  const currentStats = stats || mockStats;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)] w-full relative bg-slate-50 text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-8 relative z-10 animate-fade-in-up">
        <div className="border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Quản trị Hệ thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Giám sát hoạt động, phê duyệt gia sư đối tác và quản lý vận hành</p>
        </div>

        {/* Tab content */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-8">
            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Người dùng', count: currentStats.overview.totalUsers, icon: <Users size={20} />, bg: 'bg-sky-50 text-sky-655 border-sky-100' },
                { label: 'Gia sư', count: currentStats.overview.totalTutors, icon: <GraduationCap size={20} />, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                { label: 'Lớp hoạt động', count: currentStats.overview.activeClasses, icon: <BookOpen size={20} />, bg: 'bg-amber-50 text-amber-600 border-amber-100' },
                { label: 'Doanh thu', count: `${currentStats.overview.totalRevenue.toLocaleString('vi-VN')}đ`, icon: <DollarSign size={20} />, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Line chart (Col-span 2) */}
              <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm tracking-wide">Biểu đồ Doanh thu (7 ngày gần nhất)</h3>
                <div className="h-72 w-full flex items-center justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <Line
                    data={revenueChartData}
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

              {/* Doughnut Chart */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm tracking-wide">Tỷ lệ lớp theo Môn học</h3>
                <div className="h-72 w-full flex items-center justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <Doughnut
                    data={subjectChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { color: '#64748b', boxWidth: 10, font: { size: 9 } } } }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tutors' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Duyệt hồ sơ Gia sư</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-semibold text-slate-500">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 text-[10px] tracking-wider">Gia sư</th>
                    <th className="p-4 text-[10px] tracking-wider">Môn dạy</th>
                    <th className="p-4 text-[10px] tracking-wider">Kinh nghiệm</th>
                    <th className="p-4 text-[10px] tracking-wider">Học phí đề xuất</th>
                    <th className="p-4 text-[10px] tracking-wider">Trạng thái</th>
                    <th className="p-4 text-[10px] tracking-wider text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {tutorsList.map((tutor) => (
                    <tr key={tutor.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800 text-sm">{tutor.user.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{tutor.user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects.map((sub, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-sky-50 border border-sky-100 text-sky-600 text-[10px] font-bold">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">{tutor.experience}</td>
                      <td className="p-4 font-bold text-sky-655">{tutor.hourlyRate.toLocaleString('vi-VN')}đ/h</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          tutor.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          tutor.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {tutor.status === 'APPROVED' ? 'Đã duyệt' :
                           tutor.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {tutor.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateTutorStatus(tutor.id, 'APPROVED')}
                                className="p-2 rounded-xl bg-sky-50 border border-sky-100 hover:bg-sky-500 text-sky-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
                                title="Duyệt hồ sơ"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => updateTutorStatus(tutor.id, 'REJECTED')}
                                className="p-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-500 text-rose-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
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
        )}

        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Quản lý tài khoản Người dùng</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-semibold text-slate-505">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 text-[10px] tracking-wider">Người dùng</th>
                    <th className="p-4 text-[10px] tracking-wider">Email</th>
                    <th className="p-4 text-[10px] tracking-wider">Vai trò</th>
                    <th className="p-4 text-[10px] tracking-wider">Trạng thái</th>
                    <th className="p-4 text-[10px] tracking-wider text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {usersList.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800 text-sm">{userItem.fullName}</td>
                      <td className="p-4 text-xs font-medium text-slate-500">{userItem.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          userItem.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          userItem.role === 'TEACHER' ? 'bg-sky-50 text-sky-655 border-sky-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {userItem.role === 'ADMIN' ? 'Quản trị' : userItem.role === 'TEACHER' ? 'Gia sư' : 'Học sinh'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          userItem.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {userItem.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {userItem.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggleUserStatus(userItem.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 cursor-pointer active:scale-95 shadow-sm border ${
                              userItem.isActive
                                ? 'bg-rose-55 hover:bg-rose-100 text-rose-600 border border-rose-200'
                                : 'bg-emerald-55 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                            }`}
                          >
                            {userItem.isActive ? 'Khóa' : 'Mở khóa'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Quản lý yêu cầu lớp học</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-semibold text-slate-505">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 text-[10px] tracking-wider">Lớp yêu cầu</th>
                    <th className="p-4 text-[10px] tracking-wider">Học sinh đăng</th>
                    <th className="p-4 text-[10px] tracking-wider">Môn học</th>
                    <th className="p-4 text-[10px] tracking-wider">Học phí</th>
                    <th className="p-4 text-[10px] tracking-wider">Trạng thái lớp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {requestsList.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800 text-sm">{request.title}</td>
                      <td className="p-4 text-xs font-medium text-slate-500">{request.student.user.fullName}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-100 text-sky-600 text-[10px] font-bold mr-1">
                          {request.subject}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{request.grade}</span>
                      </td>
                      <td className="p-4 font-bold text-sky-600">{request.hourlyRate.toLocaleString('vi-VN')}đ/h</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          request.status === 'OPEN' ? 'bg-sky-50 text-sky-655 border-sky-100' :
                          request.status === 'ASSIGNED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          request.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {request.status === 'OPEN' ? 'Đang tuyển' :
                           request.status === 'ASSIGNED' ? 'Đã giao lớp' :
                           request.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
