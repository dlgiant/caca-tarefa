'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, RefreshCw, X } from 'lucide-react';
export function PWAManager() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    // Verifica status online/offline
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
      if (!navigator.onLine) {
        toast.warning(
          'Você está offline. Algumas funcionalidades podem estar limitadas.'
        );
      } else if (isOffline) {
        toast.success('Conexão restaurada!');
      }
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    // Registra o Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          console.log('[PWA] Service Worker registrado');
          // Verifica por atualizações
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setIsUpdateAvailable(true);
                  toast.info('Nova versão disponível!', {
                    duration: Infinity,
                    action: {
                      label: 'Atualizar',
                      onClick: () => handleUpdate(),
                    },
                  });
                }
              });
            }
          });
          // Verifica por atualizações a cada hora
          setInterval(
            () => {
              reg.update();
            },
            1000 * 60 * 60
          );
        })
        .catch((error) => {
          console.error('[PWA] Erro ao registrar Service Worker:', error);
        });
    }
    // Handler para evento de instalação
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      // Mostra notificação de instalação após 30 segundos
      setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          toast.info('Instale o Caça Tarefa em seu dispositivo!', {
            duration: 10000,
            action: {
              label: 'Instalar',
              onClick: () => handleInstall(),
            },
          });
        }
      }, 30000);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] App já está instalado');
    }
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, [isOffline]);
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('App instalado com sucesso!');
      localStorage.setItem('pwa-installed', 'true');
    } else {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };
  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };
  // Componente de banner de instalação
  if (isInstallable && !localStorage.getItem('pwa-install-banner-dismissed')) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                Instalar Caça Tarefa
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Instale o app para acesso rápido e funcionalidades offline!
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstall} className="gap-2">
                  <Download className="h-4 w-4" />
                  Instalar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsInstallable(false);
                    localStorage.setItem(
                      'pwa-install-banner-dismissed',
                      'true'
                    );
                  }}
                >
                  Depois
                </Button>
              </div>
            </div>
            <button
              onClick={() => {
                setIsInstallable(false);
                localStorage.setItem('pwa-install-banner-dismissed', 'true');
              }}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Componente de banner de atualização
  if (isUpdateAvailable) {
    return (
      <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1 text-blue-900 dark:text-blue-100">
                Atualização Disponível
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Uma nova versão está disponível. Atualize para obter as últimas
                melhorias!
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleUpdate}
              className="ml-3 gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
// Hook para verificar capacidades PWA
export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  useEffect(() => {
    // Verifica se está rodando como PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    setIsPWA(standalone || (navigator as any).standalone);
    // Verifica capacidade de compartilhamento
    setCanShare('share' in navigator);
    // Verifica se pode instalar
    setCanInstall('BeforeInstallPromptEvent' in window);
  }, []);
  const share = async (data: ShareData) => {
    if (canShare) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        return false;
      }
    }
    return false;
  };
  return {
    isPWA,
    isStandalone,
    canShare,
    canInstall,
    share,
  };
}
