'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

export default function AboutPage() {
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
        html { scroll-behavior: smooth; }

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
          transition: all 0.25s;
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
          max-width: 680px;
          margin: 0 auto;
          padding: 80px 32px 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* SVG SCENE */
        .scene-wrap {
          width: 100%;
          max-width: 560px;
          margin-bottom: 64px;
        }

        /* FIGURE ANIMATION */
        @keyframes figureWalk {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-8px); }
        }
        @keyframes armRaise {
          0%, 40%, 100% { transform: rotate(0deg); transform-origin: 50% 0%; }
          20% { transform: rotate(-40deg); transform-origin: 50% 0%; }
        }
        @keyframes brickAppear {
          0% { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes brickAppear2 {
          0%, 33% { opacity: 0; }
          33.01% { opacity: 0; transform: translateY(-6px); }
          50%, 100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes brickAppear3 {
          0%, 66% { opacity: 0; }
          66.01% { opacity: 0; transform: translateY(-6px); }
          83%, 100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes figureGroup {
          0% { transform: translateX(200px); }
          15% { transform: translateX(200px); }
          30% { transform: translateX(184px); }
          45% { transform: translateX(184px); }
          60% { transform: translateX(168px); }
          75% { transform: translateX(168px); }
          100% { transform: translateX(168px); }
        }

        .figure-group {
          animation: figureGroup 9s ease-in-out infinite;
        }
        .figure-arm-right {
          animation: armRaise 3s ease-in-out infinite;
          transform-origin: 141px 68px;
        }
        .missing-brick-1 {
          animation: brickAppear 0.4s ease-out 2.8s both;
          animation-iteration-count: infinite;
          animation-delay: 2.8s;
        }
        .missing-brick-2 {
          animation: brickAppear2 9s ease-out infinite;
        }
        .missing-brick-3 {
          animation: brickAppear3 9s ease-out infinite;
        }

        /* NOTE */
        .note {
          font-size: 15px;
          font-weight: 300;
          color: #8892A4;
          max-width: 480px;
          text-align: center;
          line-height: 1.85;
          font-family: 'Space Grotesk', sans-serif;
        }
        .note a {
          color: #00D4FF;
          text-decoration: none;
          border-bottom: 1px solid rgba(0,212,255,0.2);
          transition: border-color 0.15s;
        }
        .note a:hover { border-bottom-color: #00D4FF; }

        @media (max-width: 640px) {
          .nav { padding: 16px 20px; }
          .page { padding: 40px 20px 80px; }
          .drawer { width: min(260px, 85vw); }
          .note { font-size: 14px; }
        }
        @media (max-width: 400px) {
          .nav { padding: 14px 16px; }
          .page { padding: 32px 16px 60px; }
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
              className={`drawer-link${link.href === '/about' ? ' active' : ''}`}
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
        {/* ANIMATED SVG SCENE */}
        <div className="scene-wrap">
          <svg
            viewBox="0 0 560 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto' }}
          >
            {/* Ground line */}
            <line x1="40" y1="230" x2="520" y2="230" stroke="rgba(123,92,240,0.25)" strokeWidth="1.5" />

            {/* WALL — complete rows at bottom */}
            {/* Row 1 (bottom) */}
            <rect x="60" y="200" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="122" y="200" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="184" y="200" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="246" y="200" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="308" y="200" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="370" y="200" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="432" y="200" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>

            {/* Row 2 */}
            <rect x="91" y="172" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="153" y="172" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="215" y="172" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="277" y="172" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="339" y="172" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="401" y="172" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>

            {/* Row 3 */}
            <rect x="60" y="144" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="122" y="144" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="184" y="144" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="246" y="144" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="308" y="144" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="370" y="144" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>

            {/* Row 4 */}
            <rect x="91" y="116" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="153" y="116" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="215" y="116" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="277" y="116" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="339" y="116" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>

            {/* Row 5 — logo row, with accent fill on logo bricks */}
            <rect x="60" y="88" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            {/* Logo area bricks — filled purple */}
            <rect x="122" y="88" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <rect x="184" y="88" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <rect x="246" y="88" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <rect x="308" y="88" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <text x="215" y="107" fontFamily="'Syne', 'Inter', Arial, sans-serif" fontWeight="800" fontSize="13" fill="#00D4FF" letterSpacing="-0.5" textAnchor="middle">CampusThrift</text>

            {/* Row 6 — with logo bricks */}
            <rect x="91" y="60" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <rect x="153" y="60" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <rect x="215" y="60" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <rect x="277" y="60" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>

            {/* TOP ROW — missing bricks that animate in */}
            <rect x="60" y="32" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect x="122" y="32" width="58" height="28" rx="2" stroke="rgba(123,92,240,0.3)" strokeWidth="1.2" fill="#111125"/>
            <rect className="missing-brick-1" x="184" y="32" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <rect className="missing-brick-2" x="246" y="32" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>
            <rect className="missing-brick-3" x="308" y="32" width="58" height="28" rx="2" stroke="#7B5CF0" strokeWidth="1.4" fill="rgba(123,92,240,0.15)"/>

            {/* STICK FIGURE */}
            <g className="figure-group">
              {/* Body */}
              <line x1="140" y1="75" x2="140" y2="105" stroke="#E8EEFF" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Head */}
              <circle cx="140" cy="67" r="8" stroke="#E8EEFF" strokeWidth="1.8" fill="none"/>
              {/* Left arm */}
              <line x1="140" y1="82" x2="127" y2="95" stroke="#E8EEFF" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Right arm — raises to place brick */}
              <g className="figure-arm-right">
                <line x1="140" y1="82" x2="154" y2="70" stroke="#E8EEFF" strokeWidth="1.8" strokeLinecap="round"/>
                {/* Brick in hand */}
                <rect x="152" y="62" width="18" height="9" rx="1.5" stroke="#00D4FF" strokeWidth="1.3" fill="rgba(0,212,255,0.15)"/>
              </g>
              {/* Left leg */}
              <line x1="140" y1="105" x2="131" y2="122" stroke="#E8EEFF" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Right leg */}
              <line x1="140" y1="105" x2="149" y2="122" stroke="#E8EEFF" strokeWidth="1.8" strokeLinecap="round"/>
            </g>
          </svg>
        </div>

        {/* QUIET NOTE */}
        <p className="note">
          Hi, I&apos;m Arya &mdash;{' '}
          <a href="https://aryab.in" target="_blank" rel="noopener noreferrer">aryab.in</a>
          <br /><br />
          I kept finding it weirdly hard to resell things I no longer needed
          to people who&apos;d actually use them. So I built this.
          <br /><br />
          That&apos;s the whole story.
        </p>
      </main>
      <Footer />
    </>
  )
}
