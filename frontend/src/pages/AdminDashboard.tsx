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
import { Users, GraduationCap, BookOpen, DollarSign, Check, X, ShieldAlert, Trash2, Edit3, UserPlus, Plus, Cpu, Activity, MessageSquare, Award, Calendar } from 'lucide-react';
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
  tutorName?: string;
}

export const AdminDashboard: React.FC = () => {
  const { apiUrl, token } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
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
      `Bạn là một trợ lý AI thông minh toàn năng (General AI Assistant), đồng thời tích hợp dữ liệu học vụ của Trung tâm Gia sư Hoa Hướng Dương (Hoa Hướng Dương Tutor Center).
Hãy trả lời bất kỳ câu hỏi nào của người dùng bằng tiếng Việt thân thiện, lịch sự (bao gồm trả lời kiến thức chung, làm văn, giải bài tập, v.v.).`;
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
    }
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
    setUserFullName('');
    setUserEmail('');
    setUserPhone('');
    setUserRole('STUDENT');
    setUserIsActive(true);
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
      ...u,
      fullName: userFullName,
      email: userEmail,
      phone: userPhone,
      role: userRole,
      isActive: userIsActive,
    } : u));

    setShowEditUserModal(false);
    setSelectedUserForEdit(null);
    setUserFullName('');
    setUserEmail('');
    setUserPhone('');
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

  // Class requests CRUD handlers
  const handleEditRequestClick = (req: ClassRequestItem) => {
    setSelectedRequestForEdit(req);
    setReqTitle(req.title);
    setReqSubject(req.subject);
    setReqGrade(req.grade);
    setReqRate(req.hourlyRate);
    setReqStatus(req.status);
    setShowEditRequestModal(true);
  };

  const handleEditRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForEdit) return;

    setRequestsList(prev => prev.map(r => r.id === selectedRequestForEdit.id ? {
      ...r,
      title: reqTitle,
      subject: reqSubject,
      grade: reqGrade,
      hourlyRate: reqRate,
      status: reqStatus,
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
      ...r,
      status: 'ASSIGNED',
      tutorName: tutor.user.fullName
    } : r));

    setShowAssignTutorModal(false);
    setSelectedRequestForAssign(null);
    setReqTutorId('');
  };

  // Chatbot Config Prompt Submission
  const handleSaveChatbotPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ttgs_chatbot_system_prompt', chatbotPrompt);
    alert('Đã cập nhật chỉ thị hệ thống cho AI Chatbot thành công!');
  };

  // Charts
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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)] w-full relative bg-slate-50 text-slate-805">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-8 relative z-10 animate-fade-in-up">
        <div className="border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Quản trị Hệ thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Giám sát hoạt động, phê duyệt gia sư đối tác và quản lý vận hành</p>
        </div>

        {/* Tab 1: Stats */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        {/* Tab 2: Tutors approval */}
        {activeTab === 'tutors' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Duyệt hồ sơ Gia sư đối tác</h3>
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

        {/* Tab 3: Users Account Manager */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col gap-4">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Quản lý tài khoản Người dùng</h3>
              <button
                onClick={() => {
                  setUserFullName('');
                  setUserEmail('');
                  setUserPhone('');
                  setUserRole('STUDENT');
                  setUserIsActive(true);
                  setShowAddUserModal(true);
                }}
                className="px-3.5 py-2 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <UserPlus size={14} />
                <span>Thêm tài khoản mới</span>
              </button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-semibold text-slate-505">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 text-[10px] tracking-wider">Người dùng</th>
                    <th className="p-4 text-[10px] tracking-wider">Email</th>
                    <th className="p-4 text-[10px] tracking-wider">Số điện thoại</th>
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
                      <td className="p-4 text-xs font-medium text-slate-500">{userItem.phone || 'Chưa cập nhật'}</td>
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
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUserClick(userItem)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-sm active:scale-90"
                            title="Sửa thông tin"
                          >
                            <Edit3 size={13} />
                          </button>
                          
                          {userItem.role !== 'ADMIN' && (
                            <button
                              onClick={() => toggleUserStatus(userItem.id)}
                              className={`px-2 py-1.5 rounded-xl text-[9px] font-extrabold border transition-all duration-300 cursor-pointer active:scale-95 shadow-sm ${
                                userItem.isActive
                                  ? 'bg-rose-50 text-rose-600 border-rose-150 hover:bg-rose-500 hover:text-white'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-150 hover:bg-emerald-500 hover:text-white'
                              }`}
                            >
                              {userItem.isActive ? 'Khóa' : 'Mở khóa'}
                            </button>
                          )}

                          {userItem.id.startsWith('u-custom-') && (
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="p-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white text-rose-600 transition-all cursor-pointer shadow-sm active:scale-90"
                              title="Xóa tài khoản"
                            >
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
        )}

        {/* Tab 4: Requests Manager */}
        {activeTab === 'requests' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
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
                    <th className="p-4 text-[10px] tracking-wider">Gia sư chỉ định</th>
                    <th className="p-4 text-[10px] tracking-wider">Trạng thái lớp</th>
                    <th className="p-4 text-[10px] tracking-wider text-center">Hành động</th>
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
                      <td className="p-4 text-xs font-bold text-indigo-600">{request.tutorName || 'Chưa giao lớp'}</td>
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
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditRequestClick(request)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-550 border border-slate-200 transition-all cursor-pointer shadow-sm active:scale-90"
                            title="Sửa thông tin lớp"
                          >
                            <Edit3 size={13} />
                          </button>
                          
                          {request.status === 'OPEN' && (
                            <button
                              onClick={() => handleAssignTutorClick(request)}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-500 hover:text-white text-indigo-600 text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-90 flex items-center gap-0.5"
                            >
                              <GraduationCap size={12} />
                              <span>Giao lớp</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="p-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white text-rose-600 transition-all cursor-pointer shadow-sm active:scale-90"
                            title="Xóa tin này"
                          >
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
        )}

        {/* Tab 5: Chatbot Configuration */}
        {activeTab === 'chatbot-config' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Prompt Editor Card */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col gap-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl"></div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
                <Cpu className="text-sky-500" />
                Thiết lập Câu lệnh hệ thống (System Prompt) cho AI Chatbot
              </h3>
              
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-semibold leading-relaxed">
                <strong>💡 Lưu ý:</strong> Câu lệnh này chỉ thị cho AI biết vai trò, giọng điệu phản hồi và các quy tắc khi hội thoại với Học sinh, Gia sư.
              </div>

              <form onSubmit={handleSaveChatbotPrompt} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Prompt (Chỉ thị AI)</label>
                  <textarea
                    rows={8}
                    value={chatbotPrompt}
                    onChange={(e) => setChatbotPrompt(e.target.value)}
                    placeholder="Nhập hướng dẫn cho chatbot ảo tại đây..."
                    className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm font-medium leading-relaxed resize-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs text-white btn-gradient shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Cập nhật chỉ thị Chatbot AI</span>
                </button>
              </form>
            </div>

            {/* Right Chatbot Analytics & simulated logs */}
            <div className="flex flex-col gap-6">
              {/* Analytics */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm tracking-wide uppercase text-slate-400">Hiệu suất Trợ lý AI</h4>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tổng hội thoại</span>
                    <strong className="text-base font-black text-slate-700 block mt-0.5">142 lượt</strong>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Độ chính xác AI</span>
                    <strong className="text-base font-black text-emerald-600 block mt-0.5">98.5%</strong>
                  </div>
                </div>
              </div>

              {/* Logs */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col gap-3.5 max-h-[300px] overflow-y-auto">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm tracking-wide uppercase text-slate-400 flex items-center gap-1.5">
                  <Activity size={14} className="text-sky-500 animate-pulse" />
                  Nhật ký Chatbot gần đây
                </h4>
                
                <div className="flex flex-col gap-2.5">
                  {[
                    { user: 'Tuệ Vương', msg: 'Hôm nay tôi có lịch học Toán 12 không?', reply: 'Hôm nay bạn có buổi học Toán lúc 19:00 cùng gia sư Trần Thị Lan.' },
                    { user: 'Lê Hoàng Nam', msg: 'Làm thế nào để được duyệt hồ sơ dạy nhanh?', reply: 'Vui lòng cập nhật đầy đủ bằng cấp tiếng Anh và kinh nghiệm trong mục Hồ sơ để Admin kiểm tra duyệt nhanh nhé.' },
                    { user: 'Cao Vũ Băng Truyền', msg: 'Xem thông tin lớp tôi dạy?', reply: 'Bạn hiện có lớp Tiếng Anh lớp 9 với học sinh Hoàng Mai Chi.' }
                  ].map((log, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-700">{log.user}</strong>
                        <span className="text-[9px] text-slate-400 font-semibold">Vừa xong</span>
                      </div>
                      <p className="text-slate-500 italic">"{log.msg}"</p>
                      <p className="text-sky-650 font-medium">→ Chatbot: {log.reply}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Session Audit logs */}
        {activeTab === 'session-audit' && (
          <AttendanceLogView />
        )}

        {/* Tab 7: Community Hub */}
        {activeTab === 'community' && (
          <CommunityHubView />
        )}
      </main>

      {/* MODAL 1: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddUserSubmit} className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Thêm tài khoản người dùng mới</h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email đăng nhập</label>
                  <input
                    type="email"
                    required
                    placeholder="nguyenvana@gmail.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vai trò tài khoản</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="STUDENT">Học sinh / Phụ huynh</option>
                    <option value="TEACHER">Gia sư đối tác</option>
                    <option value="ADMIN">Quản trị viên hệ thống</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái hoạt động</label>
                  <select
                    value={userIsActive ? 'ACTIVE' : 'BLOCKED'}
                    onChange={(e) => setUserIsActive(e.target.value === 'ACTIVE')}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="ACTIVE">Đang hoạt động (Kích hoạt)</option>
                    <option value="BLOCKED">Đã khóa tài khoản</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
              >
                Tạo tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {showEditUserModal && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditUserSubmit} className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Chỉnh sửa tài khoản người dùng</h3>
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email đăng nhập</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="bg-slate-100 border border-slate-200 text-slate-450 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vai trò tài khoản</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="STUDENT">Học sinh / Phụ huynh</option>
                    <option value="TEACHER">Gia sư đối tác</option>
                    <option value="ADMIN">Quản trị viên hệ thống</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái hoạt động</label>
                  <select
                    value={userIsActive ? 'ACTIVE' : 'BLOCKED'}
                    onChange={(e) => setUserIsActive(e.target.value === 'ACTIVE')}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="ACTIVE">Đang hoạt động (Kích hoạt)</option>
                    <option value="BLOCKED">Đã khóa tài khoản</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
              >
                Lưu chỉnh sửa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: EDIT CLASS REQUEST */}
      {showEditRequestModal && selectedRequestForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditRequestSubmit} className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Chỉnh sửa tin yêu cầu lớp học</h3>
              <button
                type="button"
                onClick={() => setShowEditRequestModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề lớp</label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Môn học</label>
                  <input
                    type="text"
                    required
                    value={reqSubject}
                    onChange={(e) => setReqSubject(e.target.value)}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lớp/Trình độ</label>
                  <input
                    type="text"
                    required
                    value={reqGrade}
                    onChange={(e) => setReqGrade(e.target.value)}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Học phí (đ/h)</label>
                  <input
                    type="number"
                    required
                    value={reqRate}
                    onChange={(e) => setReqRate(Number(e.target.value))}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái lớp</label>
                <select
                  value={reqStatus}
                  onChange={(e) => setReqStatus(e.target.value as any)}
                  className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                >
                  <option value="OPEN">Đang tìm Gia sư (OPEN)</option>
                  <option value="ASSIGNED">Đã giao lớp (ASSIGNED)</option>
                  <option value="COMPLETED">Đã kết thúc lớp (COMPLETED)</option>
                  <option value="CANCELLED">Hủy bỏ lớp học (CANCELLED)</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditRequestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: ASSIGN TUTOR MANUALLY */}
      {showAssignTutorModal && selectedRequestForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAssignTutorSubmit} className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Giao lớp nhanh cho gia sư đối tác</h3>
              <button
                type="button"
                onClick={() => setShowAssignTutorModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="text-xs bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-indigo-700 font-semibold leading-relaxed">
                Lớp: <strong className="text-slate-805">{selectedRequestForAssign.title}</strong>
                <br />
                Môn học: {selectedRequestForAssign.subject} ({selectedRequestForAssign.grade})
                <br />
                Phụ huynh/Học viên đăng: {selectedRequestForAssign.student.user.fullName}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chọn gia sư đối tác</label>
                <select
                  required
                  value={reqTutorId}
                  onChange={(e) => setReqTutorId(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-805 text-xs sm:text-sm cursor-pointer"
                >
                  <option value="">-- Chọn một gia sư được duyệt --</option>
                  {tutorsList
                    .filter(t => t.status === 'APPROVED')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.user.fullName} ({t.subjects.join(', ')} - Exp: {t.experience.substring(0, 30)}...)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAssignTutorModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!reqTutorId}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận chỉ định
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
