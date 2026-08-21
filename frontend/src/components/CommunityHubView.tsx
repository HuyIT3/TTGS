import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Heart, Send, Plus, X, Trash2, Shield, Sparkles, Filter, Eye, Image, User, Edit3, ArrowLeft } from 'lucide-react';

interface QAReply {
  id: string;
  content: string;
  authorName: string;
  authorRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
}

interface QAQuestion {
  id: string;
  title: string;
  subject: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  authorRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
  replies: QAReply[];
}

interface BlogComment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Blog {
  id: string;
  title: string;
  category: string;
  bannerUrl: string;
  excerpt: string;
  content: string;
  authorName: string;
  createdAt: string;
  likes: string[]; // List of user IDs who liked
  comments: BlogComment[];
}

const defaultQuestions: QAQuestion[] = [
  {
    id: 'q-1',
    title: 'Hỏi bài đạo hàm chứa tham số m nâng cao',
    subject: 'Toán học',
    content: 'Em đang làm câu 45 đề khảo sát mà tìm điều kiện để hàm số y = (x^3 - 3x^2 + mx) đồng biến trên R. Em tính y\' rồi cho >= 0 với mọi x nhưng vẫn chưa giải ra m cụ thể. Thầy cô hay anh chị nào giải giúp em với ạ.',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    authorName: 'Tuệ Vương',
    authorRole: 'STUDENT',
    createdAt: '20/08/2026',
    replies: [
      {
        id: 'rep-1',
        content: 'Chào em, để hàm số bậc ba đồng biến trên R thì đạo hàm y\' = 3x^2 - 6x + m phải lớn hơn hoặc bằng 0 với mọi x thuộc R. Điều này tương đương với hệ số a = 3 > 0 (luôn đúng) và Delta\' = 9 - 3m <= 0 <=> 3m >= 9 <=> m >= 3. Vậy giá trị nguyên nhỏ nhất của m là 3 nhé!',
        authorName: 'Dư Hoàng Huy',
        authorRole: 'TEACHER',
        createdAt: '21/08/2026'
      }
    ]
  },
  {
    id: 'q-2',
    title: 'Phân biệt "which" và "that" trong mệnh đề quan hệ',
    subject: 'Tiếng Anh',
    content: 'Khi nào chúng ta bắt buộc dùng "that" thay cho "which" vậy ạ? Có trường hợp nào không được dùng "that" không?',
    authorName: 'Hoàng Mai Chi',
    authorRole: 'STUDENT',
    createdAt: '19/08/2026',
    replies: [
      {
        id: 'rep-2',
        content: 'Chào em! Một quy tắc cốt lõi là không được dùng "that" trong mệnh đề quan hệ KHÔNG XÁC ĐỊNH (mệnh đề có dấu phẩy ngăn cách). Ví dụ: "My laptop, which I bought yesterday, is very fast." - không được thay bằng "that". \nNgược lại, ta thường bắt buộc dùng "that" sau các đại từ bất định (everything, something, nothing...) hoặc sau các so sánh nhất.',
        authorName: 'Cao Vũ Băng Truyền',
        authorRole: 'TEACHER',
        createdAt: '20/08/2026'
      }
    ]
  }
];

