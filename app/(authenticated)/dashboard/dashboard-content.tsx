'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Clock,
  FolderOpen,
  TrendingUp,
  Activity,
  Users,
  Calendar,
  Target,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const stats = [
  {
    title: 'Tarefas Concluídas',
    value: '12',
    description: '+20% em relação ao mês passado',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  {
    title: 'Em Andamento',
    value: '8',
    description: '3 com prazo hoje',
    icon: Clock,
    color: 'text-blue-600',
  },
  {
    title: 'Projetos Ativos',
    value: '4',
    description: '2 próximos do prazo',
    icon: FolderOpen,
    color: 'text-purple-600',
  },
  {
    title: 'Produtividade',
    value: '85%',
    description: '+5% esta semana',
    icon: TrendingUp,
    color: 'text-orange-600',
  },
];

const recentTasks = [
  { id: 1, title: 'Revisar documentação', status: 'Em andamento', priority: 'Alta' },
  { id: 2, title: 'Reunião com cliente', status: 'Pendente', priority: 'Média' },
  { id: 3, title: 'Deploy da aplicação', status: 'Concluída', priority: 'Alta' },
  { id: 4, title: 'Correção de bugs', status: 'Em andamento', priority: 'Baixa' },
];

const projects = [
  { name: 'Website Redesign', progress: 75, tasks: 24, completed: 18 },
  { name: 'Mobile App', progress: 45, tasks: 36, completed: 16 },
  { name: 'API Development', progress: 90, tasks: 20, completed: 18 },
];

export default function DashboardContent() {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Tasks */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tarefas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {task.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prioridade: {task.priority}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        task.status === 'Concluída'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : task.status === 'Em andamento'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects Progress */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {project.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project.completed} de {project.tasks} tarefas
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Calendar */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Atividade da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900" />
                <div className="flex-1">
                  <p className="text-sm font-medium">João Silva</p>
                  <p className="text-xs text-muted-foreground">
                    Completou 3 tarefas hoje
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Maria Santos</p>
                  <p className="text-xs text-muted-foreground">
                    Adicionou comentário em "Website Redesign"
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Pedro Costa</p>
                  <p className="text-xs text-muted-foreground">
                    Criou novo projeto "Marketing Campaign"
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Prazos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Deploy Production</p>
                  <p className="text-xs text-muted-foreground">Hoje, 18:00</p>
                </div>
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                  Urgente
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Revisão de Design</p>
                  <p className="text-xs text-muted-foreground">Amanhã, 14:00</p>
                </div>
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Médio
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Reunião Sprint</p>
                  <p className="text-xs text-muted-foreground">Sexta, 10:00</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Baixo
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
