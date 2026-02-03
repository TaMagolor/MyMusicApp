// =================================================================
// アプリのバージョン
// =================================================================
const APP_VERSION = 'v.5.2.2'; // Fixed property panel UI bugs

// =================================================================
// HTML要素の取得
// =================================================================
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
// ローディングオーバーレイ
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.innerHTML = '<div>データを処理中...</div>';
loadingOverlay.style.display = 'none';
document.body.appendChild(loadingOverlay);

// プレイヤー画面
const playerScreen = document.getElementById('player-screen');
// プレイヤー画面 > 画面中央部
const playerMainUI = document.getElementById('player-main-ui');
const playerFolderName = document.getElementById('player-folder-name');
const playerArtwork = document.getElementById('player-artwork');
const playerSongName = document.getElementById('player-song-name');
const playerGameName = document.getElementById('player-game-name');
// プレイヤー画面 > 画面中央部 > カスタムシークバー
const audioPlayer = document.getElementById('audioPlayer');
const customSeekbarContainer = document.getElementById('custom-seekbar-container');
const customSeekbar = document.getElementById('custom-seekbar');
const currentTimeLabel = document.getElementById('current-time');
const totalTimeLabel = document.getElementById('total-time');
// プレイヤー画面 > 画面中央部 > オーディオ操作ボタン
const ctrlPrevButton = document.getElementById('ctrl-prev-button');
const ctrlPlayPauseButton = document.getElementById('ctrl-play-pause-button');
const ctrlNextButton = document.getElementById('ctrl-next-button');
// プレイヤー画面 > 画面中央部 > 歌詞のウィンドウ
const lyricsDisplayContainer = document.getElementById('lyrics-display-container');
const partialLyricsDisplay = document.getElementById('partial-lyrics-display');
const fullLyricsDisplay = document.getElementById('full-lyrics-display');

// プレイヤー画面 > 画面下部 > 耐久モードボタン
const enduranceMenuContainer = document.getElementById('endurance-menu-container');
const enduranceSelect = document.getElementById('endurance-select');
// プレイヤー画面 > 画面下部 > 歌詞の切り替えボタン
const lyricsControlsContainer = document.getElementById('lyrics-controls-container');
const lyricsControls = document.getElementById('lyrics-controls');
const lyricsLanguageSelector = document.getElementById('lyrics-language-selector');
const lyricsViewToggle = document.getElementById('lyrics-view-toggle');

// 一覧画面
const listScreen = document.getElementById('list-screen');
// 一覧画面 > ツリー表示
const listTreeViewContainer = document.getElementById('list-tree-view-container');
// 一覧画面 > ランダム再生 / 再生予約 ボタン
const listRandomButton = document.getElementById('list-random-button');

// 全般設定画面
const settingsScreen = document.getElementById('settings-screen');
const mainSettingsView = document.getElementById('main-settings');
const versionDisplay = document.getElementById('versionDisplay');
const fileInput = document.getElementById('fileInput');
const importInput = document.getElementById('import-settings-input');
const exportButton = document.getElementById('export-settings-button');
const artworkFolderInput = document.getElementById('artwork-folder-input');
const gotoDetailSettingsButton = document.getElementById('goto-detail-settings-button');
// 全般設定画面 > 詳細設定画面
const detailSettingsView = document.getElementById('detail-settings');
// 全般設定画面 > 詳細設定画面 > 上画面（ツリー表示）
const settingsTreeViewContainer = document.getElementById('settings-tree-view-container');
// 全般設定画面 > 詳細設定画面 > 下画面
const propertiesPanel = document.getElementById('properties-panel');
const savePropertiesButton = document.getElementById('save-properties-button');

// 全般設定画面 > 詳細設定画面 > 下画面 > フォルダ・ファイル共通
const backToMainSettingsButton = document.getElementById('back-to-main-settings-button');
const propItemName = document.getElementById('prop-item-name');
const propDisplayName = document.getElementById('prop-display-name');
const propSortOrder = document.getElementById('prop-sort-order');

// 全般設定画面 > 詳細設定画面 > 下画面 > 曲ファイルのみ
const songSpecificSettings = document.getElementById('song-specific-settings');
const propMultiplier = document.getElementById('prop-lottery-multiplier');
// 全般設定画面 > 詳細設定画面 > 下画面 > 曲ファイルのみ > ループに対応
const loopFeatureContainer = document.getElementById('loop-feature-container');
const propLoopCompatible = document.getElementById('prop-loop-compatible');
const loopSettingsPanel = document.getElementById('loop-settings-panel');
const loopLockContainer = document.getElementById('loop-lock-container');
const propLoopTimeLocked = document.getElementById('prop-loop-time-locked');
const propLoopStart = document.getElementById('prop-loop-start');
const propLoopEnd = document.getElementById('prop-loop-end');
const propLoopStartAuto = document.getElementById('prop-loop-start-auto');
const propLoopEndAuto = document.getElementById('prop-loop-end-auto');
// 全般設定画面 > 詳細設定画面 > 下画面 > 曲ファイルのみ > 歌詞の表示
const propLyricsCompatible = document.getElementById('prop-lyrics-compatible');
const lyricsSettingsPanel = document.getElementById('lyrics-settings-panel');
const propLyricsLangCount = document.getElementById('prop-lyrics-lang-count');
const propLyricsCurrentLang = document.getElementById('prop-lyrics-current-lang');
const propLyricsLangName = document.getElementById('prop-lyrics-lang-name');
const propLyricsTimings = document.getElementById('prop-lyrics-timings');
const propLyricsText = document.getElementById('prop-lyrics-text');

