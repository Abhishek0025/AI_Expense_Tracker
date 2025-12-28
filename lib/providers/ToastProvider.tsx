'use client'

import { createContext, useContext, ReactNode } from 'react'
import ToastContainer, { Toast } from '@/components/Toast'
import { useToast } from '@/lib/hooks/useToast'

interface ToastContextType {
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, removeToast, success, error, info, warning } = useToast()

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}

