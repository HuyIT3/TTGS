import React, { useState } from 'react';
import { Clock, MapPin, Calendar, DollarSign, X, Printer, Filter, User } from 'lucide-react';

export interface ScheduleClass {
  id: string;
  classRequest: {
    title: string;
    subject: string;
    grade: string;
    hourlyRate: number;
    sessionsPerWeek: number;
    schedule: string;
    location: string;
    description?: string;
  };
  student?: {
    user: {
      fullName: string;
      phone: string;
      avatar?: string;
    };
  };
  tutor?: {
    user: {
      fullName: string;
      phone: string;
      avatar?: string;
    };
  };
  status: string;
}

interface ScheduleViewProps {
  activeClasses: ScheduleClass[];
  role: 'TEACHER' | 'STUDENT';
}

interface ParsedSlot {
  dayIndex: number;
  dayName: string;
  timeRange: string;
  classItem: ScheduleClass;
}

// Function to parse free-text schedule to days of week and time range
const parseSchedule = (scheduleStr: string, classItem: ScheduleClass): ParsedSlot[] => {
  const slots: ParsedSlot[] = [];
  if (!scheduleStr) return slots;

  // Days mapping
  const daysMap = [
    { keys: ["thứ 2", "thứ hai", "t2", "2"], index: 0, label: "Thứ 2" },
    { keys: ["thứ 3", "thứ ba", "t3", "3"], index: 1, label: "Thứ 3" },
    { keys: ["thứ 4", "thứ tư", "t4", "4"], index: 2, label: "Thứ 4" },
    { keys: ["thứ 5", "thứ năm", "t5", "5"], index: 3, label: "Thứ 5" },
    { keys: ["thứ 6", "thứ sáu", "t6", "6"], index: 4, label: "Thứ 6" },
    { keys: ["thứ 7", "thứ bảy", "t7", "7"], index: 5, label: "Thứ 7" },
    { keys: ["chủ nhật", "cn"], index: 6, label: "Chủ Nhật" },
  ];

  // Split scheduleStr into segments by comma or semicolon
  const segments = scheduleStr.split(/[;,]/);
  
  segments.forEach((segment) => {
    const normalizedSegment = segment.toLowerCase().trim();
    if (!normalizedSegment) return;

    // Match time range in this segment
    const timeRegex = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;
    const matchTime = normalizedSegment.match(timeRegex);
    
    // If there's no time range, try extracting a single hour like "19h" or "10h"
    let timeRange = "Chưa rõ giờ";
    if (matchTime) {
      timeRange = `${matchTime[1]} - ${matchTime[2]}`;
    } else {
      const hourRegex = /(\d{1,2})\s*(?:h|giờ)/;
      const matchHour = normalizedSegment.match(hourRegex);
      if (matchHour) {
        const hour = parseInt(matchHour[1]);
        timeRange = `${hour}:00 - ${hour + 2}:05`.replace(':05', ':00'); // assume 2 hours
      }
    }

    // Check which day matches this segment
    daysMap.forEach((day) => {
      let isMatch = false;
      for (const key of day.keys) {
        if (key === "2" || key === "3" || key === "4" || key === "5" || key === "6" || key === "7") {
          const hasThuNum = new RegExp(`thứ\\s*.*?\\b${key}\\b`).test(normalizedSegment);
          const hasDirect = normalizedSegment.includes(`thứ ${key}`) || normalizedSegment.includes(`thứ ${day.keys[1]}`) || normalizedSegment.startsWith(`${key} `) || normalizedSegment === key;
          const hasT = normalizedSegment.includes(`t${key}`);
          if (hasThuNum || hasDirect || hasT) {
            isMatch = true;
            break;
          }
        } else {
          const wordRegex = new RegExp(`\\b${key}\\b`);
          if (wordRegex.test(normalizedSegment) || normalizedSegment.includes(key)) {
            isMatch = true;
            break;
          }
        }
      }
      
      if (isMatch) {
        // Prevent duplicate slot mapping
        const exists = slots.some(s => s.dayIndex === day.index && s.classItem.id === classItem.id && s.timeRange === timeRange);
        if (!exists) {
          slots.push({
            dayIndex: day.index,
            dayName: day.label,
            timeRange,
            classItem,
          });
        }
      }
    });
  });

  // Fallback for unified single time format: "Chiều thứ 2, 4, 6 (15:00 - 17:00)"
  if (slots.length === 0) {
    const normalized = scheduleStr.toLowerCase();
    const timeRegex = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;
    const matchTime = normalized.match(timeRegex);
    const timeRange = matchTime ? `${matchTime[1]} - ${matchTime[2]}` : "Chưa rõ giờ";

    daysMap.forEach((day) => {
      let isMatch = false;
      for (const key of day.keys) {
        if (key === "2" || key === "3" || key === "4" || key === "5" || key === "6" || key === "7") {
          const hasThuNum = new RegExp(`thứ\\s*.*?\\b${key}\\b`).test(normalized);
          const hasDirect = normalized.includes(`thứ ${key}`) || normalized.includes(`thứ ${day.keys[1]}`);
          if (hasThuNum || hasDirect) {
            isMatch = true;
            break;
          }
        } else {
          const wordRegex = new RegExp(`\\b${key}\\b`);
          if (wordRegex.test(normalized) || normalized.includes(key)) {
            isMatch = true;
            break;
          }
        }
      }
      if (isMatch) {
        slots.push({
          dayIndex: day.index,
          dayName: day.label,
          timeRange,
          classItem,
        });
      }
    });
  }

  return slots;
};

