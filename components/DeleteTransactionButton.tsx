'use client'

import { useState } from 'react'
import { useDeleteTransaction } from '@/lib/hooks/useTransactions'
import { useToastContext } from '@/lib/providers/ToastProvider'

interface DeleteTransactionButtonProps {
  transactionId: string
  description: string
  onSuccess?: () => void
  className?: string
}

export default function DeleteTransactionButton({
  transactionId,
  description,
  onSuccess,
  className = '',
}: DeleteTransactionButtonProps) {
  const deleteTransaction = useDeleteTransaction()
  const { success, error: showError } = useToastContext()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    try {
      await deleteTransaction.mutateAsync(transactionId)
      success('Transaction deleted successfully!')
      onSuccess?.()
      setShowConfirm(false)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete transaction')
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs text-gray-600">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={deleteTransaction.isPending}
          className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          disabled={deleteTransaction.isPending}
          className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleteTransaction.isPending}
      className={`px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={`Delete "${description}"`}
    >
      {deleteTransaction.isPending ? '⏳' : '🗑️'} Delete
    </button>
  )
}

