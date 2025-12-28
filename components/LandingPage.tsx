'use client'

import Link from 'next/link'
import ModernButton from './ModernButton'
import AuroraEffect from './AuroraEffect'

export default function LandingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <AuroraEffect />
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            AI Expense Tracker
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
            Smart expense management powered by AI
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Track, categorize, and analyze your expenses effortlessly. Let AI handle the categorization while you focus on what matters.
          </p>
          
          <div className="flex justify-center items-center mb-16">
            <Link href="/login">
              <ModernButton variant="primary" className="text-xl px-12 py-5 min-w-[250px]">
                Get Started
              </ModernButton>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-blue-100">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Categorization</h3>
            <p className="text-gray-600">
              Automatically categorize your transactions with intelligent AI that learns from your spending patterns.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-purple-100">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Beautiful Dashboards</h3>
            <p className="text-gray-600">
              Visualize your spending with interactive charts and insights that help you understand your finances better.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-pink-100">
            <div className="text-5xl mb-4">📥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">CSV Import</h3>
            <p className="text-gray-600">
              Easily import your transactions from bank statements or other expense tracking tools via CSV.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-gray-100">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Smart Review Queue</h4>
                <p className="text-gray-600">Review and approve low-confidence AI categorizations with reasoning.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Real-time Insights</h4>
                <p className="text-gray-600">Get instant insights into your spending habits and trends.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Secure & Private</h4>
                <p className="text-gray-600">Your data is encrypted and stored securely. Your privacy is our priority.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Easy Management</h4>
                <p className="text-gray-600">Edit, delete, and organize transactions with a beautiful, intuitive interface.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of users managing their expenses smarter.</p>
          <div className="flex justify-center">
            <Link href="/login">
              <ModernButton variant="primary" className="text-xl px-12 py-5 min-w-[250px]">
                Get Started
              </ModernButton>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

