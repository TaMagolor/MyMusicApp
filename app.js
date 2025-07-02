// =================================================================
// HTML Element Acquisition
// HTML要素の取得
// =================================================================
const fileInput = document.getElementById('fileInput');
const treeViewContainer = document.getElementById('tree-view-container');
const audioPlayer = document.getElementById('audioPlayer');
const currentTrackTitle = document.getElementById('current-track-title');
const currentGameTitle = document.getElementById('current-game-title');
const randomButton = document.getElementById('start-random-button');
const exportButton = document.getElementById('export-settings-button');
const importInput = document.getElementById('import-settings-input');

// --- Unified Properties Panel Elements ---
// --- 統合されたプロパティパネルの要素 ---
const propertiesPanel = document.getElementById('properties-panel');
const propItemName = document.getElementById('prop-item-name');
const propDisplayName = document.getElementById('prop-display-name');
const propSortOrder = document.getElementById('prop-sort-order');
const songSpecificSettings = document.getElementById('song-specific-settings');
const propMultiplier = document.getElementById('prop-lottery-multiplier');
const folderSpecificSettings = document.getElementById('folder-specific-settings');
const propIsGame = document.getElementById('prop-is-game');
const savePropertiesButton = document.getElementById('save-properties-button');


// =================================================================
// Global Variables
// グローバル変数
// =================================================================
let libraryFiles = []; // 読み込んだ全ファイルのリスト (Fileオブジェクト)
let fileTree = {}; // ライブラリの階層構造データ
let selectedFolderPath = null; // UI上で選択されているフォルダのパス
let currentlyEditingPath = null; // プロパティパネルで編集中のアイテムのパス
let isEditingFolder = false; // 編集中のアイテムがフォルダかどうかのフラグ

let recentlyPlayed = []; // 再生履歴を保存する配列
let songProperties = {}; // ファイルとフォルダ両方の設定を保存するオブジェクト

// --- Seamless Switching Variables ---
// --- シームレス切替用の変数 ---
let nextSongToPlay = null; // 次に再生予約されている特定の曲(Fileオブジェクト)。フラグの役割も兼ねる。
let activeRandomFolderPath = null; // 現在進行中のランダム再生の対象フォルダパス


// =================================================================
// Event Listeners
// イベントリスナー
// =================================================================

// フォルダが選択された時に発火
fileInput.addEventListener('change', (event) => {
    libraryFiles = event.target.files;
    fileTree = buildFileTree(libraryFiles);
    // 新しいライブラリが読み込まれたら設定と履歴をリセット
    songProperties = {};
    recentlyPlayed = [];

    // activeRandomFolderPathをルートフォルダで初期化する
    if (libraryFiles.length > 0) {
        // 最初のファイルのパスからルートフォルダ名を取得
        const rootFolderName = libraryFiles[0].webkitRelativePath.split('/')[0];
        activeRandomFolderPath = rootFolderName;
        console.log(`Default random folder set to: ${activeRandomFolderPath}`);
    } else {
        activeRandomFolderPath = null;
    }
    
    renderTreeView();
});

// ライブラリのツリービューでのクリックを処理 (イベント委任)
treeViewContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('toggle')) {
        target.parentElement.classList.toggle('open');
        return;
    }
    const liElement = target.closest('li');
    if (liElement) {
        if (liElement.matches('.folder-item')) {
            handleFolderSelect(liElement);
        } else if (liElement.matches('.file-item')) {
            handleSongSelect(liElement);
        }
    }
});

// 「ランダム再生 / 再生予約」ボタン
randomButton.addEventListener('click', () => {
    const targetPath = currentlyEditingPath || activeRandomFolderPath;
    if (!targetPath) {
        console.warn('ライブラリからフォルダまたは曲を選択してください。');
        return;
    }

    if (isEditingFolder) {
        activeRandomFolderPath = targetPath;
        nextSongToPlay = null;
        
        if (audioPlayer.paused) {
            playNextSong();
        }
    } else {
        const file = findFileByPath(targetPath);
        if (file) {
            nextSongToPlay = file;
            if (audioPlayer.paused) {
                playNextSong();
            }
        }
    }
});

// 現在の曲の再生が終了したら次の曲へ
audioPlayer.addEventListener('ended', () => {
    setTimeout(playNextSong, 800);
});

