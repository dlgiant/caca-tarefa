import { auth } from '@/src/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/api/register',
  '/api/forgot-password',
  '/api/reset-password',
];
// Rotas que devem redirecionar para dashboard se o usuário estiver logado
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Permitir acesso a recursos estáticos e APIs do NextAuth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  const session = await auth();
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  // Verificar se é uma rota de autenticação
  const isAuthRoute = authRoutes.includes(pathname);
  // Redirecionar usuários logados tentando acessar páginas de auth
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  // Proteger rotas privadas
  if (!session && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
