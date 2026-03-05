'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

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
      if (!data.user) { router.push('/login'); return }
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
    active: { label: 'Active', color: '#166534', bg: '#DCFCE7' },
    sold: { label: 'Sold', color: '#1e40af', bg: '#DBEAFE' },
    reserved: { label: 'Reserved', color: '#92400e', bg: '#FEF3C7' },
    removed: { label: 'Removed', color: '#6b7280', bg: '#F3F4F6' },
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF7F2; font-family: 'DM Sans', sans-serif; }

        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: #FAF7F2ee; backdrop-filter: blur(12px);
          border-bottom: 1px solid #E7E0D8;
          padding: 0 40px; height: 60px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-left { display: flex; align-items: center; gap: 12px; }
        .back-btn {
          background: none; border: none; cursor: pointer;
          color: #78716C; font-size: 20px; padding: 4px 8px;
          border-radius: 6px; transition: background 0.15s;
        }
        .back-btn:hover { background: #EFEBE4; }
        .brand {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Playfair Display', serif; font-size: 19px; color: #1C1917;
        }
        .dot { width: 8px; height: 8px; background: #C4622D; border-radius: 50%; }
        .new-btn {
          padding: 8px 16px; background: #1C1917; color: #FAF7F2;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s;
        }
        .new-btn:hover { background: #C4622D; }

        .container { max-width: 720px; margin: 0 auto; padding: 48px 40px 80px; }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px; color: #1C1917; margin-bottom: 6px;
        }
        .page-sub { font-size: 14px; color: #A8A29E; font-weight: 300; margin-bottom: 36px; }

        .listing-item {
          background: white; border-radius: 14px;
          border: 1px solid #E7E0D8;
          padding: 20px 24px;
          display: flex; align-items: flex-start;
          gap: 20px; margin-bottom: 14px;
          transition: border-color 0.15s;
        }
        .listing-item:hover { border-color: #C4622D20; }
        .listing-item.dimmed { opacity: 0.5; }

        .listing-emoji {
          width: 52px; height: 52px; flex-shrink: 0;
          background: #EFEBE4; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
        }

        .listing-info { flex: 1; min-width: 0; }

        .listing-title {
          font-size: 15px; font-weight: 500; color: #1C1917;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 6px;
        }

        .listing-meta {
          display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap;
        }

        .listing-price {
          font-family: 'Playfair Display', serif;
          font-size: 16px; color: #1C1917;
        }

        .status-badge {
          padding: 2px 8px; border-radius: 100px;
          font-size: 11px; font-weight: 600;
        }

        .cond-text { font-size: 12px; color: #A8A29E; font-weight: 300; }
        .time-text { font-size: 12px; color: #C7BFB8; font-weight: 300; }

        .listing-actions {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
          flex-wrap: wrap; justify-content: flex-end;
        }

        .action-btn {
          padding: 7px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; border: none;
          transition: all 0.15s; white-space: nowrap;
        }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-sold { background: #DBEAFE; color: #1e40af; }
        .btn-sold:hover:not(:disabled) { background: #1e40af; color: white; }

        .btn-remove { background: #FEE2E2; color: #991B1B; }
        .btn-remove:hover:not(:disabled) { background: #991B1B; color: white; }

        .btn-reactivate { background: #DCFCE7; color: #166534; }
        .btn-reactivate:hover:not(:disabled) { background: #166534; color: white; }

        .empty-state {
          text-align: center; padding: 80px 20px;
          color: #A8A29E;
        }
        .empty-state .e { font-size: 48px; margin-bottom: 16px; }
        .empty-state h3 { font-size: 18px; color: #57534E; margin-bottom: 8px; }
        .empty-state p { font-size: 14px; font-weight: 300; margin-bottom: 24px; }

        .cta-btn {
          padding: 12px 24px; background: #1C1917; color: #FAF7F2;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s;
        }
        .cta-btn:hover { background: #C4622D; }

        .spinner {
          width: 28px; height: 28px;
          border: 3px solid #E7E0D8; border-top-color: #C4622D;
          border-radius: 50%; animation: spin 0.8s linear infinite; margin: 60px auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .navbar, .container { padding-left: 16px; padding-right: 16px; }
          .listing-item { flex-wrap: wrap; }
          .listing-actions { width: 100%; }
        }
      `}</style>

      <nav className="navbar">
        <div className="nav-left">
          <button className="back-btn" onClick={() => router.push('/campus/mahe-blr')}>←</button>
          <div className="brand"><div className="dot" />CampusThrift</div>
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
    </>
  )
}