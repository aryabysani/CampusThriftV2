'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  {
    num: '01',
    title: 'Snap a photo',
    desc: 'List anything in under 2 minutes. No forms, no hassle.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:48,height:48}}>
        <rect width="48" height="48" rx="14" fill="#F2E8E1"/>
        <rect x="12" y="16" width="24" height="18" rx="3" stroke="#BF5426" strokeWidth="1.8"/>
        <circle cx="24" cy="25" r="5" stroke="#BF5426" strokeWidth="1.8"/>
        <circle cx="24" cy="25" r="2.5" fill="#BF5426" opacity="0.3"/>
        <path d="M20 16l1.5-3h5L28 16" stroke="#BF5426" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="31" cy="20" r="1.2" fill="#BF5426"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Get discovered',
    desc: 'Students on your campus find it in their feed.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:48,height:48}}>
        <rect width="48" height="48" rx="14" fill="#F2E8E1"/>
        <circle cx="22" cy="22" r="8" stroke="#BF5426" strokeWidth="1.8"/>
        <path d="M28 28l6 6" stroke="#BF5426" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M19 22h6M22 19v6" stroke="#BF5426" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Meet & collect',
    desc: 'Buyers reach you on WhatsApp. Hand it over on campus.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:48,height:48}}>
        <rect width="48" height="48" rx="14" fill="#F2E8E1"/>
        <rect x="11" y="14" width="26" height="20" rx="4" stroke="#BF5426" strokeWidth="1.8"/>
        <path d="M11 20h26" stroke="#BF5426" strokeWidth="1.8"/>
        <circle cx="18" cy="17" r="1.5" fill="#BF5426"/>
        <circle cx="24" cy="17" r="1.5" fill="#BF5426"/>
        <path d="M16 27h8M16 31h5" stroke="#BF5426" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="33" cy="30" r="5" fill="#1A1612"/>
        <path d="M31 30l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const CAMPUSES = [
  { name: 'MAHE Bengaluru', slug: 'mahe-blr', location: 'Bengaluru, Karnataka', available: true },
  { name: 'Nitte Meenakshi Institute of Technology', slug: 'nmit-blr', location: 'Bengaluru, Karnataka', available: false },
  { name: 'B.M.S. College of Engineering', slug: 'bmsce-blr', location: 'Bengaluru, Karnataka', available: false },
  { name: 'MAHE Manipal', slug: 'mahe-manipal', location: 'Manipal, Karnataka', available: false },
]

const TICKER_ITEMS = [
  'Zero platform fees', 'Campus-only listings', 'WhatsApp direct contact',
  'Sell in 2 minutes', 'No middlemen', 'Built for students',
  'Zero platform fees', 'Campus-only listings', 'WhatsApp direct contact',
  'Sell in 2 minutes', 'No middlemen', 'Built for students',
]

