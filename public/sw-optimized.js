// Service Worker Optimisé pour CryptoBoost
// Version: 2.0.0 - Performances améliorées

const CACHE_VERSION = '2.0.0';
const CACHE_PREFIX = 'cryptoboost';

const CACHES = {
  STATIC: `${CACHE_PREFIX}-static-v${CACHE_VERSION}`,
  DYNAMIC: `${CACHE_PREFIX}-dynamic-v${CACHE_VERSION}`,
  IMAGES: `${CACHE_PREFIX}-images-v${CACHE_VERSION}`,
  API: `${CACHE_PREFIX}-api-v${CACHE_VERSION}`,
};

// Durées de cache optimisées
const CACHE_DURATIONS = {
  STATIC: 7 * 24 * 60 * 60 * 1000,  // 7 jours
  DYNAMIC: 24 * 60 * 60 * 1000,     // 1 jour  
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 jours
  API: 5 * 60 * 1000,               // 5 minutes
};

// Ressources critiques à précharger
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// Installation - Stratégie de préchargement optimisée
self.addEventListener('install', (event) => {
  console.log('[SW v2] Installing...');
  
  event.waitUntil(
    (async () => {
      // Précharger seulement les ressources critiques
      const staticCache = await caches.open(CACHES.STATIC);
      
      try {
        await staticCache.addAll(CRITICAL_RESOURCES);
        console.log('[SW v2] Critical resources cached');
      } catch (error) {
        console.warn('[SW v2] Failed to cache some critical resources:', error);
      }
      
      // Forcer l'activation immédiate
      await self.skipWaiting();
    })()
  );
});

// Activation - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW v2] Activating...');
  
  event.waitUntil(
    (async () => {
      // Nettoyer les anciens caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith(CACHE_PREFIX) && !Object.values(CACHES).includes(name)
      );
      
      await Promise.all(
        oldCaches.map(name => {
          console.log(`[SW v2] Deleting old cache: ${name}`);
          return caches.delete(name);
        })
      );
      
      // Prendre le contrôle de tous les clients
      await self.clients.claim();
      console.log('[SW v2] Activation complete');
    })()
  );
});

// Stratégies de cache optimisées
const cacheStrategies = {
  // Cache First - Pour les ressources statiques
  cacheFirst: async (request, cacheName, duration) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Vérifier si le cache est encore valide
      const cachedTime = new Date(cached.headers.get('sw-cached-time') || 0);
      const now = Date.now();
      
      if (now - cachedTime.getTime() < duration) {
        return cached;
      }
    }
    
    try {
      const response = await fetch(request);
      if (response.ok) {
        const responseClone = response.clone();
        
        // Ajouter timestamp au cache
        const responseWithTime = new Response(responseClone.body, {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: {
            ...Object.fromEntries(responseClone.headers.entries()),
            'sw-cached-time': new Date().toISOString(),
          },
        });
        
        await cache.put(request, responseWithTime);
      }
      return response;
    } catch (error) {
      return cached || new Response('Offline', { status: 503 });
    }
  },

  // Network First - Pour les APIs
  networkFirst: async (request, cacheName, duration) => {
    const cache = await caches.open(cacheName);
    
    try {
      const response = await fetch(request, { 
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const responseClone = response.clone();
        const responseWithTime = new Response(responseClone.body, {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: {
            ...Object.fromEntries(responseClone.headers.entries()),
            'sw-cached-time': new Date().toISOString(),
          },
        });
        
        await cache.put(request, responseWithTime);
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      return cached || new Response('Offline', { status: 503 });
    }
  },

  // Stale While Revalidate - Pour les ressources JS/CSS
  staleWhileRevalidate: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        const responseClone = response.clone();
        const responseWithTime = new Response(responseClone.body, {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: {
            ...Object.fromEntries(responseClone.headers.entries()),
            'sw-cached-time': new Date().toISOString(),
          },
        });
        cache.put(request, responseWithTime);
      }
      return response;
    });
    
    return cached || fetchPromise;
  },
};

// Déterminer la stratégie en fonction de l'URL
const getCacheStrategy = (url) => {
  // Images et polices - Cache First longue durée
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/i.test(url)) {
    return { strategy: 'cacheFirst', cache: CACHES.IMAGES, duration: CACHE_DURATIONS.IMAGES };
  }
  
  // APIs Supabase - Network First courte durée
  if (url.includes('supabase.co') || url.includes('/api/')) {
    return { strategy: 'networkFirst', cache: CACHES.API, duration: CACHE_DURATIONS.API };
  }
  
  // JS/CSS - Stale While Revalidate
  if (/\.(js|css)$/i.test(url) || url.includes('/assets/')) {
    return { strategy: 'staleWhileRevalidate', cache: CACHES.STATIC };
  }
  
  // HTML et autres - Cache dynamique
  return { strategy: 'staleWhileRevalidate', cache: CACHES.DYNAMIC };
};

// Gestionnaire principal des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Ignorer les requêtes cross-origin sauf Supabase
  if (url.origin !== self.location.origin && !url.hostname.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(
    (async () => {
      const { strategy, cache, duration } = getCacheStrategy(url.href);
      
      try {
        return await cacheStrategies[strategy](request, cache, duration);
      } catch (error) {
        console.warn(`[SW v2] Strategy ${strategy} failed:`, error);
        return fetch(request);
      }
    })()
  );
});

// Background Sync pour les données hors ligne
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Logique de synchronisation des données
      console.log('[SW v2] Background sync triggered')
    );
  }
});

// Notifications Push (infrastructure)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'cryptoboost-notification',
        requireInteraction: false,
        actions: data.actions || [],
      })
    );
  }
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow('/')
  );
});

// Métriques de performance
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log(`[SW v2] Service Worker loaded - Version ${CACHE_VERSION}`);