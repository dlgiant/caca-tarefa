// Sistema de Analytics e Monitoring
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}
interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp?: number;
}
interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp?: number;
}
interface ErrorLog {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp?: number;
}
class Analytics {
  private queue: AnalyticsEvent[] = [];
  private pageViewQueue: PageView[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private errorQueue: ErrorLog[] = [];
  private sessionId: string;
  private userId?: string;
  private isProduction: boolean;
  private batchTimer?: NodeJS.Timeout;
  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';
    // Inicia o batch processing
    if (this.isProduction) {
      this.startBatchProcessing();
    }
    // Registra métricas de Web Vitals
    if (typeof window !== 'undefined') {
      this.registerWebVitals();
      this.registerErrorHandlers();
    }
  }
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  setUserId(userId: string) {
    this.userId = userId;
  }
  // Tracking de eventos
  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
      },
      timestamp: Date.now(),
    };
    this.queue.push(event);
    // Log em desenvolvimento
    if (!this.isProduction) {
      console.log('[Analytics] Event:', event);
    }
    // Envia imediatamente eventos críticos
    if (this.isCriticalEvent(name)) {
      this.flush();
    }
  }
  // Tracking de page views
  pageView(path: string, title?: string) {
    const view: PageView = {
      path,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    };
    this.pageViewQueue.push(view);
    if (!this.isProduction) {
      console.log('[Analytics] Page View:', view);
    }
  }
  // Tracking de performance
  trackPerformance(name: string, value: number, unit = 'ms') {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
    };
    this.performanceQueue.push(metric);
    if (!this.isProduction) {
      console.log('[Analytics] Performance:', metric);
    }
  }
  // Tracking de erros
  trackError(error: Error | string, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context: {
        ...context,
        sessionId: this.sessionId,
        userId: this.userId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      timestamp: Date.now(),
    };
    this.errorQueue.push(errorLog);
    if (!this.isProduction) {
      console.error('[Analytics] Error:', errorLog);
    }
    // Envia erros imediatamente
    this.flushErrors();
  }
  // Web Vitals
  private registerWebVitals() {
    // Observa Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.trackPerformance(
            'LCP',
            lastEntry.renderTime || lastEntry.loadTime
          );
        });
        lcpObserver.observe({
          type: 'largest-contentful-paint',
          buffered: true,
        });
      } catch (e) {
        console.error('Failed to observe LCP:', e);
      }
      // Observa First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.trackPerformance(
              'FID',
              entry.processingStart - entry.startTime
            );
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.error('Failed to observe FID:', e);
      }
      // Observa Cumulative Layout Shift (CLS)
      let clsValue = 0;
      try {
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        // Reporta CLS quando a página é descarregada
        window.addEventListener('beforeunload', () => {
          this.trackPerformance('CLS', clsValue);
        });
      } catch (e) {
        console.error('Failed to observe CLS:', e);
      }
    }
    // Time to First Byte (TTFB)
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      const ttfb = timing.responseStart - timing.navigationStart;
      this.trackPerformance('TTFB', ttfb);
    }
    // First Contentful Paint (FCP)
    if ('performance' in window) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.trackPerformance('FCP', entry.startTime);
        }
      });
    }
  }
  // Error handlers
  private registerErrorHandlers() {
    // Captura erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.trackError(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    // Captura rejeições de Promise não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(`Unhandled Promise Rejection: ${event.reason}`, {
        reason: event.reason,
      });
    });
  }
  // Batch processing
  private startBatchProcessing() {
    // Envia dados a cada 30 segundos
    this.batchTimer = setInterval(() => {
      this.flush();
    }, 30000);
    // Envia dados quando a página é descarregada
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }
  // Verifica se é um evento crítico
  private isCriticalEvent(eventName: string): boolean {
    const criticalEvents = [
      'purchase',
      'signup',
      'error',
      'payment_failed',
      'security_issue',
    ];
    return criticalEvents.includes(eventName.toLowerCase());
  }
  // Envia dados para o servidor
  private async sendToServer(endpoint: string, data: any[]) {
    if (data.length === 0) return;
    try {
      const response = await fetch(`/api/analytics/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          data,
          timestamp: Date.now(),
        }),
      });
      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`[Analytics] Failed to send ${endpoint}:`, error);
      // Salva no localStorage para retry posterior
      this.saveToLocalStorage(endpoint, data);
    }
  }
  // Salva dados no localStorage para retry
  private saveToLocalStorage(endpoint: string, data: any[]) {
    try {
      const key = `analytics_${endpoint}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('[Analytics] Failed to save to localStorage:', e);
    }
  }
  // Retry de dados salvos no localStorage
  private async retryFailedRequests() {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith('analytics_')
    );
    for (const key of keys) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const endpoint = key.split('_')[1];
        await this.sendToServer(endpoint, data);
        localStorage.removeItem(key);
      } catch (e) {
        console.error('[Analytics] Failed to retry:', e);
      }
    }
  }
  // Flush de todos os dados
  async flush() {
    if (!this.isProduction) return;
    // Retry de requisições falhas anteriores
    await this.retryFailedRequests();
    // Envia dados atuais
    await Promise.all([
      this.sendToServer('events', this.queue),
      this.sendToServer('pageviews', this.pageViewQueue),
      this.sendToServer('performance', this.performanceQueue),
      this.sendToServer('errors', this.errorQueue),
    ]);
    // Limpa as filas
    this.queue = [];
    this.pageViewQueue = [];
    this.performanceQueue = [];
    this.errorQueue = [];
  }
  // Flush apenas de erros (enviados imediatamente)
  async flushErrors() {
    if (!this.isProduction) return;
    await this.sendToServer('errors', this.errorQueue);
    this.errorQueue = [];
  }
  // Limpa o timer ao destruir
  destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.flush();
  }
}
// Singleton instance
const analytics = new Analytics();
// Funções de conveniência
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};
export const trackPageView = (path: string, title?: string) => {
  analytics.pageView(path, title);
};
export const trackPerformance = (
  name: string,
  value: number,
  unit?: string
) => {
  analytics.trackPerformance(name, value, unit);
};
export const trackError = (
  error: Error | string,
  context?: Record<string, any>
) => {
  analytics.trackError(error, context);
};
export const setUserId = (userId: string) => {
  analytics.setUserId(userId);
};
export const flushAnalytics = () => {
  analytics.flush();
};
export default analytics;
