/**
 * Middleware para validação de requisições
 * Request validation middleware using express-validator
 * 
 * @author CrediPesca Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Dados de entrada inválidos',
        message_en: 'Invalid input data',
        details: errorMessages
      }
    });
  }

  next();
}; 