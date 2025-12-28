'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id)
      }, toast.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onClose])

  const typeStyles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600',
    warning: 'bg-yellow-500 border-yellow-600',
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  return (
    <div
      className={`${typeStyles[toast.type]} text-white px-6 py-4 rounded-lg shadow-xl mb-3 flex items-center justify-between min-w-[300px] max-w-md animate-slide-in transform transition-all duration-300`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[toast.type]}</span>
        <p className="font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof window === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed top-20 right-4 z-50 flex flex-col items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  )
}

