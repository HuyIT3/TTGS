import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Check, X, ArrowLeft, Calendar, FileCheck, HelpCircle, Edit, Star, Sparkles, Trash2 } from 'lucide-react';

interface Homework {
  id: string;
  classTitle: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  uploadedBy: string;
}

interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentName: string;
  textAnswer: string;
  notes?: string;
  submittedAt: string;
  score?: number; // scale 10
  feedback?: string;
  status: 'PENDING' | 'GRADED';
}

const defaultHomeworks: Homework[] = [
  {
    id: 'hw-1',
    classTitle: 'Lớp Toán 12 - Ôn thi THPT Quốc Gia',
    title: 'Bài tập Đạo hàm & Khảo sát hàm số - Tuần 2',
    description: 'Hoàn thành các bài tập khảo sát vẽ đồ thị hàm số bậc ba và tìm cực trị trong tài liệu ôn tập trang 12 đến 15.',
    dueDate: '2026-08-30',
    createdAt: '15/08/2026',
    uploadedBy: 'Gia sư Nguyễn Văn Hùng'
  },
  {
    id: 'hw-2',
    classTitle: 'Lớp Tiếng Anh lớp 9 luyện thi lên lớp 10',
    title: 'Writing Essay: Technology in Modern Education',
    description: 'Write a short paragraph (120-150 words) about the advantages and disadvantages of using tablets in secondary school classrooms.',
    dueDate: '2026-08-28',
    createdAt: '18/08/2026',
    uploadedBy: 'Gia sư Cao Vũ Băng Truyền'
  }
];

const defaultSubmissions: HomeworkSubmission[] = [
  {
    id: 'sub-1',
    homeworkId: 'hw-1',
    studentName: 'Tuệ Vương',
    textAnswer: 'Em gửi bài làm: \nCâu 1: Hàm số đạt cực trị tại x=1 và x=-1.\nCâu 2: Hàm số đồng biến trên khoảng (-inf; -1) và (1; +inf).\nCâu 3: Điểm uốn I(0; 1)...',
    notes: 'Link Google Drive lời giải chi tiết: https://drive.google.com/file/d/123-xyz',
    submittedAt: '20/08/2026',
    status: 'PENDING'
  }
];

