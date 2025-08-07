# Sistema de Gerenciamento de Tarefas

## Funcionalidades Implementadas

### 1. CRUD Completo de Tarefas
- ✅ **Criar tarefas** com título, descrição, prioridade, data de vencimento
- ✅ **Listar tarefas** com paginação e filtros
- ✅ **Editar tarefas** existentes
- ✅ **Deletar tarefas**
- ✅ **Marcar como concluída/pendente**

### 2. Sistema de Categorização
- ✅ **Categorias personalizadas** com cores
- ✅ **Tags** para organização adicional
- ✅ **Projetos** para agrupar tarefas relacionadas

### 3. Filtros e Busca Avançada
- ✅ **Busca por texto** (título e descrição)
- ✅ **Filtro por prioridade** (Baixa, Média, Alta, Urgente)
- ✅ **Filtro por status** (Pendente, Concluída)
- ✅ **Filtro por categoria**
- ✅ **Filtro por projeto**
- ✅ **Filtro por tags**
- ✅ **Filtro por período** (data de vencimento)

### 4. Ordenação
- ✅ **Por data de criação**
- ✅ **Por data de vencimento**
- ✅ **Por prioridade**
- ✅ **Por título** (alfabética)

### 5. Drag and Drop
- ✅ **Reorganização visual** das tarefas
- ✅ **Persistência da ordem** customizada

### 6. Validação de Dados
- ✅ **Schemas Zod** para validação robusta
- ✅ **Mensagens de erro** claras e específicas
- ✅ **Validação no cliente e servidor**

## Estrutura de Arquivos

```
/app
  /api
    /tasks
      route.ts          # GET (listar), POST (criar)
      /[id]
        route.ts        # GET, PUT, DELETE individual
      /reorder
        route.ts        # POST para reordenação
    /categories
      route.ts          # CRUD de categorias
    /projects
      route.ts          # CRUD de projetos
    /tags
      route.ts          # CRUD de tags
  /(protected)
    /tasks
      page.tsx          # Página principal de tarefas
    layout.tsx          # Layout protegido

/components
  /tasks
    task-list.tsx       # Lista com filtros e drag-and-drop
    task-form.tsx       # Formulário de criação/edição
    quick-manage.tsx    # Gerenciamento rápido de categorias/projetos

/src/lib
  /validations
    task.ts            # Schemas de validação Zod
```

## API Endpoints

### Tarefas
- `GET /api/tasks` - Listar tarefas com filtros
- `POST /api/tasks` - Criar nova tarefa
- `GET /api/tasks/[id]` - Obter tarefa específica
- `PUT /api/tasks/[id]` - Atualizar tarefa
- `DELETE /api/tasks/[id]` - Deletar tarefa
- `POST /api/tasks/reorder` - Reordenar tarefas

### Categorias
- `GET /api/categories` - Listar categorias do usuário
- `POST /api/categories` - Criar nova categoria

### Projetos
- `GET /api/projects` - Listar projetos do usuário
- `POST /api/projects` - Criar novo projeto

### Tags
- `GET /api/tags` - Listar todas as tags
- `POST /api/tags` - Criar nova tag

## Parâmetros de Filtro (Query String)

```typescript
// Exemplo: /api/tasks?search=reunião&priority=HIGH&completed=false
{
  search?: string;        // Busca em título e descrição
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  completed?: boolean;
  categoryId?: string;
  projectId?: string;
  tags?: string[];        // Separadas por vírgula
  startDate?: string;     // ISO 8601
  endDate?: string;       // ISO 8601
  sortBy?: "createdAt" | "dueDate" | "priority" | "title";
  sortOrder?: "asc" | "desc";
}
```

## Schemas de Validação

### TaskSchema
```typescript
{
  title: string (obrigatório, max 200 chars)
  description?: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate?: string (ISO 8601)
  categoryId?: string
  projectId?: string
  tags?: string[]
  completed: boolean
}
```

## Componentes Reutilizáveis

### TaskList
- Lista interativa de tarefas
- Suporte a drag-and-drop
- Filtros integrados
- Busca em tempo real
- Ações rápidas (completar, editar, deletar)

### TaskForm
- Formulário completo para criar/editar tarefas
- Validação em tempo real
- Seleção de categoria/projeto
- Sistema de tags
- Seletor de data com calendário

### QuickManage
- Criação rápida de categorias e projetos
- Interface em abas
- Seletor de cores para categorias

## Próximos Passos Sugeridos

1. **Notificações e Lembretes**
   - Sistema de notificações para tarefas próximas do vencimento
   - Lembretes por email

2. **Estatísticas e Relatórios**
   - Dashboard com métricas de produtividade
   - Gráficos de conclusão de tarefas
   - Relatórios por período

3. **Colaboração**
   - Compartilhamento de tarefas
   - Atribuição de tarefas para outros usuários
   - Comentários em tarefas

4. **Automação**
   - Tarefas recorrentes
   - Templates de tarefas
   - Regras automáticas

5. **Integrações**
   - Calendário (Google Calendar, Outlook)
   - Ferramentas de produtividade (Slack, Teams)
   - Importação/Exportação de dados

## Como Usar

1. **Acessar o sistema**: Navegue para `/tasks` após fazer login
2. **Criar categoria/projeto**: Use o botão "Gerenciar" para criar categorias e projetos
3. **Criar tarefa**: Clique em "Nova Tarefa" e preencha o formulário
4. **Filtrar tarefas**: Use os filtros na barra superior
5. **Reorganizar**: Arraste e solte as tarefas para reorganizá-las
6. **Editar/Deletar**: Use o menu de três pontos em cada tarefa

## Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Type safety
- **Prisma** - ORM para banco de dados
- **Zod** - Validação de schemas
- **@dnd-kit** - Drag and drop
- **React Hook Form** - Gerenciamento de formulários
- **date-fns** - Manipulação de datas
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
