/**
 * Middleware para tratamento centralizado de erros
 * Centralized error handling middleware
 * 
 * @author CrediPesca Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Log do erro para debugging
  console.error('❌ Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Tratamento de erros específicos do Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Erro na operação do banco de dados';
  }

  if (error.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Dados inválidos fornecidos';
  }

  // Tratamento de erros de validação
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dados de entrada inválidos';
  }

  // Tratamento de erros de autenticação
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Resposta de erro padronizada
  const errorResponse = {
    success: false,
    error: {
      message: message || 'Erro interno do servidor',
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    }
  };

  // Em desenvolvimento, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
}; 