import { useState, useEffect, useRef, ComponentType, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
interface UseLazyComponentOptions {
  threshold?: number;
  rootMargin?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  delay?: number;
  ssr?: boolean;
}
// Loading component padrão
const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
  </div>
);
// Error component padrão
const DefaultErrorComponent = ({ retry }: { retry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <p className="text-sm text-red-500">Erro ao carregar componente</p>
    <button onClick={retry} className="text-sm text-blue-500 hover:underline">
      Tentar novamente
    </button>
  </div>
);
// Hook para lazy loading com Intersection Observer
export function useLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: UseLazyComponentOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    loadingComponent = <DefaultLoadingComponent />,
    errorComponent,
    delay = 0,
    ssr = false,
  } = options;
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    observerRef.current = observer;
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);
  // Componente lazy carregado dinamicamente
  const LazyComponent = dynamic<T>(
    () => {
      if (delay > 0) {
        return new Promise<{ default: ComponentType<T> }>((resolve) => {
          setTimeout(() => {
            importFn()
              .then(resolve)
              .catch((err) => {
                setError(err);
                throw err;
              });
          }, delay);
        });
      }
      return importFn().catch((err) => {
        setError(err);
        throw err;
      });
    },
    {
      loading: () => <>{loadingComponent}</>,
      ssr,
    }
  );
  const retry = () => {
    setError(null);
    setIsInView(false);
    // Força re-render
    setTimeout(() => setIsInView(true), 0);
  };
  const Component = (props: T) => {
    if (error) {
      return <>{errorComponent || <DefaultErrorComponent retry={retry} />}</>;
    }
    if (!isInView) {
      return <div ref={ref}>{loadingComponent}</div>;
    }
    return (
      <Suspense fallback={loadingComponent}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
  return {
    Component,
    isInView,
    error,
    retry,
    ref,
  };
}
// Hook para precarregar componente
export function usePreloadComponent(
  importFn: () => Promise<any>,
  delay = 2000
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      importFn().catch((err) => {
        console.error('Failed to preload component:', err);
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
}
// Utility para criar lazy components com configuração
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: UseLazyComponentOptions = {}
) {
  return dynamic(importFn, {
    loading: () => (
      <>{options.loadingComponent || <DefaultLoadingComponent />}</>
    ),
    ssr: options.ssr ?? false,
  });
}
// Hook para lazy loading de múltiplos componentes
export function useLazyComponents<T extends Record<string, () => Promise<any>>>(
  components: T,
  _options: UseLazyComponentOptions = {}
) {
  const [loadedComponents, setLoadedComponents] = useState<
    Partial<Record<keyof T, ComponentType<any>>>
  >({});
  const [loading, setLoading] = useState<Partial<Record<keyof T, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof T, Error>>>({});
  const load = async (componentName: keyof T) => {
    if (loadedComponents[componentName]) return;
    setLoading((prev) => ({ ...prev, [componentName]: true }));
    try {
      const module = await components[componentName]();
      setLoadedComponents((prev) => ({
        ...prev,
        [componentName]: module.default,
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [componentName]: error as Error,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [componentName]: false }));
    }
  };
  const preloadAll = async () => {
    const promises = Object.entries(components).map(([name]) =>
      load(name as keyof T)
    );
    await Promise.all(promises);
  };
  return {
    components: loadedComponents,
    loading,
    errors,
    load,
    preloadAll,
  };
}
