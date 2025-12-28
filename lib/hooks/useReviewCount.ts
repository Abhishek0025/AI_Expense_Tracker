import { useQuery } from '@tanstack/react-query'

export function useReviewCount(options?: { enabled?: boolean }) {
  return useQuery<number>({
    queryKey: ['reviewCount'],
    queryFn: async () => {
      const res = await fetch('/api/transactions/review-count', {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401) {
          return 0
        }
        throw new Error('Failed to fetch review count')
      }
      const data = await res.json()
      if (data.success) return data.count
      throw new Error(data.message || 'Failed to fetch review count')
    },
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: false,
  })
}

