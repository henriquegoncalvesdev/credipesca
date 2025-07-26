/**
 * Rotas de autenticação
 * Authentication routes
 * 
 * @author CrediPesca Team
 * @version 1.0.0
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@/shared/middleware/validateRequest';
import { 
  register, 
  login, 
  refreshToken, 
  logout,
  forgotPassword,
  resetPassword,
  changePassword
} from './controllers';

const router = Router();

// ========================================
// VALIDAÇÕES
// ========================================

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
];

// ========================================
// ROTAS
// ========================================

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', registerValidation, validateRequest, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login do usuário
 * @access  Public
 */
router.post('/login', loginValidation, validateRequest, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token de acesso
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar redefinição de senha
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Redefinir senha
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Alterar senha
 * @access  Private
 */
router.post('/change-password', changePasswordValidation, validateRequest, changePassword);

export default router; 