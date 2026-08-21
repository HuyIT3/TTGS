import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Check, X, ArrowLeft, Star, Clock, User, Award, BookOpen, AlertCircle } from 'lucide-react';

interface SessionLog {
  id: string;
  classId: string;
  classTitle: string;
  studentName: string;
  tutorName: string;
  sessionNumber: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'SCHEDULED';
  rating: number; // 1 to 5 stars
  lessonContent?: string;
  homeworkAssigned?: string;
  feedback?: string;
  reportedAt?: string;
}

const defaultLogs: SessionLog[] = [
  {
    id: 'log-1',
    classId: 'c-act-1',
    classTitle: 'Lớp Toán 12 - Ôn thi THPT Quốc Gia',
    studentName: 'Tuệ Vương',
    tutorName: 'Dư Hoàng Huy',
    sessionNumber: 1,
    date: '2026-08-15',
    status: 'PRESENT',
    rating: 5,
    lessonContent: 'Tính đơn điệu của hàm số bậc ba và hàm số phân thức bậc nhất.',
    homeworkAssigned: 'Hoàn thành bài tập 1 đến 10 trong sách bài tập trang 25.',
    feedback: 'Học sinh hiểu bài rất nhanh, có tư duy giải toán nhanh nhẹn. Cần chú ý cẩn thận khi rút gọn biểu thức.',
    reportedAt: '2026-08-15'
  },
  {
    id: 'log-2',
    classId: 'c-act-1',
    classTitle: 'Lớp Toán 12 - Ôn thi THPT Quốc Gia',
    studentName: 'Tuệ Vương',
    tutorName: 'Dư Hoàng Huy',
    sessionNumber: 2,
    date: '2026-08-18',
    status: 'PRESENT',
    rating: 4,
    lessonContent: 'Cực trị của hàm số và các bài toán chứa tham số m cơ bản.',
    homeworkAssigned: 'Bài tập ôn tập trắc nghiệm chương cực trị (20 câu).',
    feedback: 'Tập trung nghe giảng. Còn hơi lúng túng khi giải hệ phương trình tìm điều kiện của m.',
    reportedAt: '2026-08-18'
  },
  {
    id: 'log-3',
    classId: 'c-act-1',
    classTitle: 'Lớp Toán 12 - Ôn thi THPT Quốc Gia',
    studentName: 'Tuệ Vương',
    tutorName: 'Dư Hoàng Huy',
    sessionNumber: 3,
    date: '2026-08-22',
    status: 'SCHEDULED',
    rating: 0
  }
];

