import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Trophy, Timer, ChevronRight, ChevronLeft, Plus, X, RotateCcw, Volume2, Sparkles, GraduationCap, Edit, Trash2, ArrowLeft, Check, ShieldCheck } from 'lucide-react';

interface VocabWord {
  word: string;
  ipa: string;
  pos: string; // 'noun' | 'verb' | 'adj' | 'adv' | 'phrase'
  meaning: string;
  example: string;
  exampleMeaning: string;
}

interface VocabPack {
  id: string;
  title: string;
  description: string;
  grade: string;
  uploadedBy: string;
  createdAt: string;
  words: VocabWord[];
}

interface QuizQuestion {
  id: number;
  type: 'ENG_TO_VIE' | 'VIE_TO_ENG' | 'FILL_BLANK';
  questionText: string;
  options: string[];
  correctAnswer: string;
  word: string;
  ipa: string;
  pos: string;
  explanation: string;
}

interface LeaderboardRecord {
  packId: string;
  studentName: string;
  score: number;
  timeSpent: number;
  date: string;
}

const defaultPacks: VocabPack[] = [
  {
    id: 'pack-1',
    title: 'Tiếng Anh 12 - Từ vựng trọng tâm ôn thi tốt nghiệp',
    description: 'Tổng hợp từ vựng cốt lõi thường xuất hiện trong đề thi THPT Quốc Gia môn Tiếng Anh.',
    grade: 'Lớp 12',
    uploadedBy: 'Gia sư Trần Thị Lan',
    createdAt: '12/07/2026',
    words: [
      { word: 'Accumulate', ipa: '/əˈkjuːmjəleɪt/', pos: 'verb', meaning: 'Tích lũy, gom góp', example: 'Students accumulate useful knowledge through daily reading.', exampleMeaning: 'Học sinh tích lũy kiến thức bổ ích thông qua việc đọc sách hàng ngày.' },
      { word: 'Curriculum', ipa: '/kəˈrɪkjələm/', pos: 'noun', meaning: 'Chương trình học', example: 'The ministry is planning to update the national high school curriculum.', exampleMeaning: 'Bộ đang lên kế hoạch cập nhật chương trình học THPT quốc gia.' },
      { word: 'Dynamic', ipa: '/daɪˈnæmɪk/', pos: 'adj', meaning: 'Năng động, sôi nổi', example: 'Sunflower tutors always use dynamic teaching methods to engage students.', exampleMeaning: 'Gia sư Hoa Hướng Dương luôn sử dụng các phương pháp giảng dạy năng động để thu hút học sinh.' },
      { word: 'Evaluation', ipa: '/ɪˌvæljuˈeɪʃn/', pos: 'noun', meaning: 'Sự đánh giá, thẩm định', example: 'We conduct a monthly evaluation of student progress.', exampleMeaning: 'Chúng tôi tiến hành đánh giá hàng tháng sự tiến bộ của học sinh.' },
      { word: 'Facilitate', ipa: '/fəˈsɪlɪteɪt/', pos: 'verb', meaning: 'Tạo điều kiện thuận lợi, làm cho dễ dàng', example: 'Modern classroom facilities facilitate interactive learning.', exampleMeaning: 'Trang thiết bị lớp học hiện đại tạo điều kiện thuận lợi cho việc học tương tác.' }
    ]
  },
  {
    id: 'pack-2',
    title: 'Cụm động từ thông dụng (Common Phrasal Verbs)',
    description: 'Các phrasal verbs siêu phổ biến bắt buộc phải nhớ cho học sinh cấp 2 và cấp 3.',
    grade: 'Mọi khối lớp',
    uploadedBy: 'Admin',
    createdAt: '10/07/2026',
    words: [
      { word: 'Look after', ipa: '/lʊk ˈɑːftə/', pos: 'verb', meaning: 'Chăm sóc, trông nom', example: 'I have to look after my little sister when my parents are away.', exampleMeaning: 'Tôi phải chăm sóc em gái nhỏ khi bố mẹ đi vắng.' },
      { word: 'Run out of', ipa: '/rʌn aʊt ɒv/', pos: 'verb', meaning: 'Hết, cạn kiệt thứ gì đó', example: 'We have run out of time, so let’s wrap up this lesson.', exampleMeaning: 'Chúng ta đã hết thời gian rồi, hãy cùng kết thúc buổi học này.' },
      { word: 'Put off', ipa: '/pʊt ɒf/', pos: 'verb', meaning: 'Trì hoãn, hoãn lại', example: 'You should never put off your homework until the last minute.', exampleMeaning: 'Bạn không bao giờ nên trì hoãn bài tập về nhà cho đến phút cuối cùng.' },
      { word: 'Call off', ipa: '/cɔːl ɒf/', pos: 'verb', meaning: 'Hủy bỏ việc gì đó', example: 'The tutor session was called off because the student fell ill.', exampleMeaning: 'Buổi học gia sư đã bị hủy bỏ vì học sinh bị ốm.' },
      { word: 'Take up', ipa: '/teɪk ʌp/', pos: 'verb', meaning: 'Bắt đầu một thói quen hoặc sở thích mới', example: 'He decided to take up learning English vocabulary online every night.', exampleMeaning: 'Anh ấy quyết định bắt đầu thói quen học từ vựng tiếng Anh trực tuyến mỗi tối.' }
    ]
  },
  {
    id: 'pack-3',
    title: 'IELTS Academic Essentials - Gói từ học thuật',
    description: 'Các từ vựng học thuật quan trọng để nâng cao band điểm Reading & Writing.',
    grade: 'Lớp 10-12 / Luyện thi',
    uploadedBy: 'Gia sư Nguyễn Văn Hùng',
    createdAt: '15/07/2026',
    words: [
      { word: 'Analyze', ipa: '/ˈænəlaɪz/', pos: 'verb', meaning: 'Phân tích kỹ lưỡng', example: 'Students need to analyze the essay prompt before writing.', exampleMeaning: 'Học sinh cần phân tích kỹ đề bài luận trước khi viết.' },
      { word: 'Hypothesis', ipa: '/haɪˈpɒθəsɪs/', pos: 'noun', meaning: 'Giả thuyết khoa học', example: 'We need empirical evidence to prove this hypothesis.', exampleMeaning: 'Chúng ta cần bằng chứng thực nghiệm để chứng minh giả thuyết này.' },
      { word: 'Significant', ipa: '/sɪɡˈnɪfɪkənt/', pos: 'adj', meaning: 'Đáng kể, quan trọng', example: 'Good tutoring makes a significant difference in final test scores.', exampleMeaning: 'Gia sư giỏi tạo ra sự khác biệt đáng kể trong điểm số kỳ thi cuối kỳ.' },
      { word: 'Empirical', ipa: '/ɪmˈpɪrɪkl/', pos: 'adj', meaning: 'Dựa trên thực nghiệm, thực tế', example: 'This scientific theory is backed by empirical research.', exampleMeaning: 'Lý thuyết khoa học này được hỗ trợ bởi các nghiên cứu thực nghiệm.' },
      { word: 'Synthesize', ipa: '/ˈsɪnθəsaɪz/', pos: 'verb', meaning: 'Tổng hợp thông tin', example: 'Try to synthesize arguments from both passages.', exampleMeaning: 'Hãy cố gắng tổng hợp các luận điểm từ cả hai bài đọc.' }
    ]
  }
];

