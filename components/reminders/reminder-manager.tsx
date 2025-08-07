'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  BellOff,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const reminderSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  reminderAt: z.string().min(1, 'Data e hora são obrigatórias'),
  recurring: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  taskId: z.string().optional(),
});
type ReminderFormData = z.infer<typeof reminderSchema>;
interface Reminder {
  id: string;
  title: string;
  description?: string | null;
  reminderAt: Date;
  recurring: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  sent: boolean;
  sentAt?: Date | null;
  active: boolean;
  task?: {
    id: string;
    title: string;
  } | null;
  createdAt: Date;
}
interface Task {
  id: string;
  title: string;
}
const recurringLabels = {
  NONE: 'Não repetir',
  DAILY: 'Diariamente',
  WEEKLY: 'Semanalmente',
  MONTHLY: 'Mensalmente',
  YEARLY: 'Anualmente',
};
export function ReminderManager() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: '',
      description: '',
      reminderAt: '',
      recurring: 'NONE',
      taskId: '',
    },
  });
  useEffect(() => {
    fetchReminders();
    fetchTasks();
  }, []);
  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders');
      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error('Erro ao buscar lembretes:', error);
      toast.error('Erro ao carregar lembretes');
    }
  };
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };
  const onSubmit = async (data: ReminderFormData) => {
    try {
      setLoading(true);
      const url = editingReminder
        ? `/api/reminders/${editingReminder.id}`
        : '/api/reminders';
      const method = editingReminder ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          reminderAt: new Date(data.reminderAt),
        }),
      });
      if (!response.ok) {
        throw new Error('Erro ao salvar lembrete');
      }
      toast.success(
        editingReminder
          ? 'Lembrete atualizado com sucesso!'
          : 'Lembrete criado com sucesso!'
      );
      setIsDialogOpen(false);
      setEditingReminder(null);
      form.reset();
      fetchReminders();
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
      toast.error('Erro ao salvar lembrete');
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    form.reset({
      title: reminder.title,
      description: reminder.description || '',
      reminderAt: format(new Date(reminder.reminderAt), "yyyy-MM-dd'T'HH:mm"),
      recurring: reminder.recurring,
      taskId: reminder.task?.id || '',
    });
    setIsDialogOpen(true);
  };
  const handleDelete = async (reminderId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lembrete?')) {
      return;
    }
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir lembrete');
      }
      toast.success('Lembrete excluído com sucesso!');
      fetchReminders();
    } catch (error) {
      console.error('Erro ao excluir lembrete:', error);
      toast.error('Erro ao excluir lembrete');
    }
  };
  const toggleActive = async (reminder: Reminder) => {
    try {
      const response = await fetch(`/api/reminders/${reminder.id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !reminder.active,
        }),
      });
      if (!response.ok) {
        throw new Error('Erro ao alterar status do lembrete');
      }
      toast.success(
        reminder.active ? 'Lembrete desativado' : 'Lembrete ativado'
      );
      fetchReminders();
    } catch (error) {
      console.error('Erro ao alterar status do lembrete:', error);
      toast.error('Erro ao alterar status do lembrete');
    }
  };
  const upcomingReminders = reminders
    .filter((r) => r.active && !r.sent)
    .sort(
      (a, b) =>
        new Date(a.reminderAt).getTime() - new Date(b.reminderAt).getTime()
    )
    .slice(0, 5);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Lembretes
            </CardTitle>
            <CardDescription>
              Gerencie seus lembretes e notificações
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingReminder(null);
                  form.reset();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Lembrete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {editingReminder ? 'Editar Lembrete' : 'Criar Novo Lembrete'}
                </DialogTitle>
                <DialogDescription>
                  Configure quando e como você deseja ser lembrado
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Título do lembrete" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detalhes do lembrete"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reminderAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data e Hora</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recurring"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recorrência</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a recorrência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(recurringLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taskId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vincular à Tarefa (opcional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma tarefa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Nenhuma</SelectItem>
                            {tasks.map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading
                        ? 'Salvando...'
                        : editingReminder
                          ? 'Atualizar'
                          : 'Criar'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Próximos Lembretes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Próximos Lembretes
            </h3>
            {upcomingReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum lembrete agendado
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(reminder.reminderAt),
                          "dd 'de' MMMM 'às' HH:mm",
                          {
                            locale: ptBR,
                          }
                        )}
                      </p>
                    </div>
                    {reminder.recurring !== 'NONE' && (
                      <Badge variant="secondary" className="ml-2">
                        {recurringLabels[reminder.recurring]}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Lista de Todos os Lembretes */}
          <div>
            <h3 className="text-sm font-medium mb-3">Todos os Lembretes</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      !reminder.active && 'opacity-50'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{reminder.title}</p>
                        {reminder.sent && (
                          <Badge variant="outline" className="text-xs">
                            Enviado
                          </Badge>
                        )}
                      </div>
                      {reminder.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {reminder.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {format(
                            new Date(reminder.reminderAt),
                            'dd/MM/yyyy HH:mm'
                          )}
                        </p>
                        {reminder.recurring !== 'NONE' && (
                          <Badge variant="secondary" className="text-xs">
                            {recurringLabels[reminder.recurring]}
                          </Badge>
                        )}
                        {reminder.task && (
                          <Badge variant="outline" className="text-xs">
                            {reminder.task.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(reminder)}
                      >
                        {reminder.active ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(reminder)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
