'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import ModernButton from './ModernButton'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-4 justify-center">
              <ModernButton
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Reload Page
              </ModernButton>
              <ModernButton
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="secondary"
              >
                Try Again
              </ModernButton>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

