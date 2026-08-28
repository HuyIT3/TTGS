import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign, Search, Loader2, CheckCircle, XCircle, X,
  Users, TrendingUp, Receipt, BadgeDollarSign,
} from 'lucide-react';

interface TutorSalary {
  tutorId: string;
  userId: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  subjects: string[];
  hourlyRate: number;
  totalClasses: number;
  sessionsEstimated: number;
  expectedEarning: number;
  paid: number;
  remaining: number;
  isPaid: boolean;
  payments: PaymentRecord[];
}

interface PaymentRecord {
  id: string;
  amount: number;
  month: number;
  year: number;
  sessions: number;
  note?: string;
  paidAt: string;
}

const MOCK_TUTORS: TutorSalary[] = [
  {
    tutorId: 't-1', userId: 'u-1',
    fullName: 'Dư Hoàng Huy', phone: '0327169519', subjects: ['Toán học', 'Vật lý'],
    hourlyRate: 100000, totalClasses: 2, sessionsEstimated: 8,
    expectedEarning: 1280000, paid: 1280000, remaining: 0, isPaid: true,
    payments: [{ id: 'p-1', amount: 1280000, month: 8, year: 2026, sessions: 8, note: 'Lương tháng 8', paidAt: new Date().toISOString() }],
  },
  {
    tutorId: 't-2', userId: 'u-2',
    fullName: 'Nguyễn Thị Lan', phone: '0901234567', subjects: ['Tiếng Anh'],
    hourlyRate: 120000, totalClasses: 3, sessionsEstimated: 12,
    expectedEarning: 2304000, paid: 0, remaining: 2304000, isPaid: false,
    payments: [],
  },
  {
    tutorId: 't-3', userId: 'u-3',
    fullName: 'Trần Văn Minh', phone: '0912345678', subjects: ['Hóa học', 'Sinh học'],
    hourlyRate: 90000, totalClasses: 1, sessionsEstimated: 4,
    expectedEarning: 576000, paid: 0, remaining: 576000, isPaid: false,
    payments: [],
  },
];

interface PayModalState {
  open: boolean;
  tutor: TutorSalary | null;
}

