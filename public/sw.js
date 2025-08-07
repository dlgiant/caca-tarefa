// Service Worker para Caça Tarefa
const CACHE_NAME = 'caca-tarefa-v1';
const DYNAMIC_CACHE = 'caca-tarefa-dynamic-v1';

// Assets essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  networkFirst: [
    '/api/',
    '/dashboard',
    '/projects',
    '/tasks',
  ],
  cacheFirst: [
    '/static/',
    '/_next/static/',
    '/fonts/',
    '/icons/',
  ],
  staleWhileRevalidate: [
    '/images/',
    '/_next/image',
  ],
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Força o SW a ativar imediatamente
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Toma controle de todas as páginas imediatamente
  self.clients.claim();
});

// Fetch handler com estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições não HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determina a estratégia de cache baseada na URL
  const strategy = getStrategy(url.pathname);
  
  switch (strategy) {
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Estratégia Network First (ideal para conteúdo dinâmico)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se for uma página de navegação, retorna a página offline
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Estratégia Cache First (ideal para assets estáticos)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Estratégia Stale While Revalidate (ideal para imagens)
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Determina a estratégia baseada no caminho
function getStrategy(pathname) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pathname.startsWith(pattern))) {
      return strategy;
    }
  }
  return 'networkFirst';
}

// Background Sync para sincronizar dados offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  try {
    // Busca tarefas pendentes do IndexedDB
    const pendingTasks = await getPendingTasks();
    
    // Envia cada tarefa para o servidor
    for (const task of pendingTasks) {
      await fetch('/api/tasks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      
      // Remove da lista de pendentes
      await removePendingTask(task.id);
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/xmark.png',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('Caça Tarefa', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/notifications')
    );
  }
});

// Message handler para comunicação com o app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Funções auxiliares para IndexedDB (simplificadas)
async function getPendingTasks() {
  // Implementação simplificada - deve ser expandida conforme necessário
  return [];
}

async function removePendingTask(id) {
  // Implementação simplificada - deve ser expandida conforme necessário
  return true;
}
