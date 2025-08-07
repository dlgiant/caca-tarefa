import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { generateToken, generateTokenExpiry } from '@/src/lib/auth-utils';
const prisma = new PrismaClient();
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    const { email } = validationResult.data;
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });
    // Sempre retornar sucesso para não revelar se o email existe
    if (!user) {
      return NextResponse.json(
        { message: 'Se o email existir, você receberá um link de recuperação' },
        { status: 200 }
      );
    }
    // Deletar tokens antigos
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });
    // Criar novo token
    const token = generateToken();
    const expires = generateTokenExpiry(1); // 1 hora
    await prisma.passwordResetToken.create({
      data: {
        token,
        expires,
        userId: user.id,
      },
    });
    // TODO: Enviar email com o link de recuperação
    // Por enquanto, vamos apenas logar o link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log(`Link de recuperação para ${email}: ${resetLink}`);
    // Em produção, você enviaria um email real aqui
    // await sendPasswordResetEmail(email, resetLink)
    return NextResponse.json(
      {
        message: 'Se o email existir, você receberá um link de recuperação',
        // Em desenvolvimento, retornar o link para testes
        ...(process.env.NODE_ENV === 'development' && { resetLink }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
