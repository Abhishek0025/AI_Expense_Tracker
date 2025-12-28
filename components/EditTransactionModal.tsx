'use client'

import { useState, useEffect, FormEvent } from 'react'
import ModernButton from './ModernButton'
import { useUpdateTransaction } from '@/lib/hooks/useTransactions'
import { useToastContext } from '@/lib/providers/ToastProvider'

interface Category {
  id: string
  name: string
}

interface Transaction {
  id: string
  date: string
  description: string
  amountCents: number
  merchant: string | null
  categoryId: string | null
}

interface EditTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onSuccess?: () => void
}

export default function EditTransactionModal({
  transaction,
  onClose,
  onSuccess,
}: EditTransactionModalProps) {
  const updateTransaction = useUpdateTransaction()
  const { success, error: showError } = useToastContext()
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    date: new Date(transaction.date).toISOString().split('T')[0],
    description: transaction.description,
    merchant: transaction.merchant || '',
    amount: (transaction.amountCents / 100).toString(),
    categoryId: transaction.categoryId || '',
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

    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        date: new Date(formData.date).toISOString(),
        description: formData.description,
        merchant: formData.merchant || null,
        amount: formData.amount,
        categoryId: formData.categoryId || null,
      })

      success('Transaction updated successfully!')
      onSuccess?.()
      onClose()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update transaction')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Transaction
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="edit-date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              id="edit-description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter transaction description"
            />
          </div>

          <div>
            <label htmlFor="edit-merchant" className="block text-sm font-medium text-gray-700 mb-1">
              Merchant
            </label>
            <input
              type="text"
              id="edit-merchant"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter merchant name (optional)"
            />
          </div>

          <div>
            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              id="edit-amount"
              required
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="edit-categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="edit-categoryId"
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

          <div className="flex gap-4 pt-4">
            <ModernButton
              type="submit"
              variant="primary"
              disabled={updateTransaction.isPending}
            >
              {updateTransaction.isPending ? '⏳ Updating...' : '💾 Save Changes'}
            </ModernButton>
            <ModernButton
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={updateTransaction.isPending}
            >
              Cancel
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  )
}

