'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferências Gerais</CardTitle>
          <CardDescription>
            Configure suas preferências básicas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select defaultValue="pt-BR">
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select defaultValue="america-sao-paulo">
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="america-sao-paulo">América/São Paulo</SelectItem>
                <SelectItem value="america-new-york">América/Nova York</SelectItem>
                <SelectItem value="europe-london">Europa/Londres</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Formato de Data</Label>
            <Select defaultValue="dd-mm-yyyy">
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd-mm-yyyy">DD/MM/AAAA</SelectItem>
                <SelectItem value="mm-dd-yyyy">MM/DD/AAAA</SelectItem>
                <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">Modo Compacto</Label>
              <p className="text-sm text-muted-foreground">
                Reduz o espaçamento entre elementos
              </p>
            </div>
            <Switch id="compact-mode" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Animações</Label>
              <p className="text-sm text-muted-foreground">
                Ativa animações e transições suaves
              </p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Página Inicial</CardTitle>
          <CardDescription>
            Configure o que aparece quando você faz login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-page">Página Padrão</Label>
            <Select defaultValue="dashboard">
              <SelectTrigger id="default-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="tasks">Tarefas</SelectItem>
                <SelectItem value="projects">Projetos</SelectItem>
                <SelectItem value="last-visited">Última visitada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="items-per-page">Itens por Página</Label>
            <Select defaultValue="25">
              <SelectTrigger id="items-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Salvar Alterações</Button>
      </div>
    </div>
  );
}
