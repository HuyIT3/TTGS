import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Timer, Check, X, ArrowLeft, Trophy, Award, Plus, Trash2, Clock, ShieldCheck, HelpCircle, BarChart2 } from 'lucide-react';

interface ExamQuestion {
  id: number;
  text: string;
  options: string[]; // 4 options
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
}

interface MockExam {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  grade: string;
  uploadedBy: string;
  createdAt: string;
  questions: ExamQuestion[];
}

interface ExamResult {
  examId: string;
  examTitle: string;
  studentName: string;
  score: number; // scale 10
  correctCount: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  date: string;
}

const defaultExams: MockExam[] = [
  {
    id: 'exam-1',
    title: 'Đề luyện thi THPT Quốc Gia môn Toán 2026 - Đề số 1',
    subject: 'Toán học',
    duration: 15, // 15 mins for testing
    grade: 'Lớp 12',
    uploadedBy: 'Gia sư Nguyễn Văn Hùng',
    createdAt: '10/08/2026',
    questions: [
      {
        id: 1,
        text: 'Tìm tập xác định D của hàm số y = log(x - 3).',
        options: ['D = (3; +∞)', 'D = [3; +∞)', 'D = R \\ {3}', 'D = (0; +∞)'],
        correctAnswer: 'A',
        explanation: 'Hàm số logarit y = log_a(u) xác định khi u > 0. Do đó, x - 3 > 0 <=> x > 3. Vậy tập xác định D = (3; +∞).'
      },
      {
        id: 2,
        text: 'Tính đạo hàm của hàm số y = e^(2x).',
        options: ['y\' = e^(2x)', 'y\' = 2e^(2x)', 'y\' = e^(2x) / 2', 'y\' = 2x * e^(2x-1)'],
        correctAnswer: 'B',
        explanation: 'Áp dụng công thức đạo hàm hàm hợp (e^u)\' = u\' * e^u. Ta có (e^(2x))\' = (2x)\' * e^(2x) = 2e^(2x).'
      },
      {
        id: 3,
        text: 'Tìm giá trị cực đại y_CD của hàm số y = -x^3 + 3x + 1.',
        options: ['y_CD = -1', 'y_CD = 1', 'y_CD = 3', 'y_CD = 0'],
        correctAnswer: 'C',
        explanation: 'Ta có y\' = -3x^2 + 3. Cho y\' = 0 <=> x = ±1. Bảng biến thiên cho thấy hàm số đạt cực đại tại x = 1. Giá trị cực đại y_CD = y(1) = -1 + 3 + 1 = 3.'
      },
      {
        id: 4,
        text: 'Tính thể tích V của khối cầu có bán kính R = 3.',
        options: ['V = 36π', 'V = 12π', 'V = 9π', 'V = 27π'],
        correctAnswer: 'A',
        explanation: 'Công thức thể tích khối cầu V = 4/3 * π * R^3. Với R = 3, V = 4/3 * π * 27 = 36π.'
      },
      {
        id: 5,
        text: 'Số phức z = 3 - 4i có môđun bằng bao nhiêu?',
        options: ['|z| = 7', '|z| = 25', '|z| = 5', '|z| = √7'],
        correctAnswer: 'C',
        explanation: 'Môđun của số phức z = a + bi là |z| = √(a^2 + b^2). Với z = 3 - 4i, |z| = √(3^2 + (-4)^2) = √25 = 5.'
      }
    ]
  },
  {
    id: 'exam-2',
    title: 'Đề khảo sát năng lực Tiếng Anh Lớp 12 tốt nghiệp',
    subject: 'Tiếng Anh',
    duration: 10,
    grade: 'Lớp 12',
    uploadedBy: 'Gia sư Trần Thị Lan',
    createdAt: '12/08/2026',
    questions: [
      {
        id: 1,
        text: 'Choose the word whose underlined part differs from the other three in pronunciation:\nA. look_ed_  B. play_ed_  C. wash_ed_  D. stopp_ed_',
        options: ['looked', 'played', 'washed', 'stopped'],
        correctAnswer: 'B',
        explanation: 'Phần gạch chân đuôi "-ed" ở "played" phát âm là /d/, còn các từ còn lại phát âm là /t/ vì đứng sau các phụ âm vô thanh (/k/, /ʃ/, /p/).'
      },
      {
        id: 2,
        text: 'If I ______ enough money, I would buy that luxury laptop.',
        options: ['have', 'had', 'would have', 'had had'],
        correctAnswer: 'B',
        explanation: 'Đây là câu điều kiện loại 2 (diễn tả điều kiện không có thật ở hiện tại). Cấu trúc: If + S + V(quá khứ đơn), S + would + V(inf). Nên chọn "had".'
      },
      {
        id: 3,
        text: 'She decided to ______ playing tennis because she wanted to improve her health.',
        options: ['take up', 'put off', 'look after', 'call off'],
        correctAnswer: 'A',
        explanation: '"take up" có nghĩa là bắt đầu một sở thích/thói quen mới. "put off" là trì hoãn, "look after" là chăm sóc, "call off" là hủy bỏ.'
      },
      {
        id: 4,
        text: 'Find the synonym of the underlined word:\n"The tutor program had a *significant* impact on student test scores."',
        options: ['minor', 'important', 'negative', 'gradual'],
        correctAnswer: 'B',
        explanation: '"significant" nghĩa là đáng kể, quan trọng. Từ đồng nghĩa thích hợp là "important". "minor" là nhỏ/phụ, "negative" là tiêu cực, "gradual" là dần dần.'
      },
      {
        id: 5,
        text: 'Identify the mistake in the following sentence:\n"The student which won the first prize is studying in our center."',
        options: ['The', 'which', 'won', 'is studying'],
        correctAnswer: 'B',
        explanation: '"student" là danh từ chỉ người, do đó đại từ quan hệ thay thế phải là "who" hoặc "that", không dùng "which". Sửa "which" thành "who".'
      }
    ]
  }
];

