'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Tag, ArrowLeft } from 'lucide-react'

const PRODUCT_AGES = ['Not used', 'Less than a week', 'Less than a month', 'Less than 6 months', 'More than 6 months']

async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => resolve(file)
    img.src = url
  })
}

export default function SellPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campusSlug = searchParams.get('campus') || 'mahe-blr'
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [campusId, setCampusId] = useState<string | null>(null)
  const [campusNotFound, setCampusNotFound] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable'>('fixed')
  const [productAge, setProductAge] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

useEffect(() => {
  supabase.from('campuses').select('id').eq('slug', campusSlug).single()
    .then(({ data }) => { if (data) setCampusId(data.id); else setCampusNotFound(true) })
  supabase.from('categories').select('name').order('sort_order')
    .then(({ data }) => { if (data) setCategories(data.map((c: any) => c.name)) })
}, [campusSlug])

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session) {
        setUser(session.user)
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (!prof?.phone) { router.push('/auth?redirect=/sell'); return }
        setProfile(prof)
      } else if (event === 'SIGNED_OUT') {
        router.push('/auth?redirect=/sell')
      }
    }
  )
  return () => subscription.unsubscribe()
}, [])

  function handleFiles(files: FileList | null) {
    if (!files) return
    const remaining = 3 - images.length
    const newFiles = Array.from(files).slice(0, remaining).filter(f => f.size <= 5 * 1024 * 1024)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setImages(prev => [...prev, ...newFiles])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'Required'
    if (!category) e.category = 'Select a category'
    if (!price || Number(price) <= 0) e.price = 'Enter a valid price'
    if (!productAge.trim()) e.productAge = 'Required'
    if (!description.trim()) e.description = 'Required'
    if (images.length === 0) e.images = 'Add at least 1 photo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    if (!campusId) { showToast('Campus not found. Please go back and try again.'); return }
    setLoading(true)

    try {
      // Always get fresh user to avoid null state
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (!freshUser) { router.push('/auth?redirect=/sell'); return }

      // Insert listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          price_type: priceType,
          product_age: productAge.trim(),
          category,
          campus_id: campusId,
          seller_id: freshUser.id,
    status: 'active',
  })
        .select()
        .single()

      if (listingError || !listing) throw new Error('Failed to create listing')

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const compressed = await compressImage(images[i])
        const path = `${freshUser.id}/${listing.id}/${Date.now()}-${i}.jpg`

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(path, compressed, { contentType: 'image/jpeg' })

        if (uploadError) continue

        const { data: urlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(path)

        await supabase.from('listing_images').insert({
          listing_id: listing.id,
          url: urlData.publicUrl,
          storage_path: path,
          position: i + 1,
        })
      }

      showToast('Your listing is live! 🎉')
      setTimeout(() => router.push(`/listing/${listing.id}`), 1200)
    } catch (err) {
      showToast('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  if (campusNotFound) notFound()

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

        .page { max-width: 580px; margin: 0 auto; padding: 40px 24px 80px; }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 32px; color: #E8EEFF; margin-bottom: 8px; letter-spacing: -0.02em;
        }
        .page-sub { font-size: 14px; color: #8892A4; font-weight: 300; margin-bottom: 36px; }

        .field { margin-bottom: 22px; }
        .label {
          display: block; font-size: 11px; font-weight: 500;
          color: #8892A4; margin-bottom: 8px;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .input {
          width: 100%; padding: 12px 16px;
          border: 1px solid rgba(123,92,240,0.18); border-radius: 12px;
          font-size: 14px; font-family: 'Space Grotesk', sans-serif;
          background: #111125; color: #E8EEFF; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
        .input::placeholder { color: #5A6480; }
        .input.error { border-color: #FF2D9B; }
        textarea.input { resize: vertical; min-height: 100px; line-height: 1.6; }
        select.input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238892A4' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; cursor: pointer; background-color: #111125; }
        select.input option { background: #111125; color: #E8EEFF; }
        .error-text { font-size: 12px; color: #FF2D9B; margin-top: 5px; }

        .price-wrap { position: relative; }
        .price-prefix {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 15px; font-weight: 600; color: #8892A4;
          font-family: 'IBM Plex Mono', monospace;
        }
        .price-input { padding-left: 30px !important; }

        .price-type-toggle {
          display: flex; gap: 8px; margin-top: 10px;
        }
        .price-type-btn {
          flex: 1; padding: 10px 12px; border-radius: 10px;
          border: 1px solid rgba(123,92,240,0.2); background: transparent;
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          color: #8892A4;
        }
        .price-type-btn.type-fixed.active {
          background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.4);
          color: #E8EEFF;
        }
        .price-type-btn.negotiable.active {
          background: rgba(234,179,8,0.1); border-color: rgba(234,179,8,0.5);
          color: #facc15;
        }

        .char-count {
          font-size: 11px; color: #5A6480;
          text-align: right; margin-top: 5px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .cat-grid { display: flex; gap: 8px; flex-wrap: wrap; }
        .cat-btn {
          padding: 10px 18px; border-radius: 100px;
          border: 1px solid rgba(123,92,240,0.18); background: transparent;
          font-size: 13px; font-weight: 500; color: #8892A4;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Space Grotesk', sans-serif;
          min-height: 40px;
        }
        .cat-btn:hover { border-color: #7B5CF0; color: #7B5CF0; }
        .cat-btn.active { background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white; border-color: transparent; }

        .upload-zone {
          border: 2px dashed rgba(123,92,240,0.25); border-radius: 16px;
          padding: 24px; text-align: center;
          cursor: pointer; transition: all 0.15s;
          background: #111125;
        }
        .upload-zone:hover { border-color: #7B5CF0; background: rgba(123,92,240,0.05); }
        .upload-zone.error { border-color: #FF2D9B; }
        .upload-icon { font-size: 32px; margin-bottom: 10px; }
        .upload-text { font-size: 14px; font-weight: 500; color: #E8EEFF; margin-bottom: 4px; }
        .upload-sub { font-size: 12px; color: #5A6480; font-weight: 300; }

        .previews { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
        .preview-wrap { position: relative; }
        .preview-img {
          width: 90px; height: 90px; object-fit: cover;
          border-radius: 10px; display: block;
          border: 1px solid rgba(123,92,240,0.18);
        }
        .preview-remove {
          position: absolute; top: -8px; right: -8px;
          width: 28px; height: 28px; border-radius: 50%;
          background: #FF2D9B; color: white;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .cover-badge {
          position: absolute; bottom: 4px; left: 4px;
          background: rgba(0,212,255,0.9); color: #06060F;
          font-size: 9px; font-weight: 700;
          padding: 2px 6px; border-radius: 4px;
          letter-spacing: 0.05em; font-family: 'IBM Plex Mono', monospace;
        }

        .phone-box {
          background: rgba(123,92,240,0.06); border: 1px solid rgba(123,92,240,0.18);
          border-radius: 12px; padding: 14px 16px;
        }
        .phone-label { font-size: 11px; color: #5A6480; margin-bottom: 4px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em; }
        .phone-value { font-size: 15px; font-weight: 600; color: #E8EEFF; }
        .phone-hint { font-size: 11px; color: #5A6480; margin-top: 4px; font-weight: 300; }

        .wa-note {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.2);
          border-radius: 10px; padding: 11px 14px; margin-top: 10px;
        }
        .wa-note-icon { flex-shrink: 0; margin-top: 1px; }
        .wa-note-text { font-size: 12px; color: #86efac; font-weight: 400; line-height: 1.5; }

        .submit-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white;
          border: none; border-radius: 12px;
          font-size: 16px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.15s;
          margin-top: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 0 24px rgba(123,92,240,0.3);
        }
        .submit-btn:hover:not(:disabled) { box-shadow: 0 0 36px rgba(123,92,240,0.5); transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .toast {
          position: fixed; bottom: 32px; left: 50%;
          transform: translateX(-50%);
          background: #111125; color: #E8EEFF;
          border: 1px solid rgba(123,92,240,0.3);
          padding: 12px 24px; border-radius: 100px;
          font-size: 14px; font-weight: 500; z-index: 999;
          animation: toastIn 0.3s ease;
          white-space: nowrap;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @media (max-width: 600px) {
          .navbar { padding: 14px 16px; }
          .page { padding: 24px 16px 60px; }
          .input { font-size: 16px; padding: 14px 16px; }
          .upload-zone { padding: 20px 16px; }
          .page-title { font-size: clamp(24px, 7vw, 32px); }
        }
        @media (max-width: 360px) {
          .page { padding: 20px 12px 60px; }
          .cat-btn { padding: 10px 12px; font-size: 12px; }
        }
      `}</style>

      <nav className="navbar">
        <button className="back-btn" onClick={() => router.push(`/campus/${campusSlug}`)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="nav-brand" onClick={() => router.push('/')}>
          CampusThrift
        </div>
      </nav>

      <div className="page">
        <h1 className="page-title">What are you selling?</h1>
        <p className="page-sub">Fill in the details and your listing goes live instantly.</p>

        {/* TITLE */}
        <div className="field">
          <label className="label">Product name *</label>
          <input
            className={`input ${errors.title ? 'error' : ''}`}
            placeholder="e.g. MTech Textbook Set"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          {errors.title && <div className="error-text">{errors.title}</div>}
        </div>

        {/* CATEGORY */}
        <div className="field">
          <label className="label">Category *</label>
          <div className="cat-grid">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          {errors.category && <div className="error-text">{errors.category}</div>}
        </div>

        {/* PRICE */}
        <div className="field">
          <label className="label">Price *</label>
          <div className="price-wrap">
            <span className="price-prefix">₹</span>
            <input
              type="number"
              className={`input price-input ${errors.price ? 'error' : ''}`}
              placeholder="500"
              value={price}
              onChange={e => setPrice(e.target.value)}
              min="0"
            />
          </div>
          {errors.price && <div className="error-text">{errors.price}</div>}
          <div className="price-type-toggle">
            <button
              type="button"
              className={`price-type-btn type-fixed${priceType === 'fixed' ? ' active' : ''}`}
              onClick={() => setPriceType('fixed')}
            >
              💰 Fixed price
            </button>
            <button
              type="button"
              className={`price-type-btn negotiable${priceType === 'negotiable' ? ' active' : ''}`}
              onClick={() => setPriceType('negotiable')}
            >
              🤝 Negotiable
            </button>
          </div>
        </div>

        {/* PRODUCT AGE */}
        <div className="field">
          <label className="label">Product age *</label>
          <select
            className={`input ${errors.productAge ? 'error' : ''}`}
            value={productAge}
            onChange={e => setProductAge(e.target.value)}
          >
            <option value="">Select age</option>
            {PRODUCT_AGES.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
          {errors.productAge && <div className="error-text">{errors.productAge}</div>}
        </div>

        {/* DESCRIPTION */}
        <div className="field">
          <label className="label">Description *</label>
          <textarea
            className={`input ${errors.description ? 'error' : ''}`}
            placeholder="Describe condition, reason for selling, etc."
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 300))}
          />
          <div className="char-count">{description.length}/300</div>
          {errors.description && <div className="error-text">{errors.description}</div>}
        </div>

        {/* PHOTOS */}
        <div className="field">
          <label className="label">Photos * (max 3)</label>
          {images.length < 3 && (
            <div
              className={`upload-zone ${errors.images ? 'error' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📷</div>
              <div className="upload-text">Click to add photos</div>
              <div className="upload-sub">First photo will be the cover · Max 5MB each</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />
            </div>
          )}
          {previews.length > 0 && (
            <div className="previews">
              {previews.map((src, i) => (
                <div className="preview-wrap" key={i}>
                  <img src={src} className="preview-img" alt="" />
                  {i === 0 && <span className="cover-badge">COVER</span>}
                  <button className="preview-remove" onClick={() => removeImage(i)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.images && <div className="error-text" style={{ marginTop: 8 }}>{errors.images}</div>}
        </div>

        {/* PHONE */}
        <div className="field">
          <label className="label">Contact number</label>
          <div className="phone-box">
            <div className="phone-label">Buyers will reach you on WhatsApp</div>
            <div className="phone-value">{profile?.phone || 'Loading...'}</div>
            <div className="phone-hint">To change this, update your profile</div>
          </div>
          <div className="wa-note">
            <svg className="wa-note-icon" width="15" height="15" viewBox="0 0 24 24" fill="#22c55e">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="wa-note-text">Make sure this is your active WhatsApp number — buyers will contact you directly here.</span>
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post Listing 🎉'}
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}