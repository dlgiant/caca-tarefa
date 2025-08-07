import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { DatabaseBackup } from '@/scripts/backup';

/**
 * API de Cron Job para Backup Automático
 * 
 * Executado diariamente às 2:00 AM pelo Vercel Cron
 * Configurado em vercel.json
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorização do Vercel Cron
    const authHeader = (await headers()).get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar se estamos em produção
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        message: 'Backup cron job skipped in development',
        environment: process.env.NODE_ENV,
      });
    }

    // Configuração do backup
    const config = {
      databaseUrl: process.env.DATABASE_URL!,
      s3Bucket: process.env.BACKUP_S3_BUCKET,
      s3AccessKey: process.env.BACKUP_S3_ACCESS_KEY,
      s3SecretKey: process.env.BACKUP_S3_SECRET_KEY,
      s3Region: process.env.BACKUP_S3_REGION || 'us-east-1',
      localBackupPath: '/tmp', // Usar /tmp no Vercel
      maxBackups: 30,
    };

    // Verificar se as configurações necessárias existem
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL não configurada');
    }

    const backup = new DatabaseBackup(config);
    
    // Criar backup
    const backupPath = await backup.createBackup();
    
    // Limpar backups antigos se S3 estiver configurado
    if (config.s3Bucket) {
      await backup.cleanupOldBackups();
    }

    // Log para monitoramento
    console.log('[CRON] Backup completed successfully:', {
      path: backupPath,
      timestamp: new Date().toISOString(),
      s3Enabled: !!config.s3Bucket,
    });

    return NextResponse.json({
      success: true,
      message: 'Backup completed successfully',
      timestamp: new Date().toISOString(),
      backup: {
        path: backupPath,
        s3Enabled: !!config.s3Bucket,
      },
    });
  } catch (error) {
    console.error('[CRON] Backup error:', error);
    
    // Notificar erro (pode integrar com serviço de monitoramento)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
