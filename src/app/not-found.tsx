'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const EXCUSES = [
  "your WiFi ate it",
  "someone sold it already",
  "it's in the library. locked.",
  "a senior ragged it out of existence",
  "it failed its backlog",
  "the hostel warden confiscated it",
  "it's bunking right now",
  "out of scope. literally.",
]

export default function NotFound() {
  const router = useRouter()
  const [excuse, setExcuse] = useState('')
  const [clicks, setClicks] = useState(0)

  useEffect(() => {
    setExcuse(EXCUSES[Math.floor(Math.random() * EXCUSES.length)])
  }, [])

  function reroll() {
    setClicks(c => c + 1)
    setExcuse(EXCUSES[Math.floor(Math.random() * EXCUSES.length)])
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
          background: #06060F;
          font-family: 'Space Grotesk', sans-serif;
          color: #E8EEFF;
          overflow: hidden;
        }

        .scene {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
        }
        .orb-1 {
          position: absolute; width: 500px; height: 500px;
          top: -120px; left: -120px;
          background: radial-gradient(circle, rgba(123,92,240,0.18) 0%, transparent 65%);
          filter: blur(70px);
        }
        .orb-2 {
          position: absolute; width: 400px; height: 400px;
          bottom: -80px; right: -80px;
          background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 65%);
          filter: blur(60px);
        }
        .orb-3 {
          position: absolute; width: 300px; height: 300px;
          top: 40%; left: 60%;
          background: radial-gradient(circle, rgba(255,45,155,0.08) 0%, transparent 65%);
          filter: blur(50px);
        }

        .page {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 24px; text-align: center;
        }

        .code-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #FF2D9B;
          background: rgba(255,45,155,0.08);
          border: 1px solid rgba(255,45,155,0.2);
          padding: 5px 14px; border-radius: 100px;
          margin-bottom: 24px;
          display: inline-block;
        }

        .big-number {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(96px, 22vw, 180px);
          line-height: 0.9;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #7B5CF0 0%, #00D4FF 50%, #FF2D9B 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          user-select: none;
        }

        .headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(20px, 5vw, 32px);
          color: #E8EEFF;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .excuse-wrap {
          display: flex; align-items: center; gap: 10px;
          justify-content: center; margin-bottom: 32px; flex-wrap: wrap;
        }

        .excuse-label {
          font-size: 14px; color: #8892A4; font-weight: 400;
        }

        .excuse-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px; font-weight: 500;
          color: #00D4FF;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.2);
          padding: 5px 12px; border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .excuse-text:hover {
          background: rgba(0,212,255,0.15);
          border-color: rgba(0,212,255,0.4);
        }
        .excuse-text:active { transform: scale(0.97); }

        .reroll-hint {
          font-size: 10px; color: #5A6480;
          font-family: 'IBM Plex Mono', monospace;
          margin-top: -24px; margin-bottom: 32px;
          letter-spacing: 0.04em;
          transition: opacity 0.3s;
        }

        .actions {
          display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
        }

        .btn-home {
          padding: 13px 28px;
          background: linear-gradient(135deg, #7B5CF0, #5B3FD0);
          color: white; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 0 24px rgba(123,92,240,0.3);
          display: flex; align-items: center; gap: 8px;
        }
        .btn-home:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 36px rgba(123,92,240,0.5);
        }

        .btn-back {
          padding: 13px 28px;
          background: transparent; color: #8892A4;
          border: 1px solid rgba(123,92,240,0.25); border-radius: 10px;
          font-size: 14px; font-weight: 500;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-back:hover {
          border-color: #7B5CF0; color: #E8EEFF;
        }

        .footer-note {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          font-size: 11px; color: #2A2A4A;
          font-family: 'IBM Plex Mono', monospace;
          white-space: nowrap;
          transition: color 0.3s;
        }
        .footer-note:hover { color: #5A6480; }

        @media (max-width: 480px) {
          .actions { flex-direction: column; width: 100%; max-width: 280px; }
          .btn-home, .btn-back { width: 100%; justify-content: center; }
          .excuse-wrap { flex-direction: column; gap: 6px; }
        }
      `}</style>

      <div className="scene" aria-hidden="true">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="orb-3" />
      </div>

      <div className="page">
        <div className="code-tag">404 · page not found</div>

        <div className="big-number" onClick={reroll}>404</div>

        <h1 className="headline">
          bro where is this page?
        </h1>

        <div className="excuse-wrap">
          <span className="excuse-label">probably because</span>
          <span className="excuse-text" onClick={reroll} title="tap for another excuse">
            {excuse}
          </span>
        </div>

        <p className="reroll-hint" style={{ opacity: clicks === 0 ? 1 : 0.6 }}>
          {clicks === 0 ? '↑ tap for another excuse' : `${clicks} excuse${clicks !== 1 ? 's' : ''} generated`}
        </p>

        <div className="actions">
          <button className="btn-home" onClick={() => router.push('/')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 7l6-6 6 6M2 6v7h3v-4h4v4h3V6"/>
            </svg>
            Take me home
          </button>
          <button className="btn-back" onClick={() => router.back()}>
            ← Go back
          </button>
        </div>
      </div>

      <div className="footer-note">campusthrift · you weren&apos;t supposed to be here</div>
    </>
  )
}
