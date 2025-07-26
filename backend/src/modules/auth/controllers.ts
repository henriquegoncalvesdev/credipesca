/**
 * Controladores de autenticação
 * Authentication controllers
 * 
 * @author CrediPesca Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========================================
// TIPOS E INTERFACES
// ========================================

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Gera tokens de acesso e refresh
 */
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Criptografa senha
 */
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verifica senha
 */
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ========================================
// CONTROLADORES
// ========================================

/**
 * Registra novo usuário
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email já está em uso',
          message_en: 'Email is already in use'
        }
      });
    }

    // Criptografar senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    res.status(201).json({
      success: true,
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken
        }
      },
      message: 'Usuário registrado com sucesso',
      message_en: 'User registered successfully'
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        message_en: 'Internal server error'
      }
    });
  }
};

/**
 * Login do usuário
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Email ou senha inválidos',
          message_en: 'Invalid email or password'
        }
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Conta desativada',
          message_en: 'Account is deactivated'
        }
      });
    }

    // Verificar senha
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Email ou senha inválidos',
          message_en: 'Invalid email or password'
        }
      });
    }

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Retornar dados do usuário (sem senha)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      data: {
        user: userData,
        tokens: {
          accessToken,
          refreshToken
        }
      },
      message: 'Login realizado com sucesso',
      message_en: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        message_en: 'Internal server error'
      }
    });
  }
};

/**
 * Renovar token de acesso
 * @route POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token é obrigatório',
          message_en: 'Refresh token is required'
        }
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token inválido',
          message_en: 'Invalid token'
        }
      });
    }

    // Verificar se usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuário não encontrado ou inativo',
          message_en: 'User not found or inactive'
        }
      });
    }

    // Gerar novos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      },
      message: 'Token renovado com sucesso',
      message_en: 'Token refreshed successfully'
    });
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

    console.error('❌ Erro ao renovar token:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        message_en: 'Internal server error'
      }
    });
  }
};

/**
 * Logout do usuário
 * @route POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Em uma implementação mais robusta, você poderia invalidar o refresh token
    // adicionando-o a uma blacklist ou marcando como usado

    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
      message_en: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        message_en: 'Internal server error'
      }
    });
  }
};

/**
 * Solicitar redefinição de senha
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return res.json({
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha',
        message_en: 'If the email exists, you will receive instructions to reset your password'
      });
    }

    // Gerar token de reset
    const resetToken = jwt.sign(
      { userId: user.id, type: 'reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Em uma implementação real, você enviaria um email com o token
    // Por enquanto, apenas retornamos uma mensagem de sucesso

    res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções para redefinir sua senha',
      message_en: 'If the email exists, you will receive instructions to reset your password'
    });
  } catch (error) {
    console.error('❌ Erro ao solicitar reset de senha:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        message_en: 'Internal server error'
      }
    });
  }
};

/**
 * Redefinir senha
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'reset') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Token inválido',
          message_en: 'Invalid token'
        }
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Usuário não encontrado',
          message_en: 'User not found'
        }
      });
    }

    // Criptografar nova senha
    const hashedPassword = await hashPassword(password);

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso',
      message_en: 'Password reset successfully'
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Token inválido ou expirado',
          message_en: 'Invalid or expired token'
        }
      });
    }

    console.error('❌ Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        message_en: 'Internal server error'
      }
    });
  }
};

/**
 * Alterar senha
 * @route POST /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuário não autenticado',
          message_en: 'User not authenticated'
        }
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Usuário não encontrado',
          message_en: 'User not found'
        }
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Senha atual incorreta',
          message_en: 'Current password is incorrect'
        }
      });
    }

    // Criptografar nova senha
    const hashedNewPassword = await hashPassword(newPassword);

    // Atualizar senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso',
      message_en: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        message_en: 'Internal server error'
      }
    });
  }
}; 