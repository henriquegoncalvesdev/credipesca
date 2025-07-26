#!/bin/bash

# CrediPesca - Script de Configuração Inicial
# Setup script for CrediPesca project

set -e

echo "🚀 Iniciando configuração do CrediPesca..."
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

log "Node.js $(node -v) detectado ✓"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    warn "Docker não está instalado. O projeto funcionará apenas com instalação local."
    DOCKER_AVAILABLE=false
else
    log "Docker detectado ✓"
    DOCKER_AVAILABLE=true
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    warn "Docker Compose não está instalado."
    DOCKER_COMPOSE_AVAILABLE=false
else
    log "Docker Compose detectado ✓"
    DOCKER_COMPOSE_AVAILABLE=true
fi

# Criar diretórios necessários
log "Criando diretórios..."
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p frontend/public
mkdir -p docs

# Instalar dependências do projeto principal
log "Instalando dependências do projeto principal..."
npm install

# Instalar dependências do backend
log "Instalando dependências do backend..."
cd backend
npm install

# Configurar variáveis de ambiente do backend
if [ ! -f .env ]; then
    log "Criando arquivo .env do backend..."
    cp env.example .env
    warn "Configure as variáveis de ambiente em backend/.env"
fi

cd ..

# Instalar dependências do frontend
log "Instalando dependências do frontend..."
cd frontend
npm install

# Configurar variáveis de ambiente do frontend
if [ ! -f .env.local ]; then
    log "Criando arquivo .env.local do frontend..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=CrediPesca
EOF
fi

cd ..

# Configurar banco de dados
if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
    log "Iniciando serviços com Docker Compose..."
    docker-compose up -d postgres redis
    
    # Aguardar banco estar pronto
    log "Aguardando banco de dados..."
    sleep 10
    
    # Executar migrações
    log "Executando migrações do banco de dados..."
    cd backend
    npm run db:setup
    cd ..
else
    warn "Docker não disponível. Configure o banco de dados manualmente."
    log "Para configurar o banco de dados manualmente:"
    echo "1. Instale PostgreSQL"
    echo "2. Crie um banco de dados chamado 'credipesca_db'"
    echo "3. Configure a DATABASE_URL no arquivo backend/.env"
    echo "4. Execute: cd backend && npm run db:setup"
fi

# Criar usuário admin inicial
log "Criando usuário administrador inicial..."
cd backend
npm run db:seed
cd ..

# Verificar se tudo está funcionando
log "Verificando configuração..."

# Testar backend
if curl -s http://localhost:3001/health > /dev/null; then
    log "Backend está funcionando ✓"
else
    warn "Backend não está respondendo. Execute: npm run dev:backend"
fi

# Testar frontend
if curl -s http://localhost:3000 > /dev/null; then
    log "Frontend está funcionando ✓"
else
    warn "Frontend não está respondendo. Execute: npm run dev:frontend"
fi

echo ""
echo "🎉 Configuração concluída!"
echo "=========================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Configure as variáveis de ambiente:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "2. Inicie o projeto:"
echo "   npm run dev"
echo ""
echo "3. Acesse a aplicação:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Health Check: http://localhost:3001/health"
echo ""
echo "4. Credenciais iniciais:"
echo "   - Email: admin@credipesca.com"
echo "   - Senha: admin123"
echo ""
echo "📚 Documentação:"
echo "   - README.md"
echo "   - docs/ARCHITECTURE.md"
echo ""
echo "🔧 Comandos úteis:"
echo "   npm run dev          # Inicia backend e frontend"
echo "   npm run dev:backend  # Apenas backend"
echo "   npm run dev:frontend # Apenas frontend"
echo "   npm run build        # Build para produção"
echo "   npm run test         # Executa testes"
echo "   npm run lint         # Verifica código"
echo ""
echo "🐳 Para usar Docker:"
echo "   docker-compose up -d  # Inicia todos os serviços"
echo "   docker-compose down   # Para todos os serviços"
echo ""

log "Setup concluído com sucesso! 🚀" 