// =================================================================
// Application Version
// =================================================================
const APP_VERSION = 'v.5.0.5'; // Fixed property panel UI bugs

// =================================================================
// HTML Element Acquisition
// =================================================================
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
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
const listTreeViewContainer = document.getElementById('list-tree-view-container');
const listRandomButton = document.getElementById('list-random-button');
const fileInput = document.getElementById('fileInput');
const exportButton = document.getElementById('export-settings-button');
const importInput = document.getElementById('import-settings-input');
const artworkFolderInput = document.getElementById('artwork-folder-input');
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
const customSeekbarContainer = document.getElementById('custom-seekbar-container');
const customSeekbar = document.getElementById('custom-seekbar');
const currentTimeLabel = document.getElementById('current-time');
const totalTimeLabel = document.getElementById('total-time');
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
const propIsDerivative = document.getElementById('prop-is-derivative');
const derivativeSettingsPanel = document.getElementById('derivative-settings-panel');
const propDerivativeMultiplier = document.getElementById('prop-derivative-multiplier');
const lyricsContainer = document.getElementById('lyrics-container');
const partialLyricsDisplay = document.getElementById('partial-lyrics-display');
const fullLyricsDisplay = document.getElementById('full-lyrics-display');
const lyricsLanguageSelector = document.getElementById('lyrics-language-selector');
const lyricsViewToggle = document.getElementById('lyrics-view-toggle');
const lyricsControls = document.getElementById('lyrics-controls');
const propLyricsCompatible = document.getElementById('prop-lyrics-compatible');
const lyricsSettingsPanel = document.getElementById('lyrics-settings-panel');
const propLyricsLangCount = document.getElementById('prop-lyrics-lang-count');
const propLyricsCurrentLang = document.getElementById('prop-lyrics-current-lang');
const propLyricsLangName = document.getElementById('prop-lyrics-lang-name');
const propLyricsTimings = document.getElementById('prop-lyrics-timings');
const propLyricsText = document.getElementById('prop-lyrics-text');
const artworkManagementUI = document.getElementById('artwork-management-ui');
const artworkPreview = document.getElementById('artwork-preview');
const artworkUploadInput = document.getElementById('artwork-upload-input');
const artworkRemoveButton = document.getElementById('artwork-remove-button');
const propMemo = document.getElementById('prop-memo');
const ctrlPrevButton = document.getElementById('ctrl-prev-button');
const ctrlPlayPauseButton = document.getElementById('ctrl-play-pause-button');
const ctrlNextButton = document.getElementById('ctrl-next-button');
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.innerHTML = '<div>データを処理中...</div>';
loadingOverlay.style.display = 'none';
document.body.appendChild(loadingOverlay);

// =================================================================
// Global Variables
// =================================================================
let musicEngine = null;
let isDraggingSeekbar = false;
let libraryFiles = [];
let fileTree = {};
let selectedItemPath = null;
let isSelectedItemFolder = false;
let recentlyPlayed = [];
let songProperties = {};
let nextSongToPlay = null;
let activeRandomFolderPath = null;
let currentSongPath = null;
let lyricsUpdateInterval = null;
let currentLyricsData = null;
let currentLyricsLang = 0;
let currentPlayerView = 'normal';
let rootPath = null; // ルートディレクトリのパスを保持

// =================================================================
// OS class
// =================================================================
function initAudioEngine() {
    if (isIOS) {
        console.log("Mode: iOS (HTML5 Audio for background play)");
        musicEngine = new Html5AudioEngine();
    } else {
        console.log("Mode: PC/Android (Web Audio API for seamless loop)");
        musicEngine = new WebAudioEngine();
    }
}

// ■ iPhone用エンジン（既存のaudioタグを操作）
class Html5AudioEngine {
    constructor() {
        this.element = document.getElementById('audioPlayer');
        this.loopStart = 0;
        this.loopEnd = 0;
        this.isLooping = false;
        
        // ループ監視用
        this.checkLoop = this.checkLoop.bind(this);
    }

    play(file, loopStart, loopEnd) {
        return new Promise((resolve, reject) => {
            const blobUrl = URL.createObjectURL(file);
            this.element.src = blobUrl;
            this.element.load();
            
            this.loopStart = loopStart || 0;
            this.loopEnd = loopEnd || 0;
            // ループ終了時間が設定されており、かつ開始時間より後ろならループ有効
            this.isLooping = (this.loopEnd > 0 && this.loopEnd > this.loopStart);

            this.element.play().then(() => {
                if (this.isLooping) requestAnimationFrame(this.checkLoop);
                resolve();
            }).catch(e => reject(e));
        });
    }

