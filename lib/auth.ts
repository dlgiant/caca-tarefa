import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export { authOptions };

// Create a wrapper for getServerSession that works with our app
export async function getServerSession() {
  // We'll use dynamic import to avoid circular deps
  const nextAuth = await import('next-auth');
  if ('getServerSession' in nextAuth) {
    return await (nextAuth as any).getServerSession(authOptions);
  }
  return null;
}
