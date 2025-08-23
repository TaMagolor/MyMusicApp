// =================================================================
// Application Version
// =================================================================
const APP_VERSION = 'v.3.2.0'; // Added Crossfade for Durability Mode

// =================================================================
// HTML Element Acquisition
// =================================================================
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
const audioPlayer = document.getElementById('audioPlayer');
const versionDisplay = document.getElementById('versionDisplay');
const loopFeatureContainer = document.getElementById('loop-feature-container');
const propLoopCompatible = document.getElementById('prop-loop-compatible');
const loopSettingsPanel = document.getElementById('loop-settings-panel');
const loopLockContainer = document.getElementById('loop-lock-container');
const propLoopTimeLocked = document.getElementById('prop-loop-time-locked');
const propLoopStart = document.getElementById('prop-loop-start');
const propLoopEnd = document.getElementById('prop-loop-end');
const propLoopStartAuto = document.getElementById('prop-loop-start-auto');
const propLoopEndAuto = document.getElementById('prop-loop-end-auto');

const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.innerHTML = '<div>データを処理中...</div>';
loadingOverlay.style.display = 'none';
document.body.appendChild(loadingOverlay);

// =================================================================
// Global Variables
// =================================================================
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
// Crossfade Audio System Variables
// =================================================================
let audioContext;
let crossfadePlayer; // The second audio element for crossfading
let sourceMain, sourceCrossfade;
let gainMain, gainCrossfade;
let activePlayer, standbyPlayer;
let activeGain, standbyGain;
let loopCheckInterval = null;
let isCrossfading = false;
const CROSSFADE_DURATION = 1.0; // 1 second crossfade duration

// =================================================================
// Application Initialization
// =================================================================
window.addEventListener('load', async () => {
	console.log('App loading... Pure Web App');
	if (versionDisplay) {
		versionDisplay.textContent = APP_VERSION;
	}
    initializeAudioSystem(); // Initialize the audio system for crossfading
	await loadDataFromDB();
});

// =================================================================
// Event Listeners
// =================================================================
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
audioPlayer.addEventListener('ended', handleSongEnd);
audioPlayer.addEventListener('timeupdate', updateMediaPosition); // Loop handling is now separate
propLoopCompatible.addEventListener('change', handleLoopCompatibleChange);

// =================================================================
// Event Handler Functions
// =================================================================
async function handleFileInputChange(event) {
    if (!db || !db.songs) {
        alert('データベースが準備できていません。');
        return;
    }
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    showLoading(`インポート中: 0 / ${files.length} 曲`);
    try {
        await db.songs.clear();
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const songRecord = {
                path: file.webkitRelativePath,
                file: file,
            };
            await db.songs.put(songRecord);
            if ((i + 1) % 10 === 0 || i === files.length - 1) {
                updateLoadingMessage(`インポート中: ${i + 1} / ${files.length} 曲`);
            }
        }
        await loadDataFromDB();
    } catch (error) {
        console.error('Error during import:', error);
        alert(`ファイルのインポート中にエラーが発生しました: ${error.message}`);
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
        
        currentProps.isLoopCompatible = propLoopCompatible.checked;
        if (currentProps.isLoopCompatible) {
            currentProps.isLoopTimeLocked = propLoopTimeLocked.checked;
            currentProps.loopStartTime = timeStringToSeconds(propLoopStart.value);
            currentProps.loopEndTime = timeStringToSeconds(propLoopEnd.value);
        } else {
            delete currentProps.isLoopTimeLocked;
            delete currentProps.loopStartTime;
            delete currentProps.loopEndTime;
            delete currentProps.autoLoopStartTime;
            delete currentProps.autoLoopEndTime;
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
	a.download = 'setting.json';
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
            for (const path in importedSettings) {
                const props = importedSettings[path];
                if (props.isLoopCompatible === true && props.isLoopTimeLocked === false) {
                    if (props.autoLoopStartTime != null && props.autoLoopEndTime != null) {
                        props.loopStartTime = props.autoLoopStartTime;
                        props.loopEndTime = props.autoLoopEndTime;
                    }
                }
            }
			await saveProperties('songProperties', importedSettings);
			await loadDataFromDB();
		} catch (error) {
			console.error('インポートエラー:', error);
            alert(`設定のインポートに失敗しました: ${error.message}`);
		}
	};
	reader.readAsText(file);
	event.target.value = '';
}

