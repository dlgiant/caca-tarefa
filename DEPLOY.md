# 🚀 Guia de Deploy - Caça Tarefa

Este guia fornece instruções detalhadas para fazer o deploy do Caça Tarefa na Vercel com banco de dados PostgreSQL na nuvem.

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com)
- Conta na [Anthropic](https://console.anthropic.com) para Claude AI
- Conta em um provedor de banco de dados (Supabase, Neon, ou Railway)

## 🗄️ Passo 1: Configurar Banco de Dados

### Opção A: Supabase (Recomendado)

1. **Criar conta e projeto**
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Anote a senha do banco de dados

2. **Obter connection string**
   - Vá em Settings > Database
   - Copie a "Connection string" (URI)
   - Use o modo "Transaction" para produção:
   ```
   postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Opção B: Neon

1. **Criar conta e projeto**
   - Acesse [neon.tech](https://neon.tech)
   - Crie um novo projeto
   - Escolha a região mais próxima

2. **Obter connection string**
   ```
   postgresql://[USER]:[PASSWORD]@[ENDPOINT].neon.tech/[DATABASE]?sslmode=require
   ```

### Opção C: Railway

1. **Criar novo projeto**
   - Acesse [railway.app](https://railway.app)
   - Adicione PostgreSQL ao projeto
   - Copie a DATABASE_URL fornecida

## 🔑 Passo 2: Obter API Key do Claude

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Vá em API Keys
3. Crie uma nova chave
4. Copie e guarde com segurança

## 📦 Passo 3: Preparar Repositório

1. **Fork ou clone este repositório**
   ```bash
   git clone https://github.com/seu-usuario/caca-tarefa.git
   cd caca-tarefa
   ```

2. **Fazer push para seu GitHub**
   ```bash
   git remote add origin https://github.com/seu-usuario/caca-tarefa.git
   git push -u origin main
   ```

## 🚀 Passo 4: Deploy na Vercel

### 4.1 Importar Projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em "Import Git Repository"
3. Selecione o repositório `caca-tarefa`
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run vercel:build`
   - **Output Directory**: .next

### 4.2 Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no painel da Vercel:

#### Essenciais (Obrigatórias)

```env
# Banco de Dados (use a URL do passo 1)
DATABASE_URL=postgresql://...

# Autenticação
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=gerar_com_openssl_rand_base64_32

# Claude AI
ANTHROPIC_API_KEY=sk-ant-...

# Cron Jobs
CRON_SECRET=gerar_string_aleatoria_segura
```

#### Opcionais (Recomendadas)

```env
# Rate Limiting
NEXT_PUBLIC_AI_RATE_LIMIT=60

# Email (SendGrid)
EMAIL_SERVER=smtp://apikey:SG.xxx@smtp.sendgrid.net:587
EMAIL_FROM=noreply@seudominio.com

# Monitoramento (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx
```

### 4.3 Gerar Secrets

```bash
# Gerar NEXTAUTH_SECRET
openssl rand -base64 32

# Gerar CRON_SECRET
openssl rand -hex 32
```

### 4.4 Fazer Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. O deploy inicial pode falhar se as migrations não rodarem

## 🗃️ Passo 5: Executar Migrations

### Método 1: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Conectar ao projeto
vercel link

# Executar migrations
vercel env pull .env.production.local
npx prisma migrate deploy
```

### Método 2: Conexão Direta

```bash
# Configurar DATABASE_URL localmente
export DATABASE_URL="sua_url_de_producao"

# Executar migrations
npx prisma migrate deploy

# Verificar
npx prisma db seed # Opcional: adicionar dados de teste
```

## 🌐 Passo 6: Configurar Domínio (Opcional)

1. No painel da Vercel, vá em Settings > Domains
2. Adicione seu domínio personalizado
3. Configure DNS:
   - **CNAME**: `cname.vercel-dns.com`
   - Ou use nameservers da Vercel

4. Atualize `NEXTAUTH_URL`:
   ```env
   NEXTAUTH_URL=https://seudominio.com
   ```

## 🔧 Passo 7: Configurações Adicionais

### Configurar Região

Em `vercel.json`, ajuste a região para mais próxima:
```json
{
  "regions": ["gru1"] // São Paulo
}
```

Opções: `gru1` (São Paulo), `iad1` (Washington), `sfo1` (San Francisco)

### Configurar Cron Jobs

Os cron jobs já estão configurados em `vercel.json`:
- **Backup**: Diário às 2:00 AM
- **Lembretes**: A cada 15 minutos
- **Limpeza**: Semanal aos domingos

### Configurar Backup para S3 (Opcional)

1. Crie um bucket S3 ou use serviço compatível
2. Adicione as variáveis:
   ```env
   BACKUP_S3_BUCKET=seu-bucket
   BACKUP_S3_ACCESS_KEY=xxx
   BACKUP_S3_SECRET_KEY=xxx
   BACKUP_S3_REGION=us-east-1
   ```

## ✅ Passo 8: Verificar Deploy

1. **Testar aplicação**
   - Acesse `https://seu-projeto.vercel.app`
   - Crie uma conta
   - Teste funcionalidades principais

2. **Verificar logs**
   - No painel Vercel, vá em Functions > Logs
   - Verifique se há erros

3. **Monitorar performance**
   - Ative Vercel Analytics
   - Configure alertas

## 🔍 Troubleshooting

### Erro: "Database connection failed"
- Verifique se DATABASE_URL está correta
- Confirme se o banco aceita conexões externas
- Adicione `?sslmode=require` na URL se necessário

### Erro: "Prisma Client not generated"
- Certifique que o build command está correto
- Use `npm run vercel:build` ou `prisma generate && next build`

### Erro: "NEXTAUTH_SECRET not set"
- Gere um secret: `openssl rand -base64 32`
- Adicione nas variáveis de ambiente

### Erro: "AI rate limit exceeded"
- Reduza `NEXT_PUBLIC_AI_RATE_LIMIT`
- Verifique limites da API Anthropic

### Build muito lento
- Otimize imports no `next.config.ts`
- Use `experimental.optimizePackageImports`

## 📊 Monitoramento Pós-Deploy

### Métricas Importantes

1. **Performance**
   - Core Web Vitals
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)

