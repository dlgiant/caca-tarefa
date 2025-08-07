import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { TaskList } from '@/components/tasks/task-list';
import { QuickManage } from '@/components/tasks/quick-manage';
export default async function TasksPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Minhas Tarefas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas tarefas, projetos e prioridades em um só lugar
            </p>
          </div>
          <QuickManage />
        </div>
      </div>
      <TaskList />
    </div>
  );
}
