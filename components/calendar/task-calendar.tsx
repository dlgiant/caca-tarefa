'use client';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarDays, Clock, Flag, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
moment.locale('pt-br');
const localizer = momentLocalizer(moment);
interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  category?: {
    name: string;
    color: string;
  } | null;
  project?: {
    name: string;
  } | null;
  tags?: Array<{
    name: string;
    color: string;
  }>;
}
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}
const priorityColors = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  URGENT: '#dc2626',
};
const statusColors = {
  TODO: '#6b7280',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};
export function TaskCalendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    fetchTasks();
  }, []);
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };
  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.dueDate!),
        end: new Date(task.dueDate!),
        resource: task,
      }));
  }, [tasks]);
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedTask(event.resource);
    setIsDialogOpen(true);
  };
  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    const backgroundColor =
      task.category?.color || priorityColors[task.priority];
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: task.status === 'COMPLETED' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.date.setMonth(toolbar.date.getMonth() - 1);
      toolbar.onNavigate('prev');
    };
    const goToNext = () => {
      toolbar.date.setMonth(toolbar.date.getMonth() + 1);
      toolbar.onNavigate('next');
    };
    const goToCurrent = () => {
      const now = new Date();
      toolbar.date.setMonth(now.getMonth());
      toolbar.date.setYear(now.getFullYear());
      toolbar.onNavigate('current');
    };
    const label = () => {
      const date = moment(toolbar.date);
      return (
        <span className="text-lg font-semibold">
          {date.format('MMMM YYYY')}
        </span>
      );
    };
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button onClick={goToBack} size="sm" variant="outline">
            Anterior
          </Button>
          <Button onClick={goToCurrent} size="sm" variant="outline">
            Hoje
          </Button>
          <Button onClick={goToNext} size="sm" variant="outline">
            Próximo
          </Button>
        </div>
        <div>{label()}</div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => toolbar.onView(Views.MONTH)}
            size="sm"
            variant={toolbar.view === Views.MONTH ? 'default' : 'outline'}
          >
            Mês
          </Button>
          <Button
            onClick={() => toolbar.onView(Views.WEEK)}
            size="sm"
            variant={toolbar.view === Views.WEEK ? 'default' : 'outline'}
          >
            Semana
          </Button>
          <Button
            onClick={() => toolbar.onView(Views.DAY)}
            size="sm"
            variant={toolbar.view === Views.DAY ? 'default' : 'outline'}
          >
            Dia
          </Button>
          <Button
            onClick={() => toolbar.onView(Views.AGENDA)}
            size="sm"
            variant={toolbar.view === Views.AGENDA ? 'default' : 'outline'}
          >
            Agenda
          </Button>
        </div>
      </div>
    );
  };
  const messages = {
    allDay: 'Dia todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Tarefa',
    noEventsInRange: 'Não há tarefas neste período.',
    showMore: (total: number) => `+${total} mais`,
  };
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendário de Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              view={view}
              onView={(newView) =>
                setView(newView as 'month' | 'week' | 'day' | 'agenda')
              }
              date={date}
              onNavigate={setDate}
              components={{
                toolbar: CustomToolbar,
              }}
              messages={messages}
            />
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>
              {selectedTask?.description || 'Sem descrição'}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Prazo:{' '}
                  {selectedTask.dueDate
                    ? format(
                        new Date(selectedTask.dueDate),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )
                    : 'Sem prazo'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant="outline"
                  style={{
                    borderColor: priorityColors[selectedTask.priority],
                    color: priorityColors[selectedTask.priority],
                  }}
                >
                  {selectedTask.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: statusColors[selectedTask.status],
                  }}
                >
                  {selectedTask.status}
                </Badge>
              </div>
              {selectedTask.category && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: selectedTask.category.color,
                      color: selectedTask.category.color,
                    }}
                  >
                    {selectedTask.category.name}
                  </Badge>
                </div>
              )}
              {selectedTask.project && (
                <div className="text-sm text-muted-foreground">
                  Projeto: {selectedTask.project.name}
                </div>
              )}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {selectedTask.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      style={{
                        borderColor: tag.color,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
