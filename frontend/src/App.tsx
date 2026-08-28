import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AboutUs } from './pages/AboutUs';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OtpVerify } from './pages/OtpVerify';
import { ForgotPassword } from './pages/ForgotPassword';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ClassRequestsList } from './pages/ClassRequestsList';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Footer } from './components/Footer';

/* ─────────────────────────────────────────────────────────────────
   PREMIUM SPLASH SCREEN
───────────────────────────────────────────────────────────────── */
const TAGLINES = [
  'Kết nối Gia sư uy tín',
  'Học tập hiệu quả hơn',
  'Tương lai bắt đầu từ đây',
];

const SplashScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [phase, setPhase] = useState<'enter' | 'active' | 'exit'>('enter');
  const [progress, setProgress] = useState(0);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);
  const [particlePos] = useState(() =>
    Array.from({ length: 18 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2,
      dur: 3 + Math.random() * 3,
    }))
  );

  useEffect(() => {
    // Phase: enter → active after 400ms
    const t1 = setTimeout(() => setPhase('active'), 400);

    // Progress bar from 0 → 100% over ~2.2s
    const startTime = Date.now();
    const duration = 2200;
    const raf = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(raf);
    };
    const rafId = requestAnimationFrame(raf);

    // Cycle taglines
    const tl = setInterval(() => {
      setTaglineVisible(false);
      setTimeout(() => {
        setTaglineIdx(i => (i + 1) % TAGLINES.length);
        setTaglineVisible(true);
      }, 300);
    }, 800);

    // Exit
    const t2 = setTimeout(() => setPhase('exit'), 2700);
    const t3 = setTimeout(() => onDone(), 3300);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearInterval(tl); cancelAnimationFrame(rafId);
    };
  }, [onDone]);

  const isExiting = phase === 'exit';
  const isActive = phase === 'active';

  return (
    <div className="splash-screen" style={{ opacity: isExiting ? 0 : 1 }}>
      {/* ── Animated mesh gradient background ── */}
      <div className="splash-mesh" />

      {/* ── Floating particles ── */}
      {particlePos.map((p, i) => (
        <div
          key={i}
          className="splash-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}

      {/* ── Orbs ── */}
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />
      <div className="splash-orb splash-orb-3" />

      {/* ── Center Content ── */}
      <div
        className="splash-content"
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'none' : isExiting ? 'scale(1.06) translateY(-12px)' : 'scale(0.88) translateY(24px)',
        }}
      >
        {/* Sunflower logo */}
        <div className="splash-icon-wrap">
          <div className="splash-icon-glow" />
          <div className="splash-icon-ring splash-icon-ring-1" />
          <div className="splash-icon-ring splash-icon-ring-2" />
          <svg
            className="splash-icon-svg"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Petals */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const cx = 32 + Math.cos(angle) * 18;
              const cy = 32 + Math.sin(angle) * 18;
              return (
                <ellipse
                  key={i}
                  cx={cx} cy={cy}
                  rx="7" ry="4.5"
                  fill="#fbbf24"
                  opacity="0.9"
                  transform={`rotate(${i * 45}, ${cx}, ${cy})`}
                />
              );
            })}
            {/* Center circle */}
            <circle cx="32" cy="32" r="12" fill="#92400e" />
            <circle cx="32" cy="32" r="9" fill="#b45309" />
            <circle cx="32" cy="32" r="6" fill="#d97706" opacity="0.6" />
          </svg>
        </div>

        {/* Brand name */}
        <div className="splash-brand">
          <h1 className="splash-title">
            <span className="splash-title-main">Hoa Hướng Dương</span>
          </h1>
          <p className="splash-brand-sub">GIA SƯ & HỌC VẤN</p>
        </div>

        {/* Rotating tagline */}
        <div className="splash-tagline-wrap">
          <span
            className="splash-tagline"
            style={{ opacity: taglineVisible ? 1 : 0, transform: taglineVisible ? 'translateY(0)' : 'translateY(6px)' }}
          >
            {TAGLINES[taglineIdx]}
          </span>
        </div>

        {/* Progress */}
        <div className="splash-progress-area">
          <div className="splash-progress-track">
            <div className="splash-progress-fill" style={{ width: `${progress}%` }}>
              <div className="splash-progress-shine" />
            </div>
          </div>
          <div className="splash-progress-label">
            <span className="splash-progress-dots">
              <span /><span /><span />
            </span>
            <span>{progress < 100 ? 'Đang tải…' : 'Sẵn sàng!'}</span>
          </div>
        </div>
      </div>

      {/* ── Bottom brand stamp ── */}
      <div
        className="splash-footer-stamp"
        style={{ opacity: isActive ? 0.5 : 0 }}
      >
        Trung tâm Gia sư Hoa Hướng Dương · 2026
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   LAYOUT WRAPPER
───────────────────────────────────────────────────────────────── */
const DASHBOARD_ROUTES = ['/admin', '/teacher', '/student'];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = DASHBOARD_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <div className={`min-h-screen flex flex-col ${isDashboard ? 'bg-[#f1f5f9]' : 'bg-[#080c14] text-slate-100'}`}>
      {!isDashboard && <Navbar />}
      <div className="flex-1 flex flex-col">
        {children}
        {!isDashboard && <ChatbotWidget />}
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────────────── */
function App() {
  const [splashDone, setSplashDone] = useState(() =>
    sessionStorage.getItem('splashShown') === 'true'
  );

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', 'true');
    setSplashDone(true);
  };

  return (
    <AuthProvider>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <div
        className="page-reveal"
        style={{
          opacity: splashDone ? 1 : 0,
          transform: splashDone ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OtpVerify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/classes" element={<ClassRequestsList />} />
            </Routes>
          </AppLayout>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