function handleLoopCompatibleChange() {
    const isChecked = propLoopCompatible.checked;
    loopLockContainer.classList.toggle('hidden', !isChecked);
    loopSettingsPanel.classList.toggle('hidden', !isChecked);
    if (isChecked && !propLoopStart.value) {
        const songRecord = findFileByPath(selectedItemPath);
        if (songRecord) {
            const tempAudio = document.createElement('audio');
            tempAudio.preload = 'metadata';
            tempAudio.src = URL.createObjectURL(songRecord.file);
            tempAudio.addEventListener('loadedmetadata', () => {
                propLoopStart.value = formatTime(0);
                propLoopEnd.value = formatTime(tempAudio.duration);
                propLoopStartAuto.textContent = '--:--.---';
                propLoopEndAuto.textContent = '--:--.---';
                URL.revokeObjectURL(tempAudio.src);
            });
        }
    }
}

function updateMediaPosition() {
    if ('mediaSession' in navigator && navigator.mediaSession.metadata && activePlayer) {
        navigator.mediaSession.setPositionState({
            duration: activePlayer.duration || 0,
            playbackRate: activePlayer.playbackRate,
            position: activePlayer.currentTime || 0,
        });
    }
}

function handleSongEnd(event) {
    // Ignore the 'ended' event if it's not from the active player
    // This prevents the fading-out player from triggering the next song
    if (event && event.target !== activePlayer) {
        return;
    }
    if (loopCheckInterval) {
        clearInterval(loopCheckInterval);
        loopCheckInterval = null;
    }
    isCrossfading = false;
    setTimeout(playNextSong, 800);
}

// =================================================================
// Core Functions
// =================================================================
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
            const songRecord = findFileByPath(liElement.dataset.filePath);
            if (songRecord) {
                handleSongSelect(liElement, songRecord);
            }
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

function handleSongSelect(songElement, songRecord) {
    selectedItemPath = songRecord.path;
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
        const songRecord = findFileByPath(selectedItemPath);
        if (songRecord) {
            nextSongToPlay = songRecord;
            if (activePlayer.paused) playNextSong();
        }
    }
}

async function playSong(songRecord) {
	if (!songRecord) return;

    // Stop any ongoing loop checks and reset state
    if (loopCheckInterval) {
        clearInterval(loopCheckInterval);
        loopCheckInterval = null;
    }
    isCrossfading = false;
    standbyPlayer.pause();
    standbyPlayer.src = '';
    
    // Reset volumes using Web Audio API if available
    if (audioContext) {
        activeGain.gain.cancelScheduledValues(audioContext.currentTime);
        standbyGain.gain.cancelScheduledValues(audioContext.currentTime);
        activeGain.gain.setValueAtTime(1, audioContext.currentTime);
        standbyGain.gain.setValueAtTime(0, audioContext.currentTime);
    }

    const file = songRecord.file;
    const props = songProperties[songRecord.path] || {};
	recentlyPlayed.unshift(songRecord.path);
	if (recentlyPlayed.length > 200) recentlyPlayed.pop();
	await saveProperties('recentlyPlayed', recentlyPlayed);
	
    currentLoopInfo = null;
    if (props.isLoopCompatible && props.loopEndTime > 0) {
        currentLoopInfo = {
            loopStartTime: props.loopStartTime || 0,
            loopEndTime: props.loopEndTime
        };
    }
    
    const objectURL = URL.createObjectURL(file);
	activePlayer.src = objectURL;

	try {
		await activePlayer.play();
        if (durabilityMode.enabled && currentLoopInfo) {
            startLoopMonitoring();
        }
	} catch (error) {
		console.error('Playback failed:', error);
	}

	const songDisplayName = (props.name && props.name.trim() !== '') ? props.name : (file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
	playerSongName.textContent = songDisplayName;
	let gameName = 'N/A';
	const pathParts = songRecord.path.split('/');
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
        const rootFolderName = (libraryFiles.length > 0) ? libraryFiles[0].path.split('/')[0] : 'フォルダ未選択';
        playerFolderName.textContent = rootFolderName;
    }
	const svgIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='512' height='512'><rect width='24' height='24' fill='#7e57c2'/><path fill='white' d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/></svg>`;
	const artworkURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgIcon)}`;
    playerArtwork.src = artworkURL;

	if ('mediaSession' in navigator) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: songDisplayName, artist: gameName, album: '多機能ミュージックリスト',
			artwork: [ { src: artworkURL, sizes: '512x512', type: 'image/svg+xml' } ]
		});
		navigator.mediaSession.setActionHandler('play', () => {
            activePlayer.play();
            if (durabilityMode.enabled && currentLoopInfo && !isCrossfading) {
                startLoopMonitoring();
            }
        });
		navigator.mediaSession.setActionHandler('pause', () => {
            activePlayer.pause();
            if (loopCheckInterval) clearInterval(loopCheckInterval);
        });
		navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong());
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			activePlayer.currentTime = Math.max(activePlayer.currentTime - 5, 0);
		});
		try {
			navigator.mediaSession.setActionHandler('seekto', (details) => { activePlayer.currentTime = details.seekTime; });
		} catch (error) { console.log('seekto action is not supported.'); }
	}
}

