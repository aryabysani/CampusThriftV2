'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

const REASONS = [
  'Technical issues', 'Bugs', 'Broken listings', 'Loopholes', 'Scams',
  'Wrong campus', "Can't log in", 'Feature request', 'Just want to say hi',
]

export default function ContactPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/campus/mahe-blr' },
    { label: 'Sell', href: '/auth?redirect=/sell' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #06060F;
          font-family: 'Space Grotesk', sans-serif;
          color: #E8EEFF;
          overflow-x: hidden;
        }

        /* NAV */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          position: sticky; top: 0; z-index: 200;
          background: rgba(6,6,15,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s;
        }
        .nav.scrolled { border-bottom-color: rgba(123,92,240,0.18); }

        .nav-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: #E8EEFF;
          letter-spacing: -0.02em;
          cursor: pointer;
        }

        .hamburger {
          display: flex; flex-direction: column; justify-content: center;
          gap: 5px; width: 36px; height: 36px;
          background: none; border: none; cursor: pointer; padding: 6px;
          border-radius: 8px; transition: background 0.15s;
        }
        .hamburger:hover { background: rgba(123,92,240,0.1); }
        .hamburger span {
          display: block; width: 20px; height: 1.5px;
          background: #E8EEFF; border-radius: 2px;
        }

        /* DRAWER */
        .drawer-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(6,6,15,0.7);
          backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s;
        }
        .drawer-overlay.open { opacity: 1; pointer-events: all; }

        .drawer {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 280px; z-index: 400;
          background: #0D0D1A;
          border-right: 1px solid rgba(123,92,240,0.18);
          padding: 28px 0;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; flex-direction: column;
        }
        .drawer.open { transform: translateX(0); }

        .drawer-header {
          padding: 0 28px 24px;
          border-bottom: 1px solid rgba(123,92,240,0.12);
          display: flex; align-items: center; justify-content: space-between;
        }
        .drawer-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 17px;
          color: #E8EEFF; letter-spacing: -0.02em;
        }
        .drawer-close {
          width: 28px; height: 28px; background: none; border: none;
          cursor: pointer; color: #8892A4; font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px; transition: background 0.15s;
        }
        .drawer-close:hover { background: rgba(123,92,240,0.1); color: #E8EEFF; }

        .drawer-links {
          display: flex; flex-direction: column; padding: 20px 0; flex: 1;
        }
        .drawer-link {
          padding: 14px 28px;
          font-size: 15px; font-weight: 400;
          color: #8892A4;
          cursor: pointer; border: none; background: none;
          text-align: left; font-family: 'Space Grotesk', sans-serif;
          transition: all 0.15s;
          border-left: 2px solid transparent;
        }
        .drawer-link:hover { color: #E8EEFF; background: rgba(123,92,240,0.08); border-left-color: #7B5CF0; }
        .drawer-link.active { color: #00D4FF; font-weight: 500; border-left-color: #00D4FF; }

        /* PAGE */
        .page {
          max-width: 560px;
          margin: 0 auto;
          padding: 96px 32px 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* HEADING */
        .heading {
          font-family: 'Syne', sans-serif;
          font-size: 54px;
          font-weight: 800;
          color: #E8EEFF;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 48px;
        }

        /* TAGS */
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 40px;
          max-width: 480px;
        }
        .tag {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          background: rgba(123,92,240,0.08);
          color: #7B5CF0;
          border: 1px solid rgba(123,92,240,0.2);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.04em;
        }

        /* BODY TEXT */
        .body-text {
          font-size: 15px;
          font-weight: 300;
          color: #8892A4;
          line-height: 1.8;
          margin-bottom: 48px;
        }

        /* DIVIDER */
        .divider {
          width: 32px;
          height: 1px;
          background: rgba(123,92,240,0.2);
          margin: 0 auto 48px;
        }

        /* EMAIL DISPLAY */
        .email-link {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          color: #E8EEFF;
          text-decoration: none;
          letter-spacing: -0.02em;
          border-bottom: 1.5px solid rgba(0,212,255,0.2);
          padding-bottom: 4px;
          transition: border-color 0.2s, color 0.2s;
          display: inline-block;
          margin-bottom: 36px;
          line-height: 1.2;
        }
        .email-link:hover {
          color: #00D4FF;
          border-bottom-color: #00D4FF;
        }

        /* CTA BUTTON */
        .cta-btn {
          padding: 13px 28px;
          background: linear-gradient(135deg, #7B5CF0, #5B3FD0);
          color: white;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.01em;
          box-shadow: 0 0 20px rgba(123,92,240,0.3);
        }
        .cta-btn:hover { box-shadow: 0 0 30px rgba(123,92,240,0.5); transform: translateY(-1px); }

        @media (max-width: 640px) {
          .nav { padding: 16px 20px; }
          .page { padding: 48px 20px 80px; }
          .heading { font-size: clamp(32px, 10vw, 38px); }
          .email-link { font-size: clamp(18px, 5vw, 22px); word-break: break-all; }
          .drawer { width: min(260px, 85vw); }
        }
        @media (max-width: 400px) {
          .nav { padding: 14px 16px; }
          .page { padding: 40px 16px 60px; }
          .heading { font-size: 28px; }
        }
      `}</style>

      {/* OVERLAY */}
      <div
        className={`drawer-overlay${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* DRAWER */}
      <nav className={`drawer${menuOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-brand">CampusThrift</span>
          <button className="drawer-close" onClick={() => setMenuOpen(false)}>&#x2715;</button>
        </div>
        <div className="drawer-links">
          {navLinks.map(link => (
            <button
              key={link.href}
              className={`drawer-link${link.href === '/contact' ? ' active' : ''}`}
              onClick={() => { setMenuOpen(false); router.push(link.href) }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      {/* NAVBAR */}
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <span className="nav-brand" onClick={() => router.push('/')}>CampusThrift</span>
        <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </header>

      {/* PAGE */}
      <main className="page">
        <h1 className="heading">We&apos;re listening.</h1>

        <div className="tags">
          {REASONS.map(reason => (
            <span key={reason} className="tag">{reason}</span>
          ))}
        </div>

        <p className="body-text">
          Whatever it is, drop us a mail. We read everything.
        </p>

        <div className="divider" />

        <a className="email-link" href="mailto:Contact@CampusThrift.org">
          Contact@CampusThrift.org
        </a>

        <button
          className="cta-btn"
          onClick={() => window.location.href = 'mailto:Contact@CampusThrift.org'}
        >
          Write to us &rarr;
        </button>
      </main>
      <Footer />
    </>
  )
}
