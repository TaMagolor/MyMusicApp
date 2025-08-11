// main.js
const { app, BrowserWindow } = require('electron');
const path =require('path');

function createWindow () {
    // ブラウザウィンドウを作成します。
    const mainWindow = new BrowserWindow({
        width: 1200, // アプリの横幅
        height: 800, // アプリの高さ
        webPreferences: {
            // この設定により、index.htmlから読み込まれるapp.js内で
            // Node.jsの機能（'require'など）が使えるようになります。
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // index.htmlをウィンドウに読み込みます。
    mainWindow.loadFile('index.html');

    // デベロッパーツールを開きたい場合は、以下のコメントを外します。
    // mainWindow.webContents.openDevTools();
}

// Electronの初期化が完了し、ブラウザウィンドウを作成する準備ができた際に呼ばれます。
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // macOSで、ドックアイコンがクリックされ、他に開いているウィンドウがない場合にウィンドウを再作成します。
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 全てのウィンドウが閉じた時にアプリを終了します。
app.on('window-all-closed', () => {
    // macOS以外では、全てのウィンドウが閉じたらアプリを終了するのが一般的です。
    if (process.platform !== 'darwin') {
        app.quit();
    }
});