#!/usr/bin/env tsx
/**
 * Script de Backup Automático do Banco de Dados
 *
 * Este script realiza backup do banco de dados PostgreSQL
 * e faz upload para um serviço de armazenamento (S3 ou compatível)
 *
 * Uso:
 * - Desenvolvimento: npm run backup:dev
 * - Produção: npm run backup:prod
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';
const execAsync = promisify(exec);
// Carregar variáveis de ambiente
config();
interface BackupConfig {
  databaseUrl: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;
  localBackupPath: string;
  maxBackups: number;
}
class DatabaseBackup {
  private config: BackupConfig;
  constructor(config: BackupConfig) {
    this.config = config;
  }
  /**
   * Gera nome único para o arquivo de backup
   */
  private generateBackupFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const env = process.env.NODE_ENV || 'development';
    return `backup-${env}-${timestamp}.sql`;
  }
  /**
   * Extrai informações de conexão da DATABASE_URL
   */
  private parseDatabaseUrl(url: string): {
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
  } {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: urlObj.port || '5432',
      database: urlObj.pathname.slice(1),
      username: urlObj.username,
      password: urlObj.password,
    };
  }
  /**
   * Executa o backup do banco de dados
   */
  async createBackup(): Promise<string> {
    const fileName = this.generateBackupFileName();
    const filePath = join(this.config.localBackupPath, fileName);
    console.log(`🔄 Iniciando backup: ${fileName}`);
    try {
      const dbInfo = this.parseDatabaseUrl(this.config.databaseUrl);
      // Configurar variáveis de ambiente para pg_dump
      const env = {
        ...process.env,
        PGPASSWORD: dbInfo.password,
      };
      // Comando pg_dump com compressão
      const command = [
        'pg_dump',
        `-h ${dbInfo.host}`,
        `-p ${dbInfo.port}`,
        `-U ${dbInfo.username}`,
        `-d ${dbInfo.database}`,
        '--no-owner',
        '--no-privileges',
        '--clean',
        '--if-exists',
        '--compress=9',
        `--file="${filePath}"`,
      ].join(' ');
      await execAsync(command, { env });
      console.log(`✅ Backup criado: ${filePath}`);
      // Upload para S3 se configurado
      if (this.config.s3Bucket) {
        await this.uploadToS3(filePath, fileName);
      }
      return filePath;
    } catch (error) {
      console.error(`❌ Erro ao criar backup: ${error}`);
      throw error;
    }
  }
  /**
   * Faz upload do backup para S3
   */
  private async uploadToS3(filePath: string, fileName: string): Promise<void> {
    console.log(`🔄 Fazendo upload para S3: ${fileName}`);
    try {
      // Usando AWS CLI (deve estar instalado)
      const command = [
        'aws s3 cp',
        `"${filePath}"`,
        `s3://${this.config.s3Bucket}/database-backups/${fileName}`,
        `--region ${this.config.s3Region || 'us-east-1'}`,
      ].join(' ');
      const env = {
        ...process.env,
        AWS_ACCESS_KEY_ID: this.config.s3AccessKey,
        AWS_SECRET_ACCESS_KEY: this.config.s3SecretKey,
      };
      await execAsync(command, { env });
      console.log(
        `✅ Upload concluído: s3://${this.config.s3Bucket}/database-backups/${fileName}`
      );
      // Remover arquivo local após upload bem-sucedido
      await unlink(filePath);
      console.log(`🗑️ Arquivo local removido`);
    } catch (error) {
      console.error(`❌ Erro no upload para S3: ${error}`);
      // Não propagar erro para manter backup local
    }
  }
  /**
   * Restaura backup do banco de dados
   */
  async restoreBackup(backupPath: string): Promise<void> {
    console.log(`🔄 Restaurando backup: ${backupPath}`);
    try {
      const dbInfo = this.parseDatabaseUrl(this.config.databaseUrl);
      const env = {
        ...process.env,
        PGPASSWORD: dbInfo.password,
      };
      // Comando psql para restaurar
      const command = [
        'psql',
        `-h ${dbInfo.host}`,
        `-p ${dbInfo.port}`,
        `-U ${dbInfo.username}`,
        `-d ${dbInfo.database}`,
        `--file="${backupPath}"`,
      ].join(' ');
      await execAsync(command, { env });
      console.log(`✅ Backup restaurado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao restaurar backup: ${error}`);
      throw error;
    }
  }
  /**
   * Lista backups disponíveis
   */
  async listBackups(): Promise<string[]> {
    console.log('📋 Listando backups disponíveis...');
    try {
      if (this.config.s3Bucket) {
        const command = [
          'aws s3 ls',
          `s3://${this.config.s3Bucket}/database-backups/`,
          `--region ${this.config.s3Region || 'us-east-1'}`,
        ].join(' ');
        const env = {
          ...process.env,
          AWS_ACCESS_KEY_ID: this.config.s3AccessKey,
          AWS_SECRET_ACCESS_KEY: this.config.s3SecretKey,
        };
        const { stdout } = await execAsync(command, { env });
        const backups = stdout
          .split('\n')
          .filter((line) => line.includes('.sql'))
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            return parts[parts.length - 1];
          });
        console.log(`✅ Encontrados ${backups.length} backups`);
        return backups;
      }
      return [];
    } catch (error) {
      console.error(`❌ Erro ao listar backups: ${error}`);
      return [];
    }
  }
  /**
   * Remove backups antigos (mantém apenas os N mais recentes)
   */
  async cleanupOldBackups(): Promise<void> {
    console.log(
      `🧹 Limpando backups antigos (mantendo ${this.config.maxBackups} mais recentes)...`
    );
    try {
      const backups = await this.listBackups();
      if (backups.length <= this.config.maxBackups) {
        console.log('✅ Nenhum backup para remover');
        return;
      }
      // Ordenar por data (mais antigos primeiro)
      backups.sort();
      const toDelete = backups.slice(
        0,
        backups.length - this.config.maxBackups
      );
      for (const backup of toDelete) {
        const command = [
          'aws s3 rm',
          `s3://${this.config.s3Bucket}/database-backups/${backup}`,
          `--region ${this.config.s3Region || 'us-east-1'}`,
        ].join(' ');
        const env = {
          ...process.env,
          AWS_ACCESS_KEY_ID: this.config.s3AccessKey,
          AWS_SECRET_ACCESS_KEY: this.config.s3SecretKey,
        };
        await execAsync(command, { env });
        console.log(`🗑️ Removido: ${backup}`);
      }
      console.log(`✅ Limpeza concluída. Removidos ${toDelete.length} backups`);
    } catch (error) {
      console.error(`❌ Erro na limpeza de backups: ${error}`);
    }
  }
}
// Executar backup se chamado diretamente
async function main() {
  const config: BackupConfig = {
    databaseUrl: process.env.DATABASE_URL || '',
    s3Bucket: process.env.BACKUP_S3_BUCKET,
    s3AccessKey: process.env.BACKUP_S3_ACCESS_KEY,
    s3SecretKey: process.env.BACKUP_S3_SECRET_KEY,
    s3Region: process.env.BACKUP_S3_REGION || 'us-east-1',
    localBackupPath: join(process.cwd(), 'backups'),
    maxBackups: 30, // Manter últimos 30 backups
  };
  if (!config.databaseUrl) {
    console.error('❌ DATABASE_URL não configurada');
    process.exit(1);
  }
  const backup = new DatabaseBackup(config);
  try {
    // Criar backup
    await backup.createBackup();
    // Limpar backups antigos
    if (config.s3Bucket) {
      await backup.cleanupOldBackups();
    }
    console.log('✅ Processo de backup concluído com sucesso');
  } catch (error) {
    console.error('❌ Falha no processo de backup:', error);
    process.exit(1);
  }
}
// Executar apenas se for o script principal
if (require.main === module) {
  main();
}
export { DatabaseBackup };
export type { BackupConfig };