    checkLoop() {
        if (!this.isLooping || this.element.paused) return;

        // ループ終了点を超えたら開始点に戻す（ラグは許容）
        if (this.element.currentTime >= this.loopEnd) {
            this.element.currentTime = this.loopStart;
        }
        requestAnimationFrame(this.checkLoop);
    }

    seek(time) {
        if (Number.isFinite(time)) {
            this.element.currentTime = time;
        }
    }

    pause() { this.element.pause(); }
    
    // UI同期のために現在の時間を返す
    getCurrentTime() { return this.element.currentTime; }
    getDuration() { return this.element.duration; }
}

// ■ PC/Android用エンジン（Web Audio APIで完璧なループ）
class WebAudioEngine {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.source = null;
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false; // 再生中フラグ
        this.buffer = null;
        
        // シークや再開時に使うためにループ設定を保存しておく変数
        this.currentLoopStart = 0;
        this.currentLoopEnd = 0;
    }

    async play(file, loopStart, loopEnd) {
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        
        // 再生前に前の曲を止める
        this.isPlaying = false;
        this.stopSource();

        // ファイルを読み込んでデコード
        const arrayBuffer = await file.arrayBuffer();
        this.buffer = await this.ctx.decodeAudioData(arrayBuffer);

        // ループ設定を保存
        this.currentLoopStart = loopStart;
        this.currentLoopEnd = loopEnd;

        // 最初から再生
        this.playBuffer(0);
    }

    playBuffer(offset) {
        if (!this.buffer) return;
        
        // 重複再生防止（古いソースを止める）
        this.stopSource();

        // 新しいソースを作成
        const sourceNode = this.ctx.createBufferSource();
        sourceNode.buffer = this.buffer;
        sourceNode.connect(this.gainNode);
        
        // クラスのプロパティとして保持
        this.source = sourceNode;

        // 保存しておいた設定を使ってループを設定
        if (this.currentLoopEnd > 0 && this.currentLoopEnd > this.currentLoopStart) {
            this.source.loop = true;
            this.source.loopStart = this.currentLoopStart;
            this.source.loopEnd = this.currentLoopEnd;
        } else {
            this.source.loop = false;
        }

        // ★修正ポイント: 変数 sourceNode をクロージャでキャプチャして比較する
        sourceNode.onended = () => {
            // イベントを発火したソース(sourceNode)が、現在管理しているソース(this.source)と一致する場合のみ実行
            // これにより、シーク時などに捨てられた「古いソース」のonendedを無視できる
            if (this.isPlaying && this.source === sourceNode && !this.source.loop) {
                this.isPlaying = false;
                const event = new Event('ended');
                document.getElementById('audioPlayer').dispatchEvent(event);
            }
        };

        this.source.start(0, offset);
        this.startedAt = this.ctx.currentTime - offset;
        this.pausedAt = 0;
        this.isPlaying = true;
    }

    seek(time) {
        if (!this.buffer) return;
        time = Math.max(0, Math.min(time, this.buffer.duration));
        
        if (this.isPlaying) {
            // シーク時は isPlaying を false にしなくて良い（playBuffer内で正しく処理されるため）
            // ただし古いソースを確実に止める
            try { this.source.stop(); } catch(e) {}
            
            // 指定位置から再生し直す
            this.playBuffer(time);
        } else {
            // 停止中なら位置だけ記録（再開時にここから始まる）
            this.pausedAt = time;
        }
    }

    pause() {
        if (this.isPlaying) {
            this.pausedAt = this.getCurrentTime();
            this.isPlaying = false;
            this.stopSource();
            
            if (this.ctx.state === 'running') this.ctx.suspend();
        }
    }

    async resume() {
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        
        // 停止中かつバッファがある場合、音の部品を作り直して再生
        if (!this.isPlaying && this.buffer) {
            this.playBuffer(this.pausedAt);
        }
    }

    stopSource() {
        if (this.source) {
            try { this.source.stop(); } catch(e) {}
            // 切断するが、this.source = null はしない（onendedの比較で null になると困る場合があるため）
            // ただし playBuffer で this.source は上書きされるので問題ない
            this.source.disconnect();
        }
    }

    stop() {
        this.isPlaying = false;
        this.stopSource();
        this.source = null; // 完全停止時は消して良い
        this.pausedAt = 0;
    }

    getCurrentTime() {
        if (this.ctx.state === 'suspended' || !this.isPlaying) return this.pausedAt; 
        
        let time = this.ctx.currentTime - this.startedAt;
        
        // ループ再生中の時間計算
        if(this.source && this.source.loop) {
            const duration = this.source.loopEnd - this.source.loopStart;
            if(time >= this.source.loopStart) {
                time = this.source.loopStart + ((time - this.source.loopStart) % duration);
            }
        }
        return Math.max(0, time);
    }
    
    getDuration() { return this.buffer ? this.buffer.duration : 0; }
    getPaused() { return !this.isPlaying; }
}

