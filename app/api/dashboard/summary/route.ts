import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const userId = user.id
    const searchParams = request.nextUrl.searchParams
    const dateRange = searchParams.get('dateRange') || '30days'

    // Calculate date ranges based on selection
    const now = new Date()
    let startDate: Date
    let kpiStartDate: Date

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        kpiStartDate = startDate
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        kpiStartDate = startDate
        break
      case 'month':
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 1)
        kpiStartDate = startDate
        break
      case '3months':
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 3)
        kpiStartDate = startDate
        break
      case '6months':
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 6)
        kpiStartDate = startDate
        break
      case 'year':
        startDate = new Date(now)
        startDate.setFullYear(startDate.getFullYear() - 1)
        kpiStartDate = startDate
        break
      case 'all':
        startDate = new Date(0) // Beginning of time
        kpiStartDate = new Date(0)
        break
      default: // '30days'
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 30)
        kpiStartDate = startDate
    }

    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Calculate date ranges for monthly chart (always last 6 months)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get last 6 months including current month
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1) // Start of month

    // Filter transactions for selected date range (for KPIs)
    const recentTransactions = transactions.filter(
      (t) => new Date(t.date) >= kpiStartDate
    )

    // Filter transactions for charts (use selected range or all)
    const chartTransactions = dateRange === 'all' 
      ? transactions 
      : transactions.filter((t) => new Date(t.date) >= startDate)

    // Filter transactions for last 6 months
    const monthlyTransactions = transactions.filter(
      (t) => new Date(t.date) >= sixMonthsAgo
    )

    // 1. Spend by Category (use chartTransactions for selected range)
    // Note: Expenses have positive amountCents, Income has negative amountCents
    const spendByCategoryMap = new Map<string, number>()
    chartTransactions
      .filter((t) => t.amountCents > 0) // Expenses only (positive amounts)
      .forEach((t) => {
        const categoryName = t.category?.name || 'Uncategorized'
        const current = spendByCategoryMap.get(categoryName) || 0
        spendByCategoryMap.set(categoryName, current + t.amountCents)
      })

    const spendByCategory = Array.from(spendByCategoryMap.entries())
      .map(([category, totalCents]) => ({
        category,
        totalCents,
      }))
      .sort((a, b) => b.totalCents - a.totalCents)

    // 2. Monthly Spend
    const monthlySpendMap = new Map<string, { expenseCents: number; incomeCents: number }>()

    monthlyTransactions.forEach((t) => {
      const month = new Date(t.date).toISOString().slice(0, 7) // YYYY-MM
      const current = monthlySpendMap.get(month) || { expenseCents: 0, incomeCents: 0 }

      if (t.amountCents > 0) {
        // Expense: positive amountCents
        current.expenseCents += t.amountCents
      } else {
        // Income: negative amountCents, convert to positive
        current.incomeCents += Math.abs(t.amountCents)
      }

      monthlySpendMap.set(month, current)
    })

    // Generate last 6 months including current
    const monthlySpend: Array<{ month: string; expenseCents: number; incomeCents: number }> = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      const month = date.toISOString().slice(0, 7)
      const data = monthlySpendMap.get(month) || { expenseCents: 0, incomeCents: 0 }
      monthlySpend.push({
        month,
        expenseCents: data.expenseCents,
        incomeCents: data.incomeCents,
      })
    }

    // 3. Top Merchants (use chartTransactions for selected range)
    // Note: Expenses have positive amountCents
    const merchantMap = new Map<string, number>()
    chartTransactions
      .filter((t) => t.amountCents > 0) // Expenses only (positive amounts)
      .forEach((t) => {
        const merchant = t.merchant || 'Unknown'
        const current = merchantMap.get(merchant) || 0
        merchantMap.set(merchant, current + t.amountCents)
      })

    const topMerchants = Array.from(merchantMap.entries())
      .map(([merchant, totalCents]) => ({
        merchant,
        totalCents,
      }))
      .sort((a, b) => b.totalCents - a.totalCents)
      .slice(0, 8)

    // 4. KPIs for last 30 days
    // Note: Expenses have positive amountCents, Income has negative amountCents
    const totalExpenseCents = recentTransactions
      .filter((t) => t.amountCents > 0) // Expenses (positive)
      .reduce((sum, t) => sum + t.amountCents, 0)

    const totalIncomeCents = recentTransactions
      .filter((t) => t.amountCents < 0) // Income (negative)
      .reduce((sum, t) => sum + Math.abs(t.amountCents), 0)

    const netCents = totalIncomeCents - totalExpenseCents
    const txCount = recentTransactions.length

    return NextResponse.json({
      success: true,
      data: {
        spendByCategory,
        monthlySpend,
        topMerchants,
        kpis: {
          totalExpenseCents,
          totalIncomeCents,
          netCents,
          txCount,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard summary',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

