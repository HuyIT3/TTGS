import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, FolderOpen, Upload, Trash2, ArrowLeft, Award, FileSpreadsheet, Timer, Plus, X, BookOpen, Star, Sparkles, Cpu, Trophy, Calendar } from 'lucide-react';

interface MaterialQuestion {
  id: number;
  type: 'MCQ' | 'TF' | 'SHORT';
  text: string;
  options?: string[];
  statements?: string[];
  correctAnswer: any;
  explanation?: string;
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

interface Lesson {
  id: string;
  title: string;
  files: MaterialFile[];
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

const defaultExamsSeed = [
  {
    id: 'exam-1',
    title: 'Đề luyện thi THPT Quốc Gia môn Toán 2026 - Đề số 1',
    subject: 'Toán học',
    duration: 15,
    grade: 'Lớp 12',
    uploadedBy: 'Gia sư Nguyễn Văn Hùng',
    createdAt: '10/08/2026',
    questions: [
      { id: 1, type: 'MCQ', text: 'Tìm tập xác định D của hàm số y = log(x - 3).', options: ['D = (3; +∞)', 'D = [3; +∞)', 'D = R \\ {3}', 'D = (0; +∞)'], correctAnswer: 'A', explanation: 'Hàm số logarit y = log_a(u) xác định khi u > 0. Do đó, x - 3 > 0 <=> x > 3.' },
      { id: 2, type: 'TF', text: 'Cho hàm số y = x³ - 3x + 1. Khảo sát các mệnh đề sau:', statements: ['a) Hàm số đồng biến trên các khoảng (-∞; -1) và (1; +∞).', 'b) Hàm số đạt cực đại tại điểm x = 1.', 'c) Điểm uốn của đồ thị hàm số có tọa độ là I(0; 1).', 'd) Giá trị cực tiểu của hàm số bằng -1.'], correctAnswer: { 0: true, 1: false, 2: true, 3: true } },
      { id: 3, type: 'SHORT', text: 'Tìm giá trị nguyên nhỏ nhất của tham số m để hàm số y = x³ - 3x² + mx đồng biến trên tập số thực R.', correctAnswer: '3', explanation: 'Để hàm số đồng biến trên R thì y\' = 3x² - 6x + m >= 0 với mọi x. Suy ra delta\' = 9 - 3m <= 0 <=> m >= 3.' }
    ]
  }
];

const initialMaterials: Record<string, Record<string, Chapter[]>> = {
  'Toán học': {
    'Lớp 10': [],
    'Lớp 11': [],
    'Lớp 12': [
      {
        id: 'ch-1',
        title: 'Chương 1: Hàm số và Khảo sát đồ thị',
        lessons: [
          {
            id: 'les-1',
            title: 'Bài 1: Sự đồng biến, nghịch biến của hàm số',
            files: [
              { name: 'Lý thuyết sự biến thiên của hàm số.pdf', size: '1.4 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' },
              { name: 'Bài tập cực trị tự luận nâng cao.docx', size: '850 KB', uploadedAt: '10/07/2026', uploadedBy: 'Admin' }
            ]
          },
          {
            id: 'les-2',
            title: 'Bài 2: Cực trị của hàm số bậc ba',
            files: [
              {
                name: 'Đề khảo sát Toán học Lớp 12 số 1.pdf',
                size: '1.8 MB',
                uploadedAt: '13/07/2026',
                uploadedBy: 'Admin',
                isExam: true,
                duration: 15,
                questions: [
                  { id: 1, type: 'MCQ', text: 'Tìm tập xác định D của hàm số y = log(x - 3).', options: ['D = (3; +∞)', 'D = [3; +∞)', 'D = R \\ {3}', 'D = (0; +∞)'], correctAnswer: 'A' },
                  { id: 2, type: 'TF', text: 'Cho hàm số y = x³ - 3x + 1. Khảo sát các mệnh đề sau:', statements: ['a) Hàm số đồng biến trên các khoảng (-∞; -1) và (1; +∞).', 'b) Hàm số đạt cực đại tại điểm x = 1.', 'c) Điểm uốn của đồ thị hàm số có tọa độ là I(0; 1).', 'd) Giá trị cực tiểu của hàm số bằng -1.'], correctAnswer: { 0: true, 1: false, 2: true, 3: true } },
                  { id: 3, type: 'SHORT', text: 'Tìm giá trị nguyên nhỏ nhất của tham số m để hàm số y = x³ - 3x² + mx đồng biến trên R.', correctAnswer: '3' }
                ],
                answerKeyName: 'Đề khảo sát Toán học Lớp 12 - Hướng dẫn giải chi tiết.pdf'
              }
            ]
          }
        ]
      }
    ],
    'Luyện thi đại học': []
  },
  'Ngữ văn': {
    'Lớp 10': [],
    'Lớp 11': [],
    'Lớp 12': [
      {
        id: 'ch-3',
        title: 'Chương 1: Nghị luận văn học Việt Nam',
        lessons: [
          {
            id: 'les-4',
            title: 'Bài 1: Tổng hợp các tác phẩm thơ ca Lớp 12',
            files: [
              { name: 'Bài phân tích tác phẩm Tây Tiến - Quang Dũng.pdf', size: '3.2 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Trần Thị Lan' }
            ]
          }
        ]
      }
    ],
    'Luyện thi đại học': []
  }
};

export default function MaterialsView() {
  const { user } = useAuth();
  const canUpload = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // Top level tab state: 'curriculum' | 'exams-uploader'
  const [activeTopTab, setActiveTopTab] = useState<'curriculum' | 'exams-uploader'>('curriculum');

  // Dynamic Curriculum Database with schema migration support
  const [materials, setMaterials] = useState<Record<string, Record<string, Chapter[]>>>(() => {
    const saved = localStorage.getItem('ttgs_dynamic_materials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const keys = Object.keys(parsed);
        if (keys.length > 0) {
          const firstVal = parsed[keys[0]];
          if (Array.isArray(firstVal)) {
            // Migrating old [Subject]: Chapter[] -> [Subject]: { 'Lớp 12': Chapter[], ... }
            const migrated: Record<string, Record<string, Chapter[]>> = {};
            for (const sub of keys) {
              migrated[sub] = {
                'Lớp 10': [],
                'Lớp 11': [],
                'Lớp 12': parsed[sub] || [],
                'Luyện thi đại học': []
              };
            }
            return migrated;
          }
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse dynamic materials', e);
      }
    }
    return initialMaterials;
  });

  useEffect(() => {
    localStorage.setItem('ttgs_dynamic_materials', JSON.stringify(materials));
  }, [materials]);

  // Curriculum Navigation States
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeGradeLevel, setActiveGradeLevel] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Modal display states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Teacher Exam Configurator Modal States
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configExamTitle, setConfigExamTitle] = useState('');
  const [configDuration, setConfigDuration] = useState(45);
  const [configAnswerKeyName, setConfigAnswerKeyName] = useState('');
  const [configQuestions, setConfigQuestions] = useState<MaterialQuestion[]>([]);
  const [tempFileForConfig, setTempFileForConfig] = useState<any>(null);

