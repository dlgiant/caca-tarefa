'use client';
import * as React from 'react';
import { toast } from 'sonner';
import { Plus, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  LoadingButton,
  ConfirmDialog,
  FormField,
  DataCard,
  EmptyState,
} from '@/components/custom';
export function ComponentShowcase() {
  const [loading, setLoading] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [formValue, setFormValue] = React.useState('');
  const [selectValue, setSelectValue] = React.useState('');
  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Ação concluída com sucesso!');
    }, 2000);
  };
  const handleConfirm = () => {
    toast.info('Ação confirmada!');
  };
  return (
    <div className="space-y-8 p-8">
      {/* Botões */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Botões</h2>
        <div className="flex gap-4 flex-wrap">
          <Button>Botão Padrão</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destrutivo</Button>
          <LoadingButton loading={loading} onClick={handleLoadingClick}>
            Botão com Loading
          </LoadingButton>
        </div>
      </section>
      {/* Formulários */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Campos de Formulário</h2>
        <div className="max-w-md space-y-4">
          <FormField
            label="Nome Completo"
            name="name"
            placeholder="Digite seu nome"
            value={formValue}
            onChange={setFormValue}
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value=""
            onChange={() => {}}
            error="Email inválido"
          />
          <div className="space-y-2">
            <label>Selecione uma opção</label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Opção 1</SelectItem>
                <SelectItem value="option2">Opção 2</SelectItem>
                <SelectItem value="option3">Opção 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataCard
            title="Card de Dados"
            description="Este é um exemplo de card customizado"
            actions={[
              { label: 'Editar', onClick: () => toast.info('Editando...') },
              {
                label: 'Excluir',
                onClick: () => setConfirmOpen(true),
                variant: 'destructive',
              },
            ]}
          >
            <p>Conteúdo do card aqui.</p>
          </DataCard>
          <DataCard
            title="Outro Card"
            footer={
              <span className="text-sm text-muted-foreground">
                Rodapé do card
              </span>
            }
          >
            <p>Mais conteúdo interessante.</p>
          </DataCard>
        </div>
      </section>
      {/* Diálogos e Alertas */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Diálogos e Alertas</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir Diálogo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Título do Diálogo</DialogTitle>
              <DialogDescription>
                Esta é a descrição do diálogo. Você pode adicionar qualquer
                conteúdo aqui.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input placeholder="Digite algo..." />
            </div>
          </DialogContent>
        </Dialog>
        <Alert>
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            Este é um alerta informativo para o usuário.
          </AlertDescription>
        </Alert>
      </section>
      {/* Estado Vazio */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Estado Vazio</h2>
        <div className="border rounded-lg">
          <EmptyState
            icon={FileX}
            title="Nenhum item encontrado"
            description="Comece adicionando seu primeiro item"
            action={{
              label: 'Adicionar Item',
              onClick: () => toast.success('Adicionando novo item...'),
            }}
          />
        </div>
      </section>
      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        variant="destructive"
      />
      {/* Notificações */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Notificações (Toast)</h2>
        <div className="flex gap-4 flex-wrap">
          <Button onClick={() => toast.success('Sucesso!')}>
            Toast de Sucesso
          </Button>
          <Button onClick={() => toast.error('Erro!')}>Toast de Erro</Button>
          <Button onClick={() => toast.info('Informação!')}>
            Toast de Info
          </Button>
          <Button onClick={() => toast.warning('Aviso!')}>
            Toast de Aviso
          </Button>
        </div>
      </section>
    </div>
  );
}
