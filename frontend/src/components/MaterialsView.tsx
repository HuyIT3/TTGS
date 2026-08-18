import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, FolderOpen, Upload, Trash2, ArrowLeft, Award, FileSpreadsheet, Timer, Plus, X, BookOpen, Star, Sparkles, Cpu, Trophy, Calendar, GraduationCap } from 'lucide-react';

interface MaterialQuestion {
  id: number;
  type: 'MCQ' | 'TF' | 'SHORT';
  text: string;
  options?: string[];
  statements?: string[];
  correctAnswer: any;
}

interface MaterialFile {
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  isExam?: boolean;
  duration?: number;
  questions?: MaterialQuestion[];
  answerKeyName?: string;
  fileUrl?: string;
}

export default function MaterialsView() {
  const { user } = useAuth();
  
  // Custom mock database for materials
  const initialMaterials: Record<string, Record<number, MaterialFile[]>> = {
    'Toán học': {
      1: [
        { name: 'Đề cương lý thuyết Toán Chương 1 - Mệnh đề & Tập hợp.pdf', size: '1.4 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' },
        { name: 'Bài tập tự luyện Mệnh đề Toán học nâng cao.docx', size: '850 KB', uploadedAt: '10/07/2026', uploadedBy: 'Admin' }
      ],
      2: [
        { name: 'Tài liệu Hàm số bậc nhất và bậc hai nâng cao.pdf', size: '2.1 MB', uploadedAt: '05/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' }
      ],
      3: [
        { 
          name: 'Đề thi khảo sát chất lượng Lớp 12 Toán học (THPT Quốc Gia).pdf', 
          size: '1.8 MB', 
          uploadedAt: '13/07/2026', 
          uploadedBy: 'Admin', 
          isExam: true, 
          duration: 90, 
          questions: [
            { id: 1, type: 'MCQ', text: 'Tìm tập xác định D của hàm số y = log(x - 3).', options: ['D = (3; +∞)', 'D = [3; +∞)', 'D = R \\ {3}', 'D = (0; +∞)'], correctAnswer: 'A' },
            { id: 2, type: 'TF', text: 'Cho hàm số y = x³ - 3x + 1. Khảo sát các mệnh đề sau:', statements: ['a) Hàm số đồng biến trên các khoảng (-∞; -1) và (1; +∞).', 'b) Hàm số đạt cực đại tại điểm x = 1.', 'c) Điểm uốn của đồ thị hàm số có tọa độ là I(0; 1).', 'd) Giá trị cực tiểu của hàm số bằng -1.'], correctAnswer: { 0: true, 1: false, 2: true, 3: true } },
            { id: 3, type: 'SHORT', text: 'Tìm giá trị nguyên nhỏ nhất của tham số m để hàm số y = x³ - 3x² + mx đồng biến trên R.', correctAnswer: '3' }
          ],
          answerKeyName: 'Đề thi khảo sát Lớp 12 Toán - Hướng dẫn giải chi tiết.pdf' 
        }
      ],
      4: [
        { name: 'Tài liệu ôn tập tổng hợp Toán học học kỳ 1.pdf', size: '3.5 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }
      ]
    },
    'Ngữ văn': {
      1: [{ name: 'Tổng hợp các tác phẩm văn học lớp 12 trọng tâm.pdf', size: '3.2 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Trần Thị Lan' }],
      2: [{ name: 'Nghị luận xã hội tuyển chọn các bài viết đạt giải cao.docx', size: '920 KB', uploadedAt: '10/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi thử môn Ngữ Văn Lớp 12 kỳ thi tốt nghiệp.pdf', size: '1.1 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 90, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp Ngữ văn học kỳ 1.pdf', size: '2.5 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    },
    'Tiếng Anh': {
      1: [{ name: 'Tóm tắt ngữ pháp tiếng Anh trọng tâm Lớp 12.pdf', size: '2.7 MB', uploadedAt: '11/07/2026', uploadedBy: 'Gia sư Trần Thị Lan' }],
      2: [{ name: 'Bài tập trắc nghiệm chuyên đề Verb Tenses nâng cao.docx', size: '650 KB', uploadedAt: '09/07/2026', uploadedBy: 'Gia sư Trần Thị Lan' }],
      3: [{ name: 'Đề thi thử trắc nghiệm Tiếng Anh Lớp 12 - Đề số 1.pdf', size: '1.8 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 60, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp Tiếng Anh học kỳ 1.pdf', size: '2.1 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    },
    'Vật lý': {
      1: [{ name: 'Đề cương ôn tập Vật lý Chương Dao động cơ Lớp 12.pdf', size: '1.6 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' }],
      2: [{ name: 'Bài tập tự luyện trắc nghiệm Dao động điều hòa nâng cao.docx', size: '890 KB', uploadedAt: '10/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi thử trắc nghiệm Vật lý Lớp 12 THPT.pdf', size: '2.0 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 50, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp Vật lý học kỳ 1.pdf', size: '3.0 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    },
    'Hóa học': {
      1: [{ name: 'Đề cương ôn tập Hóa học Chương Este - Lipit Lớp 12.pdf', size: '1.5 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' }],
      2: [{ name: 'Bài tập chuỗi phản ứng hữu cơ ôn thi tốt nghiệp.docx', size: '750 KB', uploadedAt: '09/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi thử trắc nghiệm Hóa học Lớp 12 tốt nghiệp.pdf', size: '1.9 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 50, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp Hóa học học kỳ 1.pdf', size: '2.9 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    },
    'Khoa học tự nhiên': {
      1: [{ name: 'Đề cương ôn tập KHTN Chương Vật sống Lớp 12.pdf', size: '1.3 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' }],
      2: [{ name: 'Bài tập trắc nghiệm KHTN ôn tập giữa kỳ 1.docx', size: '700 KB', uploadedAt: '10/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi trắc nghiệm KHTN Lớp 12 học kỳ 1.pdf', size: '1.7 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 45, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp KHTN học kỳ 1.pdf', size: '2.3 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    }
  };

  const [materials, setMaterials] = useState<Record<string, Record<number, MaterialFile[]>>>(() => {
    const saved = localStorage.getItem('ttgs_materials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved materials', e);
      }
    }
    return initialMaterials;
  });

  useEffect(() => {
    localStorage.setItem('ttgs_materials', JSON.stringify(materials));
  }, [materials]);

  const [activeMaterialsSubject, setActiveMaterialsSubject] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [activeGrade] = useState('12');
  
  // Teacher Exam Creator States
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configExamTitle, setConfigExamTitle] = useState('');
  const [configDuration, setConfigDuration] = useState(45);
  const [configAnswerKeyName, setConfigAnswerKeyName] = useState('');
  const [configQuestions, setConfigQuestions] = useState<MaterialQuestion[]>([]);
  const [tempFileForConfig, setTempFileForConfig] = useState<any>(null);
  
  // Custom Counts for Teacher Exam Creator
  const [configNumMCQ, setConfigNumMCQ] = useState(12);
  const [configNumTF, setConfigNumTF] = useState(4);
  const [configNumShort, setConfigNumShort] = useState(6);

  // Student Exam Room States
  const [activeExam, setActiveExam] = useState<MaterialFile | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, any>>({});
  const [examTimeRemaining, setExamTimeRemaining] = useState(2700); // 45 minutes
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [studentName, setStudentName] = useState(user?.fullName || '');
  const [studentClass, setStudentClass] = useState(user?.role === 'STUDENT' ? 'Học sinh' : 'Lớp 12');
  const [examActiveTab, setExamActiveTab] = useState<'take' | 'leaderboard'>('take');

  // General Leaderboard Viewer State (Outside of Exam Room)
  const [leaderboardExamName, setLeaderboardExamName] = useState<string | null>(null);

  const canUpload = user?.role === 'TEACHER';

  // Preset Questions
  const presetQuestions: MaterialQuestion[] = [
    { id: 1, type: 'MCQ', text: 'Tìm tập xác định D của hàm số y = log(x - 3).', options: ['D = (3; +∞)', 'D = [3; +∞)', 'D = R \\ {3}', 'D = (0; +∞)'], correctAnswer: 'A' },
    { id: 2, type: 'TF', text: 'Cho hàm số y = x³ - 3x + 1. Khảo sát các mệnh đề sau:', statements: ['a) Hàm số đồng biến trên các khoảng (-∞; -1) và (1; +∞).', 'b) Hàm số đạt cực đại tại điểm x = 1.', 'c) Điểm uốn của đồ thị hàm số có tọa độ là I(0; 1).', 'd) Giá trị cực tiểu của hàm số bằng -1.'], correctAnswer: { 0: true, 1: false, 2: true, 3: true } },
    { id: 3, type: 'SHORT', text: 'Tìm giá trị nguyên nhỏ nhất của tham số m để hàm số y = x³ - 3x² + mx đồng biến trên tập số thực R.', correctAnswer: '3' }
  ];

  // Helper for generating blank configurations
  const handleGenerateConfigQuestions = (numMCQ: number, numTF: number, numShort: number) => {
    const questions: MaterialQuestion[] = [];
    let currentId = 1;
    for (let i = 0; i < numMCQ; i++) {
      questions.push({ id: currentId++, type: 'MCQ', text: '', options: [], correctAnswer: 'A' });
    }
    for (let i = 0; i < numTF; i++) {
      questions.push({ id: currentId++, type: 'TF', text: '', statements: [], correctAnswer: { 0: true, 1: true, 2: true, 3: true } });
    }
    for (let i = 0; i < numShort; i++) {
      questions.push({ id: currentId++, type: 'SHORT', text: '', correctAnswer: '' });
    }
    setConfigQuestions(questions);
  };

  // Ticker for Exam Timer
  useEffect(() => {
    let interval: any;
    if (activeExam && !examSubmitted && examTimeRemaining > 0) {
      interval = setInterval(() => {
        setExamTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (examTimeRemaining === 0 && !examSubmitted && activeExam) {
      handleExamSubmit();
    }
    return () => clearInterval(interval);
  }, [activeExam, examSubmitted, examTimeRemaining]);

  // Exam Config Form Handler
  const handleSaveExamConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMaterialsSubject || !activeChapter || !tempFileForConfig) return;

    const newFile: MaterialFile = {
      name: tempFileForConfig.name,
      size: tempFileForConfig.size,
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
      uploadedBy: user ? user.fullName : 'Giáo viên',
      isExam: true,
      duration: configDuration,
      questions: configQuestions,
      fileUrl: tempFileForConfig.fileUrl,
      answerKeyName: configAnswerKeyName || (configExamTitle + ' - Hướng dẫn giải chi tiết.pdf')
    };

    setMaterials(prev => {
      const subData = prev[activeMaterialsSubject] || {};
      const chData = subData[activeChapter] || [];
      const existsIndex = chData.findIndex(f => f.name === tempFileForConfig.name);
      let updatedChData = [...chData];
      if (existsIndex > -1) {
        updatedChData[existsIndex] = newFile;
      } else {
        updatedChData.push(newFile);
      }
      return {
        ...prev,
        [activeMaterialsSubject]: {
          ...subData,
          [activeChapter]: updatedChData
        }
      };
    });

    alert('Đã lưu cấu hình bài thi: ' + configExamTitle);
    setShowConfigModal(false);
    setTempFileForConfig(null);
    setConfigQuestions([]);
    setConfigAnswerKeyName('');
  };

  // Exam Submit & Grading with Leaderboard saving
  const handleExamSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      alert('Vui lòng điền Họ tên học sinh trước khi nộp bài!');
      return;
    }

    const currentQuestions = activeExam?.questions || [];
    let score = 0;

    if (currentQuestions.length === 0) {
      const mockKeys: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C' };
      let correct = 0;
      if (examAnswers[1] === mockKeys[1]) correct++;
      if (examAnswers[2] && examAnswers[2][0] === true && examAnswers[2][1] === false) correct++;
      if (examAnswers[3] === '3') correct++;
      score = Math.round((correct / 3) * 10 * 10) / 10;
    } else {
      let totalMaxPoints = 0;
      let studentPoints = 0;

      currentQuestions.forEach((q) => {
        if (q.type === 'MCQ') {
          totalMaxPoints += 1.0;
          if (examAnswers[q.id] === q.correctAnswer) {
            studentPoints += 1.0;
          }
        } else if (q.type === 'TF') {
          totalMaxPoints += 1.0;
          const ans = examAnswers[q.id] || {};
          const correctKey = q.correctAnswer || {};
          let correctStatements = 0;
          for (let i = 0; i < 4; i++) {
            if (ans[i] === correctKey[i]) {
              correctStatements += 1;
            }
          }
          if (correctStatements === 1) studentPoints += 0.1;
          else if (correctStatements === 2) studentPoints += 0.25;
          else if (correctStatements === 3) studentPoints += 0.5;
          else if (correctStatements === 4) studentPoints += 1.0;
        } else if (q.type === 'SHORT') {
          totalMaxPoints += 1.0;
          const studAns = (examAnswers[q.id] || '').toString().trim().toLowerCase();
          const correctAns = (q.correctAnswer || '').toString().trim().toLowerCase();
          if (studAns === correctAns) {
            studentPoints += 1.0;
          }
        }
      });

      if (totalMaxPoints > 0) {
        score = Math.round((studentPoints / totalMaxPoints) * 10 * 10) / 10;
      } else {
        score = 0;
      }
    }

    setExamScore(score);
    setExamSubmitted(true);

    // Save attempt to localStorage Leaderboard
    if (activeExam) {
      const examKey = activeExam.name;
      const savedLeaderboard = localStorage.getItem('ttgs_leaderboard');
      let leaderboardData: Record<string, any[]> = savedLeaderboard ? JSON.parse(savedLeaderboard) : {};
      const newEntry = {
        studentName: studentName.trim(),
        studentClass: studentClass.trim() || 'Học viên tự do',
        score: score,
        completedAt: new Date().toLocaleString('vi-VN')
      };
      if (!leaderboardData[examKey]) {
        leaderboardData[examKey] = [];
      }
      leaderboardData[examKey].push(newEntry);
      // Sort desc by score
      leaderboardData[examKey].sort((a, b) => b.score - a.score);
      localStorage.setItem('ttgs_leaderboard', JSON.stringify(leaderboardData));
    }
  };

  const handleExamReset = () => {
    setActiveExam(null);
    setExamAnswers({});
    setExamTimeRemaining(2700);
    setExamSubmitted(false);
    setExamScore(0);
    setExamActiveTab('take');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Helper for loading Leaderboard items
  const getLeaderboardEntries = (examName: string) => {
    const savedLeaderboard = localStorage.getItem('ttgs_leaderboard');
    if (savedLeaderboard) {
      try {
        const data = JSON.parse(savedLeaderboard);
        return data[examName] || [];
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Exam Room Screen */}
      {activeExam ? (
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <button
              onClick={handleExamReset}
              className="px-4 py-2 text-xs font-bold text-slate-605 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <ArrowLeft size={14} />
              Quay lại học tập
            </button>
            
            {/* Take Exam vs Leaderboard Tabs */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1.5">
              <button
                onClick={() => setExamActiveTab('take')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 ${examActiveTab === 'take' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-505'}`}
              >
                Làm bài thi
              </button>
              <button
                onClick={() => setExamActiveTab('leaderboard')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 ${examActiveTab === 'leaderboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-505'}`}
              >
                Bảng vinh danh
              </button>
            </div>

            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-655 px-4 py-2 rounded-2xl shadow-inner font-extrabold text-sm">
              <Timer size={16} className="animate-pulse" />
              <span>{formatTime(examTimeRemaining)}</span>
            </div>
          </div>

          {examActiveTab === 'take' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Panel: PDF Exam Sheet View */}
              <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 min-h-[550px] flex flex-col gap-4 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={20} className="text-rose-500" />
                    <span className="font-bold text-slate-800 truncate text-sm sm:text-base">{activeExam.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">{activeExam.size}</span>
                </div>

                {activeExam.fileUrl ? (
                  <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative min-h-[550px] shadow-inner">
                    <iframe
                      src={activeExam.fileUrl}
                      className="w-full h-full border-0 min-h-[550px]"
                      title="Nội dung đề thi PDF"
                    />
                  </div>
                ) : (
                  <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-[600px] shadow-sm select-none">
                    <div className="text-center border-b border-dashed border-slate-200 pb-4">
                      <h2 className="font-extrabold text-slate-900 uppercase tracking-wide text-sm sm:text-base">ĐỀ THI TRẮC NGHIỆM ĐÁNH GIÁ CHẤT LƯỢNG HỌC TẬP</h2>
                      <span className="text-xs text-sky-655 font-bold mt-1 block">Môn học: {activeMaterialsSubject || 'Tổng hợp'} - Lớp: {activeGrade}</span>
                      <span className="text-[10px] text-slate-450 font-bold mt-0.5 block">Thời gian làm bài: {activeExam.duration || 45} phút</span>
                    </div>

                    <div className="flex flex-col gap-6 text-xs sm:text-sm text-slate-700">
                      <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl leading-relaxed text-sky-700">
                        <strong>Hướng dẫn làm bài:</strong> Trả lời các câu hỏi theo 3 phần cấu trúc (MCQ, Đúng/Sai, Điền từ) tương ứng vào cột phiếu bên phải.
                      </div>

                      {(activeExam.questions && activeExam.questions.length > 0 ? activeExam.questions : presetQuestions).map((item) => (
                        <div key={item.id} className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                          {item.type === 'MCQ' && (
                            <>
                              <strong className="text-slate-800">Câu {item.id} (Trắc nghiệm): {item.text}</strong>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3">
                                {(item.options || []).map((opt, oIdx) => (
                                  <span key={oIdx} className="text-slate-600 font-medium">
                                    <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}

                          {item.type === 'TF' && (
                            <>
                              <strong className="text-slate-800">Câu {item.id} (Đúng/Sai): {item.text}</strong>
                              <div className="flex flex-col gap-1.5 pl-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {(item.statements || []).map((st, sIdx) => (
                                  <span key={sIdx} className="text-slate-655 font-medium block">
                                    {st}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}

                          {item.type === 'SHORT' && (
                            <>
                              <strong className="text-slate-800">Câu {item.id} (Trả lời ngắn): {item.text}</strong>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel: Student Answer Sheet Form */}
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-md flex flex-col">
                <div className="h-2 bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500"></div>

                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">Phiếu làm bài thi học sinh</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">Cấu trúc đề THPT Quốc Gia</span>
                </div>

                <form onSubmit={handleExamSubmit} className="p-6 flex flex-col gap-5 flex-1 max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ và tên thí sinh *</label>
                      <input
                        type="text"
                        required
                        disabled={examSubmitted}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="input-premium rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khối lớp / Trường</label>
                      <input
                        type="text"
                        disabled={examSubmitted}
                        placeholder="Ví dụ: Lớp 12 Tin"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="input-premium rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 mt-2 border-t border-slate-100 pt-4">
                    {/* Part I: MCQ Questions */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] font-extrabold uppercase text-sky-600 bg-sky-50 px-3 py-1 rounded border border-sky-100 tracking-wider">PHẦN I: Trắc nghiệm nhiều lựa chọn</h4>
                      {(activeExam.questions || presetQuestions).filter(q => q.type === 'MCQ').map((q) => (
                        <div key={q.id} className="flex items-center justify-between border-b border-slate-50 pb-2">
                          <span className="text-xs font-bold text-slate-700">Câu {q.id}:</span>
                          <div className="flex gap-4">
                            {['A', 'B', 'C', 'D'].map((opt) => (
                              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name={'q-' + q.id}
                                  required
                                  disabled={examSubmitted}
                                  checked={examAnswers[q.id] === opt}
                                  onChange={() => setExamAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                  className="w-4 h-4 text-sky-500 focus:ring-sky-400 border-slate-300 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-slate-650">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Part II: True/False grids */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded border border-indigo-100 tracking-wider">PHẦN II: Trắc nghiệm Đúng / Sai</h4>
                      {(activeExam.questions || presetQuestions).filter(q => q.type === 'TF').map((q) => (
                        <div key={q.id} className="flex flex-col gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                          <span className="text-xs font-bold text-slate-800">Câu {q.id}:</span>
                          <div className="flex flex-col gap-2">
                            {['a', 'b', 'c', 'd'].map((stChar, sIdx) => {
                              const currentVal = (examAnswers[q.id] || {})[sIdx];
                              return (
                                <div key={sIdx} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1">
                                  <span className="text-slate-605 font-bold font-mono">{stChar})</span>
                                  <div className="flex gap-3">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`q-${q.id}-st-${sIdx}`}
                                        required
                                        disabled={examSubmitted}
                                        checked={currentVal === true}
                                        onChange={() => setExamAnswers(prev => {
                                          const qAns = prev[q.id] || {};
                                          return { ...prev, [q.id]: { ...qAns, [sIdx]: true } };
                                        })}
                                        className="w-4.5 h-4.5 text-emerald-500 focus:ring-emerald-400 border-slate-350 cursor-pointer"
                                      />
                                      <span className="font-bold text-emerald-600 text-[10px]">Đúng</span>
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`q-${q.id}-st-${sIdx}`}
                                        required
                                        disabled={examSubmitted}
                                        checked={currentVal === false}
                                        onChange={() => setExamAnswers(prev => {
                                          const qAns = prev[q.id] || {};
                                          return { ...prev, [q.id]: { ...qAns, [sIdx]: false } };
                                        })}
                                        className="w-4.5 h-4.5 text-rose-500 focus:ring-rose-400 border-slate-350 cursor-pointer"
                                      />
                                      <span className="font-bold text-rose-600 text-[10px]">Sai</span>
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Part III: Short answer inputs */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] font-extrabold uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-100 tracking-wider">PHẦN III: Trắc nghiệm Trả lời ngắn</h4>
                      {(activeExam.questions || presetQuestions).filter(q => q.type === 'SHORT').map((q) => (
                        <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                          <span className="text-xs font-bold text-slate-800">Câu {q.id}:</span>
                          <input
                            type="text"
                            required
                            disabled={examSubmitted}
                            placeholder="Điền kết quả số/chữ..."
                            value={examAnswers[q.id] || ''}
                            onChange={(e) => setExamAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="input-premium rounded-lg px-3 py-2 text-xs text-slate-800 max-w-[200px] w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {examSubmitted ? (
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="font-bold text-slate-700">Điểm số tổng cộng:</span>
                        <span className="font-black text-sky-655 bg-sky-100/70 px-3 py-1 rounded-xl border border-sky-200">
                          {examScore} / 10.0 Điểm
                        </span>
                      </div>
                      {activeExam.answerKeyName && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                          <span className="text-[10px] text-slate-455 font-bold uppercase">Tài liệu hướng dẫn giải:</span>
                          <button
                            type="button"
                            onClick={() => alert('Đang tải tệp đáp án: ' + activeExam.answerKeyName)}
                            className="text-[11px] text-sky-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={12} />
                            <span>Tải đáp án chi tiết</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white btn-gradient shadow-md cursor-pointer active:scale-95 mt-2"
                    >
                      Nộp bài thi
                    </button>
                  )}
                </form>
              </div>
            </div>
          ) : (
            /* Inside Exam Room Leaderboard Tab */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col gap-6 max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Trophy className="text-amber-500 animate-bounce" size={24} />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Bảng vinh danh thi thử trắc nghiệm</h3>
                  <p className="text-xs text-slate-450 mt-0.5">Danh sách học sinh hoàn thành xuất sắc đề thi: {activeExam.name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {getLeaderboardEntries(activeExam.name).length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    Chưa có lượt nộp bài nào được ghi nhận cho đề thi này. Hãy là người đầu tiên chinh phục đỉnh bảng!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                          <th className="py-3 px-4">Xếp hạng</th>
                          <th className="py-3 px-4">Họ và Tên</th>
                          <th className="py-3 px-4">Khối lớp</th>
                          <th className="py-3 px-4 text-center">Điểm số</th>
                          <th className="py-3 px-4 text-right">Ngày hoàn thành</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getLeaderboardEntries(activeExam.name).map((entry: any, index: number) => (
                          <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 flex items-center gap-1.5 font-bold">
                              {index === 0 && <span className="text-amber-500 text-sm">🥇 #1</span>}
                              {index === 1 && <span className="text-slate-400 text-sm">🥈 #2</span>}
                              {index === 2 && <span className="text-amber-700 text-sm">🥉 #3</span>}
                              {index > 2 && <span className="text-slate-500 text-xs pl-2">#{index + 1}</span>}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-bold text-slate-800">{entry.studentName}</td>
                            <td className="py-3.5 px-4 text-xs text-slate-555">{entry.studentClass}</td>
                            <td className="py-3.5 px-4 text-xs font-black text-center text-sky-655 font-mono">
                              <span className="bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100">{entry.score} / 10.0</span>
                            </td>
                            <td className="py-3.5 px-4 text-[10px] text-slate-400 text-right">{entry.completedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : leaderboardExamName ? (
        /* 2. Standalone Leaderboard View (Outside of Exam Room) */
        <div className="max-w-4xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col gap-6 animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="text-amber-500 animate-bounce" size={24} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Bảng vinh danh - Xếp hạng thi</h3>
                <p className="text-xs text-slate-400 mt-0.5">Đề thi: {leaderboardExamName}</p>
              </div>
            </div>
            <button
              onClick={() => setLeaderboardExamName(null)}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Quay lại danh mục
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {getLeaderboardEntries(leaderboardExamName).length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                Chưa có lượt nộp bài nào được ghi nhận cho đề thi này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                      <th className="py-3 px-4">Xếp hạng</th>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-4">Khối lớp</th>
                      <th className="py-3 px-4 text-center">Điểm số</th>
                      <th className="py-3 px-4 text-right">Ngày hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLeaderboardEntries(leaderboardExamName).map((entry: any, index: number) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-1.5 font-bold">
                          {index === 0 && <span className="text-amber-500 text-sm">🥇 #1</span>}
                          {index === 1 && <span className="text-slate-400 text-sm">🥈 #2</span>}
                          {index === 2 && <span className="text-amber-700 text-sm">🥉 #3</span>}
                          {index > 2 && <span className="text-slate-500 text-xs pl-2">#{index + 1}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-800">{entry.studentName}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-555">{entry.studentClass}</td>
                        <td className="py-3.5 px-4 text-xs font-black text-center text-sky-655 font-mono">
                          <span className="bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100">{entry.score} / 10.0</span>
                        </td>
                        <td className="py-3.5 px-4 text-[10px] text-slate-400 text-right">{entry.completedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 3. General Materials Catalog List View */
        <div className="flex flex-col gap-6">
          {/* Subject selections grid (Toán, Lý, Văn, v.v.) */}
          {activeMaterialsSubject === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Toán học', bg: 'from-sky-500 to-sky-655', icon: '📐', desc: 'Mệnh đề, Hàm số, Giải tích và Hình học không gian nâng cao.' },
                { name: 'Ngữ văn', bg: 'from-rose-500 to-rose-600', icon: '✍️', desc: 'Phân tích các tác phẩm thơ ca, truyện ngắn và kỹ năng viết nghị luận.' },
                { name: 'Tiếng Anh', bg: 'from-emerald-500 to-emerald-600', icon: '🇬🇧', desc: 'Ngữ pháp, phát âm nâng cao, từ vựng và bài thi THPT.' },
                { name: 'Vật lý', bg: 'from-indigo-500 to-indigo-600', icon: '⚡', desc: 'Dao động cơ, sóng cơ, dòng điện xoay chiều và vật lý hạt nhân.' },
                { name: 'Hóa học', bg: 'from-amber-500 to-amber-600', icon: '🧪', desc: 'Este - Lipit, amin, carbohydrate, kim loại kiềm và vô cơ.' },
                { name: 'Khoa học tự nhiên', bg: 'from-violet-500 to-violet-600', icon: '🌱', desc: 'Kiến thức tích hợp sinh học, địa chất và khoa học tự nhiên.' }
              ].map((subject) => (
                <div
                  key={subject.name}
                  onClick={() => {
                    setActiveMaterialsSubject(subject.name);
                    setActiveChapter(null);
                  }}
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer flex flex-col gap-4 relative group overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-3xl">{subject.icon}</span>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-sky-600 transition-colors uppercase tracking-wider">Truy cập học liệu →</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-sky-655 transition-colors">{subject.name}</h3>
                    <p className="text-xs text-slate-450 leading-relaxed mt-1.5">{subject.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Subject chapters dashboard */
            <div className="flex flex-col gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMaterialsSubject(null);
                      setActiveChapter(null);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-555 transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{activeMaterialsSubject} - Lớp {activeGrade}</h3>
                    <span className="text-xs text-slate-400 font-semibold">Chọn chương mục để xem tài liệu & làm đề ôn thi</span>
                  </div>
                </div>
              </div>

              {/* Chapters selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 1, title: 'Chương 1: Kiến thức cơ bản' },
                  { id: 2, title: 'Chương 2: Bài tập tự luyện' },
                  { id: 3, title: 'Chương 3: Đề thi & Luyện đề' },
                  { id: 4, title: 'Chương 4: Ôn tập tổng hợp' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(ch.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer duration-200 active:scale-95 flex flex-col gap-2 ${
                      activeChapter === ch.id
                        ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-inner'
                        : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FolderOpen size={20} className={activeChapter === ch.id ? 'text-sky-600' : 'text-slate-400'} />
                    <span className="text-xs font-bold leading-tight">{ch.title}</span>
                  </button>
                ))}
              </div>

              {/* Document/exam items under the selected chapter */}
              {activeChapter && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-slate-100 pt-6">
                  {/* File List */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <h4 className="text-xs font-extrabold uppercase text-slate-450 tracking-wider">Danh sách tài liệu học tập</h4>

                    {(!materials[activeMaterialsSubject] ||
                      !materials[activeMaterialsSubject][activeChapter] ||
                      materials[activeMaterialsSubject][activeChapter].length === 0) ? (
                      <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        Chưa có tài liệu nào trong chương mục này.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {materials[activeMaterialsSubject][activeChapter].map((file, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 hover:border-slate-200 rounded-xl transition-all"
                          >
                            <div className="flex items-center gap-3 truncate">
                              <FileText size={18} className="text-rose-500 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-750 truncate">{file.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                  {file.size} • Đăng bởi: {file.uploadedBy} • {file.uploadedAt}
                                </span>
                                {file.duration && (
                                  <span className="text-[9px] font-bold text-sky-655 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded w-max mt-1">
                                    Thời gian: {file.duration} phút • {file.questions?.length || 0} câu hỏi (Phiếu điền tự động)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {file.isExam && (
                                <>
                                  <button
                                    onClick={() => {
                                      setActiveExam(file);
                                      setExamAnswers({});
                                      setExamTimeRemaining((file.duration || 45) * 60);
                                      setExamSubmitted(false);
                                      setExamScore(0);
                                      setStudentName(user?.fullName || '');
                                    }}
                                    className="px-3 py-1 rounded bg-rose-500 text-white font-bold text-[10px] hover:bg-rose-600 transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                                  >
                                    <FileSpreadsheet size={10} />
                                    <span>Làm đề</span>
                                  </button>
                                  <button
                                    onClick={() => setLeaderboardExamName(file.name)}
                                    className="px-3 py-1 rounded bg-amber-500 text-white font-bold text-[10px] hover:bg-amber-600 transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                                  >
                                    <Trophy size={10} />
                                    <span>Vinh danh</span>
                                  </button>
                                </>
                              )}

                              {canUpload && (
                                <button
                                  onClick={() => {
                                    if (file.isExam && file.questions && file.questions.length > 0) {
                                      const mcqs = file.questions.filter(q => q.type === 'MCQ').length;
                                      const tfs = file.questions.filter(q => q.type === 'TF').length;
                                      const shorts = file.questions.filter(q => q.type === 'SHORT').length;
                                      setConfigNumMCQ(mcqs);
                                      setConfigNumTF(tfs);
                                      setConfigNumShort(shorts);
                                      setConfigQuestions(file.questions);
                                    } else {
                                      setConfigNumMCQ(12);
                                      setConfigNumTF(4);
                                      setConfigNumShort(6);
                                      const defaultQuestions: MaterialQuestion[] = [];
                                      let currentId = 1;
                                      for (let i = 0; i < 12; i++) {
                                        defaultQuestions.push({ id: currentId++, type: 'MCQ', text: '', options: [], correctAnswer: 'A' });
                                      }
                                      for (let i = 0; i < 4; i++) {
                                        defaultQuestions.push({ id: currentId++, type: 'TF', text: '', statements: [], correctAnswer: { 0: true, 1: true, 2: true, 3: true } });
                                      }
                                      for (let i = 0; i < 6; i++) {
                                        defaultQuestions.push({ id: currentId++, type: 'SHORT', text: '', correctAnswer: '' });
                                      }
                                      setConfigQuestions(defaultQuestions);
                                    }
                                    setTempFileForConfig(file);
                                    setConfigExamTitle(file.name.replace(/\.[^/.]+$/, ""));
                                    setConfigAnswerKeyName(file.answerKeyName || (file.name.replace(/\.[^/.]+$/, "") + ' - Hướng dẫn giải chi tiết.pdf'));
                                    setConfigDuration(file.duration || 45);
                                    setShowConfigModal(true);
                                  }}
                                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus size={10} />
                                  <span>{file.isExam ? 'Sửa đề' : 'Tạo Test'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => alert('Bắt đầu tải tài liệu: ' + file.name)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-500 hover:text-sky-600 transition-colors cursor-pointer active:scale-95 shadow-sm"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload box for Teachers */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-extrabold uppercase text-slate-455 tracking-wider">Tải tài liệu mới lên</h4>
                    {canUpload ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 min-h-[200px]">
                        <Upload size={24} className="text-slate-400 animate-pulse" />
                        <div className="text-xs flex flex-col gap-1 text-slate-500">
                          <span className="font-bold text-slate-700">Tải lên tệp đề bài mới</span>
                          <span>Định dạng hỗ trợ: PDF, tối đa 20MB</span>
                        </div>
                        <div className="relative mt-2">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const fileSizeStr = (file.size / 1024 / 1024).toFixed(1) + ' MB';
                                const url = URL.createObjectURL(file);
                                setConfigNumMCQ(12);
                                setConfigNumTF(4);
                                setConfigNumShort(6);
                                handleGenerateConfigQuestions(12, 4, 6);
                                setTempFileForConfig({ name: file.name, size: fileSizeStr, fileUrl: url });
                                setConfigExamTitle(file.name.replace(/\.[^/.]+$/, ""));
                                setConfigAnswerKeyName(file.name.replace(/\.[^/.]+$/, "") + ' - Hướng dẫn giải chi tiết.pdf');
                                setConfigDuration(45);
                                setShowConfigModal(true);
                              }
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                          <button className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95">
                            Chọn tệp đề thi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl text-xs text-sky-700 leading-relaxed font-semibold">
                        Góc học tập & Luyện đề trực tuyến dành cho Học viên. Vui lòng bấm <strong>Làm đề</strong> bên cạnh bài thi bất kỳ để bắt đầu kiểm tra và chấm điểm tự động.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Teacher Custom Exam Creator/Modifier Modal */}
      {showConfigModal && tempFileForConfig && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-fade-in-up flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Cấu hình Đề thi trắc nghiệm (Giáo viên)</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Tệp đề thi: {tempFileForConfig.name} ({tempFileForConfig.size})</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  setTempFileForConfig(null);
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 transition-all cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveExamConfig} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex flex-col lg:flex-row gap-6 overflow-y-auto flex-1 max-h-[70vh]">
                {/* Left Column: PDF Source preview (for visual review) */}
                <div className="flex-1 min-h-[450px] lg:min-h-0 flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-505 uppercase tracking-wide">Tệp đề thi gốc (PDF)</span>
                    <label className="text-[10px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer transition-colors flex items-center gap-1">
                      <Upload size={11} />
                      <span>{tempFileForConfig.fileUrl ? 'Thay đổi tệp PDF' : 'Tải lên PDF'}</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const url = URL.createObjectURL(file);
                            setTempFileForConfig((prev: any) => prev ? { ...prev, fileUrl: url } : null);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {tempFileForConfig.fileUrl ? (
                    <div className="flex-1 min-h-[400px] lg:min-h-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                      <iframe
                        src={tempFileForConfig.fileUrl}
                        className="w-full h-full border-0 min-h-[400px]"
                        title="Đề thi gốc cấu hình"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-h-[400px] lg:min-h-0 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-250 flex flex-col items-center justify-center p-6 text-center gap-3">
                      <Upload size={32} className="text-slate-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-655">Đề thi chưa có tệp PDF gốc để học sinh xem bên cạnh</span>
                      <span className="text-[10px] text-slate-400 leading-relaxed max-w-[250px]">Hãy tải lên đề thi dưới dạng file PDF gốc để hiển thị cho học sinh khi làm bài.</span>
                      <label className="px-4 py-2 bg-sky-655 hover:bg-sky-700 text-white rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-sm">
                        Tải lên đề thi PDF
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const url = URL.createObjectURL(file);
                              setTempFileForConfig((prev: any) => prev ? { ...prev, fileUrl: url } : null);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Right Column: Configuration inputs & Question editors */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề đề thi</label>
                      <input
                        type="text"
                        required
                        value={configExamTitle}
                        onChange={(e) => setConfigExamTitle(e.target.value)}
                        className="input-premium rounded-xl px-4 py-3 text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thời gian làm bài (Phút)</label>
                      <select
                        value={configDuration}
                        onChange={(e) => setConfigDuration(Number(e.target.value))}
                        className="input-premium rounded-xl px-4 py-3 text-xs text-slate-700 cursor-pointer font-bold"
                      >
                        <option value={15}>15 phút</option>
                        <option value={30}>30 phút</option>
                        <option value={45}>45 phút</option>
                        <option value={60}>60 phút</option>
                        <option value={90}>90 phút</option>
                        <option value={120}>120 phút</option>
                      </select>
                    </div>
                  </div>

                  {/* Upload Answer key details */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên tệp đáp án chi tiết (Đăng kèm hướng dẫn giải)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đề thi toán - Hướng dẫn giải chi tiết.pdf"
                      value={configAnswerKeyName}
                      onChange={(e) => setConfigAnswerKeyName(e.target.value)}
                      className="input-premium rounded-xl px-4 py-3 text-xs text-slate-800"
                    />
                  </div>

                  {/* Configuration of question counts */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Cấu trúc Số lượng câu hỏi</h4>
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">MCQ (Phần I)</label>
                        <input
                          type="number"
                          min={0}
                          value={configNumMCQ}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setConfigNumMCQ(val);
                            handleGenerateConfigQuestions(val, configNumTF, configNumShort);
                          }}
                          className="input-premium rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Đúng/Sai (Phần II)</label>
                        <input
                          type="number"
                          min={0}
                          value={configNumTF}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setConfigNumTF(val);
                            handleGenerateConfigQuestions(configNumMCQ, val, configNumShort);
                          }}
                          className="input-premium rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Điền từ (Phần III)</label>
                        <input
                          type="number"
                          min={0}
                          value={configNumShort}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setConfigNumShort(val);
                            handleGenerateConfigQuestions(configNumMCQ, configNumTF, val);
                          }}
                          className="input-premium rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom question builder UI - Answer Key configurator */}
                  <div className="flex flex-col gap-4">
                    <div className="border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-extrabold uppercase text-slate-455 tracking-wider">Đáp án đúng của đề thi (Key)</h4>
                      <span className="text-[9px] text-sky-600 font-bold block mt-0.5">*Nhập đáp án đúng tương ứng để hệ thống tự động chấm điểm cho học sinh</span>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                      {configQuestions.map((q) => (
                        <div key={q.id}>
                          {q.type === 'MCQ' && (
                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between shadow-sm">
                              <span className="text-xs font-bold text-slate-700">Câu {q.id} (Trắc nghiệm):</span>
                              <div className="flex gap-3">
                                {['A', 'B', 'C', 'D'].map((char) => (
                                  <label key={char} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`config-ans-key-${q.id}`}
                                      checked={q.correctAnswer === char}
                                      onChange={() => setConfigQuestions(prev => prev.map(item => item.id === q.id ? { ...item, correctAnswer: char } : item))}
                                      className="w-4 h-4 text-sky-500 border-slate-300 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-605">{char}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {q.type === 'TF' && (
                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col gap-2 shadow-sm">
                              <span className="text-xs font-bold text-slate-700">Câu {q.id} (Đúng / Sai):</span>
                              <div className="flex flex-col gap-1.5 pl-3">
                                {['a', 'b', 'c', 'd'].map((char, stIdx) => (
                                  <div key={char} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1 last:border-b-0">
                                    <span className="text-slate-505 font-bold font-mono">Ý {char})</span>
                                    <div className="flex gap-3">
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`config-ans-key-${q.id}-${stIdx}`}
                                          checked={q.correctAnswer[stIdx] === true}
                                          onChange={() => setConfigQuestions(prev => prev.map(item => {
                                            if (item.id === q.id) {
                                              return { ...item, correctAnswer: { ...item.correctAnswer, [stIdx]: true } };
                                            }
                                            return item;
                                          }))}
                                          className="w-3.5 h-3.5 text-emerald-500 cursor-pointer"
                                        />
                                        <span className="text-[10px] font-bold text-emerald-600">Đúng</span>
                                      </label>
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`config-ans-key-${q.id}-${stIdx}`}
                                          checked={q.correctAnswer[stIdx] === false}
                                          onChange={() => setConfigQuestions(prev => prev.map(item => {
                                            if (item.id === q.id) {
                                              return { ...item, correctAnswer: { ...item.correctAnswer, [stIdx]: false } };
                                            }
                                            return item;
                                          }))}
                                          className="w-3.5 h-3.5 text-rose-500 cursor-pointer"
                                        />
                                        <span className="text-[10px] font-bold text-rose-600">Sai</span>
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {q.type === 'SHORT' && (
                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col gap-1.5 shadow-sm">
                              <label className="text-xs font-bold text-slate-700">Câu {q.id} (Điền từ/số):</label>
                              <input
                                type="text"
                                required
                                placeholder="Nhập đáp án đúng..."
                                value={q.correctAnswer}
                                onChange={(e) => setConfigQuestions(prev => prev.map(item => item.id === q.id ? { ...item, correctAnswer: e.target.value } : item))}
                                className="input-premium rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-end gap-3 flex-shrink-0 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false);
                    setTempFileForConfig(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-605 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200 shadow-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
                >
                  Tạo đề & Lưu tài liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
