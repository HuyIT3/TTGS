import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, SlidersHorizontal, BookOpen, Star, GraduationCap, MapPin, Calendar, Clock, DollarSign, X, Sparkles, FileText, Download, FolderOpen, Upload, Trash2, ArrowLeft, Award, FileSpreadsheet, Timer, Plus, Lock, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Feedback {
  rating: number;
  comment: string;
  student: {
    user: {
      fullName: string;
      avatar?: string;
    }
  }
}

interface Tutor {
  id: string;
  subjects: string[];
  bio: string;
  experience: string;
  hourlyRate: number;
  certificates: string[];
  user: {
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  feedbacks: Feedback[];
}

interface ClassRequest {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  hourlyRate: number;
  sessionsPerWeek: number;
  schedule: string;
  location: string;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  student: {
    user: {
      fullName: string;
      avatar?: string;
    }
  };
}

interface MaterialQuestion {
  id: number;
  type: 'MCQ' | 'TF' | 'SHORT';
  text: string;
  options?: string[]; // For MCQ
  statements?: string[]; // For TF
  correctAnswer: any; // MCQ: 'A'|'B'|'C'|'D', SHORT: string, TF: Record<number, boolean>
}

interface MaterialFile {
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  isExam?: boolean;
  duration?: number; // In minutes
  questions?: MaterialQuestion[];
  answerKeyName?: string;
}

export interface VocabWord {
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

export const LandingPage: React.FC = () => {
  const { apiUrl, user } = useAuth();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [classRequests, setClassRequests] = useState<ClassRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [maxPrice, setMaxPrice] = useState(300000);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeGrade, setActiveGrade] = useState<number>(12);

  // Demo toggle role
  const [isTeacherRole, setIsTeacherRole] = useState(false);

  // Interactive materials states
  const [activeMaterialsSubject, setActiveMaterialsSubject] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  // File upload drag status
  const [dragActive, setDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  // Teacher Exam Creator States
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configExamTitle, setConfigExamTitle] = useState('');
  const [configDuration, setConfigDuration] = useState(45);
  const [configQuestions, setConfigQuestions] = useState<MaterialQuestion[]>([]);
  const [tempFileForConfig, setTempFileForConfig] = useState<any>(null);
  const [configAnswerKeyName, setConfigAnswerKeyName] = useState('');

  // Google Forms online exam center states
  const [activeExam, setActiveExam] = useState<MaterialFile | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [examAnswers, setExamAnswers] = useState<Record<string, any>>({});
  const [examTimeRemaining, setExamTimeRemaining] = useState(2700); // 45 minutes
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);

  // Vocabulary Quiz Interactive states
  const [activeVocabFile, setActiveVocabFile] = useState<MaterialFile | null>(null);
  const [vocabWords, setVocabWords] = useState<VocabWord[]>([]);
  const [vocabMode, setVocabMode] = useState<'flashcard' | 'quiz' | 'match'>('flashcard');
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [vocabQuizAnswers, setVocabQuizAnswers] = useState<Record<string, string>>({});
  const [vocabQuizSubmitted, setVocabQuizSubmitted] = useState(false);
  const [matchCardsList, setMatchCardsList] = useState<any[]>([]);
  const [selectedMatchCard, setSelectedMatchCard] = useState<string | null>(null);
  const [matchedVocabWords, setMatchedVocabWords] = useState<string[]>([]);
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [matchActive, setMatchActive] = useState(false);
  const [matchFinished, setMatchFinished] = useState(false);
  const [mismatchedCards, setMismatchedCards] = useState<string[]>([]);
  const [studentUploadedFile, setStudentUploadedFile] = useState<MaterialFile | null>(null);
  const [showUploadChoiceModal, setShowUploadChoiceModal] = useState(false);

  // Checks if the user is authorized to upload
  const canUpload = user?.role === 'TEACHER' || isTeacherRole;

