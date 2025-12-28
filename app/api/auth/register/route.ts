import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/auth'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = registerSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          issues: validated.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, password } = validated.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already exists',
          message: 'An account with this email already exists',
        },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

