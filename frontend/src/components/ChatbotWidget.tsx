import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, Cpu, Calendar, CreditCard, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const ChatbotWidget: React.FC = () => {
  const { user, token, apiUrl } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: ChatMessage = {
        sender: 'bot',
        text: user 
          ? `Xin chào ${user.fullName}! Tôi là Trợ lý Học vụ AI của Huy Hoàng Tutor Center. Tôi có thể giúp gì cho bạn hôm nay?`
          : 'Xin chào! Tôi là Trợ lý Học vụ ảo của trung tâm. Vui lòng đăng nhập để tra cứu lịch học, thông tin học phí cá nhân và trò chuyện trực tiếp cùng tôi.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcome]);
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    if (!user || !token) {
      // Prompt log in if guest
      setTimeout(() => {
        const botMsg: ChatMessage = {
          sender: 'bot',
          text: 'Vui lòng đăng nhập tài khoản của bạn để tôi có thể tra cứu thông tin lớp học và lịch học chính xác nhất.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          sender: 'bot',
          text: data.reply || 'Xin lỗi, tôi gặp sự cố khi phản hồi câu hỏi của bạn.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Chat failed');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        sender: 'bot',
        text: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = user?.role === 'STUDENT' ? [
    { text: 'Hôm nay tôi có lịch học không?', icon: <Calendar size={13} /> },
    { text: 'Xem danh sách lớp của tôi', icon: <BookOpen size={13} /> },
    { text: 'Học phí lớp của tôi thế nào?', icon: <CreditCard size={13} /> }
  ] : user?.role === 'TEACHER' ? [
    { text: 'Hôm nay có lịch dạy không?', icon: <Calendar size={13} /> },
    { text: 'Xem danh sách lớp tôi dạy', icon: <BookOpen size={13} /> },
    { text: 'Thông tin thu nhập học phí', icon: <CreditCard size={13} /> }
  ] : [
    { text: 'Xem danh sách gia sư tiêu biểu', icon: <Sparkles size={13} /> }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat window panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-4 animate-fade-in-up">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Cpu size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs sm:text-sm">Trợ lý Học vụ AI</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-bold text-sky-100 uppercase tracking-wide">Đang trực tuyến</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/15 transition-all text-sky-100 active:scale-90"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages box */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-slate-950 text-xs sm:text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'items-end self-end' : 'items-start self-start'
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-sky-500 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 font-semibold">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-1.5 self-start bg-slate-800 border border-slate-700/60 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap gap-2">
            {suggestions.map((chip, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleSendMessage(chip.text)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-[10px] font-bold border border-slate-700/50 cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                {chip.icon}
                <span>{chip.text}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            {!user ? (
              <div className="w-full text-center py-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-block px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md active:scale-95"
                >
                  Đăng nhập để Chat
                </Link>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="w-full flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Nhập câu hỏi của bạn tại đây..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500 focus:ring-0 placeholder-slate-550"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
                >
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bubble launcher button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-2xl hover:scale-110 active:scale-95 cursor-pointer transition-all hover:rotate-6 flex items-center justify-center relative group"
      >
        <MessageSquare size={24} />
        {!isOpen && (
          <span className="absolute right-14 bg-slate-900 border border-slate-800 text-[10px] font-bold text-sky-400 px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-md duration-350 pointer-events-none">
            Trò chuyện với Trợ lý AI
          </span>
        )}
      </button>
    </div>
  );
};
