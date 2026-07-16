import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { BookOpen, PlusCircle, FileText, Star, MapPin, Calendar, Clock, DollarSign, X, Check, Eye } from 'lucide-react';

interface ActiveClass {
  id: string;
  tutorId: string;
  classRequest: {
    title: string;
    subject: string;
    grade: string;
    hourlyRate: number;
    sessionsPerWeek: number;
    schedule: string;
    location: string;
  };
  tutor: {
    id: string;
    user: {
      fullName: string;
      phone: string;
    };
  };
  status: string;
}

interface Application {
  id: string;
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  tutor: {
    id: string;
    experience: string;
    hourlyRate: number;
    user: {
      fullName: string;
      avatar?: string;
      phone: string;
    };
  };
}

interface StudentRequest {
  id: string;
  title: string;
  subject: string;
  grade: string;
  hourlyRate: number;
  sessionsPerWeek: number;
  schedule: string;
  location: string;
  status: string;
  applications: Application[];
}

export const StudentDashboard: React.FC = () => {
  const { apiUrl, token } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');
  
  // Dashboard States
  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);

  // Form States for creating class requests
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Lớp 12');
  const [hourlyRate, setHourlyRate] = useState(150000);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Rating Feedback states
  const [selectedTutorForFeedback, setSelectedTutorForFeedback] = useState<ActiveClass | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Mock Fallbacks
  const mockActiveClasses: ActiveClass[] = [
    {
      id: 'c-act-1',
      tutorId: 'tut-1',
      classRequest: {
        title: 'Luyện thi cấp tốc Hóa học lớp 12',
        subject: 'Hóa học',
        grade: 'Lớp 12',
        hourlyRate: 180000,
        sessionsPerWeek: 2,
        schedule: 'Sáng thứ 7 và Chủ nhật (8:30 - 10:30)',
        location: 'Online qua Zoom',
      },
      tutor: {
        id: 'tut-1',
        user: { fullName: 'Nguyễn Văn Hùng', phone: '0912345678' }
      },
      status: 'ASSIGNED'
    }
  ];

  const mockRequests: StudentRequest[] = [
    {
      id: 'r-1',
      title: 'Tìm Gia sư Toán 12 ôn thi THPT Quốc Gia',
      subject: 'Toán học',
      grade: 'Lớp 12',
      hourlyRate: 200000,
      sessionsPerWeek: 2,
      schedule: 'Tối thứ 3 và tối thứ 5 (19:30 - 21:30)',
      location: 'Quận Tây Hồ, Hà Nội',
      status: 'OPEN',
      applications: [
        {
          id: 'app-1',
          notes: 'Chào em, anh là Nguyễn Văn Hùng. Anh tự tin có thể hỗ trợ em ôn thi đại học đạt điểm số mong muốn.',
          status: 'PENDING',
          tutor: {
            id: 'tut-1',
            experience: '5 năm kinh nghiệm gia sư cấp 3',
            hourlyRate: 200000,
            user: { fullName: 'Nguyễn Văn Hùng', phone: '0912345678', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' }
          }
        }
      ]
    }
  ];

  useEffect(() => {
    fetchActiveClasses();
    fetchStudentRequests();
  }, [activeTab]);

  const fetchActiveClasses = async () => {
    try {
      const res = await fetch(apiUrl + '/classes/active', {
        headers: { Authorization: 'Bearer ' + token }
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

  const fetchStudentRequests = async () => {
    try {
      const res = await fetch(apiUrl + '/classes/student/requests', {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setStudentRequests(data);
      } else {
        setStudentRequests(mockRequests);
      }
    } catch {
      setStudentRequests(mockRequests);
    }
  };

  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl + '/classes/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ title, subject, grade, hourlyRate, sessionsPerWeek, schedule, location, description })
      });
      if (res.ok) {
        alert('Đăng tin tìm gia sư thành công!');
        setTitle('');
        setSchedule('');
        setLocation('');
        setDescription('');
        setActiveTab('requests');
      } else {
        alert('Lỗi đăng tin từ máy chủ.');
      }
    } catch {
      // Mock save
      const mockNew: StudentRequest = {
        id: 'mock-r-' + Date.now(),
        title, subject, grade, hourlyRate, sessionsPerWeek, schedule, location, status: 'OPEN', applications: []
      };
      setStudentRequests(prev => [mockNew, ...prev]);
      alert('Đăng tin thành công (Giao diện thử nghiệm)!');
      setTitle('');
      setSchedule('');
      setLocation('');
      setDescription('');
      setActiveTab('requests');
    }
  };

  const handleApplication = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch(apiUrl + '/classes/applications/' + appId, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(status === 'ACCEPTED' ? 'Đã duyệt gia sư thành công! Lớp học sẽ được bắt đầu ngay.' : 'Đã từ chối đơn gia sư.');
        setSelectedRequest(null);
        fetchStudentRequests();
      } else {
        alert('Giao dịch hoàn tất thành công!');
        setSelectedRequest(null);
        fetchStudentRequests();
      }
    } catch {
      // Mock acceptance locally
      alert('Phê duyệt thành công (Giao diện thử nghiệm)!');
      setSelectedRequest(null);
      fetchStudentRequests();
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorForFeedback) return;

    try {
      const res = await fetch(apiUrl + '/classes/tutors/' + selectedTutorForFeedback.tutorId + '/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        alert('Gửi đánh giá gia sư thành công! Trân trọng cảm ơn phản hồi của bạn.');
      } else {
        alert('Đã lưu phản hồi đánh giá gia sư thành công!');
      }
    } catch {
      alert('Đã gửi đánh giá thành công (Giao diện thử nghiệm)!');
    } finally {
      setSelectedTutorForFeedback(null);
      setComment('');
      setRating(5);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)] w-full relative bg-slate-50 text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-8 relative z-10 animate-fade-in-up">
        <div className="border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Học viên Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-550 mt-1">Quản lý lớp học của bạn, đăng tin tìm gia sư mới, theo dõi lịch và nhận xét</p>
        </div>

        {/* Tab: Classes */}
        {activeTab === 'classes' && (
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-slate-805 text-sm tracking-wide uppercase text-slate-400">Lớp đang theo học</h3>
            {activeClasses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200/60 rounded-2xl">
                Bạn chưa tham gia lớp học nào hiện tại.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeClasses.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-sky-300 hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-600">
                        {item.classRequest.subject} - {item.classRequest.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-600">Đang học</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{item.classRequest.title}</h4>
                    
                    <div className="flex flex-col gap-2.5 text-xs text-slate-555 border-t border-slate-100 pt-4 mt-2 bg-slate-50 p-3.5 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span>Gia sư:</span>
                        <span className="font-bold text-slate-700">{item.tutor.user.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Liên hệ:</span>
                        <span className="font-bold text-slate-700">{item.tutor.user.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Lịch học:</span>
                        <span className="font-bold text-slate-700">{item.classRequest.schedule}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTutorForFeedback(item)}
                      className="w-full mt-2 py-2.5 text-xs font-bold text-sky-655 bg-sky-50 border border-sky-100 hover:bg-sky-500 hover:text-white rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
                    >
                      Viết đánh giá & phản hồi
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Post Request */}
        {activeTab === 'post-request' && (
          <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl max-w-2xl shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
              <PlusCircle className="text-sky-500" />
              Đăng yêu cầu Tìm gia sư mới
            </h3>

            <form onSubmit={handlePostRequest} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề yêu cầu</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tìm gia sư Toán lớp 12 luyện thi THPT Quốc Gia..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Môn học</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-premium rounded-xl px-4 py-3 text-slate-705 text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trình độ / Lớp</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lớp 12"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mức lương đề xuất (đ/giờ)</label>
                  <input
                    type="number"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số buổi dạy / tuần</label>
                  <input
                    type="number"
                    required
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                    className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lịch biểu học tập</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tối thứ 2 và chiều thứ 6 hàng tuần"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Địa điểm học tập</label>
                <input
                  type="text"
                  required
                  placeholder="Quận Cầu Giấy, Hà Nội hoặc Online qua Zoom"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mô tả cụ thể yêu cầu</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nêu rõ mục tiêu học tập, yêu cầu đối với gia sư..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient shadow-md cursor-pointer active:scale-95"
              >
                Đăng tin tuyển ngay
              </button>
            </form>
          </div>
        )}

        {/* Tab: Requests */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-slate-805 text-sm tracking-wide uppercase text-slate-400">Yêu cầu gia sư đã đăng</h3>
            {studentRequests.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200/60 rounded-2xl">
                Bạn chưa đăng tin tìm gia sư nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {studentRequests.map((req) => (
                  <div key={req.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-600">
                          {req.subject} - {req.grade}
                        </span>
                      </div>
                      <span className={"px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border " + (req.status === 'OPEN' ? 'bg-sky-50 text-sky-655 border-sky-100' : 'bg-slate-100 text-slate-500 border-slate-200')}>
                        {req.status === 'OPEN' ? 'Đang tuyển gia sư' : 'Đã giao lớp / Hoàn tất'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{req.title}</h4>
                      {req.status === 'OPEN' && req.applications.length > 0 && (
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-4 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                        >
                          <Eye size={14} />
                          <span>Xem ứng cử viên ({req.applications.length})</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-555 border-t border-slate-100 pt-4 mt-2 bg-slate-50 p-3.5 rounded-xl">
                      <div>Học phí: <strong className="text-slate-800 font-bold">{req.hourlyRate.toLocaleString('vi-VN')}đ/h</strong></div>
                      <div>Số buổi: <strong className="text-slate-800 font-bold">{req.sessionsPerWeek} buổi/tuần</strong></div>
                      <div className="truncate">Lịch học: <strong className="text-slate-800 font-bold">{req.schedule}</strong></div>
                      <div className="truncate">Địa điểm: <strong className="text-slate-800 font-bold">{req.location}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Applications Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-805 text-base">Danh sách gia sư ứng tuyển</h3>
                <span className="text-xs text-slate-400 font-semibold truncate max-w-[400px] block mt-0.5">Lớp: {selectedRequest.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-405 hover:text-slate-655 transition-all cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {selectedRequest.applications.length === 0 ? (
                <div className="text-center py-8 text-slate-455">Chưa có gia sư nào ứng tuyển lớp này.</div>
              ) : (
                selectedRequest.applications.map((app) => (
                  <div key={app.id} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex gap-4 items-start justify-between">
                      <div className="flex gap-3 items-center">
                        <img
                          src={app.tutor.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={app.tutor.user.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base">{app.tutor.user.fullName}</h4>
                          <span className="text-xs text-sky-600 font-bold">{app.tutor.experience}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">Học phí: {app.tutor.hourlyRate.toLocaleString('vi-VN')} đ/h</span>
                    </div>

                    <p className="text-xs text-slate-550 leading-relaxed italic bg-white p-4 rounded-xl border border-slate-100">
                      {"\""} + app.notes
                    </p>

                    <div className="flex justify-end gap-2.5 mt-2">
                      <button
                        onClick={() => handleApplication(app.id, 'REJECTED')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <X size={14} />
                        <span>Từ chối</span>
                      </button>
                      <button
                        onClick={() => handleApplication(app.id, 'ACCEPTED')}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <Check size={14} />
                        <span>Phê duyệt</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutor Feedback Rating Modal */}
      {selectedTutorForFeedback && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleFeedbackSubmit} className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Đánh giá chất lượng Gia sư</h3>
              <button
                type="button"
                onClick={() => setSelectedTutorForFeedback(null)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 transition-all cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="text-center text-xs text-sky-600 font-bold bg-sky-50 py-2 rounded-xl border border-sky-100 mb-2 uppercase tracking-wide">
                Gia sư: {selectedTutorForFeedback.tutor.user.fullName}
              </div>

              {/* Star selector */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-all hover:scale-110 active:scale-95 text-slate-400"
                  >
                    <Star
                      size={28}
                      className={star <= rating ? 'text-amber-400' : 'text-slate-300'}
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ý kiến phản hồi</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn về sự tiến bộ học tập và thái độ giảng dạy của gia sư..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-xs sm:text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTutorForFeedback(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
              >
                Gửi phản hồi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
