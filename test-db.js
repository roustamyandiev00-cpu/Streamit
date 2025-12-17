const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({})

async function main() {
    try {
        console.log('Connecting to database...');
        const userCount = await prisma.user.count();
        console.log('Successfully connected! User count:', userCount);

        // Test creating a user
        const email = `test-${Date.now()}@example.com`;
        console.log('Creating test user:', email);
        const user = await prisma.user.create({
            data: {
                email,
                name: 'Test User'
            }
        });
        console.log('User created:', user.id);

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
        console.log('User deleted');

    } catch (e) {
        console.error('Database connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