  // Presets of THPT Questions for preview
  const presetQuestions: MaterialQuestion[] = [
    {
      id: 1,
      type: 'MCQ',
      text: 'Tìm tập xác định D của hàm số y = log(x - 3).',
      options: ['D = (3; +∞)', 'D = [3; +∞)', 'D = R \\ {3}', 'D = (0; +∞)'],
      correctAnswer: 'A'
    },
    {
      id: 2,
      type: 'TF',
      text: 'Cho hàm số y = x³ - 3x + 1. Khảo sát các mệnh đề sau:',
      statements: [
        'a) Hàm số đồng biến trên các khoảng (-∞; -1) và (1; +∞).',
        'b) Hàm số đạt cực đại tại điểm x = 1.',
        'c) Điểm uốn của đồ thị hàm số có tọa độ là I(0; 1).',
        'd) Giá trị cực tiểu của hàm số bằng -1.'
      ],
      correctAnswer: { 0: true, 1: false, 2: true, 3: true }
    },
    {
      id: 3,
      type: 'SHORT',
      text: 'Tìm giá trị nguyên nhỏ nhất của tham số m để hàm số y = x³ - 3x² + mx đồng biến trên tập số thực R.',
      correctAnswer: '3'
    }
  ];

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
          size: '2.5 MB',
          uploadedAt: '13/07/2026',
          uploadedBy: 'Gia sư Nguyễn Văn Hùng',
          isExam: true,
          duration: 45,
          questions: presetQuestions,
          answerKeyName: 'Đề thi khảo sát Lớp 12 Toán - Hướng dẫn giải chi tiết.pdf'
        }
      ],
      4: [
        { name: 'Tài liệu ôn tập tổng hợp Toán học học kỳ 1.pdf', size: '3.5 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }
      ]
    },
    'Ngữ văn': {
      1: [{ name: 'Tổng hợp các tác phẩm văn học lớp ' + activeGrade + ' trọng tâm.pdf', size: '3.2 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Trần Thị Lan' }],
      2: [{ name: 'Hướng dẫn làm bài văn nghị luận xã hội đạt điểm cao.docx', size: '920 KB', uploadedAt: '08/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi thử môn Ngữ Văn Lớp ' + activeGrade + ' kỳ thi tốt nghiệp.pdf', size: '1.1 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 90, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp Ngữ văn học kỳ 1.pdf', size: '2.5 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    },
    'Tiếng Anh': {
      1: [{ name: 'Tóm tắt ngữ pháp tiếng Anh trọng tâm Lớp ' + activeGrade + '.pdf', size: '2.7 MB', uploadedAt: '11/07/2026', uploadedBy: 'Gia sư Trần Thị Lan' }],
      2: [{ name: 'Bài tập trắc nghiệm Phrasal Verbs thông dụng.docx', size: '640 KB', uploadedAt: '09/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi thử trắc nghiệm Tiếng Anh Lớp ' + activeGrade + ' - Đề số 1.pdf', size: '1.8 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 60, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp Tiếng Anh học kỳ 1.pdf', size: '2.1 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    },
    'Vật lý': {
      1: [{ name: 'Đề cương ôn tập Vật lý Chương Dao động cơ Lớp ' + activeGrade + '.pdf', size: '1.6 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' }],
      2: [{ name: 'Bài tập trắc nghiệm Dao động điều hòa nâng cao.docx', size: '780 KB', uploadedAt: '10/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi thử trắc nghiệm Vật lý Lớp ' + activeGrade + ' THPT.pdf', size: '2.0 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 50, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp Vật lý học kỳ 1.pdf', size: '3.0 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    },
    'Hóa học': {
      1: [{ name: 'Đề cương ôn tập Hóa học Chương Este - Lipit Lớp ' + activeGrade + '.pdf', size: '1.5 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' }],
      2: [{ name: 'Bài tập trắc nghiệm Este nâng cao luyện thi.docx', size: '820 KB', uploadedAt: '10/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi thử trắc nghiệm Hóa học Lớp ' + activeGrade + ' tốt nghiệp.pdf', size: '1.9 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 50, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp Hóa học học kỳ 1.pdf', size: '2.9 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    },
    'Khoa học tự nhiên': {
      1: [{ name: 'Đề cương ôn tập KHTN Chương Vật sống Lớp ' + activeGrade + '.pdf', size: '1.3 MB', uploadedAt: '12/07/2026', uploadedBy: 'Gia sư Nguyễn Văn Hùng' }],
      2: [{ name: 'Bài tập trắc nghiệm KHTN ôn tập giữa kỳ 1.docx', size: '700 KB', uploadedAt: '10/07/2026', uploadedBy: 'Admin' }],
      3: [{ name: 'Đề thi trắc nghiệm KHTN Lớp ' + activeGrade + ' học kỳ 1.pdf', size: '1.7 MB', uploadedAt: '13/07/2026', uploadedBy: 'Admin', isExam: true, duration: 45, questions: [] }],
      4: [{ name: 'Tài liệu ôn tập tổng hợp KHTN học kỳ 1.pdf', size: '2.3 MB', uploadedAt: '11/07/2026', uploadedBy: 'Admin' }]
    }
  };

  const [materials, setMaterials] = useState<Record<string, Record<number, MaterialFile[]>>>(initialMaterials);

  // Mock data fallbacks for standalone preview
  const mockTutors: Tutor[] = [
    {
      id: 't-1',
      subjects: ['Toán học', 'Vật lý'],
      bio: 'Cựu sinh viên Đại học Bách Khoa Hà Nội, có 5 năm kinh nghiệm ôn thi đại học môn Toán, Lý.',
      experience: '5 năm kinh nghiệm gia sư cấp 3',
      hourlyRate: 200000,
      certificates: ['https://images.unsplash.com/photo-1589330273594-fade1ee91647?w=300'],
      user: {
        fullName: 'Nguyễn Văn Hùng',
        email: 'tutor1@huyhoang.com',
        phone: '0912345678',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      },
      feedbacks: [
        {
          rating: 5,
          comment: 'Anh Hùng giảng bài rất dễ hiểu, giúp em tiến bộ rất nhanh môn Vật lý!',
          student: { user: { fullName: 'Phạm Minh Quân' } }
        }
      ]
    },
    {
      id: 't-2',
      subjects: ['Tiếng Anh', 'Ngữ văn'],
      bio: 'Tốt nghiệp ĐH Sư Phạm chuyên ngành Sư phạm tiếng Anh. Đạt IELTS 8.0.',
      experience: '3 năm dạy tại Trung tâm ngoại ngữ và gia sư',
      hourlyRate: 180000,
      certificates: [],
      user: {
        fullName: 'Trần Thị Lan',
        email: 'tutor2@huyhoang.com',
        phone: '0923456789',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      },
      feedbacks: []
    }
  ];

  const mockRequests: ClassRequest[] = [
    {
      id: 'r-1',
      title: 'Tìm Gia sư Toán 12 ôn thi THPT Quốc Gia',
      description: 'Cần tìm gia sư dạy Toán lớp 12 lấy lại gốc hình học và ôn luyện đề thi đại học.',
      subject: 'Toán học',
      grade: 'Lớp 12',
      hourlyRate: 200000,
      sessionsPerWeek: 2,
      schedule: 'Tối thứ 3 và tối thứ 5 (19:30 - 21:30)',
      location: 'Quận Tây Hồ, Hà Nội',
      status: 'OPEN',
      student: { user: { fullName: 'Phạm Minh Quân' } }
    },
    {
      id: 'r-2',
      title: 'Gia sư Tiếng Anh lớp 9 luyện thi lên lớp 10',
      description: 'Luyện đề thi tuyển sinh lớp 9 lên lớp 10 công lập, tập trung ngữ pháp và kỹ năng đọc hiểu.',
      subject: 'Tiếng Anh',
      grade: 'Lớp 9',
      hourlyRate: 180000,
      sessionsPerWeek: 3,
      schedule: 'Chiều thứ 2, 4, 6 (15:00 - 17:00)',
      location: 'Quận Hoàn Kiếm, Hà Nội',
      status: 'OPEN',
      student: { user: { fullName: 'Hoàng Mai Chi' } }
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tutorsRes = await fetch(apiUrl + '/users/tutors');
        const requestsRes = await fetch(apiUrl + '/classes/requests');
        if (tutorsRes.ok && requestsRes.ok) {
          const tutorsData = await tutorsRes.json();
          const requestsData = await requestsRes.json();
          setTutors(tutorsData.length ? tutorsData : mockTutors);
          setClassRequests(requestsData.length ? requestsData.filter((r: any) => r.status === 'OPEN') : mockRequests);
        } else {
          setTutors(mockTutors);
          setClassRequests(mockRequests);
        }
      } catch (error) {
        setTutors(mockTutors);
        setClassRequests(mockRequests);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  // Exam Countdown Ticker logic
  useEffect(() => {
    let timerId: any;
    if (activeExam && !examSubmitted && examTimeRemaining > 0) {
      timerId = setInterval(() => {
        setExamTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (examTimeRemaining === 0 && !examSubmitted && activeExam) {
      handleExamSubmit();
    }
    return () => clearInterval(timerId);
  }, [activeExam, examSubmitted, examTimeRemaining]);

  const handleApply = (requestId: string) => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'TEACHER') {
      navigate('/teacher');
    } else {
      alert('Chỉ tài khoản vai trò Gia sư mới có thể nhận lớp!');
    }
  };

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch = tutor.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subjects.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || tutor.subjects.includes(selectedSubject);
    const matchesPrice = tutor.hourlyRate <= maxPrice;
    return matchesSearch && matchesSubject && matchesPrice;
  });

  const getVocabWordsForFile = (fileName: string): VocabWord[] => {
    const nameLower = fileName.toLowerCase();
    if (nameLower.includes('ngữ pháp') || nameLower.includes('grammar')) {
      return [
        { word: 'Structure', ipa: '/ˈstrʌk.tʃər/', meaning: 'Cấu trúc, kết cấu', example: 'Sentence structure is vital in English grammar.', exampleMeaning: 'Cấu trúc câu rất quan trọng trong ngữ pháp tiếng Anh.' },
        { word: 'Passive', ipa: '/ˈpæs.ɪv/', meaning: 'Bị động, thụ động', example: 'We learned about the passive voice yesterday.', exampleMeaning: 'Hôm qua chúng tôi đã học về thể bị động.' },
        { word: 'Clause', ipa: '/klɔːz/', meaning: 'Mệnh đề', example: 'A dependent clause cannot stand alone.', exampleMeaning: 'Một mệnh đề phụ thuộc không thể đứng độc lập.' },
        { word: 'Infinitive', ipa: '/ɪnˈfɪn.ɪ.tɪv/', meaning: 'Động từ nguyên mẫu', example: 'The infinitive form of "went" is "go".', exampleMeaning: 'Dạng nguyên mẫu của "went" là "go".' },
        { word: 'Conjunction', ipa: '/kənˈdʒʌŋk.ʃən/', meaning: 'Liên từ', example: '"And", "but", "or" are common conjunctions.', exampleMeaning: '"Và", "nhưng", "hoặc" là các liên từ phổ biến.' },
        { word: 'Preposition', ipa: '/ˌprep.əˈzɪʃ.ən/', meaning: 'Giới từ', example: '"In", "on", "at" are prepositions of place.', exampleMeaning: '"Trong", "trên", "tại" là các giới từ chỉ nơi chốn.' },
        { word: 'Adverb', ipa: '/ˈæd.vɜːb/', meaning: 'Trạng từ', example: 'She speaks English fluently.', exampleMeaning: 'Cô ấy nói tiếng Anh một cách trôi chảy.' },
        { word: 'Tense', ipa: '/tens/', meaning: 'Thì (trong ngữ pháp)', example: 'English has twelve main tenses.', exampleMeaning: 'Tiếng Anh có mười hai thì chính.' }
      ];
    }
    
    if (nameLower.includes('phrasal') || nameLower.includes('verb')) {
      return [
        { word: 'Bring up', ipa: '/brɪŋ ʌp/', meaning: 'Nuôi nấng, đề cập', example: 'She brought up five children by herself.', exampleMeaning: 'Cô ấy đã tự mình nuôi nẵng năm đứa con.' },
        { word: 'Call off', ipa: '/kɔːl ɒf/', meaning: 'Hủy bỏ', example: 'They called off the soccer match due to rain.', exampleMeaning: 'Họ đã hủy trận đấu bóng đá vì trời mưa.' },
        { word: 'Give up', ipa: '/ɡɪv ʌp/', meaning: 'Từ bỏ', example: 'Never give up on your study dreams.', exampleMeaning: 'Đừng bao giờ từ bỏ ước mơ học tập của bạn.' },
        { word: 'Look after', ipa: '/lʊk ˈɑːf.tər/', meaning: 'Chăm sóc, trông nom', example: 'Who will look after the kids tonight?', exampleMeaning: 'Ai sẽ trông nom lũ trẻ tối nay?' },
        { word: 'Run out of', ipa: '/rʌn aʊt ɒv/', meaning: 'Hết, cạn kiệt', example: 'We ran out of printer paper.', exampleMeaning: 'Chúng tôi đã hết giấy in.' },
        { word: 'Take off', ipa: '/teɪk ɒf/', meaning: 'Cất cánh, cởi bỏ', example: 'The airplane will take off soon.', exampleMeaning: 'Máy bay sẽ sớm cất cánh.' },
        { word: 'Put off', ipa: '/pʊt ɒf/', meaning: 'Trì hoãn', example: 'Don\'t put off until tomorrow what you can do today.', exampleMeaning: 'Đừng trì hoãn việc hôm nay đến ngày mai.' },
        { word: 'Turn down', ipa: '/tɜːn daʊn/', meaning: 'Từ chối, vặn nhỏ', example: 'He turned down the job offer.', exampleMeaning: 'Anh ấy đã từ chối lời đề nghị nhận việc.' }
      ];
    }

    return [
      { word: 'Diligence', ipa: '/ˈdɪl.ɪ.dʒəns/', meaning: 'Sự siêng năng, cần cù', example: 'Her diligence earned her the top rank.', exampleMeaning: 'Sự cần cù đã mang lại cho cô ấy vị trí dẫn đầu.' },
      { word: 'Fluency', ipa: '/ˈfluː.ən.si/', meaning: 'Sự trôi chảy, lưu loát', example: 'Fluency in English opens many career paths.', exampleMeaning: 'Sự trôi chảy tiếng Anh mở ra nhiều con đường sự nghiệp.' },
      { word: 'Obsolete', ipa: '/ˌɒb.səˈliːt/', meaning: 'Lỗi thời, cổ xưa', example: 'Floppy disks are completely obsolete now.', exampleMeaning: 'Đĩa mềm hiện tại đã hoàn toàn lỗi thời.' },
      { word: 'Collaborate', ipa: '/kəˈlæb.ə.reɪt/', meaning: 'Hợp tác, cộng tác', example: 'Tutors and students collaborate to succeed.', exampleMeaning: 'Gia sư và học sinh hợp tác để thành công.' },
      { word: 'Comprehensive', ipa: '/ˌkɒm.prɪˈhen.sɪv/', meaning: 'Toàn diện, đầy đủ', example: 'The center provides a comprehensive review.', exampleMeaning: 'Trung tâm cung cấp một đợt ôn tập toàn diện.' },
      { word: 'Interactive', ipa: '/ˌɪn.təˈræk.tɪv/', meaning: 'Tương tác qua lại', example: 'Interactive games help memorize words faster.', exampleMeaning: 'Trò chơi tương tác giúp ghi nhớ từ vựng nhanh hơn.' },
      { word: 'Innovative', ipa: '/ˈɪn.ə.və.tɪv/', meaning: 'Mang tính đổi mới, sáng tạo', example: 'We use innovative tutoring methods.', exampleMeaning: 'Chúng tôi sử dụng các phương pháp giảng dạy đổi mới.' },
      { word: 'Evaluate', ipa: '/ɪˈvæl.ju.eɪt/', meaning: 'Đánh giá, ước lượng', example: 'The teacher will evaluate your quiz score.', exampleMeaning: 'Giáo viên sẽ đánh giá điểm số bài thi của bạn.' }
    ];
  };

  const handleStartVocabStudy = (file: MaterialFile) => {
    setActiveVocabFile(file);
    const words = getVocabWordsForFile(file.name);
    setVocabWords(words);
    setVocabMode('flashcard');
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
    setVocabQuizAnswers({});
    setVocabQuizSubmitted(false);
    
    // Prepare match game shuffles
    const selectedWords = words.slice(0, 6);
    const cards: any[] = [];
    selectedWords.forEach(w => {
      cards.push({ id: 'w-' + w.word, type: 'word', text: w.word, value: w.word });
      cards.push({ id: 'm-' + w.word, type: 'meaning', text: w.meaning, value: w.word });
    });
    // Fisher-Yates Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    setMatchCardsList(cards);
    setMatchedVocabWords([]);
    setSelectedMatchCard(null);
    setMatchSeconds(0);
    setMatchActive(false);
    setMatchFinished(false);
  };

  // Match Game Ticker
  useEffect(() => {
    let ticker: any;
    if (matchActive && !matchFinished && activeVocabFile) {
      ticker = setInterval(() => {
        setMatchSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(ticker);
  }, [matchActive, matchFinished, activeVocabFile]);

  // Speech pronunciation utility
  const speakWord = (wordText: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt của bạn không hỗ trợ phát âm tự động.');
    }
  };

  const handleMatchCardClick = (cardId: string, cardValue: string) => {
    if (!matchActive) {
      setMatchActive(true);
    }
    if (matchedVocabWords.includes(cardValue)) return;
    if (selectedMatchCard === cardId) return;

    if (!selectedMatchCard) {
      setSelectedMatchCard(cardId);
      setMismatchedCards([]);
    } else {
      const prevCard = matchCardsList.find(c => c.id === selectedMatchCard);
      const curCard = matchCardsList.find(c => c.id === cardId);

      if (prevCard && curCard && prevCard.value === cardValue && prevCard.type !== curCard.type) {
        // Correct Match
        setMatchedVocabWords(prev => {
          const updated = [...prev, cardValue];
          if (updated.length === 6) {
            setMatchFinished(true);
            setMatchActive(false);
          }
          return updated;
        });
        setSelectedMatchCard(null);
      } else {
        // Mismatch - flash red and reset selection
        setMismatchedCards([selectedMatchCard, cardId]);
        setSelectedMatchCard(null);
        setTimeout(() => {
          setMismatchedCards([]);
        }, 800);
      }
    }
  };

  // Simulated AI Question Extractor
  const runAIExtractorSimulation = (fileName: string, fileSize: string) => {
    setIsExtracting(true);
    setExtractionProgress(10);
    
    // Simulate extraction loading increments
    const interval = setInterval(() => {
      setExtractionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExtracting(false);
            setExtractionProgress(0);
            
            // Auto generate dynamic questions based on current subject
            const subject = activeMaterialsSubject || 'Toán học';
            const generated = generateAIQuestionsForSubject(subject);
            
            setTempFileForConfig({ name: fileName, size: fileSize });
            setConfigQuestions(generated);
            setConfigExamTitle(fileName.replace(/\.[^/.]+$/, ""));
            setConfigAnswerKeyName(fileName.replace(/\.[^/.]+$/, "") + ' - Đáp án chi tiết.pdf');
            setShowConfigModal(true);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Subject-based dynamic quiz generators
  const generateAIQuestionsForSubject = (subj: string): MaterialQuestion[] => {
    if (subj === 'Vật lý') {
      return [
        {
          id: 1,
          type: 'MCQ',
          text: 'Một con lắc lò xo dao động điều hòa với chu kỳ T = 2s. Tần số dao động của con lắc là:',
          options: ['0.5 Hz', '1 Hz', '2 Hz', '4 Hz'],
          correctAnswer: 'A'
        },
        {
          id: 2,
          type: 'TF',
          text: 'Một vật dao động điều hòa dọc theo trục Ox. Khảo sát các mệnh đề sau:',
          statements: [
            'a) Li độ của vật đạt cực đại khi vật đi qua vị trí biên dương.',
            'b) Vận tốc của vật đạt độ lớn cực đại khi vật ở vị trí biên.',
            'c) Gia tốc của vật có giá trị cực tiểu khi vật ở biên âm.',
            'd) Chu kỳ dao động tỷ lệ nghịch với tần số của dao động.'
          ],
          correctAnswer: { 0: true, 1: false, 2: false, 3: true }
        },
        {
          id: 3,
          type: 'SHORT',
          text: 'Một con lắc lò xo có độ cứng k = 50 N/m dao động điều hòa. Vật có khối lượng m = 200g. Tìm tần số góc w của con lắc lò xo theo đơn vị rad/s.',
          correctAnswer: '15.8'
        }
      ];
    } else if (subj === 'Hóa học') {
      return [
        {
          id: 1,
          type: 'MCQ',
          text: 'Chất nào sau đây thuộc loại este no, đơn chức, mạch hở?',
          options: ['CH3COOCH3', 'CH2=CHCOOCH3', 'HCOOCH2CH=CH2', 'C6H5COOCH3'],
          correctAnswer: 'A'
        },
        {
          id: 2,
          type: 'TF',
          text: 'Khảo sát các tính chất vật lý và hóa học của este và lipit:',
          statements: [
            'a) Este thường có nhiệt độ sôi thấp hơn axit cacboxylic có cùng số nguyên tử cacbon.',
            'b) Phản ứng thủy phân este trong môi trường axit là phản ứng một chiều.',
            'c) Chất béo lỏng chứa chủ yếu các gốc axit béo chưa no.',
            'd) Tristearin là một chất béo rắn ở điều kiện thường.'
          ],
          correctAnswer: { 0: true, 1: false, 2: true, 3: true }
        },
        {
          id: 3,
          type: 'SHORT',
          text: 'Xà phòng hóa hoàn toàn 8.8 gam etyl axetat bằng dung dịch NaOH vừa đủ, thu được bao nhiêu gam muối khan?',
          correctAnswer: '8.2'
        }
      ];
    } else if (subj === 'Tiếng Anh') {
      return [
        {
          id: 1,
          type: 'MCQ',
          text: 'If I _______ English fluently, I would get a high-paying job at Huy Hoang Tutor Center.',
          options: ['spoke', 'speak', 'had spoken', 'will speak'],
          correctAnswer: 'A'
        },
        {
          id: 2,
          type: 'TF',
          text: 'Analyze the passive voice statements in English grammar:',
          statements: [
            'a) Passive voice is formed by using the auxiliary verb "be" followed by a past participle.',
            'b) "He writes a letter" becomes "A letter is written by him" in passive voice.',
            'c) Passive voice is used when the actor of the action is unknown or not important.',
            'd) Every English verb can be used in passive voice sentences.'
          ],
          correctAnswer: { 0: true, 1: true, 2: true, 3: false }
        },
        {
          id: 3,
          type: 'SHORT',
          text: 'Complete the sentence with the correct form of the verb in bracket: "I wish I (can) _______ fly like a bird."',
          correctAnswer: 'could'
        }
      ];
    } else if (subj === 'Ngữ văn') {
      return [
        {
          id: 1,
          type: 'MCQ',
          text: 'Tác phẩm truyện ngắn "Vợ nhặt" là sáng tác của nhà văn nào?',
          options: ['Kim Lân', 'Tô Hoài', 'Nam Cao', 'Nguyễn Minh Châu'],
          correctAnswer: 'A'
        },
        {
          id: 2,
          type: 'TF',
          text: 'Đọc và khảo sát các phát biểu về tác phẩm "Chữ người tử tù" của Nguyễn Tuân:',
          statements: [
            'a) Nhân vật chính Huấn Cao được xây dựng dựa trên hình mẫu Cao Bá Quát.',
            'b) Cảnh cho chữ diễn ra trong buồng giam tối tăm, chật hẹp, ẩm ướt.',
            'c) Quản ngục là một người độc ác và không có tình thương nghệ thuật.',
            'd) Tác phẩm khẳng định sức mạnh chiến thắng của cái đẹp và thiên lương.'
          ],
          correctAnswer: { 0: true, 1: true, 2: false, 3: true }
        },
        {
          id: 3,
          type: 'SHORT',
          text: 'Nhân vật trữ tình trong bài thơ "Sóng" của nhà thơ Xuân Quỳnh là hình tượng đại diện cho đối tượng nào? (Điền 2 từ)',
          correctAnswer: 'em'
        }
      ];
    } else if (subj === 'Khoa học tự nhiên') {
      return [
        {
          id: 1,
          type: 'MCQ',
          text: 'Nhóm sinh vật nào sau đây có khả năng tự dưỡng quang hợp?',
          options: ['Thực vật màu xanh', 'Nấm men', 'Động vật ăn cỏ', 'Vi khuẩn ký sinh'],
          correctAnswer: 'A'
        },
        {
          id: 2,
          type: 'TF',
          text: 'Khảo sát các phát biểu về đa dạng sinh học và môi trường:',
          statements: [
            'a) Đa dạng sinh học đóng vai trò quan trọng trong việc giữ cân bằng sinh thái.',
            'b) Rừng nhiệt đới là hệ sinh thái có độ đa dạng loài thấp nhất.',
            'c) Ô nhiễm môi trường đất gây suy giảm đa dạng sinh học.',
            'd) Bảo tồn đa dạng sinh học là nhiệm vụ chung của toàn nhân loại.'
          ],
          correctAnswer: { 0: true, 1: false, 2: true, 3: true }
        },
        {
          id: 3,
          type: 'SHORT',
          text: 'Nhiệt độ sôi của nước nguyên chất ở áp suất khí quyển tiêu chuẩn là bao nhiêu độ C?',
          correctAnswer: '100'
        }
      ];
    } else {
      // Default: Toán học
      return [
        {
          id: 1,
          type: 'MCQ',
          text: 'Tìm tập xác định D của hàm số y = log(x - 3).',
          options: ['D = (3; +∞)', 'D = [3; +∞)', 'D = R \\ {3}', 'D = (0; +∞)'],
          correctAnswer: 'A'
        },
        {
          id: 2,
          type: 'TF',
          text: 'Cho hàm số y = x³ - 3x + 1. Khảo sát các mệnh đề sau:',
          statements: [
            'a) Hàm số đồng biến trên các khoảng (-∞; -1) và (1; +∞).',
            'b) Hàm số đạt cực đại tại điểm x = 1.',
            'c) Điểm uốn của đồ thị hàm số có tọa độ là I(0; 1).',
            'd) Giá trị cực tiểu của hàm số bằng -1.'
          ],
          correctAnswer: { 0: true, 1: false, 2: true, 3: true }
        },
        {
          id: 3,
          type: 'SHORT',
          text: 'Tìm giá trị nguyên nhỏ nhất của tham số m để hàm số y = x³ - 3x² + mx đồng biến trên tập số thực R.',
          correctAnswer: '3'
        }
      ];
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!canUpload) {
      alert('Chỉ tài khoản vai trò Giáo viên mới được quyền tải đề thi lên!');
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0] && activeMaterialsSubject && activeChapter) {
      const file = e.dataTransfer.files[0];
      const fileSize = (file.size / 1024 / 1024).toFixed(1) + ' MB';
      
      runAIExtractorSimulation(file.name, fileSize);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUpload) {
      alert('Chỉ tài khoản vai trò Giáo viên mới được quyền tải đề thi lên!');
      return;
    }

    if (e.target.files && e.target.files[0] && activeMaterialsSubject && activeChapter) {
      const file = e.target.files[0];
      const fileSize = (file.size / 1024 / 1024).toFixed(1) + ' MB';
      
      runAIExtractorSimulation(file.name, fileSize);
    }
  };

  // Add a question to creator config
  const handleAddQuestion = (type: 'MCQ' | 'TF' | 'SHORT') => {
    const newId = configQuestions.length + 1;
    let newQ: MaterialQuestion;
    if (type === 'MCQ') {
      newQ = { id: newId, type: 'MCQ', text: 'Nhập nội dung câu hỏi trắc nghiệm...', options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'], correctAnswer: 'A' };
    } else if (type === 'TF') {
      newQ = {
        id: newId,
        type: 'TF',
        text: 'Nhập nội dung câu hỏi Đúng/Sai...',
        statements: [
          'a) Mệnh đề phát biểu 1...',
          'b) Mệnh đề phát biểu 2...',
          'c) Mệnh đề phát biểu 3...',
          'd) Mệnh đề phát biểu 4...'
        ],
        correctAnswer: { 0: true, 1: true, 2: false, 3: false }
      };
    } else {
      newQ = { id: newId, type: 'SHORT', text: 'Nhập nội dung câu hỏi trả lời ngắn...', correctAnswer: 'Nhập đáp án đúng' };
    }
    setConfigQuestions(prev => [...prev, newQ]);
  };

  const handleRemoveQuestion = (id: number) => {
    setConfigQuestions(prev => prev.filter(q => q.id !== id).map((q, idx) => ({ ...q, id: idx + 1 })));
  };

  // Save the custom exam from creator config modal
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
      answerKeyName: configAnswerKeyName || (configExamTitle + ' - Đáp án chi tiết.pdf')
    };

    setMaterials(prev => {
      const subData = prev[activeMaterialsSubject] || {};
      const chData = subData[activeChapter] || [];
      return {
        ...prev,
        [activeMaterialsSubject]: {
          ...subData,
          [activeChapter]: [...chData, newFile]
        }
      };
    });

    alert('Đã tạo thành công đề thi thử trắc nghiệm: ' + configExamTitle);
    setShowConfigModal(false);
    setTempFileForConfig(null);
    setConfigQuestions([]);
    setConfigAnswerKeyName('');
  };

  // Upgraded Exam grading logic for THPT grading rules
  const handleExamSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      alert('Vui lòng điền Họ tên học sinh trước khi nộp bài!');
      return;
    }

    const currentQuestions = activeExam?.questions || [];
    let score = 0;
    
    // If no custom questions are associated, grade mock questions
    if (currentQuestions.length === 0) {
      const mockKeys: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B' };
      let correct = 0;
      for (let q = 1; q <= 10; q++) {
        if (examAnswers[q] === mockKeys[q]) {
          correct += 1;
        }
      }
      score = correct; // out of 10
    } else {
      // THPT Grading rules:
      // Part I (MCQ): 0.25 pt per question
      // Part II (TF combination scoring):
      // - 1 statement correct = 0.1 pt
      // - 2 statements correct = 0.25 pt
      // - 3 statements correct = 0.5 pt
      // - 4 statements correct = 1.0 pt
      // Part III (SHORT): 0.5 pt per question
      let totalMaxPoints = 0;
      let studentPoints = 0;

      currentQuestions.forEach((q) => {
        if (q.type === 'MCQ') {
          totalMaxPoints += 1.0;
          if (examAnswers[q.id] === q.correctAnswer) {
            studentPoints += 1.0;
          }
        } else if (q.type === 'TF') {
          totalMaxPoints += 1.0; // Max 1.0 point per question
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

      // Scale score out of 10.0
      if (totalMaxPoints > 0) {
        score = Math.round((studentPoints / totalMaxPoints) * 10 * 10) / 10;
      } else {
        score = 0;
      }
    }

    setExamScore(score);
    setExamSubmitted(true);
  };

  const handleExamReset = () => {
    setActiveExam(null);
    setStudentName('');
    setStudentClass('');
    setExamAnswers({});
    setExamTimeRemaining(2700);
    setExamSubmitted(false);
    setExamScore(0);
  };

  // Custom student PDF upload for test taking
  const handleStudentPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mockExamFile: MaterialFile = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        uploadedAt: new Date().toLocaleDateString('vi-VN'),
        uploadedBy: studentName || 'Học sinh',
        isExam: true,
        duration: 45,
        questions: presetQuestions,
        answerKeyName: file.name.replace(/\.[^/.]+$/, "") + ' - Đáp án chi tiết.pdf'
      };

      const fileLower = file.name.toLowerCase();
      const isEnglish = activeMaterialsSubject === 'Tiếng Anh' || 
        fileLower.includes('english') || 
        fileLower.includes('tieng anh') || 
        fileLower.includes('grammar') || 
        fileLower.includes('verb');

      if (isEnglish) {
        setActiveMaterialsSubject('Tiếng Anh');
        setStudentUploadedFile(mockExamFile);
        setShowUploadChoiceModal(true);
      } else {
        setActiveExam(mockExamFile);
        setExamAnswers({});
        setExamTimeRemaining(2700);
        setExamSubmitted(false);
        setExamScore(0);
        alert('Đã tải đề thi: ' + file.name + '. Bắt đầu làm bài thi!');
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return (mins < 10 ? '0' : '') + mins + ':' + (remainingSecs < 10 ? '0' : '') + remainingSecs;
  };

  return (
    <div className="w-full min-h-screen py-10 px-6 lg:px-12 flex flex-col gap-12 relative bg-slate-50 text-slate-800">
      {/* 3D Cards Perspective styling */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out infinite;
        }
      `}</style>

      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>

      {/* Interactive Vocabulary Center overlay */}
      {activeVocabFile ? (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <button
              onClick={() => setActiveVocabFile(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <ArrowLeft size={14} />
              Quay lại danh sách
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setVocabMode('flashcard')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${vocabMode === 'flashcard' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-550'}`}
              >
                Thẻ ghi nhớ
              </button>
              <button
                type="button"
                onClick={() => setVocabMode('quiz')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${vocabMode === 'quiz' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-550'}`}
              >
                Trắc nghiệm từ vựng
              </button>
              <button
                type="button"
                onClick={() => setVocabMode('match')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${vocabMode === 'match' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-550'}`}
              >
                Ghép thẻ chữ
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Sparkles size={20} className="text-amber-500" />
              <div>
                <h3 className="font-black text-slate-800 text-sm sm:text-base">Phòng học từ vựng tiếng Anh tương tác</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đề tài: {activeVocabFile.name}</span>
              </div>
            </div>

            {/* Vocab Words list is empty */}
            {vocabWords.length === 0 ? (
              <div className="text-center py-10 text-slate-400">Không tìm thấy từ vựng khả dụng.</div>
            ) : (
              <>
                {/* 1. Flashcard Mode */}
                {vocabMode === 'flashcard' && (
                  <div className="flex flex-col items-center gap-8 py-4">
                    <div 
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="w-full max-w-md h-64 perspective-1000 cursor-pointer group"
                    >
                      <div className={`relative w-full h-full preserve-3d duration-500 flex items-center justify-center rounded-3xl border border-slate-250 shadow-md ${isCardFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* Card Front */}
                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-center">
                          <span className="text-xs text-sky-500 uppercase tracking-widest font-extrabold">Từ vựng (English)</span>
                          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{vocabWords[currentCardIdx].word}</h2>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{vocabWords[currentCardIdx].ipa}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(vocabWords[currentCardIdx].word);
                              }}
                              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors border border-sky-200/40"
                              title="Nghe phát âm"
                            >
                              🔊
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Nhấn vào thẻ để xem nghĩa tiếng Việt</span>
                        </div>

                        {/* Card Back */}
                        <div className="absolute inset-0 backface-hidden bg-slate-900 text-white rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-center rotate-y-180 shadow-2xl">
                          <span className="text-xs text-emerald-400 uppercase tracking-widest font-extrabold">Ý nghĩa (Vietnamese)</span>
                          <h3 className="text-2xl font-bold text-white leading-snug">{vocabWords[currentCardIdx].meaning}</h3>
                          
                          <div className="border-t border-slate-800/80 pt-4 mt-2 max-w-xs">
                            <p className="text-xs italic text-slate-300 font-medium">"{vocabWords[currentCardIdx].example}"</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">({vocabWords[currentCardIdx].exampleMeaning})</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wide">Nhấn để quay lại mặt trước</span>
                        </div>
                      </div>
                    </div>

                    {/* Flashcards controls */}
                    <div className="flex items-center gap-6 mt-2">
                      <button
                        onClick={() => {
                          setIsCardFlipped(false);
                          setCurrentCardIdx(prev => (prev === 0 ? vocabWords.length - 1 : prev - 1));
                        }}
                        className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-95 transition-all cursor-pointer shadow-sm"
                      >
                        ← Từ trước
                      </button>
                      <span className="text-xs font-bold text-slate-600">
                        {currentCardIdx + 1} / {vocabWords.length}
                      </span>
                      <button
                        onClick={() => {
                          setIsCardFlipped(false);
                          setCurrentCardIdx(prev => (prev === vocabWords.length - 1 ? 0 : prev + 1));
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl active:scale-95 transition-all cursor-pointer shadow-md"
                      >
                        Từ tiếp theo →
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Practice Quiz Mode */}
                {vocabMode === 'quiz' && (
                  <div className="flex flex-col gap-6 py-2">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-semibold">Trả lời nghĩa tiếng Việt đúng nhất của các từ sau:</span>
                      {vocabQuizSubmitted && (
                        <button
                          type="button"
                          onClick={() => {
                            setVocabQuizAnswers({});
                            setVocabQuizSubmitted(false);
                          }}
                          className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold active:scale-95 transition-all cursor-pointer"
                        >
                          Làm lại bài
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-6">
                      {vocabWords.map((word, qIdx) => {
                        // Generate options dynamically: 1 correct + 3 incorrect meanings
                        const correctMeaning = word.meaning;
                        const incorrectMeanings = vocabWords
                          .filter(w => w.word !== word.word)
                          .map(w => w.meaning);
                        // Pick 3 random
                        const uniqueIncorrects = Array.from(new Set(incorrectMeanings)).slice(0, 3);
                        const options = [correctMeaning, ...uniqueIncorrects].sort();

                        const selectedAns = vocabQuizAnswers[word.word];
                        const isCorrect = selectedAns === correctMeaning;

                        return (
                          <div key={qIdx} className="flex flex-col gap-3.5 border-b border-slate-100 pb-5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Câu {qIdx + 1}</span>
                              <strong className="text-slate-800 text-sm">Nghĩa của từ: <span className="text-sky-600 font-black">"{word.word}"</span> là gì?</strong>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-3">
                              {options.map((opt, oIdx) => {
                                const isSelected = selectedAns === opt;
                                let btnStyle = "bg-white border-slate-200 hover:bg-slate-50 text-slate-655";
                                if (vocabQuizSubmitted) {
                                  if (opt === correctMeaning) {
                                    btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold";
                                  } else if (isSelected) {
                                    btnStyle = "bg-rose-50 border-rose-300 text-rose-700 font-bold";
                                  } else {
                                    btnStyle = "bg-white border-slate-100 opacity-60 text-slate-400";
                                  }
                                } else if (isSelected) {
                                  btnStyle = "bg-sky-50 border-sky-400 text-sky-700 font-bold ring-1 ring-sky-300";
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    disabled={vocabQuizSubmitted}
                                    onClick={() => setVocabQuizAnswers(prev => ({ ...prev, [word.word]: opt }))}
                                    className={`px-4 py-3 rounded-xl border text-left text-xs transition-all active:scale-98 cursor-pointer flex justify-between items-center ${btnStyle}`}
                                  >
                                    <span>{opt}</span>
                                    {vocabQuizSubmitted && opt === correctMeaning && <span className="text-emerald-600">✔ Đúng</span>}
                                    {vocabQuizSubmitted && isSelected && opt !== correctMeaning && <span className="text-rose-600">✘ Sai</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!vocabQuizSubmitted && (
                      <button
                        type="button"
                        onClick={() => {
                          if (Object.keys(vocabQuizAnswers).length < vocabWords.length) {
                            alert('Vui lòng chọn đầy đủ đáp án trước khi nộp bài!');
                            return;
                          }
                          setVocabQuizSubmitted(true);
                        }}
                        className="py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm btn-gradient shadow-md cursor-pointer active:scale-95 text-center mt-4"
                      >
                        Nộp bài trắc nghiệm
                      </button>
                    )}

                    {vocabQuizSubmitted && (
                      <div className="p-5 bg-sky-50 border border-sky-100 rounded-2xl flex flex-col gap-2 items-center text-center mt-4">
                        <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Kết quả đạt được</span>
                        <span className="text-3xl font-black text-sky-700">
                          {vocabWords.filter(w => vocabQuizAnswers[w.word] === w.meaning).length} / {vocabWords.length} câu đúng
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Chúc mừng bạn đã hoàn thành bài ôn tập từ vựng!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Match Game Mode */}
                {vocabMode === 'match' && (
                  <div className="flex flex-col gap-6 items-center py-2">
                    {/* Instructions and Timer */}
                    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                      <div className="text-slate-655 font-semibold leading-relaxed">
                        {!matchActive && !matchFinished ? (
                          <span className="text-sky-600 font-bold">Hãy nhấp vào một thẻ bất kỳ để bắt đầu tính giờ trò chơi!</span>
                        ) : (
                          <span>Ghép thẻ tiếng Anh với nghĩa tiếng Việt tương ứng.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
                        ⏱ Thời gian: <span className="text-sky-600 font-black">{matchSeconds} giây</span>
                      </div>
                    </div>

                    {/* Game Grid */}
                    {!matchFinished ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full mt-2">
                        {matchCardsList.map((card) => {
                          const isMatched = matchedVocabWords.includes(card.value);
                          const isSelected = selectedMatchCard === card.id;
                          const isMismatched = mismatchedCards.includes(card.id);

                          let style = "bg-white border-slate-200 hover:border-sky-300 text-slate-800 hover:bg-slate-50/50 shadow-sm";
                          if (isMatched) {
                            style = "bg-emerald-50 border-emerald-300 text-emerald-600 opacity-0 scale-90 pointer-events-none transition-all duration-500";
                          } else if (isMismatched) {
                            style = "bg-rose-50 border-rose-300 text-rose-600 animate-shake";
                          } else if (isSelected) {
                            style = "bg-sky-50 border-sky-400 text-sky-700 font-bold ring-2 ring-sky-300 scale-98";
                          }

                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => handleMatchCardClick(card.id, card.value)}
                              className={`p-5 min-h-[100px] flex items-center justify-center text-center text-xs font-bold rounded-2xl border transition-all active:scale-95 cursor-pointer leading-normal ${style}`}
                            >
                              <span>{card.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Celebration results card */
                      <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl shadow-inner flex flex-col gap-5 items-center max-w-md w-full text-center mt-4">
                        <span className="text-4xl">🏆</span>
                        <h4 className="font-serif text-slate-800 text-lg font-black italic">Chúc mừng bạn đã ghép xong!</h4>
                        <p className="text-xs sm:text-sm text-slate-550 leading-relaxed max-w-xs">
                          Bạn đã hoàn thành ghép 6 cặp từ vựng chính xác với thời gian kỷ lục:
                        </p>
                        <span className="text-2xl font-black text-sky-600">{matchSeconds} giây</span>

                        <button
                          type="button"
                          onClick={() => {
                            // Restart match game
                            handleStartVocabStudy(activeVocabFile);
                          }}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white btn-gradient shadow-md active:scale-95 transition-all cursor-pointer mt-2"
                        >
                          Chơi lại lượt mới
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : activeExam ? (
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <button
              onClick={handleExamReset}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <ArrowLeft size={14} />
              Quay lại danh sách
            </button>
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-2xl shadow-inner font-extrabold text-sm">
              <Timer size={16} className="animate-pulse" />
              <span>{formatTime(examTimeRemaining)}</span>
            </div>
          </div>

          {/* Split Screen Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel: PDF Exam Sheet View */}
            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 min-h-[500px] flex flex-col gap-4 shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-rose-500" />
                  <span className="font-bold text-slate-800 truncate text-sm sm:text-base">{activeExam.name}</span>
                </div>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">{activeExam.size}</span>
              </div>

              {/* Render Exam Content */}
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

                  {/* Render questions list */}
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
                        <span className="text-[10px] text-slate-450 font-bold uppercase">Tài liệu hướng dẫn giải:</span>
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

          {/* Certificate evaluation card */}
          {examSubmitted && (
            <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-lg flex flex-col gap-6 items-center max-w-3xl mx-auto w-full mt-4 text-center">
              <Award size={48} className="text-amber-500 animate-bounce" />
              
              <div className="border-[6px] border-double border-slate-300 p-8 rounded-2xl w-full bg-slate-50/50 flex flex-col gap-5 items-center relative overflow-hidden select-none">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full"></div>
                
                <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-widest">GIẤY CHỨNG NHẬN KẾT QUẢ THI THỬ</h4>
                <h3 className="font-serif text-slate-800 text-xl sm:text-2xl font-bold italic mt-1">Huy Hoàng Tutor Center</h3>
                
                <p className="text-xs sm:text-sm text-slate-650 max-w-md leading-relaxed mt-2">
                  Chứng nhận học viên <strong className="text-slate-800">{studentName}</strong> {studentClass ? `(Lớp: ${studentClass})` : ''} đã hoàn thành bài thi thử trắc nghiệm môn học <strong className="text-slate-800">{activeMaterialsSubject} Lớp {activeGrade}</strong> theo đúng cấu trúc tiêu chuẩn của Bộ Giáo dục & Đào tạo.
                </p>

                <div className="mt-4 flex flex-col items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Điểm thi quy đổi</span>
                  <span className="text-3xl font-black text-sky-600 mt-1">{examScore * 1.0} / 10.0</span>
                </div>

                <div className="w-full flex justify-between items-end mt-8 border-t border-slate-200/80 pt-6 text-[10px] text-slate-400 font-bold">
                  <div className="flex flex-col items-start gap-1">
                    <span>Ngày hoàn thành: {new Date().toLocaleDateString('vi-VN')}</span>
                    <span>Mã chứng chỉ: HHTC-THPT-{Math.floor(Math.random() * 900000 + 100000)}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="italic font-serif text-slate-500">Giám đốc học vụ</span>
                    <span className="text-slate-700 font-extrabold mt-3">Huy Hoàng</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer active:scale-95"
                >
                  In chứng nhận
                </button>
                <button
                  type="button"
                  onClick={handleExamReset}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
                >
                  Thoát phòng thi
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <header className="max-w-4xl mx-auto text-center flex flex-col gap-5 animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200/60 max-w-fit mx-auto uppercase tracking-wider shadow-sm">
              <Sparkles size={12} className="animate-spin text-sky-500" style={{ animationDuration: '8s' }} />
              <span>Hệ thống Gia sư Uy tín - Chất lượng</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.2] text-slate-900">
              Nền tảng Gia sư
              <br />
              <span className="text-gradient-primary">Huy Hoàng Tutor Center</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Kết nối gia sư chất lượng cao, tận tâm với học sinh cấp 1, 2, 3 và ôn thi đại học. Giải pháp tối ưu nâng cao học lực và điểm số thi cử.
            </p>

            {/* Quick Search */}
            <div className="mt-4 flex max-w-xl mx-auto w-full bg-white border border-slate-200/80 p-2 rounded-2xl items-center shadow-md relative">
              <div className="pl-3.5 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Tìm theo tên gia sư hoặc môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-0 outline-none px-3.5 py-2.5 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:ring-0"
              />
            </div>
          </header>

          {/* Stats Counter */}
          <section className="max-w-5xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Gia sư xuất sắc', count: '100+' },
              { label: 'Lớp học đã giao', count: '350+' },
              { label: 'Đánh giá 5 sao', count: '98%' },
              { label: 'Học sinh tiến bộ', count: '95%' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl text-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-sky-500/5 to-transparent rounded-bl-full pointer-events-none transition-transform duration-300 group-hover:scale-110"></div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-sky-600 mb-0.5">{stat.count}</h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </section>

          {/* Main Content Area */}
          <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side: Filter and Tutors List (Col-span 2) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-3">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <GraduationCap className="text-sky-500" />
                  Đội ngũ Gia sư Tiêu biểu
                </h2>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm text-xs"
                  >
                    <option value="All">Tất cả môn học</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                  </select>
                </div>
              </div>

              {/* Pricing Range Slider */}
              <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-550">
                  <span className="font-semibold text-slate-600">Ngưỡng học phí đề xuất:</span>
                  <span className="font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                    Tối đa: {maxPrice.toLocaleString('vi-VN')} đ/giờ
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="400000"
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>100K đ/giờ</span>
                  <span>250K đ/giờ</span>
                  <span>400K đ/giờ</span>
                </div>
              </div>

              {/* Tutors Grid */}
              {loading ? (
                <div className="text-center py-16 text-slate-400">Đang tải danh sách gia sư...</div>
              ) : filteredTutors.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200/60 rounded-2xl">Không tìm thấy gia sư phù hợp</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTutors.map((tutor) => (
                    <div key={tutor.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-sky-300 hover:shadow-md">
                      <div className="flex gap-4 items-start">
                        <img
                          src={tutor.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={tutor.user.fullName}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm"
                        />
                        <div className="flex flex-col gap-0.5">
                          <h3 className="font-bold text-slate-800 hover:text-sky-655 transition-colors cursor-pointer text-sm sm:text-base" onClick={() => setSelectedTutor(tutor)}>
                            {tutor.user.fullName}
                          </h3>
                          <span className="text-[11px] text-slate-500 font-semibold">{tutor.experience}</span>
                          <div className="flex gap-1 items-center text-amber-500 text-[10px] font-bold mt-0.5">
                            <Star size={11} fill="currentColor" />
                            <span>5.0 ({tutor.feedbacks.length} đánh giá)</span>
                          </div>
                        </div>
                      </div>

                      {/* Subject Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {tutor.subjects.map((sub, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded bg-sky-50 border border-sky-100 text-[9px] font-bold text-sky-600">
                            {sub}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-555 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {tutor.bio}
                      </p>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Học phí</span>
                          <span className="text-sm font-extrabold text-sky-600">{tutor.hourlyRate.toLocaleString('vi-VN')}đ / giờ</span>
                        </div>
                        <button
                          onClick={() => setSelectedTutor(tutor)}
                          className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Open Class Requests List (Col-span 1) */}
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 border-b border-slate-200/60 pb-3">
                <BookOpen className="text-sky-500" />
                Lớp học tuyển Gia sư
              </h2>

              <div className="flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-8 text-slate-400">Đang tải lớp học...</div>
                ) : classRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-white border border-slate-200 rounded-2xl">Hiện tại chưa có lớp mới đăng tuyển</div>
                ) : (
                  classRequests.map((request) => (
                    <div key={request.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col gap-4 hover:border-sky-300 hover:shadow-md transition-all">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-100 text-[9px] font-bold text-sky-600">
                            {request.subject}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-600">
                            {request.grade}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 leading-snug text-sm sm:text-base">{request.title}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs text-slate-550 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-emerald-600" />
                          <span className="font-semibold text-slate-700">{request.hourlyRate.toLocaleString('vi-VN')}đ/h</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-sky-500" />
                          <span className="font-semibold text-slate-700">{request.sessionsPerWeek} buổi / tuần</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2 border-t border-slate-200/40 pt-2 mt-1">
                          <Calendar size={14} className="text-amber-600" />
                          <span className="truncate text-slate-700">{request.schedule}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin size={14} className="text-rose-500" />
                          <span className="truncate text-slate-700">{request.location}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed italic border-t border-slate-100 pt-3">
                        "{request.description}"
                      </p>

                      <button
                        onClick={() => handleApply(request.id)}
                        className="w-full py-2.5 text-xs font-bold text-white btn-gradient rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        Đăng ký dạy lớp này
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>

          {/* Interactive Study Materials Folder/Exam System Section */}
          <section className="max-w-7xl mx-auto w-full flex flex-col gap-6 mt-6 border-t border-slate-200/80 pt-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <FolderOpen className="text-sky-500" />
                  Kho Tài liệu & Phòng thi thử trực tuyến
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">Đầy đủ đề thi ôn tập học kỳ và phòng thi trắc nghiệm chấm điểm tự động từ lớp 1 đến lớp 12.</p>
              </div>

              {/* Demo Role Switcher & Student Upload PDF to Test */}
              <div className="flex flex-col sm:items-end gap-2.5">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-xs font-bold gap-1.5">
                  <span className="pl-2.5 text-[10px] text-slate-400 uppercase tracking-wide">Chế độ vai trò thử nghiệm:</span>
                  <button
                    type="button"
                    onClick={() => setIsTeacherRole(false)}
                    className={`px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${!isTeacherRole ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-50'}`}
                  >
                    Học sinh
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTeacherRole(true)}
                    className={`px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${isTeacherRole ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-50'}`}
                  >
                    Giáo viên
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleStudentPdfUpload}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <button className="px-4 py-2 text-xs font-bold text-white bg-sky-600 rounded-xl shadow-sm hover:bg-sky-700 flex items-center gap-1 active:scale-95 transition-all cursor-pointer">
                    <Upload size={13} />
                    <span>Upload đề thi PDF học sinh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* If Subject is not selected, display main Grade Selection and Subject Cards */}
            {activeMaterialsSubject === null ? (
              <div className="flex flex-col gap-6">
                {/* Grade tabs selection */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/60">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setActiveGrade(grade)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 border whitespace-nowrap active:scale-95 cursor-pointer ${
                        activeGrade === grade
                          ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Lớp {grade}
                    </button>
                  ))}
                </div>

                {/* Subject Cards layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(activeGrade <= 9
                    ? [
                        { name: 'Toán học', icon: '📐', count: '4 Thư mục' },
                        { name: 'Ngữ văn', icon: '📝', count: '4 Thư mục' },
                        { name: 'Tiếng Anh', icon: '🇬🇧', count: '4 Thư mục' },
                        { name: 'Khoa học tự nhiên', icon: '🌱', count: '4 Thư mục' }
                      ]
                    : [
                        { name: 'Toán học', icon: '📐', count: '4 Thư mục' },
                        { name: 'Ngữ văn', icon: '📝', count: '4 Thư mục' },
                        { name: 'Tiếng Anh', icon: '🇬🇧', count: '4 Thư mục' },
                        { name: 'Vật lý', icon: '⚛️', count: '4 Thư mục' },
                        { name: 'Hóa học', icon: '🧪', count: '4 Thư mục' }
                      ]
                  ).map((subject, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveMaterialsSubject(subject.name);
                        setActiveChapter(1); // Auto open chapter 1
                      }}
                      className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-sky-400 hover:shadow-md cursor-pointer transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{subject.icon}</span>
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{subject.count}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base mt-2 group-hover:text-sky-600 transition-colors">{subject.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Bấm vào để mở chương mục học tập</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Selected Subject: Display Folders layout and file listing */
              <div className="flex flex-col gap-6 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <button
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
                      <span className="text-xs text-slate-400 font-semibold">Chọn chương mục để xem và tải lên tài liệu</span>
                    </div>
                  </div>
                </div>

                {/* Chapters tab folder selector (1,2,3,4) */}
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

                {/* File list & Upload section of the active chapter */}
                {activeChapter && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-slate-100 pt-6">
                    {/* Files list (Col span 2) */}
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
                                      Thời gian: {file.duration} phút • {file.questions?.length || 0} câu hỏi (Đề thi tự sinh)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {file.isExam && (
                                  <button
                                    onClick={() => {
                                      setActiveExam(file);
                                      setExamAnswers({});
                                      setExamTimeRemaining((file.duration || 45) * 60);
                                      setExamSubmitted(false);
                                      setExamScore(0);
                                    }}
                                    className="px-3 py-1 rounded bg-rose-500 text-white font-bold text-[10px] hover:bg-rose-600 transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                                  >
                                    <FileSpreadsheet size={10} />
                                    <span>Làm đề</span>
                                  </button>
                                )}
                                {activeMaterialsSubject === 'Tiếng Anh' && (
                                  <button
                                    onClick={() => handleStartVocabStudy(file)}
                                    className="px-3 py-1 rounded bg-sky-500 text-white font-bold text-[10px] hover:bg-sky-600 transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                                  >
                                    <BookOpen size={10} />
                                    <span>Học từ vựng</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => alert('Bắt đầu tải tài liệu: ' + file.name)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-500 hover:text-sky-600 transition-colors cursor-pointer active:scale-95"
                                >
                                  <Download size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Upload panel (Col span 1) */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-extrabold uppercase text-slate-450 tracking-wider">Tải tài liệu mới lên</h4>
                      
                      {canUpload ? (
                        /* Teacher Upload Uploader */
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 transition-all min-h-[220px] ${
                            isExtracting
                              ? 'border-sky-500 bg-sky-50/30'
                              : dragActive
                              ? 'border-sky-500 bg-sky-50/50'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {isExtracting ? (
                            <>
                              <Cpu size={32} className="text-sky-500 animate-spin" />
                              <div className="text-xs font-bold text-sky-700 flex flex-col gap-2 w-full">
                                <span>AI Đang tự động trích xuất cấu trúc đề thi từ PDF...</span>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${extractionProgress}%` }}></div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload size={24} className="text-slate-400 animate-pulse" />
                              <div className="text-xs flex flex-col gap-1 text-slate-500">
                                <span className="font-bold text-slate-700">Kéo & thả đề thi PDF vào đây</span>
                                <span>hoặc chọn tệp để AI tự động trích xuất đề thi trắc nghiệm</span>
                              </div>

                              <div className="relative mt-2">
                                <input
                                  type="file"
                                  accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                                  onChange={handleFileInputChange}
                                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                />
                                <button className="px-3.5 py-2 text-xs font-bold text-slate-705 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95">
                                  Chọn tệp đề thi
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold mt-1">Hỗ trợ PDF, DOCX tối đa 20MB</span>
                            </>
                          )}
                        </div>
                      ) : (
                        /* Disabled upload panel for guest/student role */
                        <div className="border border-slate-200 bg-slate-50 p-6 rounded-2xl text-center flex flex-col items-center justify-center gap-3 min-h-[220px]">
                          <div className="p-3 bg-slate-100 rounded-full border border-slate-200 text-slate-400 shadow-inner">
                            <Lock size={20} />
                          </div>
                          <div className="text-xs text-slate-500 flex flex-col gap-1 px-2 leading-relaxed">
                            <span className="font-bold text-slate-750">Quyền truy cập hạn chế</span>
                            <span className="text-[11px] text-slate-400 leading-normal">
                              Chỉ tài khoản vai trò **Giáo viên** mới được quyền upload đề bài và đáp án. Vui lòng chuyển đổi vai trò ở thanh điều hướng thử nghiệm bên trên để trải nghiệm tính năng.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* English Upload study mode choices modal */}
          {showUploadChoiceModal && studentUploadedFile && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 flex flex-col gap-5 text-center animate-fade-in-up">
                <div className="p-3 bg-sky-50 rounded-full border border-sky-100 text-sky-600 w-max mx-auto shadow-inner">
                  <Sparkles size={24} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-black text-slate-800 text-base sm:text-lg">Chế độ học Tiếng Anh thông minh</h3>
                  <p className="text-xs text-slate-450 leading-relaxed px-4">
                    Hệ thống phát hiện tài liệu tải lên thuộc bộ môn **Tiếng Anh**. Vui lòng lựa chọn chế độ học tập bạn mong muốn:
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadChoiceModal(false);
                      setActiveExam(studentUploadedFile);
                      setExamAnswers({});
                      setExamTimeRemaining(2700);
                      setExamSubmitted(false);
                      setExamScore(0);
                      setStudentUploadedFile(null);
                      alert('Đã tải đề thi tiếng Anh tốt nghiệp. Bắt đầu làm bài thi!');
                    }}
                    className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>📝</span>
                    <span>Phòng thi trắc nghiệm THPT Quốc Gia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadChoiceModal(false);
                      handleStartVocabStudy(studentUploadedFile);
                      setStudentUploadedFile(null);
                    }}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-xs sm:text-sm btn-gradient shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>📇</span>
                    <span>Tự trích xuất từ vựng (Flashcard/Quizlet)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUploadChoiceModal(false);
                    setStudentUploadedFile(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-bold mt-2 cursor-pointer"
                >
                  Hủy tải lên
                </button>
              </div>
            </div>
          )}
          {/* Tutor Profile Detail Modal */}
          {selectedTutor && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-fade-in-up">
                {/* Header banner */}
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
                  <div className="flex gap-4 items-start">
                    <img
                      src={selectedTutor.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={selectedTutor.user.fullName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                    />
                    <div className="flex flex-col gap-0.5">
                      <h2 className="text-base sm:text-lg font-bold text-slate-800">{selectedTutor.user.fullName}</h2>
                      <span className="text-xs text-sky-600 font-bold">{selectedTutor.experience}</span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5 font-bold">
                        <Star size={12} fill="currentColor" />
                        <span>5.0 (Tốt)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTutor(null)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 transition-all cursor-pointer active:scale-95"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Profile Content */}
                <div className="p-6 flex flex-col gap-5 text-slate-700">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Giới thiệu bản thân</h4>
                    <p className="text-xs sm:text-sm text-slate-650 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedTutor.bio}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Môn học nhận dạy</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTutor.subjects.map((sub, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-50 border border-sky-100 text-sky-600">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Thông tin học phí đề xuất</h4>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <DollarSign size={15} className="text-emerald-600" />
                      <span>Học phí giảng dạy:</span>
                      <span className="font-extrabold text-sky-600 text-sm sm:text-base">{selectedTutor.hourlyRate.toLocaleString('vi-VN')} đ / giờ</span>
                    </div>
                  </div>

                  {selectedTutor.feedbacks && selectedTutor.feedbacks.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2.5">Đánh giá từ phụ huynh & học sinh</h4>
                      <div className="flex flex-col gap-2.5">
                        {selectedTutor.feedbacks.map((fb, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700 text-xs">{fb.student.user.fullName}</span>
                              <div className="flex gap-0.5 text-amber-500">
                                {Array.from({ length: fb.rating }).map((_, i) => (
                                  <Star key={i} size={10} fill="currentColor" className="border-0" />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-555 leading-relaxed italic">
                              "{fb.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
                  <button
                    onClick={() => setSelectedTutor(null)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-555 hover:text-slate-700 transition-colors cursor-pointer border border-slate-200 bg-white"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTutor(null);
                      if (user) {
                        navigate(user.role === 'STUDENT' ? '/student' : '/');
                      } else {
                        navigate('/login');
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white btn-gradient shadow-sm cursor-pointer active:scale-95"
                  >
                    Liên hệ Thuê Gia sư
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Teacher Custom Exam Creator Modal */}
      {showConfigModal && tempFileForConfig && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-fade-in-up flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
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

            <form onSubmit={handleSaveExamConfig} className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề đề thi</label>
                  <input
                    type="text"
                    required
                    value={configExamTitle}
                    onChange={(e) => setConfigExamTitle(e.target.value)}
                    className="input-premium rounded-xl px-4 py-3 text-xs text-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thời gian làm bài (Phút)</label>
                  <select
                    value={configDuration}
                    onChange={(e) => setConfigDuration(Number(e.target.value))}
                    className="input-premium rounded-xl px-4 py-3 text-xs text-slate-700 cursor-pointer"
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

              {/* Custom question builder UI */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-slate-450 tracking-wider">Danh sách câu hỏi & Đáp án</h4>
                    <span className="text-[9px] text-sky-600 font-bold block mt-0.5">*(AI đã tự động trích xuất các câu hỏi mẫu bên dưới)</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('MCQ')}
                      className="px-2.5 py-1 text-[10px] font-bold text-sky-655 bg-sky-50 border border-sky-100 rounded-lg hover:bg-sky-500 hover:text-white cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Plus size={10} />
                      <span>Trắc nghiệm MCQ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('TF')}
                      className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-500 hover:text-white cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Plus size={10} />
                      <span>Đúng / Sai</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('SHORT')}
                      className="px-2.5 py-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-500 hover:text-white cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Plus size={10} />
                      <span>Trả lời ngắn</span>
                    </button>
                  </div>
                </div>

                {/* Questions editor list */}
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {configQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col gap-3 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-700">Câu {q.id}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-sky-50 border border-sky-100 text-sky-600">
                          {q.type === 'MCQ' ? 'Trắc nghiệm MCQ' : q.type === 'TF' ? 'Đúng / Sai' : 'Trả lời ngắn'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Nội dung câu hỏi</label>
                        <input
                          type="text"
                          required
                          value={q.text}
                          onChange={(e) => setConfigQuestions(prev => prev.map(item => item.id === q.id ? { ...item, text: e.target.value } : item))}
                          className="input-premium rounded-lg px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      {/* Config MCQ Options */}
                      {q.type === 'MCQ' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                          {['A', 'B', 'C', 'D'].map((char, optIdx) => (
                            <div key={char} className="flex flex-col gap-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase">Lựa chọn {char}</label>
                              <input
                                type="text"
                                required
                                value={(q.options || [])[optIdx]}
                                onChange={(e) => setConfigQuestions(prev => prev.map(item => {
                                  if (item.id === q.id) {
                                    const opts = [...(item.options || [])];
                                    opts[optIdx] = e.target.value;
                                    return { ...item, options: opts };
                                  }
                                  return item;
                                }))}
                                className="input-premium rounded-lg px-3 py-1.5 text-xs text-slate-800"
                              />
                            </div>
                          ))}
                          <div className="flex flex-col gap-0.5 col-span-1 sm:col-span-2">
                            <label className="text-[8px] font-bold text-slate-400 uppercase">Đáp án đúng</label>
                            <select
                              value={q.correctAnswer}
                              onChange={(e) => setConfigQuestions(prev => prev.map(item => item.id === q.id ? { ...item, correctAnswer: e.target.value } : item))}
                              className="input-premium rounded-lg px-3 py-1.5 text-xs text-slate-705 cursor-pointer"
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Config TF Options */}
                      {q.type === 'TF' && (
                        <div className="flex flex-col gap-2 mt-1.5 bg-white p-3 rounded-xl border border-slate-100">
                          {['a', 'b', 'c', 'd'].map((char, stIdx) => (
                            <div key={char} className="flex flex-col gap-1.5 border-b border-slate-50 pb-2 last:border-b-0">
                              <div className="flex items-center gap-1.5 justify-between">
                                <label className="text-[8px] font-bold text-slate-400 uppercase">Mệnh đề {char}</label>
                                <div className="flex gap-2">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`config-q-${q.id}-st-${stIdx}`}
                                      checked={q.correctAnswer[stIdx] === true}
                                      onChange={() => setConfigQuestions(prev => prev.map(item => {
                                        if (item.id === q.id) {
                                          return { ...item, correctAnswer: { ...item.correctAnswer, [stIdx]: true } };
                                        }
                                        return item;
                                      }))}
                                      className="w-3.5 h-3.5 text-emerald-500 border-slate-300"
                                    />
                                    <span className="text-[10px] font-bold text-emerald-600">Đúng</span>
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`config-q-${q.id}-st-${stIdx}`}
                                      checked={q.correctAnswer[stIdx] === false}
                                      onChange={() => setConfigQuestions(prev => prev.map(item => {
                                        if (item.id === q.id) {
                                          return { ...item, correctAnswer: { ...item.correctAnswer, [stIdx]: false } };
                                        }
                                        return item;
                                      }))}
                                      className="w-3.5 h-3.5 text-rose-500 border-slate-300"
                                    />
                                    <span className="text-[10px] font-bold text-rose-600">Sai</span>
                                  </label>
                                </div>
                              </div>
                              <input
                                type="text"
                                required
                                value={(q.statements || [])[stIdx]}
                                onChange={(e) => setConfigQuestions(prev => prev.map(item => {
                                  if (item.id === q.id) {
                                    const sts = [...(item.statements || [])];
                                    sts[stIdx] = e.target.value;
                                    return { ...item, statements: sts };
                                  }
                                  return item;
                                }))}
                                className="input-premium rounded-lg px-3 py-1.5 text-xs text-slate-800"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Config Short Answer */}
                      {q.type === 'SHORT' && (
                        <div className="flex flex-col gap-1 mt-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase">Đáp án đúng (Điền từ/số)</label>
                          <input
                            type="text"
                            required
                            value={q.correctAnswer}
                            onChange={(e) => setConfigQuestions(prev => prev.map(item => item.id === q.id ? { ...item, correctAnswer: e.target.value } : item))}
                            className="input-premium rounded-lg px-3 py-2 text-xs text-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false);
                    setTempFileForConfig(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 hover:text-slate-700 transition-colors cursor-pointer bg-white border border-slate-200"
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
};