  const [configNumMCQ, setConfigNumMCQ] = useState(12);
  const [configNumTF, setConfigNumTF] = useState(4);
  const [configNumShort, setConfigNumShort] = useState(6);

  // Student Exam Room States
  const [activeExam, setActiveExam] = useState<MaterialFile | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, any>>({});
  const [examTimeRemaining, setExamTimeRemaining] = useState(2700);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [studentName, setStudentName] = useState(user?.fullName || '');
  const [studentClass, setStudentClass] = useState(user?.role === 'STUDENT' ? 'Học viên' : 'Lớp 12');
  const [examActiveTab, setExamActiveTab] = useState<'take' | 'leaderboard'>('take');

  // General Leaderboard Viewer State (Outside of Exam Room)
  const [leaderboardExamName, setLeaderboardExamName] = useState<string | null>(null);

  // Exam Uploader Tab form states (simplified uploader redirecting to configurator)
  const [examGrade, setExamGrade] = useState('Lớp 12');
  const [examSubject, setExamSubject] = useState('Toán học');
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState(45);
  const [examFileUrl, setExamFileUrl] = useState('');
  const [uploaderError, setUploaderError] = useState<string | null>(null);

  const handleDownloadFile = (fileName: string, fileUrl?: string) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const mockText = `Tài liệu ôn tập: ${fileName}\nHệ thống kết nối Gia sư và Học sinh Hoa Hướng Dương.\nĐây là tài liệu được tạo giả lập phục vụ việc luyện đề và xem trước bài học.`;
      const blob = new Blob([mockText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.includes('.') ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
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

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getLeaderboardEntries = (exName: string) => {
    const savedLeaderboard = localStorage.getItem('ttgs_leaderboard');
    if (savedLeaderboard) {
      try {
        const data = JSON.parse(savedLeaderboard);
        return data[exName] || [];
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  };

  // Preset Questions if none are specified
  const presetQuestions: MaterialQuestion[] = [
    { id: 1, type: 'MCQ', text: 'Tìm tập xác định D của hàm số y = log(x - 3).', options: ['D = (3; +∞)', 'D = [3; +∞)', 'D = R \\ {3}', 'D = (0; +∞)'], correctAnswer: 'A' },
    { id: 2, type: 'TF', text: 'Cho hàm số y = x³ - 3x + 1. Khảo sát các mệnh đề sau:', statements: ['a) Hàm số đồng biến trên các khoảng (-∞; -1) và (1; +∞).', 'b) Hàm số đạt cực đại tại điểm x = 1.', 'c) Điểm uốn của đồ thị hàm số có tọa độ là I(0; 1).', 'd) Giá trị cực tiểu của hàm số bằng -1.'], correctAnswer: { 0: true, 1: false, 2: true, 3: true } },
    { id: 3, type: 'SHORT', text: 'Tìm giá trị nguyên nhỏ nhất của tham số m để hàm số y = x³ - 3x² + mx đồng biến trên R.', correctAnswer: '3' }
  ];

  // Helper for generating blank configurations
  const handleGenerateConfigQuestions = (numMCQ: number, numTF: number, numShort: number) => {
    const questions: MaterialQuestion[] = [];
    let currentId = 1;
    for (let i = 0; i < numMCQ; i++) {
      questions.push({ id: currentId++, type: 'MCQ', text: `Câu ${currentId - 1}: Câu hỏi trắc nghiệm nhiều lựa chọn.`, options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'], correctAnswer: 'A' });
    }
    for (let i = 0; i < numTF; i++) {
      questions.push({ id: currentId++, type: 'TF', text: `Câu ${currentId - 1}: Khảo sát tính Đúng/Sai của các mệnh đề sau:`, statements: ['a) Mệnh đề a.', 'b) Mệnh đề b.', 'c) Mệnh đề c.', 'd) Mệnh đề d.'], correctAnswer: { 0: true, 1: true, 2: true, 3: true } });
    }
    for (let i = 0; i < numShort; i++) {
      questions.push({ id: currentId++, type: 'SHORT', text: `Câu ${currentId - 1}: Điền đáp án số hoặc chữ thích hợp.`, correctAnswer: '' });
    }
    setConfigQuestions(questions);
  };

  // SUBJECT ACTIONS
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubjectTitle.trim();
    if (!title) return;
    if (materials[title]) {
      alert('Môn học này đã tồn tại!');
      return;
    }
    setMaterials(prev => ({
      ...prev,
      [title]: {
        'Lớp 10': [],
        'Lớp 11': [],
        'Lớp 12': [],
        'Luyện thi đại học': []
      }
    }));
    setNewSubjectTitle('');
    setShowSubjectModal(false);
  };

  const handleDeleteSubject = (subName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn xóa môn học "${subName}" cùng toàn bộ dữ liệu lớp học, chương học bên trong?`)) return;
    setMaterials(prev => {
      const copy = { ...prev };
      delete copy[subName];
      return copy;
    });
    if (activeSubject === subName) {
      setActiveSubject(null);
      setActiveGradeLevel(null);
      setActiveChapterId(null);
      setActiveLessonId(null);
    }
  };

  // CHAPTER ACTIONS
  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || !activeGradeLevel || !newChapterTitle.trim()) return;

    const newCh: Chapter = {
      id: `ch-${Date.now()}`,
      title: newChapterTitle.trim(),
      lessons: []
    };

    setMaterials(prev => {
      const subjectGrades = prev[activeSubject] || {};
      const gradeChapters = subjectGrades[activeGradeLevel] || [];
      return {
        ...prev,
        [activeSubject]: {
          ...subjectGrades,
          [activeGradeLevel]: [...gradeChapters, newCh]
        }
      };
    });

    setNewChapterTitle('');
    setShowChapterModal(false);
  };

  const handleDeleteChapter = (chId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeSubject || !activeGradeLevel || !window.confirm('Bạn có chắc chắn muốn xóa Chương này và toàn bộ Bài học bên trong?')) return;

    setMaterials(prev => {
      const subjectGrades = prev[activeSubject] || {};
      const gradeChapters = subjectGrades[activeGradeLevel] || [];
      return {
        ...prev,
        [activeSubject]: {
          ...subjectGrades,
          [activeGradeLevel]: gradeChapters.filter(c => c.id !== chId)
        }
      };
    });

    if (activeChapterId === chId) {
      setActiveChapterId(null);
      setActiveLessonId(null);
    }
  };

  // LESSON ACTIONS
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || !activeGradeLevel || !activeChapterId || !newLessonTitle.trim()) return;

    const newLes: Lesson = {
      id: `les-${Date.now()}`,
      title: newLessonTitle.trim(),
      files: []
    };

    setMaterials(prev => {
      const subjectGrades = prev[activeSubject] || {};
      const chapters = subjectGrades[activeGradeLevel] || [];
      const updatedChapters = chapters.map(c => {
        if (c.id === activeChapterId) {
          return { ...c, lessons: [...c.lessons, newLes] };
        }
        return c;
      });
      return {
        ...prev,
        [activeSubject]: {
          ...subjectGrades,
          [activeGradeLevel]: updatedChapters
        }
      };
    });

    setNewLessonTitle('');
    setShowLessonModal(false);
  };

  const handleDeleteLesson = (lesId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeSubject || !activeGradeLevel || !activeChapterId || !window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;

    setMaterials(prev => {
      const subjectGrades = prev[activeSubject] || {};
      const chapters = subjectGrades[activeGradeLevel] || [];
      const updatedChapters = chapters.map(c => {
        if (c.id === activeChapterId) {
          return { ...c, lessons: c.lessons.filter(l => l.id !== lesId) };
        }
        return c;
      });
      return {
        ...prev,
        [activeSubject]: {
          ...subjectGrades,
          [activeGradeLevel]: updatedChapters
        }
      };
    });

    if (activeLessonId === lesId) {
      setActiveLessonId(null);
    }
  };

  const handleDeleteFile = (fileName: string) => {
    if (!activeSubject || !activeGradeLevel || !activeChapterId || !activeLessonId || !window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;

    setMaterials(prev => {
      const subjectGrades = prev[activeSubject] || {};
      const chapters = subjectGrades[activeGradeLevel] || [];
      const updatedChapters = chapters.map(c => {
        if (c.id === activeChapterId) {
          const updatedLessons = c.lessons.map(l => {
            if (l.id === activeLessonId) {
              return { ...l, files: l.files.filter(f => f.name !== fileName) };
            }
            return l;
          });
          return { ...c, lessons: updatedLessons };
        }
        return c;
      });
      return {
        ...prev,
        [activeSubject]: {
          ...subjectGrades,
          [activeGradeLevel]: updatedChapters
        }
      };
    });
  };

  // EXAM UPLOADER HANDLER (Directly synced to Exam Hall)
  const handleUploadExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploaderError(null);

    if (!examTitle.trim()) {
      setUploaderError('Vui lòng nhập tên đề thi thử.');
      return;
    }

    setTempFileForConfig({
      id: `exam-custom-${Date.now()}`,
      name: examTitle.trim() + '.pdf',
      size: '1.5 MB',
      fileUrl: examFileUrl || undefined
    });
    setConfigExamTitle(examTitle.trim());
    setConfigAnswerKeyName(examTitle.trim() + ' - Hướng dẫn giải chi tiết.pdf');
    setConfigDuration(examDuration);
    setConfigNumMCQ(12);
    setConfigNumTF(4);
    setConfigNumShort(6);
    handleGenerateConfigQuestions(12, 4, 6);
    setShowConfigModal(true);
  };

  // SAVE CONFIGURATOR MODAL HANDLER
  const handleSaveExamConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFileForConfig) return;

    if (activeTopTab === 'exams-uploader') {
      const savedExams = localStorage.getItem('ttgs_mock_exams');
      let examsList = savedExams ? JSON.parse(savedExams) : defaultExamsSeed;

      const newExam = {
        id: tempFileForConfig.id || `exam-custom-${Date.now()}`,
        title: configExamTitle.trim(),
        subject: examSubject,
        duration: configDuration,
        grade: examGrade,
        uploadedBy: user ? user.fullName : 'Gia sư đối tác',
        createdAt: new Date().toLocaleDateString('vi-VN'),
        questions: configQuestions,
        fileUrl: tempFileForConfig.fileUrl,
        answerKeyName: configAnswerKeyName
      };

      const existsIdx = examsList.findIndex((e: any) => e.id === newExam.id || e.title === newExam.title);
      if (existsIdx > -1) {
        examsList[existsIdx] = newExam;
      } else {
        examsList.unshift(newExam);
      }
      localStorage.setItem('ttgs_mock_exams', JSON.stringify(examsList));

      alert('Đăng đề thi thử thành công và đã xuất bản lên Phòng thi!');
      setShowConfigModal(false);
      setTempFileForConfig(null);
      setExamTitle('');
      setActiveTopTab('curriculum');
    } else {
      if (!activeSubject || !activeGradeLevel || !activeChapterId || !activeLessonId) return;

      const newFile: MaterialFile = {
        name: configExamTitle.trim() + '.pdf',
        size: tempFileForConfig.size || '1.2 MB',
        uploadedAt: new Date().toLocaleDateString('vi-VN'),
        uploadedBy: user ? user.fullName : 'Gia sư',
        isExam: true,
        duration: configDuration,
        questions: configQuestions,
        fileUrl: tempFileForConfig.fileUrl,
        answerKeyName: configAnswerKeyName || (configExamTitle + ' - Hướng dẫn giải chi tiết.pdf')
      };

      setMaterials(prev => {
        const subjectGrades = prev[activeSubject] || {};
        const chapters = subjectGrades[activeGradeLevel] || [];
        const updatedChapters = chapters.map(c => {
          if (c.id === activeChapterId) {
            const updatedLessons = c.lessons.map(l => {
              if (l.id === activeLessonId) {
                const fileExistsIndex = l.files.findIndex(f => f.name === newFile.name || f.name === tempFileForConfig.name);
                let updatedFiles = [...l.files];
                if (fileExistsIndex > -1) {
                  updatedFiles[fileExistsIndex] = newFile;
                } else {
                  updatedFiles.push(newFile);
                }
                return { ...l, files: updatedFiles };
              }
              return l;
            });
            return { ...c, lessons: updatedLessons };
          }
          return c;
        });
        return {
          ...prev,
          [activeSubject]: {
            ...subjectGrades,
            [activeGradeLevel]: updatedChapters
          }
        };
      });

      alert('Đã lưu cấu hình bài thi: ' + configExamTitle);
      setShowConfigModal(false);
      setTempFileForConfig(null);
    }
  };

  // Student Exam Submit & Grading
  const handleExamSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      alert('Vui lòng điền Họ và tên thí sinh trước khi nộp bài!');
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

  const getCurrentChapters = () => {
    if (!activeSubject || !activeGradeLevel) return [];
    return (materials[activeSubject] || {})[activeGradeLevel] || [];
  };

  const getCurrentFiles = () => {
    if (!activeSubject || !activeGradeLevel || !activeChapterId || !activeLessonId) return [];
    const chapter = ((materials[activeSubject] || {})[activeGradeLevel] || []).find(c => c.id === activeChapterId);
    const lesson = chapter?.lessons.find(l => l.id === activeLessonId);
    return lesson?.files || [];
  };

  const getSubjectCardDetails = (subName: string) => {
    const lookups: Record<string, { icon: string; bg: string; desc: string }> = {
      'Toán học': { icon: '📐', bg: 'from-sky-500 to-sky-600', desc: 'Khảo sát hàm số, giải tích, lượng giác và hình học không gian THPT.' },
      'Ngữ văn': { icon: '✍️', bg: 'from-rose-500 to-rose-600', desc: 'Đọc hiểu tác phẩm, nghị luận văn học và nghị luận xã hội.' },
      'Tiếng Anh': { icon: '🇬🇧', bg: 'from-emerald-500 to-emerald-600', desc: 'Ngữ pháp nâng cao, học từ vựng IELTS, TOEIC và luyện đề thi.' },
      'Vật lý': { icon: '⚡', bg: 'from-indigo-500 to-indigo-600', desc: 'Dao động cơ, điện xoay chiều, sóng ánh sáng và vật lý hạt nhân.' },
      'Hóa học': { icon: '🧪', bg: 'from-amber-500 to-amber-600', desc: 'Hóa hữu cơ lớp 11-12, Este - Lipit, polyme và vô cơ.' },
      'Khoa học tự nhiên': { icon: '🌱', bg: 'from-violet-500 to-violet-600', desc: 'Tích hợp Sinh học, Hóa học và Vật lý cấp Trung học.' }
    };
    return lookups[subName] || { icon: '📖', bg: 'from-slate-500 to-slate-600', desc: 'Tài liệu học tập, chuyên đề bồi dưỡng và đề thi thử chọn lọc.' };
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Exam Room Screen */}
      {activeExam ? (
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <button
              onClick={handleExamReset}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <ArrowLeft size={14} />
              Quay lại học tập
            </button>
            
            <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1.5">
              <button
                onClick={() => setExamActiveTab('take')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 ${examActiveTab === 'take' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                Làm bài thi
              </button>
              <button
                onClick={() => setExamActiveTab('leaderboard')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 ${examActiveTab === 'leaderboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                Bảng vinh danh
              </button>
            </div>

            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-2xl shadow-inner font-extrabold text-sm">
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
                      <span className="text-xs text-sky-655 font-bold mt-1 block">Khối lớp: {activeGradeLevel || 'Lớp 12'}</span>
                    </div>

                    <div className="flex flex-col gap-6 text-xs sm:text-sm text-slate-700">
                      <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl leading-relaxed text-sky-700">
                        <strong>Hướng dẫn làm bài:</strong> Trả lời các câu hỏi theo các phần MCQ, Đúng/Sai, Điền từ tương ứng vào cột phiếu bên phải.
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
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md flex flex-col">
                <div className="h-2 bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500"></div>

                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">Phiếu làm bài thi học sinh</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">Hệ thống chấm điểm tự động</span>
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
                        placeholder="Ví dụ: Lớp 12A1"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="input-premium rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 mt-2 border-t border-slate-100 pt-4">
                    {/* MCQ Section */}
                    {((activeExam.questions && activeExam.questions.length > 0 ? activeExam.questions : presetQuestions).filter(q => q.type === 'MCQ').length > 0) && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-[10px] font-extrabold uppercase text-sky-600 bg-sky-50 px-3 py-1 rounded border border-sky-100 tracking-wider">PHẦN I: Trắc nghiệm nhiều lựa chọn</h4>
                        {(activeExam.questions && activeExam.questions.length > 0 ? activeExam.questions : presetQuestions).filter(q => q.type === 'MCQ').map((q) => (
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
                                  <span className="text-xs font-bold text-slate-600">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False Section */}
                    {((activeExam.questions && activeExam.questions.length > 0 ? activeExam.questions : presetQuestions).filter(q => q.type === 'TF').length > 0) && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded border border-indigo-100 tracking-wider">PHẦN II: Trắc nghiệm Đúng / Sai</h4>
                        {(activeExam.questions && activeExam.questions.length > 0 ? activeExam.questions : presetQuestions).filter(q => q.type === 'TF').map((q) => (
                          <div key={q.id} className="flex flex-col gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                            <span className="text-xs font-bold text-slate-805">Câu {q.id}:</span>
                            <div className="flex flex-col gap-2">
                              {['a', 'b', 'c', 'd'].map((stChar, sIdx) => {
                                const currentVal = (examAnswers[q.id] || {})[sIdx];
                                return (
                                  <div key={sIdx} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1">
                                    <span className="text-slate-600 font-bold font-mono">{stChar})</span>
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
                                          className="w-4 h-4 text-emerald-500 cursor-pointer"
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
                                          className="w-4 h-4 text-rose-500 cursor-pointer"
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
                    )}

                    {/* Short Answer Section */}
                    {((activeExam.questions && activeExam.questions.length > 0 ? activeExam.questions : presetQuestions).filter(q => q.type === 'SHORT').length > 0) && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-[10px] font-extrabold uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-100 tracking-wider">PHẦN III: Trắc nghiệm Trả lời ngắn</h4>
                        {(activeExam.questions && activeExam.questions.length > 0 ? activeExam.questions : presetQuestions).filter(q => q.type === 'SHORT').map((q) => (
                          <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                            <span className="text-xs font-bold text-slate-805">Câu {q.id}:</span>
                            <input
                              type="text"
                              required
                              disabled={examSubmitted}
                              placeholder="Điền kết quả..."
                              value={examAnswers[q.id] || ''}
                              onChange={(e) => setExamAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="input-premium rounded-lg px-3 py-2 text-xs text-slate-808 max-w-[200px] w-full"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {examSubmitted ? (
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="font-bold text-slate-700">Điểm số đạt được:</span>
                        <span className="font-black text-sky-600 bg-sky-100/70 px-3 py-1 rounded-xl border border-sky-200">
                          {examScore} / 10.0 Điểm
                        </span>
                      </div>
                      {activeExam.answerKeyName && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Hướng dẫn giải:</span>
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(activeExam.answerKeyName || 'Huong_dan_giai_chi_tiet.pdf')}
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
                      className="w-full py-3 rounded-xl font-bold text-xs text-white btn-gradient shadow-md cursor-pointer active:scale-95 mt-2"
                    >
                      Nộp bài thi
                    </button>
                  )}
                </form>
              </div>
            </div>
          ) : (
            // Leaderboard view
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col gap-6 max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Trophy className="text-amber-500 animate-bounce" size={24} />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Bảng vinh danh thi thử</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Xếp hạng kết quả: {activeExam.name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {getLeaderboardEntries(activeExam.name).length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    Chưa có lượt làm bài thi nào được ghi nhận.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                          <th className="py-3 px-4">Xếp hạng</th>
                          <th className="py-3 px-4">Họ và Tên</th>
                          <th className="py-3 px-4">Lớp / Trường</th>
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
                            <td className="py-3.5 px-4 text-xs text-slate-500">{entry.studentClass}</td>
                            <td className="py-3.5 px-4 text-xs font-black text-center text-sky-600">
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
        // Standalone Leaderboard View
        <div className="max-w-4xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col gap-6 animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="text-amber-500 animate-bounce" size={24} />
              <div>
                <h3 className="font-bold text-slate-805 text-base">Bảng vinh danh - Kết quả làm bài</h3>
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
                Chưa có kết quả thi nào được ghi nhận.
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
                        <td className="py-3.5 px-4 text-xs text-slate-500">{entry.studentClass}</td>
                        <td className="py-3.5 px-4 text-xs font-black text-center text-sky-600">
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
        // Main Materials view list
        <div className="flex flex-col gap-6">
          {/* Top navigation tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTopTab('curriculum')}
              className={`px-6 py-3 font-bold text-xs sm:text-sm transition-colors border-b-2 cursor-pointer ${
                activeTopTab === 'curriculum'
                  ? 'text-sky-500 border-sky-500'
                  : 'text-slate-400 border-transparent hover:text-slate-350'
              }`}
            >
              Học liệu & Bài giảng Môn học
            </button>
            {canUpload && (
              <button
                onClick={() => setActiveTopTab('exams-uploader')}
                className={`px-6 py-3 font-bold text-xs sm:text-sm transition-colors border-b-2 cursor-pointer ${
                  activeTopTab === 'exams-uploader'
                    ? 'text-sky-500 border-sky-500'
                    : 'text-slate-400 border-transparent hover:text-slate-350'
                }`}
              >
                Trang Đăng Đề thi thử (Lớp & Môn)
              </button>
            )}
          </div>

          {/* Tab 1: Curriculum Board */}
          {activeTopTab === 'curriculum' && (
            <div className="flex flex-col gap-6">
              {/* STEP 1: SUBJECT SELECTION */}
              {activeSubject === null ? (
                <div className="flex flex-col gap-6">
                  {canUpload && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowSubjectModal(true)}
                        className="px-4 py-2 bg-sky-50 hover:bg-sky-500 hover:text-white border border-sky-100 text-sky-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Thêm môn học mới</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(materials).map((subjectName) => {
                      const details = getSubjectCardDetails(subjectName);
                      return (
                        <div
                          key={subjectName}
                          onClick={() => {
                            setActiveSubject(subjectName);
                            setActiveGradeLevel(null);
                            setActiveChapterId(null);
                            setActiveLessonId(null);
                          }}
                          className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer flex flex-col gap-4 relative group overflow-hidden"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-3xl">{details.icon}</span>
                            <div className="flex items-center gap-2">
                              {canUpload && (
                                <button
                                  onClick={(e) => handleDeleteSubject(subjectName, e)}
                                  className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa môn học này"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                              <span className="text-[10px] font-bold text-slate-405 group-hover:text-sky-600 transition-colors uppercase tracking-wider">Truy cập →</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-805 text-sm sm:text-base leading-snug group-hover:text-sky-655 transition-colors">{subjectName}</h3>
                            <p className="text-xs text-slate-450 leading-relaxed mt-1.5">{details.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : activeGradeLevel === null ? (
                /* STEP 2: GRADE SELECTION */
                <div className="flex flex-col gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubject(null);
                          setActiveGradeLevel(null);
                          setActiveChapterId(null);
                          setActiveLessonId(null);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-555 transition-all cursor-pointer active:scale-95"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base">Môn: {activeSubject}</h3>
                        <span className="text-xs text-slate-400 font-semibold">Chọn khối lớp học tập để xem chương trình chi tiết</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
                    {[
                      { name: 'Lớp 10', icon: '🎒', desc: 'Chương trình cơ bản & nâng cao Lớp 10' },
                      { name: 'Lớp 11', icon: '🏫', desc: 'Chương trình trọng tâm kiến thức Lớp 11' },
                      { name: 'Lớp 12', icon: '🎓', desc: 'Chương trình luyện thi Tốt nghiệp THPT Quốc Gia' },
                      { name: 'Luyện thi đại học', icon: '🚀', desc: 'Chuyên đề ôn thi Đánh giá năng lực & Đại học' }
                    ].map((gradeItem) => (
                      <div
                        key={gradeItem.name}
                        onClick={() => {
                          // Initialize grade key if doesn't exist
                          if (!materials[activeSubject][gradeItem.name]) {
                            setMaterials(prev => {
                              const subGrades = prev[activeSubject] || {};
                              return {
                                ...prev,
                                [activeSubject]: {
                                  ...subGrades,
                                  [gradeItem.name]: []
                                }
                              };
                            });
                          }
                          setActiveGradeLevel(gradeItem.name);
                          setActiveChapterId(null);
                          setActiveLessonId(null);
                        }}
                        className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-sky-300 hover:shadow-lg rounded-3xl p-5 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{gradeItem.icon}</span>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{gradeItem.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[150px]">{gradeItem.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* STEP 3: CHAPTERS & LESSONS VIEW */
                <div className="flex flex-col gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveGradeLevel(null);
                          setActiveChapterId(null);
                          setActiveLessonId(null);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-555 transition-all cursor-pointer active:scale-95"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <div>
                        <h3 className="font-bold text-slate-850 text-sm sm:text-base">Môn: {activeSubject} — {activeGradeLevel}</h3>
                        <span className="text-xs text-slate-400 font-semibold">Tạo chương, tạo bài học và biên soạn học liệu trắc nghiệm</span>
                      </div>
                    </div>
                    {canUpload && (
                      <button
                        onClick={() => setShowChapterModal(true)}
                        className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-500 hover:text-white border border-sky-100 text-sky-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                      >
                        <Plus size={14} />
                        <span>Tạo chương mới</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left lists of Chapters & Lessons */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Thư mục Chương học</span>
                      
                      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                        {getCurrentChapters().map((ch) => {
                          const isChActive = activeChapterId === ch.id;
                          return (
                            <div key={ch.id} className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setActiveChapterId(ch.id);
                                  setActiveLessonId(null);
                                }}
                                className={`w-full p-3.5 rounded-xl border text-left font-bold text-xs flex justify-between items-center transition-all cursor-pointer ${
                                  isChActive
                                    ? 'bg-sky-50 border-sky-350 text-sky-700 shadow-sm'
                                    : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate flex items-center gap-2">
                                  <FolderOpen size={16} className={isChActive ? 'text-sky-600' : 'text-slate-400'} />
                                  {ch.title}
                                </span>
                                {canUpload && (
                                  <button
                                    onClick={(e) => handleDeleteChapter(ch.id, e)}
                                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                                    title="Xóa chương này"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </button>

                              {isChActive && (
                                <div className="pl-6 flex flex-col gap-1.5 border-l-2 border-dashed border-sky-200/60 my-1 ml-4 py-1">
                                  {ch.lessons.map((les) => {
                                    const isLesActive = activeLessonId === les.id;
                                    return (
                                      <button
                                        key={les.id}
                                        onClick={() => setActiveLessonId(les.id)}
                                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex justify-between items-center transition-all cursor-pointer ${
                                          isLesActive
                                            ? 'bg-indigo-50 border-indigo-250 text-indigo-750'
                                            : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-550'
                                        }`}
                                      >
                                        <span className="truncate flex items-center gap-1.5">
                                          <BookOpen size={13} className={isLesActive ? 'text-indigo-505' : 'text-slate-400'} />
                                          {les.title}
                                        </span>
                                        {canUpload && (
                                          <button
                                            onClick={(e) => handleDeleteLesson(les.id, e)}
                                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                                            title="Xóa bài học"
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        )}
                                      </button>
                                    );
                                  })}

                                  {canUpload && (
                                    <button
                                      onClick={() => setShowLessonModal(true)}
                                      className="w-full p-2 rounded-xl border border-dashed border-slate-255 text-slate-455 hover:text-slate-600 text-2xs font-bold text-center flex items-center justify-center gap-1 cursor-pointer bg-white"
                                    >
                                      <Plus size={11} />
                                      <span>Tạo bài học mới</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {getCurrentChapters().length === 0 && (
                          <p className="text-[11px] text-slate-400 text-center italic py-10 bg-slate-50/20 rounded-xl">Chưa có chương nào được tạo.</p>
                        )}
                      </div>
                    </div>

                    {/* Right list of Files under selected Lesson */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Học liệu bài học chi tiết</span>

                      {!activeLessonId ? (
                        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs leading-relaxed">
                          💡 Vui lòng mở Chương và bấm chọn **Bài học** ở cột bên trái để xem và quản lý danh sách tài liệu.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          {/* File list */}
                          <div className="flex flex-col gap-3">
                            {getCurrentFiles().map((file, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all"
                              >
                                <div className="flex items-center gap-3 truncate">
                                  <FileText size={18} className="text-rose-500 shrink-0" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-slate-750 truncate">{file.name}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                      {file.size} • Đăng bởi: {file.uploadedBy} • {file.uploadedAt}
                                    </span>
                                    {file.isExam && (
                                      <span className="text-[9px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded w-max mt-1">
                                        Thời gian: {file.duration} phút • {file.questions?.length || 0} câu hỏi (Đáp án trắc nghiệm)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
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
                                            defaultQuestions.push({ id: currentId++, type: 'MCQ', text: `Câu ${currentId - 1}: Câu hỏi trắc nghiệm.`, options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' });
                                          }
                                          for (let i = 0; i < 4; i++) {
                                            defaultQuestions.push({ id: currentId++, type: 'TF', text: `Câu ${currentId - 1}: Câu hỏi Đúng/Sai:`, statements: ['a) Ý a.', 'b) Ý b.', 'c) Ý c.', 'd) Ý d.'], correctAnswer: { 0: true, 1: true, 2: true, 3: true } });
                                          }
                                          for (let i = 0; i < 6; i++) {
                                            defaultQuestions.push({ id: currentId++, type: 'SHORT', text: `Câu ${currentId - 1}: Điền từ hoặc chữ.`, correctAnswer: '' });
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
                                    onClick={() => handleDownloadFile(file.name, file.fileUrl)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-500 hover:text-sky-600 transition-colors cursor-pointer active:scale-95 shadow-sm bg-white"
                                  >
                                    <Download size={13} />
                                  </button>
                                  {canUpload && (
                                    <button
                                      onClick={() => handleDeleteFile(file.name)}
                                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-455 hover:text-rose-600 transition-colors cursor-pointer active:scale-95 shadow-sm bg-white"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {getCurrentFiles().length === 0 && (
                              <p className="text-xs text-slate-400 text-center italic py-10 bg-slate-50/20 rounded-2xl">Bài học này chưa được upload tài liệu nào.</p>
                            )}
                          </div>

                          {/* Upload options directly inside view */}
                          {canUpload && (
                            <div className="flex flex-col gap-5 border-t border-slate-100 pt-6">
                              {/* 1. Exam Uploader Box */}
                              <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tải lên đề thi trắc nghiệm PDF:</span>
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350 min-h-[160px] cursor-pointer relative">
                                  <Upload size={24} className="text-slate-400 animate-pulse" />
                                  <div className="text-xs flex flex-col gap-1 text-slate-500">
                                    <span className="font-bold text-slate-700">Tải lên Đề thi PDF mới</span>
                                    <span>Tự động mở màn hình cấu hình đáp án (Điền số câu & phím đáp án)</span>
                                  </div>
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
                                </div>
                              </div>

                              {/* 2. Regular File Uploader Input */}
                              <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hoặc tải lên học liệu bài giảng thường (PDF/Word):</span>
                                <div className="relative flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl cursor-pointer">
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Upload size={14} className="text-slate-400" />
                                    <span>Chọn tệp học liệu bài học (Tự động lưu trực tiếp)...</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept=".pdf,.docx,.doc"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const fileSizeStr = (file.size / 1024 / 1024).toFixed(1) + ' MB';
                                        const url = URL.createObjectURL(file);
                                        const newFile: MaterialFile = {
                                          name: file.name,
                                          size: fileSizeStr,
                                          uploadedAt: new Date().toLocaleDateString('vi-VN'),
                                          uploadedBy: user ? user.fullName : 'Gia sư',
                                          fileUrl: url
                                        };

                                        setMaterials(prev => {
                                          const subjectGrades = prev[activeSubject!] || {};
                                          const gradeChapters = subjectGrades[activeGradeLevel!] || [];
                                          const updatedChapters = gradeChapters.map(c => {
                                            if (c.id === activeChapterId) {
                                              const updatedLessons = c.lessons.map(l => {
                                                if (l.id === activeLessonId) {
                                                  return { ...l, files: [...l.files, newFile] };
                                                }
                                                return l;
                                              });
                                              return { ...c, lessons: updatedLessons };
                                            }
                                            return c;
                                          });
                                          return {
                                            ...prev,
                                            [activeSubject!]: {
                                              ...subjectGrades,
                                              [activeGradeLevel!]: updatedChapters
                                            }
                                          };
                                        });
                                        alert('Đã tải lên học liệu thường: ' + file.name);
                                      }
                                    }}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Standalone Exam Uploader */}
          {activeTopTab === 'exams-uploader' && (
            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-xl mx-auto w-full relative overflow-hidden animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
                <div className="p-2 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-850 text-base sm:text-lg">Đăng tải đề thi thử trực tuyến mới</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Thiết lập Đề thi trắc nghiệm đếm ngược</span>
                </div>
              </div>

              {uploaderError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold mb-4">
                  <X size={15} className="text-rose-500 shrink-0" />
                  <span>{uploaderError}</span>
                </div>
              )}

              <form onSubmit={handleUploadExamSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề đề thi</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đề khảo sát chất lượng môn Toán 12 kỳ thi THPT..."
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-805"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khối lớp</label>
                    <select
                      value={examGrade}
                      onChange={(e) => setExamGrade(e.target.value)}
                      className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                    >
                      <option value="Lớp 10">Lớp 10</option>
                      <option value="Lớp 11">Lớp 11</option>
                      <option value="Lớp 12">Lớp 12</option>
                      <option value="Luyện thi đại học">Luyện thi Đại học</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Môn thi</label>
                    <select
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                    >
                      {Object.keys(materials).map(subKey => (
                        <option key={subKey} value={subKey}>{subKey}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời lượng (Phút)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={180}
                      value={examDuration}
                      onChange={(e) => setExamDuration(Number(e.target.value))}
                      className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tải lên tệp đề thi (PDF)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-355 cursor-pointer transition-colors relative min-h-[140px]">
                    <Upload size={20} className="text-slate-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-500">{examFileUrl ? 'Đã đính kèm tệp đề thi PDF' : 'Chọn tệp đề thi dưới định dạng PDF'}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setExamFileUrl(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl font-bold text-xs text-white btn-gradient shadow-md cursor-pointer active:scale-95"
                >
                  Tiếp tục thiết lập Đáp án & Đăng đề thi
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubject} className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-805 text-sm">Thêm môn học mới</h3>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-400 cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Tên môn học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Sinh học, Lịch sử..."
                  value={newSubjectTitle}
                  onChange={(e) => setNewSubjectTitle(e.target.value)}
                  className="input-premium rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-white btn-gradient rounded-xl text-xs font-bold cursor-pointer active:scale-95"
              >
                Tạo môn học
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE CHAPTER MODAL */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateChapter} className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-805 text-sm">Tạo chương học mới</h3>
              <button
                type="button"
                onClick={() => setShowChapterModal(false)}
                className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-400 cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Tên chương học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chương 1: Di truyền học..."
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="input-premium rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowChapterModal(false)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-white btn-gradient rounded-xl text-xs font-bold cursor-pointer active:scale-95"
              >
                Tạo chương
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE LESSON MODAL */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateLesson} className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-855 text-sm">Tạo bài học mới</h3>
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-400 cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Tiêu đề bài học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài 1: Khái niệm về Gen..."
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="input-premium rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-white btn-gradient rounded-xl text-xs font-bold cursor-pointer active:scale-95"
              >
                Tạo bài học
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TEACHER EXAM CREATOR/MODIFIER CONFIG MODAL */}
      {showConfigModal && tempFileForConfig && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-fade-in-up flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-850 text-base">Cấu hình phím đáp án Đề thi trắc nghiệm (Giáo viên)</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Tệp đề thi: {tempFileForConfig.name} ({tempFileForConfig.size})</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  setTempFileForConfig(null);
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveExamConfig} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex flex-col lg:flex-row gap-6 overflow-y-auto flex-1 max-h-[70vh]">
                {/* Left Column: PDF Source preview (for visual review) */}
                <div className="flex-1 min-h-[450px] lg:min-h-0 flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">Tệp đề thi gốc (PDF)</span>
                    <label className="text-[10px] font-bold text-sky-605 hover:text-sky-700 cursor-pointer transition-colors flex items-center gap-1">
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
                      <span className="text-xs font-bold text-slate-600">Đề thi chưa có tệp PDF gốc để học sinh xem bên cạnh</span>
                      <span className="text-[10px] text-slate-400 leading-relaxed max-w-[250px]">Hãy tải lên đề thi dưới dạng file PDF gốc để hiển thị cho học sinh khi làm bài.</span>
                      <label className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-sm">
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
                        className="input-premium rounded-xl px-4 py-3 text-xs text-slate-808 font-bold"
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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên tệp đáp án chi tiết (Đính kèm lời giải)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đề thi toán - Hướng dẫn giải chi tiết.pdf"
                      value={configAnswerKeyName}
                      onChange={(e) => setConfigAnswerKeyName(e.target.value)}
                      className="input-premium rounded-xl px-4 py-3 text-xs text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Cấu trúc số lượng câu hỏi</h4>
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

                  <div className="flex flex-col gap-4">
                    <div className="border-b border-slate-105 pb-2">
                      <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Đáp án đúng của đề thi</h4>
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
                                    <span className="text-xs font-bold text-slate-600">{char}</span>
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
                                    <span className="text-slate-500 font-bold font-mono">Ý {char})</span>
                                    <div className="flex gap-3">
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`config-ans-key-${q.id}-${stIdx}`}
                                          checked={(q.correctAnswer || {})[stIdx] === true}
                                          onChange={() => setConfigQuestions(prev => prev.map(item => {
                                            if (item.id === q.id) {
                                              return { ...item, correctAnswer: { ...item.correctAnswer, [stIdx]: true } };
                                            }
                                            return item;
                                          }))}
                                          className="w-3.5 h-3.5 text-emerald-505 cursor-pointer"
                                        />
                                        <span className="text-[10px] font-bold text-emerald-600">Đúng</span>
                                      </label>
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`config-ans-key-${q.id}-${stIdx}`}
                                          checked={(q.correctAnswer || {})[stIdx] === false}
                                          onChange={() => setConfigQuestions(prev => prev.map(item => {
                                            if (item.id === q.id) {
                                              return { ...item, correctAnswer: { ...item.correctAnswer, [stIdx]: false } };
                                            }
                                            return item;
                                          }))}
                                          className="w-3.5 h-3.5 text-rose-505 cursor-pointer"
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
                                value={q.correctAnswer || ''}
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200 shadow-sm"
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
