// Service Worker PWA "105 ans de Kaolack" - Version améliorée
const CACHE_NAME = 'kaolack-105-v2';
const STATIC_CACHE = 'kaolack-static-v2';
const API_CACHE = 'kaolack-api-v2';

// URLs à mettre en cache (statique)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png'
];

// Installation avec gestion d'erreurs
self.addEventListener('install', function(event) {
  console.log('📦 Installation du Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('✅ Cache statique ouvert');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(function(error) {
        console.error('❌ Erreur lors du cache:', error);
      })
  );
});

// Activation avec nettoyage des anciens caches
self.addEventListener('activate', function(event) {
  console.log('🔄 Activation du Service Worker...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('🗑️ Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie de cache intelligente
self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Stratégie pour les assets statiques (Cache First)
  if (url.origin === self.location.origin && 
      (request.destination === 'script' || 
       request.destination === 'style' || 
       request.destination === 'image' ||
       request.destination === 'font')) {
    
    event.respondWith(
      caches.match(request)
        .then(function(response) {
          if (response) {
            return response;
          }
          
          // Si pas en cache, fetcher et mettre en cache
          return fetch(request)
            .then(function(response) {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE)
                .then(function(cache) {
                  cache.put(request, responseToCache);
                });
              
              return response;
            })
            .catch(function() {
              // Fallback pour les images
              if (request.destination === 'image') {
                return new Response('', {status: 404});
              }
            });
        })
    );
    return;
  }
  
  // Stratégie pour l'API (Network First)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          if (!response || response.status !== 200) {
            return caches.match(request);
          }
          
          const responseToCache = response.clone();
          caches.open(API_CACHE)
            .then(function(cache) {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(function() {
          return caches.match(request);
        })
    );
    return;
  }
  
  // Stratégie pour les pages HTML (Network First avec fallback)
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE)
            .then(function(cache) {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(function() {
          return caches.match(request) || caches.match('/');
        })
    );
    return;
  }
  
  // Pour les autres requêtes, essayer le cache d'abord
  event.respondWith(
    caches.match(request)
      .then(function(response) {
        return response || fetch(request);
      })
  );
});

// Gestion des erreurs
self.addEventListener('error', function(event) {
  console.error('❌ Erreur Service Worker:', event.error);
});

// Gestion des messages (pour la communication avec l'app)
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Écouteur d'installation PWA
self.addEventListener('beforeinstallprompt', function(event) {
  console.log('📱 L\'application peut être installée !');
  // Stocker l'événement pour l'utiliser plus tard
  self.deferredPrompt = event;
  return false;
});