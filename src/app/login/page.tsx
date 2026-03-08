'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [college, setCollege] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, college },
        },
      })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }

    setLoading(false)
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          background: #FAF7F2;
          font-family: 'DM Sans', sans-serif;
        }

        /* LEFT PANEL */
        .left-panel {
          width: 45%;
          background: #1C1917;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 48px;
          position: relative;
          overflow: hidden;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, #C4622D22, transparent 70%);
        }

        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, #C4622D18, transparent 70%);
        }

        .brand {
          display: flex;
          align-items: center;
        }

        .brand-name {
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
          font-weight: 800;
          font-size: 22px;
          color: #FAF7F2;
          letter-spacing: -0.03em;
        }

        .left-content {
          position: relative;
          z-index: 1;
        }

        .left-tagline {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          line-height: 1.1;
          color: #FAF7F2;
          margin-bottom: 20px;
        }

        .left-tagline em {
          color: #C4622D;
          font-style: italic;
        }

        .left-sub {
          color: #A8A29E;
          font-size: 15px;
          font-weight: 300;
          line-height: 1.6;
          max-width: 300px;
        }

        .left-stats {
          display: flex;
          gap: 32px;
          position: relative;
          z-index: 1;
        }

        .stat { }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #FAF7F2;
        }
        .stat-label {
          font-size: 12px;
          color: #78716C;
          font-weight: 300;
          margin-top: 2px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* RIGHT PANEL */
        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
        }

        .form-heading {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          color: #1C1917;
          margin-bottom: 6px;
        }

        .form-subheading {
          font-size: 14px;
          color: #78716C;
          font-weight: 300;
          margin-bottom: 32px;
        }

        /* TABS */
        .tabs {
          display: flex;
          background: #EFEBE4;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
        }

        .tab {
          flex: 1;
          padding: 10px;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          border: none;
          background: transparent;
          color: #A8A29E;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab.active {
          background: #1C1917;
          color: #FAF7F2;
        }

        /* FORM */
        .field {
          margin-bottom: 16px;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #57534E;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .field input, .field select {
          width: 100%;
          padding: 12px 14px;
          background: #EFEBE4;
          border: 1.5px solid transparent;
          border-radius: 10px;
          font-size: 14px;
          color: #1C1917;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }

        .field input:focus, .field select:focus {
          border-color: #C4622D;
          background: #FAF7F2;
        }

        .field input::placeholder {
          color: #A8A29E;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #1C1917;
          color: #FAF7F2;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.01em;
        }

        .submit-btn:hover { background: #2C2420; }
        .submit-btn:active { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .error-msg {
          background: #FEE2E2;
          color: #991B1B;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .success-msg {
          background: #DCFCE7;
          color: #166534;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .divider {
          border: none;
          border-top: 1px solid #E7E0D8;
          margin: 20px 0;
        }

        .hint {
          text-align: center;
          font-size: 12px;
          color: #A8A29E;
          line-height: 1.5;
        }

        .hint span {
          color: #C4622D;
          cursor: pointer;
          font-weight: 500;
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .left-panel { display: none; }
          .right-panel { padding: 32px 24px; }
        }
      `}</style>

      <div className="auth-root">
        {/* LEFT */}
        <div className="left-panel">
          <div className="brand">
            <span className="brand-name">CampusThrift</span>
          </div>

          <div className="left-content">
            <h1 className="left-tagline">
              Buy & sell<br />
              <em>smarter</em> on<br />
              campus.
            </h1>
            <p className="left-sub">
              The marketplace built for college students.
              Textbooks, electronics, furniture — find it
              from someone who was just in your shoes.
            </p>
          </div>

          <div className="left-stats">
            <div className="stat">
              <div className="stat-num">2.4k</div>
              <div className="stat-label">Listings</div>
            </div>
            <div className="stat">
              <div className="stat-num">₹0</div>
              <div className="stat-label">Platform fee</div>
            </div>
            <div className="stat">
              <div className="stat-num">12+</div>
              <div className="stat-label">Colleges</div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <div className="form-card">
            <h2 className="form-heading">
              {mode === 'login' ? 'Welcome back.' : 'Join CampusThrift.'}
            </h2>
            <p className="form-subheading">
              {mode === 'login'
                ? 'Sign in to your campus marketplace account.'
                : 'Create your free account. College email required.'}
            </p>

            <div className="tabs">
              <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
                Sign In
              </button>
              <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>
                Sign Up
              </button>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <div className="field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Arya Bysani"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>College</label>
                    <input
                      type="text"
                      placeholder="TAPMI Bengaluru"
                      value={college}
                      onChange={e => setCollege(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="field">
                <label>College Email</label>
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            <hr className="divider" />
            <p className="hint">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}>
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}