# API Documentation - CrediPesca

## Base URL
```
http://localhost:3001/api
```

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Autenticação

#### POST /auth/register
Registra um novo usuário.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "Senha123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123456789",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "Usuário registrado com sucesso"
}
```

#### POST /auth/login
Faz login do usuário.

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "Senha123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123456789",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "Login realizado com sucesso"
}
```

#### POST /auth/refresh
Renova o token de acesso.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "Token renovado com sucesso"
}
```

#### POST /auth/logout
Faz logout do usuário.

**Response:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### Clientes

#### GET /clients
Lista todos os clientes do usuário autenticado.

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Termo de busca
- `status` (string): Filtrar por status (active/inactive)

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "clx123456789",
        "name": "Empresa ABC",
        "email": "contato@empresaabc.com",
        "phone": "(11) 99999-9999",
        "cpfCnpj": "12.345.678/0001-90",
        "address": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234-567",
        "notes": "Cliente importante",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### POST /clients
Cria um novo cliente.

**Request Body:**
```json
{
  "name": "Empresa ABC",
  "email": "contato@empresaabc.com",
  "phone": "(11) 99999-9999",
  "cpfCnpj": "12.345.678/0001-90",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "notes": "Cliente importante"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "clx123456789",
      "name": "Empresa ABC",
      "email": "contato@empresaabc.com",
      "phone": "(11) 99999-9999",
      "cpfCnpj": "12.345.678/0001-90",
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "notes": "Cliente importante",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Cliente criado com sucesso"
}
```

#### GET /clients/:id
Obtém detalhes de um cliente específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "clx123456789",
      "name": "Empresa ABC",
      "email": "contato@empresaabc.com",
      "phone": "(11) 99999-9999",
      "cpfCnpj": "12.345.678/0001-90",
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "notes": "Cliente importante",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "projects": [
        {
          "id": "clx987654321",
          "title": "Projeto X",
          "status": "ACTIVE"
        }
      ]
    }
  }
}
```

#### PUT /clients/:id
Atualiza um cliente.

**Request Body:**
```json
{
  "name": "Empresa ABC Atualizada",
  "email": "novo@empresaabc.com",
  "phone": "(11) 88888-8888"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "clx123456789",
      "name": "Empresa ABC Atualizada",
      "email": "novo@empresaabc.com",
      "phone": "(11) 88888-8888",
      "updatedAt": "2024-01-15T11:30:00Z"
    }
  },
  "message": "Cliente atualizado com sucesso"
}
```

#### DELETE /clients/:id
Remove um cliente.

**Response:**
```json
{
  "success": true,
  "message": "Cliente excluído com sucesso"
}
```

### Projetos

#### GET /projects
Lista todos os projetos do usuário autenticado.

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Termo de busca
- `status` (string): Filtrar por status
- `clientId` (string): Filtrar por cliente

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "clx987654321",
        "title": "Projeto X",
        "description": "Descrição do projeto",
        "status": "ACTIVE",
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-12-31T23:59:59Z",
        "budget": "50000.00",
        "notes": "Observações do projeto",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "client": {
          "id": "clx123456789",
          "name": "Empresa ABC"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### POST /projects
Cria um novo projeto.

**Request Body:**
```json
{
  "title": "Projeto X",
  "description": "Descrição do projeto",
  "clientId": "clx123456789",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": "50000.00",
  "notes": "Observações do projeto"
}
```

#### GET /projects/:id
Obtém detalhes de um projeto específico.

#### PUT /projects/:id
Atualiza um projeto.

#### DELETE /projects/:id
Remove um projeto.

### Documentos

#### GET /documents
Lista todos os documentos do usuário autenticado.

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Termo de busca
- `type` (string): Filtrar por tipo
- `status` (string): Filtrar por status
- `clientId` (string): Filtrar por cliente
- `projectId` (string): Filtrar por projeto

#### POST /documents
Cria um novo documento.

**Request Body:**
```json
{
  "title": "Custeio Projeto X",
  "type": "CUSTEIO",
  "clientId": "clx123456789",
  "projectId": "clx987654321",
  "content": {
    "sections": [
      {
        "title": "Custos de Produção",
        "items": [
          {
            "description": "Matéria-prima",
            "quantity": 100,
            "unitPrice": 50.00,
            "total": 5000.00
          }
        ]
      }
    ]
  }
}
```

#### GET /documents/:id
Obtém detalhes de um documento específico.

#### PUT /documents/:id
Atualiza um documento.

#### DELETE /documents/:id
Remove um documento.

#### POST /documents/:id/generate
Gera o arquivo do documento.

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "clx111222333",
      "fileName": "custeio-projeto-x.docx",
      "filePath": "/uploads/documents/custeio-projeto-x.docx",
      "fileSize": 1024000,
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
  },
  "message": "Documento gerado com sucesso"
}
```

#### GET /documents/:id/download
Baixa o arquivo do documento.

### Usuários

#### GET /users
Lista todos os usuários (apenas ADMIN).

#### POST /users
Cria um novo usuário (apenas ADMIN).

#### GET /users/:id
Obtém detalhes de um usuário.

#### PUT /users/:id
Atualiza um usuário.

#### DELETE /users/:id
Remove um usuário.

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Tratamento de Erros

Todos os erros seguem o padrão:

```json
{
  "success": false,
  "error": {
    "message": "Descrição do erro",
    "message_en": "Error description in English",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/clients",
    "method": "POST"
  }
}
```

## Rate Limiting

A API implementa rate limiting:
- **Limite**: 100 requests por IP
- **Janela**: 15 minutos
- **Headers de resposta**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Paginação

Endpoints que retornam listas suportam paginação:

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)

**Response:**
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## Filtros e Busca

Muitos endpoints suportam filtros e busca:

**Query Parameters:**
- `search`: Busca textual
- `status`: Filtro por status
- `type`: Filtro por tipo
- `dateFrom`: Data inicial
- `dateTo`: Data final

## Upload de Arquivos

Para upload de arquivos, use `multipart/form-data`:

```
POST /documents/:id/upload
Content-Type: multipart/form-data

file: [arquivo]
```

## Health Check

#### GET /health
Verifica o status da API.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "development"
}
``` 