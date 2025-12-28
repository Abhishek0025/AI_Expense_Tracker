'use client'

import { useState, useEffect, FormEvent } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ModernButton from '@/components/ModernButton'
import { useToastContext } from '@/lib/providers/ToastProvider'

export default function LoginPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { success, error: showError } = useToastContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl') || '/'
      router.push(callbackUrl)
    }
  }, [session, router])

  const validate = () => {
    const newErrors: typeof errors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        console.error('Login error:', result.error)
        setErrors({ general: result.error === 'CredentialsSignin' ? 'Invalid email or password' : 'An error occurred' })
        showError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : 'An error occurred')
      } else if (result?.ok || !result?.error) {
        success('Logged in successfully!')
        // Get callback URL or default to home
        const searchParams = new URLSearchParams(window.location.search)
        const callbackUrl = searchParams.get('callbackUrl') || '/'
        // Use window.location for a full page reload to ensure session is updated
        window.location.href = callbackUrl
      }
    } catch (err) {
      console.error('Login exception:', err)
      setErrors({ general: 'An error occurred. Please try again.' })
      showError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 text-center">
            Sign In
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Sign in to your account to continue
          </p>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <ModernButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </ModernButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

