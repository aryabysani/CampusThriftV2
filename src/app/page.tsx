'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  {
    num: '01',
    title: 'Snap a photo',
    desc: 'Literally just point your phone at it. Blurry is fine, we\'re not running a gallery.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:48,height:48}}>
        <rect width="48" height="48" rx="14" fill="#0D0D1A"/>
        <rect x="12" y="16" width="24" height="18" rx="3" stroke="#7B5CF0" strokeWidth="1.8"/>
        <circle cx="24" cy="25" r="5" stroke="#00D4FF" strokeWidth="1.8"/>
        <circle cx="24" cy="25" r="2.5" fill="#00D4FF" opacity="0.25"/>
        <path d="M20 16l1.5-3h5L28 16" stroke="#7B5CF0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="31" cy="20" r="1.2" fill="#FF2D9B"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'List in 2 minutes',
    desc: 'Faster than your situationship leaves you on read. Title, price, done.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:48,height:48}}>
        <rect width="48" height="48" rx="14" fill="#0D0D1A"/>
        <rect x="13" y="11" width="22" height="28" rx="3" stroke="#C0C8D8" strokeWidth="1.8"/>
        <path d="M18 18h12M18 23h12M18 28h7" stroke="#C0C8D8" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="34" cy="34" r="6" fill="#7B5CF0"/>
        <path d="M31.5 34l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Get a WhatsApp ping',
    desc: 'A real human from your campus slides in. No bots, no spam, no rizz required.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:48,height:48}}>
        <rect width="48" height="48" rx="14" fill="#0D0D1A"/>
        <circle cx="24" cy="23" r="11" stroke="#FF2D9B" strokeWidth="1.8"/>
        <path d="M18 26c1 2 3.5 4 6 4s5-2 6-4" stroke="#FF2D9B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20 21c.5-1 1.5-1.5 2.5-1s1.5 1.5 1 2.5" stroke="#FF2D9B" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M25 22c.5-1 1.5-1.5 2.5-1s1.5 1.5 1 2.5" stroke="#FF2D9B" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 36l2-3h4l2 3" stroke="#FF2D9B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Meet & collect (irl!!!)',
    desc: 'Touch grass. Do a transaction. Collect cash. Main character energy.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:48,height:48}}>
        <rect width="48" height="48" rx="14" fill="#0D0D1A"/>
        <circle cx="18" cy="18" r="5" stroke="#00D4FF" strokeWidth="1.8"/>
        <circle cx="30" cy="18" r="5" stroke="#00D4FF" strokeWidth="1.8"/>
        <path d="M10 36c0-5 3.6-8 8-8" stroke="#00D4FF" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M38 36c0-5-3.6-8-8-8" stroke="#00D4FF" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20 36c0-3 1.8-5 4-5s4 2 4 5" stroke="#00D4FF" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M22 28l2 2 2-2" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const TICKER_ITEMS = [
  'Zero platform fees, bestie', 'Campus-only listings', 'WhatsApp direct, no cap',
  'Sell in 2 minutes fr fr', 'No middlemen 🚫', 'Built for broke students',
  'Zero platform fees, bestie', 'Campus-only listings', 'WhatsApp direct, no cap',
  'Sell in 2 minutes fr fr', 'No middlemen 🚫', 'Built for broke students',
]

