'use client';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Atualize sua senha regularmente para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Atualizar Senha</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa">Ativar 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Use um aplicativo autenticador para gerar códigos
              </p>
            </div>
            <Switch id="2fa" />
          </div>
          <Button variant="outline">Configurar 2FA</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>
            Gerencie os dispositivos conectados à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Chrome - Windows</p>
                <p className="text-sm text-muted-foreground">
                  São Paulo, Brasil • Ativo agora
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Sessão Atual
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Safari - iPhone</p>
                <p className="text-sm text-muted-foreground">
                  São Paulo, Brasil • Há 2 horas
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Encerrar
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Firefox - MacOS</p>
                <p className="text-sm text-muted-foreground">
                  Rio de Janeiro, Brasil • Há 5 dias
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Encerrar
              </Button>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Encerrar Todas as Outras Sessões
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacidade</CardTitle>
          <CardDescription>
            Controle quem pode ver suas informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Perfil Público</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que outros usuários vejam seu perfil
              </p>
            </div>
            <Switch id="profile-visibility" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activity-visibility">Mostrar Atividade</Label>
              <p className="text-sm text-muted-foreground">
                Exibir suas atividades recentes no perfil
              </p>
            </div>
            <Switch id="activity-visibility" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-visibility">Email Visível</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que membros da equipe vejam seu email
              </p>
            </div>
            <Switch id="email-visibility" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
