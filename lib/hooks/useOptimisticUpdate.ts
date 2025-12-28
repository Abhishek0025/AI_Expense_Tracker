import { useState, useCallback } from 'react'

/**
 * Custom hook for optimistic UI updates
 * @param initialData - Initial data state
 * @param updateFn - Function to update data optimistically
 * @param rollbackFn - Function to rollback on error
 * @returns [data, updateOptimistically, isUpdating]
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T, newData: Partial<T>) => T,
  rollbackFn?: (originalData: T) => Promise<void>
) {
  const [data, setData] = useState<T>(initialData)
  const [isUpdating, setIsUpdating] = useState(false)
  const [originalData, setOriginalData] = useState<T>(initialData)

  const updateOptimistically = useCallback(
    async (newData: Partial<T>, apiCall: () => Promise<void>) => {
      // Store original data
      setOriginalData(data)
      
      // Update optimistically
      setData(updateFn(data, newData))
      setIsUpdating(true)

      try {
        await apiCall()
      } catch (error) {
        // Rollback on error
        setData(originalData)
        if (rollbackFn) {
          await rollbackFn(originalData)
        }
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    [data, originalData, updateFn, rollbackFn]
  )

  return [data, updateOptimistically, isUpdating] as const
}

