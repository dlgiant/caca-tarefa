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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Trash2,
  Edit,
  Eye,
  Share2,
  Lock,
  Unlock,
  Crown,
} from 'lucide-react';
import { toast } from 'sonner';
const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']),
  projectId: z.string().min(1, 'Selecione um projeto'),
});
type InviteFormData = z.infer<typeof inviteSchema>;
interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  collaborators?: ProjectCollaborator[];
}
interface ProjectCollaborator {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  acceptedAt?: Date | null;
  invitedAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
}
const roleLabels = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
};
const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  EDITOR: Edit,
  VIEWER: Eye,
};
const roleColors = {
  OWNER: 'bg-purple-500',
  ADMIN: 'bg-blue-500',
  EDITOR: 'bg-green-500',
  VIEWER: 'bg-gray-500',
};
const rolePermissions = {
  OWNER: 'Controle total do projeto',
  ADMIN: 'Gerenciar membros e configurações',
  EDITOR: 'Editar tarefas e conteúdo',
  VIEWER: 'Apenas visualizar',
};
export function ProjectSharing() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'VIEWER',
      projectId: '',
    },
  });
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?includeCollaborators=true');
      const data = await response.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast.error('Erro ao carregar projetos');
    }
  };
  const onSubmitInvite = async (data: InviteFormData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/collaboration/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar convite');
      }
      toast.success('Convite enviado com sucesso!');
      setIsInviteDialogOpen(false);
      form.reset();
      fetchProjects();
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast.error(error.message || 'Erro ao enviar convite');
    } finally {
      setLoading(false);
    }
  };
  const updateCollaboratorRole = async (
    collaboratorId: string,
    newRole: string
  ) => {
    try {
      const response = await fetch(
        `/api/collaboration/${collaboratorId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (!response.ok) {
        throw new Error('Erro ao atualizar permissão');
      }
      toast.success('Permissão atualizada com sucesso!');
      fetchProjects();
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };
  const removeCollaborator = async (collaboratorId: string) => {
    if (!confirm('Tem certeza que deseja remover este colaborador?')) {
      return;
    }
    try {
      const response = await fetch(`/api/collaboration/${collaboratorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erro ao remover colaborador');
      }
      toast.success('Colaborador removido com sucesso!');
      fetchProjects();
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
      toast.error('Erro ao remover colaborador');
    }
  };
  const myProjects = projects.filter((p) =>
    p.collaborators?.some((c) => c.role === 'OWNER')
  );
  const sharedWithMe = projects.filter((p) =>
    p.collaborators?.some((c) => c.role !== 'OWNER')
  );
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Colaboração em Projetos
          </CardTitle>
          <CardDescription>
            Gerencie o compartilhamento e colaboradores dos seus projetos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="my-projects">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-projects">
                Meus Projetos ({myProjects.length})
              </TabsTrigger>
              <TabsTrigger value="shared-with-me">
                Compartilhados Comigo ({sharedWithMe.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-projects" className="space-y-4">
              {myProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não tem projetos</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myProjects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {project.name}
                            </CardTitle>
                            {project.description && (
                              <CardDescription>
                                {project.description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {project.collaborators?.length || 0} colaboradores
                            </Badge>
                            <Dialog
                              open={isInviteDialogOpen}
                              onOpenChange={setIsInviteDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    form.setValue('projectId', project.id);
                                    setSelectedProject(project);
                                  }}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Convidar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Convidar Colaborador
                                  </DialogTitle>
                                  <DialogDescription>
                                    Envie um convite para alguém colaborar no
                                    projeto {`"${selectedProject?.name}"`}
                                  </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                  <form
                                    onSubmit={form.handleSubmit(onSubmitInvite)}
                                    className="space-y-4"
                                  >
                                    <FormField
                                      control={form.control}
                                      name="email"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Email</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="email"
                                              placeholder="colaborador@exemplo.com"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="role"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Permissão</FormLabel>
                                          <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="VIEWER">
                                                <div className="flex items-center gap-2">
                                                  <Eye className="h-4 w-4" />
                                                  Visualizador
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="EDITOR">
                                                <div className="flex items-center gap-2">
                                                  <Edit className="h-4 w-4" />
                                                  Editor
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="ADMIN">
                                                <div className="flex items-center gap-2">
                                                  <Shield className="h-4 w-4" />
                                                  Administrador
                                                </div>
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <FormDescription>
                                            {field.value &&
                                              rolePermissions[
                                                field.value as keyof typeof rolePermissions
                                              ]}
                                          </FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <DialogFooter>
                                      <Button type="submit" disabled={loading}>
                                        {loading
                                          ? 'Enviando...'
                                          : 'Enviar Convite'}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {project.collaborators?.map((collaborator) => {
                              const Icon = roleIcons[collaborator.role];
                              return (
                                <div
                                  key={collaborator.id}
                                  className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={collaborator.user.image || ''}
                                      />
                                      <AvatarFallback>
                                        {collaborator.user.name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {collaborator.user.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {collaborator.user.email}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="flex items-center gap-1"
                                    >
                                      <Icon className="h-3 w-3" />
                                      {roleLabels[collaborator.role]}
                                    </Badge>
                                    {collaborator.role !== 'OWNER' && (
                                      <>
                                        <Select
                                          value={collaborator.role}
                                          onValueChange={(value) =>
                                            updateCollaboratorRole(
                                              collaborator.id,
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-[120px] h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="VIEWER">
                                              Visualizador
                                            </SelectItem>
                                            <SelectItem value="EDITOR">
                                              Editor
                                            </SelectItem>
                                            <SelectItem value="ADMIN">
                                              Admin
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            removeCollaborator(collaborator.id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="shared-with-me" className="space-y-4">
              {sharedWithMe.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Unlock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum projeto foi compartilhado com você</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sharedWithMe.map((project) => {
                    const myRole = project.collaborators?.find(
                      (c) => c.user.email === 'current-user@email.com'
                    )?.role;
                    return (
                      <Card key={project.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {project.name}
                              </CardTitle>
                              {project.description && (
                                <CardDescription>
                                  {project.description}
                                </CardDescription>
                              )}
                            </div>
                            <Badge
                              className={
                                roleColors[myRole as keyof typeof roleColors]
                              }
                            >
                              {myRole &&
                                roleLabels[myRole as keyof typeof roleLabels]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Share2 className="h-4 w-4" />
                            <span>
                              Compartilhado por{' '}
                              {
                                project.collaborators?.find(
                                  (c) => c.role === 'OWNER'
                                )?.user.name
                              }
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