// =================================================================
// Application Initialization
// =================================================================
window.addEventListener('load', async () => {
	console.log('App loading...');
    if (isIOS) {
        musicEngine = new Html5AudioEngine();
        console.log("Mode: iOS (HTML5 Audio)");
    } else {
        musicEngine = new WebAudioEngine();
        console.log("Mode: PC (Web Audio API)");
        // PCモードはUI更新ループを開始
        setInterval(handleTimeUpdate, 100);
    }
    audioPlayer.classList.add('hidden'); // class="hidden" を強制
    customSeekbarContainer.classList.remove('hidden');
	if (versionDisplay) {
		versionDisplay.textContent = APP_VERSION;
	}
	await loadDataFromDB();
    if (rootPath) {
        await displayArtwork(rootPath); // アプリ起動時にデフォルトアートワークを表示
    }
});

// =================================================================
// Event Listeners
// =================================================================
navPlayerButton.addEventListener('click', () => switchScreen('player'));
navListButton.addEventListener('click', () => switchScreen('list'));
navSettingsButton.addEventListener('click', () => switchScreen('settings'));
gotoDetailSettingsButton.addEventListener('click', () => switchSettingsView('detail'));
backToMainSettingsButton.addEventListener('click', () => switchSettingsView('main'));
listRandomButton.addEventListener('click', handleRandomButton);
listTreeViewContainer.addEventListener('click', handleTreeClick);
settingsTreeViewContainer.addEventListener('click', handleTreeClick);
fileInput.addEventListener('change', handleFileInputChange);
savePropertiesButton.addEventListener('click', handleSaveProperties);
exportButton.addEventListener('click', handleExport);
importInput.addEventListener('change', handleImport);
if (artworkFolderInput) {
    artworkFolderInput.addEventListener('change', handleArtworkFolderRecovery);
}
audioPlayer.addEventListener('timeupdate', handleTimeUpdate);
propLoopCompatible.addEventListener('change', handleLoopCompatibleChange);
if (propIsDerivative) {
    propIsDerivative.addEventListener('change', () => {
        derivativeSettingsPanel.classList.toggle('hidden', !propIsDerivative.checked);
    });
}
propLyricsCompatible.addEventListener('change', handleLyricsCompatibleChange);
propLyricsLangCount.addEventListener('change', handleLyricsSettingChange);
propLyricsCurrentLang.addEventListener('change', handleLyricsSettingChange);
lyricsViewToggle.addEventListener('click', handleViewToggle);
lyricsLanguageSelector.addEventListener('click', handleLanguageChange);
audioPlayer.addEventListener('ended', handleSongEnd);
propLyricsTimings.addEventListener('input', autoResizeLyricsEditor);
propLyricsText.addEventListener('input', autoResizeLyricsEditor);
propIsGame.addEventListener('change', () => {
    // UIの表示/非表示を切り替えるだけにする
    artworkManagementUI.classList.toggle('hidden', !propIsGame.checked);
});
artworkUploadInput.addEventListener('change', handleArtworkUpload);
artworkRemoveButton.addEventListener('click', handleArtworkRemove);
if (propMemo) {
    propMemo.addEventListener('input', () => autoResizeTextarea(propMemo));
}
ctrlPlayPauseButton.addEventListener('click', () => {
    if (!musicEngine) return;
    
    // 曲が入っていない（初期状態）のときだけ、Nextボタンと同じ処理（ランダム再生等）を行う
    if (musicEngine.getDuration() === 0 && !currentSongPath) {
        handleRandomButton(); 
        return;
    }

    // それ以外は、現在セットされている曲を 再生/一時停止 するだけ
    if (musicEngine.getPaused()) {
        musicEngine.resume();
    } else {
        musicEngine.pause();
    }
});
ctrlPrevButton.addEventListener('click', () => {
    if (musicEngine) {
        const current = musicEngine.getCurrentTime();
        musicEngine.seek(Math.max(0, current - 5));
    }
});
customSeekbar.addEventListener('input', () => {
    isDraggingSeekbar = true;
    currentTimeLabel.textContent = formatTime(customSeekbar.value);
});
customSeekbar.addEventListener('change', () => {
    if (musicEngine) {
        // 数値に変換して渡す
        musicEngine.seek(parseFloat(customSeekbar.value));
    }
    isDraggingSeekbar = false;
});
if (ctrlNextButton) {
    ctrlNextButton.addEventListener('click', playNextSong);
}

