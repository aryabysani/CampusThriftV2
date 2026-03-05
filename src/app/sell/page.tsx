'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Tag, ArrowLeft } from 'lucide-react'

const CATEGORIES = ['Clothes', 'Food', 'Books', 'Others']

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
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [productAge, setProductAge] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

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
          product_age: productAge.trim(),
          category,
          campus_id: '782e83cd-d881-4983-b111-e4ab69070415',
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

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF7F2; font-family: 'DM Sans', sans-serif; }

        .navbar {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 48px; background: white;
          border-bottom: 1px solid #E7E0D8;
          position: sticky; top: 0; z-index: 50;
        }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          font-size: 14px; color: #78716C;
          font-family: 'DM Sans', sans-serif; transition: color 0.15s;
        }
        .back-btn:hover { color: #C4622D; }
        .nav-brand {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Playfair Display', serif;
          font-size: 18px; color: #1C1917; cursor: pointer;
          margin-left: auto;
        }
        .dot { width: 7px; height: 7px; background: #C4622D; border-radius: 50%; }

        .page { max-width: 580px; margin: 0 auto; padding: 40px 24px 80px; }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px; color: #1C1917; margin-bottom: 8px;
        }
        .page-sub { font-size: 14px; color: #78716C; font-weight: 300; margin-bottom: 36px; }

        .field { margin-bottom: 22px; }
        .label {
          display: block; font-size: 13px; font-weight: 600;
          color: #1C1917; margin-bottom: 8px;
        }
        .input {
          width: 100%; padding: 12px 16px;
          border: 1.5px solid #E7E0D8; border-radius: 12px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          background: white; color: #1C1917; outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #C4622D; }
        .input::placeholder { color: #A8A29E; }
        .input.error { border-color: #DC2626; }
        textarea.input { resize: vertical; min-height: 100px; line-height: 1.6; }
        .error-text { font-size: 12px; color: #DC2626; margin-top: 5px; }

        .price-wrap { position: relative; }
        .price-prefix {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 15px; font-weight: 600; color: #78716C;
        }
        .price-input { padding-left: 30px !important; }

        .char-count {
          font-size: 11px; color: #A8A29E;
          text-align: right; margin-top: 5px;
        }

        .cat-grid { display: flex; gap: 8px; flex-wrap: wrap; }
        .cat-btn {
          padding: 8px 18px; border-radius: 100px;
          border: 1.5px solid #E7E0D8; background: white;
          font-size: 13px; font-weight: 500; color: #78716C;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .cat-btn:hover { border-color: #C4622D; color: #C4622D; }
        .cat-btn.active { background: #1C1917; color: white; border-color: #1C1917; }

        .upload-zone {
          border: 2px dashed #E7E0D8; border-radius: 16px;
          padding: 32px; text-align: center;
          cursor: pointer; transition: all 0.15s;
          background: white;
        }
        .upload-zone:hover { border-color: #C4622D; background: #FFF8F5; }
        .upload-zone.error { border-color: #DC2626; }
        .upload-icon { font-size: 32px; margin-bottom: 10px; }
        .upload-text { font-size: 14px; font-weight: 500; color: #1C1917; margin-bottom: 4px; }
        .upload-sub { font-size: 12px; color: #A8A29E; font-weight: 300; }

        .previews { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
        .preview-wrap { position: relative; }
        .preview-img {
          width: 90px; height: 90px; object-fit: cover;
          border-radius: 10px; display: block;
        }
        .preview-remove {
          position: absolute; top: -6px; right: -6px;
          width: 22px; height: 22px; border-radius: 50%;
          background: #DC2626; color: white;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .cover-badge {
          position: absolute; bottom: 4px; left: 4px;
          background: #1C1917; color: white;
          font-size: 9px; font-weight: 700;
          padding: 2px 6px; border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .phone-box {
          background: #F5F0EB; border-radius: 12px;
          padding: 14px 16px;
        }
        .phone-label { font-size: 12px; color: #78716C; margin-bottom: 4px; }
        .phone-value { font-size: 15px; font-weight: 600; color: #1C1917; }
        .phone-hint { font-size: 11px; color: #A8A29E; margin-top: 4px; font-weight: 300; }

        .submit-btn {
          width: 100%; padding: 16px;
          background: #1C1917; color: white;
          border: none; border-radius: 12px;
          font-size: 16px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.15s;
          margin-top: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) { background: #C4622D; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .toast {
          position: fixed; bottom: 32px; left: 50%;
          transform: translateX(-50%);
          background: #1C1917; color: white;
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
          .navbar { padding: 14px 20px; }
          .page { padding: 28px 20px 60px; }
        }
      `}</style>

      <nav className="navbar">
        <button className="back-btn" onClick={() => router.push('/campus/mahe-blr')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="nav-brand" onClick={() => router.push('/')}>
          <div className="dot" /> CampusThrift
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
            {CATEGORIES.map(cat => (
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
        </div>

        {/* PRODUCT AGE */}
        <div className="field">
          <label className="label">Product age *</label>
          <input
            className={`input ${errors.productAge ? 'error' : ''}`}
            placeholder="e.g. 6 months, 1 year, Barely used"
            value={productAge}
            onChange={e => setProductAge(e.target.value)}
          />
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
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post Listing 🎉'}
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}