export default function HomeworkView() {
  const { user } = useAuth();

  // State managers
  const [homeworks, setHomeworks] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('ttgs_homeworks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultHomeworks;
  });

  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(() => {
    const saved = localStorage.getItem('ttgs_homework_submissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultSubmissions;
  });

  useEffect(() => {
    localStorage.setItem('ttgs_homeworks', JSON.stringify(homeworks));
  }, [homeworks]);

  useEffect(() => {
    localStorage.setItem('ttgs_homework_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // UI Modes: 'list' | 'submit' | 'grade' | 'create'
  const [mode, setMode] = useState<'list' | 'submit' | 'grade' | 'create'>('list');
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [selectedSub, setSelectedSub] = useState<HomeworkSubmission | null>(null);

  // Student submission form states
  const [textAnswer, setTextAnswer] = useState('');
  const [notes, setNotes] = useState('');

  // Teacher assignment creator form states
  const [newHwClass, setNewHwClass] = useState('Lớp Toán 12 - Ôn thi THPT Quốc Gia');
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwDesc, setNewHwDesc] = useState('');
  const [newHwDueDate, setNewHwDueDate] = useState('');
  const [creatorError, setCreatorError] = useState<string | null>(null);

  // Teacher grading states
  const [gradeScore, setGradeScore] = useState(10);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Open homework submit panel (Student)
  const handleOpenSubmit = (hw: Homework) => {
    setSelectedHw(hw);
    setTextAnswer('');
    setNotes('');
    setMode('submit');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHw || !user) return;

    const newSub: HomeworkSubmission = {
      id: `sub-custom-${Date.now()}`,
      homeworkId: selectedHw.id,
      studentName: user.fullName,
      textAnswer,
      notes,
      submittedAt: new Date().toLocaleDateString('vi-VN'),
      status: 'PENDING'
    };

    setSubmissions(prev => [newSub, ...prev]);
    alert('Nộp bài tập về nhà thành công!');
    setMode('list');
  };

  // Open grading panel (Teacher)
  const handleOpenGrading = (sub: HomeworkSubmission, hw: Homework) => {
    setSelectedSub(sub);
    setSelectedHw(hw);
    setGradeScore(10);
    setGradeFeedback('');
    setMode('grade');
  };

  const handleTeacherGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? {
      ...s,
      score: gradeScore,
      feedback: gradeFeedback,
      status: 'GRADED'
    } : s));

    alert('Đã chấm điểm và lưu nhận xét thành công!');
    setMode('list');
  };

  const handleCreateHwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorError(null);

    if (!newHwTitle.trim() || !newHwDesc.trim() || !newHwDueDate) {
      setCreatorError('Vui lòng điền đầy đủ tiêu đề, mô tả và hạn nộp bài.');
      return;
    }

    const newHw: Homework = {
      id: `hw-custom-${Date.now()}`,
      classTitle: newHwClass,
      title: newHwTitle,
      description: newHwDesc,
      dueDate: newHwDueDate,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      uploadedBy: user ? user.fullName : 'Gia sư'
    };

    setHomeworks(prev => [newHw, ...prev]);
    alert('Giao bài tập về nhà mới thành công!');

    // Reset Form
    setNewHwTitle('');
    setNewHwDesc('');
    setNewHwDueDate('');
    setMode('list');
  };

  const handleDeleteHw = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      setHomeworks(prev => prev.filter(h => h.id !== id));
      setSubmissions(prev => prev.filter(s => s.homeworkId !== id));
    }
  };

  // Helpers to get submission details
  const getStudentSubmission = (hwId: string) => {
    if (!user) return null;
    return submissions.find(s => s.homeworkId === hwId && s.studentName === user.fullName);
  };

  const getSubmissionsForHw = (hwId: string) => {
    return submissions.filter(s => s.homeworkId === hwId);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in-up">
      {/* 1. LIST VIEW */}
      {mode === 'list' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-805 text-sm tracking-wide uppercase text-slate-400">Quản lý Bài tập về nhà</h3>
              <p className="text-[10px] text-slate-450 font-bold uppercase block mt-0.5">Theo dõi hạn nộp, chấm điểm & phản hồi học tập</p>
            </div>
            {user?.role === 'TEACHER' && (
              <button
                onClick={() => setMode('create')}
                className="px-4 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap self-start"
              >
                <Plus size={15} />
                <span>Giao bài tập mới</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left list: Homework tasks */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 font-mono">
                {user?.role === 'STUDENT' ? 'Bài tập được giao' : 'Danh sách bài tập đã giao'}
              </span>

              {homeworks.map((hw) => {
                const sub = getStudentSubmission(hw.id);
                const subCount = getSubmissionsForHw(hw.id).length;
                
                return (
                  <div key={hw.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden group shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-100 text-sky-600 text-[9px] font-bold">
                        {hw.classTitle}
                      </span>
                      {user?.role === 'STUDENT' ? (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                          sub?.status === 'GRADED'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : sub?.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {sub?.status === 'GRADED'
                            ? `Đã chấm: ${sub.score}/10`
                            : sub?.status === 'PENDING'
                            ? 'Đã nộp bài'
                            : 'Chưa làm'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-bold">
                            {subCount} bài nộp
                          </span>
                          {hw.id.startsWith('hw-custom-') && (
                            <button
                              onClick={() => handleDeleteHw(hw.id)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-slate-805 text-sm sm:text-base leading-snug group-hover:text-sky-600 transition-colors">
                        {hw.title}
                      </h4>
                      <p className="text-xs text-slate-505 leading-relaxed mt-1">
                        {hw.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>Hạn nộp: {hw.dueDate}</span>
                      </div>
                      <span>Gia sư: {hw.uploadedBy}</span>
                    </div>

                    {user?.role === 'STUDENT' && !sub && (
                      <button
                        onClick={() => handleOpenSubmit(hw)}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white btn-gradient cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Edit size={14} />
                        <span>Làm bài và nộp</span>
                      </button>
                    )}

                    {user?.role === 'STUDENT' && sub?.status === 'GRADED' && (
                      <div className="p-3 bg-sky-50 border border-sky-100 text-sky-850 rounded-xl flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-sky-655 font-mono">Nhận xét của gia sư:</span>
                        <p className="text-xs font-medium italic">"{sub.feedback || 'Không có nhận xét.'}"</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {homeworks.length === 0 && (
                <p className="text-xs text-slate-400 text-center italic py-10">Chưa có bài tập nào được giao.</p>
              )}
            </div>

            {/* Right list: Student submissions (Teacher view only) */}
            {user?.role === 'TEACHER' && (
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 font-mono">
                  Bài làm của Học sinh
                </span>

                {submissions.map((sub) => {
                  const hw = homeworks.find(h => h.id === sub.homeworkId);
                  if (!hw) return null;
                  return (
                    <div key={sub.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3 relative shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-100 text-sky-600 text-[9px] font-bold">
                          Học sinh: {sub.studentName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                          sub.status === 'GRADED'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {sub.status === 'GRADED' ? `Đã chấm: ${sub.score}/10` : 'Chờ chấm'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-1">
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                          Đề: {hw.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          Bài làm: {sub.textAnswer}
                        </p>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-semibold mt-1">
                        <span>Nộp lúc: {sub.submittedAt}</span>
                        {sub.status === 'PENDING' && (
                          <button
                            onClick={() => handleOpenGrading(sub, hw)}
                            className="px-3 py-1 bg-indigo-50 border border-indigo-100 hover:bg-indigo-500 hover:text-white text-indigo-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            Chấm điểm
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {submissions.length === 0 && (
                  <p className="text-xs text-slate-400 text-center italic py-10">Chưa có bài nộp nào.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. STUDENT SUBMISSION FORM MODE */}
      {mode === 'submit' && selectedHw && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-xl mx-auto w-full relative overflow-hidden animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
            <button
              onClick={() => setMode('list')}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer active:scale-95 bg-white shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="font-bold text-slate-805 text-base sm:text-lg">Nộp bài tập về nhà</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lớp: {selectedHw.classTitle}</span>
            </div>
          </div>

          <div className="p-4 bg-sky-50 border border-sky-100 text-sky-850 rounded-2xl flex flex-col gap-1.5 mb-5">
            <span className="text-[10px] uppercase font-bold text-sky-655 tracking-wider font-mono">Đề bài: {selectedHw.title}</span>
            <p className="text-xs leading-relaxed">{selectedHw.description}</p>
          </div>

          <form onSubmit={handleStudentSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nội dung câu trả lời / Bài làm</label>
              <textarea
                required
                rows={6}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Nhập nội dung bài giải hoặc kết quả câu hỏi trắc nghiệm tự luận..."
                className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm resize-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tài liệu đính kèm (Link Drive/Hình ảnh nếu có)</label>
              <input
                type="url"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. https://drive.google.com/file/d/..."
                className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl font-bold text-xs text-white btn-gradient shadow-md cursor-pointer active:scale-95"
            >
              Nộp bài giải
            </button>
          </form>
        </div>
      )}

      {/* 3. TEACHER GRADING PORTAL MODE */}
      {mode === 'grade' && selectedSub && selectedHw && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-xl mx-auto w-full relative overflow-hidden animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
            <button
              onClick={() => setMode('list')}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer active:scale-95 bg-white shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="font-bold text-slate-805 text-base sm:text-lg">Chấm điểm & Nhận xét bài làm</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Học sinh: {selectedSub.studentName}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl flex flex-col gap-3 mb-5 text-xs shadow-inner">
            <div>
              <strong className="text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Đề bài tập:</strong>
              <span className="font-bold text-slate-800">{selectedHw.title}</span>
            </div>
            <div>
              <strong className="text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Nội dung bài nộp của học sinh:</strong>
              <p className="bg-white border border-slate-200/80 p-3 rounded-xl mt-1 leading-relaxed whitespace-pre-line text-slate-800">
                {selectedSub.textAnswer}
              </p>
            </div>
            {selectedSub.notes && (
              <div>
                <strong className="text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Tài liệu gửi kèm:</strong>
                <a href={selectedSub.notes} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-bold break-all">
                  {selectedSub.notes}
                </a>
              </div>
            )}
          </div>

          <form onSubmit={handleTeacherGrade} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Điểm số (Thang 10)</label>
              <input
                type="number"
                required
                min={0}
                max={10}
                step={0.5}
                value={gradeScore}
                onChange={(e) => setGradeScore(Number(e.target.value))}
                className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhận xét / Lời khuyên chi tiết</label>
              <textarea
                required
                rows={4}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Nhập phản hồi nhận xét điểm mạnh, lỗi sai cần khắc phục..."
                className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm resize-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white btn-gradient shadow-md cursor-pointer active:scale-95"
            >
              Lưu điểm & Gửi nhận xét
            </button>
          </form>
        </div>
      )}

      {/* 4. TEACHER CREATION FORM MODE */}
      {mode === 'create' && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-xl mx-auto w-full relative overflow-hidden animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
            <button
              onClick={() => setMode('list')}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer active:scale-95 bg-white shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="font-bold text-slate-805 text-base sm:text-lg">Giao bài tập về nhà mới</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Công cụ phân công bài tập của Gia sư</span>
            </div>
          </div>

          {creatorError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold mb-4">
              <X size={15} className="text-rose-500 shrink-0" />
              <span>{creatorError}</span>
            </div>
          )}

          <form onSubmit={handleCreateHwSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lớp học phân công</label>
              <select
                value={newHwClass}
                onChange={(e) => setNewHwClass(e.target.value)}
                className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
              >
                <option value="Lớp Toán 12 - Ôn thi THPT Quốc Gia">Lớp Toán 12 - Ôn thi THPT Quốc Gia</option>
                <option value="Lớp Tiếng Anh lớp 9 luyện thi lên lớp 10">Lớp Tiếng Anh lớp 9 luyện thi lên lớp 10</option>
                <option value="Lớp Vật lý 12 - Dao động cơ">Lớp Vật lý 12 - Dao động cơ</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề bài tập</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Bài tập ôn thi giữa kỳ 1..."
                value={newHwTitle}
                onChange={(e) => setNewHwTitle(e.target.value)}
                className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yêu cầu mô tả chi tiết bài tập</label>
              <textarea
                required
                rows={5}
                value={newHwDesc}
                onChange={(e) => setNewHwDesc(e.target.value)}
                placeholder="Nhập nội dung bài tập, các câu hỏi tự luận, đề cương cần làm..."
                className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm resize-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hạn chót nộp bài (Due Date)</label>
              <input
                type="date"
                required
                value={newHwDueDate}
                onChange={(e) => setNewHwDueDate(e.target.value)}
                className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl font-bold text-xs text-white btn-gradient shadow-md cursor-pointer active:scale-95"
            >
              Giao bài tập
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
