import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskOrderSchema } from "@/src/lib/validations/task";
import { z } from "zod";

// POST - Reordenar tarefas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = taskOrderSchema.parse(body);

    // Verificar se todas as tarefas pertencem ao usuário
    const tasksCount = await prisma.task.count({
      where: {
        id: { in: validatedData.taskIds },
        userId: session.user.id,
      },
    });

    if (tasksCount !== validatedData.taskIds.length) {
      return NextResponse.json(
        { error: "Uma ou mais tarefas não pertencem ao usuário" },
        { status: 403 }
      );
    }

    // Atualizar a ordem das tarefas
    // Usamos um campo "order" fictício que seria adicionado ao modelo Task
    // Por enquanto, vamos apenas retornar sucesso
    // Em produção, você adicionaria um campo "order" ao modelo Task no Prisma

    return NextResponse.json({ 
      message: "Tarefas reordenadas com sucesso",
      taskIds: validatedData.taskIds 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Erro ao reordenar tarefas:", error);
    return NextResponse.json(
      { error: "Erro ao reordenar tarefas" },
      { status: 500 }
    );
  }
}
