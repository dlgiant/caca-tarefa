import { NextRequest, NextResponse } from 'next/server';
// Tipos
interface RateLimitConfig {
  interval: number; // Em milissegundos
  uniqueTokenPerInterval: number; // Número de tokens únicos por intervalo
  maxRequests: number; // Máximo de requisições por token
}
// Configurações padrão
const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
  maxRequests: 10,
};
// Configurações específicas por rota
const ROUTE_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/auth': {
    interval: 15 * 60 * 1000, // 15 minutos
    uniqueTokenPerInterval: 100,
    maxRequests: 5, // 5 tentativas de login por 15 minutos
  },
  '/api/ai': {
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 100,
    maxRequests: 3, // 3 requisições de IA por minuto
  },
  '/api/export': {
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 100,
    maxRequests: 2, // 2 exportações por minuto
  },
  '/api/notifications/send': {
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 200,
    maxRequests: 20, // 20 notificações por minuto
  },
  '/api/upload': {
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 100,
    maxRequests: 5, // 5 uploads por minuto
  },
};
// Store em memória (em produção, usar Redis ou similar)
class RateLimitStore {
  private store: Map<string, Map<string, { count: number; resetTime: number }>>;
  private cleanupInterval: NodeJS.Timeout;
  constructor() {
    this.store = new Map();
    // Limpa tokens expirados a cada minuto
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }
  private cleanup() {
    const now = Date.now();
    for (const [route, tokens] of this.store.entries()) {
      for (const [token, data] of tokens.entries()) {
        if (data.resetTime < now) {
          tokens.delete(token);
        }
      }
      if (tokens.size === 0) {
        this.store.delete(route);
      }
    }
  }
  get(
    route: string,
    token: string
  ): { count: number; resetTime: number } | null {
    const routeStore = this.store.get(route);
    if (!routeStore) return null;
    const data = routeStore.get(token);
    if (!data) return null;
    // Verifica se expirou
    if (data.resetTime < Date.now()) {
      routeStore.delete(token);
      return null;
    }
    return data;
  }
  set(
    route: string,
    token: string,
    data: { count: number; resetTime: number }
  ) {
    if (!this.store.has(route)) {
      this.store.set(route, new Map());
    }
    const routeStore = this.store.get(route)!;
    routeStore.set(token, data);
  }
  increment(route: string, token: string, interval: number): number {
    const existing = this.get(route, token);
    if (existing) {
      existing.count++;
      this.set(route, token, existing);
      return existing.count;
    } else {
      const data = {
        count: 1,
        resetTime: Date.now() + interval,
      };
      this.set(route, token, data);
      return 1;
    }
  }
  getRouteSize(route: string): number {
    const routeStore = this.store.get(route);
    return routeStore ? routeStore.size : 0;
  }
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}
// Instância global do store
const store = new RateLimitStore();
// Função para obter o identificador único do cliente
function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : req.headers.get('x-real-ip') || 'unknown';
  // Combina IP com user agent para maior precisão
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const identifier = `${ip}:${userAgent}`;
  // Hash simples para privacidade
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}
// Função para obter configuração da rota
function getRouteConfig(pathname: string): RateLimitConfig {
  // Procura por configuração exata
  if (ROUTE_CONFIGS[pathname]) {
    return ROUTE_CONFIGS[pathname];
  }
  // Procura por configuração parcial
  for (const [route, config] of Object.entries(ROUTE_CONFIGS)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }
  return DEFAULT_CONFIG;
}
// Middleware principal de rate limiting
export async function rateLimit(
  req: NextRequest,
  customConfig?: Partial<RateLimitConfig>
): Promise<NextResponse | null> {
  // Pula rate limiting em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return null;
  }
  const pathname = new URL(req.url).pathname;
  const config = { ...getRouteConfig(pathname), ...customConfig };
  const token = getClientIdentifier(req);
  // Verifica se excedeu o número de tokens únicos
  if (store.getRouteSize(pathname) >= config.uniqueTokenPerInterval) {
    return NextResponse.json(
      {
        error: 'Too many users',
        message: 'O serviço está sobrecarregado. Tente novamente mais tarde.',
      },
      {
        status: 503,
        headers: {
          'Retry-After': Math.ceil(config.interval / 1000).toString(),
        },
      }
    );
  }
  // Incrementa o contador para este token
  const count = store.increment(pathname, token, config.interval);
  // Verifica se excedeu o limite
  if (count > config.maxRequests) {
    const data = store.get(pathname, token);
    const retryAfter = data
      ? Math.ceil((data.resetTime - Date.now()) / 1000)
      : 60;
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Você excedeu o limite de ${config.maxRequests} requisições. Tente novamente em ${retryAfter} segundos.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(
            0,
            config.maxRequests - count
          ).toString(),
          'X-RateLimit-Reset': data?.resetTime.toString() || '',
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }
  // Adiciona headers de rate limit na resposta
  const data = store.get(pathname, token);
  if (data) {
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, config.maxRequests - count).toString()
    );
    headers.set('X-RateLimit-Reset', data.resetTime.toString());
    // Retorna null com headers que serão mesclados na resposta
    return null;
  }
  return null;
}
// Decorator para aplicar rate limiting em API routes
export function withRateLimit(
  handler: Function,
  config?: Partial<RateLimitConfig>
) {
  return async (req: NextRequest, ...args: any[]) => {
    const rateLimitResponse = await rateLimit(req, config);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(req, ...args);
  };
}
// Hook para usar rate limiting em Server Components
export async function checkRateLimit(
  identifier: string,
  route: string = 'default',
  config?: Partial<RateLimitConfig>
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const count = store.increment(route, identifier, fullConfig.interval);
  const data = store.get(route, identifier);
  return {
    allowed: count <= fullConfig.maxRequests,
    remaining: Math.max(0, fullConfig.maxRequests - count),
    resetTime: data?.resetTime || Date.now() + fullConfig.interval,
  };
}
// Limpar store ao finalizar (para testes)
export function clearRateLimitStore() {
  store.destroy();
}
