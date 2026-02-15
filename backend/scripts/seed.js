// Seed script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Running seed...');
    await prisma.$connect();
    console.log('Database connected successfully');
    console.log('Seed complete!');
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
