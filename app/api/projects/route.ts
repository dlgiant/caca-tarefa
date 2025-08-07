import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// GET - Listar projetos do usuário
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    );
  }
}
// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const body = await request.json();
    const { name, description, status, startDate, endDate } = body;
    if (!name) {
      return NextResponse.json(
        { error: 'Nome do projeto é obrigatório' },
        { status: 400 }
      );
    }
    const projectData: any = {
      name,
      description,
      status: status || 'ACTIVE',
      userId: session.user.id,
    };
    if (startDate) {
      projectData.startDate = new Date(startDate);
    }
    if (endDate) {
      projectData.endDate = new Date(endDate);
    }
    const project = await prisma.project.create({
      data: projectData,
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Projeto com este nome já existe' },
        { status: 400 }
      );
    }
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    );
  }
}
