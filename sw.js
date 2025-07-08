// ▼▼▼ バージョン番号を管理する新しい定数 ▼▼▼
const CACHE_NAME = 'music-app-cache-v6'; // 更新のたびにここのバージョンを変える
const urlsToCache = [
	'/',
	'/index.html',
	'/style.css',
	'/app.js',
	'/db.js',
	'/manifest.json'
	// アイコンファイルを追加したらここにも追記
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

// ▼▼▼ 古いキャッシュを削除する新しい処理を追加 ▼▼▼
// 新しいService Workerが有効化されたときに発火
self.addEventListener('activate', (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					// ホワイトリストにないキャッシュ（＝古いキャッシュ）を削除
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
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
