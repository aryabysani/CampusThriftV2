'use client'

import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
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
        <h1 className="page-title">Privacy <strong>Policy.</strong></h1>
        <div className="page-date">Last updated: March 2026</div>

        <div className="highlight">
          The short version: we collect only what we need, we don't sell your data, and we don't share it with anyone except where the app needs it to work.
        </div>

        <hr className="divider" />

        <div className="section">
          <div className="section-title">1. Who we are</div>
          <div className="section-body">
            <p>CampusThrift is a campus-only resell marketplace built for college students in India. We connect buyers and sellers within the same campus community. This policy explains how we handle your personal information when you use our platform.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">2. What we collect</div>
          <div className="section-body">
            <p>We collect the minimum information required to make the platform work:</p>
            <ul>
              <li><strong>Account info</strong> — your name, email address, and profile picture (via Google OAuth)</li>
              <li><strong>Phone number</strong> — collected on signup so buyers can contact you via WhatsApp</li>
              <li><strong>Listing content</strong> — photos, titles, descriptions, prices, and categories you post</li>
              <li><strong>Usage data</strong> — basic analytics like pages visited and actions taken (no invasive tracking)</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <div className="section-title">3. How we use your data</div>
          <div className="section-body">
            <p>Your data is used only to operate CampusThrift:</p>
            <ul>
              <li>To show your listings to other students on your campus</li>
              <li>To allow buyers to contact you on WhatsApp</li>
              <li>To manage your account and listings</li>
              <li>To improve the platform based on how it is used</li>
            </ul>
            <p>We do not use your data for advertising. We do not build profiles to sell to third parties. We do not send spam.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">4. Who we share it with</div>
          <div className="section-body">
            <p>We share your data with:</p>
            <ul>
              <li><strong>Supabase</strong> — our database and authentication provider. Your data is stored on their servers.</li>
              <li><strong>Vercel</strong> — our hosting provider. They serve the website.</li>
              <li><strong>Google</strong> — if you sign in with Google, they authenticate your identity.</li>
            </ul>
            <p>That's it. No advertisers. No data brokers. No marketing platforms.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">5. Your phone number</div>
          <div className="section-body">
            <p>Your phone number is shown to buyers only when they view your listing. It is used exclusively to enable WhatsApp contact. We do not send SMS messages to your number. We do not share it with third parties.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">6. Data retention</div>
          <div className="section-body">
            <p>Your data is retained as long as your account is active. If you delete your account, all your data — including your profile, listings, and images — is permanently deleted from our systems. There is no recovery after deletion.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">7. Your rights</div>
          <div className="section-body">
            <p>You can:</p>
            <ul>
              <li>Edit your profile and phone number at any time from your profile page</li>
              <li>Remove any listing you have posted</li>
              <li>Delete your account permanently from your profile page</li>
              <li>Request a copy of your data by emailing us</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <div className="section-title">8. Cookies</div>
          <div className="section-body">
            <p>We use session cookies to keep you logged in. We do not use advertising cookies or third-party tracking cookies.</p>
          </div>
        </div>

        <div className="section">
          <div className="section-title">9. Changes to this policy</div>
          <div className="section-body">
            <p>If we make significant changes to this policy, we will update the date at the top of this page. Continued use of CampusThrift after changes constitutes acceptance of the updated policy.</p>
          </div>
        </div>

        <div className="contact-box">
          <div className="contact-box-title">Questions?</div>
          <div className="contact-box-sub">We read everything. Write to us at</div>
          <a className="contact-email" href="mailto:Contact@CampusThrift.org">Contact@CampusThrift.org</a>
        </div>
      </div>
      <Footer />
    </>
  )
}