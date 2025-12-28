import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { callOpenAI } from '@/lib/ai/openai'
import { createRetryCategorizationPrompt } from '@/lib/ai/prompts'

// Schema for OpenAI response - expects a JSON array with reasoning
const aiResponseSchema = z.array(
  z.object({
    transactionId: z.string(),
    category: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
  })
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let userId: string | null = null
  let aiRunId: string | null = null

  try {
    console.log('[AI Retry Low Confidence] Starting retry categorization process')
    
    // Get current user
    const user = await requireUser()
    userId = user.id
    console.log('[AI Retry Low Confidence] User ID:', userId)

    // Select up to 50 transactions from review queue
    const reviewTransactions = await prisma.transaction.findMany({
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
      take: 50,
      orderBy: {
        date: 'desc',
      },
    })

    console.log('[AI Retry Low Confidence] Found', reviewTransactions.length, 'transactions in review queue')

    if (reviewTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No transactions in review queue',
        processedCount: 0,
        categorizedCount: 0,
      })
    }

    // Fetch user's categories
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    console.log('[AI Retry Low Confidence] Found', categories.length, 'categories')

    // Create prompt
    const prompt = createRetryCategorizationPrompt(
      reviewTransactions.map((t) => ({
        id: t.id,
        date: t.date.toISOString(),
        description: t.description,
        amountCents: t.amountCents,
        merchant: t.merchant,
      })),
      categories
    )

    // Call OpenAI
    console.log('[AI Retry Low Confidence] Calling OpenAI...')
    const openaiResponse = await callOpenAI(prompt)
    console.log('[AI Retry Low Confidence] OpenAI response received')

    // Parse and validate response
    let parsedResponse: z.infer<typeof aiResponseSchema>
    try {
      // Try to parse as JSON array
      const jsonMatch = openaiResponse.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }
      parsedResponse = aiResponseSchema.parse(JSON.parse(jsonMatch[0]))
    } catch (parseError) {
      console.error('[AI Retry Low Confidence] Failed to parse OpenAI response:', parseError)
      console.error('[AI Retry Low Confidence] Raw response:', openaiResponse)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI response',
          message: 'The AI returned an invalid response format. Please try again.',
        },
        { status: 500 }
      )
    }

    console.log('[AI Retry Low Confidence] Parsed', parsedResponse.length, 'results')

    // Create AiRun record
    const aiRun = await prisma.aiRun.create({
      data: {
        userId,
        type: 'retry-low-confidence',
        outputJson: JSON.stringify(parsedResponse),
      },
    })
    aiRunId = aiRun.id
    console.log('[AI Retry Low Confidence] Created AiRun:', aiRunId)

    // Create category name to ID map
    const categoryMap = new Map<string, string>()
    categories.forEach((cat: typeof categories[0]) => {
      categoryMap.set(cat.name.toLowerCase(), cat.id)
    })

    // Process each result
    let categorizedCount = 0
    const updatePromises: Promise<void>[] = []

    for (const result of parsedResponse) {
      const transaction = reviewTransactions.find(
        (t: typeof reviewTransactions[0]) => t.id === result.transactionId
      )

      if (!transaction) {
        console.warn('[AI Retry Low Confidence] Transaction not found:', result.transactionId)
        continue
      }

      // Map category to categoryId (but don't auto-set it - let user review)
      let categoryId: string | null = null
      if (result.category) {
        const categoryIdFromMap = categoryMap.get(result.category.toLowerCase())
        if (categoryIdFromMap) {
          categoryId = categoryIdFromMap
        }
      }

      // Prepare update data - store suggestion but don't auto-apply
      const updateData: {
        aiRunId: string
        aiConfidence: number
        aiReasoning: string
        aiSuggestedCategory: string | null
        categoryId?: string | null
      } = {
        aiRunId: aiRun.id,
        aiConfidence: result.confidence,
        aiReasoning: result.reasoning,
        aiSuggestedCategory: result.category,
      }

      // Only set categoryId if confidence is high (>= 0.8) - otherwise let user review
      if (categoryId && result.confidence >= 0.8) {
        updateData.categoryId = categoryId
        categorizedCount++
      }

      // Update transaction with AI run info
      updatePromises.push(
        prisma.transaction
          .update({
            where: { id: transaction.id },
            data: updateData,
          })
          .then(() => {
            // Return void
          })
          .catch((error: unknown) => {
            console.error(
              '[AI Retry Low Confidence] Failed to update transaction:',
              transaction.id,
              error
            )
          })
      )
    }

    // Wait for all updates
    await Promise.all(updatePromises)

    const duration = Date.now() - startTime
    console.log(
      `[AI Retry Low Confidence] Completed in ${duration}ms. Processed: ${parsedResponse.length}, Categorized: ${categorizedCount}`
    )

    return NextResponse.json({
      success: true,
      message: `AI review completed for ${parsedResponse.length} transactions`,
      processedCount: parsedResponse.length,
      categorizedCount,
      aiRunId,
    })
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to use AI categorization',
        },
        { status: 401 }
      )
    }

    console.error('[AI Retry Low Confidence] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'AI categorization failed',
        message:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred during AI categorization',
      },
      { status: 500 }
    )
  }
}