// 全般設定画面 > 詳細設定画面 > 下画面 > フォルダのみ（カテゴリフォルダ、派生曲所有フォルダ）
const folderSpecificSettings = document.getElementById('folder-specific-settings');
const propIsGame = document.getElementById('prop-is-game');
const artworkManagementUI = document.getElementById('artwork-management-ui');
const artworkPreview = document.getElementById('artwork-preview');
const artworkUploadInput = document.getElementById('artwork-upload-input');
const artworkRemoveButton = document.getElementById('artwork-remove-button');
// 全般設定画面 > 詳細設定画面 > 下画面 > フォルダのみ（カテゴリフォルダ、派生曲所有フォルダ） > 派生曲所有フォルダ
const propIsDerivative = document.getElementById('prop-is-derivative');
const derivativeSettingsPanel = document.getElementById('derivative-settings-panel');
const propDerivativeMultiplier = document.getElementById('prop-derivative-multiplier');

// 全般設定画面 > 詳細設定画面 > 下画面 > メモ機能
const propMemo = document.getElementById('prop-memo');

// 画面切り替えバー
const navPlayerButton = document.getElementById('nav-player');
const navListButton = document.getElementById('nav-list');
const navSettingsButton = document.getElementById('nav-settings');

// =================================================================
// グローバル変数
// =================================================================

// オーディオ関連
let musicEngine = null;
let isDraggingSeekbar = false;
let recentlyPlayed = [];
let songProperties = {};
let nextSongToPlay = null;
let activeRandomFolderPath = null;
let currentSongPath = null;
let currentPlayerView = 'normal';
// 耐久モード関連
let currentEnduranceMinutes = 0; // 現在の耐久モード（分）。0は無効
let currentLoopCount = 0;
let currentSongTargetLoopCount = 1; // 現在再生中の曲の目標ループ回数
// 歌詞関連
let lyricsUpdateInterval = null;
let currentLyricsData = null;
let currentLyricsLang = 0;
// ツリー関連
let libraryFiles = [];
let fileTree = {};
let selectedItemPath = null;
let isSelectedItemFolder = false;
let rootPath = null; // ルートディレクトリのパスを保持

