const CACHE_NAME = 'store-cache-v1';

// قائمة الملفات الأساسية التي يتم تخزينها عند تثبيت الـ Service Worker
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js'
  // أضف هنا مسارات الصور أو الملفات الهامة الأخرى مثل: '/images/logo.png'
];

// 1. حدث التثبيت: حفظ الملفات الأساسية في الـ Cache والتفعيل المباشر
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. حدث التفعيل: الاستحواذ على المتصفح وتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
    ])
  );
});

// 3. حدث Fetch: جلب الملف من الكاش أولاً، وإذا لم يوجد يجيبه من الشبكة
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات التي ليست من نوع GET (مثل طلبات POST أو WhatsApp)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // عدم تخزين الطلبات الخارجية أو الفاشلة
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // نسخ الاستجابة وتخزينها للمرات القادمة
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
