'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

const CONDITION_LABELS: Record<string, string> = {
  new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor',
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUser(data.user)
      fetchMyListings(data.user.id)
    })
  }, [])

  async function fetchMyListings(userId: string) {
    const { data } = await supabase
      .from('listings')
      .select('*, categories(name)')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })
    setListings(data || [])
    setLoading(false)
  }

  async function markAsSold(id: string) {
    setActionId(id)
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l))
    setActionId(null)
  }

  async function removeListing(id: string) {
    if (!confirm('Remove this listing? This cannot be undone.')) return
    setActionId(id)
    await supabase.from('listings').update({ status: 'removed' }).eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    setActionId(null)
  }

  async function reactivate(id: string) {
    setActionId(id)
    await supabase.from('listings').update({ status: 'active' }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'active' } : l))
    setActionId(null)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'just now'
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'LIVE', color: '#00D4FF', bg: 'rgba(0,212,255,0.1)' },
    sold: { label: 'SOLD', color: '#7B5CF0', bg: 'rgba(123,92,240,0.1)' },
    reserved: { label: 'RESERVED', color: '#FF9F40', bg: 'rgba(255,159,64,0.1)' },
    removed: { label: 'REMOVED', color: '#5A6480', bg: 'rgba(90,100,128,0.1)' },
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060F; font-family: 'Space Grotesk', sans-serif; color: #E8EEFF; }

        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(6,6,15,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(123,92,240,0.18);
          padding: 0 40px; height: 60px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-left { display: flex; align-items: center; gap: 12px; }
        .back-btn {
          background: none; border: none; cursor: pointer;
          color: #8892A4; font-size: 20px; padding: 4px 8px;
          border-radius: 6px; transition: all 0.15s;
        }
        .back-btn:hover { color: #E8EEFF; background: rgba(123,92,240,0.08); }
        .brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 19px; color: #E8EEFF;
          letter-spacing: -0.02em;
        }
        .new-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s;
          box-shadow: 0 0 16px rgba(123,92,240,0.3);
        }
        .new-btn:hover { box-shadow: 0 0 24px rgba(123,92,240,0.5); transform: translateY(-1px); }

        .container { max-width: 720px; margin: 0 auto; padding: 48px 40px 80px; }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 32px; color: #E8EEFF; margin-bottom: 6px; letter-spacing: -0.02em;
        }
        .page-sub { font-size: 14px; color: #8892A4; font-weight: 300; margin-bottom: 36px; }

        .listing-item {
          background: #111125; border-radius: 14px;
          border: 1px solid rgba(123,92,240,0.18);
          padding: 20px 24px;
          display: flex; align-items: flex-start;
          gap: 20px; margin-bottom: 14px;
          transition: border-color 0.15s;
        }
        .listing-item:hover { border-color: rgba(123,92,240,0.35); }
        .listing-item.dimmed { opacity: 0.4; }

        .listing-emoji {
          width: 52px; height: 52px; flex-shrink: 0;
          background: rgba(123,92,240,0.08); border: 1px solid rgba(123,92,240,0.15);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
        }

        .listing-info { flex: 1; min-width: 0; }

        .listing-title {
          font-size: 15px; font-weight: 500; color: #E8EEFF;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 6px;
        }

        .listing-meta {
          display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap;
        }

        .listing-price {
          font-family: 'Syne', sans-serif;
          font-size: 16px; color: #00D4FF; font-weight: 700;
        }

        .status-badge {
          padding: 2px 8px; border-radius: 100px;
          font-size: 10px; font-weight: 500;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.06em;
        }

        .cond-text { font-size: 12px; color: #5A6480; font-weight: 400; }
        .time-text { font-size: 12px; color: #5A6480; font-weight: 400; font-family: 'IBM Plex Mono', monospace; }

        .listing-actions {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
          flex-wrap: wrap; justify-content: flex-end;
        }

        .action-btn {
          padding: 10px 14px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer; border: none;
          transition: all 0.15s; white-space: nowrap; min-height: 40px;
        }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-sold { background: rgba(0,212,255,0.08); color: #00D4FF; border: 1px solid rgba(0,212,255,0.2); }
        .btn-sold:hover:not(:disabled) { background: rgba(0,212,255,0.15); }

        .btn-remove { background: rgba(255,45,155,0.08); color: #FF2D9B; border: 1px solid rgba(255,45,155,0.2); }
        .btn-remove:hover:not(:disabled) { background: rgba(255,45,155,0.15); }

        .btn-reactivate { background: rgba(123,92,240,0.08); color: #7B5CF0; border: 1px solid rgba(123,92,240,0.2); }
        .btn-reactivate:hover:not(:disabled) { background: rgba(123,92,240,0.15); }

        .empty-state {
          text-align: center; padding: 80px 20px;
          color: #5A6480;
        }
        .empty-state .e { font-size: 48px; margin-bottom: 16px; }
        .empty-state h3 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #E8EEFF; margin-bottom: 8px; }
        .empty-state p { font-size: 14px; font-weight: 300; margin-bottom: 24px; color: #8892A4; }

        .cta-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s;
          box-shadow: 0 0 20px rgba(123,92,240,0.3);
        }
        .cta-btn:hover { box-shadow: 0 0 30px rgba(123,92,240,0.5); transform: translateY(-1px); }

        .spinner {
          width: 28px; height: 28px;
          border: 3px solid rgba(123,92,240,0.2); border-top-color: #7B5CF0;
          border-radius: 50%; animation: spin 0.8s linear infinite; margin: 60px auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .navbar { padding-left: 16px; padding-right: 16px; }
          .container { padding-left: 16px; padding-right: 16px; padding-top: 28px; }
          .listing-item { flex-wrap: wrap; padding: 16px; }
          .listing-actions { width: 100%; justify-content: flex-start; }
          .page-title { font-size: clamp(24px, 7vw, 32px); }
        }
        @media (max-width: 400px) {
          .navbar { padding-left: 12px; padding-right: 12px; }
          .container { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>

      <nav className="navbar">
        <div className="nav-left">
          <button className="back-btn" onClick={() => router.push('/campus/mahe-blr')}>←</button>
          <div className="brand">CampusThrift</div>
        </div>
        <button className="new-btn" onClick={() => router.push('/sell')}>+ New listing</button>
      </nav>

      <div className="container">
        <div className="page-title">My Listings.</div>
        <div className="page-sub">Manage your active, sold, and removed listings.</div>

        {loading ? (
          <div className="spinner" />
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="e">📦</div>
            <h3>No listings yet</h3>
            <p>Post your first item — it takes under 2 minutes.</p>
            <button className="cta-btn" onClick={() => router.push('/sell')}>List something →</button>
          </div>
        ) : (
          listings.map(l => {
            const isFree = l.price === 0 || l.is_free
            const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.active
            const catEmoji: Record<string, string> = {
              textbooks: '📚', electronics: '💻', clothing: '👕',
              furniture: '🪑', cycles: '🚲', notes: '📝', sports: '🏸', misc: '📦',
            }
            const emoji = catEmoji[(l.categories?.name || '').toLowerCase()] || '🛍️'
            const isLoading = actionId === l.id

            return (
              <div key={l.id} className={`listing-item ${l.status !== 'active' ? 'dimmed' : ''}`}>
                <div className="listing-emoji">{emoji}</div>
                <div className="listing-info">
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-meta">
                    <span className="listing-price">
                      {isFree ? 'Free' : `₹${Number(l.price).toLocaleString('en-IN')}`}
                    </span>
                    <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    <span className="cond-text">{CONDITION_LABELS[l.condition] || l.condition}</span>
                    <span className="time-text">{timeAgo(l.created_at)}</span>
                  </div>
                </div>
                <div className="listing-actions">
                  {l.status === 'active' && (
                    <>
                      <button className="action-btn btn-sold" disabled={isLoading} onClick={() => markAsSold(l.id)}>
                        {isLoading ? '...' : '✓ Mark Sold'}
                      </button>
                      <button className="action-btn btn-remove" disabled={isLoading} onClick={() => removeListing(l.id)}>
                        {isLoading ? '...' : 'Remove'}
                      </button>
                    </>
                  )}
                  {l.status === 'sold' && (
                    <button className="action-btn btn-reactivate" disabled={isLoading} onClick={() => reactivate(l.id)}>
                      {isLoading ? '...' : 'Relist'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
      <Footer />
    </>
  )
}