# 🎯 Caça Tarefa - Sistema Inteligente de Gerenciamento de Tarefas

<div align="center">
  <img src="public/logo.svg" alt="Caça Tarefa Logo" width="200" />
  
  ![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=for-the-badge&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
  ![Prisma](https://img.shields.io/badge/Prisma-6.13-2D3748?style=for-the-badge&logo=prisma)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
  
  [Demo](https://caca-tarefa.vercel.app) • [Documentação API](#api-documentation) • [Deploy](#deploy)
</div>

## 📋 Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Deploy](#deploy)
- [API Documentation](#api-documentation)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🚀 Sobre

O **Caça Tarefa** é um sistema avançado de gerenciamento de tarefas com inteligência artificial integrada, desenvolvido para maximizar produtividade e organização. Utiliza Claude AI para fornecer insights inteligentes e automação de tarefas.

### ✨ Principais Diferenciais

- 🤖 **IA Integrada**: Assistente virtual com Claude AI para análise e sugestões
- 📊 **Analytics Avançado**: Dashboards interativos com métricas de produtividade
- 🔄 **Real-time Updates**: Sincronização em tempo real entre dispositivos
- 📱 **PWA**: Funciona offline e pode ser instalado como app
- 🌙 **Dark Mode**: Interface adaptável com tema claro/escuro
- 🔐 **Segurança**: Autenticação robusta e criptografia de dados

## 🎯 Funcionalidades

### Gerenciamento de Tarefas
- ✅ CRUD completo de tarefas
- 🏷️ Sistema de tags e categorias
- 📅 Calendário interativo
- 🔔 Lembretes e notificações
- 📎 Anexos e arquivos
- 🎯 Priorização inteligente
- 📈 Tracking de progresso

### Inteligência Artificial
- 💬 Chat com IA para assistência
- 📝 Geração automática de tarefas
- 📊 Análise de produtividade
- 🎯 Sugestões de otimização
- 🔍 Busca semântica

### Colaboração
- 👥 Projetos compartilhados
- 💬 Comentários em tarefas
- 📧 Notificações por email
- 🔄 Sincronização em tempo real

### Relatórios e Exportação
- 📊 Dashboard analítico
- 📈 Gráficos de desempenho
- 📄 Exportação PDF/CSV
- 📊 Relatórios personalizados

## 🛠️ Tecnologias

### Frontend
- **Next.js 15.4** - Framework React com App Router
- **TypeScript** - Type safety
- **TailwindCSS 4** - Estilização
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **React Query** - State management
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js API Routes** - API REST
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Banco de dados
- **NextAuth.js** - Autenticação
- **Claude AI** - Inteligência artificial

### DevOps & Tools
- **Vercel** - Hosting e deploy
- **GitHub Actions** - CI/CD
- **Husky** - Git hooks
- **ESLint & Prettier** - Code quality
- **Jest** - Testes unitários

## 📦 Instalação

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- npm ou yarn
- Conta Anthropic (Claude AI)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/caca-tarefa.git
cd caca-tarefa
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

4. **Configure o banco de dados**
```bash
# Execute as migrations
npm run db:migrate

# (Opcional) Popule com dados de exemplo
npm run db:seed
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/caca_tarefa"

# Autenticação
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"

# Claude AI (Obrigatório)
ANTHROPIC_API_KEY="sk-ant-..."

# Rate Limiting
NEXT_PUBLIC_AI_RATE_LIMIT="100"

# Email (Opcional)
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@exemplo.com"

# Pusher (Opcional - Real-time)
NEXT_PUBLIC_PUSHER_APP_KEY=""
PUSHER_APP_ID=""
PUSHER_SECRET=""
```

### Banco de Dados

#### Desenvolvimento Local
```bash
# PostgreSQL com Docker
docker run --name caca-tarefa-db \
  -e POSTGRES_PASSWORD=senha \
  -e POSTGRES_DB=caca_tarefa \
  -p 5432:5432 \
  -d postgres:15
```

#### Produção - Opções Recomendadas

1. **Supabase** (Recomendado)
   - Free tier generoso
   - Backup automático
   - Interface web
   ```env
   DATABASE_URL="postgresql://postgres.[id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
   ```

2. **Neon**
   - Serverless PostgreSQL
   - Auto-scaling
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[database]"
   ```

3. **Vercel Postgres**
   - Integração nativa
   ```env
   DATABASE_URL="postgres://default:[password]@[endpoint].postgres.vercel-storage.com:5432/verceldb"
   ```

## 🚀 Deploy

### Deploy na Vercel (Recomendado)

1. **Fork este repositório**

2. **Importe no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe o repositório

3. **Configure as variáveis de ambiente**
   - Adicione todas as variáveis do `.env.production`
   - Configure `CRON_SECRET` para os jobs

4. **Configure o banco de dados**
   - Escolha um provedor (Supabase, Neon, etc)
   - Execute as migrations após o deploy

5. **Domínio personalizado** (Opcional)
   - Adicione seu domínio em Settings > Domains

### Deploy Manual

```bash
# Build de produção
npm run build

# Iniciar servidor de produção
npm start
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 API Documentation

### Autenticação

Todas as rotas da API requerem autenticação via NextAuth.js.

```typescript
// Headers necessários
{
  "Authorization": "Bearer [token]",
  "Content-Type": "application/json"
}
```

### Endpoints

#### Tasks

**GET /api/tasks**
Listar tarefas do usuário

Query params:
- `status`: TODO | IN_PROGRESS | DONE
- `priority`: LOW | MEDIUM | HIGH | URGENT
- `categoryId`: UUID
- `projectId`: UUID
- `page`: number (default: 1)
- `limit`: number (default: 10)

Response:
```json
{
  "tasks": [...],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

**POST /api/tasks**
Criar nova tarefa

Body:
```json
{
  "title": "string",
  "description": "string?",
  "dueDate": "ISO 8601",
  "priority": "MEDIUM",
  "categoryId": "UUID?",
  "projectId": "UUID?",
  "tags": ["string"]
}
```

**PUT /api/tasks/:id**
Atualizar tarefa

**DELETE /api/tasks/:id**
Deletar tarefa

#### AI Assistant

**POST /api/ai/chat**
Interagir com o assistente de IA

Body:
```json
{
  "message": "string",
  "context": {
    "taskId": "UUID?",
    "projectId": "UUID?"
  }
}
```

Response:
```json
{
  "response": "string",
  "action": {
    "type": "CREATE_TASK | ANALYZE | SUGGEST",
    "data": {}
  }
}
```

**POST /api/ai/analyze**
Analisar produtividade

Response:
```json
{
  "insights": {
    "productivity_score": 85,
    "recommendations": [...],
    "patterns": [...]
  }
}
```

#### Projects

**GET /api/projects**
Listar projetos

**POST /api/projects**
Criar projeto

**PUT /api/projects/:id**
Atualizar projeto

**DELETE /api/projects/:id**
Deletar projeto

#### Categories

**GET /api/categories**
Listar categorias

**POST /api/categories**
Criar categoria

#### Analytics

**GET /api/analytics/dashboard**
Dados do dashboard

Response:
```json
{
  "stats": {
    "total_tasks": 150,
    "completed_tasks": 100,
    "completion_rate": 66.7,
    "overdue_tasks": 5
  },
  "charts": {
    "weekly_progress": [...],
    "category_distribution": [...],
    "productivity_trend": [...]
  }
}
```

#### Export

**GET /api/export/pdf**
Exportar relatório em PDF

Query params:
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `projectId`: UUID?

**GET /api/export/csv**
Exportar dados em CSV

### Rate Limiting

- **Geral**: 100 requests/minuto
- **AI**: 60 requests/minuto
- **Export**: 10 requests/minuto

### Webhooks

Configure webhooks para receber notificações:

```json
{
  "url": "https://seu-servidor.com/webhook",
  "events": ["task.created", "task.completed"],
  "secret": "webhook_secret"
}
```

## 📁 Estrutura do Projeto

```
caca-tarefa/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Área logada
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth
│   │   ├── tasks/         # CRUD de tarefas
│   │   ├── ai/            # Integração com IA
│   │   ├── cron/          # Jobs agendados
│   │   └── export/        # Exportação de dados
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   ├── forms/            # Formulários
│   └── charts/           # Gráficos
├── lib/                   # Utilitários
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # Configuração NextAuth
│   └── ai.ts             # Cliente Claude AI
├── prisma/               # Database
│   ├── schema.prisma     # Schema do banco
│   └── migrations/       # Migrations
├── public/               # Arquivos estáticos
├── scripts/              # Scripts auxiliares
│   └── backup.ts         # Script de backup
├── styles/               # Estilos globais
└── tests/                # Testes
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes e2e
npm run test:e2e
```

## 📈 Monitoramento

### Métricas Recomendadas

- **Vercel Analytics** - Métricas de performance
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - APM e logs

### Health Check

```bash
curl https://seu-dominio.com/api/health
```

## 🔐 Segurança

### Best Practices Implementadas

- ✅ Autenticação com NextAuth.js
- ✅ Validação de inputs com Zod
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ HTTPS enforced
- ✅ Security headers configurados

### Backup e Recovery

Backups automáticos configurados via cron job:
- Diário às 2:00 AM
- Retenção de 30 dias
- Upload para S3

Recovery:
```bash
npm run restore:backup -- --date=2024-01-01
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Guidelines

- Siga o padrão de código (ESLint + Prettier)
- Adicione testes para novas funcionalidades
- Atualize a documentação
- Mantenha commits semânticos

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Time

- **Ricardo Nunes** - *Desenvolvedor Principal* - [@ricardonunes](https://github.com/ricardonunes)

## 🙏 Agradecimentos

- Anthropic pela API do Claude
- Vercel pelo hosting
- Comunidade Open Source

---

<div align="center">
  Feito com ❤️ por Ricardo Nunes
  <br>
  <a href="https://github.com/ricardonunes/caca-tarefa">⭐ Star no GitHub</a>
</div>
