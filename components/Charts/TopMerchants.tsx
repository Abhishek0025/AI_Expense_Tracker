'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { formatCentsToUSD } from '@/lib/money'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MerchantSpend {
  merchant: string
  totalCents: number
}

interface TopMerchantsProps {
  data: MerchantSpend[]
}

export default function TopMerchants({ data }: TopMerchantsProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top Merchants</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No merchant data available</p>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: data.map((item) => item.merchant),
    datasets: [
      {
        label: 'Spending',
        data: data.map((item) => item.totalCents / 100),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y || 0
            return `Spent: ${formatCentsToUSD(value * 100)}`
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
      <h3 className="text-xl font-bold text-gray-900 mb-6">Top Merchants</h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

