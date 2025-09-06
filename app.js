// =================================================================
// Application Version
// =================================================================
const APP_VERSION = 'v.3.4.13'; // Dynamic height for partial lyrics view

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
const playerMainUI = document.getElementById('player-main-ui');
const lyricsContainer = document.getElementById('lyrics-container');
const partialLyricsDisplay = document.getElementById('partial-lyrics-display');
const fullLyricsDisplay = document.getElementById('full-lyrics-display');
const lyricsLanguageSelector = document.getElementById('lyrics-language-selector');
const lyricsViewToggle = document.getElementById('lyrics-view-toggle');
const lyricsControls = document.getElementById('lyrics-controls'); // 追加
const propLyricsCompatible = document.getElementById('prop-lyrics-compatible');
const lyricsSettingsPanel = document.getElementById('lyrics-settings-panel');
const propLyricsLangCount = document.getElementById('prop-lyrics-lang-count');
const propLyricsCurrentLang = document.getElementById('prop-lyrics-current-lang');
const propLyricsLangName = document.getElementById('prop-lyrics-lang-name');
const propLyricsTimings = document.getElementById('prop-lyrics-timings');
const propLyricsText = document.getElementById('prop-lyrics-text');
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
let lyricsUpdateInterval = null;
let currentLyricsData = null;
let currentLyricsLang = 0;
let currentPlayerView = 'normal';
let audioContext;
let crossfadePlayer;
let sourceMain, sourceCrossfade;
let gainMain, gainCrossfade;
let activePlayer, standbyPlayer;
let activeGain, standbyGain;
let loopCheckInterval = null;
let isCrossfading = false;
const CROSSFADE_DURATION = 1.0;

// =================================================================
// Application Initialization
// =================================================================
window.addEventListener('load', async () => {
	console.log('App loading...');
	if (versionDisplay) {
		versionDisplay.textContent = APP_VERSION;
	}
    initializeAudioSystem();
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
audioPlayer.addEventListener('timeupdate', handleTimeUpdate);
propLoopCompatible.addEventListener('change', handleLoopCompatibleChange);
propLyricsCompatible.addEventListener('change', handleLyricsCompatibleChange);
propLyricsLangCount.addEventListener('change', handleLyricsSettingChange);
propLyricsCurrentLang.addEventListener('change', handleLyricsSettingChange);
lyricsViewToggle.addEventListener('click', handleViewToggle);
lyricsLanguageSelector.addEventListener('click', handleLanguageChange);
audioPlayer.addEventListener('ended', handleSongEnd);
crossfadePlayer.addEventListener('ended', handleSongEnd);
propLyricsTimings.addEventListener('input', autoResizeLyricsEditor);
propLyricsText.addEventListener('input', autoResizeLyricsEditor);


// =================================================================
// Event Handler Functions
// =================================================================
async function handleFileInputChange(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    showLoading(`インポート中: 0 / ${files.length}`);
    try {
        await db.songs.clear();
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const songRecord = { path: file.webkitRelativePath, file: file };
            await db.songs.put(songRecord);
            if ((i + 1) % 10 === 0 || i === files.length - 1) {
                updateLoadingMessage(`インポート中: ${i + 1} / ${files.length}`);
            }
        }
        await loadDataFromDB();
    } catch (error) {
        console.error('Import error:', error);
    } finally {
        hideLoading();
    }
}

async function handleSaveProperties() {
	if (!selectedItemPath) return;
	const props = songProperties[selectedItemPath] || {};
	props.name = propDisplayName.value;
	props.sortOrder = parseFloat(propSortOrder.value) || 0;

	if (isSelectedItemFolder) {
		props.isGame = propIsGame.checked;
	} else {
		const parsedMultiplier = parseFloat(propMultiplier.value);
		props.multiplier = !isNaN(parsedMultiplier) ? parsedMultiplier : 1.0;
        
        props.isLoopCompatible = propLoopCompatible.checked;
        if (props.isLoopCompatible) {
            props.isLoopTimeLocked = propLoopTimeLocked.checked;
            props.loopStartTime = timeStringToSeconds(propLoopStart.value);
            props.loopEndTime = timeStringToSeconds(propLoopEnd.value);
        } else {
            delete props.isLoopTimeLocked;
            delete props.loopStartTime;
            delete props.loopEndTime;
        }
        
        props.showLyrics = propLyricsCompatible.checked;
        if (props.showLyrics) {
            const langIndex = parseInt(propLyricsCurrentLang.value, 10);
            saveCurrentLyricsLanguage(props, langIndex);
            props.lyricsLangCount = parseInt(propLyricsLangCount.value, 10) || 1;
            
            const timings = propLyricsTimings.value.split('\n').map(t => parseFloat(t)).filter(t => !isNaN(t));
            
            props.lyricsData = timings.map((time, index) => {
                const existingLineData = (props.lyricsData || [])[index] || { time: 0, lines: [] };
                return { time: time, lines: existingLineData.lines };
            });
        } else {
            delete props.lyricsLangCount;
            delete props.lyricsLangNames;
            delete props.lyricsData;
        }
	}

	songProperties[selectedItemPath] = props;
	await saveProperties('songProperties', songProperties);
	renderTreeView(getOpenFolders());
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
			await saveProperties('songProperties', importedSettings);
			await loadDataFromDB();
		} catch (error) {
			console.error('Import error:', error);
		}
	};
	reader.readAsText(file);
	event.target.value = '';
}

