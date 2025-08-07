import { redirect } from 'next/navigation';
import { auth } from '@/src/auth';
import { TaskList } from '@/components/tasks/task-list';
import { AddActivityButton } from '@/components/tasks/add-activity-button';
import { Sparkles } from 'lucide-react';
export default async function TasksPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              Minhas Atividades de Hoje
            </h1>
            <p className="text-muted-foreground mt-2">
              Vamos aprender coisas novas e divertidas! 🎉
            </p>
          </div>
          <AddActivityButton />
        </div>
      </div>
      <TaskList />
    </div>
  );
}
