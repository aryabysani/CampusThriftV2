'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Trash2, CheckCircle, Lock } from 'lucide-react'
import Footer from '@/components/Footer'

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function ListingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()

  const [listing, setListing] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) loadListing()
  }, [id])

  async function loadListing() {
    setLoading(true)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    // Get listing with images
    const { data: listingData } = await supabase
      .from('listings')
      .select('*, listing_images(*)')
      .eq('id', id)
      .single()

    if (!listingData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setListing(listingData)

    // Set main image
    const imgs = listingData.listing_images || []
    const main = imgs.find((i: any) => i.is_main) || imgs[0]
    if (main) setMainImage(main.image_url)

    // Get seller profile
    const { data: sellerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', listingData.seller_id)
      .single()

    setSeller(sellerData)
    setLoading(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleMarkSold() {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id)
    setListing((prev: any) => ({ ...prev, status: 'sold' }))
    showToast('Marked as sold!')
  }

  async function handleDelete() {
    const imgs = listing?.listing_images || []
    for (const img of imgs) {
      const path = img.image_url.split('/listing-images/')[1]
      if (path) await supabase.storage.from('listing-images').remove([path])
    }
    await supabase.from('listings').delete().eq('id', id)
    showToast('Listing removed')
    setTimeout(() => router.push('/my-listings'), 1000)
  }

  // KEY FIX: isSeller checks currentUser.id against listing.seller_id
  const isSeller = currentUser && listing && currentUser.id === listing.seller_id
  const isLoggedIn = !!currentUser
  const images = listing?.listing_images || []

  const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
    Clothing: { bg: 'rgba(123,92,240,0.12)', color: '#7B5CF0' },
    'Books/Stationery': { bg: 'rgba(0,212,255,0.10)', color: '#00D4FF' },
    Footwear: { bg: 'rgba(255,45,155,0.10)', color: '#FF2D9B' },
    'Small Appliances': { bg: 'rgba(0,212,255,0.08)', color: '#00B4D8' },
    Foods: { bg: 'rgba(255,159,64,0.10)', color: '#FF9F40' },
    Other: { bg: 'rgba(88,101,120,0.15)', color: '#8892A4' },
  }
  const catStyle = CATEGORY_COLORS[listing?.category] || CATEGORY_COLORS['Other']

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#06060F' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(123,92,240,0.2)', borderTopColor: '#7B5CF0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#06060F', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontSize: 24, color: '#E8EEFF', marginBottom: 8, fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>Listing not found</h2>
      <p style={{ color: '#8892A4', marginBottom: 24 }}>This item may have been removed.</p>
      <button onClick={() => router.push('/campus/mahe-blr')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #7B5CF0, #5B3FD0)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
        Browse listings
      </button>
    </div>
  )

  return (
    <>
      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060F; font-family: 'Space Grotesk', sans-serif; color: #E8EEFF; }

        .navbar {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 48px;
          background: rgba(6,6,15,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(123,92,240,0.18);
          position: sticky; top: 0; z-index: 50;
        }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          font-size: 14px; color: #8892A4;
          font-family: 'Space Grotesk', sans-serif; transition: color 0.15s;
        }
        .back-btn:hover { color: #00D4FF; }
        .nav-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 20px; color: #E8EEFF; cursor: pointer;
          letter-spacing: -0.02em; margin-left: auto;
        }

        .sold-banner {
          background: rgba(255,45,155,0.12); color: #FF2D9B;
          border-bottom: 1px solid rgba(255,45,155,0.2);
          text-align: center; padding: 14px;
          font-size: 14px; font-weight: 600;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em;
        }

        .page { max-width: 900px; margin: 0 auto; padding: 40px 48px 80px; }
        .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }

        .main-img {
          width: 100%; aspect-ratio: 1; object-fit: cover;
          border-radius: 16px; background: #161630; display: block;
          border: 1px solid rgba(123,92,240,0.18);
        }
        .main-placeholder {
          width: 100%; aspect-ratio: 1; background: #161630;
          border: 1px solid rgba(123,92,240,0.18);
          border-radius: 16px; display: flex; align-items: center;
          justify-content: center; font-size: 64px;
        }
        .thumbnails { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .thumb {
          width: 64px; height: 64px; object-fit: cover;
          border-radius: 8px; cursor: pointer; border: 2px solid rgba(123,92,240,0.18);
          transition: border-color 0.15s;
        }
        .thumb.active { border-color: #00D4FF; }

        .badges { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .badge { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 500; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em; }
        .title {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: clamp(22px, 4vw, 28px); color: #E8EEFF; margin-bottom: 8px; line-height: 1.2;
        }
        .meta-label { font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #5A6480; margin-bottom: 4px; font-family: 'IBM Plex Mono', monospace; }
        .price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(26px, 5vw, 34px); color: #00D4FF; margin-bottom: 8px; }
        .price-type-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em;
          margin-bottom: 16px;
        }
        .price-type-pill.type-fixed { background: rgba(255,255,255,0.07); color: #E8EEFF; border: 1px solid rgba(255,255,255,0.2); }
        .price-type-pill.type-negotiable { background: rgba(234,179,8,0.1); color: #facc15; border: 1px solid rgba(234,179,8,0.3); }
        .description { font-size: 14px; font-weight: 300; color: #8892A4; line-height: 1.75; margin-bottom: 20px; }
        .posted-time { font-size: 11px; color: #5A6480; margin-bottom: 28px; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.06em; }

        .seller-box {
          background: #111125; border: 1px solid rgba(123,92,240,0.18);
          border-radius: 16px; padding: 20px;
        }
        .seller-box-title {
          font-size: 10px; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: #5A6480; margin-bottom: 14px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .seller-blur { position: relative; }
        .seller-blur-content { filter: blur(6px); pointer-events: none; user-select: none; }
        .seller-blur-overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          cursor: pointer; gap: 8px;
        }
        .blur-lock-text { font-size: 13px; font-weight: 600; color: #E8EEFF; text-align: center; }
        .blur-login-btn {
          padding: 8px 20px; background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 500;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s;
        }
        .blur-login-btn:hover { box-shadow: 0 0 20px rgba(123,92,240,0.4); }

        .seller-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .seller-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 600; overflow: hidden; flex-shrink: 0;
        }
        .seller-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .seller-name { font-size: 15px; font-weight: 600; color: #E8EEFF; }
        .seller-sub { font-size: 12px; color: #5A6480; font-weight: 400; font-family: 'IBM Plex Mono', monospace; }

        .whatsapp-btn {
          width: 100%; padding: 13px;
          background: #16A34A; color: white;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
          transition: background 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .whatsapp-btn:hover { background: #15803D; }

        .your-listing-label { font-size: 12px; color: #5A6480; margin-bottom: 12px; text-align: center; font-family: 'IBM Plex Mono', monospace; }
        .seller-actions { display: flex; flex-direction: column; gap: 8px; }
        .btn-mark-sold {
          width: 100%; padding: 12px;
          background: rgba(0,212,255,0.08); color: #00D4FF;
          border: 1px solid rgba(0,212,255,0.2); border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.15s;
        }
        .btn-mark-sold:hover { background: rgba(0,212,255,0.15); }
        .btn-delete {
          width: 100%; padding: 12px;
          background: rgba(255,45,155,0.06); color: #FF2D9B;
          border: 1px solid rgba(255,45,155,0.15); border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.15s;
        }
        .btn-delete:hover { background: rgba(255,45,155,0.12); }

        .confirm-box { background: rgba(255,45,155,0.06); border: 1px solid rgba(255,45,155,0.15); border-radius: 10px; padding: 14px; text-align: center; margin-top: 4px; }
        .confirm-text { font-size: 13px; color: #FF2D9B; margin-bottom: 10px; font-weight: 500; }
        .confirm-btns { display: flex; gap: 8px; }
        .confirm-yes {
          flex: 1; padding: 9px; background: #FF2D9B; color: white;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
        }
        .confirm-no {
          flex: 1; padding: 9px; background: rgba(123,92,240,0.08); color: #8892A4;
          border: 1px solid rgba(123,92,240,0.18); border-radius: 8px;
          font-size: 13px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
        }

        .toast {
          position: fixed; bottom: 32px; left: 50%;
          transform: translateX(-50%);
          background: #111125; color: #E8EEFF;
          border: 1px solid rgba(123,92,240,0.3);
          padding: 12px 24px; border-radius: 100px;
          font-size: 14px; font-weight: 500; z-index: 999;
          animation: toastIn 0.3s ease; white-space: nowrap;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @media (max-width: 700px) {
          .navbar, .page { padding-left: 20px; padding-right: 20px; }
          .page { padding-top: 28px; padding-bottom: 60px; }
          .layout { grid-template-columns: 1fr; gap: 24px; }
        }
        @media (max-width: 480px) {
          .navbar, .page { padding-left: 16px; padding-right: 16px; }
          .whatsapp-btn { padding: 15px; font-size: 14px; }
          .seller-box { padding: 16px; }
        }
        @media (max-width: 360px) {
          .navbar, .page { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>

      <nav className="navbar">
        <button className="back-btn" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="nav-brand" onClick={() => router.push('/')}>
          CampusThrift
        </div>
      </nav>

      {listing?.status === 'sold' && (
        <div className="sold-banner">🏷️ This item has been sold</div>
      )}

      <div className="page">
        <div className="layout">
          {/* LEFT — Images */}
          <div>
            {mainImage
              ? <img src={mainImage} className="main-img" alt={listing?.title} />
              : <div className="main-placeholder">📦</div>
            }
            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img: any) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    className={`thumb ${mainImage === img.image_url ? 'active' : ''}`}
                    onClick={() => setMainImage(img.image_url)}
                    alt=""
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div>
            <div className="badges">
              <span className="badge" style={{ background: catStyle.bg, color: catStyle.color }}>
                {listing?.category}
              </span>
              {listing?.product_age && (
                <span className="badge" style={{ background: '#F5F0EB', color: '#78716C' }}>
                  AGE — {listing.product_age}
                </span>
              )}
            </div>

            <h1 className="title">{listing?.title}</h1>
            <div className="meta-label">Price</div>
            <div className="price">₹{Number(listing?.price).toLocaleString('en-IN')}</div>
            {listing?.price_type === 'negotiable'
              ? <div className="price-type-pill type-negotiable">🤝 Negotiable</div>
              : <div className="price-type-pill type-fixed">💰 Fixed price</div>
            }
            <p className="description">{listing?.description}</p>
            <div className="posted-time"><span style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>Posted — </span>{timeAgo(listing?.created_at)}</div>

            <div className="seller-box">
              <div className="seller-box-title">Seller</div>

              {/* NOT LOGGED IN */}
              {!isLoggedIn && (
                <div className="seller-blur">
                  <div className="seller-blur-content">
                    <div className="seller-row">
                      <div className="seller-avatar">S</div>
                      <div>
                        <div className="seller-name">Seller Name</div>
                        <div className="seller-sub">MAHE Bangalore</div>
                      </div>
                    </div>
                    <div style={{ height: 44, background: 'rgba(123,92,240,0.12)', borderRadius: 12 }} />
                  </div>
                  <div className="seller-blur-overlay" onClick={() => router.push(`/auth?redirect=/listing/${id}`)}>
                    <Lock size={20} color="#1C1917" />
                    <div className="blur-lock-text">Login to view seller details</div>
                    <button className="blur-login-btn">Sign in</button>
                  </div>
                </div>
              )}

              {/* LOGGED IN — IS SELLER */}
              {isLoggedIn && isSeller && (
                <>
                  <div className="your-listing-label">This is your listing</div>
                  <div className="seller-actions">
                    {listing?.status === 'active' && (
                      <button className="btn-mark-sold" onClick={handleMarkSold}>
                        <CheckCircle size={15} /> Mark as Sold
                      </button>
                    )}
                    {confirmDelete ? (
                      <div className="confirm-box">
                        <div className="confirm-text">Remove this listing? Can't be undone.</div>
                        <div className="confirm-btns">
                          <button className="confirm-yes" onClick={handleDelete}>Remove</button>
                          <button className="confirm-no" onClick={() => setConfirmDelete(false)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-delete" onClick={() => setConfirmDelete(true)}>
                        <Trash2 size={15} /> Remove Listing
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* LOGGED IN — IS BUYER */}
              {isLoggedIn && !isSeller && listing?.status === 'sold' && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#FF2D9B', fontWeight: 600, fontSize: 15 }}>
                  ❌ This item has already been sold
                </div>
              )}

              {/* LOGGED IN — IS BUYER */}
              {isLoggedIn && !isSeller && listing?.status !== 'sold' && (
                <>
                  <div className="seller-row">
                    <div className="seller-avatar">
                      {seller?.avatar_url
                        ? <img src={seller.avatar_url} alt="" />
                        : (seller?.full_name?.charAt(0)?.toUpperCase() || 'S')
                      }
                    </div>
                    <div>
                      <div className="seller-name">{seller?.full_name || 'Seller'}</div>
                      <div className="seller-sub">MAHE Bangalore</div>
                    </div>
                  </div>
                  <button
                    className="whatsapp-btn"
                    onClick={() => {
                      const phone = seller?.phone?.replace('+', '') || ''
                      const msg = encodeURIComponent(`Hi! I found your listing "${listing?.title}" on CampusThrift. Is it still available?`)
                      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
      <Footer />
    </>
  )
}