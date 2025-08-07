'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (result?.ok) {
      router.push('/dashboard');
      router.refresh();
    }
    return result;
  };
  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };
  return {
    user: session?.user,
    session,
    status,
    update,
    login,
    logout,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
  };
}