export default function LandingPage() {
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [campuses, setCampuses] = useState<any[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [titleIdx, setTitleIdx] = useState(0)
  const [titleVisible, setTitleVisible] = useState(true)
  const stepsRef = useRef<HTMLDivElement>(null)
  const campusRef = useRef<HTMLDivElement>(null)
  const listBtnRef = useRef<HTMLButtonElement>(null)
  const moneyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function spawnMoneyBurst() {
    const btn = listBtnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const emojis = ['💸', '💵', '💰', '💴', '💶']
    const corners = [
      { x: rect.left,  y: rect.top,    baseAngle: 225 },
      { x: rect.right, y: rect.top,    baseAngle: 315 },
      { x: rect.left,  y: rect.bottom, baseAngle: 135 },
      { x: rect.right, y: rect.bottom, baseAngle: 45  },
    ]
    corners.forEach(corner => {
      const el = document.createElement('span')
      el.className = 'money-particle'
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
      const angle = corner.baseAngle + (Math.random() - 0.5) * 60
      const dist = 50 + Math.random() * 70
      const rad = (angle * Math.PI) / 180
      const tx = Math.cos(rad) * dist
      const ty = Math.sin(rad) * dist
      const rot = (Math.random() - 0.5) * 180
      el.style.cssText = `
        left: ${corner.x}px; top: ${corner.y}px;
        --tx: ${tx}px; --ty: ${ty}px; --rot: ${rot}deg;
        z-index: 50;
      `
      document.body.appendChild(el)
      el.addEventListener('animationend', () => el.remove())
    })
  }

  function startMoney() {
    spawnMoneyBurst()
    moneyIntervalRef.current = setInterval(spawnMoneyBurst, 150)
  }

  function stopMoney() {
    if (moneyIntervalRef.current) {
      clearInterval(moneyIntervalRef.current)
      moneyIntervalRef.current = null
    }
  }

  useEffect(() => {
    document.addEventListener('mouseup', stopMoney)
    document.addEventListener('touchend', stopMoney)
    document.addEventListener('touchcancel', stopMoney)
    return () => {
      document.removeEventListener('mouseup', stopMoney)
      document.removeEventListener('touchend', stopMoney)
      document.removeEventListener('touchcancel', stopMoney)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setIsSignedIn(true)
    })
    supabase.from('campuses').select('*').order('name')
      .then(({ data }) => { if (data) setCampuses(data) })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleVisible(false)
      setTimeout(() => {
        setTitleIdx(i => (i + 1) % 2)
        setTitleVisible(true)
      }, 350)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view')
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [campuses])

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style suppressHydrationWarning>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --black:    #06060F;
          --surface:  #0D0D1A;
          --card:     #111125;
          --card-2:   #161630;
          --blue:     #00D4FF;
          --purple:   #7B5CF0;
          --pink:     #FF2D9B;
          --silver:   #C0C8D8;
          --silver-2: #8892A4;
          --text:     #E8EEFF;
          --muted:    #5A6480;
          --faint:    #1E2040;
          --border:   rgba(123,92,240,0.18);
          --border-b: rgba(0,212,255,0.15);
        }

        body {
          background: var(--black);
          font-family: 'Space Grotesk', sans-serif;
          color: var(--text);
          overflow-x: hidden;
        }

        /* ═══════════════ BACKGROUND SCENE ═══════════════ */
        .scene {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
        }
        .scene-base {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 20% 10%, rgba(123,92,240,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 80% 90%, rgba(0,212,255,0.09) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,45,155,0.04) 0%, transparent 65%),
            linear-gradient(180deg, #040410 0%, #06060F 50%, #040410 100%);
        }
        .scene-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(123,92,240,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(123,92,240,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }
        .scene-floor {
          position: absolute;
          bottom: 0; left: -20%; right: -20%; height: 55%;
          background-image:
            linear-gradient(rgba(0,212,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.07) 1px, transparent 1px);
          background-size: 64px 64px;
          transform: perspective(600px) rotateX(70deg);
          transform-origin: 50% 100%;
          mask-image: linear-gradient(to top, black 0%, rgba(0,0,0,0.4) 45%, transparent 75%);
          -webkit-mask-image: linear-gradient(to top, black 0%, rgba(0,0,0,0.4) 45%, transparent 75%);
        }
        .scene-orb-1 {
          position: absolute;
          width: 500px; height: 500px;
          top: -100px; left: -100px;
          background: radial-gradient(circle, rgba(123,92,240,0.15) 0%, transparent 65%);
          filter: blur(60px);
          animation: orbDrift1 8s ease-in-out infinite;
        }
        .scene-orb-2 {
          position: absolute;
          width: 400px; height: 400px;
          bottom: 0; right: -80px;
          background: radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 65%);
          filter: blur(60px);
          animation: orbDrift2 10s ease-in-out infinite 2s;
        }
        .scene-orb-3 {
          position: absolute;
          width: 300px; height: 300px;
          top: 40%; right: 20%;
          background: radial-gradient(circle, rgba(255,45,155,0.07) 0%, transparent 65%);
          filter: blur(50px);
          animation: orbDrift1 7s ease-in-out infinite 4s;
        }
        @keyframes orbDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, 20px) scale(1.1); }
        }
        @keyframes orbDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-20px, -30px) scale(1.08); }
        }
        .scene-vignette {
          position: absolute; inset: 0;
          background:
            linear-gradient(90deg, rgba(4,4,16,0.7) 0%, transparent 20%, transparent 80%, rgba(4,4,16,0.7) 100%),
            linear-gradient(180deg, rgba(4,4,16,0.5) 0%, transparent 15%, transparent 85%, rgba(4,4,16,0.4) 100%);
        }

        /* ═══════════════ Z-INDEX ═══════════════ */
        .nav, .hero, .ticker-wrap, .how-section, .campus-section, .footer {
          position: relative; z-index: 1;
        }

        /* ═══════════════ REVEAL ═══════════════ */
        .reveal {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        /* ═══════════════ DRAWER ═══════════════ */
        .drawer-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(6,6,15,0.6);
          backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none; transition: opacity 0.3s;
        }
        .drawer-overlay.open { opacity: 1; pointer-events: all; }

        .drawer {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 280px; z-index: 400;
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 28px 0;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column;
        }
        .drawer.open { transform: translateX(0); }

        .drawer-header {
          padding: 0 28px 24px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .drawer-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 17px; color: var(--text);
        }
        .drawer-close {
          width: 28px; height: 28px; background: none; border: none;
          cursor: pointer; color: var(--muted); font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px; transition: all 0.15s;
        }
        .drawer-close:hover { background: var(--faint); color: var(--pink); }

        .drawer-links { display: flex; flex-direction: column; padding: 20px 0; flex: 1; }
        .drawer-link {
          padding: 14px 28px; font-size: 15px; font-weight: 400;
          color: var(--silver-2); cursor: pointer; border: none; background: none;
          text-align: left; font-family: 'Space Grotesk', sans-serif;
          transition: all 0.15s; border-left: 2px solid transparent;
        }
        .drawer-link:hover { color: var(--blue); background: rgba(0,212,255,0.05); border-left-color: var(--blue); }

        /* ═══════════════ NAV ═══════════════ */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 56px;
          position: sticky; top: 0; z-index: 100;
          background: rgba(6,6,15,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .nav-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 20px; color: var(--text);
          letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px;
        }
        .nav-brand-badge {
          font-size: 9px; font-weight: 600; font-family: 'IBM Plex Mono', monospace;
          background: linear-gradient(90deg, var(--purple), var(--blue));
          color: white; padding: 2px 7px; border-radius: 100px;
          letter-spacing: 0.08em; text-transform: uppercase;
        }

        .nav-right { display: flex; align-items: center; gap: 10px; }

        .hamburger {
          display: flex; flex-direction: column; justify-content: center;
          gap: 5px; width: 36px; height: 36px;
          background: none; border: 1px solid var(--border); cursor: pointer;
          padding: 6px; border-radius: 8px; transition: all 0.15s;
        }
        .hamburger:hover { border-color: var(--purple); background: rgba(123,92,240,0.08); }
        .hamburger span { display: block; width: 18px; height: 1.5px; background: var(--silver); border-radius: 2px; }

        .nav-btn-ghost {
          padding: 8px 18px; background: transparent; color: var(--silver-2);
          border: 1px solid var(--border); border-radius: 8px;
          font-size: 13px; font-weight: 500; font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .nav-btn-ghost:hover { border-color: var(--purple); color: var(--purple); }

        .nav-btn-fill {
          padding: 8px 20px;
          background: linear-gradient(135deg, var(--purple), #5B3FD0);
          color: white; border: none; border-radius: 8px;
          font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 0 20px rgba(123,92,240,0.3);
        }
        .nav-btn-fill:hover {
          background: linear-gradient(135deg, #8B6CF0, var(--purple));
          box-shadow: 0 0 32px rgba(123,92,240,0.5);
          transform: translateY(-1px);
        }

        /* ═══════════════ HERO ═══════════════ */
        .hero {
          min-height: auto;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; padding: 28px 56px 24px; gap: 60px; overflow: hidden;
        }

        .hero-left { position: relative; z-index: 1; }

        /* EYEBROW */
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 6px;
          background: linear-gradient(135deg, #1A0A2E, #2D1052);
          border: 1.5px solid rgba(200,241,53,0.3);
          border-radius: 100px; margin-bottom: 20px;
          animation: fadeUp 0.6s ease both;
          position: relative; overflow: hidden;
          box-shadow: 0 0 20px rgba(200,241,53,0.1), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .hero-eyebrow .coin {
          position: absolute; animation: coinFall linear infinite;
          pointer-events: none; opacity: 0;
        }
        .hero-eyebrow .coin:nth-child(1) { left: 8%;  font-size: 10px; animation-duration: 2.1s; animation-delay: 0s; }
        .hero-eyebrow .coin:nth-child(2) { left: 20%; font-size: 12px; animation-duration: 1.8s; animation-delay: 0.4s; }
        .hero-eyebrow .coin:nth-child(3) { left: 35%; font-size: 9px;  animation-duration: 2.4s; animation-delay: 0.9s; }
        .hero-eyebrow .coin:nth-child(4) { left: 52%; font-size: 11px; animation-duration: 1.6s; animation-delay: 0.2s; }
        .hero-eyebrow .coin:nth-child(5) { left: 66%; font-size: 10px; animation-duration: 2.2s; animation-delay: 1.1s; }
        .hero-eyebrow .coin:nth-child(6) { left: 80%; font-size: 12px; animation-duration: 1.9s; animation-delay: 0.6s; }
        .hero-eyebrow .coin:nth-child(7) { left: 91%; font-size: 9px;  animation-duration: 2.5s; animation-delay: 1.4s; }
        @keyframes coinFall {
          0%   { top: -14px; opacity: 0;   transform: rotate(0deg) scale(0.8); }
          10%  { opacity: 0.9; }
          80%  { opacity: 0.5; }
          100% { top: calc(100% + 4px); opacity: 0; transform: rotate(180deg) scale(1.1); }
        }
        .eyebrow-dot {
          width: 20px; height: 20px;
          background: linear-gradient(135deg, #C8F135, #A3D60A);
          border-radius: 100px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 0 8px rgba(200,241,53,0.5); position: relative; z-index: 1;
        }
        .eyebrow-dot svg { width: 10px; height: 10px; fill: #1A1200; }
        .eyebrow-text {
          font-size: 12px; font-weight: 600; color: #C8F135;
          letter-spacing: 0.03em; position: relative; z-index: 1;
        }

        /* HERO TITLE */
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(48px, 5.2vw, 72px);
          line-height: 1.0;
          color: var(--text);
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-title .grad {
          background: linear-gradient(90deg, var(--blue) 0%, var(--purple) 50%, var(--pink) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-title .silver {
          color: var(--silver);
          text-shadow: 0 0 30px rgba(192,200,216,0.3);
        }
        .hero-title-text {
          display: inline-block;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .hero-title-text.hidden {
          opacity: 0;
          transform: translateY(8px);
        }

        .hero-sub {
          font-size: 15px; font-weight: 400; color: var(--silver-2);
          line-height: 1.75; max-width: 440px; margin-bottom: 8px;
          animation: fadeUp 0.6s 0.2s ease both;
        }
        .hero-sub-note {
          font-size: 12px; color: var(--muted); font-family: 'IBM Plex Mono', monospace;
          margin-bottom: 24px; animation: fadeUp 0.6s 0.25s ease both;
        }

        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; animation: fadeUp 0.6s 0.3s ease both; }

        .btn-primary {
          padding: 13px 28px;
          background: linear-gradient(135deg, var(--blue), var(--purple));
          color: var(--black); font-weight: 700;
          border: none; border-radius: 10px;
          font-size: 14px; font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 0 28px rgba(0,212,255,0.25);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 44px rgba(0,212,255,0.4), 0 0 20px rgba(123,92,240,0.3);
        }

        .btn-secondary {
          padding: 13px 28px; background: transparent; color: var(--silver);
          border: 1px solid rgba(192,200,216,0.2); border-radius: 10px;
          font-size: 14px; font-weight: 500; font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.2s; position: relative; overflow: visible;
        }
        .btn-secondary:hover {
          border-color: var(--pink); color: var(--pink);
          box-shadow: 0 0 16px rgba(255,45,155,0.15);
          transform: translateY(-1px);
        }
        @keyframes moneyFly {
          0%   { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.5) rotate(var(--rot)); }
        }
        .money-particle {
          position: fixed; pointer-events: none; z-index: 9999;
          font-size: 18px; user-select: none;
          animation: moneyFly 0.8s ease-out forwards;
        }

        /* HERO MOCKUP */
        .hero-right {
          position: relative; display: flex; align-items: center; justify-content: center;
          animation: fadeUp 0.8s 0.4s ease both;
        }
        .mockup-cards-wrap {
          position: relative; width: 420px; height: 420px;
        }
        .mockup-card, .mockup-card-2, .mockup-card-3 {
          border-radius: 20px; padding: 14px; width: 185px;
          position: absolute; overflow: hidden;
        }
        /* Top-center — Jacket */
        .mockup-card {
          background: var(--card); border: 1px solid var(--border);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
          top: 0; left: 50%; transform: translateX(-50%) rotate(-3deg);
          animation: floatA 4s ease-in-out infinite;
          z-index: 2;
        }
        /* Bottom-left — Microeconomics */
        .mockup-card-2 {
          background: #0D0D20; border: 1px solid rgba(123,92,240,0.25);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          bottom: 20px; left: 0; transform: rotate(-5deg);
          animation: floatB 4.5s ease-in-out infinite 1s;
        }
        /* Bottom-right — Calculator */
        .mockup-card-3 {
          background: var(--card-2); border: 1px solid rgba(0,212,255,0.15);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
          bottom: 20px; right: 0; transform: rotate(5deg);
          animation: floatC 4s ease-in-out infinite 2s;
        }
        .mockup-card::before, .mockup-card-2::before, .mockup-card-3::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue), var(--purple), transparent);
        }
        @keyframes floatA {
          0%, 100% { transform: translateX(-50%) rotate(-3deg) translateY(0px); }
          50%       { transform: translateX(-50%) rotate(-3deg) translateY(-10px); }
        }
        @keyframes floatB {
          0%, 100% { transform: rotate(-5deg) translateY(0px); }
          50%       { transform: rotate(-5deg) translateY(-9px); }
        }
        @keyframes floatC {
          0%, 100% { transform: rotate(5deg) translateY(0px); }
          50%       { transform: rotate(5deg) translateY(-9px); }
        }

        .mock-img {
          width: 100%; height: 100px;
          background: linear-gradient(135deg, #111128, #1A1A38);
          border-radius: 12px; margin-bottom: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--faint);
        }
        .mock-tag {
          display: inline-block; padding: 3px 8px;
          background: rgba(0,212,255,0.08); color: var(--blue);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 6px; font-size: 10px; font-weight: 600;
          font-family: 'IBM Plex Mono', monospace; margin-bottom: 8px;
          letter-spacing: 0.04em;
        }
        .mock-title {
          font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 4px;
        }
        .mock-price { font-size: 18px; font-weight: 700; color: var(--blue); }
        .mock-price span { font-size: 11px; font-weight: 400; color: var(--muted); }
        .mock-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
        .mock-meta-item { display: flex; align-items: center; gap: 3px; font-size: 10px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; }

        /* ═══════════════ TICKER ═══════════════ */
        .ticker-wrap {
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          padding: 12px 0; overflow: hidden;
          background: rgba(13,13,26,0.7); backdrop-filter: blur(8px);
        }
        .ticker-track {
          display: flex; gap: 0;
          animation: ticker 28s linear infinite; width: max-content;
        }
        .ticker-item {
          display: flex; align-items: center; gap: 28px; padding: 0 40px;
          font-size: 11px; font-weight: 500;
          color: var(--muted); font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap;
          transition: color 0.15s;
        }
        .ticker-item:hover { color: var(--blue); }
        .ticker-dot {
          width: 5px; height: 5px; background: var(--pink);
          border-radius: 50%; flex-shrink: 0;
          box-shadow: 0 0 6px var(--pink);
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ═══════════════ HOW IT WORKS ═══════════════ */
        .how-section {
          padding: 100px 56px; max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 2fr; gap: 80px; align-items: start;
        }

        .section-header { position: sticky; top: 100px; }

        .section-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--blue); margin-bottom: 14px;
          font-family: 'IBM Plex Mono', monospace;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::before {
          content: ''; display: block;
          width: 20px; height: 1px; background: var(--blue);
        }

        .section-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 38px; line-height: 1.1; color: var(--text); letter-spacing: -0.02em;
        }
        .section-title .accent { color: var(--purple); }
        .section-title .accent-2 { color: var(--pink); }

        .section-sub {
          margin-top: 14px; font-size: 14px; font-weight: 400;
          color: var(--silver-2); line-height: 1.7;
        }

        .steps-list { display: flex; flex-direction: column; gap: 0; }

        .step-item {
          padding: 32px 0; border-bottom: 1px solid var(--border);
          display: grid; grid-template-columns: 52px 1fr; gap: 20px; align-items: start;
          cursor: default; transition: all 0.3s; border-left: 2px solid transparent;
          padding-left: 0;
        }
        .step-item:first-child { border-top: 1px solid var(--border); }
        .step-item:hover { border-left-color: var(--purple); padding-left: 12px; }

        .step-number {
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 500;
          color: var(--purple); padding-top: 4px; letter-spacing: 0.05em; opacity: 0.7;
        }
        .step-icon-wrap { margin-bottom: 14px; }
        .step-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 20px; color: var(--text); margin-bottom: 6px; letter-spacing: -0.01em;
        }
        .step-desc { font-size: 13px; font-weight: 400; color: var(--silver-2); line-height: 1.65; }

        /* ═══════════════ CAMPUSES ═══════════════ */
        .campus-section { padding: 100px 56px; max-width: 1200px; margin: 0 auto; }

        .campus-header {
          display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 48px;
        }
        .campus-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr)); gap: 16px;
        }

        .campus-card {
          border: 1px solid var(--border); border-radius: 16px; padding: 26px;
          background: var(--card); position: relative; overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .campus-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(123,92,240,0.04) 0%, rgba(0,212,255,0.03) 100%);
          opacity: 0; transition: opacity 0.25s;
        }
        .campus-card.available { cursor: pointer; }
        .campus-card.available:hover {
          border-color: rgba(123,92,240,0.4);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 30px rgba(123,92,240,0.1);
        }
        .campus-card.available:hover::before { opacity: 1; }
        .campus-card.unavailable { opacity: 0.3; cursor: not-allowed; }

        .campus-card-top {
          display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px;
        }
        .campus-icon-box {
          width: 44px; height: 44px;
          background: rgba(123,92,240,0.1); border: 1px solid rgba(123,92,240,0.2);
          border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .live-badge {
          display: flex; align-items: center; gap: 5px; padding: 4px 10px;
          background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.18);
          border-radius: 100px; font-size: 10px; font-weight: 600;
          color: var(--blue); font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.05em;
        }
        .live-dot {
          width: 5px; height: 5px; background: var(--blue); border-radius: 50%;
          box-shadow: 0 0 6px var(--blue); animation: livePulse 1.5s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }
        .campus-name {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px;
          color: var(--text); margin-bottom: 4px;
        }
        .campus-location { font-size: 12px; color: var(--muted); }
        .campus-cta {
          margin-top: 18px; display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: var(--purple);
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.03em;
          transition: all 0.2s;
        }
        .campus-card.available:hover .campus-cta { transform: translateX(4px); color: var(--blue); }
        .campus-cta svg { width: 13px; height: 13px; stroke: currentColor; fill: none; }

        /* ═══════════════ FOOTER ═══════════════ */
        .footer {
          background: rgba(6,6,15,0.97); backdrop-filter: blur(20px);
          border-top: 1px solid var(--border); padding: 64px 56px 32px; position: relative;
        }
        .footer::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--purple), var(--blue), var(--pink), transparent);
        }
        .footer-top {
          display: grid; grid-template-columns: 2fr 3fr; gap: 48px;
          padding-bottom: 48px; border-bottom: 1px solid var(--border); margin-bottom: 32px;
        }
        .footer-cols-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
        .footer-brand {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px;
          color: var(--text); margin-bottom: 10px;
        }
        .footer-tagline { font-size: 13px; font-weight: 400; color: #8892A4; line-height: 1.7; margin-bottom: 16px; }
        .footer-tagline em { color: #C0C8D8; font-style: normal; }
        .footer-badge {
          display: inline-block; padding: 5px 12px;
          background: rgba(0,212,255,0.07); border: 1px solid rgba(0,212,255,0.18);
          border-radius: 100px; font-size: 10px; font-weight: 600;
          color: var(--blue); font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em;
        }
        .footer-col-heading {
          font-size: 10px; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: #C0C8D8;
          font-family: 'IBM Plex Mono', monospace; margin-bottom: 16px;
        }
        .footer-links-col { display: flex; flex-direction: column; gap: 10px; }
        .footer-links-col a {
          font-size: 13px; color: #8892A4; text-decoration: none; transition: color 0.15s;
        }
        .footer-links-col a:hover { color: var(--blue); }
        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 11px; color: #8892A4;
          font-family: 'IBM Plex Mono', monospace;
        }
        .footer-bottom .pink { color: var(--pink); }

        /* ═══════════════ KEYFRAMES ═══════════════ */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ═══════════════ RESPONSIVE ═══════════════ */
        @media (max-width: 900px) {
          .nav { padding: 14px 20px; }
          .nav-desktop-only { display: none !important; }
          .nav-brand { flex-direction: row; align-items: center; gap: 6px; font-size: 16px; }
          .nav-brand-badge { display: none; }
          .hero { grid-template-columns: 1fr; padding: 20px 20px 40px; gap: 0; }
          .hero-right { display: none; }
          .how-section { grid-template-columns: 1fr; padding: 72px 20px; gap: 40px; }
          .section-header { position: static; }
          .campus-section { padding: 64px 20px; }
          .campus-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .footer { padding: 40px 20px 24px; }
          .footer-top { grid-template-columns: 1fr; gap: 0; padding-bottom: 24px; margin-bottom: 20px; }
          .footer-brand-section { margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid rgba(123,92,240,0.12); }
          .footer-cols-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
          .footer-links-col { display: flex; flex-direction: column; gap: 10px; }
          .footer-col-heading { color: #E8EEFF; margin-bottom: 4px; }
          .footer-links-col a { color: #8892A4; font-size: 13px; }
          .footer-bottom { flex-direction: column; gap: 6px; text-align: center; color: #8892A4; }
          .footer-tagline { color: #8892A4; }
          .footer-tagline em { color: #C0C8D8; }
        }
        @media (max-width: 560px) {
          .hero-actions { flex-direction: column; }
          .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
          .campus-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .campus-card { padding: 18px; }
        }
        @media (max-width: 768px) {
          .how-section { padding-bottom: 36px; }
          .campus-section { padding-top: 36px; }
          .hero-title { font-size: clamp(42px, 11vw, 56px); }
          .scene-floor { display: none; }
        }
        @media (max-width: 380px) {
          .campus-grid { grid-template-columns: 1fr; }
          .campus-card { padding: 16px; }
        }
      `}</style>

      {/* ══════ BACKGROUND SCENE ══════ */}
      <div className="scene" aria-hidden="true">
        <div className="scene-base" />
        <div className="scene-grid" />
        <div className="scene-floor" />
        <div className="scene-orb-1" />
        <div className="scene-orb-2" />
        <div className="scene-orb-3" />
        <div className="scene-vignette" />
      </div>

      {/* ══════ DRAWER ══════ */}
      <div className={`drawer-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className={`drawer${menuOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-brand">CampusThrift</span>
          <button className="drawer-close" onClick={() => setMenuOpen(false)}>&#x2715;</button>
        </div>
        <div className="drawer-links">
          {[
            { label: 'Home 🏠', href: '/' },
            { label: 'Browse', href: '/campuses' },
            { label: 'Sell an item 💸', href: '/auth?redirect=/sell' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ].map(link => (
            <button key={link.href} className="drawer-link" onClick={() => { setMenuOpen(false); router.push(link.href) }}>
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════ NAV ══════ */}
      <nav className="nav">
        <div className="nav-brand">
          CampusThrift
          <span className="nav-brand-badge">beta</span>
        </div>
        <div className="nav-right">
          {isSignedIn
            ? <button className="nav-btn-fill" onClick={() => router.push('/campuses')}>Browse</button>
            : <button className="nav-btn-ghost nav-desktop-only" onClick={() => router.push('/auth')}>Sign In</button>
          }
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            <span className={`hero-title-text${titleVisible ? '' : ' hidden'}`}>
              {titleIdx === 0 && <>Your campus <span className="grad">thrift store</span>, now<br />online.</>}
              {titleIdx === 1 && <>Your campus <span className="grad">thrift store</span>, without the store.</>}
            </span>
          </h1>

          <p className="hero-sub">
            Everything you no longer need — sold to someone on your campus who does. Textbooks, gadgets, clothes and more.
          </p>

          <div className="hero-eyebrow">
            <span className="coin">💸</span>
            <span className="coin">🪙</span>
            <span className="coin">💰</span>
            <span className="coin">💵</span>
            <span className="coin">💸</span>
            <span className="coin">🪙</span>
            <span className="coin">💴</span>
            <div className="eyebrow-dot">
              <svg viewBox="0 0 10 10"><path d="M2 5L4 7L8 3" stroke="#1A1200" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </div>
            <span className="eyebrow-text">Campus-only · Zero fees · WhatsApp direct</span>
          </div>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => {
              document.getElementById('campuses')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Browse listings
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7h10M7 2l5 5-5 5"/>
              </svg>
            </button>
            <button ref={listBtnRef} className="btn-secondary" onMouseEnter={startMoney} onMouseLeave={stopMoney} onTouchStart={startMoney} onTouchEnd={stopMoney} onTouchCancel={stopMoney} onClick={() => {
                stopMoney()
                document.querySelectorAll('.money-particle').forEach(el => el.remove())
                router.push(isSignedIn ? '/sell' : '/auth?redirect=/sell')
              }}>
              List an item →
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="mockup-cards-wrap">

            {/* Card 1 — Jacket, top-left */}
            <div className="mockup-card">
              <div className="mock-img">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7B5CF0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l4-1 4 3 4-3 4 1v5l-2 1v10H6V10L4 9V4z"/>
                  <path d="M8 3v4M16 3v4"/>
                  <path d="M4 9c0 0 2 1 4 0M20 9c0 0-2 1-4 0"/>
                </svg>
              </div>
              <span className="mock-tag">CLOTHING</span>
              <div className="mock-title">H&amp;M Men's Coated Racer Jacket</div>
              <div className="mock-price">₹1,199 <span>· &lt;6 months</span></div>
              <div className="mock-meta">
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Aditya K.</span>
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>2h ago</span>
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>MAHE Bengaluru</span>
              </div>
            </div>

            {/* Card 2 — Microeconomics, middle-right */}
            <div className="mockup-card-2">
              <div className="mock-img">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/>
                </svg>
              </div>
              <span className="mock-tag" style={{background:'rgba(255,45,155,0.08)',color:'#FF2D9B',borderColor:'rgba(255,45,155,0.2)'}}>BOOKS</span>
              <div className="mock-title">Microeconomics 9e Pearson</div>
              <div className="mock-price">₹500 <span>· barely used ngl</span></div>
              <div className="mock-meta">
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Anant M.</span>
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>1h ago</span>
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>MAHE Bengaluru</span>
              </div>
            </div>

            {/* Card 3 — Calculator, bottom-left */}
            <div className="mockup-card-3">
              <div className="mock-img">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <rect x="7" y="5" width="10" height="4" rx="1" fill="rgba(0,212,255,0.15)"/>
                  <rect x="7" y="12" width="2" height="2" rx="0.5" fill="#00D4FF"/>
                  <rect x="11" y="12" width="2" height="2" rx="0.5" fill="#00D4FF"/>
                  <rect x="15" y="12" width="2" height="2" rx="0.5" fill="#00D4FF"/>
                  <rect x="7" y="16" width="2" height="2" rx="0.5" fill="#00D4FF"/>
                  <rect x="11" y="16" width="2" height="2" rx="0.5" fill="#00D4FF"/>
                  <rect x="15" y="16" width="6" height="2" rx="0.5" fill="rgba(0,212,255,0.4)"/>
                </svg>
              </div>
              <span className="mock-tag">STATIONERY</span>
              <div className="mock-title">Casio Calculator</div>
              <div className="mock-price">₹220 <span>· 6+ months old</span></div>
              <div className="mock-meta">
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Priya M.</span>
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>6h ago</span>
                <span className="mock-meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>MAHE Bengaluru</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════ TICKER ══════ */}
      <div className="ticker-wrap" style={{ marginTop: '-8px' }}>
        <div className="ticker-track">
          {TICKER_ITEMS.map((item, i) => (
            <div className="ticker-item" key={i}>
              <span className="ticker-dot" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="how-section">
        <div className="section-header reveal">
          <div className="section-label">How it works</div>
          <h2 className="section-title">
            4 steps.<br />
            <span className="accent">No cap.</span>
          </h2>
          <p className="section-sub">
            We built this so fast you could sell your old laptop before your prof finishes uploading slides.
          </p>
        </div>

        <div className="steps-list" ref={stepsRef}>
          {STEPS.map((step, i) => (
            <div className={`step-item reveal reveal-delay-${i + 1}`} key={i}>
              <div className="step-number">{step.num}</div>
              <div className="step-content">
                <div className="step-icon-wrap">{step.icon}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ CAMPUSES ══════ */}
      <section className="campus-section" id="campuses" ref={campusRef}>
        <div className="campus-header">
          <div>
            <div className="section-label">Campuses</div>
            <h2 className="section-title" style={{ fontSize: '34px' }}>
              Where do <span className="accent-2">you</span> study?
            </h2>
          </div>
        </div>

        <div className="campus-grid">
          {campuses.map((campus, i) => (
            <div
              key={campus.slug}
              className="campus-card available"
              onClick={() => router.push(`/campus/${campus.slug}`)}
            >
              <div className="campus-card-top">
                <div className="campus-icon-box">🎓</div>
                <div className="live-badge"><div className="live-dot" />LIVE</div>
              </div>
              <div className="campus-name">{campus.name}</div>
              <div className="campus-location">{campus.location}</div>
              <div className="campus-cta">
                browse →
                <svg viewBox="0 0 14 14" strokeWidth="2"><path d="M2 7h10M7 2l5 5-5 5"/></svg>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            onClick={() => router.push('/campuses')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 28px', borderRadius: '100px',
              border: '1px solid rgba(123,92,240,0.25)', background: 'transparent',
              fontSize: '13px', fontWeight: 600, color: '#5A6480',
              cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.04em', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,212,255,0.4)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#00D4FF'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(123,92,240,0.25)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#5A6480'
            }}
          >
            view all campuses →
          </button>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand-section">
            <div className="footer-brand">CampusThrift</div>
            <p className="footer-tagline">
              The campus marketplace that actually <em>gets it</em>.<br />
              Buy & sell smarter. Your wallet said thank you.
            </p>
            <div className="footer-badge">✓ ZERO FEES. ALWAYS. FR.</div>
          </div>
          <div className="footer-cols-row">
            <div className="footer-links-col">
              <div className="footer-col-heading">Product</div>
              <a href="#">Browse listings</a>
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