function handleLoopCompatibleChange() {
    const isChecked = propLoopCompatible.checked;
    loopLockContainer.classList.toggle('hidden', !isChecked);
    loopSettingsPanel.classList.toggle('hidden', !isChecked);
}

function handleLyricsSettingChange() {
    const props = songProperties[selectedItemPath] || {};
    if (!props) return;
    const previousLangIndex = parseInt(propLyricsCurrentLang.dataset.previousValue || '0', 10);
    saveCurrentLyricsLanguage(props, previousLangIndex);
    props.lyricsLangCount = parseInt(propLyricsLangCount.value, 10);
    songProperties[selectedItemPath] = props;
    showPropertiesPanel(false);
}

function handleLyricsCompatibleChange() {
    lyricsSettingsPanel.classList.toggle('hidden', !propLyricsCompatible.checked);
}

function handleTimeUpdate() {
    updateMediaPosition();
}

function handleSongEnd(event) {
    if (event && event.target !== activePlayer) return;
    if (loopCheckInterval) clearInterval(loopCheckInterval);
    if (lyricsUpdateInterval) clearInterval(lyricsUpdateInterval);
    isCrossfading = false;
    setTimeout(playNextSong, 800);
}

// =================================================================
// Core Functions
// =================================================================
function handleTreeClick(event) {
    const liElement = event.target.closest('li');
    if (!liElement) return;

    if (event.target.matches('.toggle-button')) {
        liElement.classList.toggle('open');
        event.target.textContent = liElement.classList.contains('open') ? '折り畳み' : '展開';
    } else if (event.target.closest('.item-content')) {
        if (liElement.matches('.folder-item')) {
            handleFolderSelect(liElement);
        } else if (liElement.matches('.file-item')) {
            const songRecord = findFileByPath(liElement.dataset.filePath);
            if (songRecord) handleSongSelect(liElement, songRecord);
        }
    }
}

function handleFolderSelect(folderElement) {
    selectedItemPath = folderElement.dataset.folderPath;
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

    if (loopCheckInterval) clearInterval(loopCheckInterval);
    isCrossfading = false;
    standbyPlayer.pause();
    standbyPlayer.src = '';
    
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
    
    activePlayer.src = URL.createObjectURL(file);

	try {
		await activePlayer.play();
        if (durabilityMode.enabled && currentLoopInfo) startLoopMonitoring();
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
        playerFolderName.textContent = '全曲';
    }
	const svgIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='512' height='512'><rect width='24' height='24' fill='#7e57c2'/><path fill='white' d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4%201.79-4%204s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/></svg>`;
	const artworkURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgIcon)}`;
    playerArtwork.src = artworkURL;

	if ('mediaSession' in navigator) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: songDisplayName, artist: gameName, album: '多機能ミュージックリスト',
			artwork: [ { src: artworkURL, sizes: '512x512', type: 'image/svg+xml' } ]
		});
		navigator.mediaSession.setActionHandler('play', () => activePlayer.play());
		navigator.mediaSession.setActionHandler('pause', () => activePlayer.pause());
		navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong());
		navigator.mediaSession.setActionHandler('previoustrack', () => { activePlayer.currentTime = Math.max(activePlayer.currentTime - 5, 0); });
		try {
			navigator.mediaSession.setActionHandler('seekto', (details) => { activePlayer.currentTime = details.seekTime; });
		} catch (error) { console.log('seekto is not supported.'); }
	}
    
    if (lyricsUpdateInterval) clearInterval(lyricsUpdateInterval);
    if (props.showLyrics && props.lyricsData && props.lyricsData.length > 0) {
        currentLyricsData = {
            timings: props.lyricsData.map(d => d.time),
            languages: Array.from({ length: props.lyricsLangCount || 1 }, (_, langIndex) => ({
                name: (props.lyricsLangNames || [])[langIndex] || `言語 ${langIndex + 1}`,
                lines: props.lyricsData.map(d => (d.lines || [])[langIndex] || '')
            }))
        };
        currentLyricsLang = 0;
        lyricsContainer.classList.remove('hidden');
        setupLyricsControls(currentLyricsData.languages);
        switchLyricsView('normal');
        lyricsUpdateInterval = setInterval(updateLyricsDisplay, 250);
    } else {
        currentLyricsData = null;
        lyricsContainer.classList.add('hidden');
        switchLyricsView('normal');
    }
}

