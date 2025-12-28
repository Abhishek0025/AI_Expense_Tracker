import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash password for demo user
  const demoPasswordHash = await bcrypt.hash('demo123', 10)

  // Seed demo user (only if doesn't exist - don't update password if user exists)
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@local.dev' },
  })

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@local.dev',
        passwordHash: demoPasswordHash,
      },
    })
    console.log('Demo user created:', demoUser.id)
    console.log('Demo credentials: demo@local.dev / demo123')
  } else {
    // Update password if user exists but doesn't have passwordHash
    if (!demoUser.passwordHash) {
      demoUser = await prisma.user.update({
        where: { id: demoUser.id },
        data: { passwordHash: demoPasswordHash },
      })
      console.log('Demo user password updated')
      console.log('Demo credentials: demo@local.dev / demo123')
    } else {
      console.log('Demo user already exists:', demoUser.id)
    }
  }

  console.log('Demo user created/found:', demoUser.id)

  // Seed default categories
  const defaultCategories = [
    'Groceries',
    'Dining',
    'Rent',
    'Utilities',
    'Transport',
    'Shopping',
    'Subscriptions',
    'Income',
    'Other',
  ]

  const categoryPromises = defaultCategories.map((name) =>
    prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  )

  const categories = await Promise.all(categoryPromises)
  console.log(`Created/found ${categories.length} categories`)

  // Create a map of category names to IDs
  const categoryMap = new Map<string, string>()
  categories.forEach((cat) => {
    categoryMap.set(cat.name, cat.id)
  })

  // Seed sample transactions
  const sampleTransactions = [
    {
      date: new Date('2024-12-15'),
      description: 'Whole Foods Market',
      amountCents: 12550, // $125.50
      merchant: 'Whole Foods',
      categoryId: categoryMap.get('Groceries'),
    },
    {
      date: new Date('2024-12-14'),
      description: 'Uber Eats - Dinner',
      amountCents: 3240, // $32.40
      merchant: 'Uber Eats',
      categoryId: categoryMap.get('Dining'),
    },
    {
      date: new Date('2024-12-13'),
      description: 'Monthly Rent Payment',
      amountCents: 150000, // $1500.00
      merchant: 'Property Management Co',
      categoryId: categoryMap.get('Rent'),
    },
    {
      date: new Date('2024-12-12'),
      description: 'Electric Bill',
      amountCents: 8750, // $87.50
      merchant: 'Electric Company',
      categoryId: categoryMap.get('Utilities'),
    },
    {
      date: new Date('2024-12-11'),
      description: 'Uber Ride',
      amountCents: 1820, // $18.20
      merchant: 'Uber',
      categoryId: categoryMap.get('Transport'),
    },
    {
      date: new Date('2024-12-10'),
      description: 'Amazon Purchase',
      amountCents: 4567, // $45.67
      merchant: 'Amazon',
      categoryId: categoryMap.get('Shopping'),
    },
    {
      date: new Date('2024-12-09'),
      description: 'Netflix Subscription',
      amountCents: 1599, // $15.99
      merchant: 'Netflix',
      categoryId: categoryMap.get('Subscriptions'),
    },
    {
      date: new Date('2024-12-08'),
      description: 'Starbucks Coffee',
      amountCents: 575, // $5.75
      merchant: 'Starbucks',
      categoryId: categoryMap.get('Dining'),
    },
    {
      date: new Date('2024-12-07'),
      description: 'Salary Deposit',
      amountCents: -500000, // -$5000.00 (income)
      merchant: 'Employer',
      categoryId: categoryMap.get('Income'),
    },
    {
      date: new Date('2024-12-06'),
      description: 'Target Shopping',
      amountCents: 8923, // $89.23
      merchant: 'Target',
      categoryId: categoryMap.get('Shopping'),
    },
    {
      date: new Date('2024-12-05'),
      description: 'Gas Station',
      amountCents: 4520, // $45.20
      merchant: 'Shell',
      categoryId: categoryMap.get('Transport'),
    },
    {
      date: new Date('2024-12-04'),
      description: 'Restaurant - Italian',
      amountCents: 6780, // $67.80
      merchant: 'Bella Italia',
      categoryId: categoryMap.get('Dining'),
    },
    {
      date: new Date('2024-12-03'),
      description: 'Water Bill',
      amountCents: 4520, // $45.20
      merchant: 'Water Department',
      categoryId: categoryMap.get('Utilities'),
    },
    {
      date: new Date('2024-12-02'),
      description: 'Grocery Store',
      amountCents: 9876, // $98.76
      merchant: 'Safeway',
      categoryId: categoryMap.get('Groceries'),
    },
    {
      date: new Date('2024-12-01'),
      description: 'Spotify Premium',
      amountCents: 1099, // $10.99
      merchant: 'Spotify',
      categoryId: categoryMap.get('Subscriptions'),
    },
  ]

  // Delete existing transactions for clean seed
  await prisma.transaction.deleteMany({
    where: { userId: demoUser.id },
  })

  // Create sample transactions
  const createdTransactions = await prisma.transaction.createMany({
    data: sampleTransactions.map((t) => ({
      ...t,
      userId: demoUser.id,
    })),
  })

  console.log(`Created ${createdTransactions.count} sample transactions`)
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
