'use client';
import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log do erro para serviços de monitoramento
    console.error('Error boundary caught:', error);
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Ops! Algo deu errado</CardTitle>
          </div>
          <CardDescription>
            Encontramos um erro inesperado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              {error.message || 'Erro desconhecido'}
            </p>
            {error.digest && (
              <p className="mt-1 text-xs text-muted-foreground">
                Código do erro: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Ir para início
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
