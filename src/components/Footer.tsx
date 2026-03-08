'use client'

export default function Footer() {
  return (
    <>
      <style suppressHydrationWarning>{`
        .site-footer {
          background: rgba(6,6,15,0.97); backdrop-filter: blur(20px);
          border-top: 1px solid rgba(123,92,240,0.18); padding: 64px 56px 32px; position: relative;
        }
        .site-footer::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #7B5CF0, #00D4FF, #FF2D9B, transparent);
        }
        .site-footer .footer-top {
          display: grid; grid-template-columns: 2fr 3fr; gap: 48px;
          padding-bottom: 48px; border-bottom: 1px solid rgba(123,92,240,0.18); margin-bottom: 32px;
        }
        .site-footer .footer-cols-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
        .site-footer .footer-brand {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px;
          color: #E8EEFF; margin-bottom: 10px;
        }
        .site-footer .footer-tagline { font-size: 13px; font-weight: 400; color: #8892A4; line-height: 1.7; margin-bottom: 16px; }
        .site-footer .footer-tagline em { color: #C0C8D8; font-style: normal; }
        .site-footer .footer-badge {
          display: inline-block; padding: 5px 12px;
          background: rgba(0,212,255,0.07); border: 1px solid rgba(0,212,255,0.18);
          border-radius: 100px; font-size: 10px; font-weight: 600;
          color: #00D4FF; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em;
        }
        .site-footer .footer-col-heading {
          font-size: 10px; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: #C0C8D8;
          font-family: 'IBM Plex Mono', monospace; margin-bottom: 16px;
        }
        .site-footer .footer-links-col { display: flex; flex-direction: column; gap: 10px; }
        .site-footer .footer-links-col a {
          font-size: 13px; color: #8892A4; text-decoration: none; transition: color 0.15s;
        }
        .site-footer .footer-links-col a:hover { color: #00D4FF; }
        .site-footer .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 11px; color: #8892A4;
          font-family: 'IBM Plex Mono', monospace;
        }
        .site-footer .footer-bottom .pink { color: #FF2D9B; }

        @media (max-width: 900px) {
          .site-footer { padding: 40px 20px 24px; }
          .site-footer .footer-top { grid-template-columns: 1fr; gap: 0; padding-bottom: 24px; margin-bottom: 20px; }
          .site-footer .footer-brand-section { margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid rgba(123,92,240,0.12); }
          .site-footer .footer-cols-row { grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
          .site-footer .footer-col-heading { color: #8892A4; }
          .site-footer .footer-links-col a { color: #8892A4; font-size: 13px; }
          .site-footer .footer-bottom { flex-direction: column; gap: 6px; text-align: center; color: #8892A4; }
          .site-footer .footer-tagline { color: #8892A4; }
          .site-footer .footer-tagline em { color: #C0C8D8; }
        }
      `}</style>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand-section">
            <div className="footer-brand">CampusThrift</div>
            <p className="footer-tagline">
              The campus marketplace that actually <em>gets it</em>.<br />
              Buy &amp; sell smarter. Your wallet said thank you.
            </p>
            <div className="footer-badge">✓ ZERO FEES. ALWAYS. FR.</div>
          </div>
          <div className="footer-cols-row">
            <div className="footer-links-col">
              <div className="footer-col-heading">Product</div>
              <a href="/campuses">Browse listings</a>
              <a href="/auth?redirect=/sell">Sell an item</a>
              <a href="/campuses">Campuses</a>
            </div>
            <div className="footer-links-col">
              <div className="footer-col-heading">Company</div>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
              <a href="#">Instagram</a>
            </div>
            <div className="footer-links-col">
              <div className="footer-col-heading">Legal</div>
              <a href="/privacy">Privacy policy</a>
              <a href="/terms">Terms of use</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CampusThrift · campusthrift.org</span>
          <span>made with <span className="pink">♥</span> + mild sleep deprivation</span>
        </div>
      </footer>
    </>
  )
}
