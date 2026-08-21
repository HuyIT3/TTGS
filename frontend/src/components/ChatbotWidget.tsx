import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, Cpu, Calendar, CreditCard, Sparkles, BookOpen, MessageCircle, User, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
}

interface Contact {
  id: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  email: string;
  phone?: string;
}

export const ChatbotWidget: React.FC = () => {
  const { user, token, apiUrl } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Tab state: 'ai-bot' | 'direct'
  const [activeTab, setActiveTab] = useState<'ai-bot' | 'direct'>('direct');
  
  // AI Bot messages
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiInputText, setAiInputText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Direct Message states
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem('ttgs_direct_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [directInputText, setDirectInputText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const directMessagesEndRef = useRef<HTMLDivElement>(null);

  // Save Direct Messages to localStorage
  useEffect(() => {
    localStorage.setItem('ttgs_direct_messages', JSON.stringify(directMessages));
  }, [directMessages]);

  // Welcome message for AI Bot
  useEffect(() => {
    if (aiMessages.length === 0) {
      const welcome: ChatMessage = {
        sender: 'bot',
        text: user 
          ? `Xin chào ${user.fullName}! Tôi là Trợ lý Học vụ AI của Hoa Hướng Dương Tutor Center. Tôi có thể giúp gì cho bạn hôm nay?`
          : 'Xin chào! Tôi là Trợ lý Học vụ ảo của trung tâm. Vui lòng đăng nhập để tra cứu lịch học, thông tin học phí cá nhân và trò chuyện trực tiếp cùng tôi.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages([welcome]);
    }
  }, [user]);

  // Scroll to bottom
  useEffect(() => {
    if (activeTab === 'ai-bot') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      directMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiLoading, directMessages, selectedContact, activeTab]);

  // AI Chat Bot Send message handler
  const handleSendAiMessage = async (textToSend: string) => {
    if (!textToSend.trim() || aiLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInputText('');
    setAiLoading(true);

    if (!user || !token) {
      setTimeout(() => {
        const botMsg: ChatMessage = {
          sender: 'bot',
          text: 'Vui lòng đăng nhập tài khoản của bạn để tôi có thể tra cứu thông tin lớp học và lịch học chính xác nhất.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setAiMessages(prev => [...prev, botMsg]);
        setAiLoading(false);
      }, 800);
      return;
    }

    try {
      const customPrompt = localStorage.getItem('ttgs_chatbot_system_prompt') || undefined;
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: textToSend,
          systemPrompt: customPrompt
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          sender: 'bot',
          text: data.reply || 'Xin lỗi, tôi gặp sự cố khi phản hồi câu hỏi của bạn.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setAiMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Chat failed');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        sender: 'bot',
        text: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  // Dynamic Contacts Generator based on localStorage Admin Users
  const getContacts = (): Contact[] => {
    const saved = localStorage.getItem('ttgs_admin_users');
    let allUsers: any[] = [];
    if (saved) {
      try {
        allUsers = JSON.parse(saved);
      } catch {}
    }
    
    if (allUsers.length === 0) {
      allUsers = [
        { id: 'u-1', fullName: 'Huy Hoàng Admin', role: 'ADMIN', email: 'admin@huyhoang.com' },
        { id: 'u-2', fullName: 'Dư Hoàng Huy', role: 'TEACHER', email: 'tutor1@huyhoang.com' },
        { id: 'u-3', fullName: 'Cao Vũ Băng Truyền', role: 'TEACHER', email: 'tutor2@huyhoang.com' },
        { id: 'u-4', fullName: 'Lê Hoàng Nam', role: 'TEACHER', email: 'tutor3@huyhoang.com' },
        { id: 'u-5', fullName: 'Tuệ Vương', role: 'STUDENT', email: 'student1@huyhoang.com' },
        { id: 'u-6', fullName: 'Hoàng Mai Chi', role: 'STUDENT', email: 'student2@huyhoang.com' }
      ];
    }

    if (!user) return [];

    // Filter contacts based on logged in user's role
    if (user.role === 'STUDENT') {
      return allUsers.filter(u => u.id !== user.id && (u.role === 'TEACHER' || u.role === 'ADMIN'));
    } else if (user.role === 'TEACHER') {
      return allUsers.filter(u => u.id !== user.id && (u.role === 'STUDENT' || u.role === 'ADMIN'));
    } else {
      // Admin sees everyone else
      return allUsers.filter(u => u.id !== user.id);
    }
  };

  // Direct Message handlers
  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInputText.trim() || !selectedContact || !user) return;

    const textToSend = directInputText.trim();
    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      recipientId: selectedContact.id,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setDirectMessages(prev => [...prev, newMsg]);
    setDirectInputText('');

    // Simulated Auto-Reply to keep user interface alive
    setTimeout(() => {
      const autoReplyText = selectedContact.role === 'ADMIN'
        ? `Chào ${user.fullName}, Admin đã nhận được tin nhắn hỗ trợ của bạn: "${textToSend}". Chúng tôi sẽ phản hồi lại bạn ngay lập tức.`
        : `Chào bạn, thầy/cô đã nhận được tin nhắn trao đổi bài tập của bạn: "${textToSend}". Lát nữa thầy/cô check rồi rep lại em nhé!`;

      const replyMsg: DirectMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: selectedContact.id,
        recipientId: user.id,
        text: autoReplyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setDirectMessages(prev => [...prev, replyMsg]);
    }, 1500);
  };

  // Get current conversation messages
  const getCurrentConversation = () => {
    if (!selectedContact || !user) return [];
    return directMessages.filter(
      m => (m.senderId === user.id && m.recipientId === selectedContact.id) ||
           (m.senderId === selectedContact.id && m.recipientId === user.id)
    );
  };

  // Count unread simulated messages
  const getUnreadCount = (contactId: string) => {
    if (!user) return 0;
    // For simplicity, count last incoming message as unread if conversation is not active
    const msgs = directMessages.filter(m => m.senderId === contactId && m.recipientId === user.id);
    return msgs.length > 0 && selectedContact?.id !== contactId ? 1 : 0;
  };

  const aiSuggestions = user?.role === 'STUDENT' ? [
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
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-4 animate-fade-in-up">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs sm:text-sm">Hộp thư Sunflower</span>
                <span className="text-[9px] font-bold text-sky-100 uppercase tracking-wide">Trực tuyến 24/7</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/15 transition-all text-sky-100 active:scale-90 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Role tabs switcher */}
          {user && (
            <div className="bg-slate-950 border-b border-slate-800 flex shrink-0">
              <button
                onClick={() => {
                  setActiveTab('direct');
                  setSelectedContact(null);
                }}
                className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer text-center ${
                  activeTab === 'direct'
                    ? 'text-sky-400 border-b-2 border-sky-500 bg-slate-900/35'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Trò chuyện
              </button>
              <button
                onClick={() => setActiveTab('ai-bot')}
                className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer text-center ${
                  activeTab === 'ai-bot'
                    ? 'text-sky-400 border-b-2 border-sky-500 bg-slate-900/35'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Trợ lý AI
              </button>
            </div>
          )}

          {/* 1. DIRECT MESSAGING PANEL */}
          {activeTab === 'direct' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
              {!user ? (
                // Guest Prompt
                <div className="flex-1 flex flex-col justify-center items-center p-6 text-center gap-4 text-slate-400">
                  <User size={40} className="text-slate-600 animate-pulse" />
                  <p className="text-xs leading-relaxed max-w-[250px]">
                    Vui lòng đăng nhập tài khoản để nhắn tin trao đổi trực tiếp với gia sư hoặc bộ phận quản trị của trung tâm.
                  </p>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white btn-gradient shadow-md active:scale-95 transition-all"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              ) : selectedContact === null ? (
                // Contacts List View
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3 gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
                    Danh bạ liên hệ
                  </span>
                  
                  {getContacts().map((contact) => {
                    const unread = getUnreadCount(contact.id);
                    return (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-850 hover:border-slate-700/80 transition-all text-left cursor-pointer active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                            {contact.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-slate-200 truncate">{contact.fullName}</span>
                            <span className="text-[9px] font-bold text-slate-450 uppercase mt-0.5 flex items-center gap-1">
                              {contact.role === 'ADMIN' ? (
                                <Shield size={9} className="text-rose-500 shrink-0" />
                              ) : null}
                              {contact.role === 'ADMIN' ? 'Ban quản trị' : contact.role === 'TEACHER' ? 'Gia sư' : 'Học sinh'}
                            </span>
                          </div>
                        </div>

                        {unread > 0 ? (
                          <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-ping shrink-0 mr-1"></span>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></div>
                        )}
                      </button>
                    );
                  })}

                  {getContacts().length === 0 && (
                    <p className="text-[11px] text-slate-500 text-center italic py-10">
                      Chưa có liên hệ nào trong danh sách.
                    </p>
                  )}
                </div>
              ) : (
                // Chat conversation screen
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Contact Header */}
                  <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xs uppercase">
                        {selectedContact.fullName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-200">{selectedContact.fullName}</span>
                        <span className="text-[8px] text-emerald-400 font-semibold uppercase">Đang trực tuyến</span>
                      </div>
                    </div>
                  </div>

                  {/* Message body area */}
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                    {getCurrentConversation().map((msg) => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] ${
                            isMe ? 'items-end self-end' : 'items-start self-start'
                          }`}
                        >
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl leading-relaxed text-xs ${
                              isMe
                                ? 'bg-sky-500 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-500 mt-1 font-semibold">{msg.timestamp}</span>
                        </div>
                      );
                    })}
                    <div ref={directMessagesEndRef} />
                  </div>

                  {/* Send Direct Message Form */}
                  <form
                    onSubmit={handleSendDirectMessage}
                    className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="Nhập nội dung trao đổi..."
                      value={directInputText}
                      onChange={(e) => setDirectInputText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500 placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!directInputText.trim()}
                      className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* 2. AI ASSISTANT PANEL */}
          {activeTab === 'ai-bot' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
              {/* Messages container */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === 'user' ? 'items-end self-end' : 'items-start self-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl leading-relaxed text-xs ${
                        msg.sender === 'user'
                          ? 'bg-sky-500 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-500 mt-1 font-semibold">{msg.timestamp}</span>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex items-center gap-1.5 self-start bg-slate-800 border border-slate-700/60 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400">
                    <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Quick chips */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap gap-2 shrink-0">
                {aiSuggestions.map((chip, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleSendAiMessage(chip.text)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-[10px] font-bold border border-slate-700/50 cursor-pointer active:scale-95 transition-all shadow-sm"
                  >
                    {chip.icon}
                    <span>{chip.text}</span>
                  </button>
                ))}
              </div>

              {/* Send AI Form */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
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
                      handleSendAiMessage(aiInputText);
                    }}
                    className="w-full flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Nhập câu hỏi của bạn tại đây..."
                      value={aiInputText}
                      onChange={(e) => setAiInputText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-sky-500 focus:ring-0 placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!aiInputText.trim() || aiLoading}
                      className="p-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-md disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Launcher Button Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-2xl hover:scale-110 active:scale-95 cursor-pointer transition-all hover:rotate-6 flex items-center justify-center relative group"
      >
        <MessageSquare size={24} />
        {!isOpen && (
          <span className="absolute right-14 bg-slate-900 border border-slate-800 text-[10px] font-bold text-sky-400 px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-md duration-350 pointer-events-none">
            Hộp thư trao đổi Sunflower
          </span>
        )}
      </button>
    </div>
  );
};