// =================================================================
// OSの判断とオーディオ形式
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

    // 曲の再生
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

    pause() { 
        this.element.pause(); 
    }

    // ★追加: 再開処理
    resume() { 
        if (this.element.paused && this.element.src) {
            this.element.play();
        }
    }
    
    // UI同期のために現在の時間を返す
    getCurrentTime() { return this.element.currentTime; }
    getDuration() { return this.element.duration; }
    
    // ★追加: 停止状態の判定
    getPaused() { return this.element.paused; }

    updateEnduranceMode(minutes) {
        // iOSでは耐久モード非対応のため何もしない
    }
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
        this.isPlaying = false; 
        this.buffer = null;
        
        this.currentLoopStart = 0;
        this.currentLoopEnd = 0;
        
        // 監視用タイマーID
        this.monitorInterval = null;
        // この周回で既にカウントアップ（判定）を済ませたかどうかのフラグ
        this.isCountedInThisLoop = false;
    }

    // 曲の再生
    async play(file, loopStart, loopEnd) {
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        
        this.stop(); // 既存の再生を完全停止

        const arrayBuffer = await file.arrayBuffer();
        this.buffer = await this.ctx.decodeAudioData(arrayBuffer);

        this.currentLoopStart = loopStart;
        this.currentLoopEnd = loopEnd;
        // グローバルのループカウント変数をリセット
        currentLoopCount = 0; 
        this.isCountedInThisLoop = false;

        // 再生開始時に、現在のグローバル設定(currentEnduranceMinutes)を反映して目標回数を計算
        this.updateEnduranceMode(currentEnduranceMinutes);

        this.playBuffer(0);
    }

    playBuffer(offset) {
        if (!this.buffer) return;
        
        this.stopSource(); // 重複再生防止

        const sourceNode = this.ctx.createBufferSource();
        sourceNode.buffer = this.buffer;
        sourceNode.connect(this.gainNode);
        
        this.source = sourceNode;

        const isLoopingConfigured = (this.currentLoopEnd > 0 && this.currentLoopEnd > this.currentLoopStart);
        const isOutro = (this.currentLoopEnd > 0 && offset >= this.currentLoopEnd);
        const isTargetReached = (currentSongTargetLoopCount > 0 && currentLoopCount >= currentSongTargetLoopCount);
        
        if (isLoopingConfigured && !isOutro && !isTargetReached) {
            this.source.loop = true;
            this.source.loopStart = this.currentLoopStart;
            this.source.loopEnd = this.currentLoopEnd;
            
            // ループ監視を開始
            this.startLoopMonitor();
        } else {
            this.source.loop = false;
        }

        this.source.onended = () => {
            // 再生終了時の処理
            if (this.isPlaying && this.source === sourceNode && !this.source.loop) {
                this.stopLoopMonitor(); // 監視停止
                this.isPlaying = false;
                const event = new Event('ended');
                document.getElementById('audioPlayer').dispatchEvent(event);
            }
        };

        this.source.start(0, offset);
        this.startedAt = this.ctx.currentTime - offset;
        this.pausedAt = 0;
        this.isPlaying = true;

        // 再開時は、その位置が既に判定ラインを超えているか確認してフラグを初期化
        // 基本的には false (未カウント) スタートで良いが、
        // 判定ラインを超えた位置から再開した場合の重複カウントを防ぐため
        // 再開位置が閾値を超えていれば「済み」とするのが安全
        const loopDuration = this.currentLoopEnd - this.currentLoopStart;
        if (loopDuration > 0) {
            const margin = Math.min(5, loopDuration / 2);
            const threshold = this.currentLoopEnd - margin;
            
            // 現在位置（ループ補正後）を取得して判定
            // ※ここでは簡易的に offset を使うが、厳密にはループ内位置に変換が必要
            let initialPosition = offset;
            if (offset >= this.currentLoopStart) {
                initialPosition = this.currentLoopStart + ((offset - this.currentLoopStart) % loopDuration);
            }
            
            if (initialPosition >= threshold) {
                this.isCountedInThisLoop = true;
            } else {
                this.isCountedInThisLoop = false;
            }
        } else {
            this.isCountedInThisLoop = false;
        }
    }

    // 耐久設定が変更されたら呼ばれる関数
    updateEnduranceMode(minutes) {
        const duration = this.getDuration();
        // グローバルの計算関数を使って目標回数を更新
        currentSongTargetLoopCount = calculateTargetLoopCount(
            minutes, 
            this.currentLoopStart, 
            this.currentLoopEnd, 
            duration
        );
        console.log(`Endurance Update: ${minutes}min -> Target: ${currentSongTargetLoopCount}, Current: ${currentLoopCount}`);
        
        // 設定変更時に既に目標を超えていたら、ループを切る
        // （判定ライン通過前でも、ここで切っておけば通過時に何もせず抜ける）
        if (this.source && this.source.loop && currentLoopCount >= currentSongTargetLoopCount) {
            this.source.loop = false;
        }
    }

    // ループ監視機能（ポーリング）
    startLoopMonitor() {
        this.stopLoopMonitor(); // 二重起動防止
        
        // 判定のマージン（秒）。基本は5秒前。
        // ループ区間が短い場合は「長さの半分」を手前にする
        const loopDuration = this.currentLoopEnd - this.currentLoopStart;
        const margin = Math.min(5, loopDuration / 2);
        
        // 判定ライン（秒）
        const threshold = this.currentLoopEnd - margin;

        this.monitorInterval = setInterval(() => {
            if (!this.isPlaying || !this.source || !this.source.loop) return;

            // 現在の再生位置（ループ補正済み）を取得
            const currentTime = this.getCurrentTimeForMonitor();

            // ■ 判定ロジック
            // 1. 現在位置が「判定ライン」を超えているか？
            if (currentTime >= threshold) {
                // 2. この周回でまだ処理していないか？
                if (!this.isCountedInThisLoop) {
                    // ★ここが「ループ終了5秒前」のタイミング
                    currentLoopCount++;
                    this.isCountedInThisLoop = true; // 処理済みフラグを立てる

                    console.log(`Approaching loop end. Count: ${currentLoopCount} / ${currentSongTargetLoopCount}`);

                    // 目標回数に達していれば、ここでループを切る
                    // （API仕様により、このまま再生が進んでループ端に達するとアウトロへ抜ける）
                    if (currentLoopCount >= currentSongTargetLoopCount) {
                        console.log("Target reached. Setting loop = false.");
                        this.source.loop = false;
                    }
                }
            } else {
                // 判定ラインより手前にいる場合（ループして戻った直後など）
                // 次の周回判定のためにフラグを下ろす
                if (currentTime < threshold) {
                    this.isCountedInThisLoop = false;
                }
            }

        }, 100); // 100ms間隔で監視
    }

    stopLoopMonitor() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
    }

    seek(time) {
        if (!this.buffer) return;
        time = Math.max(0, Math.min(time, this.buffer.duration));
        
        if (this.isPlaying) {
            this.isPlaying = false;
            this.stopSource();
            // 現在のループ回数などの状態は維持したまま、新しい位置から再生
            this.playBuffer(time);
        } else {
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
        if (!this.isPlaying && this.buffer) {
            this.playBuffer(this.pausedAt);
        }
    }

    stopSource() {
        this.stopLoopMonitor(); // 監視も停止
        if (this.source) {
            try { this.source.stop(); } catch(e) {}
            this.source.disconnect();
        }
    }

    stop() {
        this.isPlaying = false;
        this.stopSource();
        this.source = null;
        this.pausedAt = 0;
        // 停止時はカウントリセット
        currentLoopCount = 0;
    }

    // UI表示などで使用する現在の再生時間（ループ補正済み）
    getCurrentTime() {
        if (this.ctx.state === 'suspended' || !this.isPlaying) return this.pausedAt; 
        return this.getCurrentTimeForMonitor();
    }

    // 内部計算用の再生時間取得
    getCurrentTimeForMonitor() {
        if (this.ctx.state === 'suspended' || !this.isPlaying) return this.pausedAt;
        
        let time = this.ctx.currentTime - this.startedAt;
        
        // WebAudioのループ補正
        if(this.source && this.source.loop) {
            const duration = this.source.loopEnd - this.source.loopStart;
            if(time >= this.source.loopStart) {
                time = this.source.loopStart + ((time - this.source.loopStart) % duration);
            }
        } else if (currentLoopCount > 0 && loopDuration > 0) {
            // ★追加: ループ終了後のアウトロ再生中
            // 「経過した総時間」から「ループで消費した時間」を引くことで、元のバッファ上の位置に戻す
            time = time - (currentLoopCount * loopDuration);
        }
        return Math.max(0, time);
    }
    
    getDuration() { return this.buffer ? this.buffer.duration : 0; }
    getPaused() { return !this.isPlaying; }
}

