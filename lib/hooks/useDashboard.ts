import { useQuery } from '@tanstack/react-query'

interface DashboardData {
  spendByCategory: Array<{ category: string; totalCents: number }>
  monthlySpend: Array<{ month: string; expenseCents: number; incomeCents: number }>
  topMerchants: Array<{ merchant: string; totalCents: number }>
  kpis: {
    totalExpenseCents: number
    totalIncomeCents: number
    netCents: number
    txCount: number
  }
}

export function useDashboard(dateRange: string = '30days') {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/summary?dateRange=${dateRange}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await res.json()
      if (data.success) return data.data
      throw new Error(data.message || 'Failed to fetch dashboard data')
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

