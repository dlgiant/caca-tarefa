import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema, taskFilterSchema } from "@/src/lib/validations/task";
import { Prisma } from "@prisma/client";

// GET - Listar tarefas com filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = taskFilterSchema.parse({
      search: searchParams.get("search") || undefined,
      priority: searchParams.get("priority") || undefined,
      completed: searchParams.get("completed") === "true" ? true : 
                 searchParams.get("completed") === "false" ? false : undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      projectId: searchParams.get("projectId") || undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean) || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    // Construir condições do where
    const where: Prisma.TaskWhereInput = {
      userId: session.user.id,
    };

    // Filtro de busca
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Outros filtros
    if (filters.priority) where.priority = filters.priority;
    if (filters.completed !== undefined) where.completed = filters.completed;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.projectId) where.projectId = filters.projectId;
    
    // Filtro de tags
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          name: { in: filters.tags }
        }
      };
    }

    // Filtro de datas
    if (filters.startDate || filters.endDate) {
      where.dueDate = {};
      if (filters.startDate) {
        where.dueDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.dueDate.lte = new Date(filters.endDate);
      }
    }

    // Ordenação
    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        category: true,
        project: true,
        tags: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tarefas" },
      { status: 500 }
    );
  }
}

// POST - Criar nova tarefa
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
    const validatedData = taskSchema.parse(body);

    // Preparar dados para criação
    const taskData: Prisma.TaskCreateInput = {
      title: validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority,
      completed: validatedData.completed,
      user: {
        connect: { id: session.user.id }
      },
    };

    // Adicionar data de vencimento se fornecida
    if (validatedData.dueDate) {
      taskData.dueDate = new Date(validatedData.dueDate);
    }

    // Conectar categoria se fornecida
    if (validatedData.categoryId) {
      taskData.category = {
        connect: { id: validatedData.categoryId }
      };
    }

    // Conectar projeto se fornecido
    if (validatedData.projectId) {
      taskData.project = {
        connect: { id: validatedData.projectId }
      };
    }

    // Conectar ou criar tags
    if (validatedData.tags && validatedData.tags.length > 0) {
      taskData.tags = {
        connectOrCreate: validatedData.tags.map(tagName => ({
          where: { name: tagName },
          create: { 
            name: tagName,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Cor aleatória
          }
        }))
      };
    }

    const task = await prisma.task.create({
      data: taskData,
      include: {
        category: true,
        project: true,
        tags: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json(
      { error: "Erro ao criar tarefa" },
      { status: 500 }
    );
  }
}

// Importar z para validação
import { z } from "zod";