// =================================================================
// Event Handler Functions
// =================================================================
async function handleFileInputChange(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    showLoading(`インポート中: 0 / ${files.length}`);
    try {
        await db.songs.clear();
        await db.artworks.clear(); // アートワークもクリア
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
    props.memo = propMemo.value;

	if (isSelectedItemFolder) {
		props.isGame = propIsGame.checked;
        props.isDerivative = propIsDerivative.checked;
        if (props.isDerivative) {
            const parsedMultiplier = parseFloat(propDerivativeMultiplier.value);
            props.multiplier = !isNaN(parsedMultiplier) ? parsedMultiplier : 1.0;
        } else {
            delete props.isDerivative;
        }
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

async function handleArtworkUpload(event) {
    const file = event.target.files[0];
    if (!file || !selectedItemPath) return;

    await db.artworks.put({ path: selectedItemPath, image: file });
    const props = songProperties[selectedItemPath] || {};
    props.hasArtwork = true;
    props.artworkFileName = file.name;
    songProperties[selectedItemPath] = props;
    await saveProperties('songProperties', songProperties);
    
    await displayArtwork(selectedItemPath, artworkPreview); // プレビューを更新
    event.target.value = '';
}

async function handleArtworkRemove() {
    if (!selectedItemPath) return;

    await db.artworks.delete(selectedItemPath);
    const props = songProperties[selectedItemPath] || {};
    delete props.hasArtwork;
    songProperties[selectedItemPath] = props;
    await saveProperties('songProperties', songProperties);

    await displayArtwork(selectedItemPath, artworkPreview); // プレビューを更新（デフォルトに戻る）
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
    // PCモード（WebAudio）の時は、audioPlayer.currentTime は 0 のままなので
    // エンジンから正しい時間を取得して上書きする必要があります。
    // ただし、audioPlayer自体はread-onlyなプロパティも多いため、
    // MediaSessionの更新にはエンジンの時間を使います。
    
    let currentTime = 0;
    let duration = 0;

    if (!isIOS && musicEngine) {
        currentTime = musicEngine.getCurrentTime();
        duration = musicEngine.getDuration();
        
        if (!isDraggingSeekbar) {
            const safeDuration = duration || 0;
            customSeekbar.max = duration || 100;
            customSeekbar.value = currentTime || 0;
            currentTimeLabel.textContent = formatTime(currentTime);
            totalTimeLabel.textContent = formatTime(duration);
        }
        // 歌詞表示のために audioPlayerの時間を擬似的にハックするのは難しいので、
        // updateLyricsDisplay関数の方で musicEngine.getCurrentTime() を参照するように修正するのがベストです。
        // ここではMediaSessionの更新を行います。
    } else {
        currentTime = audioPlayer.currentTime;
        duration = audioPlayer.duration;
    }
    
    updateMediaPosition(currentTime, duration);
}

function handleSongEnd(event) {
    if (event && event.target !== audioPlayer) return;
    if (lyricsUpdateInterval) clearInterval(lyricsUpdateInterval);
    setTimeout(playNextSong, 800);
}

function rewindFiveSeconds() {
    if (audioPlayer) {
        audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 5, 0);
    }
}

async function handleArtworkFolderRecovery(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    showLoading(`画像を解析中... (0 / ${files.length})`);

    try {
        // 1. アップロードされた画像をファイル名で検索できるようにマップ化する
        // (同じファイル名がある場合は後勝ちになります)
        const imageMap = new Map();
        for (const file of files) {
            imageMap.set(file.name, file);
        }

        let restoredCount = 0;
        const paths = Object.keys(songProperties);
        
        // 2. 全ての設定済みパス（Gameフォルダ等）を探索
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            const props = songProperties[path];

            // Gameフォルダであり、かつ画像ファイル名が記録されている場合
            if (props && props.isGame && props.artworkFileName) {
                // アップロードされたフォルダの中に、そのファイル名があるか確認
                const imageFile = imageMap.get(props.artworkFileName);

                if (imageFile) {
                    // DBに登録 (パスと画像を紐付け)
                    await db.artworks.put({ path: path, image: imageFile });
                    
                    // プロパティの状態も更新（念のため）
                    props.hasArtwork = true;
                    songProperties[path] = props;
                    
                    restoredCount++;
                }
            }

            // 進捗表示の更新 (10件ごと)
            if (i % 10 === 0) {
                updateLoadingMessage(`アートワーク復元中... (${restoredCount}件 完了)`);
            }
        }

        // 変更されたプロパティを保存
        await saveProperties('songProperties', songProperties);
        
        // 現在表示中の画面のアートワーク等を更新するために再描画
        if (selectedItemPath && isSelectedItemFolder) {
             // 詳細設定画面を開いている場合
            await showPropertiesPanel(false); 
        } else if (rootPath) {
             // プレイヤー画面の場合
            await displayArtwork(rootPath);
        }

        alert(`${restoredCount} 件のアートワークを復元しました。`);

    } catch (error) {
        console.error('Artwork recovery failed:', error);
        alert('アートワークの復元中にエラーが発生しました。');
    } finally {
        hideLoading();
        event.target.value = ''; // 入力をリセット
    }
}

// =================================================================
// Core Functions
// =================================================================
async function displayArtwork(path, targetImageElement = playerArtwork) {
    let imageBlob = null;
    const record = await db.artworks.get(path);
    if (record) {
        imageBlob = record.image;
    } else if (path !== rootPath) {
        const rootRecord = await db.artworks.get(rootPath);
        if (rootRecord) {
            imageBlob = rootRecord.image;
        }
    }

    if (imageBlob) {
        targetImageElement.src = URL.createObjectURL(imageBlob);
    } else {
        targetImageElement.src = '';
    }
}

function handleTreeClick(event) {
    const liElement = event.target.closest('li');
    if (!liElement) return;

    if (event.target.matches('.toggle-button')) {
        const folderPath = liElement.dataset.folderPath;
        if (!folderPath) return;
        const shouldBeOpen = !liElement.classList.contains('open');
        const allFolderElements = document.querySelectorAll(`.folder-item[data-folder-path="${folderPath}"]`);
        allFolderElements.forEach(folderEl => {
            folderEl.classList.toggle('open', shouldBeOpen);
            const button = folderEl.querySelector('.toggle-button');
            if (button) {
                button.textContent = shouldBeOpen ? '折り畳み' : '展開';
            }
        });
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
            if (audioPlayer.paused) playNextSong();
        }
    }
}

