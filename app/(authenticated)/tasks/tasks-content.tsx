'use client';
import { useState } from 'react';
import { Plus, Filter, Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
const tasks = [
  {
    id: '1',
    title: 'Implementar autenticação',
    description: 'Adicionar login com OAuth2',
    status: 'in_progress',
    priority: 'high',
    assignee: 'João Silva',
    dueDate: '2024-01-20',
    project: 'Website Redesign',
  },
  {
    id: '2',
    title: 'Criar documentação API',
    description: 'Documentar todos os endpoints',
    status: 'pending',
    priority: 'medium',
    assignee: 'Maria Santos',
    dueDate: '2024-01-22',
    project: 'API Development',
  },
  {
    id: '3',
    title: 'Correção de bugs críticos',
    description: 'Resolver bugs reportados',
    status: 'completed',
    priority: 'high',
    assignee: 'Pedro Costa',
    dueDate: '2024-01-18',
    project: 'Mobile App',
  },
  {
    id: '4',
    title: 'Otimização de performance',
    description: 'Melhorar tempo de carregamento',
    status: 'in_progress',
    priority: 'low',
    assignee: 'Ana Lima',
    dueDate: '2024-01-25',
    project: 'Website Redesign',
  },
  {
    id: '5',
    title: 'Testes unitários',
    description: 'Escrever testes para novos componentes',
    status: 'pending',
    priority: 'medium',
    assignee: 'Carlos Souza',
    dueDate: '2024-01-24',
    project: 'Mobile App',
  },
];
const statusConfig = {
  pending: {
    label: 'Pendente',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  completed: {
    label: 'Concluída',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
};
const priorityConfig = {
  low: {
    label: 'Baixa',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
  medium: {
    label: 'Média',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  high: {
    label: 'Alta',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};
export default function TasksContent() {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };
  const toggleAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((task) => task.id));
    }
  };
  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
      {/* Tasks Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedTasks.length === filteredTasks.length &&
                    filteredTasks.length > 0
                  }
                  onCheckedChange={toggleAllTasks}
                />
              </TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Nenhuma tarefa encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => toggleTaskSelection(task.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{task.project}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        statusConfig[task.status as keyof typeof statusConfig]
                          .color
                      }
                    >
                      {
                        statusConfig[task.status as keyof typeof statusConfig]
                          .label
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        priorityConfig[
                          task.priority as keyof typeof priorityConfig
                        ].color
                      }
                    >
                      {
                        priorityConfig[
                          task.priority as keyof typeof priorityConfig
                        ].label
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem>Arquivar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Selected Actions */}
      {selectedTasks.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
          <span className="text-sm">
            {selectedTasks.length} tarefa(s) selecionada(s)
          </span>
          <Button size="sm" variant="outline">
            Marcar como concluída
          </Button>
          <Button size="sm" variant="outline">
            Atribuir
          </Button>
          <Button size="sm" variant="outline" className="text-destructive">
            Excluir
          </Button>
        </div>
      )}
    </div>
  );
}
