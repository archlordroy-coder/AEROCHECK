import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import documentRoutes from './routes/documents.js';
import licenseRoutes from './routes/licenses.js';
import statsRoutes from './routes/stats.js';
import notificationRoutes from './routes/notifications.js';
import archiveRoutes from './routes/archive.js';
import adminRoutes from './routes/admin.js';
import referencesRoutes from './routes/references.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startNotificationScheduler } from './services/notifications.js';

// Charger les variables d'environnement depuis le .env racine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uploads: uploadsDir });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/references', referencesRoutes);

// Error handler
app.use(errorHandler);

// Start server (local development only - Vercel uses serverless handler)
const isVercelDeployment = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';

if (!isVercelDeployment) {
  app.listen(PORT, () => {
    console.log(`[AEROCHECK] Backend running on port ${PORT}`);
    console.log(`[AEROCHECK] CORS origins: ${corsOrigins.join(', ')}`);
    
    // Démarrer le planificateur de notifications
    startNotificationScheduler();
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default app;
