'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setEmail(session.user.email || '')
          setUserId(session.user.id)
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
    // Get user directly to avoid empty userId state
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { showToast('Not logged in'); setSaving(false); return }

    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existing) {
      // Update existing profile
  const { error } = await supabase
  .from('profiles')
  .update({
    full_name: fullName.trim(),
    phone: `+91${phone}`,
    email: email,        // ← add this line
  })
  .eq('id', user.id)
      if (error) throw error
    } else {
      // Insert new profile
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
  } catch (err: any) {
    console.error(err)
    showToast('Failed to save: ' + (err.message || 'Try again'))
  }

  setSaving(false)
}

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function getInitials() {
    return fullName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U'
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

        .page { max-width: 520px; margin: 0 auto; padding: 40px 24px 80px; }

        .avatar-section {
          display: flex; flex-direction: column;
          align-items: center; margin-bottom: 36px;
        }
        .avatar {
          width: 88px; height: 88px; border-radius: 50%;
          background: #C4622D; color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 600;
          margin-bottom: 12px; overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px; color: #1C1917; margin-bottom: 4px;
        }
        .avatar-email { font-size: 13px; color: #A8A29E; font-weight: 300; }

        .card {
          background: white; border: 1.5px solid #E7E0D8;
          border-radius: 20px; padding: 28px;
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #A8A29E; margin-bottom: 20px;
        }

        .field { margin-bottom: 18px; }
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
        .input:disabled { background: #F5F0EB; color: #A8A29E; cursor: not-allowed; }

        .phone-wrap { display: flex; border: 1.5px solid #E7E0D8; border-radius: 12px; overflow: hidden; transition: border-color 0.15s; }
        .phone-wrap:focus-within { border-color: #C4622D; }
        .phone-prefix {
          padding: 12px 14px; background: #F5F0EB;
          font-size: 14px; font-weight: 600; color: #78716C;
          border-right: 1.5px solid #E7E0D8;
        }
        .phone-input {
          flex: 1; padding: 12px 16px;
          border: none; outline: none;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1C1917;
        }

        .save-btn {
          width: 100%; padding: 14px;
          background: #1C1917; color: white;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .save-btn:hover:not(:disabled) { background: #C4622D; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .secondary-btns { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }

        .outline-btn {
          width: 100%; padding: 13px;
          background: white; color: #78716C;
          border: 1.5px solid #E7E0D8; border-radius: 12px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .outline-btn:hover { border-color: #C4622D; color: #C4622D; }

        .logout-btn {
          width: 100%; padding: 13px;
          background: white; color: #DC2626;
          border: 1.5px solid #FECACA; border-radius: 12px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .logout-btn:hover { background: #FEF2F2; }

        .toast {
          position: fixed; bottom: 32px; left: 50%;
          transform: translateX(-50%);
          background: #1C1917; color: white;
          padding: 12px 24px; border-radius: 100px;
          font-size: 14px; font-weight: 500; z-index: 999;
          animation: toastIn 0.3s ease; white-space: nowrap;
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
        {/* AVATAR */}
        <div className="avatar-section">
          <div className="avatar">
            {avatarUrl
              ? <img src={avatarUrl} alt="" />
              : getInitials()
            }
          </div>
          <div className="avatar-name">{fullName || 'Your Name'}</div>
          <div className="avatar-email">{email}</div>
        </div>

        {/* EDIT DETAILS */}
        <div className="card">
          <div className="card-title">Profile Details</div>

          <div className="field">
            <label className="label">Full name</label>
            <input
              className="input"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Phone number</label>
            <div className="phone-wrap">
              <span className="phone-prefix">+91</span>
              <input
                className="phone-input"
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              value={email}
              disabled
            />
          </div>

          <button className="save-btn" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* OTHER ACTIONS */}
        <div className="secondary-btns">
          <button className="outline-btn" onClick={() => router.push('/my-listings')}>
            View My Listings
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}