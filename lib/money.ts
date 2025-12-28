/**
 * Money formatting and utility functions
 */

/**
 * Formats cents to USD currency string
 * @param cents - Amount in cents (can be negative)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCentsToUSD(cents: number): string {
  const amount = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Returns the absolute value of cents
 * @param cents - Amount in cents (can be negative)
 * @returns Absolute value in cents
 */
export function centsAbs(cents: number): number {
  return Math.abs(cents)
}

/**
 * Formats cents to USD without currency symbol (for charts)
 * @param cents - Amount in cents
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatCentsToNumber(cents: number): string {
  const amount = Math.abs(cents) / 100
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

