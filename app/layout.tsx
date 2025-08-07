import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import AuthSessionProvider from '@/components/providers/session-provider';
import { NotificationProvider } from '@/components/custom/notification-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { PWAManager } from '@/components/pwa-manager';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Caça Tarefa - Gerenciador de Projetos',
    template: '%s | Caça Tarefa',
  },
  description:
    'Sistema completo de gerenciamento de projetos e tarefas com IA integrada',
  keywords: [
    'gerenciador de tarefas',
    'projetos',
    'produtividade',
    'gestão',
    'IA',
  ],
  authors: [{ name: 'Caça Tarefa Team' }],
  creator: 'Caça Tarefa',
  publisher: 'Caça Tarefa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caça Tarefa',
  },
  openGraph: {
    type: 'website',
    siteName: 'Caça Tarefa',
    title: 'Caça Tarefa - Gerenciador de Projetos',
    description:
      'Sistema completo de gerenciamento de projetos e tarefas com IA integrada',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caça Tarefa - Gerenciador de Projetos',
    description:
      'Sistema completo de gerenciamento de projetos e tarefas com IA integrada',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <AnalyticsProvider>
              {children}
              <NotificationProvider />
              <PWAManager />
            </AnalyticsProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
