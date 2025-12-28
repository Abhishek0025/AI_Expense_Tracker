'use client'

import { useState, useEffect } from 'react'
import ModernButton from '@/components/ModernButton'
import CategorySelect from '@/components/CategorySelect'
import { useUpdateTransaction } from '@/lib/hooks/useTransactions'
import { useToastContext } from '@/lib/providers/ToastProvider'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface ReviewTransaction {
  id: string
  date: string
  description: string
  amountCents: number
  merchant: string | null
  categoryId: string | null
  categoryName: string | null
  aiConfidence: number | null
  aiReasoning: string | null
  aiSuggestedCategory: string | null
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAmount(amountCents: number): string {
  const amount = amountCents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default function ReviewQueuePage() {
  const queryClient = useQueryClient()
  const updateTransaction = useUpdateTransaction()
  const { success, error: showError } = useToastContext()
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const [processingRetry, setProcessingRetry] = useState(false)

  const { data: transactions = [], isLoading, error, refetch } = useQuery<ReviewTransaction[]>({
    queryKey: ['reviewQueue'],
    queryFn: async () => {
      const res = await fetch('/api/transactions/review-queue', {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        throw new Error('Failed to fetch review queue')
      }
      const data = await res.json()
      if (data.success) return data.data
      throw new Error(data.message || 'Failed to fetch review queue')
    },
    staleTime: 10 * 1000, // 10 seconds
  })

  const { data: categories = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      if (data.success) return data.data
      throw new Error(data.message || 'Failed to fetch categories')
    },
  })

  const handleCategoryChange = async (transactionId: string, categoryId: string | null) => {
    setUpdatingIds((prev) => new Set(prev).add(transactionId))
    try {
      await updateTransaction.mutateAsync({
        id: transactionId,
        categoryId,
      })
      success('Category updated successfully!')
      refetch()
      queryClient.invalidateQueries({ queryKey: ['reviewCount'] })
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev)
        next.delete(transactionId)
        return next
      })
    }
  }

  const handleApprove = async (transactionId: string, suggestedCategoryName: string | null) => {
    if (!suggestedCategoryName) {
      showError('No suggested category to approve')
      return
    }
    // Find category ID by name (case-insensitive)
    const category = categories.find(
      (c) => c.name.toLowerCase() === suggestedCategoryName.toLowerCase()
    )
    if (!category) {
      showError(`Category "${suggestedCategoryName}" not found`)
      return
    }
    await handleCategoryChange(transactionId, category.id)
  }

  const handleRetryAI = async () => {
    setProcessingRetry(true)
    try {
      const res = await fetch('/api/ai/retry-low-confidence', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to run AI review')
      }
      const data = await res.json()
      success(`AI review completed: ${data.categorizedCount} transactions auto-categorized, ${data.processedCount} total reviewed`)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['reviewCount'] })
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to run AI review')
    } finally {
      setProcessingRetry(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading review queue...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error instanceof Error ? error.message : 'An error occurred'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Review Queue
            </h1>
            <p className="text-gray-600">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} need{transactions.length === 1 ? 's' : ''} review
            </p>
          </div>
          <div className="flex gap-3">
            <ModernButton
              onClick={handleRetryAI}
              variant="ai"
              disabled={processingRetry || transactions.length === 0}
            >
              {processingRetry ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2">🤖</span>
                  Run AI on Review Queue
                </>
              )}
            </ModernButton>
            <ModernButton href="/transactions" variant="secondary">
              Back to Transactions
            </ModernButton>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600 text-lg">No transactions need review!</p>
            <p className="text-gray-500">All transactions are properly categorized.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-orange-50 to-red-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Current Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    AI Confidence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    AI Suggestion
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.merchant && (
                        <div className="text-xs text-gray-500">{transaction.merchant}</div>
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                        transaction.amountCents < 0 ? 'text-green-600' : 'text-gray-900'
                      }`}
                    >
                      {formatAmount(transaction.amountCents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.categoryName ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.categoryName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 italic">
                          Uncategorized
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.aiConfidence !== null ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.aiConfidence >= 0.8
                              ? 'bg-green-100 text-green-800'
                              : transaction.aiConfidence >= 0.6
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {(transaction.aiConfidence * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.aiSuggestedCategory ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.aiSuggestedCategory}
                          </div>
                          {transaction.aiReasoning && (
                            <div className="text-xs text-gray-500 mt-1 max-w-xs">
                              {transaction.aiReasoning}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CategorySelect
                          value={transaction.categoryId}
                          onChange={(categoryId) => handleCategoryChange(transaction.id, categoryId)}
                          disabled={updatingIds.has(transaction.id) || updateTransaction.isPending}
                          className="min-w-[150px]"
                        />
                        {transaction.aiSuggestedCategory && (
                          <button
                            onClick={() => handleApprove(transaction.id, transaction.aiSuggestedCategory)}
                            disabled={updatingIds.has(transaction.id) || updateTransaction.isPending}
                            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Approve AI suggestion: ${transaction.aiSuggestedCategory}`}
                          >
                            ✓ Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

