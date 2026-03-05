'use client'

import { useRouter } from 'next/navigation'
import { Tag } from 'lucide-react'

const CAMPUSES = [
  {
    name: 'MAHE Bangalore',
    slug: 'mahe-blr',
    university: 'Manipal Academy of Higher Education',
    location: 'Bengaluru, Karnataka',
    available: true,
  },
  {
    name: 'TAPMI Manipal',
    slug: 'tapmi-manipal',
    university: 'T.A. Pai Management Institute',
    location: 'Manipal, Karnataka',
    available: false,
  },
  {
    name: 'MIT Manipal',
    slug: 'mit-manipal',
    university: 'Manipal Institute of Technology',
    location: 'Manipal, Karnataka',
    available: false,
  },
  {
    name: 'Manipal University',
    slug: 'mu-manipal',
    university: 'Manipal University',
    location: 'Manipal, Karnataka',
    available: false,
  },
]

export default function CampusesPage() {
  const router = useRouter()

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF7F2; font-family: 'DM Sans', sans-serif; }

        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          background: #FAF7F2;
          border-bottom: 1px solid #E7E0D8;
        }
        .nav-brand {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Playfair Display', serif;
          font-size: 22px; color: #1C1917;
          cursor: pointer;
        }
        .dot { width: 9px; height: 9px; background: #C4622D; border-radius: 50%; }

        .page-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 48px 100px;
        }

        .page-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #C4622D;
          margin-bottom: 10px;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 40px; color: #1C1917;
          margin-bottom: 8px;
        }

        .page-sub {
          font-size: 15px; font-weight: 300;
          color: #78716C;
          margin-bottom: 48px;
        }

        .campus-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .campus-card {
          border: 1.5px solid #E7E0D8;
          border-radius: 16px;
          padding: 24px;
          background: white;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .campus-card.available {
          cursor: pointer;
        }

        .campus-card.available:hover {
          border-color: #C4622D;
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(196, 98, 45, 0.12);
        }

        .campus-card.unavailable {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .campus-icon {
          width: 46px; height: 46px;
          background: #EFEBE4;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }

        .live-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          background: #DCFCE7;
          border-radius: 100px;
          font-size: 11px; font-weight: 600;
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
          background: #F5F5F4;
          border-radius: 100px;
          font-size: 11px; font-weight: 500;
          color: #A8A29E;
        }

        .campus-name {
          font-family: 'Playfair Display', serif;
          font-size: 19px; color: #1C1917;
          margin-bottom: 4px;
        }

        .campus-uni {
          font-size: 11px; color: #A8A29E;
          font-weight: 300;
          margin-bottom: 2px;
        }

        .campus-location {
          font-size: 12px; color: #78716C;
          font-weight: 400;
        }

        .campus-arrow {
          margin-top: 16px;
          font-size: 13px;
          color: #C4622D;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .campus-card.available:hover .campus-arrow { opacity: 1; }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .page-wrap { padding: 40px 20px 80px; }
          .page-title { font-size: 30px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-brand" onClick={() => router.push('/')}>
          <div className="dot" />
          CampusThrift
        </div>
      </nav>

      {/* CONTENT */}
      <div className="page-wrap">
        <div className="page-label">Step 1 of 2</div>
        <h1 className="page-title">Select your campus</h1>
        <p className="page-sub">Only students from your campus can see your listings.</p>

        <div className="campus-grid">
          {CAMPUSES.map(campus => (
            <div
              key={campus.slug}
              className={`campus-card ${campus.available ? 'available' : 'unavailable'}`}
              onClick={() => campus.available && router.push(`/campus/${campus.slug}`)}
            >
              <div className="card-top">
                <div className="campus-icon">🎓</div>
                {campus.available
                  ? <div className="live-badge"><div className="live-dot" />Live</div>
                  : <div className="soon-badge">Coming soon</div>
                }
              </div>
              <div className="campus-name">{campus.name}</div>
              <div className="campus-uni">{campus.university}</div>
              <div className="campus-location">{campus.location}</div>
              {campus.available && <div className="campus-arrow">Browse listings →</div>}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}