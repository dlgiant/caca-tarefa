#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

const log = {
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}`),
};

async function setupSupabase() {
  log.title('🚀 Configuração do Supabase para Caça Tarefa');
  
  console.log(`
Este script irá ajudá-lo a configurar o Supabase para seu projeto.
Você precisará das seguintes informações do painel do Supabase:
1. Database Password (Settings > Database)
2. Connection Strings (Settings > Database > Connection string)
`);

  // Check if .env.local exists
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    log.error('.env.local não encontrado. Criando um novo arquivo...');
    const template = readFileSync(join(process.cwd(), '.env.production.example'), 'utf-8');
    writeFileSync(envPath, template);
  }

  // Ask for database password
  const password = await question('Digite a senha do banco de dados Supabase: ');
  
  if (!password) {
    log.error('Senha é obrigatória!');
    rl.close();
    process.exit(1);
  }

  // Construct the database URLs
  const projectRef = 'itnpccxvhnmwvoxgsgcp';
  const poolerUrl = `postgresql://postgres.${projectRef}:${password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
  const directUrl = `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`;

  log.info('Atualizando variáveis de ambiente...');
  
  // Read current .env.local
  let envContent = readFileSync(envPath, 'utf-8');
  
  // Update or add DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    // Comment out SQLite URL and add PostgreSQL URLs
    envContent = envContent.replace(
      /^DATABASE_URL="file:\.\/dev\.db"$/m,
      `# Para desenvolvimento local (SQLite):\n# DATABASE_URL="file:./dev.db"\n\n# Para produção (Supabase PostgreSQL):\nDATABASE_URL="${poolerUrl}"\nDIRECT_URL="${directUrl}"`
    );
  } else {
    envContent += `\n# Database URLs\nDATABASE_URL="${poolerUrl}"\nDIRECT_URL="${directUrl}"\n`;
  }

  // Write updated content
  writeFileSync(envPath, envContent);
  log.success('Variáveis de ambiente atualizadas!');

  // Test connection
  const testConnection = await question('\nDeseja testar a conexão com o banco? (s/n): ');
  
  if (testConnection.toLowerCase() === 's') {
    log.info('Testando conexão com o Supabase...');
    
    try {
      // Generate Prisma Client
      log.info('Gerando Prisma Client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // Test database connection
      log.info('Testando conexão com o banco de dados...');
      execSync('npx prisma db pull --force', { stdio: 'pipe' });
      
      log.success('Conexão com o banco de dados estabelecida com sucesso!');
      
      // Ask about migrations
      const runMigrations = await question('\nDeseja executar as migrations no banco? (s/n): ');
      
      if (runMigrations.toLowerCase() === 's') {
        log.info('Executando migrations...');
        
        try {
          // Reset database and run migrations
          const resetDb = await question('Deseja resetar o banco antes? Isso apagará todos os dados! (s/n): ');
          
          if (resetDb.toLowerCase() === 's') {
            log.warning('Resetando banco de dados...');
            execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
          } else {
            execSync('npx prisma migrate deploy', { stdio: 'inherit' });
          }
          
          log.success('Migrations aplicadas com sucesso!');
          
          // Ask about seeding
          const runSeed = await question('\nDeseja popular o banco com dados de teste? (s/n): ');
          
          if (runSeed.toLowerCase() === 's') {
            log.info('Populando banco de dados...');
            execSync('npx prisma db seed', { stdio: 'inherit' });
            log.success('Banco de dados populado com sucesso!');
          }
        } catch (error) {
          log.error('Erro ao executar migrations: ' + error);
        }
      }
      
    } catch (error) {
      log.error('Erro ao conectar com o banco de dados: ' + error);
      log.warning('Verifique se a senha está correta e tente novamente.');
    }
  }

  // Show next steps
  console.log(`
${colors.bright}${colors.green}✅ Configuração concluída!${colors.reset}

${colors.bright}Próximos passos:${colors.reset}
1. Configure as outras variáveis de ambiente necessárias:
   - NEXTAUTH_SECRET (gere com: openssl rand -base64 32)
   - ANTHROPIC_API_KEY (obtenha em console.anthropic.com)
   - CRON_SECRET (gere um token aleatório)

2. Para desenvolvimento local:
   ${colors.cyan}npm run dev${colors.reset}

3. Para deploy no Vercel:
   - Configure as mesmas variáveis no painel do Vercel
   - Faça push do código para o GitHub
   - Importe o projeto no Vercel

4. Após o deploy, execute as migrations em produção:
   ${colors.cyan}npx prisma migrate deploy${colors.reset}

${colors.bright}Documentação:${colors.reset}
- README.md - Visão geral do projeto
- DEPLOY.md - Guia detalhado de deploy
`);

  rl.close();
}

// Run the setup
setupSupabase().catch((error) => {
  log.error('Erro durante a configuração: ' + error);
  rl.close();
  process.exit(1);
});
