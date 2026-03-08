'use client'

import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

export default function TermsPage() {
  const router = useRouter()

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #F8F4EE; --ink: #1A1612; --ink-muted: #6B6459;
          --ink-faint: #C9C2B8; --ember: #BF5426; --ember-light: #F2E8E1;
          --border: #E5DDD4; --white: #FDFBF8;
        }
        body { background: var(--cream); font-family: 'Outfit', sans-serif; color: var(--ink); }
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 56px; position: sticky; top: 0; z-index: 100;
          background: #F8F4EEee; backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .nav-brand {
          font-family: 'Inter', sans-serif; font-weight: 800; font-size: 20px;
          color: var(--ink); letter-spacing: -0.03em; cursor: pointer;
        }
        .nav-back {
          font-size: 13px; font-weight: 400; color: var(--ink-muted);
          background: none; border: 1px solid var(--border); border-radius: 8px;
          padding: 8px 16px; cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: all 0.15s;
        }
        .nav-back:hover { border-color: var(--ink); color: var(--ink); }
        .page { max-width: 720px; margin: 0 auto; padding: 80px 24px 120px; }
        .page-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--ember); margin-bottom: 16px;
        }
        .page-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-size: 52px; line-height: 1.05; color: var(--ink);
          letter-spacing: -0.02em; margin-bottom: 12px;
        }
        .page-title strong { font-weight: 600; }
        .page-date {
          font-size: 13px; font-weight: 300; color: var(--ink-faint);
          margin-bottom: 64px;
        }
        .section { margin-bottom: 52px; }
        .section-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 600;
          font-size: 22px; color: var(--ink); margin-bottom: 14px;
          letter-spacing: -0.01em;
        }
        .section-body {
          font-size: 15px; font-weight: 300; color: var(--ink-muted);
          line-height: 1.8;
        }
        .section-body p { margin-bottom: 12px; }
        .section-body p:last-child { margin-bottom: 0; }
        .section-body ul { padding-left: 20px; margin-top: 8px; }
        .section-body ul li { margin-bottom: 8px; }
        .divider { border: none; border-top: 1px solid var(--border); margin: 0 0 52px; }
        .highlight {
          background: var(--ember-light); border-left: 3px solid var(--ember);
          padding: 16px 20px; border-radius: 0 8px 8px 0;
          font-size: 14px; font-weight: 400; color: var(--ink);
          line-height: 1.7; margin-bottom: 12px;
        }
        .rule-card {
          background: var(--white); border: 1.5px solid var(--border);
          border-radius: 14px; padding: 20px 24px; margin-bottom: 12px;
          display: flex; gap: 16px; align-items: flex-start;
        }
        .rule-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
        .rule-title {
          font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 4px;
        }
        .rule-desc {
          font-size: 13px; font-weight: 300; color: var(--ink-muted); line-height: 1.6;
        }
        .contact-box {
          background: var(--ink); border-radius: 16px; padding: 36px;
          margin-top: 64px; text-align: center;
        }
        .contact-box-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 600;
          font-size: 28px; color: var(--cream); margin-bottom: 8px;
        }
        .contact-box-sub {
          font-size: 14px; font-weight: 300;
          color: rgba(248,244,238,0.5); margin-bottom: 20px;
        }
        .contact-email {
          font-family: 'Cormorant Garamond', serif; font-size: 22px;
          color: var(--ember); text-decoration: none;
          border-bottom: 1px solid transparent; transition: border-color 0.15s;
        }
        .contact-email:hover { border-bottom-color: var(--ember); }
        @media (max-width: 600px) {
          .nav { padding: 18px 20px; }
          .page { padding: 48px 20px 80px; }
          .page-title { font-size: 36px; }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-brand" onClick={() => router.push('/')}>CampusThrift</div>
        <button className="nav-back" onClick={() => router.push('/')}>← Back</button>
      </nav>

      <div className="page">
        <div className="page-label">Legal</div>
        <h1 className="page-title">Terms of <strong>Use.</strong></h1>
        <div className="page-date">Last updated: March 2026</div>

        <div className="highlight">
          The short version: be honest, be respectful, don't misuse the platform. CampusThrift is a tool for students — use it like one.
        </div>

        <hr className="divider" />

        <div className="section">
          <div className="section-title">1. What CampusThrift is</div>
          <div className="section-body">
            <p>CampusThrift is a peer-to-peer resell marketplace for college students. We provide the platform — the buying, selling, and exchange happens directly between users. We are not a party to any transaction.</p>
            <p>By using CampusThrift, you agree to these terms. If you don't agree, please don't use the platform.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">2. Who can use it</div>
          <div className="section-body">
            <p>CampusThrift is intended for students of the campuses listed on the platform. By creating an account, you confirm that you are a student or faculty member of a listed campus. We reserve the right to remove accounts that we believe are not genuine campus members.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">3. The rules</div>
          <div className="section-body">
            <p>These exist to keep the platform safe and useful for everyone.</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="rule-card">
              <div className="rule-icon">✅</div>
              <div>
                <div className="rule-title">Be honest about what you're selling</div>
                <div className="rule-desc">Describe your item accurately. Don't misrepresent condition, age, or functionality. What you list is what the buyer expects.</div>
              </div>
            </div>
            <div className="rule-card">
              <div className="rule-icon">🚫</div>
              <div>
                <div className="rule-title">No prohibited items</div>
                <div className="rule-desc">Do not list illegal items, weapons, drugs, counterfeit goods, stolen property, or anything that violates Indian law. We will remove listings and accounts that do.</div>
              </div>
            </div>
            <div className="rule-card">
              <div className="rule-icon">🤝</div>
              <div>
                <div className="rule-title">Transactions are between you and the buyer</div>
                <div className="rule-desc">CampusThrift does not handle payments, shipping, or disputes. All transactions happen directly between users. We are not liable for failed transactions, fraud, or disputes between parties.</div>
              </div>
            </div>
            <div className="rule-card">
              <div className="rule-icon">📵</div>
              <div>
                <div className="rule-title">No spam or fake listings</div>
                <div className="rule-desc">Don't post duplicate listings, fake items, or listings intended to mislead buyers. Don't use the platform to collect phone numbers or personal data from other users.</div>
              </div>
            </div>
            <div className="rule-card">
              <div className="rule-icon">🔐</div>
              <div>
                <div className="rule-title">Keep your account secure</div>
                <div className="rule-desc">You are responsible for your account. Don't share your login with others. If you suspect your account has been compromised, contact us immediately.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">4. Listings and content</div>
          <div className="section-body">
            <p>When you post a listing, you confirm that you own the item and have the right to sell it. You grant CampusThrift a non-exclusive license to display your listing content (photos, title, description) on the platform for as long as the listing is active.</p>
            <p>We reserve the right to remove any listing that violates these terms without notice.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">5. No fees — and why</div>
          <div className="section-body">
            <p>CampusThrift charges zero commission on any transaction. We don't take a cut. We don't add fees. This is intentional — the platform exists to make campus reselling easy, not to profit from it.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">6. Limitation of liability</div>
          <div className="section-body">
            <p>CampusThrift is provided as-is. We make no guarantees about the accuracy of listings, the reliability of sellers or buyers, or the outcome of any transaction.</p>
            <p>We are not liable for any loss, damage, or dispute arising from use of the platform, including but not limited to failed transactions, fraudulent listings, or items not as described.</p>
            <p>Use good judgement. Meet in public places on campus. Don't pay before you see the item.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">7. Account termination</div>
          <div className="section-body">
            <p>We reserve the right to suspend or permanently terminate accounts that violate these terms, engage in fraudulent behaviour, or harm other users of the platform.</p>
            <p>You can delete your own account at any time from your profile page.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">8. Changes to these terms</div>
          <div className="section-body">
            <p>We may update these terms from time to time. When we do, we'll update the date at the top. Continued use of CampusThrift after changes means you accept the updated terms.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">9. Governing law</div>
          <div className="section-body">
            <p>These terms are governed by the laws of India. Any disputes arising from use of CampusThrift shall be subject to the jurisdiction of courts in Bengaluru, Karnataka.</p>
          </div>
        </div>

        <div className="contact-box">
          <div className="contact-box-title">Something unclear?</div>
          <div className="contact-box-sub">Write to us and we'll sort it out.</div>
          <a className="contact-email" href="mailto:Contact@CampusThrift.org">Contact@CampusThrift.org</a>
        </div>
      </div>
      <Footer />
    </>
  )
}