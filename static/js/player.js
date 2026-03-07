// Инициализация плеера
document.addEventListener('DOMContentLoaded', function() {
    
    // Проверяем, есть ли видео на странице
    const videoElement = document.getElementById('my-video');
    
    if (videoElement) {
        // Настройки плеера
        const player = videojs('my-video', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            fluid: true,
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'playbackRateMenuButton',
                    'fullscreenToggle'
                ]
            }
        });
        
        // Добавляем класс при загрузке видео
        player.on('loadedmetadata', function() {
            console.log('Видео загружено');
        });
        
        // Сохраняем позицию просмотра в localStorage
        const videoKey = 'kinoportal_position_' + window.location.pathname;
        
        player.on('timeupdate', function() {
            const currentTime = player.currentTime();
            if (currentTime > 0) {
                localStorage.setItem(videoKey, currentTime);
            }
        });
        
        // Восстанавливаем позицию при загрузке
        player.on('loadeddata', function() {
            const savedPosition = localStorage.getItem(videoKey);
            if (savedPosition) {
                const confirmPosition = confirm('Продолжить с места остановки?');
                if (confirmPosition) {
                    player.currentTime(parseFloat(savedPosition));
                }
            }
        });
        
        // Обработка ошибок
        player.on('error', function() {
            console.log('Ошибка загрузки видео');
        });
        
        // Событие окончания видео
        player.on('ended', function() {
            console.log('Видео закончилось');
        });
    }
});
