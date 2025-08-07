// Service Worker pour CryptoBoost
const CACHE_NAME = 'cryptoboost-v1.0.0';
const API_CACHE_NAME = 'cryptoboost-api-v1.0.0';

// Fichiers critiques à mettre en cache
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Fichiers à mettre en cache en différé
const STATIC_ASSETS = [
  '/auth/login',
  '/auth/register',
  '/dashboard',
  '/dashboard/wallet',
  '/dashboard/plans',
];

// URLs API à mettre en cache
const API_URLS = [
  '/api/user/profile',
  '/api/plans',
  '/api/wallets',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critique
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      // Cache API
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('[SW] API cache ready');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Force l'activation immédiate
      return self.skipWaiting();
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete');
    })
  );
});

// Stratégies de cache
const strategies = {
  // Cache First - pour les assets statiques
  cacheFirst: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[SW] Cache hit:', request.url);
      return cached;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  },

  // Network First - pour les données dynamiques
  networkFirst: async (request) => {
    const cache = await caches.open(API_CACHE_NAME);
    
    try {
      console.log('[SW] Network first, fetching:', request.url);
      const response = await fetch(request);
      
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      console.log('[SW] Network failed, trying cache:', request.url);
      const cached = await cache.match(request);
      
      if (cached) {
        return cached;
      }
      
      // Retourner une réponse d'erreur personnalisée
      return new Response(
        JSON.stringify({
          error: 'Hors ligne',
          message: 'Cette fonctionnalité nécessite une connexion internet.'
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  },

  // Stale While Revalidate - pour un équilibre performance/fraîcheur
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    // Toujours essayer de récupérer la version fraîche en arrière-plan
    const fetchPromise = fetch(request).then((response) => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    });
    
    // Retourner immédiatement la version en cache si disponible
    return cached || fetchPromise;
  }
};

// Gestion des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer les requêtes vers d'autres domaines (sauf Supabase)
  if (url.origin !== self.location.origin && !url.hostname.includes('supabase')) {
    return;
  }

  event.respondWith(
    (async () => {
      // Assets statiques (JS, CSS, images)
      if (request.destination === 'script' || 
          request.destination === 'style' || 
          request.destination === 'image' ||
          url.pathname.includes('/static/')) {
        return strategies.cacheFirst(request);
      }

      // Pages HTML
      if (request.destination === 'document') {
        return strategies.staleWhileRevalidate(request);
      }

      // API Supabase
      if (url.hostname.includes('supabase') || url.pathname.startsWith('/api/')) {
        return strategies.networkFirst(request);
      }

      // Autres requêtes
      return strategies.staleWhileRevalidate(request);
    })()
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_KEYS':
      event.ports[0].postMessage({
        cacheKeys: [CACHE_NAME, API_CACHE_NAME]
      });
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CACHE_URLS':
      if (data && data.urls) {
        caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(data.urls);
        }).then(() => {
          event.ports[0].postMessage({ success: true });
        });
      }
      break;
  }
});

// Gestion des notifications push (pour future implémentation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification CryptoBoost',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      tag: data.tag || 'cryptoboost-notification',
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Ouvrir',
          icon: '/icons/open.png'
        },
        {
          action: 'dismiss',
          title: 'Ignorer',
          icon: '/icons/dismiss.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'CryptoBoost', options)
    );
  }
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Synchronisation en arrière-plan (pour les actions hors ligne)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implémenter la logique de synchronisation
      // Ex: envoyer les données en attente, synchroniser les favoris, etc.
      Promise.resolve()
    );
  }
});

console.log('[SW] Service Worker loaded successfully');