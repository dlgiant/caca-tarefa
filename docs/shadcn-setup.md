# Configuração do shadcn/ui

## ✅ Instalação Concluída

O shadcn/ui foi instalado e configurado com sucesso no projeto.

## 📦 Componentes Instalados

### Componentes Base (shadcn/ui)
- **Button** - Botões com diferentes variantes
- **Card** - Cards para organizar conteúdo
- **Dialog** - Modais e diálogos
- **Form** - Componentes de formulário com validação
- **Input** - Campos de entrada de texto
- **Label** - Labels para formulários
- **Select** - Menus de seleção
- **Textarea** - Áreas de texto
- **Checkbox** - Caixas de seleção
- **Radio Group** - Grupos de opções exclusivas
- **Dropdown Menu** - Menus suspensos
- **Alert** - Alertas informativos
- **Alert Dialog** - Diálogos de confirmação
- **Sonner** - Sistema de notificações toast

### Componentes Customizados
Localizados em `/components/custom/`:

1. **LoadingButton** - Botão com estado de carregamento
2. **ConfirmDialog** - Diálogo de confirmação reutilizável
3. **FormField** - Campo de formulário com validação integrada
4. **DataCard** - Card personalizado para exibir dados
5. **NotificationProvider** - Provider para o sistema de notificações
6. **EmptyState** - Componente para estados vazios

## 🎨 Tema e Configuração

### Variáveis CSS
As variáveis CSS foram configuradas em `app/globals.css` com:
- Cores para tema claro e escuro
- Sistema de cores baseado em oklch
- Variáveis para todos os componentes
- Suporte completo para dark mode

### Cores do Tema
- **Primary** - Cor principal da aplicação
- **Secondary** - Cor secundária
- **Destructive** - Para ações destrutivas
- **Muted** - Cores suaves para backgrounds
- **Accent** - Cores de destaque

## 🚀 Como Usar

### Importar Componentes Base
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

### Importar Componentes Customizados
```tsx
import { 
  LoadingButton, 
  ConfirmDialog, 
  FormField,
  DataCard,
  EmptyState 
} from "@/components/custom"
```

### Usar Notificações
```tsx
import { toast } from "sonner"

// Exemplos de uso
toast.success("Operação realizada com sucesso!")
toast.error("Ocorreu um erro")
toast.info("Informação importante")
toast.warning("Atenção!")
```

## 📁 Estrutura de Arquivos

```
components/
├── ui/                    # Componentes base do shadcn/ui
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── custom/               # Componentes customizados
│   ├── loading-button.tsx
│   ├── confirm-dialog.tsx
│   ├── form-field.tsx
│   └── ...
├── examples/             # Exemplos de uso
│   └── component-showcase.tsx
└── providers/            # Providers da aplicação
    └── session-provider.tsx
```

## 🔧 Adicionar Novos Componentes

Para adicionar novos componentes do shadcn/ui:

```bash
npx shadcn@latest add [nome-do-componente]
```

Exemplo:
```bash
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
```

## 📱 Responsividade

Todos os componentes são responsivos por padrão e funcionam bem em:
- Desktop
- Tablet
- Mobile

## 🌙 Dark Mode

O dark mode está configurado e funciona automaticamente baseado nas preferências do sistema do usuário.

## 📚 Recursos Adicionais

- [Documentação oficial do shadcn/ui](https://ui.shadcn.com)
- [Componentes disponíveis](https://ui.shadcn.com/docs/components)
- [Temas e customização](https://ui.shadcn.com/themes)
