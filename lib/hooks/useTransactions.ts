import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Transaction {
  id: string
  date: string
  description: string
  amountCents: number
  merchant: string | null
  categoryName: string | null
  categoryId: string | null
}

export function useTransactions(options?: { enabled?: boolean }) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/transactions', {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401) {
          // Don't redirect here - let the component handle it
          throw new Error('Unauthorized')
        }
        throw new Error('Failed to fetch transactions')
      }
      const data = await res.json()
      if (data.success) return data.data
      throw new Error(data.message || 'Failed to fetch transactions')
    },
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transaction: {
      date: string
      description: string
      amount: string | number
      merchant?: string
      categoryId?: string
    }) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(transaction),
      })
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        const error = await res.json()
        throw new Error(error.message || 'Failed to create transaction')
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useAICategorize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        const error = await res.json()
        throw new Error(error.message || 'Failed to categorize transactions')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      date?: string
      description?: string
      amount?: string | number
      merchant?: string | null
      categoryId?: string | null
    }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        const error = await res.json()
        throw new Error(error.message || 'Failed to update transaction')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete transaction')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

