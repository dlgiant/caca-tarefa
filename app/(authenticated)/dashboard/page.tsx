import { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import DashboardContent from './dashboard-content';
export const metadata: Metadata = {
  title: 'Dashboard | Caça Tarefa',
  description: 'Visualize suas tarefas e projetos em um só lugar',
};
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo das suas atividades.
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
