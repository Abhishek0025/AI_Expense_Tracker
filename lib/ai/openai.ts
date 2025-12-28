import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Calls OpenAI API with a prompt and returns the response.
 * Handles errors and provides logging.
 */
export async function callOpenAI(
  prompt: string,
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<string> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.3,
    maxTokens = 2000,
  } = options

  try {
    console.log('[OpenAI] Calling API with model:', model)
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that returns only valid JSON. Never include markdown code blocks or any text outside the JSON. Return a JSON array when requested.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      // Note: json_object format only works for objects, not arrays
      // For arrays, we rely on the prompt to ensure JSON format
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    console.log('[OpenAI] Response received, length:', content.length)
    return content
  } catch (error) {
    console.error('[OpenAI] Error calling API:', error)
    
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message} (${error.status})`)
    }
    
    throw error
  }
}