// =================================================================
// アプリの初期化
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
    updatePlayButtonIcon(false);
    updateSeekbarVisuals();
	if (versionDisplay) {
		versionDisplay.textContent = APP_VERSION;
	}
	await loadDataFromDB();
    if (rootPath) {
        await displayArtwork(rootPath); // アプリ起動時にデフォルトアートワークを表示
    }
});

// =================================================================
// イベントリスナー
// =================================================================

// プレイヤー画面 > 画面中央部 > カスタムシークバー
audioPlayer.addEventListener('timeupdate', handleTimeUpdate);
audioPlayer.addEventListener('ended', handleSongEnd);
customSeekbar.addEventListener('input', handleSeekbarInput);
customSeekbar.addEventListener('change', handleSeekbarChange);
// プレイヤー画面 > 画面中央部 > オーディオ操作ボタン
ctrlPrevButton.addEventListener('click', handlePrevButton);
ctrlPlayPauseButton.addEventListener('click', handlePlayPause);
if (ctrlNextButton) {
    ctrlNextButton.addEventListener('click', playNextSong);
}
// プレイヤー画面 > 画面下部 > 耐久モードボタン
enduranceSelect.addEventListener('change', handleEnduranceChange);
// プレイヤー画面 > 画面下部 > 歌詞の切り替えボタン
lyricsLanguageSelector.addEventListener('click', handleLanguageChange);
lyricsViewToggle.addEventListener('click', handleViewToggle);
// 一覧画面 > ランダム再生 / 再生予約 ボタン
listRandomButton.addEventListener('click', handleRandomButton);
// 全般設定画面
fileInput.addEventListener('change', handleFileInputChange);
importInput.addEventListener('change', handleImport);
exportButton.addEventListener('click', handleExport);
if (artworkFolderInput) {
    artworkFolderInput.addEventListener('change', handleArtworkFolderRecovery);
}
gotoDetailSettingsButton.addEventListener('click', () => switchSettingsView('detail'));
// 全般設定画面 > 詳細設定画面 > 下画面
backToMainSettingsButton.addEventListener('click', () => switchSettingsView('main'));
savePropertiesButton.addEventListener('click', handleSaveProperties);
// 全般設定画面 > 詳細設定画面 > 下画面 > 曲ファイルのみ > ループに対応
propLoopCompatible.addEventListener('change', handleLoopCompatibleChange);
// 全般設定画面 > 詳細設定画面 > 下画面 > 曲ファイルのみ > 歌詞の表示
propLyricsCompatible.addEventListener('change', handleLyricsCompatibleChange);
propLyricsLangCount.addEventListener('change', handleLyricsSettingChange);
propLyricsCurrentLang.addEventListener('change', handleLyricsSettingChange);
propLyricsTimings.addEventListener('input', autoResizeLyricsEditor);
propLyricsText.addEventListener('input', autoResizeLyricsEditor);
// 全般設定画面 > 詳細設定画面 > 下画面 > フォルダのみ（カテゴリフォルダ、派生曲所有フォルダ） > Gameフォルダとしてマーク
propIsGame.addEventListener('change', handleGameChange);
artworkUploadInput.addEventListener('change', handleArtworkUpload);
artworkRemoveButton.addEventListener('click', handleArtworkRemove);
// 全般設定画面 > 詳細設定画面 > 下画面 > フォルダのみ（カテゴリフォルダ、派生曲所有フォルダ） > 派生曲所有フォルダ
if (propIsDerivative) {
    propIsDerivative.addEventListener('change', handleDerivativeChange);
}
// 全般設定画面 > 詳細設定画面 > 下画面 > メモ機能
if (propMemo) {
    propMemo.addEventListener('input', () => autoResizeTextarea(propMemo));
}
// 画面切り替えバー
navPlayerButton.addEventListener('click', () => switchScreen('player'));
navListButton.addEventListener('click', () => switchScreen('list'));
navSettingsButton.addEventListener('click', () => switchScreen('settings'));
// 一覧画面 > ツリー表示
// 全般設定画面 > 詳細設定画面 > 上画面（ツリー表示）
listTreeViewContainer.addEventListener('click', handleTreeClick);
settingsTreeViewContainer.addEventListener('click', handleTreeClick);

