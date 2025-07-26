/**
 * Middleware para tratamento de rotas não encontradas
 * Not found route handler middleware
 * 
 * @author CrediPesca Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
  (error as any).statusCode = 404;
  
  next(error);
}; 