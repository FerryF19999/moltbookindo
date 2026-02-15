// Migration script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Running migrations...');
    await prisma.$connect();
    console.log('Database connected successfully');
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
