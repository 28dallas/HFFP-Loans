import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setAuthError('Please enter your email and password.')
      return
    }
    setAuthError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setAuthError(error.message)
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3">
            <Landmark size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-text">HFFP Admin</h1>
          <p className="text-sm text-muted mt-1">Home Finance & Fellowship Program</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-text mb-5">Sign in to your account</h2>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Email Address</label>
              <input
                type="email"
                placeholder="admin@hffp.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {authError && (
              <p className="text-xs text-danger bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}
            <Button type="submit" loading={loading} className="w-full justify-center mt-1">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
