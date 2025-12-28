import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const userId = user.id

    // Get transactions that need review:
    // - categoryId is null OR
    // - aiConfidence is not null and aiConfidence < 0.6
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        OR: [
          { categoryId: null },
          {
            AND: [
              { aiConfidence: { not: null } },
              { aiConfidence: { lt: 0.6 } },
            ],
          },
        ],
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
      take: 100, // Limit to 100 most recent
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
        aiConfidence: t.aiConfidence,
        aiReasoning: t.aiReasoning,
        aiSuggestedCategory: t.aiSuggestedCategory,
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
          message: 'You must be logged in to view the review queue',
        },
        { status: 401 }
      )
    }
    console.error('Error fetching review queue:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch review queue',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

