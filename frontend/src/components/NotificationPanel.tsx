import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, Clock, BookOpen, DollarSign, Star, AlertTriangle, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1', type: 'CLASS_ASSIGNED', isRead: false,
    title: '🎉 Bạn vừa nhận lớp mới!',
    body: 'Học viên Tuệ Vương đã phê duyệt bạn dạy lớp "Ôn thi THPT Toán 12". Hãy liên hệ để sắp xếp lịch học.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'n-2', type: 'SALARY_PAID', isRead: false,
    title: '💰 Lương đã được chuyển khoản!',
    body: 'Trung tâm đã chuyển 2.400.000đ lương tháng 8/2026 vào tài khoản của bạn.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'n-3', type: 'LEAVE_REQUEST', isRead: false,
    title: '📋 Học viên báo nghỉ buổi học',
    body: 'Học viên Hoàng Mai Chi đã gửi yêu cầu nghỉ buổi học lớp "Vật lý lớp 11 nâng cao". Vui lòng xác nhận và sắp xếp dạy bù.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'n-4', type: 'CLASS_REMINDER', isRead: true,
    title: '⏰ Nhắc nhở buổi học sắp tới',
    body: 'Buổi học lớp "Ôn thi THPT Toán 12" sẽ bắt đầu theo lịch: T2, T4, T6 (19:00–21:00). Chuẩn bị tài liệu nhé!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'n-5', type: 'PROFILE_APPROVED', isRead: true,
    title: '✅ Hồ sơ gia sư đã được phê duyệt!',
    body: 'Chúc mừng! Hồ sơ của bạn đã được Admin duyệt. Bạn có thể bắt đầu ứng tuyển các lớp học phù hợp.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  CLASS_ASSIGNED:      <BookOpen size={16} className="text-indigo-500" />,
  SALARY_PAID:         <DollarSign size={16} className="text-emerald-500" />,
  LEAVE_REQUEST:       <AlertTriangle size={16} className="text-amber-500" />,
  CLASS_REMINDER:      <Clock size={16} className="text-sky-500" />,
  PROFILE_APPROVED:    <Star size={16} className="text-yellow-500" />,
  APPLICATION_RECEIVED:<User size={16} className="text-violet-500" />,
  SYSTEM:              <Bell size={16} className="text-slate-400" />,
};

const BG_MAP: Record<string, string> = {
  CLASS_ASSIGNED:      '#eef2ff',
  SALARY_PAID:         '#ecfdf5',
  LEAVE_REQUEST:       '#fffbeb',
  CLASS_REMINDER:      '#f0f9ff',
  PROFILE_APPROVED:    '#fefce8',
  APPLICATION_RECEIVED:'#f5f3ff',
  SYSTEM:              '#f8fafc',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

interface NotificationPanelProps {
  /** override style on the bell wrapper */
  className?: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ className }) => {
  const { apiUrl, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications || []);
        setUnread(data.unreadCount || 0);
        return;
      }
    } catch { /* fall through */ }
    // Fallback to mock data
    setItems(MOCK_NOTIFICATIONS);
    setUnread(MOCK_NOTIFICATIONS.filter(n => !n.isRead).length);
  }, [apiUrl, token]);

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${apiUrl}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const handleMarkOne = async (id: string) => {
    try {
      await fetch(`${apiUrl}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  return (
    <div className={`notif-wrapper ${className ?? ''}`} ref={panelRef}>
      {/* Bell button */}
      <button
        className={`notif-bell ${open ? 'notif-bell-active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Thông báo"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notif-panel">
          {/* Header */}
          <div className="notif-panel-header">
            <div>
              <h3 className="notif-panel-title">Thông báo</h3>
              {unread > 0 && <span className="notif-panel-count">{unread} chưa đọc</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {unread > 0 && (
                <button className="notif-read-all" onClick={handleMarkAllRead} title="Đánh dấu tất cả đã đọc">
                  <CheckCheck size={14} />
                  <span>Đọc tất cả</span>
                </button>
              )}
              <button className="notif-close-btn" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="notif-list">
            {items.length === 0 ? (
              <div className="notif-empty">
                <Bell size={32} />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              items.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.isRead ? 'notif-item-unread' : ''}`}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className="notif-item-icon"
                    style={{ background: BG_MAP[n.type] || '#f8fafc' }}
                  >
                    {ICON_MAP[n.type] || <Bell size={16} />}
                  </div>
                  <div className="notif-item-body">
                    <p className="notif-item-title">{n.title}</p>
                    <p className="notif-item-text">{n.body}</p>
                    <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.isRead && <div className="notif-item-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
