'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ModernButton from '@/components/ModernButton'
import AIInsights from '@/components/AIInsights'
import AuroraEffect from '@/components/AuroraEffect'
import LandingPage from '@/components/LandingPage'
import { useTransactions } from '@/lib/hooks/useTransactions'

interface TransactionSummary {
  totalTransactions: number
  totalExpenses: number
  totalIncome: number
  recentTransactions: Array<{
    id: string
    date: string
    description: string
    amountCents: number
    categoryName: string | null
  }>
}

export default function Home() {
  const { data: session, status } = useSession()
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  
  // Only fetch transactions if authenticated - hooks must be called unconditionally
  const isAuthenticated = status === 'authenticated' && !!session
  const { data: transactions = [], isLoading } = useTransactions({
    enabled: isAuthenticated,
  })

  // Add timeout for loading state (2 seconds) - if it takes too long, show landing page
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setLoadingTimeout(false)
    }
  }, [status])

  // Authenticated user - calculate summary (must be called unconditionally)
  useEffect(() => {
    if (isAuthenticated && transactions.length > 0) {
      // Expenses have positive amountCents, Income has negative amountCents
      const expenses = transactions
        .filter((t) => t.amountCents > 0) // Expenses (positive)
        .reduce((sum, t) => sum + t.amountCents, 0)
      const income = transactions
        .filter((t) => t.amountCents < 0) // Income (negative)
        .reduce((sum, t) => sum + Math.abs(t.amountCents), 0)

      setSummary({
        totalTransactions: transactions.length,
        totalExpenses: expenses,
        totalIncome: income,
        recentTransactions: transactions.slice(0, 5),
      })
    } else if (isAuthenticated && !isLoading) {
      setSummary(null)
    }
  }, [transactions, isLoading, isAuthenticated])

  // Show loading only briefly (max 2 seconds)
  if (status === 'loading' && !loadingTimeout) {
    return (
      <main className="min-h-screen relative">
        <AuroraEffect />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  // Show landing page if not authenticated or if loading times out
  if (status === 'unauthenticated' || !session || loadingTimeout) {
    return <LandingPage />
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <main className="min-h-screen relative">
      <AuroraEffect />
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-float">
            Welcome back, {session.user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track, categorize, and analyze your expenses with AI-powered insights
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <ModernButton href="/transactions" variant="primary">
              📊 View All Transactions
            </ModernButton>
            <ModernButton href="/transactions/new" variant="success">
              ➕ Add Transaction
            </ModernButton>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : summary ? (
          <>
            {/* AI Insights Section */}
            <div className="mb-12">
              <AIInsights />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Transactions</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{summary.totalTransactions}</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-red-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
                <p className="text-4xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-green-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Income</h3>
                <p className="text-4xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Transactions</h2>
                <ModernButton href="/transactions" variant="primary" className="text-sm px-4 py-2">
                  View All →
                </ModernButton>
              </div>
              {summary.recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summary.recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.categoryName || (
                              <span className="text-gray-400 italic">Uncategorized</span>
                            )}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                              transaction.amountCents < 0
                                ? 'text-green-600'
                                : 'text-gray-900'
                            }`}
                          >
                            {formatCurrency(transaction.amountCents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  No transactions yet. Create your first transaction to get started!
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No transactions found. Create your first transaction to get started!
          </div>
        )}
      </div>
    </main>
  )
}
