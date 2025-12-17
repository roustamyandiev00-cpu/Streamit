const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@streamit.com' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@streamit.com',
      name: 'Demo User',
      avatar: null
    }
  })

  console.log('Created user:', user)

  // Create sample streams
  const stream1 = await prisma.stream.create({
    data: {
      title: 'My First RTMP Stream',
      description: 'Testing RTMP streaming with OBS',
      type: 'RTMP',
      status: 'DRAFT',
      userId: user.id,
      rtmpKey: 'rtmp_demo_key_123',
      brandColor: '#5c4dff',
      showOverlay: true,
      userName: 'Demo Streamer',
      userTitle: 'Content Creator'
    }
  })

  const stream2 = await prisma.stream.create({
    data: {
      title: 'Browser Studio Stream',
      description: 'Live streaming directly from browser',
      type: 'STUDIO',
      status: 'DRAFT',
      userId: user.id,
      brandColor: '#00cc88',
      showOverlay: true,
      userName: 'Studio User',
      userTitle: 'Live Broadcaster'
    }
  })

  console.log('Created streams:', { stream1, stream2 })

  // Add some chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        streamId: stream1.id,
        message: 'Welcome to the stream!',
        username: 'System',
        color: '#666666'
      },
      {
        streamId: stream1.id,
        message: 'Great setup!',
        username: 'Viewer1',
        color: '#ff6b6b'
      },
      {
        streamId: stream2.id,
        message: 'Studio looks amazing!',
        username: 'Fan123',
        color: '#4ecdc4'
      }
    ]
  })

  console.log('Added sample chat messages')

  // Add analytics data
  await prisma.streamAnalytics.createMany({
    data: [
      {
        streamId: stream1.id,
        viewerCount: 25,
        chatMessages: 15,
        duration: 3600 // 1 hour
      },
      {
        streamId: stream2.id,
        viewerCount: 42,
        chatMessages: 28,
        duration: 2400 // 40 minutes
      }
    ]
  })

  console.log('Added analytics data')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })