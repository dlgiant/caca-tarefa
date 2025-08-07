'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificações por Email</CardTitle>
          <CardDescription>
            Configure quais notificações você deseja receber por email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-tasks">Novas Tarefas</Label>
              <p className="text-sm text-muted-foreground">
                Receba um email quando uma tarefa for atribuída a você
              </p>
            </div>
            <Switch id="email-tasks" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-comments">Comentários</Label>
              <p className="text-sm text-muted-foreground">
                Notificações sobre comentários em suas tarefas
              </p>
            </div>
            <Switch id="email-comments" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-deadlines">Prazos</Label>
              <p className="text-sm text-muted-foreground">
                Lembretes sobre prazos próximos
              </p>
            </div>
            <Switch id="email-deadlines" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates">Atualizações de Projeto</Label>
              <p className="text-sm text-muted-foreground">
                Mudanças importantes em projetos que você participa
              </p>
            </div>
            <Switch id="email-updates" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-weekly">Resumo Semanal</Label>
              <p className="text-sm text-muted-foreground">
                Resumo semanal das suas atividades e progresso
              </p>
            </div>
            <Switch id="email-weekly" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações no Aplicativo</CardTitle>
          <CardDescription>
            Configure as notificações que aparecem dentro do aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-mentions">Menções</Label>
              <p className="text-sm text-muted-foreground">
                Quando alguém mencionar você
              </p>
            </div>
            <Switch id="app-mentions" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-status">Mudanças de Status</Label>
              <p className="text-sm text-muted-foreground">
                Quando o status de uma tarefa sua mudar
              </p>
            </div>
            <Switch id="app-status" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-assignments">Atribuições</Label>
              <p className="text-sm text-muted-foreground">
                Quando você for adicionado ou removido de uma tarefa
              </p>
            </div>
            <Switch id="app-assignments" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-sounds">Sons de Notificação</Label>
              <p className="text-sm text-muted-foreground">
                Tocar som ao receber notificações
              </p>
            </div>
            <Switch id="app-sounds" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Salvar Preferências</Button>
      </div>
    </div>
  );
}
