import { Metadata } from 'next';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import ProjectsContent from './projects-content';

export const metadata: Metadata = {
  title: 'Projetos | Caça Tarefa',
  description: 'Gerencie todos os seus projetos',
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
        <p className="text-muted-foreground">
          Organize e acompanhe o progresso dos seus projetos
        </p>
      </div>

      <Suspense fallback={<PageSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}
