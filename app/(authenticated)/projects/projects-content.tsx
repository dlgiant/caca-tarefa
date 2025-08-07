'use client';
import { Plus, MoreVertical, Users, Calendar, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
const projects = [
  {
    id: '1',
    name: 'Website Redesign',
    description:
      'Modernização completa do site corporativo com novo design e funcionalidades',
    status: 'active',
    progress: 75,
    totalTasks: 24,
    completedTasks: 18,
    dueDate: '2024-02-15',
    team: [
      { name: 'João Silva', avatar: '' },
      { name: 'Maria Santos', avatar: '' },
      { name: 'Pedro Costa', avatar: '' },
    ],
    priority: 'high',
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'Desenvolvimento do aplicativo móvel para iOS e Android',
    status: 'active',
    progress: 45,
    totalTasks: 36,
    completedTasks: 16,
    dueDate: '2024-03-01',
    team: [
      { name: 'Ana Lima', avatar: '' },
      { name: 'Carlos Souza', avatar: '' },
    ],
    priority: 'medium',
  },
  {
    id: '3',
    name: 'API Development',
    description: 'Criação de API RESTful para integração com parceiros',
    status: 'active',
    progress: 90,
    totalTasks: 20,
    completedTasks: 18,
    dueDate: '2024-01-25',
    team: [
      { name: 'Roberto Alves', avatar: '' },
      { name: 'Juliana Martins', avatar: '' },
      { name: 'Fernando Silva', avatar: '' },
      { name: 'Camila Costa', avatar: '' },
    ],
    priority: 'high',
  },
  {
    id: '4',
    name: 'Marketing Campaign',
    description: 'Campanha de marketing digital para lançamento de produto',
    status: 'planning',
    progress: 10,
    totalTasks: 15,
    completedTasks: 2,
    dueDate: '2024-04-01',
    team: [
      { name: 'Lucas Oliveira', avatar: '' },
      { name: 'Patricia Lima', avatar: '' },
    ],
    priority: 'low',
  },
  {
    id: '5',
    name: 'Data Migration',
    description: 'Migração de dados do sistema legado para nova plataforma',
    status: 'completed',
    progress: 100,
    totalTasks: 30,
    completedTasks: 30,
    dueDate: '2024-01-10',
    team: [
      { name: 'Marcos Paulo', avatar: '' },
      { name: 'Sandra Regina', avatar: '' },
      { name: 'Diego Santos', avatar: '' },
    ],
    priority: 'high',
  },
  {
    id: '6',
    name: 'Security Audit',
    description: 'Auditoria completa de segurança e implementação de melhorias',
    status: 'on_hold',
    progress: 30,
    totalTasks: 12,
    completedTasks: 4,
    dueDate: '2024-05-15',
    team: [{ name: 'Rafael Mendes', avatar: '' }],
    priority: 'medium',
  },
];
const statusConfig = {
  active: {
    label: 'Ativo',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  planning: {
    label: 'Planejamento',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  on_hold: {
    label: 'Pausado',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  completed: {
    label: 'Concluído',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
};
const priorityConfig = {
  low: { label: 'Baixa', color: 'border-l-4 border-l-gray-400' },
  medium: { label: 'Média', color: 'border-l-4 border-l-yellow-400' },
  high: { label: 'Alta', color: 'border-l-4 border-l-red-400' },
};
export default function ProjectsContent() {
  return (
    <>
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline">Todos</Button>
          <Button variant="ghost">Ativos</Button>
          <Button variant="ghost">Concluídos</Button>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>
      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={
              priorityConfig[project.priority as keyof typeof priorityConfig]
                .color
            }
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{project.name}</CardTitle>
                  <Badge
                    variant="secondary"
                    className={
                      statusConfig[project.status as keyof typeof statusConfig]
                        .color
                    }
                  >
                    {
                      statusConfig[project.status as keyof typeof statusConfig]
                        .label
                    }
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Arquivar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {project.completedTasks}/{project.totalTasks} tarefas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member, index) => (
                      <Avatar
                        key={index}
                        className="h-7 w-7 border-2 border-background"
                      >
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.team.length > 3 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver tarefas
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
