'use client'

import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { formatCentsToUSD } from '@/lib/money'

ChartJS.register(ArcElement, Tooltip, Legend)

interface CategorySpend {
  category: string
  totalCents: number
}

interface SpendByCategoryProps {
  data: CategorySpend[]
}

export default function SpendByCategory({ data }: SpendByCategoryProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Spend by Category</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No expense data available</p>
        </div>
      </div>
    )
  }

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
    '#6366F1', // indigo
  ]

  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: 'Spending',
        data: data.map((item) => item.totalCents / 100),
        backgroundColor: colors.slice(0, data.length),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${formatCentsToUSD(value * 100)} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Spend by Category</h3>
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  )
}

