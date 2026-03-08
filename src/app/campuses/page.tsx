'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Footer from '@/components/Footer'

export default function CampusesPage() {
  const router = useRouter()
  const [campuses, setCampuses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('campuses').select('id, name, slug, location').order('name')
      .then(({ data }) => { if (data) setCampuses(data); setLoading(false) })
  }, [])

  const filtered = campuses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060F; font-family: 'Space Grotesk', sans-serif; color: #E8EEFF; }

        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          background: rgba(6,6,15,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(123,92,240,0.18);
          position: sticky; top: 0; z-index: 50;
        }
        .nav-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 20px; color: #E8EEFF;
          letter-spacing: -0.02em; cursor: pointer;
        }

        .page-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 48px 100px;
        }

        .page-label {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #00D4FF;
          margin-bottom: 10px;
          font-family: 'IBM Plex Mono', monospace;
          padding-left: 16px;
          border-left: 2px solid #00D4FF;
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 40px; color: #E8EEFF;
          margin-bottom: 8px; letter-spacing: -0.02em;
        }

        .page-sub {
          font-size: 15px; font-weight: 300;
          color: #8892A4;
          margin-bottom: 48px;
        }

        .campus-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
          gap: 16px;
        }

        .campus-card {
          border: 1px solid rgba(123,92,240,0.18);
          border-radius: 16px;
          padding: 24px;
          background: #111125;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .campus-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #00D4FF, #7B5CF0, transparent);
          opacity: 0; transition: opacity 0.2s;
        }

        .campus-card.available { cursor: pointer; }

        .campus-card.available:hover {
          border-color: rgba(123,92,240,0.4);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .campus-card.available:hover::before { opacity: 1; }

        .campus-card.unavailable {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .campus-icon {
          width: 46px; height: 46px;
          background: rgba(123,92,240,0.1);
          border: 1px solid rgba(123,92,240,0.2);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }

        .live-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.18);
          border-radius: 100px;
          font-size: 10px; font-weight: 500;
          color: #00D4FF;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        .live-dot {
          width: 6px; height: 6px;
          background: #00D4FF;
          border-radius: 50%;
          animation: livePulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(0,212,255,0.8);
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }

        .soon-badge {
          padding: 4px 10px;
          background: rgba(30,32,64,0.6);
          border-radius: 100px;
          font-size: 10px; font-weight: 400;
          color: #5A6480;
          border: 1px solid rgba(123,92,240,0.18);
          font-family: 'IBM Plex Mono', monospace;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        .campus-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px; color: #E8EEFF;
          margin-bottom: 4px;
        }

        .campus-location {
          font-size: 12px; color: #5A6480;
          font-weight: 400;
        }

        .campus-arrow {
          margin-top: 16px;
          font-size: 12px;
          color: #7B5CF0;
          font-weight: 500;
          opacity: 0;
          transition: all 0.15s;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.04em;
        }

        .campus-card.available:hover .campus-arrow { opacity: 1; color: #00D4FF; transform: translateX(4px); }

        .search-wrap {
          position: relative;
          margin-bottom: 32px;
        }
        .search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #5A6480; pointer-events: none;
        }
        .search-input {
          width: 100%; padding: 13px 14px 13px 42px;
          background: #111125; border: 1px solid rgba(123,92,240,0.18);
          border-radius: 12px; font-size: 14px;
          font-family: 'Space Grotesk', sans-serif; color: #E8EEFF;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.1); }
        .search-input::placeholder { color: #5A6480; }

        .no-results {
          text-align: center; padding: 48px 0;
          font-size: 14px; color: #5A6480;
          font-family: 'IBM Plex Mono', monospace;
        }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .page-wrap { padding: 36px 20px 80px; }
          .page-title { font-size: clamp(26px, 7vw, 40px); }
          .campus-card { padding: 18px; }
        }
        @media (max-width: 480px) {
          .nav { padding: 14px 16px; }
          .page-wrap { padding: 28px 16px 60px; }
          .campus-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .campus-card { padding: 14px; }
          .campus-name { font-size: 15px; }
          .search-input { font-size: 16px; }
        }
        @media (max-width: 360px) {
          .campus-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-brand" onClick={() => router.push('/')}>
          CampusThrift
        </div>
      </nav>

      {/* CONTENT */}
      <div className="page-wrap">
        <div className="page-label">Step 1 of 2</div>
        <h1 className="page-title">Select your campus</h1>
        <p className="page-sub">Select your college campus to browse listings or sell an item.</p>

        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="5"/><path d="M12 12l2.5 2.5"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search your college..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="campus-grid">
          {!loading && filtered.length === 0 && search.length > 0 && <div className="no-results">No colleges found for &quot;{search}&quot;</div>}
          {filtered.map(campus => (
            <div
              key={campus.slug}
              className="campus-card available"
              onClick={() => router.push(`/campus/${campus.slug}`)}
            >
              <div className="card-top">
                <div className="campus-icon">🎓</div>
                <div className="live-badge"><div className="live-dot" />Live</div>
              </div>
              <div className="campus-name">{campus.name}</div>
              <div className="campus-location">{campus.location}</div>
              <div className="campus-arrow">Browse listings →</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}