import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/src/index.js';

// Serverless handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set environment variable to indicate Vercel environment
  process.env.VERCEL = '1';
  
  // Forward the request to Express app
  return app(req, res);
}
