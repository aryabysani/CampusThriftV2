'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tag, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 'auth' | 'phone'
type Tab = 'signin' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/campuses'

  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('signup')
  const [step, setStep] = useState<Step>('auth')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Sign up form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Phone step
  const [phone, setPhone] = useState('')

  // OTP step
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')

 useEffect(() => {
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (user) {
      // Only show phone step if coming from sign up (no profile yet)
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
    } catch (err: any) {
      console.error('Phone save exception:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // PHONE STEP
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Tag className="text-emerald-500" size={22} />
            <span className="font-bold text-lg">CampusThrift</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">One last step 👋</h2>
          <p className="text-gray-500 text-sm mb-8">
            Your phone number is how buyers will reach you on WhatsApp
          </p>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden mb-4 focus-within:border-emerald-400 transition-colors">
            <span className="bg-gray-50 px-4 py-3.5 text-gray-500 text-sm font-medium border-r border-gray-200">+91</span>
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="flex-1 px-4 py-3.5 text-sm outline-none"
            />
          </div>
          <button
            onClick={handleSavePhone}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Finish Setup →'}
          </button>
        </div>
      </div>
    )
  }

  // OTP STEP
  if (showOtp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Tag className="text-emerald-500" size={22} />
            <span className="font-bold text-lg">CampusThrift</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-8">{message}</p>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm mb-4 outline-none focus:border-emerald-400 transition-colors tracking-widest text-center text-lg font-bold"
          />
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 6}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email →'}
          </button>
          <button onClick={() => setShowOtp(false)} className="w-full mt-3 text-gray-400 text-sm hover:text-gray-600">
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // MAIN AUTH
  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SIDE - desktop only */}
      <div className="hidden md:flex flex-col justify-center px-16 bg-gray-50 w-1/2 border-r border-gray-100">
        <div className="flex items-center gap-2 mb-10">
          <Tag className="text-emerald-500" size={28} />
          <span className="font-bold text-2xl">CampusThrift</span>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
          Buy & sell smarter<br />on campus.
        </h2>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          The marketplace built for college students. Textbooks, electronics, furniture — find it from someone who was just in your shoes.
        </p>
        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full border border-emerald-100 w-fit">
          <CheckCircle size={15} />
          Zero platform fees
        </span>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center px-8 md:px-16 w-full md:w-1/2">
        <div className="flex items-center gap-2 mb-8 md:hidden">
          <Tag className="text-emerald-500" size={22} />
          <span className="font-bold text-lg">CampusThrift</span>
        </div>

        <h3 className="text-2xl font-bold mb-6">
          {tab === 'signup' ? 'Create your account' : 'Welcome back'}
        </h3>

        {/* TABS */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          {(['signup', 'signin'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

        {/* GOOGLE */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 text-sm font-medium hover:bg-gray-50 transition-colors mb-6 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-gray-400 text-xs">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* SIGN UP FORM */}
        {tab === 'signup' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </div>
        )}

        {/* SIGN IN FORM */}
        {tab === 'signin' && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}