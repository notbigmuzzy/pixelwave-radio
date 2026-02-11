// Minimal Service Worker to satisfy PWA install requirements
self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	// No-op for now
});