// Colors mapping by subject for rich aesthetics
const getSubjectColorStyles = (subject: string) => {
  const norm = subject.toLowerCase();
  if (norm.includes("toán")) {
    return {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      badge: "bg-amber-100 text-amber-800",
      accent: "#d97706",
      dot: "bg-amber-500",
    };
  } else if (norm.includes("lý") || norm.includes("vật lý")) {
    return {
      bg: "bg-sky-50 border-sky-200 text-sky-850",
      badge: "bg-sky-100 text-sky-800",
      accent: "#0284c7",
      dot: "bg-sky-500",
    };
  } else if (norm.includes("hóa")) {
    return {
      bg: "bg-pink-50 border-pink-200 text-pink-850",
      badge: "bg-pink-100 text-pink-800",
      accent: "#db2777",
      dot: "bg-pink-500",
    };
  } else if (norm.includes("anh") || norm.includes("tiếng anh")) {
    return {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-850",
      badge: "bg-emerald-100 text-emerald-800",
      accent: "#059669",
      dot: "bg-emerald-500",
    };
  } else if (norm.includes("văn") || norm.includes("ngữ văn")) {
    return {
      bg: "bg-indigo-50 border-indigo-200 text-indigo-850",
      badge: "bg-indigo-100 text-indigo-800",
      accent: "#4f46e5",
      dot: "bg-indigo-500",
    };
  }
  return {
    bg: "bg-slate-50 border-slate-200 text-slate-800",
    badge: "bg-slate-200/60 text-slate-700",
    accent: "#64748b",
    dot: "bg-slate-400",
  };
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({ activeClasses, role }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedSlot, setSelectedSlot] = useState<ParsedSlot | null>(null);

  // Today index (0 = Monday, ..., 6 = Sunday)
  const todayIndex = (new Date().getDay() + 6) % 7;

  // Process and parse all active classes schedule slots
  const allSlots: ParsedSlot[] = [];
  const unparsedClasses: ScheduleClass[] = [];

  activeClasses.forEach((item) => {
    const slots = parseSchedule(item.classRequest.schedule, item);
    if (slots.length > 0) {
      allSlots.push(...slots);
    } else {
      unparsedClasses.push(item);
    }
  });

  // Extract unique subjects for filters
  const subjects = ['All', ...Array.from(new Set(activeClasses.map(item => item.classRequest.subject)))];

  // Filter slots and unparsed classes
  const filteredSlots = allSlots.filter((slot) => {
    if (selectedSubject === 'All') return true;
    return slot.classItem.classRequest.subject === selectedSubject;
  });

  const filteredUnparsed = unparsedClasses.filter((item) => {
    if (selectedSubject === 'All') return true;
    return item.classRequest.subject === selectedSubject;
  });

  // Schedule grid cells
  const daysOfWeek = [
    { label: "Thứ 2", index: 0 },
    { label: "Thứ 3", index: 1 },
    { label: "Thứ 4", index: 2 },
    { label: "Thứ 5", index: 3 },
    { label: "Thứ 6", index: 4 },
    { label: "Thứ 7", index: 5 },
    { label: "Chủ Nhật", index: 6 },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      {/* CSS specific for clean print layouts */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-schedule-container, .print-schedule-container * {
            visibility: visible;
          }
          .print-schedule-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .grid {
            display: grid !important;
            grid-template-columns: repeat(7, 1fr) !important;
            gap: 4px !important;
          }
          .day-column {
            border: 1px solid #cbd5e1 !important;
            min-height: auto !important;
            padding: 4px !important;
          }
          .slot-card {
            box-shadow: none !important;
            border: 1px solid #94a3b8 !important;
            margin-bottom: 4px !important;
            background: #f8fafc !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Control panel & filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Filter size={16} />
          </div>
          <div>
            <h4 className="font-bold text-slate-805 text-xs sm:text-sm">Bộ lọc thời khóa biểu</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Lọc lịch học theo môn để dễ dàng quản lý</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sub === 'All' ? 'Tất cả môn' : sub}
            </button>
          ))}

          <button
            onClick={handlePrint}
            className="ml-auto sm:ml-2 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Printer size={14} />
            <span>In lịch biểu</span>
          </button>
        </div>
      </div>

      {/* Main Print Container Wrapper */}
      <div className="print-schedule-container flex flex-col gap-6">
        {/* Print only header */}
        <div className="hidden print:block border-b border-slate-300 pb-3 mb-4">
          <h2 className="text-xl font-bold text-slate-905">THỜI KHÓA BIỂU HỌC TẬP & GIẢNG DẠY</h2>
          <p className="text-xs text-slate-500">Tài khoản: {role === 'TEACHER' ? 'Gia sư đối tác' : 'Học viên'} | Hệ thống TTGS</p>
        </div>

        {/* Weekly Grid View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4 min-h-[500px]">
          {daysOfWeek.map((day) => {
            const isToday = day.index === todayIndex;
            const daySlots = filteredSlots.filter((slot) => slot.dayIndex === day.index);

            return (
              <div
                key={day.index}
                className={`day-column flex flex-col rounded-2xl border transition-all ${
                  isToday
                    ? 'bg-sky-50/40 border-sky-400/70 shadow-sm shadow-sky-500/5 relative premium-glow-indigo'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                {/* Header of Column */}
                <div
                  className={`p-3 border-b text-center rounded-t-2xl font-bold text-xs tracking-wide flex flex-col gap-0.5 justify-center items-center ${
                    isToday
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{day.label}</span>
                  {isToday && (
                    <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider scale-95 mt-0.5 leading-none">
                      Hôm nay
                    </span>
                  )}
                </div>

                {/* Slots content */}
                <div className="p-2.5 flex-1 flex flex-col gap-2.5 overflow-y-auto">
                  {daySlots.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8 text-center text-[10px] text-slate-400 font-semibold italic">
                      Trống
                    </div>
                  ) : (
                    daySlots.map((slot, sIdx) => {
                      const colors = getSubjectColorStyles(slot.classItem.classRequest.subject);
                      const partnerName = role === 'TEACHER'
                        ? slot.classItem.student?.user.fullName
                        : slot.classItem.tutor?.user.fullName;

                      return (
                        <div
                          key={sIdx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`slot-card border-l-4 p-3.5 rounded-2xl flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${colors.bg}`}
                          style={{ borderLeftColor: colors.accent }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${colors.badge}`}>
                              {slot.classItem.classRequest.subject}
                            </span>
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-white/70 dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-200/40 shadow-sm shrink-0">
                              <Clock size={10} className="text-slate-400 shrink-0" />
                              {slot.timeRange}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-[11px] leading-tight text-slate-800 dark:text-white line-clamp-2">
                            {slot.classItem.classRequest.title}
                          </h5>

                          <div className="text-[9px] font-bold text-slate-500 border-t border-slate-200/60 dark:border-slate-800/80 pt-2 mt-1.5 flex items-center justify-between">
                            <span className="truncate max-w-[85px] text-slate-500">
                              {role === 'TEACHER' ? 'Trò: ' : 'Thầy: '}
                              <strong className="text-slate-700 dark:text-slate-300">{partnerName}</strong>
                            </span>
                            <span className="text-[8px] font-bold text-slate-450 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                              {slot.classItem.classRequest.grade}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unparsed / Other schedules section */}
        {filteredUnparsed.length > 0 && (
          <div className="bg-amber-50/30 border border-amber-200 p-5 rounded-2xl flex flex-col gap-3 shadow-inner no-print mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h4 className="font-bold text-amber-800 text-xs sm:text-sm">Lịch học khác (Chưa phân loại ngày cụ thể)</h4>
            </div>
            <p className="text-[10px] text-amber-700/80 font-semibold leading-relaxed">
              Các lớp học dưới đây có mô tả lịch học chưa thể tự động phân tích thành các ngày cụ thể. Vui lòng xem ghi chú lịch biểu gốc.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              {filteredUnparsed.map((item) => {
                const partnerName = role === 'TEACHER'
                  ? item.student?.user.fullName
                  : item.tutor?.user.fullName;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSlot({ dayIndex: -1, dayName: 'Khác', timeRange: 'Chưa rõ', classItem: item })}
                    className="bg-white border border-amber-200 p-4 rounded-xl flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">
                        {item.classRequest.subject} - {item.classRequest.grade}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        {item.classRequest.sessionsPerWeek} buổi/tuần
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug">{item.classRequest.title}</h5>

                    <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 flex flex-col gap-1">
                      <div>Lịch gốc: <strong className="text-amber-800 font-bold">{item.classRequest.schedule}</strong></div>
                      <div>{role === 'TEACHER' ? 'Học sinh' : 'Gia sư'}: <strong className="text-slate-700 font-bold">{partnerName}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeClasses.length === 0 && (
          <div className="text-center py-20 text-slate-400 bg-white border border-slate-200/60 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-inner">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
              <Calendar size={28} />
            </div>
            <div>
              <h4 className="font-bold text-slate-700 text-sm">Chưa có lịch thời khóa biểu</h4>
              <p className="text-xs text-slate-400 font-semibold mt-1">Lịch học tự động tạo lập sau khi bạn có các lớp được chấp thuận và đang dạy/học.</p>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up">
            {/* Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-805 text-sm sm:text-base">Chi tiết buổi học</h3>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 inline-block mt-1 uppercase tracking-wide">
                  {selectedSlot.dayName} • {selectedSlot.timeRange}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="p-1.5 rounded-lg border border-slate-205 hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer active:scale-95 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tên lớp yêu cầu</span>
                <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{selectedSlot.classItem.classRequest.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 my-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Môn học</span>
                  <span className="text-xs font-bold text-slate-700">{selectedSlot.classItem.classRequest.subject}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Trình độ</span>
                  <span className="text-xs font-bold text-slate-700">{selectedSlot.classItem.classRequest.grade}</span>
                </div>
              </div>

              {/* Partner User Info Card */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Thông tin liên hệ {role === 'TEACHER' ? 'Học viên' : 'Gia sư'}
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-50 to-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {(role === 'TEACHER'
                      ? selectedSlot.classItem.student?.user.fullName
                      : selectedSlot.classItem.tutor?.user.fullName)?.charAt(0) || <User size={16} />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h5 className="font-bold text-slate-850 text-xs sm:text-sm">
                      {role === 'TEACHER'
                        ? selectedSlot.classItem.student?.user.fullName
                        : selectedSlot.classItem.tutor?.user.fullName}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-bold">
                      SĐT: {role === 'TEACHER'
                        ? selectedSlot.classItem.student?.user.phone
                        : selectedSlot.classItem.tutor?.user.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Class Schedule Details */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 text-xs">
                  <Clock size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-400 text-[10px] block uppercase tracking-wider leading-none">Lịch biểu đầy đủ</span>
                    <strong className="text-slate-700 text-xs mt-1 block">{selectedSlot.classItem.classRequest.schedule}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs">
                  <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-400 text-[10px] block uppercase tracking-wider leading-none">Địa điểm</span>
                    <strong className="text-slate-700 text-xs mt-1 block">{selectedSlot.classItem.classRequest.location}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs">
                  <DollarSign size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-400 text-[10px] block uppercase tracking-wider leading-none">Học phí đề xuất</span>
                    <strong className="text-sky-600 text-xs mt-1 block">
                      {selectedSlot.classItem.classRequest.hourlyRate.toLocaleString('vi-VN')} đ/giờ
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md cursor-pointer active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
