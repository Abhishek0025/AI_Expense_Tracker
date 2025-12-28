'use client'

import Link from 'next/link'
import ModernButton from '@/components/ModernButton'

export default function AIHelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🤖 How AI Helps You
            </h1>
            <p className="text-xl text-gray-600">
              Discover how artificial intelligence makes expense tracking effortless
            </p>
          </div>

          <div className="space-y-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">✨</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Automatic Categorization</h2>
                  <p className="text-gray-700 mb-3">
                    Our AI analyzes your transactions and automatically assigns them to the right categories. 
                    No more manual sorting!
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Analyzes transaction descriptions, amounts, and merchants</li>
                    <li>Matches transactions to your existing categories</li>
                    <li>Only applies categories with high confidence (≥60%)</li>
                    <li>Learns from your spending patterns</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Confidence Scoring</h2>
                  <p className="text-gray-700 mb-3">
                    Every AI categorization comes with a confidence score, so you know how certain the AI is about each category.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Confidence scores range from 0% to 100%</li>
                    <li>Only high-confidence categorizations (≥60%) are applied</li>
                    <li>Low-confidence suggestions are flagged for review</li>
                    <li>Track average confidence across all AI-categorized transactions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Processing</h2>
                  <p className="text-gray-700 mb-3">
                    Process up to 50 uncategorized transactions at once. Perfect for catching up on old expenses!
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Handles multiple transactions in a single request</li>
                    <li>Efficient batch processing</li>
                    <li>Detailed results showing what was categorized</li>
                    <li>Full audit trail stored in database</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔍</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Merchant Recognition</h2>
                  <p className="text-gray-700 mb-3">
                    AI can identify and suggest merchant names even when they're missing from your transactions.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Extracts merchant information from descriptions</li>
                    <li>Fills in missing merchant fields</li>
                    <li>Improves data completeness</li>
                    <li>Better expense tracking and reporting</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔐</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Transparent & Auditable</h2>
                  <p className="text-gray-700 mb-3">
                    Every AI categorization is logged and stored, so you can review what the AI did and why.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Full AI response stored in database</li>
                    <li>Each transaction linked to its AI run</li>
                    <li>Confidence scores preserved</li>
                    <li>Easy to review and correct if needed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">🚀 How to Use AI Categorization</h2>
              <ol className="list-decimal list-inside space-y-3 text-lg">
                <li>Go to the <strong>Transactions</strong> page</li>
                <li>Look for the <strong>"AI Categorize"</strong> button (purple gradient button)</li>
                <li>Click it to automatically categorize up to 50 uncategorized transactions</li>
                <li>Review the results - transactions are updated with categories and confidence scores</li>
                <li>You can always manually change categories if needed</li>
              </ol>
            </div>

            {/* Technical Details */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Technical Details</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>AI Model:</strong> OpenAI GPT-4o-mini
                </p>
                <p>
                  <strong>Processing:</strong> Up to 50 transactions per request
                </p>
                <p>
                  <strong>Confidence Threshold:</strong> 60% minimum for auto-categorization
                </p>
                <p>
                  <strong>Data Privacy:</strong> All AI processing happens server-side, your data is secure
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <ModernButton href="/" variant="primary">
              ← Back to Home
            </ModernButton>
            <ModernButton href="/transactions" variant="success">
              View Transactions
            </ModernButton>
          </div>
        </div>
      </div>
    </div>
  )
}

