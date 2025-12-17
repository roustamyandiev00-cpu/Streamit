import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.upsert({
      where: { email: 'demo@streamit.com' },
      update: {},
      create: {
        id: 'demo-user',
        email: 'demo@streamit.com',
        name: 'Demo User'
      }
    })
    console.log('✅ Demo user created:', user.id)
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()

