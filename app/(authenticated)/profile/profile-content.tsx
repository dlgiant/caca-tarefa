'use client';
import { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSession } from 'next-auth/react';
export default function ProfileContent() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  // Mock data - em produção viria do banco de dados
  const profileData = {
    name: session?.user?.name || 'João Silva',
    email: session?.user?.email || 'joao.silva@example.com',
    phone: '+55 11 98765-4321',
    location: 'São Paulo, Brasil',
    role: 'Product Manager',
    department: 'Desenvolvimento',
    joinDate: '2023-01-15',
    bio: 'Profissional apaixonado por tecnologia e gestão de projetos. Experiência em metodologias ágeis e liderança de equipes multidisciplinares.',
    skills: [
      'Scrum',
      'Kanban',
      'JavaScript',
      'React',
      'Node.js',
      'Gestão de Projetos',
    ],
    stats: {
      tasksCompleted: 142,
      projectsLed: 8,
      teamSize: 12,
      completionRate: 87,
    },
  };
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Profile Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="text-2xl">
                    {profileData.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{profileData.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {profileData.role}
                </p>
              </div>
              <Badge variant="secondary">{profileData.department}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profileData.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profileData.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profileData.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Desde{' '}
                {new Date(profileData.joinDate).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Taxa de Conclusão</span>
                <span className="font-medium">
                  {profileData.stats.completionRate}%
                </span>
              </div>
              <Progress
                value={profileData.stats.completionRate}
                className="mt-2 h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {profileData.stats.tasksCompleted}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tarefas Concluídas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {profileData.stats.projectsLed}
                </p>
                <p className="text-xs text-muted-foreground">
                  Projetos Liderados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content */}
      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e profissionais
              </CardDescription>
            </div>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Salvar' : 'Editar'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  defaultValue={profileData.name}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={profileData.email}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  defaultValue={profileData.phone}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  defaultValue={profileData.location}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Input
                  id="role"
                  defaultValue={profileData.role}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  defaultValue={profileData.department}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                rows={4}
                defaultValue={profileData.bio}
                disabled={!isEditing}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Habilidades</CardTitle>
            <CardDescription>
              Suas competências e áreas de expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
              {isEditing && (
                <Button variant="outline" size="sm">
                  + Adicionar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Suas últimas ações na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Tarefa {'"Implementar autenticação"'} concluída
                  </p>
                  <p className="text-xs text-muted-foreground">Há 2 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Comentário adicionado em {'"Website Redesign"'}
                  </p>
                  <p className="text-xs text-muted-foreground">Há 5 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Novo projeto {'"API Development"'} criado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ontem às 14:30
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Status atualizado para {'"Em Progresso"'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ontem às 10:15
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
