import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { db } from './db/index.js';
import authRoutes from './routes/auth.js';
import portfolioRoutes from './routes/portfolio.js';
import creatorRoutes from './routes/creators.js';
import agentRoutes from './routes/agents.js';
import taskRoutes from './routes/tasks.js';
import activityRoutes from './routes/activity.js';
import approvalRoutes from './routes/approvals.js';
import { authMiddleware } from './middleware/auth.js';
import { setupWebSocket } from './websocket/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      return callback(null, true);
    }
    // Allow any vercel.app domain for preview deployments
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Request');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.use('/api/v1/portfolio', authMiddleware, portfolioRoutes);
app.use('/api/v1/creators', authMiddleware, creatorRoutes);
app.use('/api/v1/agents', authMiddleware, agentRoutes);
app.use('/api/v1/tasks', authMiddleware, taskRoutes);
app.use('/api/v1/activity', authMiddleware, activityRoutes);
app.use('/api/v1/approvals', authMiddleware, approvalRoutes);

// WebSocket setup
setupWebSocket(io);

// Error handler
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

// Initialize database and start server
async function start() {
  try {
    await db.connect();
    logger.info('Database connected');
    
    httpServer.listen(PORT, () => {
      logger.info({ port: PORT }, 'Server started');
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