function playNextSong() {
    if (nextSongToPlay) {
        playSong(nextSongToPlay);
        nextSongToPlay = null;
        return;
    }
    if (!activeRandomFolderPath && libraryFiles.length > 0) {
        activeRandomFolderPath = libraryFiles[0].path.split('/')[0];
    }
    if (!activeRandomFolderPath) return;

    const playlist = getPlaylist(activeRandomFolderPath);
    if (playlist.length === 0) return;
    
    const exclusionCount = Math.floor(Math.min(50, playlist.length / 2));
    const excludedPaths = recentlyPlayed.slice(0, exclusionCount);
    const weightedList = [];
    let totalWeight = 0;

    for (const record of playlist) {
        const filePath = record.path;
        if (excludedPaths.includes(filePath)) continue;
        const props = songProperties[filePath] || {};
        const multiplier = (typeof props.multiplier === 'number') ? props.multiplier : 1.0;
        if (multiplier > 0) {
            weightedList.push({ record: record, weight: multiplier });
            totalWeight += multiplier;
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
        const nonExcludedPlaylist = playlist.filter(r => !excludedPaths.includes(r.path));
        if (nonExcludedPlaylist.length > 0) {
            songToPlay = nonExcludedPlaylist[Math.floor(Math.random() * nonExcludedPlaylist.length)];
        } else {
            songToPlay = playlist[Math.floor(Math.random() * playlist.length)];
        }
    }
    playSong(songToPlay);
}


function setDurabilityMode(durationInSeconds) {
    durabilityMode.enabled = durationInSeconds > 0;
    durabilityMode.duration = durationInSeconds;
    durabilityModeButton.textContent = `耐久モード: ${durabilityMode.enabled ? `${durationInSeconds / 60}分` : 'ループなし'}`;
    durabilityOptions.classList.add('hidden');

    if (durabilityMode.enabled && currentLoopInfo && !activePlayer.paused) {
        startLoopMonitoring();
    } else if (!durabilityMode.enabled && loopCheckInterval) {
        clearInterval(loopCheckInterval);
        loopCheckInterval = null;
    }
}

function initializeAudioSystem() {
    crossfadePlayer = document.getElementById('crossfadePlayer');
    activePlayer = audioPlayer;
    standbyPlayer = crossfadePlayer;

    const createAudioContext = () => {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                sourceMain = audioContext.createMediaElementSource(audioPlayer);
                gainMain = audioContext.createGain();
                sourceMain.connect(gainMain).connect(audioContext.destination);
                sourceCrossfade = audioContext.createMediaElementSource(crossfadePlayer);
                gainCrossfade = audioContext.createGain();
                sourceCrossfade.connect(gainCrossfade).connect(audioContext.destination);
                activeGain = gainMain;
                standbyGain = gainCrossfade;
                activeGain.gain.value = 1;
                standbyGain.gain.value = 0;
            } catch (e) {
                console.error('Web Audio API is not supported', e);
            }
        }
        document.body.removeEventListener('click', createAudioContext, true);
    };
    document.body.addEventListener('click', createAudioContext, true);
}

function startLoopMonitoring() {
    if (loopCheckInterval) clearInterval(loopCheckInterval);
    loopCheckInterval = setInterval(() => {
        if (!durabilityMode.enabled || !currentLoopInfo || isCrossfading || activePlayer.paused) return;
        const timeUntilLoopEnd = currentLoopInfo.loopEndTime - activePlayer.currentTime;
        if (timeUntilLoopEnd <= CROSSFADE_DURATION) triggerCrossfade();
    }, 100);
}

