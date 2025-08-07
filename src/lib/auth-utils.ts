import bcrypt from 'bcryptjs';
import crypto from 'crypto';
/**
 * Hash de senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}
/**
 * Comparar senha com hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
/**
 * Gerar token aleatório para recuperação de senha
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
/**
 * Gerar data de expiração para token (padrão: 1 hora)
 */
export function generateTokenExpiry(hours: number = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
/**
 * Validar força da senha
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
