// База данных (используем из movies-data.js)
let allMovies = [];
let currentFilter = 'all';

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadMovies();
    initializeFilters();
    initializeSearch();
    initializeTheme();
    hidePreloader();
});

// Загрузка фильмов
function loadMovies() {
    allMovies = window.MOVIES_DATABASE || [];
    renderMovies(allMovies);
    renderNewMovies();
}

// Рендер фильмов
function renderMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;
    
    const moviesToShow = movies.slice(0, 12);
    
    grid.innerHTML = moviesToShow.map(movie => createMovieCard(movie)).join('');
}

// Создание карточки
function createMovieCard(movie) {
    const ratingClass = movie.rating >= 8 ? 'high' : movie.rating >= 7 ? 'medium' : 'low';
    
    return `
        <div class="movie-card" onclick="openMovie(${movie.id})">
            <div class="movie-poster-wrapper">
                <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(movie.title)}'">
                <div class="movie-overlay">
                    <div class="play-button">
                        <svg viewBox="0 0 24 24"><path fill="white" d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>
                    </div>
                </div>
                <div class="movie-rating-badge ${ratingClass}">
                    ⭐ ${movie.rating}
                </div>
                ${movie.isNew ? '<div class="movie-badge">New</div>' : ''}
            </div>
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">
                    <span class="movie-year">${movie.year}</span>
                    <span class="movie-genre">${getCategoryName(movie.category)}</span>
                </div>
            </div>
        </div>
    `;
}

// Новинки
function renderNewMovies() {
    const grid = document.getElementById('newMovies');
    if (!grid) return;
    
    const newMovies = allMovies.filter(m => m.isNew).slice(0, 6);
    grid.innerHTML = newMovies.map(movie => createMovieCard(movie)).join('');
}

// Фильтры
function initializeFilters() {
    // Категории
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            filterByCategory(category);
        });
    });
    
    // Быстрые фильтры
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            applyQuickFilter(filter);
        });
    });
    
    // Жанры
    document.querySelectorAll('.genre-item').forEach(item => {
        item.addEventListener('click', function() {
            const genre = this.dataset.genre;
            filterByGenre(genre);
        });
    });
}

// Фильтрация по категории
function filterByCategory(category) {
    let filtered = allMovies;
    
    if (category !== 'all') {
        filtered = allMovies.filter(m => m.category === category);
    }
    
    renderMovies(filtered);
}

// Быстрые фильтры
function applyQuickFilter(filter) {
    let filtered = allMovies;
    
    switch(filter) {
        case 'new':
            filtered = allMovies.filter(m => m.isNew);
            break;
        case 'trending':
            filtered = allMovies.filter(m => m.trending);
            break;
        case 'top':
            filtered = allMovies.sort((a, b) => b.rating - a.rating).slice(0, 12);
            break;
    }
    
    renderMovies(filtered);
}

// Фильтр по жанру
function filterByGenre(genre) {
    const filtered = allMovies.filter(m => m.genre === genre);
    renderMovies(filtered);
    
    // Скролл к результатам
    document.querySelector('.movies-carousel').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Поиск
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            renderMovies(allMovies);
            return;
        }
        
        const results = allMovies.filter(m => 
            m.title.toLowerCase().includes(query) ||
            (m.description && m.description.toLowerCase().includes(query))
        );
        
        renderMovies(results);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
}

// Смена темы
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    let currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        if (currentTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        localStorage.setItem('theme', currentTheme);
    });
}

// ===== МОДАЛЬНОЕ ОКНО =====