function triggerCrossfade() {
    if (!audioContext) {
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
    [activePlayer, standbyPlayer] = [standbyPlayer, activePlayer];
    [activeGain, standbyGain] = [standbyGain, activeGain];
    isCrossfading = false;
    if (durabilityMode.enabled && currentLoopInfo) startLoopMonitoring();
}

function handleViewToggle(event) {
    if (event.target.tagName === 'BUTTON') {
        switchLyricsView(event.target.dataset.view);
    }
}

function switchLyricsView(view) {
    currentPlayerView = view;
    playerScreen.className = 'screen active';
    playerScreen.classList.add(`view-${view}`);
    
    lyricsViewToggle.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // ▼▼▼ 以下を追加: partial viewを離れるときに動的スタイルをクリア ▼▼▼
    if (view !== 'partial') {
        partialLyricsDisplay.style.height = '';
        lyricsContainer.style.height = '';
    }

    if (view === 'full') {
        renderFullLyrics();
    }
    updateLyricsDisplay();
}

function handleLanguageChange(event) {
    if (event.target.tagName === 'BUTTON') {
        currentLyricsLang = parseInt(event.target.dataset.lang, 10);
        lyricsLanguageSelector.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.lang, 10) === currentLyricsLang);
        });
        if (currentPlayerView === 'full') renderFullLyrics();
        updateLyricsDisplay();
    }
}

function updateLyricsDisplay() {
    if (!currentLyricsData || currentPlayerView === 'normal' || !activePlayer) return;

    const currentTime = activePlayer.currentTime;
    const timings = currentLyricsData.timings;
    let currentIndex = -1;
    for (let i = timings.length - 1; i >= 0; i--) {
        if (currentTime >= timings[i]) {
            currentIndex = i;
            break;
        }
    }

    if (currentPlayerView === 'partial') {
        renderPartialLyrics(currentIndex);
    } else if (currentPlayerView === 'full') {
        highlightFullLyrics(currentIndex);
    }
}

function renderPartialLyrics(currentIndex) {
    const lines = currentLyricsData.languages[currentLyricsLang].lines;
    let content = '';
    for (let i = -2; i <= 2; i++) {
        const lineIndex = currentIndex + i;
        const line = (lineIndex >= 0 && lineIndex < lines.length && lines[lineIndex]) ? lines[lineIndex] : '&nbsp;';
        const className = (i === 0) ? 'current-lyric' : '';
        content += `<p class="${className}">${line}</p>`;
    }
    partialLyricsDisplay.innerHTML = content;

    // ▼▼▼ 以下を修正: 高さを動的に計算して適用 ▼▼▼
    // コンテンツの実際の高さを取得
    const contentHeight = partialLyricsDisplay.scrollHeight;
    // 上下の余白を少し加える
    const panelHeight = contentHeight + 30;

    // パネル自身の高さを設定
    partialLyricsDisplay.style.height = `${panelHeight}px`;
    // 親コンテナの高さも更新（パネル＋コントロール部分）
    const controlsHeight = lyricsControls.offsetHeight;
    lyricsContainer.style.height = `${panelHeight + controlsHeight}px`;
}

function renderFullLyrics() {
    const lines = currentLyricsData.languages[currentLyricsLang].lines;
    fullLyricsDisplay.innerHTML = lines.map((line, index) => `<p data-line-index="${index}">${line || '&nbsp;'}</p>`).join('');
}

function highlightFullLyrics(currentIndex) {
    const currentLineElement = fullLyricsDisplay.querySelector(`p.current-lyric`);
    if(currentLineElement) currentLineElement.classList.remove('current-lyric');

    if (currentIndex > -1) {
        const nextLineElement = fullLyricsDisplay.querySelector(`p[data-line-index="${currentIndex}"]`);
        if (nextLineElement) {
            nextLineElement.classList.add('current-lyric');
        }
    }
}

function setupLyricsControls(languages) {
    lyricsLanguageSelector.innerHTML = languages.map((lang, index) => 
        `<button data-lang="${index}" class="${index === 0 ? 'active' : ''}">${lang.name}</button>`
    ).join('');
}

