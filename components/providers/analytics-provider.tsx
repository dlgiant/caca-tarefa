'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trackPageView, setUserId, trackEvent } from '@/lib/analytics';
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  // Track page views
  useEffect(() => {
    const url =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(url);
  }, [pathname, searchParams]);
  // Set user ID when session changes
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
      trackEvent('session_start', {
        userEmail: session.user.email,
        userName: session.user.name,
      });
    }
  }, [session]);
  // Track app lifecycle events
  useEffect(() => {
    // Track quando o app ganha foco
    const handleFocus = () => {
      trackEvent('app_focus');
    };
    // Track quando o app perde foco
    const handleBlur = () => {
      trackEvent('app_blur');
    };
    // Track quando o app volta do background (mobile PWA)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackEvent('app_foreground');
      } else {
        trackEvent('app_background');
      }
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Track instalação do PWA
    window.addEventListener('appinstalled', () => {
      trackEvent('pwa_installed');
    });
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  return <>{children}</>;
}