// =================================================================
// イベントハンドラ
// =================================================================

// オーディオの時間更新
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
            updateSeekbarVisuals();
        }
        // 歌詞表示のために audioPlayerの時間を擬似的にハックするのは難しいので、
        // updateLyricsDisplay関数の方で musicEngine.getCurrentTime() を参照するように修正するのがベストです。
        // ここではMediaSessionの更新を行います。
    } else {
        currentTime = audioPlayer.currentTime;
        duration = audioPlayer.duration;

        if (!isDraggingSeekbar) {
            const safeDuration = duration || 0;
            customSeekbar.max = safeDuration || 100;
            customSeekbar.value = currentTime || 0;
            currentTimeLabel.textContent = formatTime(currentTime);
            totalTimeLabel.textContent = formatTime(safeDuration);
            
            // 色更新
            updateSeekbarVisuals();
        }
    }
    
    updateMediaPosition(currentTime, duration);
}

// 曲の終了
function handleSongEnd(event) {
    if (event && event.target !== audioPlayer) return;
    if (lyricsUpdateInterval) clearInterval(lyricsUpdateInterval);
    setTimeout(playNextSong, 800);
}

// シークバーをタップ
function handleSeekbarInput() {
    isDraggingSeekbar = true;
    currentTimeLabel.textContent = formatTime(customSeekbar.value);
    updateSeekbarVisuals();
}

// シークバーのタップを離す
function handleSeekbarChange() {
    if (musicEngine) {
        // 数値に変換して渡す
        musicEngine.seek(parseFloat(customSeekbar.value));
    }
    isDraggingSeekbar = false;
}

// 5秒巻き戻し
function handlePrevButton() {
    if (musicEngine) {
        const current = musicEngine.getCurrentTime();
        musicEngine.seek(Math.max(0, current - 5));
    }
}

// 再生・停止ボタン
function handlePlayPause() {
    if (!musicEngine) return;
    
    // 曲が入っていない（初期状態）のときだけ、Nextボタンと同じ処理（ランダム再生等）を行う
    if (musicEngine.getDuration() === 0 && !currentSongPath) {
        handleRandomButton(); 
        return;
    }

    // それ以外は、現在セットされている曲を 再生/一時停止 するだけ
    if (musicEngine.getPaused()) {
        musicEngine.resume();
        updatePlayButtonIcon(true);
    } else {
        musicEngine.pause();
        updatePlayButtonIcon(false);
    }
}

// 耐久モードボタン
function handleEnduranceChange() {
    // 1. 変数を更新
    const minutes = parseInt(enduranceSelect.value, 10);
    currentEnduranceMinutes = minutes;

    // 2. 現在再生中の曲に対して即時反映
    if (musicEngine && currentSongPath) {
        const props = songProperties[currentSongPath] || {};
        // ループ対応曲を再生中なら、エンジンの挙動を更新
        if (props.isLoopCompatible && props.isLoopTimeLocked) {
            musicEngine.updateEnduranceMode(currentEnduranceMinutes);
        }
    }
}

// 歌詞の切り替えボタンで言語を切り替える
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

// 歌詞の切り替えボタンで画面を切り替える
function handleViewToggle(event) {
    if (event.target.tagName === 'BUTTON') {
        switchLyricsView(event.target.dataset.view);
    }
}

// ランダム再生 / 再生予約 ボタン
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
            if (musicEngine && musicEngine.getPaused()) playNextSong();
        }
    }
}

// ファイルを選択
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

// 設定をインポート
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

// 設定をエクスポート
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

// アートワークフォルダ再現
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

// 詳細設定画面の「設定を保存」ボタン
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

// ループに対応 をチェック
function handleLoopCompatibleChange() {
    const isChecked = propLoopCompatible.checked;
    loopLockContainer.classList.toggle('hidden', !isChecked);
    loopSettingsPanel.classList.toggle('hidden', !isChecked);
    if (isChecked && selectedItemPath) {
        const props = songProperties[selectedItemPath] || {};
        // 設定があれば反映、なければ初期値
        propLoopTimeLocked.checked = props.isLoopTimeLocked || false;
        propLoopStart.value = (props.loopStartTime !== undefined) ? formatTimeWithMillis(props.loopStartTime) : '00:00.000';
        propLoopEnd.value = (props.loopEndTime !== undefined) ? formatTimeWithMillis(props.loopEndTime) : '01:00.000';
        
        // 自動計算表示のリセット
        propLoopStartAuto.textContent = '--:--.---';
        propLoopEndAuto.textContent = '--:--.---';
    }
}

