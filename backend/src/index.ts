import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportsRouter from './routes/reports';
import spendRouter from './routes/spend';
import budgetsRouter from './routes/budgets';
import modelsRouter from './routes/models';
import policiesRouter from './routes/policies';
import violationsRouter from './routes/violations';
import roiRouter from './routes/roi';
import forecastRouter from './routes/forecast';
import workflowsRouter from './routes/workflows';
import chatRouter from './routes/chat';
import settingsRouter from './routes/settings';
import usersRouter from './routes/users';
import toolsRouter from './routes/tools';
import agentsRouter from './routes/agents';
import auditRouter from './routes/audit';
import ragRouter from './routes/rag';

import { authMiddleware, orgAccessMiddleware } from './middleware/auth';
import morgan from 'morgan';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(origin => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Canary Log
app.use((req, res, next) => {
  console.log(`[CANARY] ${req.method} ${req.url}`);
  next();
});

// HTTP Logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Public routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes (Authentication)
app.use('/api', authMiddleware);

// Organization isolation (Authorization)
app.use('/api', orgAccessMiddleware);

// Routes
app.use('/api/models', modelsRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/violations', violationsRouter);
app.use('/api/spend', spendRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/roi', roiRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/rag', ragRouter);
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Import the db instance
    const prisma = (await import('./db')).default;

    // Run seed if database is empty
    const orgCount = await prisma.organization.count();

    if (orgCount === 0) {
      logger.info('Seeding database...');
      // Import and run seed
      const seed = (await import('../prisma/seed')).default;
      await seed();
      logger.info('Database seeded successfully');
    }
  } catch (error) {
    logger.error('Failed to initialize database', { error: String(error) });
    // Continue anyway - database might already exist
  }

  const server = app.listen(PORT, () => {
    logger.info(`✓ Atlas AI Hub Backend running on port ${PORT}`);
  });

  // Keep-alive heartbeat for dev environment
  setInterval(() => {
      // No-op to prevent process from exiting
  }, 1000 * 60 * 60); // 1 hour interval

  // Graceful shutdown
  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
}

startServer();
