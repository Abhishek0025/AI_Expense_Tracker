'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface ModernButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ai'
  className?: string
  disabled?: boolean
}

export default function ModernButton({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}: ModernButtonProps) {
  const baseClasses = `
    relative px-6 py-3 font-semibold text-white rounded-xl
    transform transition-all duration-300 ease-out
    hover:scale-105 hover:shadow-2xl
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    overflow-hidden group
  `

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/50',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg shadow-gray-500/50',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/50',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/50',
    ai: 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 shadow-lg shadow-purple-500/50 animate-pulse',
  }

  const buttonContent = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </>
  )

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {buttonContent}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {buttonContent}
    </button>
  )
}

