'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { formatCentsToUSD } from '@/lib/money'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MonthlyData {
  month: string
  expenseCents: number
  incomeCents: number
}

interface MonthlyTrendProps {
  data: MonthlyData[]
}

export default function MonthlyTrend({ data }: MonthlyTrendProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Trend</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    )
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const chartData = {
    labels: data.map((item) => formatMonth(item.month)),
    datasets: [
      {
        label: 'Expenses',
        data: data.map((item) => item.expenseCents / 100),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Income',
        data: data.map((item) => item.incomeCents / 100),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || ''
            const value = context.parsed.y || 0
            return `${label}: ${formatCentsToUSD(value * 100)}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCentsToUSD(value * 100)
          },
        },
      },
    },
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Trend (Last 6 Months)</h3>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

