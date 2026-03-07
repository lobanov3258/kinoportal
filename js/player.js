// ===== ВИДЕОПЛЕЕР =====

class MoviePlayer {
    constructor() {
        this.currentMovie = null;
        this.playerElement = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 1;
        this.quality = '720p';
    }

    // Инициализация плеера
    init(movieId, container) {
        this.currentMovie = allMovies.find(m => m.id === movieId);
        if (!this.currentMovie) {
            console.error('Фильм не найден');
            return;
        }

        this.playerElement = container;
        this.renderPlayer();
        this.attachEventListeners();
        this.loadVideoSource();
        
        trackEvent('player_init', { movieId, title: this.currentMovie.title });
    }

    // Отрисовка плеера
    renderPlayer() {
        this.playerElement.innerHTML = `
            <div class="video-player">
                <video id="videoElement" class="video-element">
                    <source src="" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
                
                <!-- Оверлей при загрузке -->
                <div class="player-loading" id="playerLoading">
                    <div class="spinner"></div>
                    <p>Загрузка...</p>
                </div>
                
                <!-- Центральная кнопка Play -->
                <div class="player-center-btn" id="centerPlayBtn">
                    <button class="center-play-icon">▶</button>
                </div>
                
                <!-- Элементы управления -->
                <div class="player-controls" id="playerControls">
                    <div class="progress-bar" id="progressBar">
                        <div class="progress-filled" id="progressFilled"></div>
                        <div class="progress-handle" id="progressHandle"></div>
                    </div>
                    
                    <div class="controls-bottom">
                        <div class="controls-left">
                            <button class="control-btn" id="playPauseBtn" title="Воспроизвести/Пауза">
                                <span class="play-icon">▶</span>
                            </button>
                            
                            <button class="control-btn" id="rewindBtn" title="Назад 10 сек">
                                ⏪
                            </button>
                            
                            <button class="control-btn" id="forwardBtn" title="Вперёд 10 сек">
                                ⏩
                            </button>
                            
                            <div class="volume-control">
                                <button class="control-btn" id="volumeBtn" title="Звук">
                                    🔊
                                </button>
                                <div class="volume-slider" id="volumeSlider">
                                    <input type="range" min="0" max="100" value="100" id="volumeRange">
                                </div>
                            </div>
                            
                            <div class="time-display">
                                <span id="currentTime">00:00</span>
                                <span> / </span>
                                <span id="totalTime">00:00</span>
                            </div>
                        </div>
                        
                        <div class="controls-right">
                            <div class="quality-selector">
                                <button class="control-btn" id="qualityBtn">
                                    <span id="currentQuality">720p</span>
                                </button>
                                <div class="quality-menu" id="qualityMenu">
                                    <div class="quality-option" data-quality="1080p">1080p Full HD</div>
                                    <div class="quality-option active" data-quality="720p">720p HD</div>
                                    <div class="quality-option" data-quality="480p">480p</div>
                                    <div class="quality-option" data-quality="360p">360p</div>
                                </div>
                            </div>
                            
                            <button class="control-btn" id="subtitlesBtn" title="Субтитры">
                                CC
                            </button>
                            
                            <button class="control-btn" id="settingsBtn" title="Настройки">
                                ⚙️
                            </button>
                            
                            <button class="control-btn" id="fullscreenBtn" title="Полный экран">
                                ⛶
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Информация о фильме -->
                <div class="player-info" id="playerInfo">
                    <h2>${this.currentMovie.title}</h2>
                    <div class="player-meta">
                        <span>⭐ ${this.currentMovie.rating}</span>
                        <span>${this.currentMovie.year}</span>
                        <span>${getCategoryName(this.currentMovie.category)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Загрузка источника видео
    loadVideoSource() {
        const video = document.getElementById('videoElement');
        
        // В реальном проекте здесь будет URL видео с вашего сервера или CDN
        // Примеры источников:
        
        // 1. Прямая ссылка на файл
        // video.src = `https://yourcdn.com/movies/${this.currentMovie.id}/${this.quality}.mp4`;
        
        // 2. HLS (для адаптивного стриминга)
        // if (Hls.isSupported()) {
        //     const hls = new Hls();
        //     hls.loadSource(`https://yourcdn.com/movies/${this.currentMovie.id}/playlist.m3u8`);
        //     hls.attachMedia(video);
        // }
        
        // 3. Embed из легальных источников
        // video.src = this.currentMovie.videoUrl;
        
        // Для демонстрации используем тестовое видео
        video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        
        video.addEventListener('loadedmetadata', () => {
            this.duration = video.duration;
            document.getElementById('totalTime').textContent = this.formatTime(this.duration);
            document.getElementById('playerLoading').style.display = 'none';
        });

        video.addEventListener('error', () => {
            this.showError('Ошибка загрузки видео');
        });
    }

