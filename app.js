// =================================================================
// Application Version
// =================================================================
const APP_VERSION = 'v.2.1.0'; // Cross-platform support

// =================================================================
// Environment Check
// =================================================================
// Electron(Node.js)環境で実行されているかを判定
const isElectron = (typeof require !== 'undefined');


// =================================================================
// HTML Element Acquisition
// =================================================================
// (変更なし)
const playerScreen = document.getElementById('player-screen');
const listScreen = document.getElementById('list-screen');
const settingsScreen = document.getElementById('settings-screen');
const mainSettingsView = document.getElementById('main-settings');
const detailSettingsView = document.getElementById('detail-settings');
const navPlayerButton = document.getElementById('nav-player');
const navListButton = document.getElementById('nav-list');
const navSettingsButton = document.getElementById('nav-settings');
const playerFolderName = document.getElementById('player-folder-name');
const playerArtwork = document.getElementById('player-artwork');
const playerSongName = document.getElementById('player-song-name');
const playerGameName = document.getElementById('player-game-name');
const durabilityModeButton = document.getElementById('durability-mode-button');
const durabilityOptions = document.getElementById('durability-options');
const listTreeViewContainer = document.getElementById('list-tree-view-container');
const listRandomButton = document.getElementById('list-random-button');
const fileInput = document.getElementById('fileInput');
const exportButton = document.getElementById('export-settings-button');
const importInput = document.getElementById('import-settings-input');
const gotoDetailSettingsButton = document.getElementById('goto-detail-settings-button');
const settingsTreeViewContainer = document.getElementById('settings-tree-view-container');
const backToMainSettingsButton = document.getElementById('back-to-main-settings-button');
const propertiesPanel = document.getElementById('properties-panel');
const propItemName = document.getElementById('prop-item-name');
const propDisplayName = document.getElementById('prop-display-name');
const propSortOrder = document.getElementById('prop-sort-order');
const songSpecificSettings = document.getElementById('song-specific-settings');
const propMultiplier = document.getElementById('prop-lottery-multiplier');
const folderSpecificSettings = document.getElementById('folder-specific-settings');
const propIsGame = document.getElementById('prop-is-game');
const savePropertiesButton = document.getElementById('save-properties-button');
const propLoopCompatible = document.getElementById('prop-loop-compatible');
const loopSettingsPanel = document.getElementById('loop-settings-panel');
const propLoopStart = document.getElementById('prop-loop-start');
const propLoopEnd = document.getElementById('prop-loop-end');
const propLoopStartAuto = document.getElementById('prop-loop-start-auto');
const propLoopEndAuto = document.getElementById('prop-loop-end-auto');
const audioPlayer = document.getElementById('audioPlayer');
const versionDisplay = document.getElementById('versionDisplay');
// ▼▼▼ 追加 ▼▼▼
const loopFeatureContainer = document.getElementById('loop-feature-container');

const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.innerHTML = '<div>データを処理中...</div>';
loadingOverlay.style.display = 'none';
document.body.appendChild(loadingOverlay);


// =================================================================
// Global Variables
// =================================================================
// (変更なし)
let libraryFiles = [];
let fileTree = {};
let selectedItemPath = null;
let isSelectedItemFolder = false;
let recentlyPlayed = [];
let songProperties = {};
let nextSongToPlay = null;
let activeRandomFolderPath = null;
let durabilityMode = { enabled: false, duration: 0 };
let currentLoopInfo = null;


// =================================================================
// Application Initialization
// =================================================================
window.addEventListener('load', async () => {
	console.log(`App loading... Environment: ${isElectron ? 'Electron' : 'Browser'}`);
	if (versionDisplay) {
		versionDisplay.textContent = APP_VERSION;
	}
    // ▼▼▼ 追加 ▼▼▼
    // ブラウザ環境の場合、Electron専用のUIを非表示にする
    if (!isElectron) {
        if (loopFeatureContainer) {
            loopFeatureContainer.style.display = 'none';
        }
    }
	await loadDataFromDB();
});


