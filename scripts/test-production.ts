#!/usr/bin/env tsx
/**
 * Script de Testes de Produção
 *
 * Verifica se todos os sistemas críticos estão funcionando
 * após o deploy em produção
 *
 * Uso: npm run test:production
 */
import { config } from 'dotenv';
// Carregar variáveis de ambiente
config({ path: '.env.production.local' });
interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message?: string;
  duration?: number;
}
class ProductionTests {
  private baseUrl: string;
  private results: TestResult[] = [];
  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  /**
   * Teste de health check básico
   */
  async testHealthCheck(): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const duration = Date.now() - startTime;
      if (response.ok) {
        this.results.push({
          name: 'Health Check',
          status: 'passed',
          duration,
        });
      } else {
        this.results.push({
          name: 'Health Check',
          status: 'failed',
          message: `Status: ${response.status}`,
          duration,
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Health Check',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  /**
   * Teste de conexão com banco de dados
   */
  async testDatabase(): Promise<void> {
    const startTime = Date.now();
    try {
      // Testar via API que usa o banco
      const response = await fetch(`${this.baseUrl}/api/test/db`, {
        method: 'GET',
      });
      const duration = Date.now() - startTime;
      if (response.ok) {
        await response.json();
        this.results.push({
          name: 'Database Connection',
          status: 'passed',
          message: `Connected in ${duration}ms`,
          duration,
        });
      } else {
        this.results.push({
          name: 'Database Connection',
          status: 'failed',
          message: `Failed with status ${response.status}`,
          duration,
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Database Connection',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  /**
   * Teste de autenticação
   */
  async testAuthentication(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/providers`);
      if (response.ok) {
        const providers = await response.json();
        this.results.push({
          name: 'Authentication System',
          status: 'passed',
          message: `Providers: ${Object.keys(providers).join(', ')}`,
        });
      } else {
        this.results.push({
          name: 'Authentication System',
          status: 'failed',
          message: `Status: ${response.status}`,
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Authentication System',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  /**
   * Teste de integração com Claude AI
   */
  async testAIIntegration(): Promise<void> {
    if (!process.env.ANTHROPIC_API_KEY) {
      this.results.push({
        name: 'AI Integration',
        status: 'warning',
        message: 'ANTHROPIC_API_KEY not configured',
      });
      return;
    }
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });
      if (response.ok) {
        this.results.push({
          name: 'AI Integration',
          status: 'passed',
          message: 'Claude AI connected successfully',
        });
      } else {
        const data = await response.json();
        this.results.push({
          name: 'AI Integration',
          status: 'failed',
          message: data.error || `Status: ${response.status}`,
        });
      }
    } catch (error) {
      this.results.push({
        name: 'AI Integration',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  /**
   * Teste de performance (Core Web Vitals simulado)
   */
  async testPerformance(): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await fetch(this.baseUrl);
      const duration = Date.now() - startTime;
      if (response.ok) {
        // Verificar TTFB (Time to First Byte)
        if (duration < 200) {
          this.results.push({
            name: 'Performance (TTFB)',
            status: 'passed',
            message: `${duration}ms (Excellent)`,
            duration,
          });
        } else if (duration < 500) {
          this.results.push({
            name: 'Performance (TTFB)',
            status: 'warning',
            message: `${duration}ms (Good)`,
            duration,
          });
        } else {
          this.results.push({
            name: 'Performance (TTFB)',
            status: 'failed',
            message: `${duration}ms (Needs improvement)`,
            duration,
          });
        }
      } else {
        this.results.push({
          name: 'Performance (TTFB)',
          status: 'failed',
          message: `Failed with status ${response.status}`,
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Performance (TTFB)',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  /**
   * Teste de headers de segurança
   */
  async testSecurityHeaders(): Promise<void> {
    try {
      const response = await fetch(this.baseUrl);
      const headers = response.headers;
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security',
      ];
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.get(header)
      );
      if (missingHeaders.length === 0) {
        this.results.push({
          name: 'Security Headers',
          status: 'passed',
          message: 'All required headers present',
        });
      } else {
        this.results.push({
          name: 'Security Headers',
          status: 'warning',
          message: `Missing: ${missingHeaders.join(', ')}`,
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Security Headers',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  /**
   * Teste de cron jobs
   */
  async testCronJobs(): Promise<void> {
    const cronEndpoints = [
      '/api/cron/backup',
      '/api/cron/reminders',
      '/api/cron/cleanup',
    ];
    for (const endpoint of cronEndpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
          },
        });
        const name = `Cron Job: ${endpoint}`;
        if (response.status === 401) {
          this.results.push({
            name,
            status: 'passed',
            message: 'Protected correctly',
          });
        } else if (response.ok) {
          this.results.push({
            name,
            status: 'warning',
            message: 'Accessible (check CRON_SECRET)',
          });
        } else {
          this.results.push({
            name,
            status: 'failed',
            message: `Status: ${response.status}`,
          });
        }
      } catch (error) {
        this.results.push({
          name: `Cron Job: ${endpoint}`,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
  /**
   * Executar todos os testes
   */
  async runAllTests(): Promise<void> {
    console.log(`\n🧪 Running Production Tests for ${this.baseUrl}\n`);
    console.log('━'.repeat(50));
    await this.testHealthCheck();
    await this.testDatabase();
    await this.testAuthentication();
    await this.testAIIntegration();
    await this.testPerformance();
    await this.testSecurityHeaders();
    await this.testCronJobs();
    this.printResults();
  }
  /**
   * Imprimir resultados dos testes
   */
  private printResults(): void {
    console.log('\n📊 Test Results\n');
    console.log('━'.repeat(50));
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    for (const result of this.results) {
      const icon =
        result.status === 'passed'
          ? '✅'
          : result.status === 'warning'
            ? '⚠️'
            : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.message) {
        console.log(`   └─ ${result.message}`);
      }
      if (result.duration) {
        console.log(`   └─ Duration: ${result.duration}ms`);
      }
      if (result.status === 'passed') passed++;
      else if (result.status === 'failed') failed++;
      else if (result.status === 'warning') warnings++;
      console.log();
    }
    console.log('━'.repeat(50));
    console.log('\n📈 Summary\n');
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.results.length}`);
    const successRate = (passed / this.results.length) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    if (failed > 0) {
      console.log('\n⚠️ Some tests failed. Please review the results above.');
      process.exit(1);
    } else if (warnings > 0) {
      console.log('\n⚠️ All tests passed with warnings. Review recommended.');
    } else {
      console.log('\n✅ All tests passed! Production is ready! 🚀');
    }
  }
}
// Executar testes
async function main() {
  const baseUrl = process.argv[2] || process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    console.error('❌ Please provide a base URL or set NEXTAUTH_URL');
    console.log('Usage: npm run test:production [URL]');
    process.exit(1);
  }
  const tester = new ProductionTests(baseUrl);
  await tester.runAllTests();
}
// Executar apenas se for o script principal
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}
export { ProductionTests };
