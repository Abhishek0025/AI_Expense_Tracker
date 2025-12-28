import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const userId = user.id

    // Count transactions that need review:
    // - categoryId is null OR
    // - aiConfidence is not null and aiConfidence < 0.6
    const count = await prisma.transaction.count({
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
    })

    return NextResponse.json({
      success: true,
      count,
    })
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to view the review count',
        },
        { status: 401 }
      )
    }
    console.error('Error fetching review count:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch review count',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

