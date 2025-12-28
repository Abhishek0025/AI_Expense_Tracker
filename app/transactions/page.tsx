'use client'

import { useState, useMemo, useEffect } from 'react'
import TransactionTable from '@/components/TransactionTable'
import ModernButton from '@/components/ModernButton'
import { TransactionTableSkeleton } from '@/components/SkeletonLoader'
import TransactionPagination from '@/components/TransactionPagination'
import { useTransactions, useAICategorize } from '@/lib/hooks/useTransactions'
import { useToastContext } from '@/lib/providers/ToastProvider'

const ITEMS_PER_PAGE = 20

export default function TransactionsPage() {
  const { data: transactions = [], isLoading, error } = useTransactions()
  const aiCategorize = useAICategorize()
  const { success, error: showError, info } = useToastContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')

  const handleAiCategorize = async () => {
    const uncategorizedCount = transactions.filter(t => !t.categoryName).length
    if (uncategorizedCount === 0) {
      info('All transactions are already categorized! Create some uncategorized transactions to use AI categorization.')
      return
    }

    try {
      const result = await aiCategorize.mutateAsync()
      if (result.processedCount === 0) {
        info('No uncategorized transactions found to categorize.')
      } else {
        success(`AI successfully categorized ${result.categorizedCount} out of ${result.processedCount} transactions!`)
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const uncategorizedCount = transactions.filter(t => !t.categoryName).length

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>()
    transactions.forEach(t => {
      if (t.categoryName) cats.add(t.categoryName)
    })
    return Array.from(cats).sort()
  }, [transactions])

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        (t.merchant && t.merchant.toLowerCase().includes(query)) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (filterCategory !== 'all') {
      if (filterCategory === 'uncategorized') {
        filtered = filtered.filter(t => !t.categoryName)
      } else {
        filtered = filtered.filter(t => t.categoryName === filterCategory)
      }
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = filtered.filter(t => {
        const txDate = new Date(t.date)
        switch (filterDateRange) {
          case 'today':
            return txDate >= today
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return txDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return txDate >= monthAgo
          case 'year':
            const yearAgo = new Date(today)
            yearAgo.setFullYear(yearAgo.getFullYear() - 1)
            return txDate >= yearAgo
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          comparison = a.amountCents - b.amountCents
          break
        case 'description':
          comparison = a.description.localeCompare(b.description)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [transactions, searchQuery, filterCategory, filterDateRange, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredAndSortedTransactions.slice(start, end)
  }, [filteredAndSortedTransactions, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterCategory, filterDateRange])

  // Reset to page 1 when transactions change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <TransactionTableSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-white/80 backdrop-blur-sm rounded-lg">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Transactions
            </h1>
            <p className="text-gray-600">
              {filteredAndSortedTransactions.length} of {transactions.length} transactions • {uncategorizedCount} uncategorized
              {totalPages > 1 && (
                <span className="ml-2 text-sm text-gray-500">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
              {uncategorizedCount === 0 && (
                <span className="ml-2 text-sm text-purple-600">
                  (Create a transaction without a category to test AI)
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ModernButton
              onClick={handleAiCategorize}
              variant="ai"
              disabled={aiCategorize.isPending || uncategorizedCount === 0}
              className="relative"
            >
              {aiCategorize.isPending ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  AI Processing...
                </>
              ) : uncategorizedCount > 0 ? (
                <>
                  <span className="mr-2">🤖</span>
                  AI Categorize ({uncategorizedCount})
                </>
              ) : (
                <>
                  <span className="mr-2">✅</span>
                  All Categorized
                </>
              )}
            </ModernButton>
            <ModernButton href="/upload" variant="success">
              📥 Import CSV
            </ModernButton>
            <ModernButton href="/transactions/new" variant="primary">
              ➕ New Transaction
            </ModernButton>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search transactions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="uncategorized">Uncategorized</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filterDateRange}
              onChange={(e) => {
                setFilterDateRange(e.target.value as typeof filterDateRange)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as typeof sortBy)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="description">Sort by Description</option>
              </select>
              <button
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterCategory !== 'all' || filterDateRange !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterCategory('all')
                setFilterDateRange('all')
                setCurrentPage(1)
              }}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        <TransactionTable transactions={paginatedTransactions} />
        {totalPages > 1 && (
          <TransactionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}

