'use client'

export function TransactionTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-12 rounded-lg mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-16 rounded-lg mb-3"></div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 h-80 rounded-xl"></div>
        <div className="bg-gray-200 h-80 rounded-xl"></div>
      </div>
      <div className="bg-gray-200 h-80 rounded-xl"></div>
    </div>
  )
}

export function KPICardSkeleton() {
  return (
    <div className="bg-gray-200 h-32 rounded-xl animate-pulse"></div>
  )
}