// =================================================================
// Event Listeners
// =================================================================
// (propLoopCompatibleのイベントリスナーはElectron環境でのみ意味を持つが、
// UIが非表示になるのでそのままでも問題ない)
// (変更なし)
navPlayerButton.addEventListener('click', () => switchScreen('player'));
navListButton.addEventListener('click', () => switchScreen('list'));
navSettingsButton.addEventListener('click', () => switchScreen('settings'));
gotoDetailSettingsButton.addEventListener('click', () => switchSettingsView('detail'));
backToMainSettingsButton.addEventListener('click', () => switchSettingsView('main'));
durabilityModeButton.addEventListener('click', () => {
    durabilityOptions.classList.toggle('hidden');
});
durabilityOptions.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const duration = parseInt(e.target.dataset.duration, 10);
        setDurabilityMode(duration);
    }
});
listRandomButton.addEventListener('click', handleRandomButton);
listTreeViewContainer.addEventListener('click', handleTreeClick);
settingsTreeViewContainer.addEventListener('click', handleTreeClick);
fileInput.addEventListener('change', handleFileInputChange);
savePropertiesButton.addEventListener('click', handleSaveProperties);
exportButton.addEventListener('click', handleExport);
importInput.addEventListener('change', handleImport);
propLoopCompatible.addEventListener('change', handleLoopCompatibleChange);
audioPlayer.addEventListener('ended', handleSongEnd);
audioPlayer.addEventListener('timeupdate', () => {
    updateMediaPosition();
    handleLooping();
});


// =================================================================
// Event Handler Functions
// =================================================================
// (変更なし)
async function handleFileInputChange(event) {
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
}

async function handleSaveProperties() {
	if (!selectedItemPath) return;
	const currentProps = songProperties[selectedItemPath] || {};
	currentProps.name = propDisplayName.value;
	currentProps.sortOrder = parseFloat(propSortOrder.value) || 0;
	if (isSelectedItemFolder) {
		currentProps.isGame = propIsGame.checked;
	} else {
		const parsedMultiplier = parseFloat(propMultiplier.value);
		currentProps.multiplier = !isNaN(parsedMultiplier) ? parsedMultiplier : 1.0;
        if (isElectron) { // Electron環境でのみループ設定を保存
            currentProps.isLoopCompatible = propLoopCompatible.checked;
            if (currentProps.isLoopCompatible) {
                currentProps.loopStartTime = timeStringToSeconds(propLoopStart.value);
                currentProps.loopEndTime = timeStringToSeconds(propLoopEnd.value);
            }
        }
	}
	songProperties[selectedItemPath] = currentProps;
	await saveProperties('songProperties', songProperties);
	const openFolderPaths = new Set();
	document.querySelectorAll('.tree-view .folder-item.open').forEach(folder => {
		openFolderPaths.add(folder.dataset.folderPath);
	});
	renderTreeView(openFolderPaths);
}

async function handleExport() {
	const propsToExport = await getProperties('songProperties');
	if (!propsToExport || Object.keys(propsToExport).length === 0) return;
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
}

function handleImport(event) {
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
}

async function handleLoopCompatibleChange(event) {
    // この関数はElectron環境でのみ意味を持つ
    if (!isElectron) return;

    const isChecked = event.target.checked;
    loopSettingsPanel.classList.toggle('hidden', !isChecked);
    if (isChecked && selectedItemPath) {
        const fileToAnalyze = findFileByPath(selectedItemPath);
        // Electronではfile.pathに物理パスが格納されている
        if (!fileToAnalyze || !fileToAnalyze.path) {
            alert('ファイルの物理パスが見つかりません。');
            return;
        }

        showLoading('ループ区間を自動計算中...');
        try {
            const { startTime, endTime } = await calculateLoopPoints(fileToAnalyze.path);
            propLoopStartAuto.textContent = formatTime(startTime);
            propLoopEndAuto.textContent = formatTime(endTime);
            propLoopStart.value = formatTime(startTime);
            propLoopEnd.value = formatTime(endTime);

            const props = songProperties[selectedItemPath] || {};
            props.autoLoopStartTime = startTime;
            props.autoLoopEndTime = endTime;
            songProperties[selectedItemPath] = props;

        } catch (error) {
            console.error("Loop calculation failed:", error);
            alert(`ループ区間の計算に失敗しました:\n${error}`);
            propLoopStartAuto.textContent = '計算失敗';
            propLoopEndAuto.textContent = '計算失敗';
        } finally {
            hideLoading();
        }
    }
}

