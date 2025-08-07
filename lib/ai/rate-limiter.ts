import { RateLimiterConfig, UsageData } from './types';

interface UserUsage {
  requests: number;
  windowStart: number;
}

export class RateLimiter {
  private config: RateLimiterConfig;
  private usage: Map<string, UserUsage>;

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.usage = new Map();
  }

  async checkLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const userUsage = this.usage.get(userId);

    if (!userUsage) {
      // Primeiro uso
      this.usage.set(userId, {
        requests: 1,
        windowStart: now
      });
      return true;
    }

    // Verificar se a janela expirou
    if (now - userUsage.windowStart > this.config.windowMs) {
      // Reset da janela
      this.usage.set(userId, {
        requests: 1,
        windowStart: now
      });
      return true;
    }

    // Verificar se ainda tem requisições disponíveis
    if (userUsage.requests < this.config.maxRequests) {
      userUsage.requests++;
      return true;
    }

    return false;
  }

  async getUsage(userId: string): Promise<UsageData> {
    const now = Date.now();
    const userUsage = this.usage.get(userId);

    if (!userUsage || now - userUsage.windowStart > this.config.windowMs) {
      return {
        requestsUsed: 0,
        requestsRemaining: this.config.maxRequests,
        resetTime: new Date(now + this.config.windowMs)
      };
    }

    const timeRemaining = this.config.windowMs - (now - userUsage.windowStart);
    
    return {
      requestsUsed: userUsage.requests,
      requestsRemaining: Math.max(0, this.config.maxRequests - userUsage.requests),
      resetTime: new Date(userUsage.windowStart + this.config.windowMs)
    };
  }

  reset(userId: string): void {
    this.usage.delete(userId);
  }

  resetAll(): void {
    this.usage.clear();
  }

  // Persistência em banco de dados (opcional)
  async saveToDatabase(userId: string): Promise<void> {
    const usage = this.usage.get(userId);
    if (!usage) return;

    // Implementar salvamento no banco
    // await db.rateLimits.upsert({
    //   where: { userId },
    //   update: { requests: usage.requests, windowStart: new Date(usage.windowStart) },
    //   create: { userId, requests: usage.requests, windowStart: new Date(usage.windowStart) }
    // });
  }

  async loadFromDatabase(userId: string): Promise<void> {
    // Implementar carregamento do banco
    // const data = await db.rateLimits.findUnique({ where: { userId } });
    // if (data) {
    //   this.usage.set(userId, {
    //     requests: data.requests,
    //     windowStart: data.windowStart.getTime()
    //   });
    // }
  }
}

// Rate limiter global para API endpoints
export class GlobalRateLimiter {
  private limiters: Map<string, RateLimiter>;

  constructor() {
    this.limiters = new Map();
  }

  getLimiter(endpoint: string, config?: RateLimiterConfig): RateLimiter {
    if (!this.limiters.has(endpoint)) {
      this.limiters.set(endpoint, new RateLimiter(
        config || {
          maxRequests: 100,
          windowMs: 60000
        }
      ));
    }
    return this.limiters.get(endpoint)!;
  }

  async checkEndpointLimit(endpoint: string, userId: string): Promise<boolean> {
    const limiter = this.getLimiter(endpoint);
    return limiter.checkLimit(userId);
  }
}