// 詳細設定画面の歌詞の表示
function handleLyricsCompatibleChange() {
    const isChecked = propLyricsCompatible.checked;
    lyricsSettingsPanel.classList.toggle('hidden', !propLyricsCompatible.checked);
    if (isChecked && selectedItemPath) {
        const props = songProperties[selectedItemPath] || {};
        
        // 対応言語数（初期値: 1）
        propLyricsLangCount.value = props.lyricsLangCount || 1;
        // 表示言語（初期値: 0）
        propLyricsCurrentLang.value = 0; 
        
        // 言語名（初期値: 空文字）
        propLyricsLangName.value = (props.lyricsLangNames && props.lyricsLangNames[0]) ? props.lyricsLangNames[0] : '';
        
        // 歌詞データ（初期値: 空文字）
        const lyricsData = props.lyricsData || [];
        const timings = lyricsData.map(d => d.time);
        const lines = lyricsData.map(d => (d.lines && d.lines[0]) ? d.lines[0] : '');
        
        propLyricsTimings.value = timings.length > 0 ? timings.join('\n') : '';
        propLyricsText.value = lines.length > 0 ? lines.join('\n') : '';

        // リサイズ処理を予約
        setTimeout(autoResizeLyricsEditor, 0);
    }
}

// 詳細設定画面の歌詞の表示言語の切り替え
function handleLyricsSettingChange() {
    const props = songProperties[selectedItemPath] || {};
    if (!props) return;
    const previousLangIndex = parseInt(propLyricsCurrentLang.dataset.previousValue || '0', 10);
    saveCurrentLyricsLanguage(props, previousLangIndex);
    props.lyricsLangCount = parseInt(propLyricsLangCount.value, 10);
    songProperties[selectedItemPath] = props;
    showPropertiesPanel(false);
}

// Gameフォルダとしてマーク
async function handleGameChange() {
    const isChecked = propIsGame.checked;
    artworkManagementUI.classList.toggle('hidden', !isChecked);

    if (isChecked && selectedItemPath) {
        const props = songProperties[selectedItemPath] || {};
        if (props.hasArtwork) {
            await displayArtwork(selectedItemPath, artworkPreview);
        } else {
            artworkPreview.src = ''; // 何も表示しない
        }
    }
}

// 派生曲を持つ
function handleDerivativeChange() {
    const isChecked = propIsDerivative.checked;
    derivativeSettingsPanel.classList.toggle('hidden', !isChecked);

    if (isChecked && selectedItemPath) {
        const props = songProperties[selectedItemPath] || {};
        // 抽選倍率（初期値: 1）
        propDerivativeMultiplier.value = (typeof props.multiplier === 'number') ? props.multiplier : 1;
    }
}

// アートワークをアップロード
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

// アートワークを取り消し
async function handleArtworkRemove() {
    if (!selectedItemPath) return;

    await db.artworks.delete(selectedItemPath);
    const props = songProperties[selectedItemPath] || {};
    delete props.hasArtwork;
    songProperties[selectedItemPath] = props;
    await saveProperties('songProperties', songProperties);

    await displayArtwork(selectedItemPath, artworkPreview); // プレビューを更新（デフォルトに戻る）
}

// ツリー表示上のどこかをクリック
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

// =================================================================
// 関数
// =================================================================

// -----------------------------------------------------------------
// 次の曲の抽選に関する関数
// -----------------------------------------------------------------

// 重み付け抽選や履歴除外を行い、次に再生すべき曲（または派生曲）を決定して再生する。
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

    const isEnduranceActive = (currentEnduranceMinutes > 0);

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
            const baseMultiplier = (typeof p.multiplier === 'number') ? p.multiplier : 1.0;
            
            if (isEnduranceActive) {
                // 耐久モード有効時
                if (p.isLoopCompatible) {
                    multiplier = baseMultiplier * 1.0; // 対応曲はそのまま
                } else {
                    multiplier = baseMultiplier * 0.0; // 非対応曲は0倍（除外）
                }
            } else {
                // 耐久モード無効時
                multiplier = baseMultiplier * 1.0; // 全てそのまま
            }
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

// 指定された曲データの再生を開始し、履歴追加・UI更新・ループ設定・歌詞初期化を行う。
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
    const canEndure = !isIOS && props.isLoopCompatible && props.isLoopTimeLocked;
    
    if (canEndure) {
        loopStart = props.loopStartTime || 0;
        loopEnd = props.loopEndTime || 0;
    }

    if (!isIOS && props.isLoopCompatible && props.isLoopTimeLocked) {
        enduranceMenuContainer.classList.remove('hidden');
        
        // ★変更: 「現在の耐久モード」をUIに反映
        // もし曲がループ対応なら、現在の設定(currentEnduranceMinutes)を維持して表示
        // 曲が変わっても設定値はリセットしない（仕様）
        enduranceSelect.value = currentEnduranceMinutes.toString();
        
    } else {
        enduranceMenuContainer.classList.add('hidden');
        // 曲が対応していない場合、UIは隠すが内部変数は保持する（次に引き継ぐため）
        // ただし、この曲の再生に関しては実質「ループなし」として振る舞う
    }

    try {
        // エンジン経由で再生（iOSなら今まで通り、PCならWebAudioで再生）
        await musicEngine.play(file, loopStart, loopEnd);

        if (musicEngine && props.isLoopCompatible) {
            musicEngine.updateEnduranceMode(currentEnduranceMinutes);
        }
        
        // PCモード(WebAudio)の場合、標準プレイヤーのUIが自動で動かないため
        // 手動でtimeupdateを発火させるタイマーが必要になる場合がありますが、
        // 簡易実装として、次のステップのhandleTimeUpdateで対応します。
        
    } catch (error) {
        console.error('Playback failed:', error);
    }

    updatePlayButtonIcon(true);

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
        lyricsDisplayContainer.classList.remove('hidden');
        lyricsControlsContainer.classList.remove('hidden');
        setupLyricsControls(currentLyricsData.languages);
        switchLyricsView('normal');
        lyricsUpdateInterval = setInterval(updateLyricsDisplay, 250);
    } else {
        currentLyricsData = null;
        lyricsDisplayContainer.classList.add('hidden');
        lyricsControlsContainer.classList.add('hidden');
        switchLyricsView('normal');
    }
}

