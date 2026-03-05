'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Tag, LogOut, User, Plus } from 'lucide-react'

const CATEGORIES = ['All', 'Clothes', 'Food', 'Books', 'Others']

const CATEGORY_COLORS: Record<string, string> = {
  Clothes: '#FEF3C7|#92400E',
  Food: '#FCE7F3|#9D174D',
  Books: '#DBEAFE|#1E40AF',
  Others: '#F3F4F6|#374151',
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: '1.5px solid #E7E0D8', overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}>
      <div style={{ height: 200, background: '#F5F0EB' }} />
      <div style={{ padding: 16 }}>
        <div style={{ height: 14, background: '#F5F0EB', borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 14, background: '#F5F0EB', borderRadius: 8, width: '60%', marginBottom: 12 }} />
        <div style={{ height: 20, background: '#F5F0EB', borderRadius: 8, width: '40%' }} />
      </div>
    </div>
  )
}

export default function CampusBrowsePage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const supabase = createClient()

  const [listings, setListings] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [campusName, setCampusName] = useState('')

  useEffect(() => {
    loadData()
  }, [slug])

  useEffect(() => {
    filterListings()
  }, [search, category, listings])

  async function loadData() {
    setLoading(true)

    // Get campus
    const { data: campus } = await supabase
      .from('campuses')
      .select('*')
      .eq('slug', slug)
      .single()
    if (campus) setCampusName(campus.name)

    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(prof)
    }

    // Get listings with images
    const { data, error } = await supabase
      .from('listings')
      .select(`*, listing_images(*)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    console.log("listings:", data, error)
    setListings(data || [])
    setLoading(false)
  }

  function filterListings() {
    let result = [...listings]
    if (category !== 'All') result = result.filter(l => l.category === category)
    if (search.trim()) result = result.filter(l =>
      l.title.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function getAvatar() {
    if (profile?.avatar_url) return <img src={profile.avatar_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
    const initials = (profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()
    return (
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: '#C4622D', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 600
      }}>{initials}</div>
    )
  }

  function getMainImage(listing: any) {
    const images = listing.listing_images || []
    const main = images.find((i: any) => i.is_main) || images[0]
    return main?.image_url || null
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF7F2; font-family: 'DM Sans', sans-serif; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px;
          background: white;
          border-bottom: 1px solid #E7E0D8;
          position: sticky; top: 0; z-index: 50;
        }
        .nav-brand {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Playfair Display', serif;
          font-size: 20px; color: #1C1917; cursor: pointer;
        }
        .dot { width: 8px; height: 8px; background: #C4622D; border-radius: 50%; }
        .campus-tag {
          font-size: 12px; font-weight: 500;
          color: #78716C; background: #F5F0EB;
          padding: 4px 10px; border-radius: 100px;
          margin-left: 8px;
        }
        .nav-right { display: flex; align-items: center; gap: 12px; position: relative; }

        .sell-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 18px;
          background: #1C1917; color: white;
          border: none; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .sell-btn:hover { background: #C4622D; }

        .avatar-btn {
          background: none; border: none; cursor: pointer;
          padding: 0; border-radius: 50%;
          transition: opacity 0.15s;
        }
        .avatar-btn:hover { opacity: 0.8; }

        .dropdown {
          position: absolute; top: 48px; right: 0;
          background: white; border: 1.5px solid #E7E0D8;
          border-radius: 12px; padding: 8px;
          min-width: 160px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          z-index: 100;
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border-radius: 8px;
          font-size: 13px; color: #1C1917;
          cursor: pointer; transition: background 0.1s;
          border: none; background: none; width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .dropdown-item:hover { background: #F5F0EB; }
        .dropdown-item.danger { color: #DC2626; }
        .dropdown-item.danger:hover { background: #FEF2F2; }

        .signin-link {
          font-size: 13px; color: #78716C;
          cursor: pointer; font-weight: 500;
          padding: 9px 16px;
          border: 1.5px solid #E7E0D8;
          border-radius: 10px;
          background: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .signin-link:hover { border-color: #C4622D; color: #C4622D; }

        .filters-bar {
          padding: 16px 48px;
          background: white;
          border-bottom: 1px solid #E7E0D8;
          display: flex; flex-direction: column; gap: 12px;
        }

        .search-wrap {
          position: relative; max-width: 600px;
        }
        .search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #A8A29E;
        }
        .search-input {
          width: 100%;
          padding: 11px 16px 11px 42px;
          border: 1.5px solid #E7E0D8;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          background: #FAF7F2;
          color: #1C1917;
          outline: none;
          transition: border-color 0.15s;
        }
        .search-input:focus { border-color: #C4622D; background: white; }
        .search-input::placeholder { color: #A8A29E; }

        .cat-tabs {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .cat-tab {
          padding: 6px 16px;
          border-radius: 100px;
          border: 1.5px solid #E7E0D8;
          background: white;
          font-size: 13px; font-weight: 500;
          color: #78716C;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .cat-tab:hover { border-color: #C4622D; color: #C4622D; }
        .cat-tab.active {
          background: #1C1917; color: white;
          border-color: #1C1917;
        }

        .main { padding: 32px 48px 80px; max-width: 1200px; margin: 0 auto; }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .listing-card {
          background: white;
          border: 1.5px solid #E7E0D8;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }
        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          border-color: #C4622D40;
        }

        .card-img {
          width: 100%; aspect-ratio: 1;
          object-fit: cover;
          background: #F5F0EB;
          display: block;
        }

        .card-img-placeholder {
          width: 100%; aspect-ratio: 1;
          background: #F5F0EB;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; color: #D4C9BF;
        }

        .card-body { padding: 14px 16px 16px; }

        .card-title {
          font-weight: 600; font-size: 14px;
          color: #1C1917;
          margin-bottom: 6px;
          white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-price {
          font-family: 'Playfair Display', serif;
          font-size: 20px; color: #C4622D;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .card-meta {
          display: flex; align-items: center;
          justify-content: space-between;
          flex-wrap: wrap; gap: 6px;
        }

        .cat-badge {
          font-size: 11px; font-weight: 600;
          padding: 3px 8px; border-radius: 100px;
        }

        .card-age {
          font-size: 11px; color: #A8A29E; font-weight: 300;
        }

        .card-time {
          font-size: 11px; color: #A8A29E;
          margin-top: 6px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
        }
        .empty-emoji { font-size: 56px; margin-bottom: 16px; }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px; color: #1C1917; margin-bottom: 8px;
        }
        .empty-sub { font-size: 14px; color: #78716C; font-weight: 300; }

        @media (max-width: 900px) {
          .listings-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .navbar, .filters-bar, .main { padding-left: 16px; padding-right: 16px; }
          .listings-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .campus-tag { display: none; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="nav-brand" onClick={() => router.push('/')}>
            <div className="dot" />
            CampusThrift
          </div>
          {campusName && <span className="campus-tag">{campusName}</span>}
        </div>
        <div className="nav-right">
          <button
            className="sell-btn"
            onClick={() => user ? router.push('/sell') : router.push('/auth?redirect=/sell')}
          >
            <Plus size={15} />
            Sell
          </button>
          {user ? (
            <>
              <button className="avatar-btn" onClick={() => setShowDropdown(!showDropdown)}>
                {getAvatar()}
              </button>
              {showDropdown && (
                <div className="dropdown">
                    <button className="dropdown-item" onClick={() => { router.push('/profile'); setShowDropdown(false) }}>
  <User size={14} /> My Profile
</button>
                  <button className="dropdown-item" onClick={() => { router.push('/my-listings'); setShowDropdown(false) }}>
                    <User size={14} /> My Listings
                  </button>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <button className="signin-link" onClick={() => router.push('/auth')}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* FILTERS */}
      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="cat-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTINGS */}
      <div className="main">
        <div className="listings-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🛍️</div>
              <div className="empty-title">No listings yet</div>
              <div className="empty-sub">
                Be the first to sell something on your campus!
              </div>
            </div>
          ) : (
            filtered.map(listing => {
              const imgUrl = getMainImage(listing)
              const [bg, text] = (CATEGORY_COLORS[listing.category] || '#F3F4F6|#374151').split('|')
              return (
                <div
                  key={listing.id}
                  className="listing-card"
                  onClick={() => router.push(`/listing/${listing.id}`)}
                >
                  {imgUrl
                    ? <img src={imgUrl} className="card-img" alt={listing.title} loading="lazy" />
                    : <div className="card-img-placeholder">📦</div>
                  }
                  <div className="card-body">
                    <div className="card-title">{listing.title}</div>
                    <div className="card-price">₹{Number(listing.price).toLocaleString('en-IN')}</div>
                    <div className="card-meta">
                      <span className="cat-badge" style={{ background: bg, color: text }}>
                        {listing.category}
                      </span>
                      <span className="card-age">{listing.product_age}</span>
                    </div>
                    <div className="card-time">{timeAgo(listing.created_at)}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}