'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
}

interface CategorySelectProps {
  value: string | null
  onChange: (categoryId: string | null) => void
  disabled?: boolean
  className?: string
  allowUncategorized?: boolean
}

export default function CategorySelect({
  value,
  onChange,
  disabled = false,
  className = '',
  allowUncategorized = true,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data)
        }
      })
      .catch((err) => {
        console.error('Error fetching categories:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled || loading}
      className={`px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {allowUncategorized && <option value="">Uncategorized</option>}
      {loading ? (
        <option>Loading...</option>
      ) : (
        categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))
      )}
    </select>
  )
}

