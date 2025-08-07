import Anthropic from '@anthropic-ai/sdk';
import { RateLimiter } from './rate-limiter';
import { AIResponse, AIOptions, CommandParseResult } from './types';
import { prisma } from '@/src/lib/db';

export class AIService {
  private client: Anthropic;
  private model: string;
  private rateLimiter: RateLimiter;
  private modelConfig: { name: string; displayName: string } | null = null;

  constructor() {
    this.rateLimiter = new RateLimiter({
      maxRequests: parseInt(process.env.NEXT_PUBLIC_AI_RATE_LIMIT || '100'),
      windowMs: 60000 // 1 minuto
    });
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    
    // Modelo padrão, será sobrescrito pela configuração do banco
    this.model = 'claude-3-5-sonnet-20241022';
  }

  private async loadModelConfig() {
    try {
      // Buscar configuração do modelo do banco de dados
      const config = await prisma.systemConfig.findUnique({
        where: { key: 'claude_model' }
      });
      
      if (config) {
        const modelData = JSON.parse(config.value);
        this.model = modelData.name;
        this.modelConfig = modelData;
      } else {
        // Criar configuração padrão se não existir
        const defaultModel = {
          name: 'claude-3-5-sonnet-20241022',
          displayName: 'Claude 3.5 Sonnet'
        };
        
        await prisma.systemConfig.create({
          data: {
            key: 'claude_model',
            value: JSON.stringify(defaultModel),
            description: 'Modelo Claude para o assistente de IA'
          }
        });
        
        this.model = defaultModel.name;
        this.modelConfig = defaultModel;
      }
    } catch (error) {
      console.error('Erro ao carregar configuração do modelo:', error);
      // Usar modelo padrão em caso de erro
      this.modelConfig = {
        name: this.model,
        displayName: 'Claude 3.5 Sonnet'
      };
    }
  }

  async generateResponse(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    // Garantir que a configuração do modelo está carregada
    if (!this.modelConfig) {
      await this.loadModelConfig();
    }
    
    // Verificar rate limiting
    const canProceed = await this.rateLimiter.checkLimit(options.userId || 'anonymous');
    if (!canProceed) {
      throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
    }

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        system: options.systemPrompt || this.getSystemPrompt(),
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: options.stream || false
      });

      let content = '';
      if (!options.stream) {
        content = response.content[0].type === 'text' ? response.content[0].text : '';
      } else {
        // Stream handling será implementado separadamente
        return response as any;
      }

      return {
        content,
        model: this.modelConfig?.displayName || this.model,
        modelId: this.model,
        usage: options.trackUsage ? await this.rateLimiter.getUsage(options.userId || 'anonymous') : undefined
      };
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      throw error;
    }
  }

  async getModelInfo() {
    if (!this.modelConfig) {
      await this.loadModelConfig();
    }
    return this.modelConfig;
  }

  async updateModel(modelName: string, displayName: string) {
    const modelData = { name: modelName, displayName };
    
    await prisma.systemConfig.upsert({
      where: { key: 'claude_model' },
      update: { value: JSON.stringify(modelData) },
      create: {
        key: 'claude_model',
        value: JSON.stringify(modelData),
        description: 'Modelo Claude para o assistente de IA'
      }
    });
    
    this.model = modelName;
    this.modelConfig = modelData;
  }

  private getSystemPrompt(): string {
    return `Você é um assistente inteligente de produtividade integrado a um sistema de gerenciamento de tarefas. 
    
    Suas capacidades incluem:
    - Criar, editar e gerenciar tarefas
    - Fornecer sugestões de produtividade personalizadas
    - Analisar padrões de trabalho e produtividade
    - Ajudar na organização e priorização de atividades
    - Definir lembretes e prazos inteligentes
    
    Comandos disponíveis:
    - "criar tarefa [título]" - Cria uma nova tarefa
    - "listar tarefas" - Mostra tarefas pendentes
    - "completar tarefa [id]" - Marca tarefa como concluída
    - "analisar produtividade" - Fornece análise de produtividade
    - "sugerir próxima tarefa" - Sugere a próxima tarefa prioritária
    
    Responda de forma concisa, útil e sempre em português brasileiro.
    Quando criar tarefas, extraia: título, descrição, prioridade (alta/média/baixa), categoria e prazo quando mencionados.
    Formate respostas com markdown quando apropriado.`;
  }

  async parseCommand(input: string): Promise<CommandParseResult> {
    const parsePrompt = `
    Analise o seguinte comando do usuário e extraia as informações estruturadas:
    "${input}"
    
    Retorne um JSON com o seguinte formato:
    {
      "action": "create_task" | "list_tasks" | "complete_task" | "analyze_productivity" | "suggest_next" | "chat",
      "parameters": {
        "title": "string (se aplicável)",
        "description": "string (se aplicável)",
        "priority": "high" | "medium" | "low" (se aplicável),
        "category": "string (se aplicável)",
        "dueDate": "ISO date string (se aplicável)",
        "taskId": "string (se aplicável)"
      },
      "originalIntent": "string (descrição da intenção do usuário)"
    }
    
    Retorne APENAS o JSON, sem formatação markdown ou explicações.
    `;

    const response = await this.generateResponse(parsePrompt, {
      temperature: 0.3,
      maxTokens: 200
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Erro ao fazer parse do comando:', error);
      return {
        action: 'chat',
        parameters: {},
        originalIntent: input
      };
    }
  }

  async generateTaskSuggestions(context: any): Promise<string[]> {
    const prompt = `
    Com base no contexto do usuário:
    - Tarefas pendentes: ${JSON.stringify(context.pendingTasks)}
    - Padrão de trabalho: ${context.workPattern}
    - Hora atual: ${new Date().toLocaleString('pt-BR')}
    
    Sugira 3 tarefas que o usuário deveria focar agora, considerando prioridade, prazos e produtividade.
    Retorne apenas um array JSON com as sugestões em formato de string.
    `;

    const response = await this.generateResponse(prompt, {
      temperature: 0.5,
      maxTokens: 200
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return ['Revisar tarefas pendentes', 'Organizar prioridades do dia', 'Fazer uma pausa'];
    }
  }

  async analyzeProductivity(data: any): Promise<string> {
    const prompt = `
    Analise os seguintes dados de produtividade:
    - Tarefas completadas esta semana: ${data.completedThisWeek}
    - Taxa de conclusão: ${data.completionRate}%
    - Tempo médio por tarefa: ${data.avgTimePerTask} minutos
    - Categorias mais produtivas: ${data.topCategories}
    - Horários mais produtivos: ${data.productiveHours}
    
    Forneça uma análise concisa e 3 sugestões práticas para melhorar a produtividade.
    Use markdown para formatar a resposta.
    `;

    const response = await this.generateResponse(prompt, {
      temperature: 0.6,
      maxTokens: 400
    });

    return response.content;
  }

}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}
