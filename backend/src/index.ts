/**
 * CrediPesca Backend API
 * Servidor principal da aplicação
 * 
 * @author CrediPesca Team
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Importações de módulos
import { errorHandler } from '@/shared/middleware/errorHandler';
import { notFoundHandler } from '@/shared/middleware/notFoundHandler';
import { authMiddleware } from '@/shared/middleware/authMiddleware';

// Importações de rotas
import authRoutes from '@/modules/auth/routes';
import clientRoutes from '@/modules/clients/routes';
import projectRoutes from '@/modules/projects/routes';
import documentRoutes from '@/modules/documents/routes';
import userRoutes from '@/modules/users/routes';

// Configuração do dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// CONFIGURAÇÕES DE SEGURANÇA E PERFORMANCE
// ========================================

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    error_en: 'Too many requests. Try again in 15 minutes.'
  }
});

// Middlewares de segurança e performance
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(limiter);
app.use(morgan('combined'));

// ========================================
// MIDDLEWARES DE PARSING
// ========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// SERVIÇO DE ARQUIVOS ESTÁTICOS
// ========================================

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================================
// ROTAS DA API
// ========================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/clients', authMiddleware, clientRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);

// ========================================
// MIDDLEWARES DE ERRO
// ========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📋 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();

export default app; 