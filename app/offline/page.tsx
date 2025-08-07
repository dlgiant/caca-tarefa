import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
            <WifiOff className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Você está offline
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Não foi possível conectar ao servidor. Verifique sua conexão com a
            internet e tente novamente.
          </p>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full gap-2"
            size="lg"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full gap-2" size="lg">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dica: Você pode continuar navegando pelas páginas que já visitou
            enquanto estava online.
          </p>
        </div>
      </div>
    </div>
  );
}
