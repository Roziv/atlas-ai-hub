import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Resolve the db path. Prisma schema says file:./dev.db
// When running from backend/, it should resolve to backend/dev.db
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';
const resolvedDbPath = path.resolve(process.cwd(), dbPath);

const adapter = new PrismaBetterSqlite3({ url: resolvedDbPath });

const prisma = new PrismaClient({ adapter });

export default prisma;
