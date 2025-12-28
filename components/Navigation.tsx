'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useReviewCount } from '@/lib/hooks/useReviewCount'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  // Only fetch review count if authenticated
  const { data: reviewCount = 0 } = useReviewCount({
    enabled: status === 'authenticated' && !!session,
  })

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link
            href="/"
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 tracking-tight"
            style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}
          >
            AI Expense Tracker
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {session?.user && (
              <>
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/transactions"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/transactions')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Transactions
                </Link>
                <Link
                  href="/transactions/new"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/transactions/new')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  New Transaction
                </Link>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/upload"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/upload')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Import CSV
                </Link>
                <Link
                  href="/ai-help"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/ai-help')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  🤖 AI Help
                </Link>
                <Link
                  href="/transactions/review"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    isActive('/transactions/review')
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Needs Review
                  {reviewCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {reviewCount > 99 ? '99+' : reviewCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            
            {status === 'loading' ? (
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-4 pl-4 border-l border-gray-300"></div>
            ) : session?.user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                <span className="text-sm text-gray-600">
                  {session.user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