const defaultBlogs: Blog[] = [
  {
    id: 'blog-1',
    title: 'Mẹo đạt điểm 9+ môn Toán kỳ thi THPT Quốc Gia 2026',
    category: 'Mẹo học tập',
    bannerUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Chia sẻ các chiến thuật phân bổ thời gian làm đề thi tốt nghiệp môn toán và cách bấm máy tính Casio giải nhanh cực trị, nguyên hàm.',
    content: 'Để đạt điểm cao trong kỳ thi sắp tới, học sinh cần rèn luyện phản xạ giải 30 câu đầu tiên trong tối đa 20 phút để dành trọn vẹn 70 phút còn lại cho các câu vận dụng cao. Bên cạnh đó, việc sử dụng nhuần nhuyễn máy tính Casio để thử đáp án hoặc kiểm tra tính đúng đắn của các biểu thức tích phân là công cụ bổ trợ cực kỳ đắc lực...',
    authorName: 'Gia sư Nguyễn Văn Hùng',
    createdAt: '12/08/2026',
    likes: ['u-5'],
    comments: [
      { id: 'bc-1', content: 'Bài viết rất bổ ích ạ, em sẽ áp dụng thử chiến thuật thời gian này.', authorName: 'Tuệ Vương', createdAt: '13/08/2026' }
    ]
  },
  {
    id: 'blog-2',
    title: 'Cẩm nang học 100 từ vựng Tiếng Anh mỗi ngày bằng Flashcard lật 3D',
    category: 'Phương pháp học',
    bannerUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Phương pháp ghi nhớ từ vựng tiếng anh học thuật dựa trên kỹ thuật Spaced Repetition (lặp lại ngắt quãng) kết hợp phát âm bản xứ.',
    content: 'Việc học vẹt từ vựng sẽ khiến bạn nhanh chóng quên đi sau vài ngày. Hãy áp dụng phương pháp lặp lại ngắt quãng (Spaced Repetition) bằng cách ôn lại từ vựng sau 1 ngày, 3 ngày, 7 ngày và 14 ngày. Hãy kết hợp công cụ Flashcard 3D có tích hợp phát âm giọng Mỹ của Hoa Hướng Dương Tutor Center để học cả ngữ âm và nghĩa từ vựng cùng lúc...',
    authorName: 'Gia sư Cao Vũ Băng Truyền',
    createdAt: '15/08/2026',
    likes: [],
    comments: []
  }
];