// (他のイベントハンドラは変更なし)
function updateMediaPosition() {
    if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
        navigator.mediaSession.setPositionState({
            duration: audioPlayer.duration || 0,
            playbackRate: audioPlayer.playbackRate,
            position: audioPlayer.currentTime || 0,
        });
    }
}

function handleSongEnd() {
    currentLoopInfo = null;
    setTimeout(playNextSong, 800);
}


// =================================================================
// Core Functions
// =================================================================
// (playSong, playNextSong, handleRandomButton, handleSongSelect, handleFolderSelect, handleTreeClickは変更なし)
function handleTreeClick(event) {
    const target = event.target;
    const liElement = target.closest('li');
    if (!liElement) return;

    if (target.matches('.toggle-button')) {
        liElement.classList.toggle('open');
        target.textContent = liElement.classList.contains('open') ? '折り畳み' : '展開';
    } else if (target.closest('.item-content')) {
        if (liElement.matches('.folder-item')) {
            handleFolderSelect(liElement);
        } else if (liElement.matches('.file-item')) {
            handleSongSelect(liElement);
        }
    }
}

function handleFolderSelect(folderElement) {
    const folderPath = folderElement.dataset.folderPath;
    selectedItemPath = folderPath;
    isSelectedItemFolder = true;
    updateSelectionStyle(folderElement);
    showPropertiesPanel();
}

function handleSongSelect(songElement) {
    const filePath = songElement.dataset.filePath;
    selectedItemPath = filePath;
    isSelectedItemFolder = false;
    updateSelectionStyle(songElement);
    showPropertiesPanel();
}

function handleRandomButton() {
    if (!selectedItemPath) {
        playNextSong();
        return;
    }
    if (isSelectedItemFolder) {
        activeRandomFolderPath = selectedItemPath;
        nextSongToPlay = null;
        playNextSong();
    } else {
        const file = findFileByPath(selectedItemPath);
        if (file) {
            nextSongToPlay = file;
            if (audioPlayer.paused) playNextSong();
        }
    }
}

async function playSong(file) {
	if (!file) return;
    currentLoopInfo = null;
	recentlyPlayed.unshift(file.webkitRelativePath);
	if (recentlyPlayed.length > 200) recentlyPlayed.pop();
	await saveProperties('recentlyPlayed', recentlyPlayed);
	
    const objectURL = URL.createObjectURL(file);
	audioPlayer.src = objectURL;
    audioPlayer.onloadedmetadata = () => {
        startLoopPlaybackIfNeeded(file, audioPlayer.duration);
    };

	try {
		await audioPlayer.play();
	} catch (error) {
		console.error('Playback failed:', error);
	}
	const props = songProperties[file.webkitRelativePath] || {};
	const songDisplayName = (props.name && props.name.trim() !== '') ? props.name : (file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
	playerSongName.textContent = songDisplayName;
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
	playerGameName.textContent = gameName;
    if(activeRandomFolderPath) {
        const folderProps = songProperties[activeRandomFolderPath] || {};
        playerFolderName.textContent = folderProps.name || activeRandomFolderPath.split('/').pop();
    } else {
        playerFolderName.textContent = '全曲';
    }
	const svgIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='512' height='512'><rect width='24' height='24' fill='#7e57c2'/><path fill='white' d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/></svg>`;
	const artworkURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgIcon)}`;
    playerArtwork.src = artworkURL;
	if ('mediaSession' in navigator) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: songDisplayName,
			artist: gameName,
			album: '多機能ミュージックリスト',
			artwork: [ { src: artworkURL, sizes: '512x512', type: 'image/svg+xml' } ]
		});
		navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
		navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
		navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong());
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 5, 0);
		});
		try {
			navigator.mediaSession.setActionHandler('seekto', (details) => {
				audioPlayer.currentTime = details.seekTime;
			});
		} catch (error) { console.log('seekto action is not supported.'); }
	}
}

