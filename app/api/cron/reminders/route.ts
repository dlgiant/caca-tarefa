import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * API de Cron Job para Processar Lembretes
 * 
 * Executado a cada 15 minutos pelo Vercel Cron
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
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    // Buscar lembretes pendentes que devem ser enviados nos próximos 15 minutos
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        active: true,
        sent: false,
        reminderAt: {
          gte: now,
          lte: fifteenMinutesFromNow,
        },
      },
      include: {
        user: true,
        task: true,
      },
    });

    console.log(`[CRON] Found ${pendingReminders.length} pending reminders`);

    const processedReminders = [];
    const errors = [];

    // Processar cada lembrete
    for (const reminder of pendingReminders) {
      try {
        // Criar notificação para o usuário
        await prisma.notification.create({
          data: {
            userId: reminder.userId,
            title: reminder.title,
            message: reminder.description || `Lembrete: ${reminder.title}`,
            type: 'REMINDER',
            link: reminder.taskId ? `/tasks/${reminder.taskId}` : undefined,
            metadata: {
              reminderId: reminder.id,
              taskId: reminder.taskId,
              reminderAt: reminder.reminderAt.toISOString(),
            },
          },
        });

        // Marcar lembrete como enviado
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            sent: true,
            sentAt: now,
            active: reminder.recurring === 'NONE' ? false : true,
          },
        });

        // Se for recorrente, criar próximo lembrete
        if (reminder.recurring !== 'NONE') {
          const nextReminderAt = calculateNextReminder(
            reminder.reminderAt,
            reminder.recurring
          );

          await prisma.reminder.create({
            data: {
              title: reminder.title,
              description: reminder.description,
              reminderAt: nextReminderAt,
              recurring: reminder.recurring,
              userId: reminder.userId,
              taskId: reminder.taskId,
              active: true,
            },
          });
        }

        processedReminders.push({
          id: reminder.id,
          title: reminder.title,
          userId: reminder.userId,
          sentAt: now.toISOString(),
        });

        // Enviar email se configurado
        if (process.env.EMAIL_SERVER && reminder.user.email) {
          // await sendReminderEmail(reminder.user.email, reminder);
          // TODO: Implementar envio de email
        }

      } catch (error) {
        console.error(`[CRON] Error processing reminder ${reminder.id}:`, error);
        errors.push({
          reminderId: reminder.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Limpar lembretes antigos inativos (mais de 30 dias)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const deletedCount = await prisma.reminder.deleteMany({
      where: {
        active: false,
        sent: true,
        sentAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`[CRON] Cleaned up ${deletedCount.count} old reminders`);

    return NextResponse.json({
      success: true,
      message: 'Reminders processed successfully',
      timestamp: now.toISOString(),
      stats: {
        processed: processedReminders.length,
        errors: errors.length,
        cleaned: deletedCount.count,
      },
      processedReminders,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[CRON] Reminders processing error:', error);
    
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

/**
 * Calcula a próxima data do lembrete baseado no tipo de recorrência
 */
function calculateNextReminder(
  currentDate: Date,
  recurring: string
): Date {
  const next = new Date(currentDate);
  
  switch (recurring) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      // Para NONE ou valores inválidos
      break;
  }
  
  return next;
}