const AdminSalaryPaymentView: React.FC = () => {
  const { apiUrl, token } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [tutors, setTutors] = useState<TutorSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<PayModalState>({ open: false, tutor: null });
  const [payForm, setPayForm] = useState({ amount: '', sessions: '', note: '' });
  const [paying, setPaying] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/salary/summary?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setTutors(await res.json()); }
      else { setTutors(MOCK_TUTORS); }
    } catch { setTutors(MOCK_TUTORS); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [month, year]);

  const openModal = (t: TutorSalary) => {
    setModal({ open: true, tutor: t });
    setPayForm({
      amount: String(t.remaining),
      sessions: String(t.sessionsEstimated),
      note: `Lương tháng ${month}/${year}`,
    });
  };

  const handlePay = async () => {
    if (!modal.tutor) return;
    setPaying(true);
    try {
      await fetch(`${apiUrl}/salary/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tutorId: modal.tutor.tutorId,
          amount: parseInt(payForm.amount),
          month, year,
          sessions: parseInt(payForm.sessions),
          note: payForm.note,
        }),
      });
    } catch { /* offline — update locally */ }

    // Update state optimistically
    const amount = parseInt(payForm.amount) || 0;
    setTutors(prev => prev.map(t =>
      t.tutorId === modal.tutor!.tutorId
        ? { ...t, paid: t.paid + amount, remaining: Math.max(0, t.remaining - amount), isPaid: t.remaining - amount <= 0 }
        : t
    ));
    setSuccessId(modal.tutor.tutorId);
    setTimeout(() => setSuccessId(null), 3000);
    setModal({ open: false, tutor: null });
    setPaying(false);
  };

  const filtered = tutors.filter(t =>
    t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    t.subjects.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const totalExpected = tutors.reduce((s, t) => s + t.expectedEarning, 0);
  const totalPaid = tutors.reduce((s, t) => s + t.paid, 0);
  const totalRemaining = tutors.reduce((s, t) => s + t.remaining, 0);
  const paidCount = tutors.filter(t => t.isPaid).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-top">
            <div>
              <p className="ds-stat-label">TỔNG CẦN TRẢ</p>
              <p className="ds-stat-value">{(totalExpected / 1000000).toFixed(1)}Mđ</p>
            </div>
            <div className="ds-stat-icon" style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' }}>
              <BadgeDollarSign size={20} />
            </div>
          </div>
          <div className="ds-stat-change"><span className="text-slate-500">Tháng {month}/{year}</span></div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-top">
            <div>
              <p className="ds-stat-label">ĐÃ THANH TOÁN</p>
              <p className="ds-stat-value text-emerald-600">{(totalPaid / 1000000).toFixed(1)}Mđ</p>
            </div>
            <div className="ds-stat-icon" style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="ds-stat-change">
            <span className="text-emerald-600">{paidCount}/{tutors.length} gia sư</span>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-top">
            <div>
              <p className="ds-stat-label">CÒN TỒN ĐỌNG</p>
              <p className="ds-stat-value text-rose-500">{(totalRemaining / 1000000).toFixed(1)}Mđ</p>
            </div>
            <div className="ds-stat-icon" style={{ background: 'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="ds-stat-change">
            <span className="text-rose-500">{tutors.length - paidCount} chưa thanh toán</span>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-top">
            <div>
              <p className="ds-stat-label">TỔNG GIA SƯ</p>
              <p className="ds-stat-value">{tutors.length}</p>
            </div>
            <div className="ds-stat-icon" style={{ background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="ds-stat-change"><span className="text-slate-500">Đang hoạt động</span></div>
        </div>
      </div>

      {/* Filters */}
      <div className="ds-card">
        <div className="ds-card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <h3 className="ds-card-title">Bảng lương tháng {month}/{year}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="ds-search-wrap" style={{ minWidth: 180 }}>
              <Search size={14} className="ds-search-icon" />
              <input
                className="ds-search-input"
                placeholder="Tìm gia sư..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="ds-input"
              style={{ width: 110 }}
              value={month}
              onChange={e => setMonth(+e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            <select
              className="ds-input"
              style={{ width: 90 }}
              value={year}
              onChange={e => setYear(+e.target.value)}
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin" /> Đang tải...
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Gia sư</th>
                  <th>Môn dạy</th>
                  <th>Lớp</th>
                  <th>Buổi ước tính</th>
                  <th>Cần trả</th>
                  <th>Đã trả</th>
                  <th>Còn lại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-slate-400">Không có dữ liệu.</td></tr>
                ) : filtered.map(t => (
                  <tr key={t.tutorId} className={successId === t.tutorId ? 'salary-row-success' : ''}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="ds-avatar-sm" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                          {t.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{t.fullName}</p>
                          <p className="text-[10px] text-slate-400">{t.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.map(s => <span key={s} className="ds-tag ds-tag-blue">{s}</span>)}
                      </div>
                    </td>
                    <td className="ds-table-muted text-center">{t.totalClasses}</td>
                    <td className="ds-table-muted text-center">{t.sessionsEstimated}</td>
                    <td className="ds-table-highlight">{t.expectedEarning.toLocaleString('vi-VN')}đ</td>
                    <td className="text-emerald-600 text-xs font-semibold">{t.paid.toLocaleString('vi-VN')}đ</td>
                    <td className={`text-xs font-bold ${t.remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {t.remaining.toLocaleString('vi-VN')}đ
                    </td>
                    <td>
                      {t.isPaid ? (
                        <span className="ds-badge ds-badge-green"><CheckCircle size={11} /> Đã trả</span>
                      ) : (
                        <span className="ds-badge ds-badge-red"><XCircle size={11} /> Chưa trả</span>
                      )}
                    </td>
                    <td>
                      {!t.isPaid && (
                        <button
                          className="ds-btn-primary"
                          style={{ padding: '6px 14px', fontSize: 11 }}
                          onClick={() => openModal(t)}
                        >
                          <DollarSign size={12} /> Thanh toán
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {modal.open && modal.tutor && (
        <div className="ds-modal-overlay">
          <div className="ds-modal" style={{ maxWidth: 460 }}>
            <div className="ds-modal-header">
              <h3>Ghi nhận thanh toán lương</h3>
              <button className="ds-modal-close" onClick={() => setModal({ open: false, tutor: null })}>
                <X size={16} />
              </button>
            </div>
            <div className="ds-modal-body flex flex-col gap-4">
              <div className="p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="text-xs font-bold text-slate-700">{modal.tutor.fullName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modal.tutor.totalClasses} lớp · {modal.tutor.sessionsEstimated} buổi ước tính · Tháng {month}/{year}
                </p>
              </div>
              <div>
                <label className="ds-label">Số tiền thanh toán (VNĐ)</label>
                <input
                  type="number"
                  className="ds-input"
                  value={payForm.amount}
                  onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="Nhập số tiền..."
                />
              </div>
              <div>
                <label className="ds-label">Số buổi dạy</label>
                <input
                  type="number"
                  className="ds-input"
                  value={payForm.sessions}
                  onChange={e => setPayForm(p => ({ ...p, sessions: e.target.value }))}
                />
              </div>
              <div>
                <label className="ds-label">Ghi chú</label>
                <input
                  type="text"
                  className="ds-input"
                  value={payForm.note}
                  onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="Lương tháng 8/2026..."
                />
              </div>
            </div>
            <div className="ds-modal-footer">
              <button className="ds-btn-secondary" onClick={() => setModal({ open: false, tutor: null })}>Huỷ</button>
              <button className="ds-btn-primary" onClick={handlePay} disabled={paying || !payForm.amount}>
                {paying ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalaryPaymentView;
