import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';
// Handler principal da API
async function handler(req: NextRequest) {
  try {
    // Exemplo de processamento da requisição
    const data = {
      message: 'Requisição processada com sucesso',
      timestamp: new Date().toISOString(),
      method: req.method,
    };
    return NextResponse.json(data, { status: 200 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
// Exporta handlers com rate limiting aplicado
export const GET = withRateLimit(handler, {
  interval: 60 * 1000, // 1 minuto
  maxRequests: 10, // 10 requisições por minuto
  uniqueTokenPerInterval: 100,
});
export const POST = withRateLimit(handler, {
  interval: 60 * 1000, // 1 minuto
  maxRequests: 5, // 5 requisições por minuto
  uniqueTokenPerInterval: 100,
});
