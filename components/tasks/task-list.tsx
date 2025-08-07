'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm } from './task-form';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  GripVertical,
  Calendar,
  Tag,
  Flag,
  CheckCircle,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  dueDate?: string;
  category?: { id: string; name: string; color: string };
  project?: { id: string; name: string };
  tags?: { id: string; name: string; color: string }[];
  createdAt: string;
  updatedAt: string;
}
const priorityIcons = {
  LOW: { icon: Flag, color: 'text-gray-500' },
  MEDIUM: { icon: Flag, color: 'text-blue-500' },
  HIGH: { icon: Flag, color: 'text-orange-500' },
  URGENT: { icon: AlertCircle, color: 'text-red-500' },
};
const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};
// Componente de tarefa arrastável
function SortableTaskItem({ task, onToggle, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const PriorityIcon =
    priorityIcons[task.priority as keyof typeof priorityIcons].icon;
  return (
    <div ref={setNodeRef} style={style}>
      <Card className={cn('mb-3', task.completed && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-move text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3
                    className={cn(
                      'font-medium',
                      task.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(task.id)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <PriorityIcon
                    className={cn(
                      'h-4 w-4',
                      priorityIcons[task.priority as keyof typeof priorityIcons]
                        .color
                    )}
                  />
                  <span className="text-muted-foreground">
                    {
                      priorityLabels[
                        task.priority as keyof typeof priorityLabels
                      ]
                    }
                  </span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(task.dueDate), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}
                {task.category && (
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: task.category.color + '20' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: task.category.color }}
                    />
                    {task.category.name}
                  </Badge>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {task.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export function TaskList() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // Carregar tarefas
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (statusFilter !== 'all') {
        params.append(
          'completed',
          statusFilter === 'completed' ? 'true' : 'false'
        );
      }
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      const response = await fetch(`/api/tasks?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, priorityFilter, statusFilter, sortBy, sortOrder]);
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  // Toggle completar tarefa
  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (response.ok) {
        toast.success(
          task.completed ? 'Tarefa marcada como pendente' : 'Tarefa concluída!'
        );
        loadTasks();
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };
  // Editar tarefa
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };
  // Deletar tarefa
  const handleDelete = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Tarefa excluída com sucesso');
        loadTasks();
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };
  // Drag and drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = filteredTasks.findIndex((task) => task.id === active.id);
      const newIndex = filteredTasks.findIndex((task) => task.id === over?.id);
      const newTasks = arrayMove(filteredTasks, oldIndex, newIndex);
      setFilteredTasks(newTasks);
      // Enviar nova ordem para o servidor
      try {
        await fetch('/api/tasks/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskIds: newTasks.map((t) => t.id) }),
        });
      } catch (error) {
        console.error('Erro ao reordenar tarefas:', error);
      }
    }
  };
  return (
    <div className="space-y-6">
      {/* Barra de ferramentas */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="LOW">Baixa</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Data de criação</SelectItem>
              <SelectItem value="dueDate">Data de vencimento</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="title">Título</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
      {/* Lista de tarefas */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {/* Dialog de criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova tarefa
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              loadTasks();
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>Atualize os dados da tarefa</DialogDescription>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setEditingTask(null);
              loadTasks();
            }}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingTask(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