2. **Erros**
   - Taxa de erro das APIs
   - Falhas de autenticação
   - Timeouts de banco

3. **Uso**
   - Requisições por minuto
   - Uso de AI API
   - Storage do banco

### Ferramentas Recomendadas

- **Vercel Analytics**: Métricas de performance
- **Sentry**: Error tracking
- **Better Uptime**: Monitoramento de uptime
- **Datadog**: APM completo

## 🔄 Atualizações e Manutenção

### Deploy de Atualizações

```bash
# Fazer alterações
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Vercel fará deploy automático
```

### Rollback

1. No painel Vercel, vá em Deployments
2. Encontre um deploy anterior funcionando
3. Clique em "..." > "Promote to Production"

### Backup Manual

```bash
# Conectar ao projeto
vercel env pull .env.local

# Executar backup
npm run backup:prod
```

## 📞 Suporte

### Recursos
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Prisma](https://prisma.io/docs)

### Comunidade
- [GitHub Issues](https://github.com/seu-usuario/caca-tarefa/issues)
- [Discord Vercel](https://vercel.com/discord)

---

## 🎉 Parabéns!

Seu Caça Tarefa está no ar! 🚀

Lembre-se de:
- ✅ Monitorar logs regularmente
- ✅ Fazer backups periódicos
- ✅ Atualizar dependências mensalmente
- ✅ Revisar métricas de performance
- ✅ Manter a documentação atualizada

---

<div align="center">
  <strong>Happy Deploying! 🎯</strong>
</div>
