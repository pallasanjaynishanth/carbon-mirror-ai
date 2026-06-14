'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/layout/AuthProvider'
import { Globe2, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageContent />
    </Suspense>
  )
}

function AuthPageFallback() {
  return (
    <div className="min-h-screen bg-smoke-950 flex items-center justify-center p-6">
      <div className="w-12 h-12 rounded-2xl bg-earth-500/20 border border-earth-500/30 flex items-center justify-center animate-pulse">
        <Globe2 className="w-6 h-6 text-earth-400" />
      </div>
    </div>
  )
}

function AuthPageContent() {
  const { signIn, signUp, signInGoogle, user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'signin')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(form.email, form.password, form.name)
        toast.success('Welcome to CarbonMirror! 🌍')
      } else {
        await signIn(form.email, form.password)
        toast.success('Welcome back!')
      }
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.code === 'auth/wrong-password' ? 'Incorrect password.'
        : err?.code === 'auth/user-not-found' ? 'No account with that email.'
        : err?.code === 'auth/email-already-in-use' ? 'Email already in use.'
        : 'Something went wrong. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      await signInGoogle()
      toast.success('Signed in with Google! 🌍')
      router.push('/dashboard')
    } catch {
      toast.error('Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-smoke-950 flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-earth-900/20 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-earth-500 flex items-center justify-center shadow-glow">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">CarbonMirror AI</div>
              <div className="text-xs text-smoke-400">See your everyday impact</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-smoke-800 p-6">
          {/* Tab switch */}
          <div className="flex rounded-xl bg-smoke-900 p-1 mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-smoke-700 text-white' : 'text-smoke-400 hover:text-smoke-300'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-smoke-900 border border-smoke-800 text-white placeholder-smoke-500 text-sm focus:outline-none focus:border-earth-500 transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke-500" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Email address"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-smoke-900 border border-smoke-800 text-white placeholder-smoke-500 text-sm focus:outline-none focus:border-earth-500 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke-500" />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Password"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-smoke-900 border border-smoke-800 text-white placeholder-smoke-500 text-sm focus:outline-none focus:border-earth-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-500 hover:text-smoke-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-earth-500 hover:bg-earth-400 text-white font-semibold text-sm transition-all disabled:opacity-60 shadow-glow flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-smoke-800" />
            <span className="text-xs text-smoke-600">or</span>
            <div className="flex-1 h-px bg-smoke-800" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-smoke-900 hover:bg-smoke-800 border border-smoke-800 text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-smoke-600 mt-4">
          By continuing, you agree to our{' '}
          <span className="text-smoke-400 hover:text-smoke-300 cursor-pointer">Terms</span>
          {' & '}
          <span className="text-smoke-400 hover:text-smoke-300 cursor-pointer">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  )
}
