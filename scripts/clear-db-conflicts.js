const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Cleaning up database conflicts...');

        // Deleting users will cascade delete Streams, Accounts, Sessions, etc.
        // because of onDelete: Cascade in the schema.
        const { count } = await prisma.user.deleteMany({});

        console.log(`Successfully deleted ${count} users and their related data.`);
        console.log('Database is now clean of conflicting user records.');

    } catch (error) {
        console.error('Error cleaning database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