export default function ExamHallView() {
  const { user } = useAuth();

  // State managers
  const [exams, setExams] = useState<MockExam[]>(() => {
    const saved = localStorage.getItem('ttgs_mock_exams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultExams;
  });

  const [examResults, setExamResults] = useState<ExamResult[]>(() => {
    const saved = localStorage.getItem('ttgs_exam_results');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ttgs_mock_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('ttgs_exam_results', JSON.stringify(examResults));
  }, [examResults]);

  // UI Modes: 'list' | 'taking' | 'result' | 'create'
  const [mode, setMode] = useState<'list' | 'taking' | 'result' | 'create'>('list');
  const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);

  // Student taking exam states
  const [answers, setAnswers] = useState<Record<number, string>>({}); // questionId -> answer ('A', 'B', 'C', 'D')
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [examTimeSpent, setExamTimeSpent] = useState(0);
  const [latestResult, setLatestResult] = useState<ExamResult | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Teacher Exam Creator States
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('Toán học');
  const [newExamDuration, setNewExamDuration] = useState(15);
  const [newExamGrade, setNewExamGrade] = useState('Lớp 12');
  const [newQuestions, setNewQuestions] = useState<ExamQuestion[]>([
    { id: 1, text: '', options: ['', '', '', ''], correctAnswer: 'A', explanation: '' }
  ]);
  const [creatorError, setCreatorError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const timeSpentRef = useRef<number>(0);

  // Countdown timer ticker
  useEffect(() => {
    if (mode === 'taking' && selectedExam) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit when timeout
            handleForceSubmit();
            return 0;
          }
          timeSpentRef.current += 1;
          setExamTimeSpent(timeSpentRef.current);
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, selectedExam]);

  // Start exam practice
  const handleStartExam = (exam: MockExam) => {
    setSelectedExam(exam);
    setAnswers({});
    setTimeRemaining(exam.duration * 60);
    timeSpentRef.current = 0;
    setExamTimeSpent(0);
    setMode('taking');
  };

  // Select bubble option
  const handleSelectOption = (questionId: number, optionLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  // Submit confirmation check
  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(true);
  };

  // Triggered when time runs out
  const handleForceSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    submitAndGradeExam();
  };

  const handleFinalSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowConfirmSubmit(false);
    submitAndGradeExam();
  };

  // Auto-evaluation and score calculation
  const submitAndGradeExam = () => {
    if (!selectedExam) return;

    let correct = 0;
    selectedExam.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / selectedExam.questions.length) * 10 * 10) / 10;

    const result: ExamResult = {
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      studentName: user ? user.fullName : 'Học sinh ẩn danh',
      score: calculatedScore,
      correctCount: correct,
      totalQuestions: selectedExam.questions.length,
      timeSpent: timeSpentRef.current,
      date: new Date().toLocaleDateString('vi-VN')
    };

    setExamResults(prev => [result, ...prev]);
    setLatestResult(result);
    setMode('result');
  };

  // Form handlers for Teacher Exam creation
  const handleAddQuestionForm = () => {
    setNewQuestions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 'A',
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestionForm = (index: number) => {
    if (newQuestions.length === 1) return;
    const list = [...newQuestions];
    list.splice(index, 1);
    // Re-index questions
    const reindexed = list.map((q, idx) => ({ ...q, id: idx + 1 }));
    setNewQuestions(reindexed);
  };

  const handleQuestionFieldChange = (index: number, field: keyof ExamQuestion, value: any) => {
    const list = [...newQuestions];
    list[index] = { ...list[index], [field]: value };
    setNewQuestions(list);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const list = [...newQuestions];
    const opts = [...list[qIndex].options];
    opts[optIndex] = val;
    list[qIndex].options = opts;
    setNewQuestions(list);
  };

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorError(null);

    if (!newExamTitle.trim()) {
      setCreatorError('Vui lòng điền tiêu đề đề thi.');
      return;
    }

    const invalid = newQuestions.some(q => !q.text.trim() || q.options.some(o => !o.trim()) || !q.explanation.trim());
    if (invalid) {
      setCreatorError('Vui lòng điền đầy đủ câu hỏi, 4 phương án trả lời và lời giải chi tiết.');
      return;
    }

    const newExam: MockExam = {
      id: `exam-custom-${Date.now()}`,
      title: newExamTitle,
      subject: newExamSubject,
      duration: newExamDuration,
      grade: newExamGrade,
      uploadedBy: user ? user.fullName : 'Gia sư',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      questions: newQuestions
    };

    setExams(prev => [newExam, ...prev]);

    // Reset Form
    setNewExamTitle('');
    setNewExamSubject('Toán học');
    setNewExamDuration(15);
    setNewQuestions([{ id: 1, text: '', options: ['', '', '', ''], correctAnswer: 'A', explanation: '' }]);
    setMode('list');
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đề thi này không?')) {
      setExams(prev => prev.filter(e => e.id !== id));
      setExamResults(prev => prev.filter(r => r.examId !== id));
    }
  };

  const getLeaderboardForExam = (examId: string) => {
    return examResults
      .filter(r => r.examId === examId)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSpent - b.timeSpent;
      })
      .slice(0, 5);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getUnansweredCount = () => {
    if (!selectedExam) return 0;
    let count = 0;
    selectedExam.questions.forEach((q) => {
      if (!answers[q.id]) count++;
    });
    return count;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. LIST VIEW */}
      {mode === 'list' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-805 text-sm tracking-wide uppercase text-slate-400">Phòng Luyện đề & Thi thử trực tuyến</h3>
              <span className="text-[10px] text-slate-450 font-bold uppercase block mt-0.5">Luyện thi tự động bấm giờ & phân tích đáp án chi tiết</span>
            </div>
            {user?.role === 'TEACHER' && (
              <button
                onClick={() => setMode('create')}
                className="px-4 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap self-start"
              >
                <Plus size={15} />
                <span>Tạo đề thi trắc nghiệm mới</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const leaderboard = getLeaderboardForExam(exam.id);
              const topRecord = leaderboard[0];
              return (
                <div key={exam.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-5 relative overflow-hidden group">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-600">
                        {exam.grade} • {exam.questions.length} câu hỏi
                      </span>
                      {user?.role === 'TEACHER' && exam.id.startsWith('exam-custom-') && (
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Xóa đề này"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-805 text-sm sm:text-base leading-snug group-hover:text-sky-600 transition-colors line-clamp-2">
                      {exam.title}
                    </h4>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <span>Thời gian: {exam.duration} phút</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={13} className="text-slate-400" />
                        <span>Môn: {exam.subject}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span>Gia sư soạn: {exam.uploadedBy}</span>
                      <span>{exam.createdAt}</span>
                    </div>

                    {topRecord && (
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 font-bold shadow-sm">
                        <Trophy size={12} className="text-amber-505 shrink-0" />
                        <span className="truncate">Thủ khoa: {topRecord.studentName} ({topRecord.score}đ - {formatDuration(topRecord.timeSpent)})</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleStartExam(exam)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white btn-gradient transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-sm mt-1"
                    >
                      <Timer size={14} />
                      <span>Bắt đầu làm bài</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TAKING EXAM MODE (IMMERSIVE EXAM ROOM) */}
      {mode === 'taking' && selectedExam && (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full max-w-6xl mx-auto">
          {/* Left Column: Questions List */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            {/* Exam info bar */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/80 shadow-md">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">{selectedExam.title}</h4>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  <span>Môn học: {selectedExam.subject}</span>
                  <span>•</span>
                  <span>Tổng số: {selectedExam.questions.length} câu</span>
                </div>
              </div>
              
              {/* Countdown Ticking timer */}
              <div className={`px-4 py-2.5 rounded-xl border font-bold font-mono text-sm sm:text-base flex items-center gap-1.5 shadow-sm ${
                timeRemaining <= 60
                  ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                  : 'bg-sky-50 text-sky-655 border-sky-100'
              }`}>
                <Clock size={16} />
                <span>Còn lại: {formatDuration(timeRemaining)}</span>
              </div>
            </div>

            {/* Questions area */}
            <div className="flex flex-col gap-6">
              {selectedExam.questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  id={`question-box-${q.id}`}
                  className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-sky-55/80 text-sky-655 border border-sky-100 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {q.text}
                    </h3>
                  </div>

                  {/* MCQ Options list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                    {['A', 'B', 'C', 'D'].map((letter, idx) => {
                      const optText = q.options[idx];
                      const isSelected = answers[q.id] === letter;
                      return (
                        <button
                          key={letter}
                          onClick={() => handleSelectOption(q.id, letter)}
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] ${
                            isSelected
                              ? 'bg-sky-50 border-sky-350 text-sky-655 font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                            isSelected
                              ? 'bg-sky-500 border-sky-600 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>{letter}</span>
                          <span className="truncate max-w-[200px] sm:max-w-xs">{optText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Bubble Answer Sheet Sidebar */}
          <div className="w-full lg:w-80 shrink-0 sticky top-6 flex flex-col gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-md flex flex-col gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono border-b border-slate-100 pb-2">
                Phiếu trả lời trắc nghiệm
              </span>

              {/* Bubble grid */}
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {selectedExam.questions.map((q, idx) => {
                  const hasAnswer = !!answers[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        document.getElementById(`question-box-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        hasAnswer
                          ? 'bg-sky-500 border-sky-600 text-white font-black shadow-sm shadow-sky-400/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleConfirmSubmit}
                className="w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1"
              >
                <Check size={16} />
                <span>Nộp bài thi</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn thoát khỏi phòng thi? Mọi câu trả lời chưa nộp sẽ bị hủy bỏ.')) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setMode('list');
                  }
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-505 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X size={15} />
                <span>Thoát phòng thi</span>
              </button>
            </div>
          </div>

          {/* SUBMIT CONFIRMATION MODAL */}
          {showConfirmSubmit && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 flex flex-col gap-5 animate-fade-in-up text-center">
                <div className="mx-auto bg-amber-50 border border-amber-100 text-amber-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <HelpCircle size={24} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-slate-850 text-base sm:text-lg">Xác nhận nộp bài thi?</h3>
                  {getUnansweredCount() > 0 ? (
                    <p className="text-rose-500 text-xs font-semibold leading-relaxed">
                      ⚠️ Bạn vẫn còn {getUnansweredCount()} câu hỏi chưa trả lời!
                    </p>
                  ) : (
                    <p className="text-slate-500 text-xs font-semibold">
                      Tất cả các câu hỏi đã hoàn tất. Bạn có muốn nộp bài để chấm điểm ngay?
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    Làm tiếp
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
                  >
                    Nộp bài luôn
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. EXAM RESULTS VIEW & SOLUTION REVIEW */}
      {mode === 'result' && selectedExam && latestResult && (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full animate-fade-in-up">
          {/* Results Summary Board */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl relative overflow-hidden text-center flex flex-col gap-6">
            <div className="mx-auto bg-emerald-50 text-emerald-500 w-14 h-14 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
              <ShieldCheck size={28} />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-black text-slate-900 text-xl sm:text-2xl text-gradient-primary">
                Hoàn thành đề kiểm tra!
              </h3>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Kết quả thi trắc nghiệm khách quan</span>
            </div>

            {/* Score circle stats */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Điểm số</span>
                <strong className="text-xl sm:text-2xl font-black text-sky-600 mt-1">{latestResult.score} / 10</strong>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Số câu đúng</span>
                <strong className="text-xl sm:text-2xl font-black text-sky-600 mt-1">{latestResult.correctCount} / {latestResult.totalQuestions}</strong>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Thời gian</span>
                <strong className="text-xl sm:text-2xl font-black text-sky-600 mt-1">{formatDuration(latestResult.timeSpent)}</strong>
              </div>
            </div>

            {/* Honorable Leaderboard */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider flex items-center gap-1 font-mono">
                <Trophy size={13} className="text-amber-500" />
                Bảng điểm danh dự (Top 5)
              </span>
              <div className="flex flex-col gap-2">
                {getLeaderboardForExam(selectedExam.id).map((record, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2.5 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'
                      }`}>{index + 1}</span>
                      <span className="font-bold text-slate-700 truncate max-w-[150px]">{record.studentName}</span>
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-slate-500">
                      <span className="text-sky-600 font-bold">{record.score}đ</span>
                      <span>•</span>
                      <span>{formatDuration(record.timeSpent)}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{record.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-4 mt-2">
              <button
                onClick={() => handleStartExam(selectedExam)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-655 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Clock size={14} />
                <span>Thi lại đề này</span>
              </button>
              <button
                onClick={() => setMode('list')}
                className="flex-1 py-2.5 text-white btn-gradient rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
              >
                <ArrowLeft size={14} />
                <span>Quay về danh sách</span>
              </button>
            </div>
          </div>

          {/* Solution Review Mode Panel */}
          <div className="flex flex-col gap-6 mt-4">
            <h3 className="font-bold text-slate-805 text-sm sm:text-base uppercase tracking-wide border-b border-slate-200 pb-2">
              Xem lại Đáp án & Hướng dẫn giải chi tiết
            </h3>
            
            {selectedExam.questions.map((q, idx) => {
              const studentAns = answers[q.id];
              const isCorrect = studentAns === q.correctAnswer;
              
              return (
                <div key={q.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-sky-55/80 text-sky-655 border border-sky-100 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {q.text}
                    </h4>
                  </div>

                  {/* Options review list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                    {['A', 'B', 'C', 'D'].map((letter, oIdx) => {
                      const optText = q.options[oIdx];
                      const isSelected = studentAns === letter;
                      const isCorrectOpt = q.correctAnswer === letter;

                      let optStyle = 'bg-white border-slate-200 text-slate-700';
                      if (isSelected) {
                        optStyle = isCorrect
                          ? 'bg-emerald-50 border-emerald-350 text-emerald-800 font-bold'
                          : 'bg-rose-50 border-rose-350 text-rose-800 font-bold';
                      } else if (isCorrectOpt) {
                        optStyle = 'bg-emerald-50 border-emerald-350 text-emerald-800 font-bold';
                      }

                      return (
                        <div
                          key={letter}
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between ${optStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                              isCorrectOpt
                                ? 'bg-emerald-500 border-emerald-600 text-white'
                                : isSelected && !isCorrect
                                ? 'bg-rose-500 border-rose-600 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>{letter}</span>
                            <span className="truncate max-w-[200px]">{optText}</span>
                          </div>
                          {isCorrectOpt && <Check size={15} className="text-emerald-600 shrink-0" />}
                          {isSelected && !isCorrect && <X size={15} className="text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation panel */}
                  <div className="mt-2 pl-9">
                    <div className="p-4 bg-sky-50 border border-sky-100 text-sky-850 rounded-2xl flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-sky-655 tracking-wider font-mono">Giải nghĩa / Lời giải chi tiết:</span>
                      <p className="text-xs leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CREATE EXAM VIEW (TEACHER ONLY) */}
      {mode === 'create' && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-2xl mx-auto w-full relative overflow-hidden animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
            <button
              onClick={() => setMode('list')}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer active:scale-95 bg-white shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="font-bold text-slate-805 text-base sm:text-lg">Tạo đề thi trắc nghiệm khách quan mới</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Giao diện soạn đề thi của Gia sư đối tác</span>
            </div>
          </div>

          {creatorError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold mb-4">
              <X size={15} className="text-rose-500 shrink-0" />
              <span>{creatorError}</span>
            </div>
          )}

          <form onSubmit={handleCreateExamSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề đề thi</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đề thi thử THPT Quốc Gia 2026 môn Toán - Đề số 2"
                value={newExamTitle}
                onChange={(e) => setNewExamTitle(e.target.value)}
                className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Môn thi</label>
                <select
                  value={newExamSubject}
                  onChange={(e) => setNewExamSubject(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm cursor-pointer"
                >
                  <option value="Toán học">Toán học</option>
                  <option value="Vật lý">Vật lý</option>
                  <option value="Hóa học">Hóa học</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Ngữ văn">Ngữ văn</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian làm bài (Phút)</label>
                <input
                  type="number"
                  required
                  min={5}
                  max={120}
                  value={newExamDuration}
                  onChange={(e) => setNewExamDuration(Number(e.target.value))}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khối lớp / Cấp độ</label>
                <select
                  value={newExamGrade}
                  onChange={(e) => setNewExamGrade(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm cursor-pointer"
                >
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                  <option value="Luyện thi đại học">Luyện thi đại học</option>
                </select>
              </div>
            </div>

            {/* Questions list creator */}
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Danh sách câu hỏi ({newQuestions.length})</span>
                <button
                  type="button"
                  onClick={handleAddQuestionForm}
                  className="px-3 py-1.5 bg-sky-55/80 text-sky-655 border border-sky-100 hover:bg-sky-500 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Thêm câu hỏi</span>
                </button>
              </div>

              <div className="flex flex-col gap-5 max-h-96 overflow-y-auto pr-1">
                {newQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col gap-3 relative shadow-sm">
                    {newQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionForm(idx)}
                        className="absolute top-2 right-2 p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Xóa câu hỏi này"
                      >
                        <X size={14} />
                      </button>
                    )}

                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">Câu hỏi thứ #{idx + 1}</span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Nội dung câu hỏi</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Ví dụ: Tính giá trị lớn nhất của hàm số..."
                        value={q.text}
                        onChange={(e) => handleQuestionFieldChange(idx, 'text', e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map((letter, oIdx) => (
                        <div key={letter} className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Đáp án {letter}</label>
                          <input
                            type="text"
                            required
                            placeholder={`Nội dung đáp án ${letter}...`}
                            value={q.options[oIdx]}
                            onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Đáp án đúng</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionFieldChange(idx, 'correctAnswer', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Lời giải / Giải thích chi tiết</label>
                        <input
                          type="text"
                          required
                          placeholder="Nhập lời giải để học sinh xem lại sau khi nộp bài..."
                          value={q.explanation}
                          onChange={(e) => handleQuestionFieldChange(idx, 'explanation', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient shadow-md cursor-pointer active:scale-95"
            >
              Lưu đề thi trắc nghiệm
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
