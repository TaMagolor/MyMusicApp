// db.js

// 'mymusicapp_db' という名前でデータベースを定義
const db = new Dexie('mymusicapp_db');

// データベースの構造（テーブルとインデックス）を定義
// ▼▼▼ version(1) から version(2) へ更新 ▼▼▼
db.version(2).stores({
    // 'songs' テーブル
    // 'path' (webkitRelativePath) を主キー（ユニークなID）とする
    songs: 'path',

    // 'properties' テーブル
    // 'key' (設定名) を主キーとする
    properties: 'key',

    // ▼▼▼ 以下を新しく追加 ▼▼▼
    // 'artworks' テーブル
    // 'path' (フォルダのパス) を主キーとする
    artworks: 'path'
});

// version(1)は変更なし
db.version(1).stores({
    songs: 'path, diskPath',
    properties: 'key'
});


// --- 全ての曲を取得 ---
async function getAllSongs() {
    // toArray() でテーブル内の全レコードを配列として取得
    return await db.songs.toArray();
}

// --- 設定の保存 ---
async function saveProperties(key, value) {
    await db.properties.put({ key: key, value: value });
}

// --- 設定の取得 ---
async function getProperties(key) {
    const prop = await db.properties.get(key);
    // データが存在すれば value を、なければ null を返す
    return prop ? prop.value : null;
}