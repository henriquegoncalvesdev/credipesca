/**
 * Middleware de autenticação JWT
 * JWT Authentication middleware
 * 
 * @author CrediPesca Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extensão da interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token de acesso não fornecido',
          message_en: 'Access token not provided'
        }
      });
    }

    // Extrair token
    const token = authHeader.substring(7);

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuário não encontrado',
          message_en: 'User not found'
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuário inativo',
          message_en: 'User is inactive'
        }
      });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token inválido',
          message_en: 'Invalid token'
        }
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expirado',
          message_en: 'Token expired'
        }
      });
    }

    console.error('❌ Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        message_en: 'Internal server error'
      }
    });
  }
};

// Middleware para verificar permissões de admin
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Acesso negado',
        message_en: 'Access denied'
      }
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Permissão insuficiente',
        message_en: 'Insufficient permissions'
      }
    });
  }

  next();
};

// Middleware para verificar permissões de manager ou admin
export const managerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Acesso negado',
        message_en: 'Access denied'
      }
    });
  }

  if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Permissão insuficiente',
        message_en: 'Insufficient permissions'
      }
    });
  }

  next();
}; 