const CACHE_NAME = 'rander-store-v1';

// تثبيت الـ Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// تفعيل وتحديث الـ Cache
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// استراتيجية التحميل: البحث في الذاكرة أولاً ثم الشبكة (Cache First for Images)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // إذا كان الطلب عبارة عن صورة
  if (request.destination === 'image' || request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // إذا كانت الصورة مخزنة سابقاً، اعرضها فوراً
          if (cachedResponse) {
            return cachedResponse;
          }
          // إذا لم تكن مخزنة، جلبها من الإنترنت ثم تخزينها مستقبلاً
          return fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // باقي الطلبات العادية
    event.respondWith(
      caches.match(request).then((response) => response || fetch(request))
    );
  }
});