async function playSong(songRecord) {
	if (!songRecord) return;

    currentSongPath = songRecord.path;

    const file = songRecord.file;
    const props = songProperties[songRecord.path] || {};

    // ▼▼▼ 履歴追加ロジック ▼▼▼
    let historyPath = songRecord.path;
    
    // ★ここで宣言済み (1回目)
    const pathParts = songRecord.path.split('/');
    
    // 配列の後ろ（ファイル名に近い方）から順に親フォルダをチェック
    for (let i = pathParts.length - 2; i >= 0; i--) {
        const parentPath = pathParts.slice(0, i + 1).join('/');
        const parentProps = songProperties[parentPath] || {};
        
        if (parentProps.isDerivative) {
            // 親が派生曲フォルダだった場合、履歴には「フォルダのパス」を採用
            historyPath = parentPath; 
            break; // 一番近い派生親を見つけたら終了
        }
    }

    // 履歴の先頭と同じでなければ追加（連続再生時の履歴汚染防止）
    if (recentlyPlayed[0] !== historyPath) {
        recentlyPlayed.unshift(historyPath);
        if (recentlyPlayed.length > 200) recentlyPlayed.pop();
        await saveProperties('recentlyPlayed', recentlyPlayed);
    }
    // ▲▲▲ 履歴処理ここまで ▲▲▲
	
    // プロパティからループ情報を取得
    let loopStart = 0;
    let loopEnd = 0;
    if (props.isLoopCompatible && props.isLoopTimeLocked) {
        loopStart = props.loopStartTime || 0;
        loopEnd = props.loopEndTime || 0;
    }

    try {
        // エンジン経由で再生（iOSなら今まで通り、PCならWebAudioで再生）
        await musicEngine.play(file, loopStart, loopEnd);
        
        // PCモード(WebAudio)の場合、標準プレイヤーのUIが自動で動かないため
        // 手動でtimeupdateを発火させるタイマーが必要になる場合がありますが、
        // 簡易実装として、次のステップのhandleTimeUpdateで対応します。
        
    } catch (error) {
        console.error('Playback failed:', error);
    }

	const songDisplayName = (props.name && props.name.trim() !== '') ? props.name : (file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
	playerSongName.textContent = songDisplayName;
	let gameName = 'N/A';
    let gameFolderPath = rootPath;
    
    // ★修正: ここにあった `const pathParts = ...` を削除しました。
    // 上で宣言した変数をそのまま使います。

	for (let i = pathParts.length - 2; i >= 0; i--) {
		const parentPath = pathParts.slice(0, i + 1).join('/');
		const parentProps = songProperties[parentPath] || {};
		if (parentProps.isGame) {
			gameName = (parentProps.name && parentProps.name.trim() !== '') ? parentProps.name : pathParts[i];
            gameFolderPath = parentPath;
			break;
		}
	}
	playerGameName.textContent = gameName;
    await displayArtwork(gameFolderPath);

    if(activeRandomFolderPath) {
        const folderProps = songProperties[activeRandomFolderPath] || {};
        playerFolderName.textContent = folderProps.name || activeRandomFolderPath.split('/').pop();
    } else {
        playerFolderName.textContent = '全曲';
    }

	if ('mediaSession' in navigator) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: songDisplayName, artist: gameName, album: '多機能ミュージックリスト',
			artwork: [ { src: playerArtwork.src, sizes: '512x512', type: 'image/png' } ]
		});
		navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
		navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
		navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong());
		navigator.mediaSession.setActionHandler('previoustrack', () => rewindFiveSeconds());
		try {
			navigator.mediaSession.setActionHandler('seekto', (details) => { audioPlayer.currentTime = details.seekTime; });
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
        const initialLangName = currentLyricsData.languages[0].name;
        applyLanguageStyle(initialLangName);
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
    // 1. 再生予約があればそれを優先
    if (nextSongToPlay) {
        playSong(nextSongToPlay);
        nextSongToPlay = null;
        return;
    }

    // 2. 再生範囲（フォルダ）の決定
    if (!activeRandomFolderPath && rootPath) {
        activeRandomFolderPath = rootPath;
    }
    if (!activeRandomFolderPath) return;

    // ★例外対応: もし現在の「再生範囲」自体が派生曲フォルダなら、いきなり内部抽選へ
    const currentFolderProps = songProperties[activeRandomFolderPath] || {};
    if (currentFolderProps.isDerivative) {
        const selectedSong = selectDerivativeSong(activeRandomFolderPath);
        if (selectedSong) playSong(selectedSong);
        return;
    }

    // 3. 候補リストの取得（派生曲フォルダは1アイテムとして混ざっている）
    const playlist = getPlaylist(activeRandomFolderPath);
    if (playlist.length === 0) return;
    
    // 4. 除外リスト（再生履歴）の準備
    // 履歴には「曲パス」と「派生フォルダパス」が混ざっているが、文字列比較で除外可能
    const exclusionCount = Math.floor(Math.min(50, playlist.length / 2));
    const excludedPaths = recentlyPlayed.slice(0, exclusionCount);
    
    // 5. 重み付けリストの作成
    const weightedList = [];
    let totalWeight = 0;

    for (const item of playlist) {
        // item.path が除外リストにあればスキップ
        // （派生曲フォルダの場合、フォルダパスが履歴にあるのでここで除外される）
        if (excludedPaths.includes(item.path)) continue;
        
        // 倍率の取得
        // item.multiplier は getPlaylist でセットしたもの（フォルダの場合）
        // ファイルの場合は songProperties から取得
        let multiplier = 1.0;
        if (item.isFolder) {
            multiplier = (typeof item.multiplier === 'number') ? item.multiplier : 1.0;
        } else {
            const p = songProperties[item.path] || {};
            multiplier = (typeof p.multiplier === 'number') ? p.multiplier : 1.0;
        }

        if (multiplier > 0) {
            weightedList.push({ item: item, weight: multiplier });
            totalWeight += multiplier;
        }
    }

    // 6. 抽選実行
    let selectedItem = null;
    if (weightedList.length > 0) {
        let randomValue = Math.random() * totalWeight;
        for (const entry of weightedList) {
            randomValue -= entry.weight;
            if (randomValue <= 0) {
                selectedItem = entry.item;
                break;
            }
        }
    } else if (playlist.length > 0) {
        // すべて除外されている場合の救済措置（ランダム）
        const nonExcluded = playlist.filter(i => !excludedPaths.includes(i.path));
        const targetList = nonExcluded.length > 0 ? nonExcluded : playlist;
        selectedItem = targetList[Math.floor(Math.random() * targetList.length)];
    }

    if (!selectedItem) return;

    // 7. 選ばれたアイテムの種類に応じた処理
    if (selectedItem.isFolder) {
        // 派生曲フォルダが当たった → その中から1曲選ぶ
        const song = selectDerivativeSong(selectedItem.path);
        if (song) playSong(song);
    } else {
        // 通常の曲が当たった
        playSong(selectedItem);
    }
}

