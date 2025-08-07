import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function POST(req: NextRequest) {
  try {
    // Autenticação
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }
    const aiService = getAIService();
    // Parse do comando para entender a intenção
    const commandResult = await aiService.parseCommand(message);
    let response = '';
    const action = commandResult.action;
    let taskData = null;
    let suggestions: string[] = [];
    switch (commandResult.action) {
      case 'create_task':
        // Criar tarefa no banco de dados
        if (commandResult.parameters.title) {
          taskData = await prisma.task.create({
            data: {
              title: commandResult.parameters.title,
              description: commandResult.parameters.description || '',
              priority:
                (commandResult.parameters.priority?.toUpperCase() as
                  | 'LOW'
                  | 'MEDIUM'
                  | 'HIGH'
                  | 'URGENT') || 'MEDIUM',
              status: 'TODO',
              userId: session.user.id,
              dueDate: commandResult.parameters.dueDate
                ? new Date(commandResult.parameters.dueDate)
                : null,
            },
          });
          response = `✅ Tarefa "${taskData.title}" criada com sucesso!`;
          if (taskData.priority === 'HIGH') {
            response += '\n⚠️ Esta é uma tarefa de alta prioridade.';
          }
          if (taskData.dueDate) {
            response += `\n📅 Prazo: ${new Date(taskData.dueDate).toLocaleDateString('pt-BR')}`;
          }
          suggestions = [
            'Listar minhas tarefas',
            'Criar outra tarefa',
            'Ver tarefas de hoje',
          ];
        } else {
          response =
            'Por favor, forneça um título para a tarefa. Por exemplo: "Criar tarefa Revisar documento"';
        }
        break;
      case 'list_tasks':
        // Buscar tarefas do usuário
        const tasks = await prisma.task.findMany({
          where: {
            userId: session.user.id,
            status: { not: 'COMPLETED' },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
          take: 5,
        });
        if (tasks.length === 0) {
          response = '📋 Você não tem tarefas pendentes no momento.';
          suggestions = ['Criar nova tarefa', 'Ver tarefas concluídas'];
        } else {
          response = '📋 **Suas tarefas pendentes:**\n\n';
          tasks.forEach((task: any, index: number) => {
            const priorityEmoji =
              {
                HIGH: '🔴',
                URGENT: '🔴',
                MEDIUM: '🟡',
                LOW: '🟢',
              }[task.priority] || '⚪';
            response += `${index + 1}. ${priorityEmoji} ${task.title}`;
            if (task.dueDate) {
              response += ` (Prazo: ${new Date(task.dueDate).toLocaleDateString('pt-BR')})`;
            }
            response += '\n';
          });
          suggestions = [
            'Completar primeira tarefa',
            'Criar nova tarefa',
            'Analisar produtividade',
          ];
        }
        break;
      case 'complete_task':
        // Completar tarefa
        if (commandResult.parameters.taskId) {
          const task = await prisma.task.update({
            where: {
              id: commandResult.parameters.taskId,
              userId: session.user.id,
            },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          });
          response = `✅ Tarefa "${task.title}" marcada como concluída! Parabéns! 🎉`;
          // Buscar estatísticas rápidas
          const todayCompleted = await prisma.task.count({
            where: {
              userId: session.user.id,
              status: 'COMPLETED',
              completedAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          });
          response += `\n\n📊 Você completou ${todayCompleted} tarefa(s) hoje!`;
          suggestions = [
            'Ver próxima tarefa',
            'Analisar produtividade',
            'Criar nova tarefa',
          ];
        } else {
          response = 'Por favor, especifique qual tarefa deseja completar.';
        }
        break;
      case 'analyze_productivity':
        // Análise de produtividade
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const stats = await prisma.task.groupBy({
          by: ['status'],
          where: {
            userId: session.user.id,
            createdAt: { gte: weekAgo },
          },
          _count: true,
        });
        const completedCount =
          stats.find((s: any) => s.status === 'COMPLETED')?._count || 0;
        const totalCount = stats.reduce(
          (acc: number, s: any) => acc + s._count,
          0
        );
        const completionRate =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const productivityData = {
          completedThisWeek: completedCount,
          completionRate,
          avgTimePerTask: 45, // Placeholder - implementar cálculo real
          topCategories: ['Trabalho', 'Pessoal'], // Placeholder
          productiveHours: ['09:00-11:00', '14:00-16:00'], // Placeholder
        };
        response = await aiService.analyzeProductivity(productivityData);
        suggestions = [
          'Ver tarefas pendentes',
          'Criar nova tarefa',
          'Definir metas da semana',
        ];
        break;
      case 'suggest_next':
        // Sugerir próxima tarefa
        const nextTask = await prisma.task.findFirst({
          where: {
            userId: session.user.id,
            status: { not: 'COMPLETED' },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        });
        if (nextTask) {
          response = `🎯 **Sugestão de próxima tarefa:**\n\n"${nextTask.title}"`;
          if (nextTask.description) {
            response += `\n\n📝 ${nextTask.description}`;
          }
          if (nextTask.dueDate) {
            const nowTime = new Date();
            const daysUntilDue = Math.ceil(
              (new Date(nextTask.dueDate).getTime() - nowTime.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysUntilDue === 0) {
              response += '\n\n⏰ **Vence hoje!**';
            } else if (daysUntilDue === 1) {
              response += '\n\n⏰ Vence amanhã';
            } else if (daysUntilDue > 0) {
              response += `\n\n⏰ Vence em ${daysUntilDue} dias`;
            } else {
              response += '\n\n🚨 **Atrasada!**';
            }
          }
          const context = {
            pendingTasks: [nextTask],
            workPattern: 'morning', // Placeholder
          };
          const aiSuggestions =
            await aiService.generateTaskSuggestions(context);
          suggestions = aiSuggestions.slice(0, 3);
        } else {
          response =
            '🎉 Parabéns! Você não tem tarefas pendentes. Que tal criar uma nova meta?';
          suggestions = [
            'Criar nova tarefa',
            'Ver tarefas concluídas',
            'Definir metas',
          ];
        }
        break;
      default:
        // Chat geral
        const aiResponse = await aiService.generateResponse(message, {
          userId: session.user.id,
          trackUsage: true,
        });
        response = aiResponse.content;
        // Gerar sugestões contextuais
        suggestions = [
          'Criar tarefa',
          'Ver minhas tarefas',
          'Analisar produtividade',
        ];
    }
    // Obter informações do modelo
    const modelInfo = await aiService.getModelInfo();
    // Salvar conversa no banco
    await prisma.chatHistory.create({
      data: {
        userId: session.user.id,
        userMessage: message,
        assistantMessage: response,
        action: action,
        metadata: commandResult.parameters,
        model: modelInfo?.displayName || 'Claude',
      },
    });
    return NextResponse.json({
      response,
      action,
      task: taskData,
      suggestions,
      model: modelInfo?.displayName || 'Claude',
      metadata: {
        commandParsed: commandResult,
        modelId: modelInfo?.name,
      },
    });
  } catch (error: any) {
    console.error('Erro no chat AI:', error);
    // Verificar se é erro de rate limit
    if (error?.message?.includes('Limite de requisições')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}
