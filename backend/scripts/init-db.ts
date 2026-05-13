import { spawn } from 'child_process';
import prisma from '../src/db';

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Step 1: Push schema to database
    console.log('📋 Step 1: Creating/updating database schema...');
    await new Promise((resolve, reject) => {
      const prismaProcess = spawn('npx', ['prisma', 'db', 'push', '--skip-generate'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });

      prismaProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Schema created/updated successfully\n');
          resolve(null);
        } else {
          reject(new Error(`Prisma db push failed with code ${code}`));
        }
      });

      prismaProcess.on('error', (err) => {
        reject(err);
      });
    });

    // Step 2: Seed database
    console.log('🌱 Step 2: Seeding database with initial data...');
    const seed = (await import('../prisma/seed')).default;
    await seed();
    console.log('✅ Database seeded successfully\n');

    console.log('✨ Database initialization complete!');
    console.log('You can now start the server with: npm start');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase();
