import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import './db.js'; // Initialize database
import { getDbInfo } from './db.js';
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import documentRoutes from './routes/documents.js';
import licenseRoutes from './routes/licenses.js';
import statsRoutes from './routes/stats.js';
import notificationRoutes from './routes/notifications.js';
import archiveRoutes from './routes/archive.js';
import adminRoutes from './routes/admin.js';
import referencesRoutes from './routes/references.js';
import airportsRoutes from './routes/airports.js';
import { errorHandler } from './middleware/errorHandler.js';

// Charger les variables d'environnement depuis le .env racine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3300;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:3010', 'http://127.0.0.1:3010'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Serve frontend static files (production build)
const frontendDistPath = path.join(__dirname, '../../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // SPA catch-all route - serve index.html for non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  const dbInfo = getDbInfo();
  res.json({
    status: 'ok',
    message: process.env.PING_MESSAGE || 'AEROCHECK API ready',
    apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${PORT}`,
    database: dbInfo,
    timestamp: new Date().toISOString(),
  });
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
app.use('/api/airports', airportsRoutes);

// Error handler
app.use(errorHandler);

// Start server (local development only - Vercel uses serverless handler)
const isVercelDeployment = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';

if (!isVercelDeployment) {
  app.listen(PORT, () => {
    console.log(`[AEROCHECK] Backend running on port ${PORT}`);
    console.log(`[AEROCHECK] CORS origins: ${corsOrigins.join(', ')}`);
    console.log(`[AEROCHECK] Database: ${getDbInfo().filePath}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[AEROCHECK] Arrêt gracieux...');
    process.exit(0);
  });
}

export default app;
