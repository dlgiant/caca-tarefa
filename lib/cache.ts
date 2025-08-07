import { unstable_cache } from 'next/cache';
import { cache } from 'react';
// Tipos para configuração de cache
export interface CacheConfig {
  revalidate?: number | false;
  tags?: string[];
}
// Cache para dados do usuário
export const getCachedUser = cache(async (userId: string) => {
  const { prisma } = await import('@/lib/prisma');
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });
});
// Cache para projetos com revalidação
export const getCachedProjects = unstable_cache(
  async (userId: string) => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.project.findMany({
      where: {
        OR: [{ userId: userId }, { collaborators: { some: { userId } } }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },
  ['projects'],
  {
    revalidate: 60, // Revalida a cada 60 segundos
    tags: ['projects'],
  }
);
// Cache para tarefas com revalidação
export const getCachedTasks = unstable_cache(
  async (userId: string, projectId?: string) => {
    const { prisma } = await import('@/lib/prisma');
    const where: any = {
      userId: userId,
    };
    if (projectId) {
      where.projectId = projectId;
    }
    return prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
  },
  ['tasks'],
  {
    revalidate: 30, // Revalida a cada 30 segundos
    tags: ['tasks'],
  }
);
// Cache para estatísticas do dashboard
export const getCachedDashboardStats = unstable_cache(
  async (userId: string) => {
    const { prisma } = await import('@/lib/prisma');
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
    ] = await Promise.all([
      prisma.project.count({
        where: {
          OR: [{ userId: userId }, { collaborators: { some: { userId } } }],
        },
      }),
      prisma.project.count({
        where: {
          OR: [{ userId: userId }, { collaborators: { some: { userId } } }],
          status: 'ACTIVE',
        },
      }),
      prisma.task.count({
        where: {
          userId: userId,
        },
      }),
      prisma.task.count({
        where: {
          userId: userId,
          status: 'COMPLETED',
        },
      }),
      prisma.task.count({
        where: {
          userId: userId,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.task.count({
        where: {
          userId: userId,
          status: { not: 'COMPLETED' },
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);
    return {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  },
  ['dashboard-stats'],
  {
    revalidate: 120, // Revalida a cada 2 minutos
    tags: ['dashboard'],
  }
);
// Função para revalidar cache por tag
export async function revalidateCache(tags: string[]) {
  const { revalidateTag } = await import('next/cache');
  for (const tag of tags) {
    revalidateTag(tag);
  }
}
// Cache para notificações
export const getCachedNotifications = unstable_cache(
  async (userId: string, unreadOnly = false) => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },
  ['notifications'],
  {
    revalidate: 10, // Revalida a cada 10 segundos
    tags: ['notifications'],
  }
);
// Configuração de cache para páginas estáticas
export const staticPageCache: CacheConfig = {
  revalidate: 3600, // 1 hora
};
// Configuração de cache para dados dinâmicos
export const dynamicDataCache: CacheConfig = {
  revalidate: 60, // 1 minuto
};
// Configuração de cache para dados em tempo real
export const realtimeDataCache: CacheConfig = {
  revalidate: 10, // 10 segundos
};
