import NextAuth from 'next-auth'
import { authOptions } from './auth'

// Create a single auth instance that can be shared
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