// 指定されたパス（またはルート/デフォルト）のアートワーク画像をプレイヤー画面に表示する。
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

// 指定フォルダ内の再生可能なリストを作成する（派生曲フォルダは1アイテムとして扱う）。
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

// フォルダ構造を再帰的に探索し、再生リストの候補を作成する。
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

// 派生曲フォルダの中から、重み付け抽選に基づいて1曲を選出する。
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

// -----------------------------------------------------------------
// ツリー表示に関する関数
// -----------------------------------------------------------------

// フォルダが選択された際に、選択状態の更新とプロパティパネルの表示を行う。
function handleFolderSelect(folderElement) {
    selectedItemPath = folderElement.dataset.folderPath;
    isSelectedItemFolder = true;
    updateSelectionStyle(folderElement);
    showPropertiesPanel();
}

// 曲ファイルが選択された際に、選択状態の更新とプロパティパネルの表示を行う。
function handleSongSelect(songElement, songRecord) {
    selectedItemPath = songRecord.path;
    isSelectedItemFolder = false;
    updateSelectionStyle(songElement);
    showPropertiesPanel();
}

// ファイルツリーのHTMLを再生成し、一覧画面と設定画面の両方に描画する（開閉状態を維持）。
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

// 再帰的にファイルツリー構造を解析し、<ul> <li> 要素によるHTMLを生成する。
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

// ツリー表示上で、現在選択されているアイテムのハイライト表示を更新する。
function updateSelectionStyle(selectedElement) {
    document.querySelectorAll('.selected-item').forEach(el => el.classList.remove('selected-item'));
    if (selectedElement) {
        const path = selectedElement.dataset.folderPath || selectedElement.dataset.filePath;
        document.querySelectorAll(`li[data-folder-path="${path}"], li[data-file-path="${path}"]`).forEach(el => {
            el.classList.add('selected-item');
        });
    }
}

// 現在ツリー表示上で開かれている（展開されている）フォルダのパス一覧を取得する。
function getOpenFolders() {
    const openFolders = new Set();
    document.querySelectorAll('.tree-view .folder-item.open').forEach(folder => {
        openFolders.add(folder.dataset.folderPath);
    });
    return openFolders;
}

// -----------------------------------------------------------------
// データ構造・検索に関する関数
// -----------------------------------------------------------------

// IndexedDBから曲データと設定を読み込み、アプリの状態を初期化する。
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

// フラットなファイルリストを解析し、階層構造を持つツリーオブジェクトに変換する。
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

// 指定されたツリーノード以下のすべてのファイルレコードを再帰的に取得する。
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

// ファイルパスをキーにして、ライブラリから該当する曲レコードを検索する。
function findFileByPath(filePath) {
    return libraryFiles.find(record => record.path === filePath) || null;
}

// -----------------------------------------------------------------
// シークバー・オーディオ操作ボタンに関する関数
// -----------------------------------------------------------------

// シークバー（プログレスバー）の進捗に応じた背景色のグラデーションを更新する。
function updateSeekbarVisuals() {
    if (!customSeekbar) return;
    const val = parseFloat(customSeekbar.value) || 0;
    const max = parseFloat(customSeekbar.max) || 100;
    const ratio = (max > 0) ? (val / max) * 100 : 0;
    
    // linear-gradientで「左からratio%まで紫、そこから右はグレー」にする
    // 線の太さは background-size の第2引数(4px)で指定
    customSeekbar.style.background = `linear-gradient(to right, #7e57c2 ${ratio}%, #555 ${ratio}%)`;
    customSeekbar.style.backgroundSize = `100% 6px`;
    customSeekbar.style.backgroundRepeat = `no-repeat`;
    customSeekbar.style.backgroundPosition = `center`;
}

// 再生位置を5秒間巻き戻す（MediaSession API用）。
function rewindFiveSeconds() {
    if (audioPlayer) {
        audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 5, 0);
    }
}

// 再生状態に応じて、再生ボタンのアイコンを「▶」または「❚❚」に切り替える。
function updatePlayButtonIcon(isPlaying) {
    // isPlayingが true (再生中) なら一時停止ボタン(❚❚)を表示
    // false (停止中) なら再生ボタン(▶)を表示
    ctrlPlayPauseButton.textContent = isPlaying ? '❚❚' : '▶';
}

// -----------------------------------------------------------------
// 耐久モード・再生時間の表示に関する関数
// -----------------------------------------------------------------

// 秒数を「MM:SS」形式の文字列に変換する。
function formatTime(totalSeconds) {
    if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds < 0) return "";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 「MM:SS.mmm」形式の文字列を秒数（数値）に変換する。
