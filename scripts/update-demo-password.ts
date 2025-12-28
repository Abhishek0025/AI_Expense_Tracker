import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating demo user password...')

  const demoPasswordHash = await bcrypt.hash('demo123', 10)

  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@local.dev' },
  })

  if (!demoUser) {
    console.log('Demo user not found. Creating...')
    await prisma.user.create({
      data: {
        email: 'demo@local.dev',
        passwordHash: demoPasswordHash,
      },
    })
    console.log('Demo user created with password: demo123')
  } else {
    await prisma.user.update({
      where: { id: demoUser.id },
      data: { passwordHash: demoPasswordHash },
    })
    console.log('Demo user password updated to: demo123')
  }

  console.log('Done!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

