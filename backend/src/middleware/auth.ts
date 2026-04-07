import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbHelpers } from '../db.js';
import type { Role } from '../../shared/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aerocheck-secret-key-2024';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    pays?: string;
    aeroport?: string;
  };
  headers: Request['headers'];
  params: Request['params'];
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Token manquant' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = dbHelpers.getById('User', decoded.userId) as any;

    if (!user) {
      res.status(401).json({ success: false, error: 'Utilisateur non trouve' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      firstName: user.firstName,
      lastName: user.lastName,
      pays: user.paysId || undefined,
      aeroport: user.aeroportId || undefined
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token invalide' });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifie' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Acces refuse. Role requis: ' + roles.join(', ') 
      });
      return;
    }

    next();
  };
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
