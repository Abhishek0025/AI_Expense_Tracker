import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { callOpenAI } from '@/lib/ai/openai'
import { createCategorizationPrompt } from '@/lib/ai/prompts'

// Schema for OpenAI response - expects a JSON array directly
const aiResponseSchema = z.array(
  z.object({
    transactionId: z.string(),
    category: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    merchant: z.string().optional().nullable(),
  })
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let userId: string | null = null
  let aiRunId: string | null = null

  try {
    console.log('[AI Categorize] Starting categorization process')
    
    // Get current user
    const user = await requireUser()
    userId = user.id
    console.log('[AI Categorize] User ID:', userId)

    // Select up to 50 uncategorized transactions
    const uncategorizedTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        categoryId: null,
      },
      take: 50,
      orderBy: {
        date: 'desc',
      },
    })

    console.log('[AI Categorize] Found', uncategorizedTransactions.length, 'uncategorized transactions')

    if (uncategorizedTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No uncategorized transactions found',
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

    console.log('[AI Categorize] Found', categories.length, 'categories')

    // Create prompt
    const prompt = createCategorizationPrompt(
      uncategorizedTransactions.map((t: typeof uncategorizedTransactions[0]) => ({
        id: t.id,
        date: t.date.toISOString(),
        description: t.description,
        amountCents: t.amountCents,
        merchant: t.merchant,
      })),
      categories
    )

    // Call OpenAI
    console.log('[AI Categorize] Calling OpenAI...')
    const openaiResponse = await callOpenAI(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 2000,
    })

    console.log('[AI Categorize] OpenAI response received, length:', openaiResponse.length)

    // Parse and validate OpenAI response
    let parsedResponse: z.infer<typeof aiResponseSchema>
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = openaiResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()

      const parsed = JSON.parse(cleanedResponse)
      
      // Handle both array and object with results key (for backwards compatibility)
      const results = Array.isArray(parsed) ? parsed : parsed.results || []
      parsedResponse = aiResponseSchema.parse(results)
    } catch (error) {
      console.error('[AI Categorize] Failed to parse OpenAI response:', error)
      console.error('[AI Categorize] Raw response:', openaiResponse)
      throw new Error(`Failed to parse OpenAI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Create AiRun record
    const aiRun = await prisma.aiRun.create({
      data: {
        userId,
        type: 'categorize',
        outputJson: JSON.stringify(parsedResponse, null, 2),
      },
    })
    aiRunId = aiRun.id
    console.log('[AI Categorize] Created AiRun:', aiRunId)

    // Create category name to ID map
    const categoryMap = new Map<string, string>()
    categories.forEach((cat: typeof categories[0]) => {
      categoryMap.set(cat.name.toLowerCase(), cat.id)
    })

    // Process each result
    let categorizedCount = 0
    const updatePromises: Promise<void>[] = []

    for (const result of parsedResponse) {
      const transaction = uncategorizedTransactions.find(
        (t: typeof uncategorizedTransactions[0]) => t.id === result.transactionId
      )

      if (!transaction) {
        console.warn('[AI Categorize] Transaction not found:', result.transactionId)
        continue
      }

      // Map category to categoryId
      let categoryId: string | null = null
      if (result.category && result.confidence >= 0.6) {
        const categoryIdFromMap = categoryMap.get(result.category.toLowerCase())
        if (categoryIdFromMap) {
          categoryId = categoryIdFromMap
        } else {
          console.warn(
            '[AI Categorize] Category not found:',
            result.category,
            'for transaction',
            result.transactionId
          )
        }
      }

      // Prepare update data
      const updateData: {
        aiRunId: string
        aiConfidence: number
        categoryId?: string | null
        merchant?: string | null
      } = {
        aiRunId: aiRun.id,
        aiConfidence: result.confidence,
      }

      // Only set categoryId if we have a valid one
      if (categoryId) {
        updateData.categoryId = categoryId
        categorizedCount++
      }

      // Update merchant if we have a guess and no existing merchant
      if (!transaction.merchant && result.merchant) {
        updateData.merchant = result.merchant
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
              '[AI Categorize] Failed to update transaction:',
              transaction.id,
              error
            )
          })
      )
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises)

    const duration = Date.now() - startTime
    console.log(
      '[AI Categorize] Completed in',
      duration,
      'ms. Categorized',
      categorizedCount,
      'out of',
      uncategorizedTransactions.length,
      'transactions'
    )

    return NextResponse.json({
      success: true,
      message: 'Categorization completed',
      processedCount: uncategorizedTransactions.length,
      categorizedCount,
      aiRunId: aiRun.id,
      duration,
    })
  } catch (error) {
    console.error('[AI Categorize] Error:', error)

    // Try to create a failed AiRun record if we have userId
    if (userId && !aiRunId) {
      try {
        await prisma.aiRun.create({
          data: {
            userId,
            type: 'categorize',
            outputJson: JSON.stringify(
              {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        })
      } catch (dbError) {
        console.error('[AI Categorize] Failed to create error AiRun:', dbError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to categorize transactions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

