import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, GraduationCap, MessageCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070a13] border-t border-slate-800/60 text-slate-400 py-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Brand & Quote */}
        <div className="flex flex-col gap-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Hoa Hướng Dương Logo" className="w-10 h-10 object-contain rounded-lg" />
            <span className="text-lg font-bold tracking-tight text-white">
              Gia sư <span className="text-gradient-primary">Hoa Hướng Dương</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
            Hệ thống kết nối Gia sư và Học sinh hàng đầu, mang lại giải pháp giáo dục cá nhân hóa chất lượng cao, giúp học sinh vững bước chinh phục mọi kỳ thi.
          </p>
          <div className="border-l-2 border-amber-500/60 pl-3 py-1 mt-2">
            <p className="text-xs italic text-slate-300 font-medium leading-relaxed">
              "Đầu tư vào tri thức luôn mang lại lợi ích tốt nhất cho tương lai. Mỗi bước đi trong giáo dục hôm nay là nền móng vững chắc cho ngày mai."
            </p>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800/40 pb-2">Liên kết nhanh</h3>
          <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <li>
              <Link to="/" className="hover:text-sky-400 transition-colors">Trang chủ</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-sky-400 transition-colors">Đăng nhập</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-sky-400 transition-colors">Đăng ký thành viên</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800/40 pb-2">Liên hệ</h3>
          <ul className="flex flex-col gap-3 text-xs sm:text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-sky-400 shrink-0 mt-0.5" />
              <span>phường Linh Xuân, TP Thủ Đức, TP HCM</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-sky-400 shrink-0" />
              <a href="tel:0327169519" className="hover:text-sky-400 transition-colors">0327 169 519</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-sky-400 shrink-0" />
              <a href="mailto:huykenkva123@gmail.com" className="hover:text-sky-400 transition-colors">huykenkva123@gmail.com</a>
            </li>
            <li className="flex items-center gap-2.5">
              <MessageCircle size={16} className="text-sky-400 shrink-0" />
              <a href="https://zalo.me/g/lrlyavgtoim0fj0v0eck" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors font-semibold">Tư vấn Gia sư (Zalo)</a>
            </li>
          </ul>
        </div>
      </div>


      {/* Bottom Copyright line */}
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <p>© 2026 Gia sư Hoa Hướng Dương. Tất cả các quyền được bảo lưu.</p>
        <div className="flex gap-4">
          <a href="https://zalo.me/g/lrlyavgtoim0fj0v0eck" target="_blank" rel="noopener noreferrer" className="hover:text-[#0068ff] transition-colors flex items-center justify-center p-1 rounded-lg bg-white/5 border border-white/10" title="Nhóm Zalo">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <text x="5.5" y="14" fill="currentColor" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" stroke="none">Zalo</text>
            </svg>
          </a>
          <a href="https://www.facebook.com/huy.kenkva.7" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors" title="Facebook">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="https://www.youtube.com/@hanhy0101" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors" title="Youtube">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C22 8.68 22 12 22 12s0 3.32-.42 4.814a2.504 2.504 0 0 1-1.768 1.768C18.32 19 12 19 12 19s-6.32 0-7.814-.42a2.504 2.504 0 0 1-1.768-1.768C2 15.32 2 12 2 12s0-3.32.42-4.814a2.504 2.504 0 0 1 1.768-1.768C5.68 5 12 5 12 5s6.32 0 7.812.418ZM9.75 15.002 15.5 12 9.75 8.998v6.004Z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