function saveCurrentLyricsLanguage(props, langIndex) {
    if (!props.showLyrics) return;
    
    props.lyricsLangNames = props.lyricsLangNames || [];
    props.lyricsData = props.lyricsData || [];

    props.lyricsLangNames[langIndex] = propLyricsLangName.value;

    const allLines = propLyricsText.value.split('\n');
    const timings = propLyricsTimings.value.split('\n').map(t => parseFloat(t));

    for(let i = 0; i < timings.length; i++){
        if (!props.lyricsData[i]) props.lyricsData[i] = { time: 0, lines: [] };
        props.lyricsData[i].time = timings[i] || props.lyricsData[i].time;
        if (!props.lyricsData[i].lines) props.lyricsData[i].lines = [];
        props.lyricsData[i].lines[langIndex] = allLines[i] || '';
    }
    props.lyricsData.length = timings.length;
}

function autoResizeLyricsEditor() {
    propLyricsTimings.style.height = 'auto';
    propLyricsText.style.height = 'auto';

    const scrollHeightTimings = propLyricsTimings.scrollHeight;
    const scrollHeightText = propLyricsText.scrollHeight;
    
    const maxHeight = Math.max(scrollHeightTimings, scrollHeightText);

    propLyricsTimings.style.height = maxHeight + 'px';
    propLyricsText.style.height = maxHeight + 'px';
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

    const applyState = (container) => {
        if (pathsToKeepOpen) {
            container.querySelectorAll('.folder-item').forEach(folder => {
                if (pathsToKeepOpen.has(folder.dataset.folderPath)) {
                    folder.classList.add('open');
                    folder.querySelector('.toggle-button').textContent = '折り畳み';
                }
            });
        }
        if(selectedItemPath) {
            const el = container.querySelector(`li[data-folder-path="${selectedItemPath}"], li[data-file-path="${selectedItemPath}"]`);
            if(el) el.classList.add('selected-item');
        }
    };
    applyState(listTreeViewContainer);
    applyState(settingsTreeViewContainer);
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

function showPropertiesPanel(resetData = true) {
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
        }

        const showLyrics = props.showLyrics || false;
        propLyricsCompatible.checked = showLyrics;
        lyricsSettingsPanel.classList.toggle('hidden', !showLyrics);

        if (showLyrics) {
            if (resetData) {
                propLyricsLangCount.value = props.lyricsLangCount || 1;
                propLyricsCurrentLang.value = 0;
            }
            const langIndex = parseInt(propLyricsCurrentLang.value, 10);
            const langCount = parseInt(propLyricsLangCount.value, 10);
            
            if (langIndex >= langCount) {
                propLyricsCurrentLang.value = langCount - 1;
                showPropertiesPanel(false);
                return;
            }
            propLyricsCurrentLang.dataset.previousValue = langIndex;

            propLyricsLangName.value = (props.lyricsLangNames || [])[langIndex] || '';
            const lyricsData = props.lyricsData || [];
            propLyricsTimings.value = lyricsData.map(d => d.time).join('\n');
            propLyricsText.value = lyricsData.map(d => (d.lines || [])[langIndex] || '').join('\n');
            
            setTimeout(autoResizeLyricsEditor, 0);
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
                activeRandomFolderPath = libraryFiles[0].path.split('/')[0];
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
    } finally {
        hideLoading();
    }
}

function getPlaylist(folderPath) {
    const targetPath = folderPath || activeRandomFolderPath;
    if (!targetPath) return [];
    const pathParts = targetPath.split('/');
    let targetNode = fileTree;
    for (const part of pathParts) {
        targetNode = targetNode ? targetNode[part] : undefined;
    }
    return targetNode ? getFilesFromNode(targetNode) : [];
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
    return libraryFiles.find(record => record.path === filePath) || null;
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
                if (!currentLevel[part]) currentLevel[part] = {};
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

function getOpenFolders() {
    const openFolders = new Set();
    document.querySelectorAll('.tree-view .folder-item.open').forEach(folder => {
        openFolders.add(folder.dataset.folderPath);
    });
    return openFolders;
}

function formatTime(totalSeconds) {
    if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds < 0) return "";
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

function updateMediaPosition() {
    if ('mediaSession' in navigator && navigator.mediaSession.metadata && activePlayer) {
        navigator.mediaSession.setPositionState({
            duration: activePlayer.duration || 0,
            playbackRate: activePlayer.playbackRate,
            position: activePlayer.currentTime || 0,
        });
    }
}