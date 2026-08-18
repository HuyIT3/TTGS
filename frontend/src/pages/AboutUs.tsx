import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, Star, GraduationCap, ShieldCheck, Heart, Sparkles, Compass, Ruler, PenTool } from 'lucide-react';
import logoImg from '../assets/logo.png';
import huyImg from '../assets/huy.jpg';

export const AboutUs: React.FC = () => {
  return (
    <div className="w-full min-h-screen py-10 px-6 lg:px-12 flex flex-col gap-12 relative bg-slate-50 bg-notebook-grid text-slate-800 overflow-hidden dark:bg-slate-950 dark:text-slate-200">
      
      {/* Educational Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.12] dark:opacity-[0.06] select-none">
        <BookOpen className="absolute text-slate-900 dark:text-white w-32 h-32 top-16 left-6 sm:left-24 animate-float-slow" />
        <Ruler className="absolute text-slate-900 dark:text-white w-24 h-24 bottom-32 left-8 sm:left-32 animate-float-slower" />
        <PenTool className="absolute text-slate-900 dark:text-white w-20 h-20 top-40 right-8 sm:right-32 animate-float-fast" />
        <Compass className="absolute text-slate-900 dark:text-white w-28 h-28 bottom-48 right-12 sm:right-28 animate-float-slow" />
      </div>

      {/* Hero section */}
      <section className="max-w-5xl mx-auto w-full text-center flex flex-col gap-6 z-10 animate-fade-in-up">
        <Link to="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 w-max mx-auto shadow-sm active:scale-95 transition-all">
          <ArrowLeft size={14} />
          Quay lại Trang chủ
        </Link>

        <div className="flex flex-col items-center gap-4 mt-4">
          <img src={logoImg} alt="Hoa Hướng Dương Logo" className="w-24 h-24 object-contain rounded-2xl shadow-xl border border-sky-100/50 dark:border-slate-800/80 animate-pulse-subtle" />
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.2] text-slate-900 dark:text-white">
            Giới thiệu Trung tâm Gia sư
            <br />
            <span className="text-gradient-primary">Hoa Hướng Dương</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Nơi khơi nguồn tri thức, bồi dưỡng đam mê học tập và đồng hành cùng học viên trên con đường chinh phục đỉnh cao học vấn bằng sự tận tâm, chuyên nghiệp hàng đầu.
          </p>
        </div>
      </section>

      {/* Core statistics section */}
      <section className="max-w-5xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-6 z-10">
        {[
          { label: 'Gia sư xuất sắc', count: '100+', icon: <GraduationCap className="text-sky-500" size={24} /> },
          { label: 'Tỉ lệ đỗ THPT/Đại học', count: '98.5%', icon: <Award className="text-amber-500" size={24} /> },
          { label: 'Học sinh tiến bộ', count: '95%', icon: <Heart className="text-rose-500" size={24} /> },
          { label: 'Đồng hành tin cậy', count: '5 Năm', icon: <ShieldCheck className="text-emerald-500" size={24} /> },
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl text-center flex flex-col items-center gap-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-slate-900 flex items-center justify-center border border-sky-100/20 dark:border-slate-800 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.count}</h3>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* About Description Block */}
      <section className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 z-10 items-center">
        <div className="glass-panel p-8 rounded-3xl flex flex-col gap-5 leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-sky-500" size={20} />
            Tầm nhìn & Sứ mệnh
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350">
            Giống như loài hoa hướng dương luôn hướng về phía mặt trời đón ánh nắng ban mai, **Trung tâm Gia sư Hoa Hướng Dương** định hướng truyền cảm hứng học tập tích cực, giúp học sinh vượt qua mọi rào cản sợ hãi môn học để vươn mình tỏa sáng.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350">
            Chúng tôi không chỉ cung cấp những kiến thức sách vở khô khan mà tập trung trang bị phương pháp tư duy độc lập, kỹ năng tự học suốt đời và xây dựng kế hoạch cá nhân hóa cho từng năng lực học viên.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl flex flex-col gap-5 leading-relaxed bg-gradient-to-br from-indigo-500/5 to-sky-500/5 border border-sky-200/40 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-sky-500" size={20} />
            Giá trị cốt lõi
          </h2>
          <ul className="flex flex-col gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-350">
            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <div>
                <strong>Chất lượng hàng đầu:</strong> Đội ngũ gia sư được tuyển chọn khắt khe từ các trường sư phạm và trường đại học danh tiếng.
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <div>
                <strong>Tận tâm sát cánh:</strong> Theo sát tiến độ học tập hàng ngày, hỗ trợ giải đáp 24/7 trực tuyến thông qua trợ lý học vụ AI.
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              <div>
                <strong>Minh bạch tuyệt đối:</strong> Học phí và lịch trình dạy rõ ràng, phụ huynh dễ dàng nắm bắt kết quả học qua cổng ERP.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Honor Roll / Achievements Section */}
      <section className="max-w-5xl mx-auto w-full flex flex-col gap-6 z-10">
        <div className="flex flex-col gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shadow-sm shadow-amber-500/5 animate-pulse">
              <Award size={20} />
            </span>
            Bảng Vàng Vinh Danh & Khen Thưởng
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
            Ghi nhận những thành tích học thuật xuất sắc của đội ngũ gia sư và học viên
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Giải Nhì HSG Toán", 
              sub: "Cấp Tỉnh lớp 11", 
              recipient: "Dư Hoàng Huy", 
              role: "Gia sư",
              icon: "🏆", 
              bgColor: "from-amber-500/10 to-yellow-500/5",
              borderColor: "border-amber-300/30",
              badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            },
            { 
              title: "Giải Ba HSG Toán", 
              sub: "Cấp Tỉnh lớp 12", 
              recipient: "Dư Hoàng Huy", 
              role: "Gia sư",
              icon: "🏆", 
              bgColor: "from-amber-500/10 to-yellow-500/5",
              borderColor: "border-amber-300/30",
              badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            },
            { 
              title: "Tốt nghiệp Xuất sắc", 
              sub: "ĐH Sư phạm Kỹ thuật", 
              recipient: "Dư Hoàng Huy", 
              role: "Gia sư",
              icon: "🎓", 
              bgColor: "from-sky-500/10 to-indigo-500/5",
              borderColor: "border-sky-300/30",
              badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400"
            },
            { 
              title: "Đạt Điểm 9 Môn Toán", 
              sub: "Kỳ thi THPT Quốc Gia", 
              recipient: "Anh Đức", 
              role: "Học viên",
              icon: "🌟", 
              bgColor: "from-emerald-500/10 to-teal-500/5",
              borderColor: "border-emerald-300/30",
              badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`relative overflow-hidden group p-6 rounded-3xl bg-gradient-to-br ${item.bgColor} border ${item.borderColor} dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300`}
            >
              {/* Hover backdrop line shine */}
              <div className="absolute -inset-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
              
              {/* Header inside card */}
              <div className="flex justify-between items-start z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-900 flex items-center justify-center text-2xl shadow-inner border border-white/50 dark:border-slate-800 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${item.badgeColor}`}>
                  {item.role}
                </span>
              </div>

              {/* Title & Info */}
              <div className="flex flex-col gap-1 mt-2 z-10">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.recipient}</span>
                <h4 className="text-sm font-black text-slate-800 dark:text-white leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
              </div>
              
              {/* Visual corner spotlight decoration */}
              <div className="absolute right-0 bottom-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full pointer-events-none"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership / Key Tutors Section */}
      <section className="max-w-5xl mx-auto w-full flex flex-col gap-6 z-10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <GraduationCap className="text-sky-500" />
          Đội ngũ Giảng dạy Tiêu biểu
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          {/* Card 1: Dư Hoàng Huy */}
          <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row gap-5 hover:scale-[1.01] transition-all">
            <img src={huyImg} alt="Gia sư Dư Hoàng Huy" className="w-24 h-28 sm:w-28 sm:h-36 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm shrink-0" />
            <div className="flex flex-col gap-1.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">Gia sư Dư Hoàng Huy</h3>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-400 border border-sky-100/30 px-2 py-0.5 rounded w-max">
                Toán học & Vật lý
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                • 4 năm kinh nghiệm dạy và ôn thi THPT Toán Lý Hóa cấp 2, 3.
                <br />
                • Cựu sinh viên ĐH Sư phạm Kỹ thuật TP HCM.
                <br />
                • Học phí đề xuất: 100.000 VNĐ / giờ.
              </p>
              <div className="flex gap-1.5 items-center text-amber-500 text-[10px] font-bold mt-2">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <span className="text-slate-500 dark:text-slate-400 font-semibold ml-1">(12 Đánh giá xuất sắc)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cao Vũ Băng Truyền */}
          <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row gap-5 hover:scale-[1.01] transition-all">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200" alt="Gia sư Cao Vũ Băng Truyền" className="w-24 h-28 sm:w-28 sm:h-36 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm shrink-0" />
            <div className="flex flex-col gap-1.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">Gia sư Cao Vũ Băng Truyền</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-100/30 px-2 py-0.5 rounded w-max">
                Tiếng Anh & Ngữ văn
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                • 3 năm giảng dạy tại trung tâm gia sư tiếng Anh uy tín.
                <br />
                • Tốt nghiệp Đại học Ngân hàng TP HCM, chứng chỉ TOEIC 830.
                <br />
                • Học phí đề xuất: 100.000 VNĐ / giờ.
              </p>
              <div className="flex gap-1.5 items-center text-amber-500 text-[10px] font-bold mt-2">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <span className="text-slate-500 dark:text-slate-400 font-semibold ml-1">(8 Đánh giá xuất sắc)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="max-w-3xl mx-auto w-full text-center z-10 bg-slate-900 text-slate-200 border border-slate-800 rounded-3xl p-8 shadow-xl mt-4 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-sky-500/10 to-transparent rounded-br-full"></div>
        <p className="text-sm sm:text-base italic font-medium leading-relaxed z-10">
          "Giáo dục không phải là việc điền đầy một bình chứa, mà là việc thắp sáng một ngọn lửa học hỏi trong tâm hồn."
        </p>
        <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 z-10">— Hội đồng sư phạm Hoa Hướng Dương</span>
      </section>

    </div>
  );
};
