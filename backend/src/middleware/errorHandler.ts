import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[AEROCHECK Error]', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Une erreur interne est survenue'
  });
};