function timeStringToSeconds(timeString) {
    if (!timeString || typeof timeString !== 'string') return 0;
    const parts = timeString.match(/(\d+):(\d+).(\d+)/);
    if (!parts) return 0;
    const [, minutes, seconds, milliseconds] = parts.map(Number);
    return minutes * 60 + seconds + milliseconds / 1000;
}

// 秒数を「MM:SS.mmm」形式の文字列に変換する（詳細設定用）。
function formatTimeWithMillis(totalSeconds) {
    if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds < 0) return "";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((totalSeconds % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

// 指定された耐久時間（分）を満たすために必要なループ回数を計算する。
function calculateTargetLoopCount(minutes, loopStart, loopEnd, totalDuration) {
    if (minutes <= 0 || loopEnd <= loopStart) return 1;
    const intro = loopStart;
    const loopPart = loopEnd - loopStart;
    const outro = totalDuration - loopEnd;
    const requiredLoopTime = (minutes * 60) - intro - outro;
    if (requiredLoopTime <= 0) return 1;
    return Math.ceil(requiredLoopTime / loopPart);
}

// -----------------------------------------------------------------
// 歌詞に関する関数
// -----------------------------------------------------------------

// 現在の再生時間に基づいて、歌詞（一部表示または全文表示のハイライト）を更新する。
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

// 現在の行とその前後を表示する「歌詞の一部表示（カラオケ風）」のHTMLを生成する。
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

// 「歌詞の全文表示」用に、すべての行を含むHTMLを生成して表示する。
function renderFullLyrics() {
    const lines = currentLyricsData.languages[currentLyricsLang].lines;
    fullLyricsDisplay.innerHTML = lines.map((line, index) => `<p data-line-index="${index}">${line || '&nbsp;'}</p>`).join('');
}

// 全文表示モードにおいて、現在再生中の行にハイライト用クラスを付与する。
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

// 歌詞データに含まれる言語数に基づいて、言語切り替えボタンを生成する。
function setupLyricsControls(languages) {
    lyricsLanguageSelector.innerHTML = languages.map((lang, index) => 
        `<button data-lang="${index}" class="${index === 0 ? 'active' : ''}">${lang.name}</button>`
    ).join('');
}

// 言語名に応じて特定のフォントやスタイル（例：新世界語フォント）を適用する。
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

// -----------------------------------------------------------------
// 詳細設定に関する関数
// -----------------------------------------------------------------

// 選択中のアイテム（曲またはフォルダ）の詳細情報を設定画面のパネルに表示する。
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
            propLoopStart.value = formatTimeWithMillis(props.loopStartTime);
            propLoopEnd.value = formatTimeWithMillis(props.loopEndTime);
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

// 詳細設定画面で編集中の歌詞データを、メモリ上のプロパティオブジェクトに保存する。
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

// 詳細設定画面の歌詞入力欄（時間・テキスト）の高さを、内容に合わせて自動調整する。
function autoResizeLyricsEditor() {
    propLyricsTimings.style.height = 'auto';
    propLyricsText.style.height = 'auto';

    const scrollHeightTimings = propLyricsTimings.scrollHeight;
    const scrollHeightText = propLyricsText.scrollHeight;
    
    const maxHeight = Math.max(scrollHeightTimings, scrollHeightText);

    propLyricsTimings.style.height = maxHeight + 'px';
    propLyricsText.style.height = maxHeight + 'px';
}

// テキストエリアの内容量に応じて、要素の高さを自動的に調整する。
function autoResizeTextarea(element) {
    element.style.height = 'auto'; // 一旦高さをリセット
    element.style.height = element.scrollHeight + 'px'; // 内容に合わせて高さを設定
}

// -----------------------------------------------------------------
// 画面切り替えに関する関数
// -----------------------------------------------------------------

// プレイヤー画面のCSSクラスを切り替え、歌詞の表示レイアウト（通常・一部・全文）を変更する。
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

// プレイヤー・一覧・設定の3つのメイン画面の表示/非表示を切り替える。
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

// 設定画面内で、メイン設定と詳細設定のビューを切り替える。
function switchSettingsView(viewName) {
    if (viewName === 'detail') {
        mainSettingsView.classList.remove('active');
        detailSettingsView.classList.add('active');
    } else {
        detailSettingsView.classList.remove('active');
        mainSettingsView.classList.add('active');
    }
}

// -----------------------------------------------------------------
// ローディングオーバーレイに関する関数
// -----------------------------------------------------------------

// 画面全体を覆うローディングオーバーレイを表示し、メッセージを設定する。
function showLoading(message) {
	loadingOverlay.querySelector('div').textContent = message;
	loadingOverlay.style.display = 'flex';
}

// 表示中のローディングオーバーレイのメッセージテキストを更新する。
function updateLoadingMessage(message) {
	loadingOverlay.querySelector('div').textContent = message;
}

// ローディングオーバーレイを非表示にする。
function hideLoading() {
	loadingOverlay.style.display = 'none';
}

// -----------------------------------------------------------------
// スマホ版のメディアコントロールに関する関数
// -----------------------------------------------------------------

// OS側のメディアコントロール（ロック画面等）に現在の再生位置情報を通知する。
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
