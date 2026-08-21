import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <div className="footer-wrap">
      <style>{`
        .footer-wrap {
          --sky-1: #eaf4ff;
          --sky-2: #d7ebff;
          --blue-deep: #123a6b;
          --blue-mid: #1f66c9;
          --blue-line: #bcdcff;
          --sunflower: #f6a91b;
          --sunflower-deep: #e0870b;
          --ink: #12294a;
          --ink-soft: #4b6485;
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #f3f8ff;
        }



        footer {
          position: relative;
          background:
            radial-gradient(120% 160% at 12% -20%, #ffffff 0%, transparent 45%),
            radial-gradient(90% 140% at 100% 0%, #fff6df 0%, transparent 40%),
            linear-gradient(160deg, var(--sky-1) 0%, var(--sky-2) 55%, #cfe6ff 100%);
          padding: 76px 6vw 28px;
          color: var(--ink);
        }

        .sun-petal {
          position: absolute;
          z-index: 0;
          opacity: .35;
          pointer-events: none;
        }

        .footer-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 48px;
          max-width: 1180px;
          margin: 0 auto;
        }

        .brand {
          max-width: 380px;
        }
        .brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .logo-badge {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ffe08a, var(--sunflower));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 14px rgba(224,135,11,.35);
          font-size: 22px;
        }
        .brand-name {
          font-family: 'Baloo 2', 'Inter', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: var(--blue-deep);
          letter-spacing: .2px;
        }
        .brand-name span {
          color: var(--sunflower-deep);
        }

        .brand p {
          font-size: 14.5px;
          line-height: 1.7;
          color: var(--ink-soft);
          margin: 0 0 22px;
        }

        .footer-quote {
          margin: 0;
          padding: 14px 18px;
          background: rgba(255,255,255,.65);
          border-left: 3px solid var(--sunflower);
          border-radius: 0 12px 12px 0;
          font-style: italic;
          font-size: 13.5px;
          line-height: 1.65;
          color: var(--blue-deep);
          backdrop-filter: blur(2px);
        }

        h4.col-title {
          font-family: 'Baloo 2', 'Inter', sans-serif;
          font-size: 14px;
          letter-spacing: 1.2px;
          font-weight: 650;
          color: var(--blue-mid);
          text-transform: uppercase;
          margin: 0 0 20px;
          position: relative;
          padding-bottom: 10px;
        }
        h4.col-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 28px;
          height: 3px;
          border-radius: 3px;
          background: linear-gradient(90deg, var(--sunflower), var(--blue-mid));
        }

        .footer-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .footer-list.links a {
          color: var(--ink);
          text-decoration: none;
          font-size: 14.5px;
          font-weight: 500;
          position: relative;
          transition: color .2s ease, padding-left .2s ease;
        }
        .footer-list.links a::before {
          content: '›';
          position: absolute;
          left: -16px;
          opacity: 0;
          color: var(--sunflower-deep);
          transition: opacity .2s ease, left .2s ease;
        }
        .footer-list.links a:hover {
          color: var(--blue-mid);
          padding-left: 16px;
        }
        .footer-list.links a:hover::before {
          opacity: 1;
          left: 0;
        }

        .contact-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 14px;
          color: var(--ink);
        }
        .icon-chip {
          flex: none;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 3px 8px rgba(31,102,201,.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .contact-item a {
          color: var(--blue-mid);
          text-decoration: none;
          font-weight: 600;
        }
        .contact-item a:hover {
          text-decoration: underline;
        }

        .footer-divider {
          max-width: 1180px;
          margin: 52px auto 22px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue-line), transparent);
        }

        .bottom-row {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }
        .copyright {
          font-size: 13px;
          color: var(--ink-soft);
        }

        .socials {
          display: flex;
          gap: 10px;
        }
        .socials a {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(31,102,201,.15);
          color: var(--blue-mid);
          text-decoration: none;
          font-weight: bold;
          font-size: 14px;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease, color .2s ease;
        }
        .socials a:hover {
          transform: translateY(-3px);
          background: var(--blue-mid);
          color: #fff;
          box-shadow: 0 8px 16px rgba(31,102,201,.3);
        }

        @media (max-width: 820px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          footer {
            padding: 64px 6vw 24px;
          }
          .bottom-row {
            justify-content: center;
            text-align: center;
            flex-direction: column;
          }
        }
      `}</style>



      <footer>
        <svg className="sun-petal" width="220" height="220" style={{ top: '-60px', right: '6%' }} viewBox="0 0 100 100">
          <g fill="#f6a91b">
            <ellipse cx="50" cy="18" rx="9" ry="18" />
            <ellipse cx="50" cy="18" rx="9" ry="18" transform="rotate(45 50 50)" />
            <ellipse cx="50" cy="18" rx="9" ry="18" transform="rotate(90 50 50)" />
            <ellipse cx="50" cy="18" rx="9" ry="18" transform="rotate(135 50 50)" />
            <ellipse cx="50" cy="18" rx="9" ry="18" transform="rotate(180 50 50)" />
            <ellipse cx="50" cy="18" rx="9" ry="18" transform="rotate(225 50 50)" />
            <ellipse cx="50" cy="18" rx="9" ry="18" transform="rotate(270 50 50)" />
            <ellipse cx="50" cy="18" rx="9" ry="18" transform="rotate(315 50 50)" />
          </g>
          <circle cx="50" cy="50" r="12" fill="#e0870b" />
        </svg>

        <div className="footer-grid">
          {/* Brand */}
          <div className="brand">
            <div className="brand-row">
              <div className="logo-badge">🌻</div>
              <div className="brand-name">Gia sư <span>Hoa Hướng Dương</span></div>
            </div>
            <p>Hệ thống kết nối Gia sư và Học sinh hàng đầu, mang lại giải pháp giáo dục cá nhân hóa chất lượng cao, giúp học sinh vững bước chinh phục mọi kỳ thi.</p>
            <div className="footer-quote">
              "Đầu tư vào tri thức luôn mang lại lợi ích tốt nhất cho tương lai. Mỗi bước đi trong giáo dục hôm nay là nền móng vững chắc cho ngày mai."
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="col-title">Liên kết nhanh</h4>
            <ul className="footer-list links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/register">Đăng ký thành viên</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="col-title">Liên hệ</h4>
            <ul className="footer-list">
              <li className="contact-item">
                <span className="icon-chip">📍</span>
                <span>Phường Linh Xuân, TP Thủ Đức, TP HCM</span>
              </li>
              <li className="contact-item">
                <span className="icon-chip">📞</span>
                <a href="tel:0327169519">0327 169 519</a>
              </li>
              <li className="contact-item">
                <span className="icon-chip">✉️</span>
                <a href="mailto:huykenkva123@gmail.com">huykenkva123@gmail.com</a>
              </li>
              <li className="contact-item">
                <span className="icon-chip">💬</span>
                <a href="https://zalo.me/g/lrlyavgtoim0fj0v0eck" target="_blank" rel="noopener noreferrer">Tư vấn Gia sư (Zalo)</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="bottom-row">
          <div className="copyright">© 2026 Gia sư Hoa Hướng Dương. Tất cả các quyền được bảo lưu.</div>
          <div className="socials">
            <a href="https://zalo.me/g/lrlyavgtoim0fj0v0eck" target="_blank" rel="noopener noreferrer" aria-label="Zalo">Z</a>
            <a href="https://www.facebook.com/huy.kenkva.7" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.youtube.com/@hanhy0101" target="_blank" rel="noopener noreferrer" aria-label="Youtube">▶</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
