'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import DashboardKpis from '@/components/DashboardKpis'
import { DashboardSkeleton } from '@/components/SkeletonLoader'
import ModernButton from '@/components/ModernButton'
import { useDashboard } from '@/lib/hooks/useDashboard'

// Lazy load chart components
const SpendByCategory = dynamic(() => import('@/components/Charts/SpendByCategory'), {
  loading: () => <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 h-80 animate-pulse" />,
})

const MonthlyTrend = dynamic(() => import('@/components/Charts/MonthlyTrend'), {
  loading: () => <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 h-80 animate-pulse" />,
})

const TopMerchants = dynamic(() => import('@/components/Charts/TopMerchants'), {
  loading: () => <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 h-80 animate-pulse" />,
})

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | '30days' | '3months' | '6months' | 'year' | 'all'>('30days')
  const { data, isLoading, error } = useDashboard(dateRange)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Import transactions to see charts and insights
          </p>
          <div className="flex gap-4 justify-center">
            <ModernButton href="/transactions/new" variant="primary">
              ➕ Add Transaction
            </ModernButton>
            <ModernButton href="/upload" variant="success">
              📥 Import CSV
            </ModernButton>
          </div>
        </div>
      </div>
    )
  }

  const hasData = data.kpis.txCount > 0

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: 'year', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">Financial insights and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="date-range" className="text-sm font-medium text-gray-700">
              Date Range:
            </label>
            <select
              id="date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          <DashboardKpis kpis={data.kpis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SpendByCategory data={data.spendByCategory} />
            <TopMerchants data={data.topMerchants} />
          </div>

          <div className="mb-6">
            <MonthlyTrend data={data.monthlySpend} />
          </div>
        </>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Import transactions to see charts and insights
          </p>
          <div className="flex gap-4 justify-center">
            <ModernButton href="/transactions/new" variant="primary">
              ➕ Add Transaction
            </ModernButton>
            <ModernButton href="/upload" variant="success">
              📥 Import CSV
            </ModernButton>
          </div>
        </div>
      )}
    </div>
  )
}

