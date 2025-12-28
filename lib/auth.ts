import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[Auth] Missing credentials')
            return null
          }

          // Validate input
          const validated = loginSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          })

          if (!validated.success) {
            console.log('[Auth] Validation failed:', validated.error.errors[0].message)
            return null
          }

          const { email, password } = validated.data

          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            console.log('[Auth] User not found:', email)
            return null
          }

          if (!user.passwordHash) {
            console.log('[Auth] User has no password hash:', email)
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.passwordHash)

          if (!isValid) {
            console.log('[Auth] Invalid password for:', email)
            return null
          }

          console.log('[Auth] Login successful for:', email)
          return {
            id: user.id,
            email: user.email,
          }
        } catch (error) {
          console.error('[Auth] Error in authorize:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: any) {
      try {
        if (token && session?.user) {
          session.user.id = token.id as string
          session.user.email = (token.email as string) || session.user.email || ''
        }
        return session
      } catch (error) {
        console.error('[Auth] Session callback error:', error)
        return session
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

// Re-export from auth-server for convenience
export { getCurrentUser, requireUser } from './auth-server'

// Validation helpers
export { loginSchema, registerSchema }
