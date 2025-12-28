'use client'

import { useMemo } from 'react'
import ModernButton from './ModernButton'
import { useTransactions, useAICategorize } from '@/lib/hooks/useTransactions'
import { useToastContext } from '@/lib/providers/ToastProvider'

export default function AIInsights() {
  const { data: transactions = [], isLoading } = useTransactions()
  const aiCategorize = useAICategorize()
  const { success, error: showError } = useToastContext()

  const stats = useMemo(() => {
    if (!transactions.length) return null

    const categorized = transactions.filter((t) => t.categoryName)
    const uncategorized = transactions.filter((t) => !t.categoryName)
    const aiCategorized = transactions.filter((t: any) => t.aiConfidence)
    const avgConfidence = aiCategorized.length > 0
      ? aiCategorized.reduce((sum: number, t: any) => sum + (t.aiConfidence || 0), 0) / aiCategorized.length
      : 0

    return {
      totalCategorized: categorized.length,
      totalUncategorized: uncategorized.length,
      averageConfidence: avgConfidence,
      lastRunDate: null,
    }
  }, [transactions])

  const handleCategorize = async () => {
    try {
      const result = await aiCategorize.mutateAsync()
      const confidence = result.processedCount > 0
        ? ((result.categorizedCount / result.processedCount) * 100).toFixed(1)
        : '0'
      success(`AI successfully categorized ${result.categorizedCount} out of ${result.processedCount} transactions! (${confidence}% confidence)`)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl shadow-2xl p-6 text-white">
        <div className="animate-pulse">Loading AI insights...</div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🤖</span>
          <div>
            <h3 className="text-2xl font-bold">AI Assistant</h3>
            <p className="text-purple-100 text-sm">Powered by OpenAI GPT-4o-mini</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-purple-100 mb-1">Categorized</p>
            <p className="text-3xl font-bold">{stats.totalCategorized}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-purple-100 mb-1">Uncategorized</p>
            <p className="text-3xl font-bold">{stats.totalUncategorized}</p>
          </div>
        </div>

        {stats.averageConfidence > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
            <p className="text-sm text-purple-100 mb-1">Average AI Confidence</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/30 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${stats.averageConfidence * 100}%` }}
                />
              </div>
              <span className="text-lg font-bold">{(stats.averageConfidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {stats.totalUncategorized > 0 ? (
          <button
            onClick={handleCategorize}
            disabled={aiCategorize.isPending}
            className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-xl hover:bg-purple-50 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {aiCategorize.isPending ? (
              <>
                <span className="animate-spin inline-block mr-2">⚡</span>
                AI Processing...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Auto-Categorize {stats.totalUncategorized} Transactions
              </>
            )}
          </button>
        ) : (
          <div className="text-center py-3 bg-white/20 backdrop-blur-sm rounded-lg">
            <p className="text-sm">🎉 All transactions are categorized!</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/30">
          <p className="text-xs text-purple-100">
            💡 <strong>How it works:</strong> AI analyzes transaction descriptions, amounts, and merchants to automatically assign categories with confidence scores.
          </p>
        </div>
      </div>
    </div>
  )
}

