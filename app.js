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

// --- Properties Panel Elements ---
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
let libraryFiles = [];
let fileTree = {};
let selectedFolderPath = null;
let currentlyEditingPath = null;
let isEditingFolder = false;
let recentlyPlayed = [];
let songProperties = {};
let nextSongToPlay = null;
let activeRandomFolderPath = null;


// =================================================================
// Application Initialization
// アプリケーションの初期化
// =================================================================
window.addEventListener('load', async () => {
	console.log('App loading...');
	await loadDataFromDB();
});

/**
 * データベースから曲と設定を読み込み、ライブラリを構築する
 */
async function loadDataFromDB() {
	try {
		showLoading('ライブラリを読み込み中...');
		const songs = await getAllSongs();
		const props = await getProperties('songProperties');
		const recent = await getProperties('recentlyPlayed');

		if (songs && songs.length > 0) {
			libraryFiles = songs;
			songProperties = props || {};
			recentlyPlayed = recent || [];
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
		// インポート完了後、DBから再読み込みして画面を更新
		await loadDataFromDB();
	} catch (error) {
		console.error('Error during import:', error);
	} finally {
		hideLoading();
	}
});

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
	renderTreeView();
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

// (他のイベントリスナーは変更なし)
treeViewContainer.addEventListener('click', (event) => { /* ... */ });
randomButton.addEventListener('click', () => { /* ... */ });
audioPlayer.addEventListener('ended', () => { setTimeout(playNextSong, 800); });


// =================================================================
// Core Functions
// =================================================================

/** 曲を再生し、再生履歴をDBに保存する */
async function playSong(file) {
	if (!file) return;

	recentlyPlayed.unshift(file.webkitRelativePath);
	if (recentlyPlayed.length > 200) recentlyPlayed.pop();
	await saveProperties('recentlyPlayed', recentlyPlayed); // 履歴をDBに保存

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

// (他のCore/Helper関数は、データの取得元がメモリ上の変数になったため、変更は軽微または不要)
// ...

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
// (ここより下は、前回のコードから変更のない関数群です)
// =================================================================

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

function renderTreeView() {
    treeViewContainer.innerHTML = ''; 
    const treeViewHTML = createTreeViewHTML(fileTree);
    treeViewContainer.appendChild(treeViewHTML);

    const topLevelFolders = treeViewContainer.querySelectorAll(':scope > ul > li.folder-item');
    topLevelFolders.forEach(folder => {
        folder.classList.add('open');
    });
}

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

function findFileByPath(filePath) {
    for (const file of libraryFiles) {
        if (file.webkitRelativePath === filePath) {
            return file;
        }
    }
    return null;
}

function buildFileTree(files) {
    const tree = {};
    for (const file of files) {
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