export default function AttendanceLogView() {
  const { user } = useAuth();

  // State managers
  const [logs, setLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('ttgs_session_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultLogs;
  });

  useEffect(() => {
    localStorage.setItem('ttgs_session_logs', JSON.stringify(logs));
  }, [logs]);

  // UI modes: 'list' | 'report' | 'view-detail'
  const [mode, setMode] = useState<'list' | 'report' | 'view-detail'>('list');
  const [selectedLog, setSelectedLog] = useState<SessionLog | null>(null);

  // Form states for reporting (Teacher)
  const [reportStatus, setReportStatus] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [reportRating, setReportRating] = useState(5);
  const [reportLesson, setReportLesson] = useState('');
  const [reportHomework, setReportHomework] = useState('');
  const [reportFeedback, setReportFeedback] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);

  // Open reporting dialog (Teacher)
  const handleOpenReport = (log: SessionLog) => {
    setSelectedLog(log);
    setReportStatus('PRESENT');
    setReportRating(5);
    setReportLesson('');
    setReportHomework('');
    setReportFeedback('');
    setReportDate(log.date);
    setReportError(null);
    setMode('report');
  };

  const handleTeacherReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);

    if (reportStatus === 'PRESENT' && (!reportLesson.trim() || !reportFeedback.trim())) {
      setReportError('Vui lòng nhập đầy đủ nội dung bài học và nhận xét học lực của học sinh.');
      return;
    }

    if (!selectedLog) return;

    setLogs(prev => prev.map(l => l.id === selectedLog.id ? {
      ...l,
      status: reportStatus,
      rating: reportStatus === 'PRESENT' ? reportRating : 0,
      lessonContent: reportStatus === 'PRESENT' ? reportLesson : 'Học sinh vắng mặt.',
      homeworkAssigned: reportStatus === 'PRESENT' ? reportHomework : 'Không có bài tập.',
      feedback: reportStatus === 'PRESENT' ? reportFeedback : 'Học sinh vắng mặt không lý do.',
      reportedAt: new Date().toLocaleDateString('vi-VN'),
      date: reportDate || l.date
    } : l));

    alert('Gửi báo cáo điểm danh và nhật ký buổi học thành công!');
    setMode('list');
  };

  // Filter logs based on logged in user profile role
  const getFilteredLogs = () => {
    if (!user) return [];
    if (user.role === 'STUDENT') {
      return logs.filter(l => l.studentName === user.fullName);
    } else if (user.role === 'TEACHER') {
      return logs.filter(l => l.tutorName === user.fullName);
    } else {
      // Admin sees everything
      return logs;
    }
  };

  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={`${i <= count ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in-up">
      {/* 1. LIST VIEW */}
      {mode === 'list' && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-extrabold text-slate-805 text-sm tracking-wide uppercase text-slate-400">
              {user?.role === 'ADMIN' ? 'Giám sát chuyên cần & Báo cáo học vụ' : 'Điểm danh & Nhật ký buổi học'}
            </h3>
            <p className="text-[10px] text-slate-450 font-bold uppercase block mt-0.5">
              Theo dõi sự chuyên cần, chất lượng giảng dạy và tóm tắt ghi chú bài giảng chi tiết
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-semibold text-slate-505">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 text-[10px] tracking-wider">Lớp học</th>
                    <th className="p-4 text-[10px] tracking-wider">Buổi số</th>
                    <th className="p-4 text-[10px] tracking-wider">Ngày học</th>
                    <th className="p-4 text-[10px] tracking-wider">Học sinh / Gia sư</th>
                    <th className="p-4 text-[10px] tracking-wider">Chuyên cần</th>
                    <th className="p-4 text-[10px] tracking-wider text-center">Đánh giá sao</th>
                    <th className="p-4 text-[10px] tracking-wider text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {getFilteredLogs().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800 text-sm">{log.classTitle}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px]">
                          Buổi #{log.sessionNumber}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">{log.date}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span>HS: <strong className="text-slate-800">{log.studentName}</strong></span>
                          <span className="text-[10px] text-slate-400">GS: {log.tutorName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          log.status === 'ABSENT' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-slate-100 text-slate-450 border-slate-200'
                        }`}>
                          {log.status === 'PRESENT' ? 'Có mặt' :
                           log.status === 'ABSENT' ? 'Vắng mặt' : 'Chưa diễn ra'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {log.status === 'PRESENT' ? renderStars(log.rating) : <span className="text-slate-350 italic text-[10px] font-normal">Chưa đánh giá</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          {log.status !== 'SCHEDULED' ? (
                            <button
                              onClick={() => {
                                setSelectedLog(log);
                                setMode('view-detail');
                              }}
                              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-500 hover:text-white border border-sky-100 text-sky-600 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-0.5"
                            >
                              <BookOpen size={11} />
                              <span>Xem nhật ký</span>
                            </button>
                          ) : user?.role === 'TEACHER' ? (
                            <button
                              onClick={() => handleOpenReport(log)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-500 hover:text-white border border-indigo-100 text-indigo-600 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-0.5"
                            >
                              <Check size={11} />
                              <span>Điểm danh & Báo cáo</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-[10px] font-normal">Đang chờ dạy</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {getFilteredLogs().length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-xs text-slate-450 text-center italic py-10 bg-slate-50/20">
                        Chưa có dữ liệu nhật ký buổi học nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. REPORTING LOG FORM (TEACHER) */}
      {mode === 'report' && selectedLog && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-xl mx-auto w-full relative overflow-hidden animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
            <button
              onClick={() => setMode('list')}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer active:scale-95 bg-white shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="font-bold text-slate-805 text-base sm:text-lg">Báo cáo & Điểm danh buổi học</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lớp: {selectedLog.classTitle} (Buổi #{selectedLog.sessionNumber})</span>
            </div>
          </div>

          {reportError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold mb-4 animate-shake">
              <AlertCircle size={15} className="text-rose-500 shrink-0" />
              <span>{reportError}</span>
            </div>
          )}

          <form onSubmit={handleTeacherReportSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Điểm danh học sinh</label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value as any)}
                  className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                >
                  <option value="PRESENT">Có mặt (PRESENT)</option>
                  <option value="ABSENT">Vắng mặt (ABSENT)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày dạy thực tế</label>
                <input
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-805 cursor-pointer"
                />
              </div>
            </div>

            {reportStatus === 'PRESENT' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Đánh giá chất lượng / Độ tập trung của học sinh
                    <span className="text-amber-500 font-bold">({reportRating} sao)</span>
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReportRating(star)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={`${
                            star <= reportRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nội dung bài học đã dạy</label>
                  <textarea
                    required
                    rows={3}
                    value={reportLesson}
                    onChange={(e) => setReportLesson(e.target.value)}
                    placeholder="Ví dụ: Ôn tập các dạng bất phương trình chứa tham số, luyện đề tốt nghiệp..."
                    className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm resize-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bài tập giao về nhà (cho buổi sau)</label>
                  <textarea
                    rows={2}
                    value={reportHomework}
                    onChange={(e) => setReportHomework(e.target.value)}
                    placeholder="Ví dụ: Làm bài 1 đến 5 trang 42 sách bài tập toán hình..."
                    className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm resize-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhận xét chi tiết của gia sư</label>
                  <textarea
                    required
                    rows={3}
                    value={reportFeedback}
                    onChange={(e) => setReportFeedback(e.target.value)}
                    placeholder="Ví dụ: Học sinh hiểu bài tốt, hăng hái xây dựng bài, cần chú ý tính toán chậm để tránh sai sót..."
                    className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm resize-none focus:border-sky-500"
                  />
                </div>
              </>
            )}

            {reportStatus === 'ABSENT' && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed">
                ⚠️ Cảnh báo: Học sinh vắng mặt sẽ được tự động ghi nhận vào báo cáo chuyên cần. Không cần ghi nhận nội dung học và đánh giá sao cho buổi này.
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-xs text-white btn-gradient shadow-md cursor-pointer active:scale-95"
            >
              Lưu và gửi báo cáo học tập
            </button>
          </form>
        </div>
      )}

      {/* 3. DETAILED VIEW PANEL */}
      {mode === 'view-detail' && selectedLog && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-xl mx-auto w-full relative overflow-hidden animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
            <button
              onClick={() => setMode('list')}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer active:scale-95 bg-white shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="font-bold text-slate-805 text-base sm:text-lg">Nhật ký chi tiết buổi học</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lớp: {selectedLog.classTitle} (Buổi #{selectedLog.sessionNumber})</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 text-xs sm:text-sm">
            {/* Session Card Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl flex flex-col gap-3 shadow-inner">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Gia sư giảng dạy:</strong>
                  <span className="font-bold text-slate-800">{selectedLog.tutorName}</span>
                </div>
                <div>
                  <strong className="text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Học sinh theo học:</strong>
                  <span className="font-bold text-slate-800">{selectedLog.studentName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-3">
                <div>
                  <strong className="text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Ngày học:</strong>
                  <span className="font-mono text-slate-750 font-bold">{selectedLog.date}</span>
                </div>
                <div>
                  <strong className="text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Đánh giá thái độ:</strong>
                  <div className="mt-0.5">
                    {selectedLog.status === 'PRESENT' ? renderStars(selectedLog.rating) : <span className="text-rose-600 font-bold">Vắng mặt</span>}
                  </div>
                </div>
              </div>
            </div>

            {selectedLog.status === 'PRESENT' ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">Nội dung bài giảng đã học:</span>
                  <p className="bg-white border border-slate-150 p-4 rounded-xl leading-relaxed text-slate-800 font-medium">
                    {selectedLog.lessonContent}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">Bài tập về nhà giao thêm:</span>
                  <p className="bg-white border border-slate-150 p-4 rounded-xl leading-relaxed text-slate-800 font-medium">
                    {selectedLog.homeworkAssigned || 'Không giao thêm bài tập.'}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-widest font-mono flex items-center gap-1">
                    <Award size={14} className="text-sky-500" />
                    Nhận xét & Lời khuyên của Gia sư:
                  </span>
                  <p className="bg-sky-50/30 border border-sky-100 p-4 rounded-xl leading-relaxed text-sky-850 font-bold italic">
                    "{selectedLog.feedback}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed flex items-center gap-2">
                <AlertCircle size={16} />
                <span>Học sinh vắng mặt không tham gia học. Gia sư ghi nhận vắng mặt vào nhật ký hệ thống.</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setMode('list')}
            className="w-full mt-6 py-3 rounded-xl font-bold text-xs text-white btn-gradient shadow-md cursor-pointer active:scale-95"
          >
            Đóng xem chi tiết
          </button>
        </div>
      )}
    </div>
  );
}
