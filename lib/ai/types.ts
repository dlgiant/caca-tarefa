export interface AIOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userId?: string;
  trackUsage?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;  // Nome amigável do modelo (ex: "Claude 3.5 Sonnet")
  modelId: string; // ID técnico do modelo (ex: "claude-3-5-sonnet-20241022")
  usage?: {
    requestsUsed: number;
    requestsRemaining: number;
    resetTime: Date;
  };
}

export interface CommandParseResult {
  action: 'create_task' | 'list_tasks' | 'complete_task' | 'analyze_productivity' | 'suggest_next' | 'chat';
  parameters: {
    title?: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    category?: string;
    dueDate?: string;
    taskId?: string;
    [key: string]: any;
  };
  originalIntent: string;
}

export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

export interface UsageData {
  requestsUsed: number;
  requestsRemaining: number;
  resetTime: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;  // Modelo usado para gerar a resposta
    commandParsed?: CommandParseResult;
  };
}

export interface ProductivityData {
  completedThisWeek: number;
  completionRate: number;
  avgTimePerTask: number;
  topCategories: string[];
  productiveHours: string[];
}

export interface TaskContext {
  pendingTasks: Array<{
    id: string;
    title: string;
    priority: string;
    dueDate?: Date;
  }>;
  workPattern: string;
  userPreferences?: {
    workingHours?: string;
    breakDuration?: number;
    focusCategories?: string[];
  };
}
