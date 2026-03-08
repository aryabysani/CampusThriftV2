'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, LogOut, User, Plus, ChevronDown, Check } from 'lucide-react'
import Footer from '@/components/Footer'

const CATEGORY_COLORS: Record<string, string> = {
  Clothing: 'rgba(123,92,240,0.12)|#7B5CF0',
  'Books/Stationery': 'rgba(0,212,255,0.10)|#00D4FF',
  Footwear: 'rgba(255,45,155,0.10)|#FF2D9B',
  'Small Appliances': 'rgba(0,212,255,0.08)|#00B4D8',
  Foods: 'rgba(255,159,64,0.10)|#FF9F40',
  Other: 'rgba(88,101,120,0.15)|#8892A4',
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  const days = Math.floor(seconds / 86400)
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 month ago'
  return `${months} months ago`
}

const PRODUCT_AGE_LABEL: Record<string, string> = {
  'Not used':              'Brand new',
  'Less than a week':      '< 1 week old',
  'Less than a month':     '< 1 month old',
  'Less than 6 months':    '< 6 months old',
  'More than 6 months':    '6+ months old',
}

function SkeletonCard() {
  return (
    <div style={{
      background: '#111125', borderRadius: 16,
      border: '1px solid rgba(123,92,240,0.18)', overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}>
      <div style={{ aspectRatio: '4/3', background: '#161630' }} />
      <div style={{ padding: 16 }}>
        <div style={{ height: 14, background: '#161630', borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 14, background: '#161630', borderRadius: 8, width: '60%', marginBottom: 12 }} />
        <div style={{ height: 20, background: '#161630', borderRadius: 8, width: '40%' }} />
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
  const [showCampusSwitcher, setShowCampusSwitcher] = useState(false)
  const [campusName, setCampusName] = useState('')
  const [categories, setCategories] = useState<string[]>(['All'])
  const [notFound, setNotFound] = useState(false)

  const LIVE_CAMPUSES = [
    { slug: 'mahe-blr', label: 'MAHE Bengaluru' },
    { slug: 'nmit-blr', label: 'NMIT Bengaluru' },
  ]

  const CAMPUS_SHORT_NAMES: Record<string, string> = {
    'mahe-blr': 'MAHE Bengaluru',
    'nmit-blr': 'NMIT Bengaluru',
  }

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
    if (!campus) { setNotFound(true); setLoading(false); return }
    setCampusName(campus.name)

    // Get categories
    const { data: cats } = await supabase.from('categories').select('name').order('sort_order')
    if (cats) setCategories(['All', ...cats.map((c: any) => c.name)])

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

    // Get listings for this campus only
    const { data } = await supabase
      .from('listings')
      .select(`*, listing_images(*)`)
      .eq('status', 'active')
      .eq('campus_id', campus.id)
      .order('created_at', { ascending: false })

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
        background: 'linear-gradient(135deg, #7B5CF0, #5B3FD0)', color: 'white',
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

  if (notFound) return (
    <div style={{
      minHeight: '100vh', background: '#06060F', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif",
      color: '#E8EEFF', textAlign: 'center', padding: '24px',
    }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🗺️</div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF2D9B', marginBottom: 12,
      }}>404 · not found</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 6vw, 48px)',
        letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.1,
      }}>
        bro where is this place?
      </h1>
      <p style={{ color: '#8892A4', fontSize: 15, maxWidth: 380, lineHeight: 1.7, marginBottom: 32 }}>
        <strong style={{ color: '#C0C8D8' }}>/{slug}</strong> is not a campus on CampusThrift — yet.
        Maybe you typo'd, maybe you're just manifesting. Either way, nothing here.
      </p>
      <button
        onClick={() => router.push('/campuses')}
        style={{
          padding: '12px 28px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #7B5CF0, #5B3FD0)',
          color: 'white', border: 'none', fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 0 20px rgba(123,92,240,0.35)',
        }}
      >
        take me somewhere real →
      </button>
    </div>
  )

  return (
    <>
      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060F; font-family: 'Space Grotesk', sans-serif; color: #E8EEFF; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px;
          background: rgba(6,6,15,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(123,92,240,0.18);
          position: sticky; top: 0; z-index: 50;
        }
        .nav-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 20px; color: #E8EEFF; cursor: pointer;
          letter-spacing: -0.02em;
        }
        .campus-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 500;
          color: #8892A4; background: rgba(123,92,240,0.08);
          padding: 4px 10px; border-radius: 100px;
          margin-left: 8px; cursor: pointer;
          border: 1px solid rgba(123,92,240,0.18); font-family: 'IBM Plex Mono', monospace;
          transition: all 0.15s; position: relative;
          letter-spacing: 0.04em;
        }
        .campus-tag:hover { background: rgba(123,92,240,0.15); color: #E8EEFF; border-color: #7B5CF0; }
        .campus-switcher {
          position: absolute; top: calc(100% + 8px); left: 0;
          background: #0D0D1A; border: 1px solid rgba(123,92,240,0.18);
          border-radius: 12px; padding: 8px;
          min-width: 180px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          z-index: 200;
        }
        .switcher-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: #5A6480;
          padding: 6px 12px 4px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .switcher-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 12px; border-radius: 8px;
          font-size: 13px; color: #8892A4;
          cursor: pointer; transition: all 0.1s;
          border: none; background: none; width: 100%;
          font-family: 'Space Grotesk', sans-serif; text-align: left;
        }
        .switcher-item:hover { background: rgba(123,92,240,0.08); color: #E8EEFF; }
        .switcher-item.active { font-weight: 600; color: #00D4FF; }
        .nav-right { display: flex; align-items: center; gap: 12px; position: relative; }

        .sell-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white;
          border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.15s;
          box-shadow: 0 0 20px rgba(123,92,240,0.3);
        }
        .sell-btn:hover { transform: translateY(-1px); box-shadow: 0 0 28px rgba(123,92,240,0.5); }

        .avatar-btn {
          background: none; border: none; cursor: pointer;
          padding: 0; border-radius: 50%; transition: opacity 0.15s;
        }
        .avatar-btn:hover { opacity: 0.8; }

        .dropdown {
          position: absolute; top: 48px; right: 0;
          background: #0D0D1A; border: 1px solid rgba(123,92,240,0.18);
          border-radius: 12px; padding: 8px; min-width: 160px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5); z-index: 100;
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border-radius: 8px;
          font-size: 13px; color: #8892A4;
          cursor: pointer; transition: all 0.1s;
          border: none; background: none; width: 100%;
          font-family: 'Space Grotesk', sans-serif;
        }
        .dropdown-item:hover { background: rgba(123,92,240,0.08); color: #E8EEFF; }
        .dropdown-item.danger { color: #FF2D9B; }
        .dropdown-item.danger:hover { background: rgba(255,45,155,0.08); }

        .signin-link {
          font-size: 13px; color: #8892A4;
          cursor: pointer; font-weight: 500;
          padding: 9px 16px;
          border: 1px solid rgba(123,92,240,0.18);
          border-radius: 10px; background: none;
          font-family: 'Space Grotesk', sans-serif; transition: all 0.15s;
        }
        .signin-link:hover { border-color: #7B5CF0; color: #E8EEFF; }

        .filters-bar {
          padding: 16px 48px;
          background: rgba(13,13,26,0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(123,92,240,0.18);
          display: flex; flex-direction: column; gap: 12px;
        }

        .search-wrap { position: relative; max-width: 600px; }
        .search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #5A6480;
        }
        .search-input {
          width: 100%; padding: 11px 16px 11px 42px;
          border: 1px solid rgba(123,92,240,0.18);
          border-radius: 12px; font-size: 14px;
          font-family: 'Space Grotesk', sans-serif;
          background: #111125; color: #E8EEFF;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.1); }
        .search-input::placeholder { color: #5A6480; }

        .cat-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .cat-tab {
          padding: 6px 16px; border-radius: 100px;
          border: 1px solid rgba(123,92,240,0.18);
          background: transparent;
          font-size: 12px; font-weight: 500; color: #8892A4;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Space Grotesk', sans-serif;
        }
        .cat-tab:hover { border-color: #7B5CF0; color: #7B5CF0; }
        .cat-tab.active { background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white; border-color: transparent; }

        .main { padding: 32px 48px 80px; max-width: 1200px; margin: 0 auto; }

        .listings-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }

        .listing-card {
          background: #111125; border: 1px solid rgba(123,92,240,0.18);
          border-radius: 14px; overflow: hidden; cursor: pointer; transition: all 0.2s;
          position: relative;
        }
        .listing-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #00D4FF, #7B5CF0, transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .listing-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
          border-color: rgba(123,92,240,0.4);
        }
        .listing-card:hover::before { opacity: 1; }

        .card-img-wrap { position: relative; }

        .card-img {
          width: 100%; aspect-ratio: 4/3; object-fit: cover;
          background: #161630; display: block;
        }

        .card-img-placeholder {
          width: 100%; aspect-ratio: 4/3; background: #161630;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; color: #5A6480;
        }

        .price-type-badge {
          position: absolute; top: 10px; left: 10px;
          font-size: 11px; font-weight: 600;
          padding: 3px 8px; border-radius: 6px;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.04em;
          backdrop-filter: blur(6px);
        }
        .price-type-badge.type-fixed {
          background: rgba(255,255,255,0.15); color: #ffffff;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .price-type-badge.negotiable {
          background: rgba(234,179,8,0.15); color: #facc15;
          border: 1px solid rgba(234,179,8,0.3);
        }

        .card-cat-overlay {
          position: absolute; top: 10px; right: 10px;
          font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 100px;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em;
          backdrop-filter: blur(8px);
        }

        .card-body { padding: 12px 14px 14px; }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 14px; color: #E8EEFF;
          margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: -0.01em;
        }

        .card-price {
          font-family: 'Syne', sans-serif;
          font-size: 18px; color: #00D4FF; font-weight: 700; margin-bottom: 8px;
        }

        .card-footer {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #5A6480; font-weight: 400;
          font-family: 'IBM Plex Mono', monospace;
        }
        .card-footer-dot { color: #2A2A4A; }

        .empty-state {
          grid-column: 1 / -1; text-align: center; padding: 80px 20px;
          display: flex; flex-direction: column; align-items: center;
        }
        .empty-emoji { font-size: 56px; margin-bottom: 20px; }
        .empty-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 26px; color: #E8EEFF; margin-bottom: 12px;
        }
        .empty-sub {
          font-size: 14px; color: #8892A4; font-weight: 300;
          max-width: 340px; line-height: 1.7; margin-bottom: 24px;
        }
        .empty-cta {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
          background: linear-gradient(135deg, #00D4FF, #7B5CF0); color: #06060F;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 700;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s;
          box-shadow: 0 0 24px rgba(0,212,255,0.25);
        }
        .empty-cta:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(0,212,255,0.4); }

        @media (max-width: 900px) {
          .listings-grid { grid-template-columns: repeat(2, 1fr); }
          .navbar { padding-left: 20px; padding-right: 20px; }
          .filters-bar { padding-left: 20px; padding-right: 20px; }
          .main { padding-left: 20px; padding-right: 20px; }
        }
        @media (max-width: 600px) {
          .navbar, .filters-bar, .main { padding-left: 16px; padding-right: 16px; }
          .listings-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .campus-tag { display: none; }
          .search-input { font-size: 16px; }
          .sell-btn { padding: 9px 14px; font-size: 12px; }
          .card-price { font-size: 16px; }
        }
        @media (max-width: 400px) {
          .listings-grid { grid-template-columns: 1fr; }
          .navbar, .filters-bar, .main { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="nav-brand" onClick={() => router.push('/')}>
            CampusThrift
          </div>
          {campusName && (
            <button className="campus-tag" onClick={() => setShowCampusSwitcher(v => !v)}>
              {CAMPUS_SHORT_NAMES[slug] || campusName}
              <ChevronDown size={12} />
              {showCampusSwitcher && (
                <div className="campus-switcher" onClick={e => e.stopPropagation()}>
                  <div className="switcher-label">Switch campus</div>
                  {LIVE_CAMPUSES.map(c => (
                    <button
                      key={c.slug}
                      className={`switcher-item ${c.slug === slug ? 'active' : ''}`}
                      onClick={() => { setShowCampusSwitcher(false); router.push(`/campus/${c.slug}`) }}
                    >
                      {c.label}
                      {c.slug === slug && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </button>
          )}
        </div>
        <div className="nav-right">
          <button
            className="sell-btn"
            onClick={() => user ? router.push(`/sell?campus=${slug}`) : router.push(`/auth?redirect=/sell?campus=${slug}`)}
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
            <button className="signin-link" onClick={() => router.push(`/auth?redirect=/campus/${slug}`)}>
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
          {categories.map(cat => (
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
              <div className="empty-emoji">👀</div>
              <div className="empty-title">No listings yet</div>
              <div className="empty-sub">
                This campus marketplace is giving ghost town vibes rn. Be the first to drop a listing and you&apos;ll literally be the only thing to look at. Main character energy, maximum visibility, zero competition.
              </div>
              {user ? (
                <button className="empty-cta" onClick={() => router.push(`/sell?campus=${slug}`)}>
                  List something →
                </button>
              ) : (
                <button className="empty-cta" onClick={() => router.push(`/auth?redirect=/sell?campus=${slug}`)}>
                  Be the first to sell →
                </button>
              )}
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
                  <div className="card-img-wrap">
                    {imgUrl
                      ? <img src={imgUrl} className="card-img" alt={listing.title} loading="lazy" />
                      : <div className="card-img-placeholder">📦</div>
                    }
                    {listing.price_type === 'negotiable'
                      ? <span className="price-type-badge negotiable">🤝 Negotiable</span>
                      : listing.price_type === 'fixed'
                        ? <span className="price-type-badge type-fixed">💰 Fixed</span>
                        : null
                    }
                    <span className="card-cat-overlay" style={{ background: bg, color: text }}>
                      {listing.category}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="card-title">{listing.title}</div>
                    <div className="card-price">
                      {listing.price === 0 || listing.is_free ? 'Free' : `₹${Number(listing.price).toLocaleString('en-IN')}`}
                    </div>
                    <div className="card-footer">
                      <span>Listed {timeAgo(listing.created_at)}</span>
                      {listing.product_age && (
                        <><span className="card-footer-dot">·</span><span>{PRODUCT_AGE_LABEL[listing.product_age] ?? listing.product_age}</span></>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