function handleViewToggle(event) {
    if (event.target.tagName === 'BUTTON') {
        switchLyricsView(event.target.dataset.view);
    }
}

function switchLyricsView(view) {
    currentPlayerView = view;
    playerScreen.classList.remove('view-normal', 'view-partial', 'view-full');
    playerScreen.classList.add(`view-${view}`);
    
    lyricsViewToggle.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

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
        const newLangName = currentLyricsData.languages[currentLyricsLang].name;
        applyLanguageStyle(newLangName);
        if (currentPlayerView === 'full') renderFullLyrics();
        updateLyricsDisplay();
    }
}

function updateLyricsDisplay() {
    if (!currentLyricsData || currentPlayerView === 'normal') return;

    let currentTime;
    if (musicEngine && !isIOS) {
        currentTime = musicEngine.getCurrentTime();
    } else {
        currentTime = audioPlayer.currentTime;
    }
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
            const icon = (props.isDerivative) ? '🎵' : '📁';
            itemContent.textContent = `${icon} ${displayName}`;
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

async function showPropertiesPanel(resetData = true) {
    if (!selectedItemPath || !detailSettingsView.classList.contains('active')) {
        propertiesPanel.style.display = 'none';
        return;
    }
    const props = songProperties[selectedItemPath] || {};
    propSortOrder.value = props.sortOrder || 0;
    propMemo.value = props.memo || '';
    autoResizeTextarea(propMemo);

    if (isSelectedItemFolder) {
        propItemName.textContent = selectedItemPath.split('/').pop();
        propDisplayName.value = props.name || '';
        propIsGame.checked = props.isGame || false;
        
        const isGameFolder = propIsGame.checked;
        artworkManagementUI.classList.toggle('hidden', !isGameFolder);
        if (isGameFolder) {
            await displayArtwork(selectedItemPath, artworkPreview);
        }

        const isDerivative = props.isDerivative || false;
        propIsDerivative.checked = isDerivative;
        derivativeSettingsPanel.classList.toggle('hidden', !isDerivative);
        propDerivativeMultiplier.value = (typeof props.multiplier === 'number') ? props.multiplier : 1.0;

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
            
            fileTree = buildFileTree(libraryFiles);
            rootPath = Object.keys(fileTree)[0] || null;

            if(rootPath && !songProperties[rootPath]){
                songProperties[rootPath] = {};
            }
            if(rootPath){
                songProperties[rootPath].isGame = true; // ルートは常にGameフォルダ
            }

            if (!activeRandomFolderPath) {
                activeRandomFolderPath = rootPath;
            }
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

// ▼▼▼ 変更: 再生リスト取得ロジック（派生曲フォルダ対応版） ▼▼▼
function getPlaylist(folderPath) {
    const root = folderPath || activeRandomFolderPath;
    if (!root) return [];
    
    // パスを基にツリー内の探索開始ノードを特定
    const pathParts = root.split('/');
    let targetNode = fileTree;
    
    // ルートパス("/") ではない場合、ツリーを降りて対象ノードを探す
    // ※ fileTreeの構造上、ルートキーから順に辿る必要があるため
    if (root !== rootPath || (rootPath && rootPath.includes('/'))) {
        for (const part of pathParts) {
            targetNode = targetNode ? targetNode[part] : undefined;
        }
    } else {
        // ルートの場合
        targetNode = fileTree[root] || fileTree;
    }

    if (!targetNode) return [];

    // 探索開始 (再帰関数へ)
    return traverseForPlaylist(targetNode, root);
}

// ▼▼▼ 追加: 再生リスト作成用の再帰探索関数 ▼▼▼
function traverseForPlaylist(node, currentPath) {
    let candidates = [];

    for (const key in node) {
        // "path" や "file" プロパティはツリー構造ではないのでスキップ（ファイルのレコードなど）
        if (key === 'path' || key === 'file') continue; 
        
        const value = node[key];
        
        // パスを特定する
        // ファイルなら自分のパスレコードを持っている。フォルダなら現在のパスにキーを足して構築する。
        const itemPath = (value.file instanceof File) ? value.path : `${currentPath}/${key}`;
        
        if (value.file instanceof File) {
            // [A] 通常のファイルの場合 -> そのまま候補リストへ
            candidates.push(value);
        } else {
            // [B] フォルダの場合
            const props = songProperties[itemPath] || {};
            
            if (props.isDerivative) {
                // 派生曲フォルダなら、中身を展開せず「1つのアイテム（フォルダ）」として追加
                candidates.push({ 
                    path: itemPath, 
                    isFolder: true, 
                    // 後の抽選で使うためにここで倍率を取得しておく
                    multiplier: (typeof props.multiplier === 'number') ? props.multiplier : 1.0 
                });
            } else {
                // カテゴリフォルダ（普通のフォルダ）なら、さらに深く探索（再帰）
                candidates = candidates.concat(traverseForPlaylist(value, itemPath));
            }
        }
    }
    return candidates;
}

// ▼▼▼ 追加: 派生曲フォルダ内での抽選関数 ▼▼▼
function selectDerivativeSong(folderPath) {
    // 1. 対象フォルダのノードを特定
    const pathParts = folderPath.split('/');
    let node = fileTree;
    
    // ルート判定（念のため）
    if (folderPath === rootPath && fileTree[rootPath]) {
        node = fileTree[rootPath];
    } else {
        for (const part of pathParts) {
            node = node ? node[part] : undefined;
        }
    }
    
    if (!node) return null;
    
    // 2. フォルダ内の全ファイルをフラットに取得
    // ※ここで既存の getFilesFromNode を利用します（消さずに残しておいてください）
    const candidates = getFilesFromNode(node);
    if (candidates.length === 0) return null;

    // 3. 重み付け抽選ロジック
    let totalWeight = 0;
    const weightedList = [];

    for (const record of candidates) {
        const p = songProperties[record.path] || {};
        const m = (typeof p.multiplier === 'number') ? p.multiplier : 1.0;
        if (m > 0) {
            weightedList.push({ record: record, weight: m });
            totalWeight += m;
        }
    }

    if (weightedList.length === 0) return null;

    let randomValue = Math.random() * totalWeight;
    for (const item of weightedList) {
        randomValue -= item.weight;
        if (randomValue <= 0) {
            return item.record;
        }
    }
    // 計算誤差対策で、ループを抜けた場合は最後の曲を返す
    return weightedList[weightedList.length - 1].record;
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
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function timeStringToSeconds(timeString) {
    if (!timeString || typeof timeString !== 'string') return 0;
    const parts = timeString.match(/(\d+):(\d+).(\d+)/);
    if (!parts) return 0;
    const [, minutes, seconds, milliseconds] = parts.map(Number);
    return minutes * 60 + seconds + milliseconds / 1000;
}

function updateMediaPosition(currentTime, duration) {
    if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
        // 引数がなければaudioPlayerから取る（後方互換）
        const cTime = currentTime !== undefined ? currentTime : (audioPlayer ? audioPlayer.currentTime : 0);
        const dur = duration !== undefined ? duration : (audioPlayer ? audioPlayer.duration : 0);
        
        navigator.mediaSession.setPositionState({
            duration: dur || 0,
            playbackRate: audioPlayer.playbackRate || 1,
            position: cTime || 0,
        });
    }
}

function applyLanguageStyle(langName) {
    const isNewWorld = (langName === '新世界語');
    
    // 部分表示と全文表示の両方のコンテナを取得
    const partialContainer = document.getElementById('partial-lyrics-display');
    const fullContainer = document.getElementById('full-lyrics-display');

    if (isNewWorld) {
        partialContainer.classList.add('lang-newworld');
        fullContainer.classList.add('lang-newworld');
    } else {
        partialContainer.classList.remove('lang-newworld');
        fullContainer.classList.remove('lang-newworld');
    }
}

function autoResizeTextarea(element) {
    element.style.height = 'auto'; // 一旦高さをリセット
    element.style.height = element.scrollHeight + 'px'; // 内容に合わせて高さを設定
}