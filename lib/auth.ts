import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import type { Session } from 'next-auth';
export { authOptions };
// Create a wrapper for getServerSession that works with our app
export function getServerSession(): Promise<Session | null> {
  // In test environment, return a mock session
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve(null);
  }
  // In production, use next-auth
  return import('next-auth').then((nextAuth) => {
    if ('getServerSession' in nextAuth) {
      const getServerSessionFn = (
        nextAuth as {
          getServerSession: (
            options: typeof authOptions
          ) => Promise<Session | null>;
        }
      ).getServerSession;
      return getServerSessionFn(authOptions);
    }
    return null;
  });
}
