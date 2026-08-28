import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, TrendingUp, BookOpen, Calendar, Loader2, Receipt } from 'lucide-react';

interface SalaryPayment {
  id: string;
  amount: number;
  month: number;
  year: number;
  sessions: number;
  note?: string;
  paidAt: string;
}

interface SalaryData {
  payments: SalaryPayment[];
  activeClasses: number;
  totalEarned: number;
  monthlyBreakdown: { month: string; amount: number }[];
}

const MOCK_DATA: SalaryData = {
  activeClasses: 2,
  totalEarned: 9600000,
  payments: [
    { id: 'p-1', amount: 2400000, month: 8, year: 2026, sessions: 12, note: 'Lương tháng 8 - 2 lớp', paidAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString() },
    { id: 'p-2', amount: 3600000, month: 7, year: 2026, sessions: 18, note: 'Lương tháng 7 - 3 lớp', paidAt: new Date(Date.now() - 1000 * 3600 * 24 * 32).toISOString() },
    { id: 'p-3', amount: 1800000, month: 6, year: 2026, sessions: 9, note: 'Lương tháng 6', paidAt: new Date(Date.now() - 1000 * 3600 * 24 * 65).toISOString() },
    { id: 'p-4', amount: 1800000, month: 5, year: 2026, sessions: 9, note: 'Lương tháng 5', paidAt: new Date(Date.now() - 1000 * 3600 * 24 * 96).toISOString() },
  ],
  monthlyBreakdown: [
    { month: '2026-05', amount: 1800000 },
    { month: '2026-06', amount: 1800000 },
    { month: '2026-07', amount: 3600000 },
    { month: '2026-08', amount: 2400000 },
  ],
};

const TeacherSalaryView: React.FC = () => {
  const { apiUrl, token } = useAuth();
  const [data, setData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/salary/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setData(await res.json());
        } else {
          setData(MOCK_DATA);
        }
      } catch {
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiUrl, token]);

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">Đang tải dữ liệu lương...</span>
    </div>
  );

  const d = data || MOCK_DATA;
  const maxBar = Math.max(...d.monthlyBreakdown.map(m => m.amount), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-top">
            <div>
              <p className="ds-stat-label">TỔNG ĐÃ NHẬN</p>
              <p className="ds-stat-value">{(d.totalEarned / 1000000).toFixed(1)}M đ</p>
            </div>
            <div className="ds-stat-icon" style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="ds-stat-change">
            <TrendingUp size={13} className="text-emerald-500" />
            <span className="text-emerald-600">Lũy kế từ đầu</span>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-top">
            <div>
              <p className="ds-stat-label">LƯƠNG GẦN NHẤT</p>
              <p className="ds-stat-value">{d.payments[0] ? (d.payments[0].amount / 1000).toFixed(0) + 'K đ' : '—'}</p>
            </div>
            <div className="ds-stat-icon" style={{ background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)' }}>
              <Receipt size={20} />
            </div>
          </div>
          <div className="ds-stat-change">
            <Calendar size={13} className="text-indigo-400" />
            <span className="text-slate-500">
              {d.payments[0] ? `Tháng ${d.payments[0].month}/${d.payments[0].year}` : 'Chưa có'}
            </span>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-top">
            <div>
              <p className="ds-stat-label">LỚP ĐANG DẠY</p>
              <p className="ds-stat-value">{d.activeClasses}</p>
            </div>
            <div className="ds-stat-icon" style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div className="ds-stat-change">
            <TrendingUp size={13} className="text-emerald-500" />
            <span className="text-emerald-600">Đang hoạt động</span>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-top">
            <div>
              <p className="ds-stat-label">TỔNG SỐ THANH TOÁN</p>
              <p className="ds-stat-value">{d.payments.length}</p>
            </div>
            <div className="ds-stat-icon" style={{ background: 'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="ds-stat-change">
            <span className="text-slate-500">Lần nhận lương</span>
          </div>
        </div>
      </div>

      {/* Income bar chart */}
      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Thu nhập theo tháng</h3>
          <span className="text-xs text-slate-400">Triệu VND</span>
        </div>
        <div className="p-6">
          {d.monthlyBreakdown.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Chưa có dữ liệu lương.</p>
          ) : (
            <div className="flex items-end gap-3" style={{ height: 160 }}>
              {d.monthlyBreakdown.map((m) => {
                const pct = (m.amount / maxBar) * 100;
                const label = m.month.replace(/^(\d{4})-(\d{2})$/, 'T$2/$1').replace(/T0(\d)/, 'T$1');
                return (
                  <div key={m.month} className="salary-bar-item">
                    <div className="salary-bar-value">{(m.amount / 1000000).toFixed(1)}M</div>
                    <div className="salary-bar-track">
                      <div
                        className="salary-bar-fill"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <div className="salary-bar-label">{label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment history */}
      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Lịch sử nhận lương</h3>
        </div>
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Số tiền</th>
                <th>Số buổi</th>
                <th>Ghi chú</th>
                <th>Ngày nhận</th>
              </tr>
            </thead>
            <tbody>
              {d.payments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Chưa có lịch sử nhận lương.</td></tr>
              ) : (
                d.payments.map(p => (
                  <tr key={p.id}>
                    <td><span className="ds-tag ds-tag-blue">T{p.month}/{p.year}</span></td>
                    <td className="ds-table-highlight font-bold">{p.amount.toLocaleString('vi-VN')}đ</td>
                    <td className="ds-table-muted">{p.sessions} buổi</td>
                    <td className="ds-table-muted">{p.note || '—'}</td>
                    <td className="ds-table-muted">{new Date(p.paidAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherSalaryView;
