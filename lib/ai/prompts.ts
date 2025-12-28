interface TransactionForCategorization {
  id: string
  date: string
  description: string
  amountCents: number
  merchant: string | null
}

interface Category {
  id: string
  name: string
}

/**
 * Creates a prompt for categorizing transactions using OpenAI.
 * Returns a prompt that will result in a JSON array of categorization results.
 */
export function createCategorizationPrompt(
  transactions: TransactionForCategorization[],
  categories: Category[]
): string {
  const categoryNames = categories.map((c) => c.name).join(', ')
  
  const transactionsJson = JSON.stringify(
    transactions.map((t) => ({
      transactionId: t.id,
      date: t.date,
      description: t.description,
      amount: (t.amountCents / 100).toFixed(2),
      merchant: t.merchant || null,
    })),
    null,
    2
  )

  return `You are an expense categorization assistant. Analyze the following transactions and categorize them using the available categories.

Available categories: ${categoryNames || 'None (you may suggest new categories)'}

Transactions to categorize:
${transactionsJson}

You MUST return a STRICT JSON array with this EXACT structure (this is critical - the response must be a JSON array, not an object):
[
  {
    "transactionId": "string (required)",
    "category": "string (required, must match one of the available categories exactly, or null if no good match)",
    "confidence": number (required, between 0.0 and 1.0),
    "merchant": "string (optional, your best guess at the merchant name if not provided)"
  }
]

Rules:
1. Return ONLY a valid JSON array, no markdown, no code blocks, no explanations, no wrapping object
2. Use "category" (not "categoryName") as the field name
3. category must exactly match one of the available categories (case-insensitive), or be null if confidence < 0.6 or no good match exists
4. confidence must be between 0.0 and 1.0
5. If a transaction already has a merchant, you can still provide merchant if you have a better guess
6. Include ALL transactions in the array
7. Be conservative with confidence scores - only assign high confidence (>0.8) when you're very certain
8. The response MUST be a JSON array starting with [, not an object

Return the JSON array now:`
}

/**
 * Creates a prompt for retrying categorization on low-confidence transactions.
 * Includes reasoning in the response.
 */
export function createRetryCategorizationPrompt(
  transactions: TransactionForCategorization[],
  categories: Category[]
): string {
  const categoryNames = categories.map((c) => c.name).join(', ')
  
  const transactionsJson = JSON.stringify(
    transactions.map((t) => ({
      transactionId: t.id,
      date: t.date,
      description: t.description,
      amount: (t.amountCents / 100).toFixed(2),
      merchant: t.merchant || null,
    })),
    null,
    2
  )

  return `You are an expense categorization assistant. These transactions need review because they were previously categorized with low confidence or are uncategorized. Please provide your best-guess category and a brief reasoning.

Available categories: ${categoryNames || 'None (you may suggest new categories)'}

Transactions to review:
${transactionsJson}

You MUST return a STRICT JSON array with this EXACT structure:
[
  {
    "transactionId": "string (required)",
    "category": "string (required, must match one of the available categories exactly, or null if no good match)",
    "confidence": number (required, between 0.0 and 1.0),
    "reasoning": "string (required, 1-2 sentences explaining your categorization decision)"
  }
]

Rules:
1. Return ONLY a valid JSON array, no markdown, no code blocks, no explanations, no wrapping object
2. category must exactly match one of the available categories (case-insensitive), or be null if no good match exists
3. confidence must be between 0.0 and 1.0
4. reasoning must be 1-2 sentences explaining why you chose this category (or why null if no match)
5. Include ALL transactions in the array
6. The response MUST be a JSON array starting with [, not an object

Return the JSON array now:`
}
