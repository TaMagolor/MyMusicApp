// =================================================================
// Application Version
// =================================================================
const APP_VERSION = 'v.0.6.9';

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
const versionDisplay = document.getElementById('versionDisplay');

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

// --- Loading Overlay ---
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.innerHTML = '<div>データを処理中...</div>';
loadingOverlay.style.display = 'none'; // 初期状態は非表示
document.body.appendChild(loadingOverlay);


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
// Application Initialization
// アプリケーションの初期化
// =================================================================
window.addEventListener('load', async () => {
	console.log('App loading...');
    if (versionDisplay) {
        versionDisplay.textContent = APP_VERSION;
    }
	await loadDataFromDB();
});

/**
 * データベースから曲と設定を読み込み、ライブラリを構築する
 */
async function loadDataFromDB() {
	try {
		showLoading('ライブラリを読み込み中...');
		const songData = await getAllSongs();
		const props = await getProperties('songProperties');
		const recent = await getProperties('recentlyPlayed');

		if (songData && songData.length > 0) {
			// Fileオブジェクトに失われたパス情報を復元する
			const restoredFiles = songData.map(item => {
				try {
					Object.defineProperty(item.file, 'webkitRelativePath', {
						value: item.path,
						writable: true,
						configurable: true
					});
				} catch (e) {
					item.file.webkitRelativePath = item.path;
				}
				return item.file;
			});

			libraryFiles = restoredFiles;
			songProperties = props || {};
			recentlyPlayed = recent || [];

            if (libraryFiles.length > 0) {
				const rootFolderName = libraryFiles[0].webkitRelativePath.split('/')[0];
				activeRandomFolderPath = rootFolderName;
				console.log(`Default random folder set to: ${activeRandomFolderPath}`);
			}
			
			fileTree = buildFileTree(libraryFiles);
			renderTreeView();
			console.log(`${libraryFiles.length} songs loaded from DB.`);
		} else {
			console.log('No songs found in DB. Please import a folder.');
		}
	} catch (error) {
		console.error('Failed to load data from DB:', error);
	} finally {
		hideLoading();
	}
}


// =================================================================
// Event Listeners
// イベントリスナー
// =================================================================

// フォルダ選択時、DBに曲を保存する
fileInput.addEventListener('change', async (event) => {
	const files = Array.from(event.target.files);
	if (files.length === 0) return;

	showLoading(`インポート中: 0 / ${files.length} 曲`);
	try {
		for (let i = 0; i < files.length; i++) {
			await saveSong(files[i]);
			if ((i + 1) % 10 === 0 || i === files.length - 1) {
				updateLoadingMessage(`インポート中: ${i + 1} / ${files.length} 曲`);
			}
		}
		await loadDataFromDB();
	} catch (error) {
		console.error('Error during import:', error);
	} finally {
		hideLoading();
	}
});

// ライブラリのクリックイベント
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
	if (currentlyEditingPath && !isEditingFolder) {
		const file = findFileByPath(currentlyEditingPath);
		if (file) {
			nextSongToPlay = file;
			if (audioPlayer.paused) {
				playNextSong();
			}
		}
		return;
	}

	if (currentlyEditingPath && isEditingFolder) {
		activeRandomFolderPath = currentlyEditingPath;
	}

	nextSongToPlay = null;
	playNextSong();
});

// 曲の再生終了時
audioPlayer.addEventListener('ended', () => { setTimeout(playNextSong, 800); });

// 設定保存時、DBにプロパティを保存する
savePropertiesButton.addEventListener('click', async () => {
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
	
	await saveProperties('songProperties', songProperties);

	propertiesPanel.style.display = 'none';

    const openFolderPaths = new Set();
	document.querySelectorAll('.folder-item.open').forEach(folder => {
		openFolderPaths.add(folder.dataset.folderPath);
	});

	renderTreeView(openFolderPaths);
});

// 設定エクスポート時、DBからプロパティを取得する
exportButton.addEventListener('click', async () => {
	const propsToExport = await getProperties('songProperties');
	if (!propsToExport || Object.keys(propsToExport).length === 0) {
		return;
	}
	const settingsJSON = JSON.stringify(propsToExport, null, 2);
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

// 設定インポート時、DBにプロパティを保存する
importInput.addEventListener('change', (event) => {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = async (e) => {
		try {
			const importedSettings = JSON.parse(e.target.result);
			await saveProperties('songProperties', importedSettings);
			await loadDataFromDB();
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
        if (libraryFiles.length > 0) {
            const rootFolderName = libraryFiles[0].webkitRelativePath.split('/')[0];
            activeRandomFolderPath = rootFolderName;
        } else {
            console.log("ライブラリに曲がありません。");
            return;
        }
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

/** 指定された曲ファイルを再生し、再生履歴とOSのメディア情報を更新する */
async function playSong(file) {
	if (!file) return;

	recentlyPlayed.unshift(file.webkitRelativePath);
	if (recentlyPlayed.length > 200) recentlyPlayed.pop();
	await saveProperties('recentlyPlayed', recentlyPlayed);

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

	if ('mediaSession' in navigator) {
		const svgIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='512' height='512'><rect width='24' height='24' fill='#7e57c2'/><path fill='white' d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/></svg>`;
		const artworkURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgIcon)}`;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: songDisplayName,
			artist: gameName,
			album: '多機能ミュージックリスト',
			artwork: [
				{ src: artworkURL, sizes: '512x512', type: 'image/svg+xml' },
			]
		});

		navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
		navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
		navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong());
		
		// 「前の曲へ(previoustrack)」ボタンの動作を「5秒戻し」に割り当てる
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 5, 0);
		});

		// 再生バーのスライド（シーク）操作のハンドラ
		try {
			navigator.mediaSession.setActionHandler('seekto', (details) => {
				if (details.fastSeek && 'fastSeek' in audioPlayer) {
					audioPlayer.fastSeek(details.seekTime);
				} else {
					audioPlayer.currentTime = details.seekTime;
				}
			});
		} catch (error) {
			console.log('seekto action is not supported.');
		}
	}
}


// =================================================================
// UI Feedback Functions
// =================================================================
function showLoading(message) {
	loadingOverlay.querySelector('div').textContent = message;
	loadingOverlay.style.display = 'flex';
}
function updateLoadingMessage(message) {
	loadingOverlay.querySelector('div').textContent = message;
}
function hideLoading() {
	loadingOverlay.style.display = 'none';
}


// =================================================================
// Helper Functions
// ヘルパー関数
// =================================================================

/** ツリービュー全体をDOMに描画し、トップレベルフォルダを開く */
function renderTreeView(pathsToKeepOpen = null) {
    treeViewContainer.innerHTML = ''; 
    const treeViewHTML = createTreeViewHTML(fileTree);
    treeViewContainer.appendChild(treeViewHTML);

    if (pathsToKeepOpen) {
        // 指定されたパスのフォルダを開く
        document.querySelectorAll('.folder-item').forEach(folder => {
            if (pathsToKeepOpen.has(folder.dataset.folderPath)) {
                folder.classList.add('open');
            }
        });
    } else {
        // デフォルトの動作：トップレベルのフォルダだけを開く
        const topLevelFolders = treeViewContainer.querySelectorAll(':scope > ul > li.folder-item');
        topLevelFolders.forEach(folder => {
            folder.classList.add('open');
        });
    }
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
        if (!file.webkitRelativePath) continue;
        const pathParts = file.webkitRelativePath.split('/');
        let currentLevel = tree;
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (i < pathParts.length - 1) {
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                currentLevel = currentLevel[part];
            } else {
                currentLevel[part] = file;
            }
        }
    }
    return tree;
}
