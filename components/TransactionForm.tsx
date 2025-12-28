'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import ModernButton from './ModernButton'
import { useCreateTransaction } from '@/lib/hooks/useTransactions'

interface Category {
  id: string
  name: string
}

export default function TransactionForm() {
  const router = useRouter()
  const createTransaction = useCreateTransaction()
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    merchant: '',
    amount: '',
    categoryId: '',
  })

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data)
        }
      })
      .catch((err) => {
        console.error('Error fetching categories:', err)
      })
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    try {
      await createTransaction.mutateAsync({
        date: new Date(formData.date).toISOString(),
        description: formData.description,
        merchant: formData.merchant || undefined,
        amount: formData.amount,
        categoryId: formData.categoryId || undefined,
      })

      // Redirect to transactions page
      router.push('/transactions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date *
        </label>
        <input
          type="date"
          id="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <input
          type="text"
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter transaction description"
        />
      </div>

      <div>
        <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
          Merchant
        </label>
        <input
          type="text"
          id="merchant"
          value={formData.merchant}
          onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter merchant name (optional)"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount *
        </label>
        <input
          type="number"
          id="amount"
          required
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="categoryId"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category (optional)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={createTransaction.isPending}
          className="relative px-6 py-3 font-semibold text-white rounded-xl transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/50"
        >
          <span className="relative z-10 flex items-center gap-2">
            {createTransaction.isPending ? '⏳ Creating...' : '✨ Create Transaction'}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
        <ModernButton
          onClick={() => router.push('/transactions')}
          variant="secondary"
        >
          Cancel
        </ModernButton>
      </div>
    </form>
  )
}

