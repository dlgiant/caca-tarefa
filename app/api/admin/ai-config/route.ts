import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma';
export async function GET(_req: NextRequest) {
  try {
    // Verificar autenticação (adicionar verificação de admin quando implementado)
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    // TODO: Verificar se o usuário é admin
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Acesso negado' },
    //     { status: 403 }
    //   );
    // }
    const aiService = getAIService();
    const modelInfo = await aiService.getModelInfo();
    return NextResponse.json({
      model: modelInfo,
    });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configuração' },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    // TODO: Verificar se o usuário é admin
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Acesso negado' },
    //     { status: 403 }
    //   );
    // }
    const { modelId, displayName } = await req.json();
    if (!modelId || !displayName) {
      return NextResponse.json(
        { error: 'Modelo e nome são obrigatórios' },
        { status: 400 }
      );
    }
    const aiService = getAIService();
    await aiService.updateModel(modelId, displayName);
    // Registrar a mudança no histórico (opcional)
    await prisma.systemConfig.create({
      data: {
        key: `model_change_${Date.now()}`,
        value: JSON.stringify({
          changedBy: session.user.email,
          changedAt: new Date(),
          oldModel: await aiService.getModelInfo(),
          newModel: { name: modelId, displayName },
        }),
        description: `Modelo alterado por ${session.user.email}`,
      },
    });
    return NextResponse.json({
      success: true,
      model: { name: modelId, displayName },
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configuração' },
      { status: 500 }
    );
  }
}
