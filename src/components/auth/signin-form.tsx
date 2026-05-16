'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await signIn('nodemailer', {
        email,
        redirect: false,
        callbackUrl: '/dashboard',
      })
      if (res?.error) throw new Error(res.error)
      setSent(true)
    } catch {
      setError('Could not send link — check your email and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255, 42, 109, 0.08)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF2A6D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[15px] font-semibold mb-1" style={{ color: '#16163D' }}>Check your inbox</p>
        <p className="text-sm" style={{ color: '#8B8BA8' }}>
          We sent a magic link to <strong style={{ color: '#4A4A6A' }}>{email}</strong>.<br />
          Click the link to sign in.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Google */}
      <a
        href="/api/auth/signin/google?callbackUrl=/dashboard"
        className="flex items-center justify-center gap-2.5 w-full px-4 py-2 rounded-[10px] border text-[14px] font-medium no-underline transition-all"
        style={{ background: '#FFFFFF', borderColor: '#E8E3D8', color: '#4A4A6A' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.color = '#FF2A6D'; e.currentTarget.style.background = 'rgba(255,42,109,0.04)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.color = '#4A4A6A'; e.currentTarget.style.background = '#FFFFFF' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </a>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: '#F0EDE4' }} />
        <span className="text-xs font-medium" style={{ color: '#8B8BA8' }}>or use email</span>
        <div className="flex-1 h-px" style={{ background: '#F0EDE4' }} />
      </div>

      {/* Email */}
      <form onSubmit={handleEmail}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null) }}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-2 rounded-[10px] border text-[14px] outline-none transition-all font-inherit mb-3"
          style={{ background: '#FCF9F2', borderColor: '#E8E3D8', color: '#16163D' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#FF2A6D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,42,109,0.10)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E3D8'; e.currentTarget.style.boxShadow = 'none' }}
        />
        {error && <p className="text-[12px] mb-2" style={{ color: '#FF2A6D' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] border-none text-[14px] font-semibold cursor-pointer transition-all font-inherit disabled:cursor-not-allowed"
          style={{
            background: '#FF2A6D',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(255,42,109,0.2)',
            opacity: loading || !email.trim() ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { if (!loading && email.trim()) e.currentTarget.style.background = '#E61D5C' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FF2A6D' }}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              Sending...
            </>
          ) : 'Send magic link'}
        </button>
      </form>
    </div>
  )
}