function playNextSong() {
    if (nextSongToPlay) {
        playSong(nextSongToPlay);
        nextSongToPlay = null;
        return;
    }
    if (!activeRandomFolderPath) {
        if (libraryFiles.length > 0) {
            const rootFolderName = libraryFiles[0].path.split('/')[0];
            activeRandomFolderPath = rootFolderName;
        } else { return; }
    }
    let playlist = getPlaylist(activeRandomFolderPath);
    if (playlist.length === 0) return;
    
    const exclusionCount = Math.floor(Math.min(50, playlist.length / 2));
    const excludedPaths = recentlyPlayed.slice(0, exclusionCount);
    const weightedList = [];
    let totalWeight = 0;
    for (const record of playlist) {
        const filePath = record.path;
        const f = excludedPaths.includes(filePath) ? 0 : 1;
        const props = songProperties[filePath] || {};
        const multiplier = (typeof props.multiplier === 'number') ? props.multiplier : 1.0;
        const weight = multiplier * f;
        if (weight > 0) {
            weightedList.push({ record: record, weight: weight });
            totalWeight += weight;
        }
    }
    let songToPlay = null;
    if (weightedList.length > 0) {
        let randomValue = Math.random() * totalWeight;
        for (const item of weightedList) {
            randomValue -= item.weight;
            if (randomValue <= 0) {
                songToPlay = item.record;
                break;
            }
        }
    } else if (playlist.length > 0) {
        const randomIndex = Math.floor(Math.random() * playlist.length);
        songToPlay = playlist[randomIndex];
    }
    playSong(songToPlay);
}


function setDurabilityMode(durationInSeconds) {
    durabilityMode.enabled = durationInSeconds > 0;
    durabilityMode.duration = durationInSeconds;
    let buttonText = '耐久モード: ループなし';
    if (durabilityMode.enabled) {
        buttonText = `耐久モード: ${durationInSeconds / 60}分`;
    }
    durabilityModeButton.textContent = buttonText;
    durabilityOptions.classList.add('hidden');

    // Start or stop loop monitoring based on the new mode
    if (durabilityMode.enabled && currentLoopInfo && !activePlayer.paused) {
        startLoopMonitoring();
    } else if (!durabilityMode.enabled && loopCheckInterval) {
        clearInterval(loopCheckInterval);
        loopCheckInterval = null;
    }
}

// =================================================================
// New Crossfade and Loop Handling Functions
// =================================================================
function initializeAudioSystem() {
    crossfadePlayer = document.createElement('audio');
    crossfadePlayer.id = 'crossfadePlayer';
    document.body.appendChild(crossfadePlayer);
    crossfadePlayer.addEventListener('ended', handleSongEnd);
    crossfadePlayer.addEventListener('timeupdate', updateMediaPosition);

    activePlayer = audioPlayer;
    standbyPlayer = crossfadePlayer;

    const createAudioContext = () => {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                sourceMain = audioContext.createMediaElementSource(audioPlayer);
                gainMain = audioContext.createGain();
                sourceMain.connect(gainMain);
                gainMain.connect(audioContext.destination);

                sourceCrossfade = audioContext.createMediaElementSource(crossfadePlayer);
                gainCrossfade = audioContext.createGain();
                sourceCrossfade.connect(gainCrossfade);
                gainCrossfade.connect(audioContext.destination);

                activeGain = gainMain;
                standbyGain = gainCrossfade;
                activeGain.gain.value = 1;
                standbyGain.gain.value = 0;
                console.log('AudioContext initialized successfully.');
            } catch (e) {
                console.error('Web Audio API is not supported in this browser', e);
            }
        }
        document.body.removeEventListener('click', createAudioContext, true);
    };
    document.body.addEventListener('click', createAudioContext, true);
}

function startLoopMonitoring() {
    if (loopCheckInterval) clearInterval(loopCheckInterval);
    loopCheckInterval = setInterval(() => {
        if (!durabilityMode.enabled || !currentLoopInfo || isCrossfading || activePlayer.paused) {
            return;
        }
        const timeUntilLoopEnd = currentLoopInfo.loopEndTime - activePlayer.currentTime;
        if (timeUntilLoopEnd <= CROSSFADE_DURATION) {
            triggerCrossfade();
        }
    }, 100); // Check every 100ms
}