// Открыть модальное окно с фильмом
function openMovie(id) {
    const movie = allMovies.find(m => m.id === id);
    if (!movie) return;
    
    const modal = document.getElementById('movieModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) {
        console.error('Модальное окно не найдено в HTML');
        return;
    }
    
    // Определяем класс рейтинга
    const ratingClass = movie.rating >= 8 ? 'high' : movie.rating >= 7 ? 'medium' : 'low';
    
    // Создаём контент модального окна
    modalContent.innerHTML = `
        <!-- Бэкдроп -->
        <div class="modal-backdrop" style="background-image: url('${movie.backdrop || movie.poster}')">
            <div class="modal-info">
                <div class="modal-header">
                    <img src="${movie.poster}" alt="${movie.title}" class="modal-poster" onerror="this.src='https://via.placeholder.com/180x270/1a1a1a/ffffff?text=Poster'">
                    <div class="modal-header-content">
                        <div class="modal-badges">
                            ${movie.isNew ? '<span class="modal-badge new">Новинка</span>' : ''}
                            ${movie.trending ? '<span class="modal-badge trending">В тренде</span>' : ''}
                            <span class="modal-badge">${getCategoryName(movie.category)}</span>
                        </div>
                        
                        <h2 class="modal-title">${movie.title}</h2>
                        
                        <div class="modal-meta">
                            <div class="modal-meta-item">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                                </svg>
                                ${movie.year}
                            </div>
                            <div class="modal-meta-item">${getGenreName(movie.genre)}</div>
                            <div class="modal-meta-item">2 ч 30 мин</div>
                        </div>
                        
                        <div class="modal-rating">
                            <div class="modal-rating-score ${ratingClass}">
                                <svg viewBox="0 0 24 24" width="28" height="28">
                                    <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                                </svg>
                                ${movie.rating}
                            </div>
                            <div class="modal-rating-info">
                                <div class="modal-rating-stars">★★★★★</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Тело модального окна -->
        <div class="modal-body">
            <!-- Описание -->
            <p class="modal-description">
                ${movie.description || 'История захватывающего приключения, которое изменит жизнь главных героев навсегда. Невероятный сюжет, потрясающая игра актёров и визуальные эффекты мирового уровня.'}
            </p>
            
            <!-- Кнопки действий -->
            <div class="modal-actions">
                <button class="modal-btn modal-btn-primary" onclick="playMovie(${movie.id})">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                    </svg>
                    Смотреть
                </button>
                <button class="modal-btn modal-btn-secondary" onclick="addToWatchlist(${movie.id})">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
                    </svg>
                    В избранное
                </button>
                <button class="modal-btn modal-btn-icon" onclick="toggleLike(${movie.id})" title="Нравится">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                    </svg>
                </button>
                <button class="modal-btn modal-btn-icon" onclick="shareMovie(${movie.id})" title="Поделиться">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/>
                    </svg>
                </button>
            </div>
            
            ${movie.trailer ? `
            <!-- Трейлер -->
            <div class="modal-trailer">
                <h3 class="modal-section-title">Трейлер</h3>
                <div class="trailer-wrapper">
                    <iframe src="${movie.trailer}" allowfullscreen></iframe>
                </div>
            </div>
            ` : ''}
            
            <!-- Детали -->
            <div class="modal-details">
                <div class="detail-item">
                    <div class="detail-label">Год выпуска</div>
                    <div class="detail-value">${movie.year}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Жанр</div>
                    <div class="detail-value">${getGenreName(movie.genre)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Рейтинг</div>
                    <div class="detail-value">${movie.rating} / 10</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Категория</div>
                    <div class="detail-value">${getCategoryName(movie.category)}</div>
                </div>
            </div>
        </div>
    `;
    
    // Показываем модальное окно
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Трекинг
    console.log('Открыт фильм:', movie.title);
}

// Закрыть модальное окно
function closeModal() {
    const modal = document.getElementById('movieModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Воспроизвести фильм
function playMovie(id) {
    const movie = allMovies.find(m => m.id === id);
    if (!movie) return;
    
    alert(`▶ Запуск фильма: ${movie.title}\n\nЗдесь откроется видеоплеер`);
    
    // Можно перейти на страницу плеера:
    // closeModal();
    // window.location.href = `pages/player.html?id=${id}`;
}

// Добавить в избранное
function addToWatchlist(id) {
    const movie = allMovies.find(m => m.id === id);
    if (!movie) return;
    
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    
    if (!watchlist.includes(id)) {
        watchlist.push(id);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        showNotification(`✅ "${movie.title}" добавлен в избранное`);
    } else {
        showNotification(`ℹ️ "${movie.title}" уже в избранном`);
    }
}

// Лайк
function toggleLike(id) {
    const btn = event.target.closest('.modal-btn-icon');
    if (!btn) return;
    
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        showNotification('❤️ Добавлено в понравившиеся');
    } else {
        showNotification('🤍 Удалено из понравившихся');
    }
}

// Поделиться
function shareMovie(id) {
    const movie = allMovies.find(m => m.id === id);
    if (!movie) return;
    
    const url = window.location.href + '?movie=' + id;
    
    if (navigator.share) {
        navigator.share({
            title: movie.title,
            text: `Смотри ${movie.title} на КиноПортал`,
            url: url
        }).catch(() => {
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('🔗 Ссылка скопирована в буфер обмена');
    }).catch(() => {
        showNotification('⚠️ Не удалось скопировать ссылку');
    });
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Прелоадер
function hidePreloader() {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 500);
        }
    }, 800);
}

// Получить название категории
function getCategoryName(category) {
    const names = {
        'movies': 'Фильм',
        'series': 'Сериал',
        'cartoons': 'Мультфильм'
    };
    return names[category] || category;
}

// Получить название жанра
function getGenreName(genre) {
    const names = {
        'action': 'Боевик',
        'comedy': 'Комедия',
        'drama': 'Драма',
        'horror': 'Ужасы',
        'fantasy': 'Фантастика',
        'animation': 'Анимация',
        'thriller': 'Триллер',
        'romance': 'Романтика'
    };
    return names[genre] || genre;
}

// Уведомления
function showNotification(text) {
    // Удаляем предыдущие уведомления
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(255, 107, 0, 0.95);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-size: 14px;
        backdrop-filter: blur(10px);
    `;
    notification.textContent = text;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Вывод статистики в консоль
console.log('✅ КиноПортал загружен!');
console.log('📊 Фильмов в базе:', allMovies.length);
console.log('🎬 Модальное окно готово к работе');