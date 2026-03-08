'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Footer from '@/components/Footer'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setEmail(session.user.email || '')
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (prof) {
            setFullName(prof.full_name || '')
            setPhone((prof.phone || '').replace('+91', ''))
            setAvatarUrl(prof.avatar_url || '')
          }
        } else if (event === 'SIGNED_OUT') {
          router.push('/auth')
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleSave() {
    if (!fullName.trim()) { showToast('Name is required'); return }
    if (!phone || phone.length < 10) { showToast('Enter a valid phone number'); return }
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { showToast('Not logged in'); setSaving(false); return }

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName.trim(), phone: `+91${phone}`, email })
          .eq('id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: fullName.trim(),
            phone: `+91${phone}`,
            avatar_url: user.user_metadata?.avatar_url || null,
          })
        if (error) throw error
      }

      showToast('Profile updated! ✅')
    } catch (err: unknown) {
      console.error(err)
      showToast('Failed to save. Try again.')
    }

    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteAccount() {
  setDeleting(true)
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      showToast('Not logged in')
      setDeleting(false)
      return
    }

      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await res.json()
      if (!res.ok) {
        showToast(`Failed to delete: ${data.error}`)
        setDeleting(false)
        return
      }

      await supabase.auth.signOut()
      router.push('/')
    } catch (err: unknown) {
      console.error(err)
      showToast('Something went wrong. Try again.')
      setDeleting(false)
    }
  }

  function getInitials() {
    return fullName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U'
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060F; font-family: 'Space Grotesk', sans-serif; color: #E8EEFF; }
        .navbar { display: flex; align-items: center; gap: 12px; padding: 16px 48px; background: rgba(6,6,15,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(123,92,240,0.18); position: sticky; top: 0; z-index: 50; }
        .back-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; font-size: 14px; color: #8892A4; font-family: 'Space Grotesk', sans-serif; transition: color 0.15s; }
        .back-btn:hover { color: #00D4FF; }
        .nav-brand { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #E8EEFF; cursor: pointer; letter-spacing: -0.02em; margin-left: auto; }
        .page { max-width: 520px; margin: 0 auto; padding: 40px 24px 80px; }
        .avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 36px; }
        .avatar { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 600; margin-bottom: 12px; overflow: hidden; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #E8EEFF; margin-bottom: 4px; }
        .avatar-email { font-size: 13px; color: #5A6480; font-weight: 400; font-family: 'IBM Plex Mono', monospace; }
        .card { background: #111125; border: 1px solid rgba(123,92,240,0.18); border-radius: 20px; padding: 28px; margin-bottom: 16px; }
        .card-title { font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #5A6480; margin-bottom: 20px; font-family: 'IBM Plex Mono', monospace; }
        .field { margin-bottom: 18px; }
        .label { display: block; font-size: 11px; font-weight: 500; color: #8892A4; margin-bottom: 8px; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; }
        .input { width: 100%; padding: 12px 16px; border: 1px solid rgba(123,92,240,0.18); border-radius: 12px; font-size: 14px; font-family: 'Space Grotesk', sans-serif; background: #0D0D1A; color: #E8EEFF; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
        .input:disabled { background: rgba(123,92,240,0.04); color: #5A6480; cursor: not-allowed; }
        .phone-wrap { display: flex; border: 1px solid rgba(123,92,240,0.18); border-radius: 12px; overflow: hidden; transition: border-color 0.15s; }
        .phone-wrap:focus-within { border-color: #00D4FF; }
        .phone-prefix { padding: 12px 14px; background: rgba(123,92,240,0.08); font-size: 14px; font-weight: 600; color: #8892A4; border-right: 1px solid rgba(123,92,240,0.18); font-family: 'IBM Plex Mono', monospace; }
        .phone-input { flex: 1; padding: 12px 16px; border: none; outline: none; font-size: 14px; font-family: 'Space Grotesk', sans-serif; color: #E8EEFF; background: #0D0D1A; }
        .wa-note { display: flex; align-items: flex-start; gap: 10px; background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.2); border-radius: 10px; padding: 11px 14px; margin-top: 10px; }
        .wa-note-icon { flex-shrink: 0; margin-top: 1px; }
        .wa-note-text { font-size: 12px; color: #86efac; font-weight: 400; line-height: 1.5; }
        .save-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 0 20px rgba(123,92,240,0.3); }
        .save-btn:hover:not(:disabled) { box-shadow: 0 0 30px rgba(123,92,240,0.5); transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .secondary-btns { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
        .outline-btn { width: 100%; padding: 13px; background: transparent; color: #8892A4; border: 1px solid rgba(123,92,240,0.18); border-radius: 12px; font-size: 14px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s; }
        .outline-btn:hover { border-color: #7B5CF0; color: #7B5CF0; }
        .logout-btn { width: 100%; padding: 13px; background: rgba(255,45,155,0.06); color: #FF2D9B; border: 1px solid rgba(255,45,155,0.15); border-radius: 12px; font-size: 14px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s; }
        .logout-btn:hover { background: rgba(255,45,155,0.12); }
        .delete-section { margin-top: 24px; border-top: 1px solid rgba(123,92,240,0.12); padding-top: 24px; }
        .delete-label { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6480; margin-bottom: 12px; font-family: 'IBM Plex Mono', monospace; }
        .delete-btn { width: 100%; padding: 13px; background: transparent; color: #5A6480; border: 1px solid rgba(123,92,240,0.15); border-radius: 12px; font-size: 14px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s; }
        .delete-btn:hover { border-color: rgba(255,45,155,0.3); color: #FF2D9B; background: rgba(255,45,155,0.05); }
        .confirm-box { background: rgba(255,45,155,0.06); border: 1px solid rgba(255,45,155,0.15); border-radius: 12px; padding: 18px; margin-top: 4px; }
        .confirm-text { font-size: 13px; color: #FF2D9B; font-weight: 500; margin-bottom: 4px; }
        .confirm-sub { font-size: 12px; color: #FF2D9B; opacity: 0.7; font-weight: 300; margin-bottom: 14px; }
        .confirm-btns { display: flex; gap: 8px; }
        .confirm-yes { flex: 1; padding: 10px; background: #FF2D9B; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: all 0.15s; }
        .confirm-yes:hover:not(:disabled) { background: #e0197e; }
        .confirm-yes:disabled { opacity: 0.5; cursor: not-allowed; }
        .confirm-no { flex: 1; padding: 10px; background: rgba(123,92,240,0.08); color: #8892A4; border: 1px solid rgba(123,92,240,0.18); border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; cursor: pointer; }
        .toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: #111125; color: #E8EEFF; border: 1px solid rgba(123,92,240,0.3); padding: 12px 24px; border-radius: 100px; font-size: 14px; font-weight: 500; z-index: 999; animation: toastIn 0.3s ease; white-space: nowrap; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @media (max-width: 600px) {
          .navbar { padding: 14px 16px; }
          .page { padding: 24px 16px 60px; }
          .input, .phone-input { font-size: 16px; }
          .card { padding: 20px; }
        }
        @media (max-width: 400px) {
          .navbar { padding: 12px; }
          .page { padding: 20px 12px 60px; }
        }
      `}</style>

      <nav className="navbar">
        <button className="back-btn" onClick={() => router.push('/campus/mahe-blr')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="nav-brand" onClick={() => router.push('/')}>
          CampusThrift
        </div>
      </nav>

      <div className="page">
        <div className="avatar-section">
          <div className="avatar">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : getInitials()}
          </div>
          <div className="avatar-name">{fullName || 'Your Name'}</div>
          <div className="avatar-email">{email}</div>
        </div>

        <div className="card">
          <div className="card-title">Profile Details</div>
          <div className="field">
            <label className="label">Full name</label>
            <input className="input" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Phone number</label>
            <div className="phone-wrap">
              <span className="phone-prefix">+91</span>
              <input className="phone-input" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
            <div className="wa-note">
              <svg className="wa-note-icon" width="15" height="15" viewBox="0 0 24 24" fill="#22c55e">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="wa-note-text">Make sure your WhatsApp number is correct — buyers will contact you directly here.</span>
            </div>
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" value={email} disabled />
          </div>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="secondary-btns">
          <button className="outline-btn" onClick={() => router.push('/my-listings')}>View My Listings</button>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>

        <div className="delete-section">
          <div className="delete-label">Danger Zone</div>
          {!confirmDelete ? (
            <button className="delete-btn" onClick={() => setConfirmDelete(true)}>Delete Account</button>
          ) : (
            <div className="confirm-box">
              <div className="confirm-text">This cannot be undone.</div>
              <div className="confirm-sub">Your account, listings, and all data will be permanently deleted.</div>
              <div className="confirm-btns">
                <button className="confirm-yes" onClick={handleDeleteAccount} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button className="confirm-no" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
      <Footer />
    </>
  )
}