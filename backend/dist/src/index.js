"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const reports_1 = __importDefault(require("./routes/reports"));
const spend_1 = __importDefault(require("./routes/spend"));
const budgets_1 = __importDefault(require("./routes/budgets"));
const models_1 = __importDefault(require("./routes/models"));
const policies_1 = __importDefault(require("./routes/policies"));
const violations_1 = __importDefault(require("./routes/violations"));
const roi_1 = __importDefault(require("./routes/roi"));
const forecast_1 = __importDefault(require("./routes/forecast"));
const workflows_1 = __importDefault(require("./routes/workflows"));
const chat_1 = __importDefault(require("./routes/chat"));
const settings_1 = __importDefault(require("./routes/settings"));
const users_1 = __importDefault(require("./routes/users"));
const tools_1 = __importDefault(require("./routes/tools"));
const agents_1 = __importDefault(require("./routes/agents"));
const audit_1 = __importDefault(require("./routes/audit"));
const rag_1 = __importDefault(require("./routes/rag"));
const auth_1 = require("./middleware/auth");
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(origin => origin.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS policy: origin ${origin} is not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Canary Log
app.use((req, res, next) => {
    console.log(`[CANARY] ${req.method} ${req.url}`);
    next();
});
// HTTP Logging
app.use((0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
        write: (message) => logger_1.default.info(message.trim())
    }
}));
// Public routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Protected routes (Authentication)
app.use('/api', auth_1.authMiddleware);
// Organization isolation (Authorization)
app.use('/api', auth_1.orgAccessMiddleware);
// Routes
app.use('/api/models', models_1.default);
app.use('/api/policies', policies_1.default);
app.use('/api/violations', violations_1.default);
app.use('/api/spend', spend_1.default);
app.use('/api/budgets', budgets_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/roi', roi_1.default);
app.use('/api/forecast', forecast_1.default);
app.use('/api/workflows', workflows_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/users', users_1.default);
app.use('/api/tools', tools_1.default);
app.use('/api/agents', agents_1.default);
app.use('/api/audit', audit_1.default);
app.use('/api/rag', rag_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error(err.message, { stack: err.stack });
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});
// Start server
const server = app.listen(PORT, () => {
    logger_1.default.info(`✓ Atlas AI Hub Backend running on port ${PORT}`);
});
// Keep-alive heartbeat for dev environment
setInterval(() => {
    // No-op to prevent process from exiting
}, 1000 * 60 * 60); // 1 hour interval
// Graceful shutdown
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
