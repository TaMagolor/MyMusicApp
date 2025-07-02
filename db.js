// db.js - IndexedDB Helper Functions

const DB_NAME = 'musicAppDB';
const DB_VERSION = 1;
const SONGS_STORE_NAME = 'songs';
const PROPERTIES_STORE_NAME = 'properties';

let db;

/**
 * データベースを開く、または作成する
 * @returns {Promise<IDBDatabase>} データベースオブジェクトを返すPromise
 */
function openDB() {
	return new Promise((resolve, reject) => {
		if (db) {
			return resolve(db);
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = (event) => {
			console.error('Database error:', event.target.error);
			reject('Database error');
		};

		request.onsuccess = (event) => {
			db = event.target.result;
			console.log('Database opened successfully');
			resolve(db);
		};

		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains(SONGS_STORE_NAME)) {
				db.createObjectStore(SONGS_STORE_NAME, { keyPath: 'path' });
			}
			if (!db.objectStoreNames.contains(PROPERTIES_STORE_NAME)) {
				db.createObjectStore(PROPERTIES_STORE_NAME, { keyPath: 'key' });
			}
		};
	});
}

/**
 * 曲のデータとパスをデータベースに保存する
 * @param {File} file - 保存するファイルオブジェクト
 * @returns {Promise<void>}
 */
function saveSong(file) {
	return new Promise(async (resolve, reject) => {
		const db = await openDB();
		const transaction = db.transaction(SONGS_STORE_NAME, 'readwrite');
		const store = transaction.objectStore(SONGS_STORE_NAME);
		// ▼▼▼ 変更点：ファイルだけでなく、パス情報も一緒に保存する ▼▼▼
		const dataToStore = {
			path: file.webkitRelativePath,
			file: file
		};
		const request = store.put(dataToStore);

		request.onsuccess = () => resolve();
		request.onerror = (event) => reject('Error saving song: ' + event.target.error);
	});
}

/**
 * 全ての曲データ（パスとファイル）をデータベースから取得する
 * @returns {Promise<Array<{path: string, file: File}>>} パスとFileオブジェクトのペアの配列を返すPromise
 */
function getAllSongs() {
	return new Promise(async (resolve, reject) => {
		const db = await openDB();
		const transaction = db.transaction(SONGS_STORE_NAME, 'readonly');
		const store = transaction.objectStore(SONGS_STORE_NAME);
		const request = store.getAll();

		// ▼▼▼ 変更点：Fileオブジェクトだけでなく、保存したオブジェクト全体を返す ▼▼▼
		request.onsuccess = (event) => {
			resolve(event.target.result); // [{path: '...', file: File}, ...]
		};
		request.onerror = (event) => reject('Error fetching songs: ' + event.target.error);
	});
}

/**
 * プロパティ（設定）をデータベースに保存する
 * @param {string} key - 'songProperties' などのキー
 * @param {object} value - 保存する設定オブジェクト
 * @returns {Promise<void>}
 */
function saveProperties(key, value) {
	return new Promise(async (resolve, reject) => {
		const db = await openDB();
		const transaction = db.transaction(PROPERTIES_STORE_NAME, 'readwrite');
		const store = transaction.objectStore(PROPERTIES_STORE_NAME);
		const request = store.put({ key: key, value: value });

		request.onsuccess = () => resolve();
		request.onerror = (event) => reject('Error saving properties: ' + event.target.error);
	});
}

/**
 * プロパティ（設定）をデータベースから取得する
 * @param {string} key - 'songProperties' などのキー
 * @returns {Promise<object>} 設定オブジェクトを返すPromise
 */
function getProperties(key) {
	return new Promise(async (resolve, reject) => {
		const db = await openDB();
		const transaction = db.transaction(PROPERTIES_STORE_NAME, 'readonly');
		const store = transaction.objectStore(PROPERTIES_STORE_NAME);
		const request = store.get(key);

		request.onsuccess = (event) => {
			resolve(event.target.result ? event.target.result.value : null);
		};
		request.onerror = (event) => reject('Error fetching properties: ' + event.target.error);
	});
}
