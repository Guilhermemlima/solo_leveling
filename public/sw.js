const CACHE = 'ascend-shell-v1'
const SHELL = ['/login', '/dashboard', '/tasks', '/offline', '/icon.svg']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).catch(() => undefined))
  self.skipWaiting()
})
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))))
  self.clients.claim()
})
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return
  event.respondWith(fetch(event.request).then(response => {
    const clone = response.clone()
    caches.open(CACHE).then(cache => cache.put(event.request, clone))
    return response
  }).catch(() => caches.match(event.request).then(hit => hit || caches.match('/offline'))))
})
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/tasks'))
})
