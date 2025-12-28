import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

// Zod schema for PUT request validation
const updateTransactionSchema = z.object({
  date: z.union([
    z.string().datetime(),
    z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    z.date(),
  ]).optional(),
  description: z.string().min(1, 'Description is required').optional(),
  amount: z.union([
    z.string().regex(/^-?\d+\.?\d*$/, 'Invalid amount format'),
    z.number(),
  ]).optional(),
  merchant: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
})

// Helper to convert amount to cents
function amountToCents(amount: string | number): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return Math.round(numAmount * 100)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser()
    const userId = user.id
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const user = await requireUser()
    const userId = user.id

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction not found',
        },
        { status: 404 }
      )
    }

    // Validate request body
    const validationResult = updateTransactionSchema.safeParse(body)
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

    // Build update data
    const updateData: any = {}
    if (date !== undefined) {
      updateData.date = typeof date === 'string' ? new Date(date) : date
    }
    if (description !== undefined) {
      updateData.description = description
    }
    if (amount !== undefined) {
      const amountCents = amountToCents(amount)
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
      updateData.amountCents = amountCents
    }
    if (merchant !== undefined) {
      updateData.merchant = merchant
    }
    if (categoryId !== undefined) {
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
      updateData.categoryId = categoryId
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser()
    const userId = user.id

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction not found',
        },
        { status: 404 }
      )
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

