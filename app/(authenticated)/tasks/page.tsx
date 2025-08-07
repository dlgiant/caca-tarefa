import { Metadata } from 'next';
import { Suspense } from 'react';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import TasksContent from './tasks-content';

export const metadata: Metadata = {
  title: 'Tarefas | Caça Tarefa',
  description: 'Gerencie todas as suas tarefas em um só lugar',
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        <p className="text-muted-foreground">
          Gerencie e acompanhe todas as suas tarefas
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <TasksContent />
      </Suspense>
    </div>
  );
}