function playNextSong() {
    if (nextSongToPlay) {
        const props = songProperties[nextSongToPlay.webkitRelativePath] || {};
        if (durabilityMode.enabled && !props.isLoopCompatible) {
             return;
        }
        playSong(nextSongToPlay);
        nextSongToPlay = null;
        return;
    }
    if (!activeRandomFolderPath) {
        if (libraryFiles.length > 0) {
            const rootFolderName = libraryFiles[0].webkitRelativePath.split('/')[0];
            activeRandomFolderPath = rootFolderName;
        } else {
            return;
        }
    }
    let playlist = getPlaylist(activeRandomFolderPath);
    if (playlist.length === 0) return;
    
    if (durabilityMode.enabled) {
        playlist = playlist.filter(file => {
            const props = songProperties[file.webkitRelativePath] || {};
            return props.isLoopCompatible === true;
        });
    }

    if (playlist.length === 0) {
        console.log("耐久モード: ループ対応の曲がプレイリストにありません。");
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
        const multiplier = (typeof props.multiplier === 'number') ? props.multiplier : 1.0;
        const weight = multiplier * f;
        if (weight > 0) {
            weightedList.push({ file: file, weight: weight });
            totalWeight += weight;
        }
    }
    let songToPlay = null;
    if (weightedList.length > 0) {
        let randomValue = Math.random() * totalWeight;
        for (const item of weightedList) {
            randomValue -= item.weight;
            if (randomValue <= 0) {
                songToPlay = item.file;
                break;
            }
        }
    } else {
        const randomIndex = Math.floor(Math.random() * playlist.length);
        songToPlay = playlist[randomIndex];
    }
    playSong(songToPlay);
}

// =================================================================
// Durability Mode & Looping Functions
// =================================================================
// (変更なし)
function setDurabilityMode(durationInSeconds) {
    durabilityMode.enabled = durationInSeconds > 0;
    durabilityMode.duration = durationInSeconds;

    let buttonText = '耐久モード: ループなし';
    if (durabilityMode.enabled) {
        buttonText = `耐久モード: ${durationInSeconds / 60}分`;
    }
    durabilityModeButton.textContent = buttonText;
    durabilityOptions.classList.add('hidden');

    if (!audioPlayer.paused) {
        const currentFile = findFileByPath(audioPlayer.src);
        if(currentFile) {
            startLoopPlaybackIfNeeded(currentFile, audioPlayer.duration);
        }
    }
}

function startLoopPlaybackIfNeeded(file, totalDuration) {
    const props = songProperties[file.webkitRelativePath] || {};
    if (durabilityMode.enabled && props.isLoopCompatible) {
        const loopStartTime = props.loopStartTime || props.autoLoopStartTime || 0;
        const loopEndTime = props.loopEndTime || props.autoLoopEndTime || 0;

        if (loopEndTime <= loopStartTime || loopEndTime > totalDuration) {
            console.error("Invalid loop times. Disabling loop for this song.");
            currentLoopInfo = null;
            return;
        }

        const introDuration = loopStartTime;
        const loopDuration = loopEndTime - loopStartTime;
        const outroDuration = totalDuration - loopEndTime;

        if (loopDuration <= 0) {
             currentLoopInfo = null; return;
        }

        const remainingDuration = durabilityMode.duration - introDuration - outroDuration;
        const totalLoops = remainingDuration > 0 ? Math.ceil(remainingDuration / loopDuration) : 0;
        
        currentLoopInfo = {
            loopCount: 0,
            totalLoops: totalLoops,
            loopStartTime: loopStartTime,
            loopEndTime: loopEndTime,
        };
        console.log(`Looping enabled for ${file.name}. Total loops: ${totalLoops}`);

    } else {
        currentLoopInfo = null;
    }
}

function handleLooping() {
    if (!currentLoopInfo || audioPlayer.paused) {
        return;
    }

    if (currentLoopInfo.loopCount < currentLoopInfo.totalLoops) {
        if (audioPlayer.currentTime >= currentLoopInfo.loopEndTime) {
            currentLoopInfo.loopCount++;
            console.log(`Loop ${currentLoopInfo.loopCount} / ${currentLoopInfo.totalLoops}`);
            audioPlayer.currentTime = currentLoopInfo.loopStartTime;
        }
    }
}