export default function LandingPage() {
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const stepsRef = useRef<HTMLDivElement>(null)
  const campusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setIsSignedIn(true)
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --cream: #F8F4EE;
          --ink: #1A1612;
          --ink-muted: #6B6459;
          --ink-faint: #C9C2B8;
          --ember: #BF5426;
          --ember-light: #F2E8E1;
          --border: #E5DDD4;
          --white: #FDFBF8;
        }

        body {
          background: var(--cream);
          font-family: 'Outfit', sans-serif;
          color: var(--ink);
          overflow-x: hidden;
        }

        /* ─── REVEAL ANIMATIONS ─── */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }

        /* ─── NAV ─── */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 56px;
          position: sticky; top: 0; z-index: 100;
          background: #F8F4EEee;
          backdrop-filter: blur(16px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s;
        }
        .nav.scrolled { border-bottom-color: var(--border); }

        .nav-brand {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 21px;
          color: var(--ink);
          letter-spacing: -0.01em;
          display: flex; align-items: center; gap: 7px;
        }
        .brand-mark {
          width: 22px; height: 22px;
          background: var(--ink);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .brand-mark svg { width: 12px; height: 12px; fill: var(--cream); }

        .nav-right { display: flex; align-items: center; gap: 10px; }

        .nav-btn-ghost {
          padding: 8px 18px;
          background: transparent;
          color: var(--ink-muted);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px; font-weight: 400;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }
        .nav-btn-ghost:hover { border-color: var(--ink); color: var(--ink); }

        .nav-btn-fill {
          padding: 8px 18px;
          background: var(--ink);
          color: var(--cream);
          border: none; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: background 0.15s;
        }
        .nav-btn-fill:hover { background: var(--ember); }

        /* ─── HERO ─── */
.hero {
  min-height: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 40px 56px 16px;
  gap: 60px;
          position: relative;
          overflow: hidden;
        }

        .hero-glow {
          position: absolute;
          width: 700px; height: 700px;
          top: -200px; right: -200px;
          background: radial-gradient(circle, #BF542614 0%, transparent 65%);
          pointer-events: none;
        }

        .hero-left { position: relative; z-index: 1; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 12px 5px 5px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 100px;
  margin-bottom: 16px;
          animation: fadeUp 0.6s ease both;
        }
        .eyebrow-dot {
          width: 20px; height: 20px;
          background: var(--ember);
          border-radius: 100px;
          display: flex; align-items: center; justify-content: center;
        }
        .eyebrow-dot svg { width: 10px; height: 10px; fill: white; }
        .eyebrow-text {
          font-size: 12px; font-weight: 500;
          color: var(--ink-muted);
          letter-spacing: 0.02em;
        }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(52px, 5.5vw, 76px);
          line-height: 1.0;
          color: var(--ink);
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-title strong { font-weight: 600; }
        .hero-title em {
          font-style: italic;
          color: var(--ember);
        }

        .hero-sub {
          font-size: 16px;
          font-weight: 300;
          color: var(--ink-muted);
          line-height: 1.75;
          max-width: 420px;
          margin-bottom: 20px;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .btn-primary {
          padding: 14px 28px;
          background: var(--ink);
          color: var(--cream);
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 500;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover {
          background: var(--ember);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(191, 84, 38, 0.25);
        }

        .btn-secondary {
          padding: 14px 28px;
          background: transparent;
          color: var(--ink);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 14px; font-weight: 400;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          border-color: var(--ink);
          transform: translateY(-1px);
        }

        /* ─── HERO RIGHT VISUAL ─── */
        .hero-right {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          animation: fadeUp 0.8s 0.4s ease both;
        }

        .mockup-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
          width: 280px;
          box-shadow: 0 24px 60px rgba(26, 22, 18, 0.1), 0 4px 12px rgba(26, 22, 18, 0.06);
          position: relative;
        }
        .mockup-card-2 {
          position: absolute;
          top: -30px; right: -30px;
          width: 200px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 16px 40px rgba(26, 22, 18, 0.08);
          animation: floatB 4s ease-in-out infinite 1s;
        }
        .mockup-card-3 {
          position: absolute;
          bottom: -20px; left: -20px;
          background: var(--ink);
          border-radius: 14px;
          padding: 14px 18px;
          box-shadow: 0 12px 30px rgba(26, 22, 18, 0.2);
          animation: floatC 4.5s ease-in-out infinite 0.5s;
        }

        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-6px) rotate(-2deg); }
        }

        .mock-img {
          width: 100%; height: 140px;
          background: linear-gradient(135deg, var(--ember-light), #E8D5C5);
          border-radius: 12px;
          margin-bottom: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px;
        }
        .mock-tag {
          display: inline-block;
          padding: 3px 8px;
          background: var(--ember-light);
          color: var(--ember);
          border-radius: 6px;
          font-size: 11px; font-weight: 500;
          margin-bottom: 8px;
        }
        .mock-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600; font-size: 16px;
          color: var(--ink); margin-bottom: 4px;
        }
        .mock-price {
          font-size: 18px; font-weight: 600;
          color: var(--ember);
        }
        .mock-price span { font-size: 12px; font-weight: 300; color: var(--ink-muted); }

        .mock2-label {
          font-size: 11px; color: var(--ink-muted); margin-bottom: 6px;
        }
        .mock2-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600; font-size: 14px; color: var(--ink);
        }
        .mock2-sub { font-size: 11px; color: var(--ink-faint); }

        .mock3-text {
          font-size: 11px; font-weight: 500;
          color: rgba(248, 244, 238, 0.6);
          margin-bottom: 2px;
        }
        .mock3-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 600;
          color: var(--cream);
        }

        /* ─── TICKER ─── */
        .ticker-wrap {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 14px 0;
          overflow: hidden;
          background: var(--white);
        }
        .ticker-track {
          display: flex;
          gap: 0;
          animation: ticker 30s linear infinite;
          width: max-content;
        }
        .ticker-item {
          display: flex; align-items: center; gap: 32px;
          padding: 0 40px;
          font-size: 12px; font-weight: 400;
          color: var(--ink-muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .ticker-dot {
          width: 4px; height: 4px;
          background: var(--ember);
          border-radius: 50%;
          flex-shrink: 0;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ─── HOW IT WORKS ─── */
        .how-section {
          padding: 100px 56px;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 80px;
          align-items: start;
        }

        .section-header { position: sticky; top: 100px; }

        .section-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ember);
          margin-bottom: 16px;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 42px;
          line-height: 1.1;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .section-title strong { font-weight: 600; }

        .section-sub {
          margin-top: 16px;
          font-size: 14px; font-weight: 300;
          color: var(--ink-muted);
          line-height: 1.7;
        }

        .steps-list {
          display: flex; flex-direction: column;
          gap: 0;
        }

        .step-item {
          padding: 36px 0;
          border-bottom: 1px solid var(--border);
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 24px;
          align-items: start;
          cursor: default;
          transition: padding-left 0.3s;
        }
        .step-item:first-child { border-top: 1px solid var(--border); }
        .step-item:hover { padding-left: 12px; }

        .step-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px; font-weight: 400;
          color: var(--ink-faint);
          padding-top: 4px;
          letter-spacing: 0.05em;
        }

        .step-content {}

        .step-icon-wrap {
          margin-bottom: 16px;
        }

        .step-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 24px;
          color: var(--ink);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .step-desc {
          font-size: 14px; font-weight: 300;
          color: var(--ink-muted);
          line-height: 1.65;
        }

        /* ─── FLOW / DARK SECTION ─── */
        .flow-section {
          background: var(--ink);
          padding: 100px 56px;
          position: relative;
          overflow: hidden;
        }
        .flow-section::after {
          content: '';
          position: absolute;
          width: 800px; height: 800px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, #BF542610 0%, transparent 65%);
          pointer-events: none;
        }

        .flow-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative; z-index: 1;
        }

        .flow-label { color: var(--ember); }
        .flow-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 42px;
          color: var(--cream);
          letter-spacing: -0.02em;
          margin-bottom: 60px;
        }
        .flow-title strong { font-weight: 600; }

        .flow-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }

        .flow-step {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 32px 28px;
          position: relative;
          transition: background 0.3s, border-color 0.3s;
        }
        .flow-step:hover {
          background: rgba(191, 84, 38, 0.12);
          border-color: rgba(191, 84, 38, 0.3);
        }

        .flow-step-icon {
          font-size: 28px;
          margin-bottom: 20px;
          display: block;
        }

        .flow-step-arrow {
          position: absolute;
          top: 50%; right: -14px;
          transform: translateY(-50%);
          width: 28px; height: 28px;
          background: var(--ink);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          z-index: 2;
          animation: arrowBounce 2s ease-in-out infinite;
        }
        .flow-step:last-child .flow-step-arrow { display: none; }
        .flow-step-arrow svg { width: 10px; height: 10px; fill: var(--ember); }

        @keyframes arrowBounce {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(3px); }
        }

        .flow-step-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px; font-weight: 400;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .flow-step-title {
          font-size: 15px; font-weight: 500;
          color: rgba(248, 244, 238, 0.9);
          margin-bottom: 4px;
        }

        .flow-step-sub {
          font-size: 12px; font-weight: 300;
          color: rgba(255,255,255,0.3);
          line-height: 1.5;
        }

        /* ─── CAMPUS ─── */
        .campus-section {
          padding: 100px 56px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .campus-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
        }

        .campus-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .campus-card {
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          background: var(--white);
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .campus-card.available {
          cursor: pointer;
        }
        .campus-card.available:hover {
          border-color: var(--ink);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(26, 22, 18, 0.1);
        }
        .campus-card.unavailable {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .campus-card-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 20px;
        }

        .campus-icon-box {
          width: 44px; height: 44px;
          background: var(--ember-light);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }

        .live-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          background: #DCFCE7;
          border-radius: 100px;
          font-size: 11px; font-weight: 500;
          color: #166534;
        }
        .live-dot {
          width: 6px; height: 6px;
          background: #16a34a;
          border-radius: 50%;
          animation: livePulse 1.5s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .soon-badge {
          padding: 4px 10px;
          background: var(--cream);
          border-radius: 100px;
          font-size: 11px; font-weight: 400;
          color: var(--ink-faint);
          border: 1px solid var(--border);
        }

        .campus-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600; font-size: 20px;
          color: var(--ink);
          margin-bottom: 5px;
          letter-spacing: -0.01em;
        }

        .campus-location {
          font-size: 12px; font-weight: 300;
          color: var(--ink-faint);
        }

        .campus-cta {
          margin-top: 20px;
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500;
          color: var(--ember);
          opacity: 0;
          transform: translateX(-6px);
          transition: all 0.2s;
        }
        .campus-card.available:hover .campus-cta {
          opacity: 1;
          transform: translateX(0);
        }
        .campus-cta svg { width: 14px; height: 14px; stroke: var(--ember); fill: none; }

        /* ─── FOOTER ─── */
        .footer {
          background: var(--ink);
          padding: 64px 56px 32px;
          margin-top: 0;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 32px;
        }

        .footer .nav-brand { color: var(--cream); }
        .footer .brand-mark { background: var(--cream); }
        .footer .brand-mark svg path { fill: var(--ink); }

        .footer-tagline {
          font-size: 13px; font-weight: 300;
          color: rgba(248,244,238,0.4);
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .footer-badge {
          display: inline-block;
          padding: 5px 12px;
          background: rgba(191,84,38,0.15);
          border: 1px solid rgba(191,84,38,0.25);
          border-radius: 100px;
          font-size: 11px; font-weight: 500;
          color: #E8956A;
          letter-spacing: 0.02em;
        }

        .footer-col-heading {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(248,244,238,0.3);
          margin-bottom: 16px;
        }

        .footer-links-col {
          display: flex; flex-direction: column;
          gap: 10px;
        }

        .footer-links-col a {
          font-size: 13px; font-weight: 300;
          color: rgba(248,244,238,0.55);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-links-col a:hover { color: var(--cream); }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px; font-weight: 300;
          color: rgba(248,244,238,0.25);
        }

        /* ─── KEYFRAMES ─── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 900px) {
          .nav { padding: 18px 24px; }
          .hero {
            grid-template-columns: 1fr;
            padding: 60px 24px;
            min-height: auto;
            gap: 48px;
          }
          .hero-right { display: none; }
          .how-section {
            grid-template-columns: 1fr;
            padding: 72px 24px;
            gap: 40px;
          }
          .section-header { position: static; }
          .flow-section { padding: 72px 24px; }
          .flow-steps { grid-template-columns: 1fr 1fr; gap: 12px; }
          .flow-step-arrow { display: none; }
          .campus-section { padding: 72px 24px; }
          .campus-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .footer { padding: 48px 24px 28px; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
        }

        @media (max-width: 560px) {
          .flow-steps { grid-template-columns: 1fr; }
          .hero-actions { flex-direction: column; }
          .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="brand-mark">
            <svg viewBox="0 0 12 12">
              <path d="M6 1L11 4V8L6 11L1 8V4L6 1Z"/>
            </svg>
          </div>
          CampusThrift
        </div>
        <div className="nav-right">
          {!isSignedIn && (
            <button className="nav-btn-ghost" onClick={() => router.push('/auth')}>
              Sign In
            </button>
          )}
          <button className="nav-btn-fill" onClick={() =>
            router.push(isSignedIn ? '/campus/mahe-blr' : '/auth?redirect=/sell')
          }>
            {isSignedIn ? 'Browse' : 'Start Selling'}
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-glow" />

        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="eyebrow-dot">
              <svg viewBox="0 0 10 10"><path d="M2 5L4 7L8 3"/></svg>
            </div>
            <span className="eyebrow-text">Campus-only · Zero fees · WhatsApp direct</span>
          </div>

          <h1 className="hero-title">
            Your campus<br />
            <em>thrift store</em>,<br />
            <strong>online.</strong>
          </h1>

          <p className="hero-sub">
            Buy and sell textbooks, electronics, furniture and more —
            with students from your own campus. No middlemen, no commission, no noise.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => {
              document.getElementById('campuses')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Browse listings
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7h10M7 2l5 5-5 5"/>
              </svg>
            </button>
            <button className="btn-secondary" onClick={() => router.push('/auth?redirect=/sell')}>
              List an item
            </button>
          </div>
        </div>

        {/* ─── HERO MOCKUP ─── */}
        <div className="hero-right">
          <div style={{ position: 'relative', padding: '30px' }}>
            <div className="mockup-card">
              <div className="mock-img">📚</div>
              <span className="mock-tag">Books</span>
              <div className="mock-title">Engineering Mathematics Vol. II</div>
              <div className="mock-price">₹320 <span>· 1 year old</span></div>
            </div>
            <div className="mockup-card-2">
              <div className="mock2-label">Listed by</div>
              <div className="mock2-name">Priya K.</div>
              <div className="mock2-sub">MAHE Bangalore · 2h ago</div>
            </div>
            <div className="mockup-card-3">
              <div className="mock3-text">Listings today</div>
              <div className="mock3-val">24 items</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TICKER ─── */}
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

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section">
        <div className="section-header reveal">
          <div className="section-label">Process</div>
          <h2 className="section-title">
            Thrifting<br /><strong>in 3 steps.</strong>
          </h2>
          <p className="section-sub">
            We built this for college students — fast, simple, and nothing you don't need.
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

      {/* ─── FLOW ─── */}
      <section className="flow-section">
        <div className="flow-inner">
          <div className="section-label flow-label">The flow</div>
          <h2 className="flow-title">How a sale <strong>happens.</strong></h2>
          <div className="flow-steps">
            {[
              { icon: '📦', num: 'Step 01', title: 'You list it', sub: 'Takes under 2 minutes' },
              { icon: '👀', num: 'Step 02', title: 'Buyer sees it', sub: 'On their campus feed' },
              { icon: '💬', num: 'Step 03', title: 'DM on WhatsApp', sub: 'Direct, no platform' },
              { icon: '🤝', num: 'Step 04', title: 'Meet & sell', sub: 'Right on campus' },
            ].map((item, i) => (
              <div className="flow-step" key={i}>
                <span className="flow-step-icon">{item.icon}</span>
                <div className="flow-step-num">{item.num}</div>
                <div className="flow-step-title">{item.title}</div>
                <div className="flow-step-sub">{item.sub}</div>
                <div className="flow-step-arrow">
                  <svg viewBox="0 0 10 10"><path d="M2 5h6M5 2l3 3-3 3"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CAMPUSES ─── */}
      <section className="campus-section" id="campuses" ref={campusRef}>
        <div className="campus-header reveal">
          <div>
            <div className="section-label">Campuses</div>
            <h2 className="section-title" style={{ fontSize: '36px' }}>
              Where do <strong>you study?</strong>
            </h2>
          </div>
        </div>

        <div className="campus-grid">
          {CAMPUSES.map((campus, i) => (
            <div
              key={campus.slug}
              className={`campus-card ${campus.available ? 'available' : 'unavailable'} reveal reveal-delay-${Math.min(i + 1, 3)}`}
              onClick={() => campus.available && router.push(`/campus/${campus.slug}`)}
            >
              <div className="campus-card-top">
                <div className="campus-icon-box">🎓</div>
                {campus.available
                  ? <div className="live-badge"><div className="live-dot" />Live</div>
                  : <div className="soon-badge">Coming soon</div>
                }
              </div>
              <div className="campus-name">{campus.name}</div>
              <div className="campus-location">{campus.location}</div>
              {campus.available && (
                <div className="campus-cta">
                  Browse listings
                  <svg viewBox="0 0 14 14" strokeWidth="2">
                    <path d="M2 7h10M7 2l5 5-5 5"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="nav-brand" style={{ fontSize: '19px', marginBottom: '12px' }}>
              <div className="brand-mark">
                <svg viewBox="0 0 12 12"><path d="M6 1L11 4V8L6 11L1 8V4L6 1Z"/></svg>
              </div>
              CampusThrift
            </div>
            <p className="footer-tagline">
              The campus marketplace.<br />Buy & sell smarter, not harder.
            </p>
            <div className="footer-badge">✓ Zero platform fees. Always free.</div>
          </div>

          <div className="footer-links-col">
            <div className="footer-col-heading">Product</div>
            <a href="#">Browse listings</a>
            <a href="/auth?redirect=/sell">Sell an item</a>
            <a href="/campuses">Campuses</a>
          </div>

          <div className="footer-links-col">
            <div className="footer-col-heading">Company</div>
            <a href="#">About</a>
            <a href="#">Contact us</a>
            <a href="#">Instagram</a>
          </div>

          <div className="footer-links-col">
            <div className="footer-col-heading">Legal</div>
            <a href="#">Privacy policy</a>
            <a href="#">Terms of use</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 CampusThrift · campusthrift.store</span>
          <span>Made with ♥ for students in India</span>
        </div>
      </footer>
    </>
  )
}