export default function VocabQuizView() {
  const { user } = useAuth();

  // State managers
  const [packs, setPacks] = useState<VocabPack[]>(() => {
    const saved = localStorage.getItem('ttgs_vocab_packs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved packs', e);
      }
    }
    return defaultPacks;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>(() => {
    const saved = localStorage.getItem('ttgs_vocab_leaderboard');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved leaderboard', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ttgs_vocab_packs', JSON.stringify(packs));
  }, [packs]);

  useEffect(() => {
    localStorage.setItem('ttgs_vocab_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Main UI state
  // 'list' | 'flashcard' | 'quiz' | 'leaderboard' | 'create'
  const [currentMode, setCurrentMode] = useState<'list' | 'flashcard' | 'quiz' | 'leaderboard' | 'create'>('list');
  const [selectedPack, setSelectedPack] = useState<VocabPack | null>(null);

  // Flashcards state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyingWords, setStudyingWords] = useState<VocabWord[]>([]);

  // Quiz game state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTime, setQuizTime] = useState(0); // in seconds
  const [quizFinished, setQuizFinished] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState<QuizQuestion[]>([]);

  // Form states for creating custom pack (Teacher only)
  const [newPackTitle, setNewPackTitle] = useState('');
  const [newPackDesc, setNewPackDesc] = useState('');
  const [newPackGrade, setNewPackGrade] = useState('Lớp 12');
  const [newWordsList, setNewWordsList] = useState<VocabWord[]>([
    { word: '', ipa: '', pos: 'noun', meaning: '', example: '', exampleMeaning: '' }
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Active quiz timer ref
  const timerRef = useRef<any>(null);

  // Helper function to shuffle arrays
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Web Speech API wrapper
  const playWordAudio = (e: React.MouseEvent, word: string) => {
    e.stopPropagation(); // Avoid flipping card
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel previous Speech
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  // Launch Flashcard study mode
  const startFlashcards = (pack: VocabPack) => {
    setSelectedPack(pack);
    setStudyingWords([...pack.words]);
    setCurrentWordIndex(0);
    setIsFlipped(false);
    setCurrentMode('flashcard');
  };

  const handleNextWord = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentWordIndex(prev => (prev + 1) % studyingWords.length);
    }, 200);
  };

  const handlePrevWord = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentWordIndex(prev => (prev - 1 + studyingWords.length) % studyingWords.length);
    }, 200);
  };

  const handleShuffleWords = () => {
    const shuffled = [...studyingWords];
    shuffleArray(shuffled);
    setStudyingWords(shuffled);
    setCurrentWordIndex(0);
    setIsFlipped(false);
  };

  // Launch Quiz practice mode
  const startQuiz = (pack: VocabPack) => {
    setSelectedPack(pack);
    const questions = generateQuizQuestions(pack);
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsQuestionAnswered(false);
    setQuizScore(0);
    setQuizTime(0);
    setQuizFinished(false);
    setIncorrectQuestions([]);
    setCurrentMode('quiz');

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuizTime(prev => prev + 1);
    }, 1000);
  };

  // Quiz generator logic
  const generateQuizQuestions = (pack: VocabPack): QuizQuestion[] => {
    const words = pack.words;
    if (!words || words.length === 0) return [];

    const generated: QuizQuestion[] = [];
    const totalQuestionsNeeded = Math.min(10, words.length * 3);

    for (let i = 0; i < totalQuestionsNeeded; i++) {
      const typeIndex = i % 3; // 0 = Eng->Vie, 1 = Vie->Eng, 2 = Fill blank
      const wordIndex = Math.floor(i / 3) % words.length;
      const targetWord = words[wordIndex];

      if (typeIndex === 0) {
        // English -> Vietnamese Meaning MCQ
        const options = [targetWord.meaning];
        const otherMeanings = words
          .filter(w => w.word !== targetWord.word)
          .map(w => w.meaning);

        while (options.length < 4 && otherMeanings.length > 0) {
          const randIdx = Math.floor(Math.random() * otherMeanings.length);
          const choice = otherMeanings[randIdx];
          if (!options.includes(choice)) {
            options.push(choice);
          }
          otherMeanings.splice(randIdx, 1);
        }

        // Fallbacks
        const fallbacks = ['Tích lũy', 'Tổng hợp', 'Bắt đầu sở thích', 'Chương trình học', 'Tạo điều kiện', 'Đánh giá'];
        while (options.length < 4) {
          const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
          if (!options.includes(fallback)) {
            options.push(fallback);
          }
        }

        shuffleArray(options);

        generated.push({
          id: i + 1,
          type: 'ENG_TO_VIE',
          questionText: `Nghĩa tiếng Việt của từ "${targetWord.word}" là gì?`,
          options,
          correctAnswer: targetWord.meaning,
          word: targetWord.word,
          ipa: targetWord.ipa,
          pos: targetWord.pos,
          explanation: `Từ "${targetWord.word}" (${targetWord.pos}) có nghĩa là "${targetWord.meaning}". Phiên âm: ${targetWord.ipa}.`
        });
      } else if (typeIndex === 1) {
        // Vietnamese -> English MCQ
        const options = [targetWord.word];
        const otherWords = words
          .filter(w => w.word !== targetWord.word)
          .map(w => w.word);

        while (options.length < 4 && otherWords.length > 0) {
          const randIdx = Math.floor(Math.random() * otherWords.length);
          const choice = otherWords[randIdx];
          if (!options.includes(choice)) {
            options.push(choice);
          }
          otherWords.splice(randIdx, 1);
        }

        const fallbacks = ['Curriculum', 'Accumulate', 'Facilitate', 'Significant', 'Synthesize', 'Put off'];
        while (options.length < 4) {
          const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
          if (!options.includes(fallback)) {
            options.push(fallback);
          }
        }

        shuffleArray(options);

        generated.push({
          id: i + 1,
          type: 'VIE_TO_ENG',
          questionText: `Từ tiếng Anh nào có nghĩa là "${targetWord.meaning}"?`,
          options,
          correctAnswer: targetWord.word,
          word: targetWord.word,
          ipa: targetWord.ipa,
          pos: targetWord.pos,
          explanation: `Từ "${targetWord.word}" có nghĩa là "${targetWord.meaning}".`
        });
      } else {
        // Fill in the blank (Sentence Context) MCQ
        const regex = new RegExp(`\\b${targetWord.word}\\b`, 'gi');
        const blankedSentence = targetWord.example.replace(regex, '________');

        const options = [targetWord.word];
        const otherWords = words
          .filter(w => w.word !== targetWord.word)
          .map(w => w.word);

        while (options.length < 4 && otherWords.length > 0) {
          const randIdx = Math.floor(Math.random() * otherWords.length);
          const choice = otherWords[randIdx];
          if (!options.includes(choice)) {
            options.push(choice);
          }
          otherWords.splice(randIdx, 1);
        }

        const fallbacks = ['facilitate', 'accumulate', 'look after', 'put off', 'analyze'];
        while (options.length < 4) {
          const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
          if (!options.includes(fallback)) {
            options.push(fallback);
          }
        }

        shuffleArray(options);

        generated.push({
          id: i + 1,
          type: 'FILL_BLANK',
          questionText: `Chọn từ phù hợp nhất điền vào chỗ trống:\n"${blankedSentence}"`,
          options,
          correctAnswer: targetWord.word,
          word: targetWord.word,
          ipa: targetWord.ipa,
          pos: targetWord.pos,
          explanation: `Câu ví dụ gốc: "${targetWord.example}"\nDịch nghĩa: "${targetWord.exampleMeaning}".`
        });
      }
    }

    shuffleArray(generated);
    return generated.map((q, idx) => ({ ...q, id: idx + 1 }));
  };

  const handleSelectAnswer = (ans: string) => {
    if (isQuestionAnswered) return;
    setSelectedAnswer(ans);
    setIsQuestionAnswered(true);

    const question = quizQuestions[currentQuestionIndex];
    if (ans === question.correctAnswer) {
      setQuizScore(prev => prev + 1);
    } else {
      setIncorrectQuestions(prev => [...prev, question]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsQuestionAnswered(false);
    } else {
      // Quiz finished
      if (timerRef.current) clearInterval(timerRef.current);
      setQuizFinished(true);

      // Save to leaderboard
      if (selectedPack) {
        const newRecord: LeaderboardRecord = {
          packId: selectedPack.id,
          studentName: user ? user.fullName : 'Học viên ẩn danh',
          score: quizScore + (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? 1 : 0),
          timeSpent: quizTime,
          date: new Date().toLocaleDateString('vi-VN')
        };
        const finalScore = quizScore + (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? 1 : 0);
        newRecord.score = finalScore;
        setLeaderboard(prev => [...prev, newRecord]);
      }
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Form custom vocabulary words handlers (Teacher view)
  const handleAddWordForm = () => {
    setNewWordsList(prev => [...prev, { word: '', ipa: '', pos: 'noun', meaning: '', example: '', exampleMeaning: '' }]);
  };

  const handleRemoveWordForm = (index: number) => {
    if (newWordsList.length === 1) return;
    const list = [...newWordsList];
    list.splice(index, 1);
    setNewWordsList(list);
  };

  const handleWordChange = (index: number, field: keyof VocabWord, val: string) => {
    const list = [...newWordsList];
    list[index] = { ...list[index], [field]: val };
    setNewWordsList(list);
  };

  const handleCreatePackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!newPackTitle.trim()) {
      setFormError('Vui lòng nhập tiêu đề gói từ vựng.');
      return;
    }
    const invalidWord = newWordsList.some(w => !w.word.trim() || !w.meaning.trim() || !w.example.trim());
    if (invalidWord) {
      setFormError('Vui lòng nhập đầy đủ Từ vựng, Nghĩa tiếng Việt và Câu ví dụ cho tất cả các từ.');
      return;
    }

    const newPack: VocabPack = {
      id: `pack-custom-${Date.now()}`,
      title: newPackTitle,
      description: newPackDesc,
      grade: newPackGrade,
      uploadedBy: user ? user.fullName : 'Gia sư',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      words: newWordsList.map(w => ({
        ...w,
        word: w.word.trim(),
        ipa: w.ipa.trim() || '/.../',
        meaning: w.meaning.trim(),
        example: w.example.trim(),
        exampleMeaning: w.exampleMeaning.trim() || 'Chưa có bản dịch ví dụ.'
      }))
    };

    setPacks(prev => [newPack, ...prev]);

    // Reset Form
    setNewPackTitle('');
    setNewPackDesc('');
    setNewWordsList([{ word: '', ipa: '', pos: 'noun', meaning: '', example: '', exampleMeaning: '' }]);
    setCurrentMode('list');
  };

  const handleDeletePack = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gói từ vựng này không?')) {
      setPacks(prev => prev.filter(p => p.id !== id));
      setLeaderboard(prev => prev.filter(r => r.packId !== id));
    }
  };

  const getLeaderboardForPack = (packId: string) => {
    return leaderboard
      .filter(r => r.packId === packId)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSpent - b.timeSpent; // lower time is better
      })
      .slice(0, 5); // top 5
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HEADER SECTION */}
      {currentMode === 'list' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-805 text-sm tracking-wide uppercase text-slate-400">Luyện từ vựng học thuật</h3>
            <p className="text-[10px] text-slate-450 font-bold uppercase block mt-0.5">Flashcards & Trắc nghiệm phản xạ</p>
          </div>
          {user?.role === 'TEACHER' && (
            <button
              onClick={() => setCurrentMode('create')}
              className="px-4 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap self-start"
            >
              <Plus size={15} />
              <span>Tạo gói từ vựng mới</span>
            </button>
          )}
        </div>
      )}

      {/* 1. LIST VIEW */}
      {currentMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => {
            const topRecord = getLeaderboardForPack(pack.id)[0];
            return (
              <div key={pack.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-5 relative overflow-hidden group">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-600">
                      {pack.grade} • {pack.words.length} từ vựng
                    </span>
                    {user?.role === 'TEACHER' && pack.id.startsWith('pack-custom-') && (
                      <button
                        onClick={() => handleDeletePack(pack.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Xóa gói này"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-805 text-sm sm:text-base leading-snug group-hover:text-sky-600 transition-colors line-clamp-2">
                    {pack.title}
                  </h4>
                  <p className="text-xs text-slate-505 line-clamp-2 leading-relaxed">
                    {pack.description || 'Gói từ vựng học tập chất lượng.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                    <span>Người tạo: {pack.uploadedBy}</span>
                    <span>{pack.createdAt}</span>
                  </div>

                  {topRecord && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 font-bold shadow-sm">
                      <Trophy size={12} className="text-amber-505 shrink-0" />
                      <span className="truncate">Kỷ lục: {topRecord.studentName} ({topRecord.score}đ - {formatDuration(topRecord.timeSpent)})</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => startFlashcards(pack)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-sky-55/80 text-sky-655 border border-sky-100 hover:bg-sky-500 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                    >
                      <BookOpen size={14} />
                      <span>Học thẻ</span>
                    </button>
                    <button
                      onClick={() => startQuiz(pack)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white btn-gradient transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Award size={14} />
                      <span>Luyện Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. FLASHCARD VIEW */}
      {currentMode === 'flashcard' && selectedPack && (
        <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMode('list')}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0 bg-white"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-[320px] sm:max-w-md">{selectedPack.title}</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chế độ ôn tập Flashcard</span>
            </div>
          </div>

          {/* Flashcard Component */}
          {studyingWords.length > 0 && (
            <div className="flex flex-col gap-6 items-center">
              <div className="w-full [perspective:1000px] h-72 relative">
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`w-full h-full cursor-pointer relative transition-all duration-500 rounded-3xl ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Side */}
                  <div 
                    className="absolute inset-0 bg-white border border-slate-200/80 rounded-3xl flex flex-col justify-between p-8 text-center shadow-xl shadow-sky-950/5 select-none"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">Mặt trước</span>
                      <button
                        onClick={(e) => playWordAudio(e, studyingWords[currentWordIndex].word)}
                        className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors border border-sky-100/50 bg-sky-50/20 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2.5 my-auto">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-850 tracking-tight text-gradient-primary">
                        {studyingWords[currentWordIndex].word}
                      </h2>
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-xs font-bold text-slate-450 italic">{studyingWords[currentWordIndex].ipa}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                          {studyingWords[currentWordIndex].pos}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-semibold animate-pulse uppercase tracking-wide">Nhấn vào thẻ để lật xem nghĩa</p>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 bg-sky-50/50 border border-sky-200/80 rounded-3xl flex flex-col justify-between p-8 text-center shadow-xl shadow-sky-950/5 select-none [transform:rotateY(180deg)]"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] uppercase font-bold text-sky-600 tracking-widest bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">Định nghĩa</span>
                      <button
                        onClick={(e) => playWordAudio(e, studyingWords[currentWordIndex].word)}
                        className="p-2 text-sky-655 hover:bg-sky-100 rounded-xl transition-colors border border-sky-100 bg-white cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-4 my-auto">
                      <h3 className="text-xl sm:text-2xl font-bold text-sky-850">
                        {studyingWords[currentWordIndex].meaning}
                      </h3>
                      <div className="bg-white border border-sky-100 p-4 rounded-xl text-left max-w-sm mx-auto shadow-sm">
                        <p className="text-xs text-slate-700 font-bold leading-relaxed">
                          {studyingWords[currentWordIndex].example}
                        </p>
                        <p className="text-[11px] text-slate-450 mt-1 italic leading-relaxed">
                          ({studyingWords[currentWordIndex].exampleMeaning})
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Nhấn vào thẻ để xoay lại</p>
                  </div>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-6 justify-center w-full">
                <button
                  onClick={handlePrevWord}
                  className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer active:scale-90 shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-bold text-slate-500">
                  {currentWordIndex + 1} / {studyingWords.length}
                </span>
                <button
                  onClick={handleNextWord}
                  className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer active:scale-90 shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleShuffleWords}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw size={14} />
                  <span>Xáo trộn từ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. QUIZ PRACTICE VIEW */}
      {currentMode === 'quiz' && selectedPack && quizQuestions.length > 0 && (
        <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="bg-sky-50 text-sky-600 w-8 h-8 rounded-xl flex items-center justify-center border border-sky-100 shadow-sm">
                <Timer size={16} />
              </span>
              <span className="text-xs font-bold text-slate-600 font-mono">Thời gian: {formatDuration(quizTime)}</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Bạn có muốn hủy bỏ bài kiểm tra từ vựng này không?')) {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setCurrentMode('list');
                }
              }}
              className="p-1.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-450 rounded-xl transition-all cursor-pointer active:scale-95 bg-white"
            >
              <X size={15} />
            </button>
          </div>

          {!quizFinished ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Tiến trình</span>
                  <span>Câu {currentQuestionIndex + 1} / {quizQuestions.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-5 border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl"></div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-100 text-[9px] font-bold text-sky-600 uppercase tracking-wider">
                    {quizQuestions[currentQuestionIndex].type === 'ENG_TO_VIE' ? 'Dịch nghĩa từ' : quizQuestions[currentQuestionIndex].type === 'VIE_TO_ENG' ? 'Tìm từ vựng' : 'Hoàn thành câu'}
                  </span>
                  {quizQuestions[currentQuestionIndex].type !== 'VIE_TO_ENG' && (
                    <button
                      onClick={(e) => playWordAudio(e, quizQuestions[currentQuestionIndex].word)}
                      className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-sky-100 cursor-pointer"
                    >
                      <Volume2 size={15} />
                    </button>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-850 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {quizQuestions[currentQuestionIndex].questionText}
                </h3>
              </div>

              {/* Options list */}
              <div className="flex flex-col gap-2.5">
                {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrect = option === quizQuestions[currentQuestionIndex].correctAnswer;
                  const isSelected = option === selectedAnswer;
                  
                  let optionStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50';
                  if (isQuestionAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-50 border-emerald-350 text-emerald-800 font-bold';
                    } else if (isSelected) {
                      optionStyle = 'bg-rose-50 border-rose-350 text-rose-800 font-bold';
                    } else {
                      optionStyle = 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={isQuestionAnswered}
                      className={`w-full p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-between text-left cursor-pointer active:scale-[0.99] ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isQuestionAnswered && isCorrect && <Check size={16} className="text-emerald-600 shrink-0" />}
                      {isQuestionAnswered && isSelected && !isCorrect && <X size={16} className="text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Real-time explanation text */}
              {isQuestionAnswered && (
                <div className="p-4 bg-sky-50 border border-sky-100 text-sky-850 rounded-2xl flex flex-col gap-1.5 animate-fade-in-up">
                  <span className="text-[10px] uppercase font-bold text-sky-655 tracking-wider">Giải thích chi tiết:</span>
                  <p className="text-xs leading-relaxed">{quizQuestions[currentQuestionIndex].explanation}</p>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full mt-3 py-2.5 rounded-xl font-bold text-xs text-white btn-gradient flex items-center justify-center gap-1 shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Quiz completed summary
            <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border border-slate-200 shadow-xl relative overflow-hidden animate-fade-in-up text-center">
              <div className="mx-auto bg-sky-50 text-sky-500 w-14 h-14 rounded-full flex items-center justify-center border border-sky-100 shadow-sm animate-bounce">
                <ShieldCheck size={28} />
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-extrabold text-slate-900 text-xl sm:text-2xl text-gradient-primary">
                  {quizScore === quizQuestions.length ? 'Tuyệt đỉnh - Điểm tối đa!' : quizScore >= 8 ? 'Xuất sắc!' : quizScore >= 5 ? 'Khá tốt!' : 'Cần cố gắng thêm!'}
                </h3>
                <p className="text-slate-500 text-xs font-semibold">Bạn đã hoàn thành bài luyện tập trắc nghiệm từ vựng</p>
              </div>

              {/* Statistics grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Điểm số</span>
                  <strong className="text-xl sm:text-2xl font-black text-sky-600 mt-1">{quizScore} / {quizQuestions.length}</strong>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Thời gian làm</span>
                  <strong className="text-xl sm:text-2xl font-black text-sky-600 mt-1">{formatDuration(quizTime)}</strong>
                </div>
              </div>

              {/* Review mistakes */}
              {incorrectQuestions.length > 0 && (
                <div className="flex flex-col gap-2.5 text-left border-t border-slate-100 pt-4 mt-2">
                  <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider font-mono">Các từ cần chú ý ôn lại:</span>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                    {incorrectQuestions.map((q, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-lg">
                        {q.word} ({q.pos}): {q.correctAnswer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Leaderboard status */}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 font-mono">
                  <Trophy size={12} className="text-amber-500" />
                  Bảng xếp hạng Gói này
                </span>
                <div className="flex flex-col gap-1.5">
                  {getLeaderboardForPack(selectedPack.id).map((record, index) => (
                    <div key={index} className="flex justify-between items-center text-xs p-2 bg-white border border-slate-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'
                        }`}>{index + 1}</span>
                        <span className="font-bold text-slate-700 truncate max-w-[130px]">{record.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-slate-500">
                        <span className="text-sky-600 font-bold">{record.score}đ</span>
                        <span>•</span>
                        <span>{formatDuration(record.timeSpent)}</span>
                      </div>
                    </div>
                  ))}
                  {getLeaderboardForPack(selectedPack.id).length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center italic py-2">Chưa có bảng điểm lưu trữ.</p>
                  )}
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex gap-3 border-t border-slate-100 pt-4 mt-2">
                <button
                  onClick={() => startQuiz(selectedPack)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-655 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                >
                  <RotateCcw size={14} />
                  <span>Luyện tập lại</span>
                </button>
                <button
                  onClick={() => setCurrentMode('list')}
                  className="flex-1 py-2.5 text-white btn-gradient rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-md"
                >
                  <ArrowLeft size={14} />
                  <span>Quay về danh sách</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CREATE PACK VIEW (TEACHER VIEW) */}
      {currentMode === 'create' && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-2xl mx-auto w-full relative overflow-hidden animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
            <button
              onClick={() => setCurrentMode('list')}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer active:scale-95 bg-white shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="font-bold text-slate-805 text-base sm:text-lg">Tạo gói từ vựng học thuật mới</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Giao diện soạn thảo từ vựng của Gia sư</span>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-semibold mb-4 animate-shake">
              <X size={15} className="text-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreatePackSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề Gói từ vựng</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Tiếng Anh 12 - Unit 1: Life Stories"
                value={newPackTitle}
                onChange={(e) => setNewPackTitle(e.target.value)}
                className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mô tả ngắn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Các từ vựng chính yếu về đề tài tiểu sử cuộc đời..."
                  value={newPackDesc}
                  onChange={(e) => setNewPackDesc(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trình độ / Khối lớp</label>
                <select
                  value={newPackGrade}
                  onChange={(e) => setNewPackGrade(e.target.value)}
                  className="input-premium rounded-xl px-4 py-3 text-slate-800 text-xs sm:text-sm cursor-pointer"
                >
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                  <option value="Mọi khối lớp">Mọi khối lớp</option>
                  <option value="Luyện thi đại học">Luyện thi đại học</option>
                  <option value="Luyện thi IELTS">Luyện thi IELTS</option>
                </select>
              </div>
            </div>

            {/* List of Words creator */}
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Danh sách từ vựng ({newWordsList.length})</span>
                <button
                  type="button"
                  onClick={handleAddWordForm}
                  className="px-3 py-1.5 bg-sky-50 text-sky-655 border border-sky-100 hover:bg-sky-500 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Thêm từ</span>
                </button>
              </div>

              <div className="flex flex-col gap-5 max-h-96 overflow-y-auto pr-1">
                {newWordsList.map((wordItem, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col gap-3 relative shadow-sm">
                    {newWordsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWordForm(index)}
                        className="absolute top-2 right-2 p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Xóa từ này"
                      >
                        <X size={14} />
                      </button>
                    )}

                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Từ thứ #{index + 1}</span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="flex flex-col gap-1.5 col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Từ vựng (English)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Accumulate"
                          value={wordItem.word}
                          onChange={(e) => handleWordChange(index, 'word', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Phiên âm (IPA)</label>
                        <input
                          type="text"
                          placeholder="e.g. /əˈkjuːmjəleɪt/"
                          value={wordItem.ipa}
                          onChange={(e) => handleWordChange(index, 'ipa', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Loại từ</label>
                        <select
                          value={wordItem.pos}
                          onChange={(e) => handleWordChange(index, 'pos', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value="noun">Danh từ (n)</option>
                          <option value="verb">Động từ (v)</option>
                          <option value="adj">Tính từ (adj)</option>
                          <option value="adv">Trạng từ (adv)</option>
                          <option value="phrase">Cụm từ (phrase)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Nghĩa tiếng Việt</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tích lũy, tích tụ"
                        value={wordItem.meaning}
                        onChange={(e) => handleWordChange(index, 'meaning', e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Câu ví dụ minh họa (English)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Students accumulate useful knowledge through daily reading."
                          value={wordItem.example}
                          onChange={(e) => handleWordChange(index, 'example', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Dịch nghĩa câu ví dụ (Vietnamese)</label>
                        <input
                          type="text"
                          placeholder="e.g. Học sinh tích lũy kiến thức bổ ích thông qua việc đọc sách hàng ngày."
                          value={wordItem.exampleMeaning}
                          onChange={(e) => handleWordChange(index, 'exampleMeaning', e.target.value)}
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
              Lưu và Hoàn tất
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
