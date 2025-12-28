import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

// Zod schema for POST request validation
const createTransactionSchema = z.object({
  date: z.union([
    z.string().datetime(),
    z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    z.date(),
  ]),
  description: z.string().min(1, 'Description is required'),
  amount: z.union([
    z.string().regex(/^-?\d+\.?\d*$/, 'Invalid amount format'),
    z.number(),
  ]),
  merchant: z.string().optional(),
  categoryId: z.string().optional(),
})

// Helper to convert amount to cents
function amountToCents(amount: string | number): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return Math.round(numAmount * 100)
}

export async function GET() {
  try {
    const user = await requireUser()
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to view transactions',
        },
        { status: 401 }
      )
    }
    const userId = user.id

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

    return NextResponse.json({
      success: true,
      data: transactions.map((t) => ({
        id: t.id,
        date: t.date.toISOString(),
        description: t.description,
        amountCents: t.amountCents,
        merchant: t.merchant,
        categoryId: t.categoryId,
        categoryName: t.category?.name || null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    })
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to view transactions',
        },
        { status: 401 }
      )
    }
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = createTransactionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          issues: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { date, description, amount, merchant, categoryId } = validationResult.data
    const user = await requireUser()
    const userId = user.id

    // Convert amount to cents
    const amountCents = amountToCents(amount)

    // Validate amount is not zero
    if (amountCents === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          issues: [{ path: ['amount'], message: 'Amount cannot be zero' }],
        },
        { status: 400 }
      )
    }

    // Parse date
    const transactionDate = typeof date === 'string' ? new Date(date) : date

    // Validate category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            issues: [{ path: ['categoryId'], message: 'Category not found' }],
          },
          { status: 400 }
        )
      }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        date: transactionDate,
        description,
        amountCents,
        merchant: merchant || null,
        categoryId: categoryId || null,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: transaction.id,
          date: transaction.date.toISOString(),
          description: transaction.description,
          amountCents: transaction.amountCents,
          merchant: transaction.merchant,
          categoryId: transaction.categoryId,
          categoryName: transaction.category?.name || null,
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating transaction:', error)
    
    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'A transaction with these details already exists',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

