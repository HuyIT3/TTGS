import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageCircle, GraduationCap, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/about', label: 'Giới thiệu' },
    { to: '/classes', label: 'Lớp học cần Gia sư' },
    { to: '/login', label: 'Đăng nhập' },
    { to: '/register', label: 'Đăng ký thành viên' },
  ];

  const contactItems = [
    {
      icon: <MapPin size={14} />,
      label: 'Phường Linh Xuân, TP Thủ Đức, TP HCM',
      href: null,
    },
    {
      icon: <Phone size={14} />,
      label: '0327 169 519',
      href: 'tel:0327169519',
    },
    {
      icon: <Mail size={14} />,
      label: 'huykenkva123@gmail.com',
      href: 'mailto:huykenkva123@gmail.com',
    },
    {
      icon: <MessageCircle size={14} />,
      label: 'Tư vấn Gia sư (Zalo)',
      href: 'https://zalo.me/g/lrlyavgtoim0fj0v0eck',
    },
  ];

  const socials = [
    { label: 'Z', href: 'https://zalo.me/g/lrlyavgtoim0fj0v0eck', title: 'Zalo', color: 'hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400' },
    { label: 'f', href: 'https://www.facebook.com/huy.kenkva.7', title: 'Facebook', color: 'hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-400' },
    { label: '▶', href: 'https://www.youtube.com/@hanhy0101', title: 'Youtube', color: 'hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400' },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#060a12] border-t border-white/[0.05]">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/[0.03] rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0 bg-line-grid opacity-30" />
      </div>

      {/* Gradient divider top */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand column */}
          <div className="md:col-span-1 flex flex-col gap-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-xl">
                🌻
              </div>
              <div>
                <p className="font-bold text-white text-base leading-none">Gia sư</p>
                <p className="font-bold text-amber-400 text-base leading-none">Hoa Hướng Dương</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              Hệ thống kết nối Gia sư và Học sinh hàng đầu, mang lại giải pháp giáo dục cá nhân hóa chất lượng cao, giúp học sinh vững bước chinh phục mọi kỳ thi.
            </p>

            {/* Quote */}
            <div className="relative pl-4 py-3 border-l-2 border-amber-500/50">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
              <p className="text-slate-400 text-xs italic leading-relaxed">
                "Đầu tư vào tri thức luôn mang lại lợi ích tốt nhất cho tương lai."
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 pt-1">
              {[
                { val: '100+', label: 'Gia sư' },
                { val: '350+', label: 'Lớp học' },
                { val: '98%', label: 'Hài lòng' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-sm font-bold text-gradient-primary">{stat.val}</p>
                  <p className="text-[10px] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
              Liên kết nhanh
            </h4>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-200"
                  >
                    <span className="w-1 h-1 bg-indigo-500/50 rounded-full group-hover:bg-indigo-400 transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-6">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gradient text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
              >
                <GraduationCap size={14} />
                Bắt đầu học ngay
                <ArrowUpRight size={13} className="opacity-70" />
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
              Liên hệ
            </h4>
            <ul className="flex flex-col gap-3.5">
              {contactItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-slate-400 hover:text-white transition-colors leading-snug"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 leading-snug">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Gia sư Hoa Hướng Dương. Tất cả các quyền được bảo lưu.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.title}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.title}
                className={`w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-slate-400 font-bold text-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${social.color}`}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
