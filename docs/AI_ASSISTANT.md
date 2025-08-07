# Assistente Virtual com IA - Documentação

## Visão Geral

O sistema implementa um assistente virtual inteligente usando Claude da Anthropic, integrado ao sistema de gerenciamento de tarefas. O assistente oferece funcionalidades avançadas de produtividade através de processamento de linguagem natural.

## Características Principais

### 1. Interface de Chat Flutuante
- Widget de chat responsivo e moderno
- Animações suaves com Framer Motion
- Sugestões contextuais de comandos
- Histórico de conversas persistente
- Indicador visual do modelo em uso

### 2. Processamento de Linguagem Natural
- Parser inteligente de comandos
- Reconhecimento de intenções do usuário
- Extração automática de parâmetros
- Suporte a comandos em português brasileiro

### 3. Funcionalidades Implementadas

#### Criar Tarefas via Chat
```
Exemplos de comandos:
- "Criar tarefa revisar documento até amanhã"
- "Nova tarefa urgente: preparar apresentação"
- "Adicionar tarefa comprar leite categoria pessoal"
```

#### Listar e Gerenciar Tarefas
```
Exemplos de comandos:
- "Mostrar minhas tarefas"
- "Listar tarefas pendentes"
- "Completar tarefa [id]"
```

#### Análise de Produtividade
```
Exemplos de comandos:
- "Analisar minha produtividade"
- "Como está meu desempenho esta semana?"
- "Estatísticas de tarefas completadas"
```

#### Sugestões Inteligentes
```
Exemplos de comandos:
- "Qual tarefa devo fazer agora?"
- "Sugerir próxima atividade"
- "O que é mais prioritário?"
```

## Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Claude AI Configuration (Obrigatório)
ANTHROPIC_API_KEY="sua-chave-api-aqui"

# Rate Limiting (opcional, padrão: 100)
NEXT_PUBLIC_AI_RATE_LIMIT="100"
```

### 2. Modelos Disponíveis

O sistema suporta os seguintes modelos Claude:

- **Claude 3.5 Sonnet** (Recomendado): Melhor equilíbrio entre performance e custo
- **Claude 3.5 Haiku**: Mais rápido e econômico
- **Claude 3 Opus**: Máxima qualidade, mais lento
- **Claude 3 Sonnet**: Versão anterior balanceada
- **Claude 3 Haiku**: Versão anterior econômica

### 3. Configuração de Modelo (Admin)

Acesse `/admin/ai-config` para:
- Visualizar modelo atual
- Selecionar novo modelo
- Acompanhar histórico de mudanças

## Rate Limiting

O sistema implementa controle de uso da API:

- **Limite padrão**: 100 requisições por minuto por usuário
- **Janela temporal**: 60 segundos
- **Reset automático**: Após expiração da janela
- **Feedback visual**: Usuário é notificado quando atinge o limite

## Arquitetura

### Componentes Principais

```
lib/ai/
├── ai-service.ts      # Serviço principal de IA
├── rate-limiter.ts    # Sistema de rate limiting
└── types.ts           # Tipos TypeScript

components/ai/
└── chat-widget.tsx    # Interface de chat

app/api/
├── ai/chat/          # Endpoint de conversação
└── admin/ai-config/  # Configuração de modelo
```

### Fluxo de Dados

1. **Usuário** envia mensagem via ChatWidget
2. **API Route** processa a requisição
3. **AIService** interpreta o comando
4. **Claude API** gera resposta
5. **Sistema** executa ações (criar tarefa, etc.)
6. **Banco** armazena histórico
7. **Interface** exibe resposta

## Banco de Dados

### Tabelas Adicionadas

#### ChatHistory
- Armazena todas as conversas
- Rastreia comandos executados
- Permite análise de uso

#### SystemConfig
- Configurações do sistema
- Modelo Claude selecionado
- Histórico de mudanças

## Segurança

### Implementações de Segurança

1. **Autenticação obrigatória** para usar o assistente
2. **Rate limiting** por usuário
3. **Validação de comandos** antes da execução
4. **Sanitização de inputs** para prevenir injeções
5. **Logs de auditoria** para ações administrativas

## Prompts Otimizados

O sistema usa prompts especializados para cada funcionalidade:

### System Prompt Principal
```
Você é um assistente inteligente de produtividade...
[Contexto e capacidades]
[Comandos disponíveis]
[Instruções de formatação]
```

### Prompt de Parser
```
Analise o comando e extraia informações estruturadas...
[Formato JSON esperado]
[Regras de extração]
```

## Melhorias Futuras

### Curto Prazo
- [ ] Suporte a comandos de voz
- [ ] Exportação de conversas
- [ ] Atalhos de teclado
- [ ] Modo offline com cache

### Médio Prazo
- [ ] Análise preditiva avançada
- [ ] Integração com calendário
- [ ] Automações personalizadas
- [ ] Dashboard de analytics

### Longo Prazo
- [ ] Aprendizado personalizado
- [ ] Integração com outras ferramentas
- [ ] API pública para desenvolvedores
- [ ] Suporte multi-idioma

## Troubleshooting

### Problema: "Limite de requisições excedido"
**Solução**: Aguarde 1 minuto ou ajuste NEXT_PUBLIC_AI_RATE_LIMIT

### Problema: "Erro ao processar mensagem"
**Solução**: Verifique se ANTHROPIC_API_KEY está configurada corretamente

### Problema: "Modelo não disponível"
**Solução**: Verifique se sua chave API tem acesso ao modelo selecionado

## Exemplos de Uso

### Criar Tarefa Complexa
```
Usuário: "Criar tarefa urgente para revisar o relatório trimestral até sexta-feira às 17h"

Assistente: ✅ Tarefa "revisar o relatório trimestral" criada com sucesso!
⚠️ Esta é uma tarefa de alta prioridade.
📅 Prazo: 09/08/2024
```

### Análise de Produtividade
```
Usuário: "Como está minha produtividade?"

Assistente: 📊 **Análise de Produtividade**

Esta semana você completou 12 tarefas com taxa de conclusão de 75%.

**Pontos Fortes:**
- Manhãs são seu período mais produtivo
- Tarefas de "Trabalho" têm alta taxa de conclusão

**Sugestões:**
1. Reserve as manhãs para tarefas prioritárias
2. Quebre tarefas grandes em subtarefas menores
3. Use a técnica Pomodoro nas tardes
```

## Suporte

Para questões ou problemas:
1. Consulte esta documentação
2. Verifique os logs do console
3. Abra uma issue no repositório
4. Contate o suporte técnico
