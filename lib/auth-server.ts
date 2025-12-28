// Get current authenticated user (server-side only)
// Dynamically import to avoid circular dependencies
export async function getCurrentUser() {
  try {
    const { auth } = await import('./auth-instance')
    const session = await auth()
    
    if (!session || !session.user) {
      return null
    }
    
    return {
      id: session.user.id,
      email: session.user.email,
    }
  } catch (error) {
    console.error('[Auth] Error getting current user:', error)
    if (error instanceof Error) {
      console.error('[Auth] Error stack:', error.stack)
    }
    return null
  }
}

// Require authenticated user (throws 401 if not logged in)
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    const error = new Error('Unauthorized') as Error & { statusCode?: number }
    error.statusCode = 401
    throw error
  }
  return user
}