function triggerCrossfade() {
    if (!audioContext) { // Fallback to hard loop if Web Audio API is not available
        activePlayer.currentTime = currentLoopInfo.loopStartTime;
        return;
    }
    isCrossfading = true;
    if (loopCheckInterval) clearInterval(loopCheckInterval);
    loopCheckInterval = null;

    standbyPlayer.src = activePlayer.src;
    standbyPlayer.currentTime = currentLoopInfo.loopStartTime;
    standbyPlayer.play();

    const now = audioContext.currentTime;
    activeGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_DURATION);
    standbyGain.gain.linearRampToValueAtTime(1, now + CROSSFADE_DURATION);

    setTimeout(completeCrossfade, CROSSFADE_DURATION * 1000);
}

function completeCrossfade() {
    activePlayer.pause();

    // Swap roles
    [activePlayer, standbyPlayer] = [standbyPlayer, activePlayer];
    [activeGain, standbyGain] = [standbyGain, activeGain];

    isCrossfading = false;
    
    if (durabilityMode.enabled && currentLoopInfo) {
        startLoopMonitoring();
    }
}

// =================================================================
// Helper Functions
// =================================================================
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
        const item = node[key];
        const path = item.path || (currentPath ? `${currentPath}/${key}` : key);
        const props = songProperties[path] || {};
        return { key: key, sortOrder: props.sortOrder || 0, isFolder: !item.file };
    });
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const item of items) {
        const key = item.key;
        const value = node[key];
        const newPath = value.path || (currentPath ? `${currentPath}/${key}` : key);
        const li = document.createElement('li');
        const props = songProperties[newPath] || {};
        let displayName = (props.name && props.name.trim() !== '') ? props.name : (item.isFolder ? key : (value.file.name.substring(0, value.file.name.lastIndexOf('.')) || key));
        const itemContainer = document.createElement('div');
        itemContainer.className = 'list-item-container';
        const itemContent = document.createElement('span');
        itemContent.className = 'item-content';
        if (item.isFolder) {
            li.classList.add('folder-item');
            li.dataset.folderPath = newPath;
            itemContent.append(`📁 ${displayName}`);
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
            li.dataset.filePath = value.path;
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
        const songRecord = findFileByPath(selectedItemPath);
        if (!songRecord) return;
        propItemName.textContent = songRecord.file.name;
        propDisplayName.value = props.name || '';
        propMultiplier.value = (typeof props.multiplier === 'number') ? props.multiplier : 1.0;
        
        const isLoop = props.isLoopCompatible || false;
        propLoopCompatible.checked = isLoop;
        loopLockContainer.classList.toggle('hidden', !isLoop);
        loopSettingsPanel.classList.toggle('hidden', !isLoop);
        
        if (isLoop) {
            propLoopTimeLocked.checked = props.isLoopTimeLocked || false;
            propLoopStart.value = formatTime(props.loopStartTime);
            propLoopEnd.value = formatTime(props.loopEndTime);
            propLoopStartAuto.textContent = props.autoLoopStartTime != null ? formatTime(props.autoLoopStartTime) : '--:--.---';
            propLoopEndAuto.textContent = props.autoLoopEndTime != null ? formatTime(props.autoLoopEndTime) : '--:--.---';
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
            libraryFiles = songData;
            songProperties = props || {};
            recentlyPlayed = recent || [];
            if (libraryFiles.length > 0) {
                const rootFolderName = libraryFiles[0].path.split('/')[0];
                activeRandomFolderPath = rootFolderName;
            }
            fileTree = buildFileTree(libraryFiles);
            renderTreeView();
        } else {
            libraryFiles = [];
            fileTree = {};
            songProperties = {};
            renderTreeView();
        }
    } catch (error) {
        console.error('Failed to load data from DB:', error);
        alert(`データベースの読み込みに失敗しました: ${error.message}`);
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
        if (value.file instanceof File) {
            files.push(value);
        } else {
            files = files.concat(getFilesFromNode(value));
        }
    }
    return files;
}

function findFileByPath(filePath) {
    for (const record of libraryFiles) {
        if (record.path === filePath) {
            return record;
        }
    }
    return null;
}

function buildFileTree(records) {
    const tree = {};
    for (const record of records) {
        if (!record.path) continue;
        const pathParts = record.path.split('/');
        let currentLevel = tree;
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (i < pathParts.length - 1) {
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                currentLevel = currentLevel[part];
            } else {
                currentLevel[part] = record;
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
    if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds < 0) return "00:00.000";
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
