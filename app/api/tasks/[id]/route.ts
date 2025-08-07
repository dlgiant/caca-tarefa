import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateTaskSchema } from '@/src/lib/validations/task';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
// GET - Obter tarefa específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        category: true,
        project: true,
        tags: true,
      },
    });
    if (!task) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(task);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tarefa' },
      { status: 500 }
    );
  }
}
// PUT - Atualizar tarefa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    // Verificar se a tarefa pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);
    // Preparar dados para atualização
    const updateData: Prisma.TaskUpdateInput = {};
    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.priority !== undefined)
      updateData.priority = validatedData.priority;
    if (validatedData.completed !== undefined)
      updateData.completed = validatedData.completed;
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : null;
    }
    // Atualizar categoria
    if (validatedData.categoryId !== undefined) {
      if (validatedData.categoryId === null) {
        updateData.category = { disconnect: true };
      } else {
        updateData.category = { connect: { id: validatedData.categoryId } };
      }
    }
    // Atualizar projeto
    if (validatedData.projectId !== undefined) {
      if (validatedData.projectId === null) {
        updateData.project = { disconnect: true };
      } else {
        updateData.project = { connect: { id: validatedData.projectId } };
      }
    }
    // Atualizar tags
    if (validatedData.tags !== undefined) {
      // Primeiro, desconectar todas as tags existentes
      await prisma.task.update({
        where: { id: params.id },
        data: { tags: { set: [] } },
      });
      // Depois, conectar ou criar as novas tags
      if (validatedData.tags.length > 0) {
        updateData.tags = {
          connectOrCreate: validatedData.tags.map((tagName) => ({
            where: { name: tagName },
            create: {
              name: tagName,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            },
          })),
        };
      }
    }
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        project: true,
        tags: true,
      },
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    );
  }
}
// DELETE - Deletar tarefa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    // Verificar se a tarefa pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }
    await prisma.task.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar tarefa' },
      { status: 500 }
    );
  }
}