export default function CommunityHubView() {
  const { user } = useAuth();

  // Sub-tabs state: 'qa' | 'blog'
  const [activeSubTab, setActiveSubTab] = useState<'qa' | 'blog'>('qa');

  // Core database states
  const [questions, setQuestions] = useState<QAQuestion[]>(() => {
    const saved = localStorage.getItem('ttgs_community_questions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultQuestions;
  });

  const [blogs, setBlogs] = useState<Blog[]>(() => {
    const saved = localStorage.getItem('ttgs_community_blogs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultBlogs;
  });

  useEffect(() => {
    localStorage.setItem('ttgs_community_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('ttgs_community_blogs', JSON.stringify(blogs));
  }, [blogs]);

  // Q&A States
  const [qaSubjectFilter, setQaSubjectFilter] = useState('Tất cả');
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQTitle, setNewQTitle] = useState('');
  const [newQSubject, setNewQSubject] = useState('Toán học');
  const [newQContent, setNewQContent] = useState('');
  const [newQImageUrl, setNewQImageUrl] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<QAQuestion | null>(null);
  const [replyInputText, setReplyInputText] = useState('');

  // Blog States
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [blogCommentInput, setBlogCommentInput] = useState('');
  const [showCreateBlogModal, setShowCreateBlogModal] = useState(false);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Mẹo học tập');
  const [newBlogBanner, setNewBlogBanner] = useState('');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');

  // Ask Question Handler
  const handleAskQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim() || !newQContent.trim() || !user) return;

    const newQ: QAQuestion = {
      id: `q-${Date.now()}`,
      title: newQTitle,
      subject: newQSubject,
      content: newQContent,
      imageUrl: newQImageUrl.trim() || undefined,
      authorName: user.fullName,
      authorRole: user.role as any,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      replies: []
    };

    setQuestions(prev => [newQ, ...prev]);
    setShowAskModal(false);
    setNewQTitle('');
    setNewQContent('');
    setNewQImageUrl('');
  };

  // Reply Question Handler
  const handleSendReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInputText.trim() || !selectedQuestion || !user) return;

    const newReply: QAReply = {
      id: `rep-${Date.now()}`,
      content: replyInputText.trim(),
      authorName: user.fullName,
      authorRole: user.role as any,
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQuestion.id) {
        const updatedReplies = [...q.replies, newReply];
        setSelectedQuestion({ ...q, replies: updatedReplies });
        return { ...q, replies: updatedReplies };
      }
      return q;
    }));

    setReplyInputText('');
  };

  // Delete Q&A Question (Admin / Author)
  const handleDeleteQuestion = (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bài hỏi đáp này không?')) {
      setQuestions(prev => prev.filter(q => q.id !== qId));
      if (selectedQuestion?.id === qId) {
        setSelectedQuestion(null);
      }
    }
  };

  // Delete Q&A Reply (Admin)
  const handleDeleteReply = (qId: string, rId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu trả lời này?')) {
      setQuestions(prev => prev.map(q => {
        if (q.id === qId) {
          const updatedReplies = q.replies.filter(r => r.id !== rId);
          if (selectedQuestion?.id === qId) {
            setSelectedQuestion({ ...q, replies: updatedReplies });
          }
          return { ...q, replies: updatedReplies };
        }
        return q;
      }));
    }
  };

  // Blog Like Toggle
  const handleToggleLikeBlog = (bId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Vui lòng đăng nhập để thích bài viết.');
      return;
    }
    setBlogs(prev => prev.map(b => {
      if (b.id === bId) {
        const hasLiked = b.likes.includes(user.id);
        const updatedLikes = hasLiked
          ? b.likes.filter(id => id !== user.id)
          : [...b.likes, user.id];
        
        if (selectedBlog?.id === bId) {
          setSelectedBlog({ ...b, likes: updatedLikes });
        }
        return { ...b, likes: updatedLikes };
      }
      return b;
    }));
  };

  // Blog Comment Submit
  const handleSendBlogComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogCommentInput.trim() || !selectedBlog || !user) return;

    const newComment: BlogComment = {
      id: `bc-${Date.now()}`,
      content: blogCommentInput.trim(),
      authorName: user.fullName,
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    setBlogs(prev => prev.map(b => {
      if (b.id === selectedBlog.id) {
        const updatedComments = [...b.comments, newComment];
        setSelectedBlog({ ...b, comments: updatedComments });
        return { ...b, comments: updatedComments };
      }
      return b;
    }));

    setBlogCommentInput('');
  };

  // Blog Creation Handler
  const handleCreateBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogContent.trim() || !user) return;

    const newBlog: Blog = {
      id: `blog-${Date.now()}`,
      title: newBlogTitle,
      category: newBlogCategory,
      bannerUrl: newBlogBanner.trim() || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      excerpt: newBlogExcerpt || newBlogContent.substring(0, 100) + '...',
      content: newBlogContent,
      authorName: user.fullName,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      likes: [],
      comments: []
    };

    setBlogs(prev => [newBlog, ...prev]);
    setShowCreateBlogModal(false);
    setNewBlogTitle('');
    setNewBlogBanner('');
    setNewBlogExcerpt('');
    setNewBlogContent('');
  };

  // Delete Blog Post (Admin)
  const handleDeleteBlog = (bId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết Blog này không?')) {
      setBlogs(prev => prev.filter(b => b.id !== bId));
      if (selectedBlog?.id === bId) {
        setSelectedBlog(null);
      }
    }
  };

  // Delete Blog Comment (Admin)
  const handleDeleteBlogComment = (bId: string, cId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
      setBlogs(prev => prev.map(b => {
        if (b.id === bId) {
          const updatedComments = b.comments.filter(c => c.id !== cId);
          if (selectedBlog?.id === bId) {
            setSelectedBlog({ ...b, comments: updatedComments });
          }
          return { ...b, comments: updatedComments };
        }
        return b;
      }));
    }
  };

  const filteredQuestions = questions.filter(
    q => qaSubjectFilter === 'Tất cả' || q.subject === qaSubjectFilter
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tab Switcher Q&A vs Blog */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveSubTab('qa');
            setSelectedQuestion(null);
            setSelectedBlog(null);
          }}
          className={`px-6 py-3 font-bold text-xs sm:text-sm transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'qa'
              ? 'text-sky-500 border-sky-500'
              : 'text-slate-400 border-transparent hover:text-slate-350'
          }`}
        >
          Diễn đàn Hỏi đáp Học tập
        </button>
        <button
          onClick={() => {
            setActiveSubTab('blog');
            setSelectedQuestion(null);
            setSelectedBlog(null);
          }}
          className={`px-6 py-3 font-bold text-xs sm:text-sm transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'blog'
              ? 'text-sky-500 border-sky-500'
              : 'text-slate-400 border-transparent hover:text-slate-350'
          }`}
        >
          Góc Chia sẻ & Tips Giáo dục
        </button>
      </div>

      {/* SECTION 1: ACADEMIC Q&A PANEL */}
      {activeSubTab === 'qa' && (
        <div className="w-full flex flex-col gap-6">
          {!selectedQuestion ? (
            // Questions list View
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-805 text-sm tracking-wide uppercase text-slate-400">Diễn đàn trao đổi học thuật</h3>
                  <span className="text-[10px] text-slate-450 font-bold uppercase block mt-0.5">Đặt câu hỏi bài tập khó để gia sư và cộng đồng hỗ trợ giải đáp</span>
                </div>
                
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Vui lòng đăng nhập để đặt câu hỏi.');
                        return;
                      }
                      setShowAskModal(true);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <Plus size={15} />
                    <span>Đặt câu hỏi mới</span>
                  </button>
                </div>
              </div>

              {/* Subject filters */}
              <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1">
                  <Filter size={11} /> Bộ lọc:
                </span>
                {['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Ngữ văn'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setQaSubjectFilter(sub)}
                    className={`px-3.5 py-1.5 rounded-xl text-2xs font-bold transition-all cursor-pointer ${
                      qaSubjectFilter === sub
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-350'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Question list grid */}
              <div className="flex flex-col gap-4">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3.5 hover:border-sky-350 transition-all cursor-pointer shadow-sm relative group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-600">
                          {q.subject}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Đăng bởi {q.authorName} ({q.authorRole === 'STUDENT' ? 'Học sinh' : q.authorRole === 'TEACHER' ? 'Gia sư' : 'Admin'})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{q.createdAt}</span>
                        {(user?.role === 'ADMIN' || (user && user.fullName === q.authorName)) && (
                          <button
                            onClick={(e) => handleDeleteQuestion(q.id, e)}
                            className="p-1 text-slate-350 hover:text-rose-605 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {q.imageUrl && (
                        <img
                          src={q.imageUrl}
                          alt="Đề bài đính kèm"
                          className="w-full sm:w-28 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 flex flex-col gap-1">
                        <h4 className="font-extrabold text-slate-805 text-sm sm:text-base leading-snug group-hover:text-sky-600 transition-colors">
                          {q.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {q.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-[10px] font-bold text-sky-505 uppercase tracking-wider mt-1">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={13} />
                        {q.replies.length} thảo luận
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform">Xem chi tiết bài →</span>
                    </div>
                  </div>
                ))}

                {filteredQuestions.length === 0 && (
                  <p className="text-xs text-slate-450 italic text-center py-12 bg-slate-50/20 rounded-2xl">
                    Chưa có câu hỏi thảo luận nào cho chủ đề này.
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Question Detail View
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full animate-fade-in-up">
              {/* Question Header Card */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col gap-4 shadow-md relative">
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="absolute -top-12 left-0 text-slate-400 hover:text-slate-750 flex items-center gap-1 font-bold text-xs cursor-pointer"
                >
                  <ArrowLeft size={14} /> Quay lại diễn đàn
                </button>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-600">
                      {selectedQuestion.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Đăng bởi: {selectedQuestion.authorName} ({selectedQuestion.authorRole === 'STUDENT' ? 'Học sinh' : 'Thành viên'})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedQuestion.createdAt}</span>
                </div>

                <h3 className="font-extrabold text-slate-850 text-base sm:text-lg leading-snug">
                  {selectedQuestion.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60 shadow-inner">
                  {selectedQuestion.content}
                </p>

                {selectedQuestion.imageUrl && (
                  <div className="flex flex-col gap-1 mt-1 pl-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Image size={11} /> Ảnh chụp đề bài đính kèm:
                    </span>
                    <img
                      src={selectedQuestion.imageUrl}
                      alt="Ảnh đề bài"
                      className="max-h-72 w-auto object-contain rounded-2xl border border-slate-200 mt-1 shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Replies Thread list */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider font-mono px-1">
                  Ý kiến thảo luận & Hướng dẫn ({selectedQuestion.replies.length})
                </h4>

                {selectedQuestion.replies.map((reply) => (
                  <div key={reply.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-2 shadow-sm relative">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-800 text-xs">{reply.authorName}</strong>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border flex items-center gap-0.5 ${
                          reply.authorRole === 'TEACHER'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : reply.authorRole === 'ADMIN'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-slate-50 text-slate-505 border-slate-200'
                        }`}>
                          {reply.authorRole === 'ADMIN' && <Shield size={8} />}
                          {reply.authorRole === 'TEACHER' ? 'Gia sư đối tác' : reply.authorRole === 'ADMIN' ? 'Admin' : 'Học sinh'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{reply.createdAt}</span>
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteReply(selectedQuestion.id, reply.id)}
                            className="p-1 text-slate-355 hover:text-rose-605 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Xóa bình luận này"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mt-1">
                      {reply.content}
                    </p>
                  </div>
                ))}

                {selectedQuestion.replies.length === 0 && (
                  <p className="text-xs text-slate-400 text-center italic py-8">Chưa có ai gửi câu trả lời. Hãy đóng góp ý kiến đầu tiên của bạn!</p>
                )}
              </div>

              {/* Reply Form */}
              {user ? (
                <form onSubmit={handleSendReplySubmit} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex gap-3 shadow-md">
                  <textarea
                    required
                    rows={2}
                    placeholder="Gõ câu trả lời, lời giải của bạn tại đây..."
                    value={replyInputText}
                    onChange={(e) => setReplyInputText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-sky-500 resize-none placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="p-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition-all cursor-pointer self-end flex items-center justify-center shadow-md active:scale-95"
                  >
                    <Send size={15} />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">Vui lòng đăng nhập để có thể đóng góp câu trả lời thảo luận.</p>
              )}
            </div>
          )}

          {/* ASK QUESTION MODAL */}
          {showAskModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleAskQuestionSubmit} className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">Đặt câu hỏi bài tập mới</h3>
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer active:scale-95 bg-white shrink-0 animate-fade-in"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề câu hỏi</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Giúp giải câu hình tìm tâm mặt cầu ngoại tiếp..."
                        value={newQTitle}
                        onChange={(e) => setNewQTitle(e.target.value)}
                        className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Môn học</label>
                      <select
                        value={newQSubject}
                        onChange={(e) => setNewQSubject(e.target.value)}
                        className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800 cursor-pointer"
                      >
                        <option value="Toán học">Toán học</option>
                        <option value="Vật lý">Vật lý</option>
                        <option value="Hóa học">Hóa học</option>
                        <option value="Tiếng Anh">Tiếng Anh</option>
                        <option value="Ngữ văn">Ngữ văn</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nội dung chi tiết câu hỏi</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Mô tả cụ thể câu hỏi, những bước em đã làm được và chỗ em đang bị vướng mắc..."
                      value={newQContent}
                      onChange={(e) => setNewQContent(e.target.value)}
                      className="input-premium rounded-xl px-4 py-3 text-slate-805 text-xs resize-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      Đính kèm liên kết ảnh bài tập (URL)
                      <span className="text-slate-405 font-medium lowercase">(Tùy chọn)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg..."
                      value={newQImageUrl}
                      onChange={(e) => setNewQImageUrl(e.target.value)}
                      className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-800"
                    />
                    
                    {/* Mock quick image select options */}
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setNewQImageUrl('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop')}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-100 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                      >
                        [+] Gắn ảnh Đồ thị Toán mẫu
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewQImageUrl('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop')}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-100 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                      >
                        [+] Gắn ảnh Bài tập Anh mẫu
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 bg-white border border-slate-200 hover:text-slate-750"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md active:scale-95 cursor-pointer"
                  >
                    Đăng câu hỏi
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: EDUCATIONAL BLOG & TIPS PANEL */}
      {activeSubTab === 'blog' && (
        <div className="w-full flex flex-col gap-6">
          {!selectedBlog ? (
            // Blog list View
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-805 text-sm tracking-wide uppercase text-slate-400">Góc chia sẻ kiến thức</h3>
                  <span className="text-[10px] text-slate-450 font-bold uppercase block mt-0.5">Mẹo học tập, cẩm nang luyện thi THPT và bí quyết ôn luyện hiệu quả từ Gia sư</span>
                </div>
                
                {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => setShowCreateBlogModal(true)}
                    className="px-4 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap self-start sm:self-auto"
                  >
                    <Plus size={15} />
                    <span>Viết bài chia sẻ mới</span>
                  </button>
                )}
              </div>

              {/* Blog posts card layout grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog) => {
                  const hasLiked = user ? blog.likes.includes(user.id) : false;
                  return (
                    <div
                      key={blog.id}
                      onClick={() => setSelectedBlog(blog)}
                      className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between hover:scale-[1.01] hover:border-slate-350 transition-all cursor-pointer shadow-md group relative"
                    >
                      <div className="flex flex-col">
                        {/* Banner image */}
                        <div className="w-full h-44 overflow-hidden relative">
                          <img
                            src={blog.bannerUrl}
                            alt="Banner bài viết"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                          />
                          <span className="absolute top-4 left-4 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-[9px] font-black uppercase text-sky-400 rounded-lg tracking-wider">
                            {blog.category}
                          </span>
                          
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={(e) => handleDeleteBlog(blog.id, e)}
                              className="absolute top-4 right-4 p-2 bg-slate-900/80 backdrop-blur-sm text-slate-350 hover:text-rose-505 rounded-xl transition-colors cursor-pointer active:scale-90"
                              title="Xóa bài viết"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Text details */}
                        <div className="p-5 flex flex-col gap-2">
                          <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">{blog.createdAt} • Tác giả: {blog.authorName}</span>
                          <h4 className="font-extrabold text-slate-805 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-sky-655 transition-colors">
                            {blog.title}
                          </h4>
                          <p className="text-xs text-slate-505 leading-relaxed line-clamp-2 mt-1">
                            {blog.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Stats footer */}
                      <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleToggleLikeBlog(blog.id, e)}
                            className={`flex items-center gap-1 cursor-pointer transition-colors ${
                              hasLiked ? 'text-rose-500' : 'text-slate-450 hover:text-rose-500'
                            }`}
                          >
                            <Heart size={13} className={hasLiked ? 'fill-rose-500' : ''} />
                            <span>{blog.likes.length} Thích</span>
                          </button>
                          <span className="text-slate-400 flex items-center gap-1">
                            <MessageSquare size={13} />
                            {blog.comments.length} Bình luận
                          </span>
                        </div>

                        <span className="text-sky-505 group-hover:translate-x-1 transition-transform">Đọc tiếp →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Full Blog Article View
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full animate-fade-in-up">
              {/* Back link */}
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-slate-400 hover:text-slate-750 flex items-center gap-1 font-bold text-xs cursor-pointer self-start"
              >
                <ArrowLeft size={14} /> Quay lại danh mục chia sẻ
              </button>

              {/* Banner image full */}
              <div className="w-full h-64 rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative">
                <img
                  src={selectedBlog.bannerUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                <span className="absolute top-6 left-6 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm text-[10px] font-black uppercase text-sky-400 rounded-xl tracking-wider shadow-sm">
                  {selectedBlog.category}
                </span>
              </div>

              {/* Title & metadata */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-800">{selectedBlog.authorName}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Gia sư SunFlower</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{selectedBlog.createdAt}</span>
                </div>

                <h3 className="font-extrabold text-slate-850 text-base sm:text-xl leading-snug">
                  {selectedBlog.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedBlog.content}
                </p>

                <div className="border-t border-slate-100 pt-3 flex items-center gap-4 mt-2">
                  <button
                    onClick={(e) => handleToggleLikeBlog(selectedBlog.id, e)}
                    className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                      user && selectedBlog.likes.includes(user.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart size={14} className={user && selectedBlog.likes.includes(user.id) ? 'fill-rose-500' : ''} />
                    <span>{selectedBlog.likes.length} Thích bài viết này</span>
                  </button>
                </div>
              </div>

              {/* Comments Thread Section */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase text-slate-455 tracking-wider font-mono px-1">
                  Bình luận bài viết ({selectedBlog.comments.length})
                </h4>

                {selectedBlog.comments.map((comment) => (
                  <div key={comment.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-1 shadow-sm relative">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-800 text-xs">{comment.authorName}</strong>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{comment.createdAt}</span>
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteBlogComment(selectedBlog.id, comment.id)}
                            className="p-1 text-slate-355 hover:text-rose-605 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Xóa bình luận này"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed mt-1">
                      {comment.content}
                    </p>
                  </div>
                ))}

                {selectedBlog.comments.length === 0 && (
                  <p className="text-xs text-slate-400 text-center italic py-6">Chưa có bình luận thảo luận nào cho cẩm nang này.</p>
                )}
              </div>

              {/* Comment submission form */}
              {user ? (
                <form onSubmit={handleSendBlogComment} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex gap-3 shadow-md">
                  <input
                    type="text"
                    required
                    placeholder="Viết bình luận hoặc ý kiến của bạn tại đây..."
                    value={blogCommentInput}
                    onChange={(e) => setBlogCommentInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-sky-500 placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95"
                  >
                    Gửi
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-405 text-center py-4 italic">Vui lòng đăng nhập tài khoản để viết bình luận bài viết.</p>
              )}
            </div>
          )}

          {/* CREATE BLOG POST MODAL */}
          {showCreateBlogModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleCreateBlogSubmit} className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">Viết bài chia sẻ mẹo học tập mới</h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateBlogModal(false)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer active:scale-95 bg-white shrink-0"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề bài viết</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Bí quyết ghi nhớ 100 từ vựng..."
                        value={newBlogTitle}
                        onChange={(e) => setNewBlogTitle(e.target.value)}
                        className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-805"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chuyên mục</label>
                      <select
                        value={newBlogCategory}
                        onChange={(e) => setNewBlogCategory(e.target.value)}
                        className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-805 cursor-pointer"
                      >
                        <option value="Mẹo học tập">Mẹo học tập</option>
                        <option value="Phương pháp học">Phương pháp học</option>
                        <option value="Kinh nghiệm thi cử">Kinh nghiệm thi cử</option>
                        <option value="Góc Gia sư">Góc Gia sư</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Liên kết ảnh bìa Banner (URL)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newBlogBanner}
                      onChange={(e) => setNewBlogBanner(e.target.value)}
                      className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-805"
                    />
                    
                    {/* Mock quick background selectors */}
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setNewBlogBanner('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop')}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-100 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                      >
                        [+] Ảnh Banner Lớp Học
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewBlogBanner('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop')}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-100 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                      >
                        [+] Ảnh Banner Bút Sách
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tóm tắt ngắn (Excerpt)</label>
                    <input
                      type="text"
                      placeholder="Nhập mô tả tóm tắt ngắn cho bài viết hiển thị ở trang bìa..."
                      value={newBlogExcerpt}
                      onChange={(e) => setNewBlogExcerpt(e.target.value)}
                      className="input-premium rounded-xl px-4 py-2.5 text-xs text-slate-805"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nội dung chi tiết bài viết</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Viết nội dung chia sẻ chi tiết cẩm nang mẹo học tập tại đây..."
                      value={newBlogContent}
                      onChange={(e) => setNewBlogContent(e.target.value)}
                      className="input-premium rounded-xl px-4 py-3 text-slate-805 text-xs resize-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateBlogModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-505 bg-white border border-slate-200 hover:text-slate-750 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md active:scale-95 cursor-pointer"
                  >
                    Đăng bài viết
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
