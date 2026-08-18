import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, PlusCircle, Search, Filter, MapPin, Calendar, Clock, 
  DollarSign, X, Check, Eye, Trash2, Edit3, Send, Sparkles, BookOpenCheck 
} from 'lucide-react';

interface StudentRequest {
  id: string;
  studentId: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  hourlyRate: number;
  sessionsPerWeek: number;
  schedule: string;
  location: string;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  student: {
    id: string;
    userId: string;
    user: {
      fullName: string;
      avatar?: string;
    };
  };
  applications: {
    id: string;
    tutorId: string;
    status: string;
    notes?: string;
    tutor: {
      userId: string;
      user: {
        fullName: string;
        avatar?: string;
      };
    };
  }[];
}

export const ClassRequestsList: React.FC = () => {
  const { apiUrl, token, user } = useAuth();
  
  // State variables
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(500000);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);

  // Form states (Create / Edit)
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Lớp 12');
  const [hourlyRate, setHourlyRate] = useState(150000);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED'>('OPEN');

  // Application notes
  const [applyNotes, setApplyNotes] = useState('');

  // Predefined lists
  const subjects = ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh', 'Ngữ văn', 'Tin học', 'Lịch sử', 'Địa lý', 'Khác'];
  const grades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12', 'Ôn thi Đại học'];

  // Mock data as fallback
  const mockRequests: StudentRequest[] = [
    {
      id: 'mock-1',
      studentId: 'stud-1',
      title: 'Tìm Gia sư Toán 12 ôn thi THPT Quốc Gia cấp tốc',
      description: 'Cần gia sư có kinh nghiệm ôn thi đại học điểm cao, tận tình và có phương pháp dạy dễ hiểu. Học sinh bị hổng kiến thức hình học không gian.',
      subject: 'Toán học',
      grade: 'Lớp 12',
      hourlyRate: 200000,
      sessionsPerWeek: 3,
      schedule: 'Tối thứ 2, thứ 5 và sáng chủ nhật',
      location: 'Quận Cầu Giấy, Hà Nội',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      student: {
        id: 'stud-1',
        userId: 'user-stud-1',
        user: {
          fullName: 'Nguyễn Khánh Linh',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        }
      },
      applications: []
    },
    {
      id: 'mock-2',
      studentId: 'stud-2',
      title: 'Gia sư Tiếng Anh giao tiếp cho học sinh lớp 8',
      description: 'Tập trung luyện phát âm chuẩn, kỹ năng nghe nói phản xạ tự nhiên. Yêu cầu gia sư đạt IELTS 7.0 trở lên.',
      subject: 'Tiếng Anh',
      grade: 'Lớp 8',
      hourlyRate: 250000,
      sessionsPerWeek: 2,
      schedule: 'Chiều thứ 7 (14h-16h) và chiều chủ nhật',
      location: 'Online qua Zoom',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      student: {
        id: 'stud-2',
        userId: 'user-stud-2',
        user: {
          fullName: 'Lê Minh Triết',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        }
      },
      applications: []
    },
    {
      id: 'mock-3',
      studentId: 'stud-3',
      title: 'Cần tìm Gia sư Hóa học lớp 10 củng cố lý thuyết',
      description: 'Học sinh mới lên cấp 3 bị mất gốc hóa học, cần giảng lại các phản ứng cơ bản và cách cân bằng phương trình.',
      subject: 'Hóa học',
      grade: 'Lớp 10',
      hourlyRate: 180000,
      sessionsPerWeek: 2,
      schedule: 'Tối thứ 3 và tối thứ 6 (19h30-21h30)',
      location: 'Quận Tây Hồ, Hà Nội',
      status: 'ASSIGNED',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      student: {
        id: 'stud-3',
        userId: 'user-stud-3',
        user: {
          fullName: 'Trần Thanh Vân',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
        }
      },
      applications: [
        {
          id: 'app-mock-1',
          tutorId: 'tutor-1',
          status: 'ACCEPTED',
          tutor: {
            userId: 'user-tutor-1',
            user: {
              fullName: 'Dư Hoàng Huy',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
            }
          }
        }
      ]
    }
  ];

  // Fetch all class requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/classes/requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        setRequests(mockRequests);
      }
    } catch (err) {
      console.error(err);
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [apiUrl]);

  // Apply filters
  useEffect(() => {
    let result = [...requests];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) || 
        (r.description && r.description.toLowerCase().includes(q)) ||
        r.location.toLowerCase().includes(q) ||
        r.student.user.fullName.toLowerCase().includes(q)
      );
    }

    // Subject
    if (selectedSubject !== 'All') {
      result = result.filter(r => r.subject === selectedSubject);
    }

    // Grade
    if (selectedGrade !== 'All') {
      result = result.filter(r => r.grade === selectedGrade);
    }

    // Status
    if (selectedStatus !== 'All') {
      result = result.filter(r => r.status === selectedStatus);
    }

    // Hourly Rate
    result = result.filter(r => r.hourlyRate <= maxHourlyRate);

    setFilteredRequests(result);
  }, [requests, searchQuery, selectedSubject, selectedGrade, selectedStatus, maxHourlyRate]);

  // Reset form states
  const resetForm = () => {
    setTitle('');
    setSubject('Toán học');
    setGrade('Lớp 12');
    setHourlyRate(150000);
    setSessionsPerWeek(2);
    setSchedule('');
    setLocation('');
    setDescription('');
    setStatus('OPEN');
    setApplyNotes('');
  };

  // Open Edit Modal and set values
  const openEdit = (req: StudentRequest) => {
    setSelectedRequest(req);
    setTitle(req.title);
    setSubject(req.subject);
    setGrade(req.grade);
    setHourlyRate(req.hourlyRate);
    setSessionsPerWeek(req.sessionsPerWeek);
    setSchedule(req.schedule);
    setLocation(req.location);
    setDescription(req.description || '');
    setStatus(req.status);
    setShowEditModal(true);
  };

  // CRUD Form Submissions
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Vui lòng đăng nhập để thực hiện chức năng này.');

    try {
      const res = await fetch(`${apiUrl}/classes/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title, subject, grade, hourlyRate, sessionsPerWeek, schedule, location, description
        })
      });

      if (res.ok) {
        alert('Đăng yêu cầu lớp thành công!');
        setShowCreateModal(false);
        resetForm();
        fetchRequests();
      } else {
        const errorData = await res.json();
        alert(`Lỗi đăng tin: ${errorData.message || 'Máy chủ gặp sự cố'}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback update in UI if mock mode
      const newMock: StudentRequest = {
        id: `mock-${Date.now()}`,
        studentId: user?.studentProfile?.id || 'stud-1',
        title, subject, grade, hourlyRate, sessionsPerWeek, schedule, location, status: 'OPEN',
        description,
        createdAt: new Date().toISOString(),
        student: {
          id: user?.studentProfile?.id || 'stud-1',
          userId: user?.id || 'user-1',
          user: {
            fullName: user?.fullName || 'Học sinh thử nghiệm',
            avatar: user?.avatar
          }
        },
        applications: []
      };
      setRequests(prev => [newMock, ...prev]);
      alert('Đăng tin thành công (Chế độ demo offline)!');
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !token) return;

    try {
      const res = await fetch(`${apiUrl}/classes/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title, subject, grade, hourlyRate, sessionsPerWeek, schedule, location, description, status
        })
      });

      if (res.ok) {
        alert('Cập nhật yêu cầu lớp thành công!');
        setShowEditModal(false);
        resetForm();
        fetchRequests();
      } else {
        const errorData = await res.json();
        alert(`Lỗi cập nhật: ${errorData.message || 'Máy chủ gặp sự cố'}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
        ...r, title, subject, grade, hourlyRate, sessionsPerWeek, schedule, location, description, status
      } : r));
      alert('Cập nhật thành công (Chế độ demo offline)!');
      setShowEditModal(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu tìm gia sư này?')) return;
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/classes/requests/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Xóa yêu cầu thành công!');
        fetchRequests();
      } else {
        alert('Lỗi từ hệ thống khi xóa.');
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setRequests(prev => prev.filter(r => r.id !== id));
      alert('Xóa thành công (Chế độ demo offline)!');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !token) return;

    try {
      const res = await fetch(`${apiUrl}/classes/requests/${selectedRequest.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes: applyNotes })
      });

      if (res.ok) {
        alert('Ứng tuyển thành công! Vui lòng chờ phản hồi từ học sinh.');
        setShowApplyModal(false);
        resetForm();
        fetchRequests();
      } else {
        const errorData = await res.json();
        alert(`Không thể ứng tuyển: ${errorData.message || 'Lỗi hệ thống'}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
        ...r,
        applications: [
          ...r.applications,
          {
            id: `mock-app-${Date.now()}`,
            tutorId: 'mock-tutor',
            status: 'PENDING',
            notes: applyNotes,
            tutor: {
              userId: user?.id || 'mock-tutor-user',
              user: {
                fullName: user?.fullName || 'Gia sư thử nghiệm',
                avatar: user?.avatar
              }
            }
          }
        ]
      } : r));
      alert('Ứng tuyển thành công (Chế độ demo offline)!');
      setShowApplyModal(false);
      resetForm();
    }
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'OPEN':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'ASSIGNED':
        return 'bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50';
      case 'COMPLETED':
        return 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50';
      default:
        return 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50';
    }
  };

  const translateStatus = (statusStr: string) => {
    switch (statusStr) {
      case 'OPEN': return 'Đang tìm Gia sư';
      case 'ASSIGNED': return 'Đã có Gia sư';
      case 'COMPLETED': return 'Đã hoàn thành';
      default: return 'Đã hủy bỏ';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-xl mb-10 border border-slate-800 animate-fade-in-up">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-sky-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-15 pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold mb-4 uppercase tracking-wider">
              <Sparkles size={12} className="animate-spin" />
              <span>Cập Nhật Liên Tục</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Lớp Học Cần <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Gia Sư</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Trung tâm Hoa Hướng Dương mang đến cầu nối vững chắc giữa người dạy và người học. Khám phá các lớp học mới nhất và ứng tuyển phù hợp với thời gian biểu của bạn.
            </p>
          </div>
          
          {/* Create Button only for students/admin */}
          {(user?.role === 'STUDENT' || user?.role === 'ADMIN') && (
            <button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-sky-500/20 cursor-pointer active:scale-95 transition-all whitespace-nowrap self-start md:self-auto border border-sky-400/30 font-display"
            >
              <PlusCircle size={18} />
              <span>Đăng Yêu Cầu Lớp Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="glass-panel rounded-2xl p-6 mb-8 border border-slate-200/80 shadow-sm animate-fade-in-up">
        <div className="flex flex-col gap-5">
          {/* Row 1: Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tiêu đề lớp, địa chỉ hoặc học sinh..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-inner-sm input-premium"
              />
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <BookOpen size={15} />
              </span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none cursor-pointer input-premium"
              >
                <option value="All">Tất cả Môn học</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <BookOpenCheck size={15} />
              </span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none cursor-pointer input-premium"
              >
                <option value="All">Tất cả Khối lớp</option>
                {grades.map(gr => (
                  <option key={gr} value={gr}>{gr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Status and Hourly Rate Range */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 border-t border-slate-100 pt-4">
            <div className="flex gap-4 items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Filter size={13} />
                <span>Trạng thái:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {['All', 'OPEN', 'ASSIGNED', 'COMPLETED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                      selectedStatus === st
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-655 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'All' ? 'Tất cả' : translateStatus(st)}
                  </button>
                ))}
              </div>
            </div>

            {/* Hourly Rate Slider */}
            <div className="w-full sm:w-80 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Học phí tối đa:</span>
                <span>{maxHourlyRate.toLocaleString('vi-VN')} đ/h</span>
              </div>
              <input
                type="range"
                min="50000"
                max="500000"
                step="10000"
                value={maxHourlyRate}
                onChange={(e) => setMaxHourlyRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-655 rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Đang tải danh sách lớp học...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-rose-500 font-bold glass-panel rounded-2xl border border-rose-100">
          {error}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 text-slate-400 glass-panel rounded-3xl border border-slate-200/60 flex flex-col items-center justify-center gap-3">
          <BookOpen size={40} className="text-slate-300 stroke-1" />
          <span className="text-sm font-semibold">Không tìm thấy yêu cầu lớp học nào phù hợp với bộ lọc.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => {
            const hasApplied = !!(user && req.applications.some(app => app.tutor.userId === user.id));
            const isOwner = !!(user && (user.id === req.student.userId || user.role === 'ADMIN'));
            
            return (
              <div 
                key={req.id} 
                className="glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-lg transition-all"
              >
                {/* Top Badge Info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50 text-[10px] font-extrabold tracking-wide uppercase">
                      {req.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold">
                      {req.grade}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${getStatusBadge(req.status)}`}>
                    {translateStatus(req.status)}
                  </span>
                </div>

                {/* Class Title */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-sky-655 transition-colors h-11">
                    {req.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                    Đăng ngày: {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Key parameters block */}
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100/60 dark:border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                    <DollarSign size={14} className="text-sky-600 shrink-0" />
                    <span>Học phí: <strong className="text-slate-900 dark:text-white font-bold">{req.hourlyRate.toLocaleString('vi-VN')}đ/h</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                    <Calendar size={14} className="text-sky-600 shrink-0" />
                    <span>Số buổi: <strong className="text-slate-900 dark:text-white font-semibold">{req.sessionsPerWeek} buổi/tuần</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350 truncate">
                    <Clock size={14} className="text-sky-600 shrink-0" />
                    <span className="truncate">Lịch học: <strong className="text-slate-900 dark:text-white font-semibold truncate">{req.schedule}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350 truncate">
                    <MapPin size={14} className="text-sky-600 shrink-0" />
                    <span className="truncate">Địa điểm: <strong className="text-slate-900 dark:text-white font-semibold truncate">{req.location}</strong></span>
                  </div>
                </div>

                {/* Student owner info */}
                <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3 mt-1">
                  <img
                    src={req.student.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={req.student.user.fullName}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-300 truncate">{req.student.user.fullName}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Học sinh</span>
                  </div>
                </div>

                {/* Buttons Action bar */}
                <div className="flex gap-2.5 mt-auto pt-3 border-t border-slate-100/60">
                  <button
                    onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                    className="flex-1 px-3 py-2 text-xs font-bold text-slate-655 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Eye size={13} />
                    <span>Xem chi tiết</span>
                  </button>

                  {/* If user is owner or admin: show Edit and Delete */}
                  {isOwner ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(req)}
                        className="p-2 text-sky-600 hover:bg-sky-50 border border-sky-100 rounded-xl transition-all cursor-pointer active:scale-95"
                        title="Chỉnh sửa yêu cầu"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer active:scale-95"
                        title="Xóa yêu cầu"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    /* Tutors can apply */
                    user?.role === 'TEACHER' && req.status === 'OPEN' && (
                      <button
                        disabled={hasApplied}
                        onClick={() => { setSelectedRequest(req); setApplyNotes(''); setShowApplyModal(true); }}
                        className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                          hasApplied 
                            ? 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed active:scale-100' 
                            : 'btn-gradient'
                        }`}
                      >
                        {hasApplied ? (
                          <>
                            <Check size={13} />
                            <span>Đã ứng tuyển</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>Ứng tuyển dạy</span>
                          </>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="text-sky-600" size={20} />
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">Đăng Yêu Cầu Tìm Gia Sư</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Tiêu đề yêu cầu <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Cần tìm gia sư ôn thi Toán lớp 12 lên Đại học gấp"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Môn học <span className="text-rose-500">*</span></label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium cursor-pointer"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Khối lớp <span className="text-rose-500">*</span></label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium cursor-pointer"
                  >
                    {grades.map(gr => (
                      <option key={gr} value={gr}>{gr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Học phí đề xuất (đ/h) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="10000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    placeholder="Ví dụ: 150000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Số buổi dạy / tuần <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="7"
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                    placeholder="Ví dụ: 2"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Lịch học chi tiết <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Ví dụ: Tối thứ 2 (19h30 - 21h30), Chiều thứ 7 (14h - 16h)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Địa chỉ học tập <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: 123 Thụy Khuê, Tây Hồ, Hà Nội hoặc 'Online qua Zoom'"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Mô tả chi tiết yêu cầu, học lực</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hãy mô tả chi tiết năng lực học sinh, tính cách, yêu cầu đặc biệt của gia sư (kinh nghiệm, bằng cấp...)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white btn-gradient rounded-xl shadow-md cursor-pointer active:scale-95 animate-pulse-subtle"
                >
                  Đăng tin tuyển ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="text-sky-600" size={20} />
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">Chỉnh Sửa Yêu Cầu Lớp</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Tiêu đề yêu cầu <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Môn học <span className="text-rose-500">*</span></label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium cursor-pointer"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Khối lớp <span className="text-rose-500">*</span></label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium cursor-pointer"
                  >
                    {grades.map(gr => (
                      <option key={gr} value={gr}>{gr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Học phí đề xuất (đ/h) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="10000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Số buổi dạy / tuần <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="7"
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Lịch học chi tiết <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Địa chỉ học tập <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700">Trạng thái lớp học</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium cursor-pointer"
                  >
                    <option value="OPEN">Đang tìm Gia sư (OPEN)</option>
                    <option value="ASSIGNED">Đã giao lớp (ASSIGNED)</option>
                    <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
                    <option value="CANCELLED">Hủy bỏ (CANCELLED)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Mô tả chi tiết yêu cầu, học lực</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white btn-gradient rounded-xl shadow-md cursor-pointer active:scale-95"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-base">Thông tin chi tiết Lớp học</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 transition-all cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 overflow-y-auto text-xs sm:text-sm">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{selectedRequest.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${getStatusBadge(selectedRequest.status)}`}>
                    {translateStatus(selectedRequest.status)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Mã số lớp: #{selectedRequest.id.substring(0, 8)}</span>
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Môn học</span>
                  <span className="font-bold text-slate-800">{selectedRequest.subject}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khối lớp</span>
                  <span className="font-bold text-slate-800">{selectedRequest.grade}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Học phí</span>
                  <span className="font-bold text-sky-600">{selectedRequest.hourlyRate.toLocaleString('vi-VN')} đ/giờ</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lịch học</span>
                  <span className="font-bold text-slate-800">{selectedRequest.sessionsPerWeek} buổi / tuần</span>
                </div>
              </div>

              {/* Location & Time */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-2.5">
                  <MapPin size={18} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Địa điểm học tập</h5>
                    <p className="text-slate-655 mt-0.5">{selectedRequest.location}</p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Calendar size={18} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Lịch học dự kiến</h5>
                    <p className="text-slate-655 mt-0.5">{selectedRequest.schedule}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-slate-100 pt-4">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">Mô tả lớp học & học lực</h5>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-655 leading-relaxed font-medium">
                  {selectedRequest.description || 'Không có mô tả chi tiết cho lớp học này.'}
                </div>
              </div>

              {/* Student owner profile detail */}
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <img
                  src={selectedRequest.student.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={selectedRequest.student.user.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-slate-800 text-sm leading-none">{selectedRequest.student.user.fullName}</h5>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Đăng yêu cầu</span>
                </div>
              </div>

              {/* Modal footer apply */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Đóng lại
                </button>
                {user?.role === 'TEACHER' && selectedRequest.status === 'OPEN' && (
                  <button
                    disabled={!!(user && selectedRequest.applications.some(app => app.tutor.userId === user.id))}
                    onClick={() => {
                      setShowDetailModal(false);
                      setApplyNotes('');
                      setShowApplyModal(true);
                    }}
                    className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                      (user && selectedRequest.applications.some(app => app.tutor.userId === user.id))
                        ? 'bg-slate-300 cursor-not-allowed active:scale-100 text-slate-500'
                        : 'btn-gradient shadow-md'
                    }`}
                  >
                    <Send size={14} />
                    <span>Ứng tuyển ngay</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {showApplyModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Send className="text-sky-600" size={18} />
                <h3 className="font-bold text-slate-800 text-base">Ứng Tuyển Dạy Học</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 transition-all cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 flex flex-col gap-4">
              <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">Yêu cầu lớp ứng tuyển:</span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm leading-snug">{selectedRequest.title}</span>
                <span className="text-[10px] text-slate-500">Mức học phí: {selectedRequest.hourlyRate.toLocaleString('vi-VN')} đ/h</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Lời tự giới thiệu / Ghi chú cho học sinh <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  placeholder="Hãy giới thiệu ngắn gọn về kinh nghiệm giảng dạy môn này, thành tích học tập nổi bật của bản thân để tăng khả năng được học sinh lựa chọn..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-semibold input-premium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white btn-gradient rounded-xl shadow-md cursor-pointer active:scale-95"
                >
                  Gửi yêu cầu ứng tuyển
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
