import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/api';
import { ValidationError } from './validation';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: Record<string, any>;
}

function createErrorResponse(error: AppError, req: Request): ErrorResponse {
  return {
    error: {
      message: error.message || 'Internal Server Error',
      code: error.code || 'INTERNAL_ERROR',
      statusCode: error.statusCode || 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      details: error.details,
    },
  };
}

export function errorHandler(error: AppError, req: Request, res: Response, next: NextFunction): void {
  // Log error for debugging
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  const statusCode = error.statusCode || 500;
  const errorResponse = createErrorResponse(error, req);

  res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
  const error: ErrorResponse = {
    error: {
      message: `Endpoint not found: ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      details: {
        method: req.method,
        availableEndpoints: [
          'GET /ua',
          'GET /uas',
          'POST /ua/export',
          'GET /health',
          'GET /stats',
          'GET /components',
        ],
      },
    },
  };

  res.status(404).json(error);
}

// Async error wrapper for route handlers
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}