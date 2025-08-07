import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import { hashPassword, validatePasswordStrength } from "@/lib/auth-utils"

const prisma = new PrismaClient()

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validationResult = resetPasswordSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    const { token, password } = validationResult.data
    
    // Validar força da senha
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Senha fraca", details: passwordValidation.errors },
        { status: 400 }
      )
    }
    
    // Buscar token no banco
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })
    
    if (!resetToken) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      )
    }
    
    // Verificar se o token expirou
    if (resetToken.expires < new Date()) {
      // Deletar token expirado
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
      
      return NextResponse.json(
        { error: "Token expirado" },
        { status: 400 }
      )
    }
    
    // Criar hash da nova senha
    const hashedPassword = await hashPassword(password)
    
    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    })
    
    // Deletar token usado
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })
    
    return NextResponse.json(
      { message: "Senha redefinida com sucesso" },
      { status: 200 }
    )
    
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json(
      { error: "Erro ao redefinir senha" },
      { status: 500 }
    )
  }
}
