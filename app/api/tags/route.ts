import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar todas as tags
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Erro ao buscar tags:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tags" },
      { status: 500 }
    );
  }
}

// POST - Criar nova tag
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
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome da tag é obrigatório" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Tag com este nome já existe" },
        { status: 400 }
      );
    }
    
    console.error("Erro ao criar tag:", error);
    return NextResponse.json(
      { error: "Erro ao criar tag" },
      { status: 500 }
    );
  }
}