// プロパティパネルの「設定を保存」ボタン
savePropertiesButton.addEventListener('click', () => {
    if (!currentlyEditingPath) return;
    const currentProps = songProperties[currentlyEditingPath] || {};

    currentProps.name = propDisplayName.value;
    currentProps.sortOrder = parseFloat(propSortOrder.value) || 0;

    if (isEditingFolder) {
        currentProps.isGame = propIsGame.checked;
    } else {
        currentProps.multiplier = parseFloat(propMultiplier.value) || 1.0;
    }

    songProperties[currentlyEditingPath] = currentProps;
    
    propertiesPanel.style.display = 'none';
    renderTreeView();
});

// 設定をJSONファイルにエクスポート
exportButton.addEventListener('click', () => {
    if (Object.keys(songProperties).length === 0) {
        return;
    }
    const settingsJSON = JSON.stringify(songProperties, null, 2);
    const blob = new Blob([settingsJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'music_app_settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 設定をJSONファイルからインポート
importInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedSettings = JSON.parse(e.target.result);
            songProperties = importedSettings;
            renderTreeView();
        } catch (error) {
            console.error('インポートエラー:', error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
});


// =================================================================
// Core Functions
// 主要な関数
// =================================================================

/** ツリービューでフォルダが選択された時の処理 */
function handleFolderSelect(folderElement) {
    const folderPath = folderElement.dataset.folderPath;
    currentlyEditingPath = folderPath;
    isEditingFolder = true;

    const currentSelected = document.querySelector('.selected-folder');
    if (currentSelected) currentSelected.classList.remove('selected-folder');
    folderElement.classList.add('selected-folder');
    selectedFolderPath = folderPath;

    propItemName.textContent = folderPath.split('/').pop();
    const props = songProperties[folderPath] || {};
    propDisplayName.value = props.name || '';
    propSortOrder.value = props.sortOrder || 0;
    propIsGame.checked = props.isGame || false;
    
    songSpecificSettings.style.display = 'none';
    folderSpecificSettings.style.display = 'block';
    propertiesPanel.style.display = 'block';
}

/** ツリービューで曲が選択された時の処理 */
function handleSongSelect(songElement) {
    const filePath = songElement.dataset.filePath;
    currentlyEditingPath = filePath;
    isEditingFolder = false;
    
    const file = findFileByPath(filePath);
    if (!file) return;
    propItemName.textContent = file.name;

    const props = songProperties[filePath] || {};
    propDisplayName.value = props.name || '';
    propSortOrder.value = props.sortOrder || 0;
    propMultiplier.value = props.multiplier || 1.0;
    
    songSpecificSettings.style.display = 'block';
    folderSpecificSettings.style.display = 'none';
    propertiesPanel.style.display = 'block';
}

/**
 * 次に再生すべき曲を判断し、再生を実行する司令塔となる関数
 */
function playNextSong() {
    if (nextSongToPlay) {
        playSong(nextSongToPlay);
        nextSongToPlay = null;
        return;
    }

    if (!activeRandomFolderPath) {
        console.log("ランダム再生の対象フォルダが設定されていません。");
        return;
    }

    let playlist = getPlaylist(activeRandomFolderPath);
    if (playlist.length === 0) {
        return;
    }

    const exclusionCount = Math.floor(Math.min(50, playlist.length / 2));
    const excludedPaths = recentlyPlayed.slice(0, exclusionCount);
    const weightedList = [];
    let totalWeight = 0;
    
    for (const file of playlist) {
        const filePath = file.webkitRelativePath;
        const f = excludedPaths.includes(filePath) ? 0 : 1;
        const props = songProperties[filePath] || {};
        const multiplier = props.multiplier || 1.0;
        const weight = multiplier * f;
        if (weight > 0) {
            weightedList.push({ file: file, weight: weight });
            totalWeight += weight;
        }
    }

    let songToPlay = null;
    if (totalWeight > 0) {
        let randomValue = Math.random() * totalWeight;
        for (const item of weightedList) {
            randomValue -= item.weight;
            if (randomValue <= 0) {
                songToPlay = item.file;
                break;
            }
        }
    } else {
        console.warn("全ての曲が除外対象でした。除外を無視して再生します。");
        const randomIndex = Math.floor(Math.random() * playlist.length);
        songToPlay = playlist[randomIndex];
    }
    
    playSong(songToPlay);
}

/** 指定された曲ファイルを再生し、再生履歴と「ゲーム」表示を更新する */
function playSong(file) {
    if (!file) return;

    recentlyPlayed.unshift(file.webkitRelativePath);
    if (recentlyPlayed.length > 200) recentlyPlayed.pop();

    const objectURL = URL.createObjectURL(file);
    audioPlayer.src = objectURL;
    audioPlayer.play();

    const props = songProperties[file.webkitRelativePath] || {};
    const songDisplayName = (props.name && props.name.trim() !== '') ? props.name : (file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
    currentTrackTitle.textContent = songDisplayName;

    let gameName = 'N/A';
    const pathParts = file.webkitRelativePath.split('/');
    for (let i = pathParts.length - 2; i >= 0; i--) {
        const parentPath = pathParts.slice(0, i + 1).join('/');
        const parentProps = songProperties[parentPath] || {};
        if (parentProps.isGame) {
            gameName = (parentProps.name && parentProps.name.trim() !== '') ? parentProps.name : pathParts[i];
            break;
        }
    }
    currentGameTitle.textContent = gameName;
}


// =================================================================
// Helper Functions
// ヘルパー関数
// =================================================================

/** ツリービュー全体をDOMに描画し、トップレベルフォルダを開く */
function renderTreeView() {
    treeViewContainer.innerHTML = ''; 
    const treeViewHTML = createTreeViewHTML(fileTree);
    treeViewContainer.appendChild(treeViewHTML);

    const topLevelFolders = treeViewContainer.querySelectorAll(':scope > ul > li.folder-item');
    topLevelFolders.forEach(folder => {
        folder.classList.add('open');
    });
}

/** ツリービューのHTMLリストを再帰的に構築し、トグルや表示名を設定する */
function createTreeViewHTML(node, currentPath = '') {
    const ul = document.createElement('ul');

    const items = Object.keys(node).map(key => {
        const path = currentPath ? `${currentPath}/${key}` : key;
        const props = songProperties[path] || {};
        return {
            key: key,
            sortOrder: props.sortOrder || 0,
            isFolder: !(node[key] instanceof File)
        };
    });

    items.sort((a, b) => a.sortOrder - b.sortOrder);

    for (const item of items) {
        const key = item.key;
        const value = node[key];
        const newPath = currentPath ? `${currentPath}/${key}` : key;
        const li = document.createElement('li');
        const props = songProperties[newPath] || {};
        
        let displayName;
        if (props.name && props.name.trim() !== '') {
            displayName = props.name;
        } else {
            displayName = item.isFolder ? key : (key.substring(0, key.lastIndexOf('.')) || key);
        }

        if (item.isFolder) {
            const toggle = document.createElement('span');
            toggle.classList.add('toggle');
            li.appendChild(toggle);
            const textNode = document.createTextNode(` 📁 ${displayName}`);
            li.appendChild(textNode);
            li.classList.add('folder-item');
            li.dataset.folderPath = newPath;
            const subUl = createTreeViewHTML(value, newPath);
            li.appendChild(subUl);
        } else {
            li.style.paddingLeft = '22px';
            li.textContent = `🎵 ${displayName}`;
            li.classList.add('file-item');
            li.dataset.filePath = value.webkitRelativePath;
        }
        ul.appendChild(li);
    }
    return ul;
}

/** 指定されたフォルダパスに基づいて現在のプレイリストを取得する */
function getPlaylist(folderPath) {
    const targetPath = folderPath || selectedFolderPath;
    if (targetPath) {
        const pathParts = targetPath.split('/');
        let targetNode = fileTree;
        for (const part of pathParts) {
            targetNode = targetNode ? targetNode[part] : undefined;
        }
        return targetNode ? getFilesFromNode(targetNode) : [];
    } else {
        return Array.from(libraryFiles);
    }
}

/** 指定されたノード以下の全てのFileオブジェクトを再帰的に収集する */
function getFilesFromNode(node) {
    let files = [];
    for (const key in node) {
        const value = node[key];
        if (value instanceof File) {
            files.push(value);
        } else {
            files = files.concat(getFilesFromNode(value));
        }
    }
    return files;
}

/** ファイルのフルパスからFileオブジェクトを見つける */
function findFileByPath(filePath) {
    for (const file of libraryFiles) {
        if (file.webkitRelativePath === filePath) {
            return file;
        }
    }
    return null;
}

/** フラットなFileListから階層的なfileTreeオブジェクトを構築する */
function buildFileTree(files) {
    const tree = {};
    for (const file of files) {
        const pathParts = file.webkitRelativePath.split('/');
        let currentLevel = tree;
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (i < pathParts.length - 1) { // ディレクトリの場合
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                currentLevel = currentLevel[part];
            } else { // ファイルの場合
                currentLevel[part] = file;
            }
        }
    }
    return tree;
}



if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(error => {
            console.log('ServiceWorker registration failed: ', error);
        });
    });
}
