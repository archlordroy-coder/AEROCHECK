import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import documentRoutes from './routes/documents.js';
import licenseRoutes from './routes/licenses.js';
import statsRoutes from './routes/stats.js';
import notificationRoutes from './routes/notifications.js';
import archiveRoutes from './routes/archive.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startNotificationScheduler } from './services/notifications.js';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/archive', archiveRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[AEROCHECK] Backend running on http://localhost:${PORT}`);
  
  // Démarrer le planificateur de notifications
  startNotificationScheduler();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