function calculateLoopPoints(filePath) {
    // この関数はElectron環境でのみ呼び出される
    // Node.jsのモジュールをここで読み込む
    const { spawn } = require('child_process');
    const path = require('path');

    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'find_loop.py');
        const pyProcess = spawn('python', [scriptPath, filePath]);

        let result = '';
        let errorResult = '';

        pyProcess.stdout.on('data', (data) => { result += data.toString(); });
        pyProcess.stderr.on('data', (data) => { errorResult += data.toString(); });
        pyProcess.on('error', (error) => { reject(`プロセス開始エラー: ${error.message}`); });
        pyProcess.on('close', (code) => {
            if (errorResult) return reject(`Pythonスクリプトエラー:\n${errorResult}`);
            if (code !== 0) return reject(`Pythonスクリプトがエラーコード ${code} で終了しました。`);
            try {
                const jsonResult = JSON.parse(result);
                if (jsonResult.status === 'success') {
                    resolve(jsonResult);
                } else {
                    reject(jsonResult.message);
                }
            } catch (e) {
                reject(`PythonからのJSON出力の解析に失敗しました: ${e.message}`);
            }
        });
    });
}


// =================================================================
// Helper Functions
// =================================================================
// (変更なし)
function switchScreen(screenName) {
    [playerScreen, listScreen, settingsScreen].forEach(s => s.classList.remove('active'));
    [navPlayerButton, navListButton, navSettingsButton].forEach(b => b.classList.remove('active'));
    if (screenName === 'player') {
        playerScreen.classList.add('active');
        navPlayerButton.classList.add('active');
    } else if (screenName === 'list') {
        listScreen.classList.add('active');
        navListButton.classList.add('active');
    } else if (screenName === 'settings') {
        settingsScreen.classList.add('active');
        navSettingsButton.classList.add('active');
    }
}

function switchSettingsView(viewName) {
    if (viewName === 'detail') {
        mainSettingsView.classList.remove('active');
        detailSettingsView.classList.add('active');
    } else {
        detailSettingsView.classList.remove('active');
        mainSettingsView.classList.add('active');
    }
}

function renderTreeView(pathsToKeepOpen = null) {
    const treeHTML = createTreeViewHTML(fileTree);
    listTreeViewContainer.innerHTML = '';
    listTreeViewContainer.appendChild(treeHTML.cloneNode(true));
    settingsTreeViewContainer.innerHTML = '';
    settingsTreeViewContainer.appendChild(treeHTML);

    const applyOpenState = (container) => {
        if (pathsToKeepOpen) {
            container.querySelectorAll('.folder-item').forEach(folder => {
                if (pathsToKeepOpen.has(folder.dataset.folderPath)) {
                    folder.classList.add('open');
                }
            });
        }
    };
    applyOpenState(listTreeViewContainer);
    applyOpenState(settingsTreeViewContainer);
}

function createTreeViewHTML(node, currentPath = '') {
    const ul = document.createElement('ul');
    const items = Object.keys(node).map(key => {
        const path = currentPath ? `${currentPath}/${key}` : key;
        const props = songProperties[path] || {};
        return { key: key, sortOrder: props.sortOrder || 0, isFolder: !(node[key] instanceof File) };
    });
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const item of items) {
        const key = item.key;
        const value = node[key];
        const newPath = currentPath ? `${currentPath}/${key}` : key;
        const li = document.createElement('li');
        const props = songProperties[newPath] || {};
        let displayName = (props.name && props.name.trim() !== '') ? props.name : (item.isFolder ? key : (key.substring(0, key.lastIndexOf('.')) || key));
        
        const itemContainer = document.createElement('div');
        itemContainer.className = 'list-item-container';
        
        const itemContent = document.createElement('span');
        itemContent.className = 'item-content';
        
        if (item.isFolder) {
            li.classList.add('folder-item');
            li.dataset.folderPath = newPath;
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-icon';
            itemContent.appendChild(toggleIcon);
            itemContent.append(` 📁 ${displayName}`);
            const toggleButton = document.createElement('button');
            toggleButton.className = 'toggle-button';
            toggleButton.textContent = '展開';
            itemContainer.appendChild(itemContent);
            itemContainer.appendChild(toggleButton);
            li.appendChild(itemContainer);
            const subUl = createTreeViewHTML(value, newPath);
            li.appendChild(subUl);
        } else {
            li.classList.add('file-item');
            li.dataset.filePath = value.webkitRelativePath;
            itemContent.textContent = `🎵 ${displayName}`;
            itemContainer.appendChild(itemContent);
            li.appendChild(itemContainer);
        }
        ul.appendChild(li);
    }
    return ul;
}

