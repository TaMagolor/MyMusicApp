// キャッシュするファイルの一覧
const CACHE_NAME = 'music-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js'
];

// インストール時にキャッシュを作成する
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// リクエストがあった場合にキャッシュから返す
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにあればそれを返す、なければネットワークから取得
                return response || fetch(event.request);
            })
    );
});
