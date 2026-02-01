import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';

import logger from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import rolesRoutes from './routes/roles.js';
import coursesRoutes from './routes/courses.js';
import filesRoutes from './routes/files.js';
import academicRoutes from './routes/academic.js';
import notificationsRoutes from './routes/notifications.js';
import reportsRoutes from './routes/reports.js';
import aiRoutes from './routes/ai.js';
import auditRoutes from './routes/audit.js';
import trashRoutes from './routes/trash.js';
import settingsRoutes from './routes/settings.js';

// ============================================
// 🚀 Create Hono App
// ============================================

const app = new Hono();

// ============================================
// 🔧 Global Middlewares
// ============================================

// Security headers
app.use('*', secureHeaders());

// CORS - Allow multiple origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());

app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return '*';
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return origin;
      }
      return allowedOrigins[0];
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
  })
);

// Request logging
app.use('*', honoLogger());

// Response timing
app.use('*', timing());

// Pretty JSON in development
if (process.env.NODE_ENV !== 'production') {
  app.use('*', prettyJSON());
}

// ============================================
// 📡 Routes
// ============================================

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    message: '🚀 S-ACM Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const api = app
  .basePath('/api')
  .route('/auth', authRoutes)
  .route('/users', usersRoutes)
  .route('/roles', rolesRoutes)
  .route('/courses', coursesRoutes)
  .route('/files', filesRoutes)
  .route('/academic', academicRoutes)
  .route('/notifications', notificationsRoutes)
  .route('/reports', reportsRoutes)
  .route('/ai', aiRoutes)
  .route('/audit', auditRoutes)
  .route('/trash', trashRoutes)
  .route('/settings', settingsRoutes);

// ============================================
// ❌ Error Handling
// ============================================

app.onError(errorHandler);
app.notFound(notFoundHandler);

// ============================================
// 🎯 Export Types for RPC
// ============================================

export type AppType = typeof api;

// ============================================
// 🚀 Start Server
// ============================================

const port = parseInt(process.env.PORT || '3001', 10);

logger.info(`🚀 Starting S-ACM Backend...`);
logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`✅ Server running at http://localhost:${info.port}`);
    logger.info(`📚 API available at http://localhost:${info.port}/api`);
  }
);

export default app;