function showPropertiesPanel() {
    if (!selectedItemPath || !detailSettingsView.classList.contains('active')) {
        propertiesPanel.style.display = 'none';
        return;
    }
    const props = songProperties[selectedItemPath] || {};
    propSortOrder.value = props.sortOrder || 0;
    if (isSelectedItemFolder) {
        propItemName.textContent = selectedItemPath.split('/').pop();
        propDisplayName.value = props.name || '';
        propIsGame.checked = props.isGame || false;
        songSpecificSettings.style.display = 'none';
        folderSpecificSettings.style.display = 'block';
    } else {
        const file = findFileByPath(selectedItemPath);
        if (!file) return;
        propItemName.textContent = file.name;
        propDisplayName.value = props.name || '';
        propMultiplier.value = (typeof props.multiplier === 'number') ? props.multiplier : 1.0;
        
        if (isElectron) {
            propLoopCompatible.checked = props.isLoopCompatible || false;
            loopSettingsPanel.classList.toggle('hidden', !props.isLoopCompatible);
            propLoopStart.value = formatTime(props.loopStartTime || props.autoLoopStartTime || 0);
            propLoopEnd.value = formatTime(props.loopEndTime || props.autoLoopEndTime || 0);
            propLoopStartAuto.textContent = formatTime(props.autoLoopStartTime || 0);
            propLoopEndAuto.textContent = formatTime(props.autoLoopEndTime || 0);
        }

        songSpecificSettings.style.display = 'block';
        folderSpecificSettings.style.display = 'none';
    }
    propertiesPanel.style.display = 'block';
}

function updateSelectionStyle(selectedElement) {
    document.querySelectorAll('.selected-item').forEach(el => el.classList.remove('selected-item'));
    if (selectedElement) {
        const path = selectedElement.dataset.folderPath || selectedElement.dataset.filePath;
        document.querySelectorAll(`li[data-folder-path="${path}"], li[data-file-path="${path}"]`).forEach(el => {
            el.classList.add('selected-item');
        });
    }
}

async function loadDataFromDB() {
	try {
		showLoading('ライブラリを読み込み中...');
		const songData = await getAllSongs();
		const props = await getProperties('songProperties');
		const recent = await getProperties('recentlyPlayed');
		if (songData && songData.length > 0) {
			const restoredFiles = songData.map(item => {
                const fileWithPaths = item.file;
                fileWithPaths.webkitRelativePath = item.path;
                // Electron環境でのみ物理パスを格納
                if (isElectron) {
                    fileWithPaths.path = item.diskPath;
                }
				return fileWithPaths;
			});
			libraryFiles = restoredFiles;
			songProperties = props || {};
			recentlyPlayed = recent || [];
			if (libraryFiles.length > 0) {
				const rootFolderName = libraryFiles[0].webkitRelativePath.split('/')[0];
				activeRandomFolderPath = rootFolderName;
			}
			fileTree = buildFileTree(libraryFiles);
			renderTreeView();
		}
	} catch (error) {
		console.error('Failed to load data from DB:', error);
	} finally {
		hideLoading();
	}
}

function getPlaylist(folderPath) {
    const targetPath = folderPath || activeRandomFolderPath;
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
        if (audioPlayer.src.startsWith('blob:') && audioPlayer.src === URL.createObjectURL(file)) {
            return file;
        }
    }
    return null;
}


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

function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds <= 0) return "--:--.---";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

function timeStringToSeconds(timeString) {
    if (!timeString || typeof timeString !== 'string') return 0;
    const parts = timeString.match(/(\d+):(\d+).(\d+)/);
    if (!parts) return 0;
    const [, minutes, seconds, milliseconds] = parts.map(Number);
    return minutes * 60 + seconds + milliseconds / 1000;
}

// ▼▼▼ 変更 ▼▼▼
// データベースに保存する際に、Electron環境であれば物理パスも保存する
async function saveSong(file) {
    const songRecord = {
        path: file.webkitRelativePath,
        diskPath: isElectron ? file.path : null, // Electronでのみ物理パスを保存
        file: file,
    };
    await db.songs.put(songRecord);
}