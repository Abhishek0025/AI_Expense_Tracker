'use client'

import { useState } from 'react'
import EditTransactionModal from './EditTransactionModal'
import DeleteTransactionButton from './DeleteTransactionButton'
import CategorySelect from './CategorySelect'
import { useUpdateTransaction } from '@/lib/hooks/useTransactions'
import { useToastContext } from '@/lib/providers/ToastProvider'

interface Transaction {
  id: string
  date: string
  description: string
  amountCents: number
  merchant: string | null
  categoryName: string | null
  categoryId: string | null
}

interface TransactionTableProps {
  transactions: Transaction[]
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

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const updateTransaction = useUpdateTransaction()
  const { success, error: showError } = useToastContext()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null)

  const handleCategoryChange = async (transactionId: string, categoryId: string | null) => {
    setUpdatingCategoryId(transactionId)
    try {
      await updateTransaction.mutateAsync({
        id: transactionId,
        categoryId,
      })
      success('Category updated successfully!')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setUpdatingCategoryId(null)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-600 text-lg">No transactions found.</p>
        <p className="text-gray-500">Create your first transaction to get started!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Merchant
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction, index) => (
            <tr
              key={transaction.id}
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 transform hover:scale-[1.01]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {transaction.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {transaction.merchant || (
                  <span className="text-gray-400 italic">—</span>
                )}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                  transaction.amountCents < 0
                    ? 'text-green-600'
                    : 'text-gray-900'
                }`}
              >
                {formatAmount(transaction.amountCents)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <CategorySelect
                  value={transaction.categoryId}
                  onChange={(categoryId) => handleCategoryChange(transaction.id, categoryId)}
                  disabled={updatingCategoryId === transaction.id || updateTransaction.isPending}
                  className="min-w-[150px]"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTransaction(transaction as Transaction & { categoryId: string | null })}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    title="Edit transaction"
                  >
                    ✏️ Edit
                  </button>
                  <DeleteTransactionButton
                    transactionId={transaction.id}
                    description={transaction.description}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  )
}

