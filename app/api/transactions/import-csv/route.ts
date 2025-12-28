import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

// Schema for CSV row validation
const csvRowSchema = z.object({
  date: z.string().min(1, 'Date is required'),
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

// Helper to normalize date
function normalizeDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null

  // Try parsing various date formats
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    // Try common formats
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/, // MM-DD-YYYY
    ]

    for (const format of formats) {
      const match = dateStr.match(format)
      if (match) {
        if (format === formats[0]) {
          // YYYY-MM-DD
          return new Date(`${match[1]}-${match[2]}-${match[3]}`)
        } else if (format === formats[1] || format === formats[2]) {
          // MM/DD/YYYY or MM-DD-YYYY
          return new Date(`${match[3]}-${match[1]}-${match[2]}`)
        }
      }
    }

    return null
  }

  return date
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      )
    }

    // Read file content
    const fileContent = await file.text()

    // Parse CSV
    const parseResult = Papa.parse<Record<string, string>>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSV parsing error',
          message: parseResult.errors[0].message,
        },
        { status: 400 }
      )
    }

    const rows = parseResult.data
    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSV file is empty',
        },
        { status: 400 }
      )
    }

    const user = await requireUser()
    const userId = user.id
    const failedRows: Array<{ row: number; error: string }> = []
    const validTransactions: Array<{
      data: {
        userId: string
        date: Date
        description: string
        amountCents: number
        merchant: string | null
        categoryId: string | null
      }
      originalRowNumber: number // Track original row number for error reporting
    }> = []

    // Validate and normalize each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2 // +2 because row 1 is header, and arrays are 0-indexed

      try {
        // Validate row schema
        const validationResult = csvRowSchema.safeParse(row)
        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0]
          failedRows.push({
            row: rowNumber,
            error: `${firstError.path.join('.')}: ${firstError.message}`,
          })
          continue
        }

        const { date, description, amount, merchant, categoryId } = validationResult.data

        // Normalize date
        const normalizedDate = normalizeDate(date)
        if (!normalizedDate) {
          failedRows.push({
            row: rowNumber,
            error: `Invalid date format: ${date}`,
          })
          continue
        }

        // Convert amount to cents
        const amountCents = amountToCents(amount)
        if (amountCents === 0) {
          failedRows.push({
            row: rowNumber,
            error: 'Amount cannot be zero',
          })
          continue
        }

        // Validate category exists if provided
        let finalCategoryId: string | null = null
        if (categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: categoryId },
          })
          if (!category) {
            failedRows.push({
              row: rowNumber,
              error: `Category not found: ${categoryId}`,
            })
            continue
          }
          finalCategoryId = categoryId
        }

        // Add to valid transactions
        validTransactions.push({
          data: {
            userId,
            date: normalizedDate,
            description,
            amountCents,
            merchant: merchant || null,
            categoryId: finalCategoryId,
          },
          originalRowNumber: rowNumber,
        })
      } catch (error) {
        failedRows.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Bulk insert valid transactions
    let insertedCount = 0
    if (validTransactions.length > 0) {
      try {
        // Use createMany for bulk insert (faster)
        // Note: createMany doesn't return created records, so we use the count
        await prisma.transaction.createMany({
          data: validTransactions.map((t) => t.data),
          skipDuplicates: true, // Skip duplicates if any
        })
        insertedCount = validTransactions.length
      } catch (error) {
        // If bulk insert fails, try individual inserts to get better error messages
        console.error('Bulk insert failed, trying individual inserts:', error)
        for (const transaction of validTransactions) {
          try {
            await prisma.transaction.create({
              data: transaction.data,
            })
            insertedCount++
          } catch (err) {
            failedRows.push({
              row: transaction.originalRowNumber,
              error: err instanceof Error ? err.message : 'Database error',
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      insertedCount,
      failedRows,
    })
  } catch (error) {
    console.error('Error importing CSV:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import CSV',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

