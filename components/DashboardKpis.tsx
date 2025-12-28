'use client'

import { formatCentsToUSD } from '@/lib/money'

interface KPIs {
  totalExpenseCents: number
  totalIncomeCents: number
  netCents: number
  txCount: number
}

interface DashboardKpisProps {
  kpis: KPIs
}

export default function DashboardKpis({ kpis }: DashboardKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-700">{formatCentsToUSD(kpis.totalExpenseCents)}</p>
            <p className="text-xs text-red-500 mt-1">Last 30 days</p>
          </div>
          <div className="text-4xl">💸</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600 mb-1">Total Income</p>
            <p className="text-3xl font-bold text-green-700">{formatCentsToUSD(kpis.totalIncomeCents)}</p>
            <p className="text-xs text-green-500 mt-1">Last 30 days</p>
          </div>
          <div className="text-4xl">💰</div>
        </div>
      </div>

      <div className={`bg-gradient-to-br rounded-xl shadow-lg p-6 border ${
        kpis.netCents >= 0
          ? 'from-blue-50 to-blue-100 border-blue-200'
          : 'from-orange-50 to-orange-100 border-orange-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium mb-1 ${
              kpis.netCents >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              Net
            </p>
            <p className={`text-3xl font-bold ${
              kpis.netCents >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              {formatCentsToUSD(kpis.netCents)}
            </p>
            <p className={`text-xs mt-1 ${
              kpis.netCents >= 0 ? 'text-blue-500' : 'text-orange-500'
            }`}>
              Last 30 days
            </p>
          </div>
          <div className="text-4xl">{kpis.netCents >= 0 ? '📈' : '📉'}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600 mb-1">Transactions</p>
            <p className="text-3xl font-bold text-purple-700">{kpis.txCount}</p>
            <p className="text-xs text-purple-500 mt-1">Last 30 days</p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </div>
    </div>
  )
}

