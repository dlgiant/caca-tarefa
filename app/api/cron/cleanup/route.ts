import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * API de Cron Job para Limpeza de Dados Antigos
 * 
 * Executado semanalmente aos domingos às 3:00 AM
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

    const now = new Date();
    const stats = {
      chatHistory: 0,
      notifications: 0,
      completedTasks: 0,
      dataExports: 0,
      sessionLogs: 0,
    };

    // 1. Limpar histórico de chat antigo (mais de 90 dias)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const deletedChats = await prisma.chatHistory.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });
    stats.chatHistory = deletedChats.count;

    // 2. Limpar notificações lidas antigas (mais de 30 dias)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        read: true,
        readAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    stats.notifications = deletedNotifications.count;

    // 3. Arquivar tarefas completadas antigas (mais de 180 dias)
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const archivedTasks = await prisma.task.deleteMany({
      where: {
        completed: true,
        completedAt: {
          lt: sixMonthsAgo,
        },
        // Não deletar se tiver projeto ativo
        project: {
          status: {
            not: 'ACTIVE',
          },
        },
      },
    });
    stats.completedTasks = archivedTasks.count;

    // 4. Limpar exports antigos (mais de 7 dias)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const deletedExports = await prisma.dataExport.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });
    stats.dataExports = deletedExports.count;

    // 5. Otimizar banco de dados (Vacuum/Analyze para PostgreSQL)
    // Nota: Isso pode requerer permissões especiais
    try {
      await prisma.$executeRawUnsafe('VACUUM ANALYZE');
      console.log('[CRON] Database optimized');
    } catch (error) {
      console.warn('[CRON] Could not optimize database:', error);
    }

    // 6. Limpar tokens de reset de senha expirados
    const expiredTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: now,
        },
      },
    });

    // 7. Relatório de uso de storage por usuário (para monitoramento)
    const storageReport = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT ch.id) as chat_count,
        COUNT(DISTINCT n.id) as notification_count
      FROM "User" u
      LEFT JOIN "Task" t ON t."userId" = u.id
      LEFT JOIN "ChatHistory" ch ON ch."userId" = u.id
      LEFT JOIN "Notification" n ON n."userId" = u.id
      GROUP BY u.id, u.email
      HAVING COUNT(DISTINCT t.id) > 1000 
         OR COUNT(DISTINCT ch.id) > 5000
         OR COUNT(DISTINCT n.id) > 1000
    `;

    console.log('[CRON] Cleanup completed:', stats);
    
    if ((storageReport as any[]).length > 0) {
      console.log('[CRON] Users with high storage usage:', storageReport);
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      timestamp: now.toISOString(),
      stats,
      expiredTokens: expiredTokens.count,
      highUsageUsers: (storageReport as any[]).length,
    });
  } catch (error) {
    console.error('[CRON] Cleanup error:', error);
    
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
