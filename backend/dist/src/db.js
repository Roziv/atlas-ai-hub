"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Resolve the db path. Prisma schema says file:./dev.db
// When running from backend/, it should resolve to backend/dev.db
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';
const resolvedDbPath = path_1.default.resolve(process.cwd(), dbPath);
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: resolvedDbPath });
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