    // Присоединение обработчиков событий
    attachEventListeners() {
        const video = document.getElementById('videoElement');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const centerPlayBtn = document.getElementById('centerPlayBtn');
        const rewindBtn = document.getElementById('rewindBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const volumeBtn = document.getElementById('volumeBtn');
        const volumeRange = document.getElementById('volumeRange');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const progressBar = document.getElementById('progressBar');
        const qualityBtn = document.getElementById('qualityBtn');
        const qualityOptions = document.querySelectorAll('.quality-option');

        // Play/Pause
        playPauseBtn.addEventListener('click', () => this.togglePlay());
        centerPlayBtn.addEventListener('click', () => this.togglePlay());
        video.addEventListener('click', () => this.togglePlay());

        // Перемотка
        rewindBtn.addEventListener('click', () => this.rewind(10));
        forwardBtn.addEventListener('click', () => this.forward(10));

        // Громкость
        volumeBtn.addEventListener('click', () => this.toggleMute());
        volumeRange.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });

        // Полный экран
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Прогресс-бар
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.seek(percent * this.duration);
        });

        // Обновление времени
        video.addEventListener('timeupdate', () => {
            this.currentTime = video.currentTime;
            this.updateProgress();
            this.updateTimeDisplay();
        });

        // Окончание видео
        video.addEventListener('ended', () => {
            this.onVideoEnd();
        });

        // Качество
        qualityBtn.addEventListener('click', () => {
            document.getElementById('qualityMenu').classList.toggle('active');
        });

        qualityOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.changeQuality(option.dataset.quality);
                qualityOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                document.getElementById('qualityMenu').classList.remove('active');
            });
        });

        // Горячие клавиши
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Скрытие/показ элементов управления
        let controlsTimeout;
        const playerElement = document.querySelector('.video-player');
        
        playerElement.addEventListener('mousemove', () => {
            this.showControls();
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (this.isPlaying) {
                    this.hideControls();
                }
            }, 3000);
        });
    }

    // Воспроизведение/Пауза
    togglePlay() {
        const video = document.getElementById('videoElement');
        const playIcon = document.querySelector('#playPauseBtn .play-icon');
        const centerBtn = document.getElementById('centerPlayBtn');

        if (video.paused) {
            video.play();
            playIcon.textContent = '⏸';
            centerBtn.style.display = 'none';
            this.isPlaying = true;
        } else {
            video.pause();
            playIcon.textContent = '▶';
            centerBtn.style.display = 'flex';
            this.isPlaying = false;
        }

        trackEvent('player_toggle', { action: this.isPlaying ? 'play' : 'pause' });
    }

    // Перемотка назад
    rewind(seconds) {
        const video = document.getElementById('videoElement');
        video.currentTime = Math.max(0, video.currentTime - seconds);
    }

    // Перемотка вперёд
    forward(seconds) {
        const video = document.getElementById('videoElement');
        video.currentTime = Math.min(video.duration, video.currentTime + seconds);
    }

    // Поиск позиции
    seek(time) {
        const video = document.getElementById('videoElement');
        video.currentTime = time;
    }

    // Громкость
    setVolume(value) {
        const video = document.getElementById('videoElement');
        this.volume = value;
        video.volume = value;
        
        const volumeBtn = document.getElementById('volumeBtn');
        if (value === 0) {
            volumeBtn.textContent = '🔇';
        } else if (value < 0.5) {
            volumeBtn.textContent = '🔉';
        } else {
            volumeBtn.textContent = '🔊';
        }
    }

    toggleMute() {
        const video = document.getElementById('videoElement');
        const volumeRange = document.getElementById('volumeRange');
        
        if (video.volume > 0) {
            this.prevVolume = video.volume;
            this.setVolume(0);
            volumeRange.value = 0;
        } else {
            this.setVolume(this.prevVolume || 1);
            volumeRange.value = (this.prevVolume || 1) * 100;
        }
    }

    // Полный экран
    toggleFullscreen() {
        const player = document.querySelector('.video-player');
        
        if (!document.fullscreenElement) {
            player.requestFullscreen().catch(err => {
                console.error('Ошибка полного экрана:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Изменение качества
    changeQuality(quality) {
        const currentTime = document.getElementById('videoElement').currentTime;
        this.quality = quality;
        
        // Здесь должна быть загрузка нового источника с другим качеством
        // video.src = `https://yourcdn.com/movies/${this.currentMovie.id}/${quality}.mp4`;
        
        document.getElementById('currentQuality').textContent = quality;
        
        // Восстановить позицию
        const video = document.getElementById('videoElement');
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = currentTime;
            if (this.isPlaying) video.play();
        }, { once: true });

        showNotification(`Качество изменено на ${quality}`, 'success');
    }

    // Обновление прогресс-бара
    updateProgress() {
        const percent = (this.currentTime / this.duration) * 100;
        document.getElementById('progressFilled').style.width = percent + '%';
        document.getElementById('progressHandle').style.left = percent + '%';
    }

    // Обновление отображения времени
    updateTimeDisplay() {
        document.getElementById('currentTime').textContent = this.formatTime(this.currentTime);
    }

    // Форматирование времени
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Горячие клавиши
    handleKeyboard(e) {
        if (!this.playerElement) return;

        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.rewind(5);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.forward(5);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.setVolume(Math.min(1, this.volume + 0.1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.setVolume(Math.max(0, this.volume - 0.1));
                break;
            case 'f':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'm':
                e.preventDefault();
                this.toggleMute();
                break;
        }
    }

    // Показать элементы управления
    showControls() {
        document.getElementById('playerControls').style.opacity = '1';
        document.getElementById('playerInfo').style.opacity = '1';
    }

    // Скрыть элементы управления
    hideControls() {
        document.getElementById('playerControls').style.opacity = '0';
        document.getElementById('playerInfo').style.opacity = '0';
    }

    // Окончание видео
    onVideoEnd() {
        this.isPlaying = false;
        document.getElementById('centerPlayBtn').style.display = 'flex';
        document.querySelector('#playPauseBtn .play-icon').textContent = '▶';
        
        trackEvent('player_end', { 
            movieId: this.currentMovie.id,
            watchTime: this.currentTime
        });

        // Предложить следующий фильм
        this.suggestNextMovie();
    }

    // Предложить следующий фильм
    suggestNextMovie() {
        // Найти похожие фильмы
        const similar = allMovies.filter(m => 
            m.id !== this.currentMovie.id &&
            (m.genre === this.currentMovie.genre || m.category === this.currentMovie.category)
        ).slice(0, 3);

        if (similar.length > 0) {
            showNotification('Смотрите также похожие фильмы', 'info');
        }
    }

    // Показать ошибку
    showError(message) {
        document.getElementById('playerLoading').innerHTML = `
            <div style="text-align: center;">
                <p style="font-size: 48px; margin-bottom: 20px;">⚠️</p>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Обновить страницу
                </button>
            </div>
        `;
        document.getElementById('playerLoading').style.display = 'flex';
    }

    // Уничтожение плеера
    destroy() {
        const video = document.getElementById('videoElement');
        if (video) {
            video.pause();
            video.src = '';
        }
        this.playerElement.innerHTML = '';
    }
}

// Глобальная переменная плеера
let globalPlayer = null;

// Функция для инициализации плеера
function initPlayer(movieId, containerId = 'playerContainer') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Контейнер плеера не найден');
        return;
    }

    if (globalPlayer) {
        globalPlayer.destroy();
    }

    globalPlayer = new MoviePlayer();
    globalPlayer.init(movieId, container);
}