'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 'auth' | 'phone'
type Tab = 'signin' | 'signup'

function AuthPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') || '/campuses'
  const redirect = rawRedirect.startsWith('/') ? rawRedirect : '/campuses'

  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('signup')
  const [step, setStep] = useState<Step>('auth')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .single()
        if (!profile || !profile.phone) {
          setStep('phone')
        } else {
          router.push(redirect)
        }
      }
    })
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError('')
    if (!fullName || !email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
    } else {
      setShowOtp(true)
      setMessage('Check your email for a 6-digit OTP code')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    })
    if (error) {
      setError(error.message)
    } else {
      setStep('phone')
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push(redirect)
    }
    setLoading(false)
  }

  const handleSavePhone = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not logged in'); return }

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      let dbError
      if (existing) {
        const { error } = await supabase.from('profiles').update({ phone: `+91${phone}` }).eq('id', user.id)
        dbError = error
      } else {
        const { data: campus } = await supabase
          .from('campuses')
          .select('id')
          .eq('slug', 'mahe-blr')
          .single()

        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || fullName || 'User',
          phone: `+91${phone}`,
          avatar_url: user.user_metadata?.avatar_url || null,
          campus_id: campus?.id || null,
        })
        dbError = error
      }

      if (dbError) {
        console.error('Phone save error:', dbError)
        setError(`Failed to save: ${dbError.message}`)
        return
      }

      router.push(redirect)
    } catch (err: unknown) {
      console.error('Phone save exception:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const styles = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06060F; font-family: 'Space Grotesk', sans-serif; color: #E8EEFF; }

    .auth-root { min-height: 100vh; display: flex; background: #06060F; font-family: 'Space Grotesk', sans-serif; }

    .left-panel {
      width: 45%; background: #0D0D1A;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 52px 48px; position: relative; overflow: hidden;
      border-right: 1px solid rgba(123,92,240,0.18);
    }
    .left-panel::before {
      content: ''; position: absolute; top: -120px; right: -120px;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(123,92,240,0.15), transparent 70%);
    }
    .left-panel::after {
      content: ''; position: absolute; bottom: -80px; left: -80px;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%);
    }
    .brand-name {
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 22px; color: #E8EEFF; letter-spacing: -0.02em;
    }
    .left-content { position: relative; z-index: 1; }
    .left-tagline {
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 46px; line-height: 1.05; color: #E8EEFF; margin-bottom: 20px; letter-spacing: -0.02em;
    }
    .left-tagline em { color: #00D4FF; font-style: normal; }
    .left-sub { color: #8892A4; font-size: 15px; font-weight: 300; line-height: 1.6; max-width: 300px; }
    .left-stats { display: flex; gap: 32px; position: relative; z-index: 1; }
    .stat-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #E8EEFF; }
    .stat-label { font-size: 11px; color: #5A6480; font-weight: 400; margin-top: 2px; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; }

    .right-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px; background: #06060F; }
    .form-card { width: 100%; max-width: 400px; }

    .mobile-brand { display: none; margin-bottom: 28px; }
    .mob-brand-top { display: none; }

    .mobile-hero { display: none; }

    .mob-blob { position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none; }
    .mob-blob-1 { width: 220px; height: 220px; background: #7B5CF0; opacity: 0.3; top: -70px; right: -50px; }
    .mob-blob-2 { width: 160px; height: 160px; background: #00D4FF; opacity: 0.2; bottom: -40px; left: -40px; }
    .mob-blob-3 { width: 130px; height: 130px; background: #FF2D9B; opacity: 0.15; top: 40%; left: 40%; }

    .mob-tagline { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px; line-height: 1.1; color: #E8EEFF; position: relative; z-index: 1; margin-bottom: 8px; }
    .mob-tagline em { color: #00D4FF; font-style: normal; }

    .mob-sub { font-size: 13px; color: #8892A4; font-weight: 300; position: relative; z-index: 1; margin-bottom: 20px; }

    .mob-badges { display: flex; flex-wrap: wrap; gap: 8px; position: relative; z-index: 1; }
    .mob-badge {
      background: rgba(123,92,240,0.1); border: 1px solid rgba(123,92,240,0.2);
      color: #E8EEFF; font-size: 13px; font-weight: 500; padding: 7px 14px;
      border-radius: 100px;
      animation: badge-float 3s ease-in-out infinite;
    }
    .mob-badge:nth-child(2) { animation-delay: 0.5s; }
    .mob-badge:nth-child(3) { animation-delay: 1s; }
    .mob-badge:nth-child(4) { animation-delay: 1.5s; }
    @keyframes badge-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

    .form-heading { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px; color: #E8EEFF; margin-bottom: 6px; }
    .form-sub { font-size: 14px; color: #8892A4; font-weight: 300; margin-bottom: 28px; }

    .tabs { display: flex; background: #111125; border: 1px solid rgba(123,92,240,0.18); border-radius: 10px; padding: 4px; margin-bottom: 24px; }
    .tab { flex: 1; padding: 10px; text-align: center; font-size: 14px; font-weight: 500; border: none; background: transparent; color: #5A6480; border-radius: 7px; cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
    .tab.active { background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white; }

    .error-msg { background: rgba(255,45,155,0.08); border: 1px solid rgba(255,45,155,0.2); color: #FF2D9B; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }

    .google-btn {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 13px; border: 1px solid rgba(123,92,240,0.25); border-radius: 10px;
      background: #111125; font-size: 14px; font-weight: 500; color: #E8EEFF;
      cursor: pointer; transition: all 0.15s; font-family: 'Space Grotesk', sans-serif;
      margin-bottom: 20px;
    }
    .google-btn:hover { border-color: #7B5CF0; background: rgba(123,92,240,0.08); }
    .google-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .divider-line { flex: 1; height: 1px; background: rgba(123,92,240,0.15); }
    .divider-text { font-size: 12px; color: #5A6480; font-family: 'IBM Plex Mono', monospace; }

    .field { margin-bottom: 14px; }
    .auth-input {
      width: 100%; padding: 12px 14px;
      background: #111125; border: 1px solid rgba(123,92,240,0.18);
      border-radius: 10px; font-size: 14px; color: #E8EEFF;
      font-family: 'Space Grotesk', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .auth-input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
    .auth-input::placeholder { color: #5A6480; }

    .pw-wrap { position: relative; }
    .pw-toggle {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #5A6480; padding: 0;
      display: flex; align-items: center;
    }
    .pw-toggle:hover { color: #8892A4; }

    .submit-btn {
      width: 100%; padding: 14px; background: linear-gradient(135deg, #7B5CF0, #5B3FD0); color: white;
      border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
      font-family: 'Space Grotesk', sans-serif; cursor: pointer; margin-top: 6px;
      transition: all 0.2s; letter-spacing: 0.01em;
      box-shadow: 0 0 24px rgba(123,92,240,0.3);
    }
    .submit-btn:hover:not(:disabled) { box-shadow: 0 0 36px rgba(123,92,240,0.5); transform: translateY(-1px); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Phone & OTP card */
    .card-root { min-height: 100vh; background: #06060F; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Space Grotesk', sans-serif; }
    .card { background: #111125; border: 1px solid rgba(123,92,240,0.18); border-radius: 20px; padding: 36px; width: 100%; max-width: 420px; }
    @media (max-width: 480px) { .card { padding: 28px 20px; } }
    .card-heading { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #E8EEFF; margin-bottom: 6px; }
    .card-sub { font-size: 14px; color: #8892A4; font-weight: 300; line-height: 1.6; margin-bottom: 28px; }

    .phone-wrap { display: flex; border: 1px solid rgba(123,92,240,0.18); border-radius: 10px; overflow: hidden; margin-bottom: 16px; transition: border-color 0.15s; }
    .phone-wrap:focus-within { border-color: #00D4FF; }
    .phone-prefix { padding: 13px 14px; background: rgba(123,92,240,0.08); font-size: 14px; font-weight: 600; color: #8892A4; border-right: 1px solid rgba(123,92,240,0.18); font-family: 'IBM Plex Mono', monospace; }
    .phone-input { flex: 1; padding: 13px 14px; border: none; outline: none; font-size: 14px; font-family: 'Space Grotesk', sans-serif; color: #E8EEFF; background: #111125; }

    .otp-input {
      width: 100%; padding: 14px; border: 1px solid rgba(123,92,240,0.18); border-radius: 10px;
      font-size: 22px; font-weight: 700; letter-spacing: 0.3em; text-align: center;
      font-family: 'IBM Plex Mono', monospace; color: #E8EEFF; outline: none;
      margin-bottom: 16px; transition: border-color 0.15s; background: #111125;
    }
    .otp-input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }

    .back-link { width: 100%; margin-top: 12px; background: none; border: none; font-size: 13px; color: #5A6480; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: color 0.15s; }
    .back-link:hover { color: #8892A4; }
    .wa-note { display: flex; align-items: flex-start; gap: 10px; background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.2); border-radius: 10px; padding: 11px 14px; margin-bottom: 16px; }
    .wa-note-icon { flex-shrink: 0; margin-top: 1px; }
    .wa-note-text { font-size: 12px; color: #86efac; font-weight: 400; line-height: 1.5; }

    @media (max-width: 768px) {
      .left-panel { display: none; }
      .right-panel { padding: 0; flex-direction: column; align-items: stretch; justify-content: flex-start; min-height: 100vh; }
      .mob-brand-top { display: block; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #E8EEFF; letter-spacing: -0.02em; margin-bottom: 20px; text-align: left; }
      .form-card { padding: 40px 20px 24px; width: 100%; }
      .form-heading { text-align: center; }
      .form-sub { text-align: center; }
      .mobile-hero { display: flex; flex-direction: column; background: linear-gradient(135deg, #0D0D1A 0%, #111125 50%, #0a0a1a 100%); padding: 32px 20px 40px; border-radius: 28px 28px 0 0; position: relative; overflow: hidden; margin-top: auto; border-top: 1px solid rgba(123,92,240,0.18); }
      .google-btn { padding: 15px; }
      .submit-btn { padding: 15px; }
      .auth-input { padding: 14px; font-size: 16px; }
    }
    @media (max-width: 400px) {
      .form-card { padding: 32px 16px 20px; }
      .form-heading { font-size: 24px; }
      .tab { padding: 10px 6px; font-size: 13px; }
    }
  `

  if (step === 'phone') {
    return (
      <>
        <style suppressHydrationWarning>{styles}</style>
        <div className="card-root">
          <div className="card">
            <div style={{ marginBottom: 28 }}>
              <span className="brand-name">CampusThrift</span>
            </div>
            <h2 className="card-heading">One last step</h2>
            <p className="card-sub">Your phone number is how buyers will reach you on WhatsApp.</p>
            {error && <div className="error-msg">{error}</div>}
            <div className="phone-wrap">
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="phone-input"
              />
            </div>
            <div className="wa-note">
              <svg className="wa-note-icon" width="15" height="15" viewBox="0 0 24 24" fill="#22c55e">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="wa-note-text">Make sure this is your correct WhatsApp number.</span>
            </div>
            <button onClick={handleSavePhone} disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : 'Finish Setup →'}
            </button>
          </div>
        </div>
      </>
    )
  }

  if (showOtp) {
    return (
      <>
        <style suppressHydrationWarning>{styles}</style>
        <div className="card-root">
          <div className="card">
            <div style={{ marginBottom: 28 }}>
              <span className="brand-name">CampusThrift</span>
            </div>
            <h2 className="card-heading">Check your email</h2>
            <p className="card-sub">{message}</p>
            {error && <div className="error-msg">{error}</div>}
            <input
              type="text"
              placeholder="······"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="otp-input"
            />
            <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} className="submit-btn">
              {loading ? 'Verifying...' : 'Verify Email →'}
            </button>
            <button onClick={() => setShowOtp(false)} className="back-link">← Back</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style suppressHydrationWarning>{styles}</style>
      <div className="auth-root">
        {/* LEFT */}
        <div className="left-panel">
          <span className="brand-name">CampusThrift</span>
          <div className="left-content">
            <h1 className="left-tagline">
              Buy &amp; sell<br />
              <em>smarter</em> on<br />
              campus.
            </h1>
            <p className="left-sub">
              The marketplace built for college students. Textbooks, electronics, furniture — find it from someone who was just in your shoes.
            </p>
          </div>
          <div className="left-stats">
            <div>
              <div className="stat-num">₹0</div>
              <div className="stat-label">Platform fee</div>
            </div>
            <div>
              <div className="stat-num">2 min</div>
              <div className="stat-label">To list</div>
            </div>
            <div>
              <div className="stat-num">12+</div>
              <div className="stat-label">Colleges</div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <div className="form-card">
            {/* Mobile-only brand at top */}
            <div className="mob-brand-top" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>CampusThrift</div>

            <h2 className="form-heading">
              {tab === 'signup' ? 'Create your account' : 'Welcome back.'}
            </h2>
            <p className="form-sub">
              {tab === 'signup' ? 'Join your campus marketplace.' : 'Sign in to your account.'}
            </p>

            <div className="tabs">
              {(['signup', 'signin'] as Tab[]).map(t => (
                <button key={t} onClick={() => { setTab(t); setError('') }} className={`tab ${tab === t ? 'active' : ''}`}>
                  {t === 'signup' ? 'Sign Up' : 'Sign In'}
                </button>
              ))}
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button onClick={handleGoogleSignIn} disabled={loading} className="google-btn">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            {tab === 'signup' && (
              <>
                <div className="field">
                  <input type="text" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} className="auth-input" />
                </div>
                <div className="field">
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" />
                </div>
                <div className="field pw-wrap">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="pw-toggle">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button onClick={handleSignUp} disabled={loading} className="submit-btn">
                  {loading ? 'Creating account...' : 'Create Account →'}
                </button>
              </>
            )}

            {tab === 'signin' && (
              <>
                <div className="field">
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" />
                </div>
                <div className="field pw-wrap">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="pw-toggle">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button onClick={handleSignIn} disabled={loading} className="submit-btn">
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
              </>
            )}
          </div>

          {/* Mobile-only bottom dark section */}
          <div className="mobile-hero">
            <div className="mob-blob mob-blob-1" />
            <div className="mob-blob mob-blob-2" />
            <div className="mob-blob mob-blob-3" />
            <h2 className="mob-tagline">Buy &amp; sell <em>smarter</em> on campus.</h2>
            <p className="mob-sub">Zero fees. WhatsApp direct. Done in 2 min.</p>
            <div className="mob-badges">
              <span className="mob-badge">📚 Books</span>
              <span className="mob-badge">👟 Kicks</span>
              <span className="mob-badge">💻 Tech</span>
              <span className="mob-badge">👗 Clothes</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#06060F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', color: '#5A6480' }}>Loading...</div>}>
      <AuthPageInner />
    </Suspense>
  )
}