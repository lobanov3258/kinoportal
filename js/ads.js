// ===== УПРАВЛЕНИЕ РЕКЛАМОЙ =====

class AdsManager {
    constructor() {
        this.adsEnabled = true;
        this.adsBlocked = false;
        this.checkAdBlocker();
    }

    // Проверка AdBlock
    checkAdBlocker() {
        // Простая проверка наличия блокировщика рекламы
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                this.adsBlocked = true;
                this.showAdBlockMessage();
            }
            testAd.remove();
        }, 100);
    }

    // Сообщение о блокировщике
    showAdBlockMessage() {
        const message = document.createElement('div');
        message.className = 'adblock-message';
        message.innerHTML = `
            <div class="adblock-content">
                <h3>🚫 Обнаружен блокировщик рекламы</h3>
                <p>Реклама помогает нам поддерживать сайт бесплатным для вас</p>
                <p>Пожалуйста, отключите AdBlock для нашего сайта</p>
                <button onclick="location.reload()">Обновить страницу</button>
            </div>
        `;
        
        document.body.appendChild(message);
    }

    // Инициализация Google AdSense
    initGoogleAds() {
        if (this.adsBlocked) return;

        // Вставка скрипта AdSense
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        // Инициализация рекламных блоков
        this.loadAdSenseBlocks();
    }

    // Загрузка блоков AdSense
    loadAdSenseBlocks() {
        const adSlots = [
            { id: 'ad-top-slot', slot: 'XXXXXXXXXX', format: 'horizontal' },
            { id: 'ad-inline-slot', slot: 'YYYYYYYYYY', format: 'horizontal' },
            { id: 'ad-left-sidebar', slot: 'ZZZZZZZZZZ', format: 'vertical' },
            { id: 'ad-right-sidebar', slot: 'WWWWWWWWWW', format: 'vertical' }
        ];

        adSlots.forEach(slot => {
            const container = document.getElementById(slot.id);
            if (!container) return;

            const ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.display = 'block';
            ins.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXX');
            ins.setAttribute('data-ad-slot', slot.slot);
            ins.setAttribute('data-ad-format', 'auto');
            ins.setAttribute('data-full-width-responsive', 'true');

            container.appendChild(ins);

            // Запуск показа рекламы
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('AdSense error:', e);
            }
        });
    }

    // Инициализация Яндекс.Директ
    initYandexAds() {
        if (this.adsBlocked) return;

        // Скрипт Яндекс.Директ
        const script = document.createElement('script');
        script.src = 'https://yandex.ru/ads/system/context.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            this.loadYandexBlocks();
        };
    }

    // Загрузка блоков Яндекс.Директ
    loadYandexBlocks() {
        const yaBlocks = [
            { containerId: 'yandex-ad-1', blockId: 'R-A-XXXXXX-1' },
            { containerId: 'yandex-ad-2', blockId: 'R-A-XXXXXX-2' }
        ];

        yaBlocks.forEach(block => {
            const container = document.getElementById(block.containerId);
            if (!container) return;

            window.yaContextCb = window.yaContextCb || [];
            window.yaContextCb.push(() => {
                Ya.Context.AdvManager.render({
                    blockId: block.blockId,
                    renderTo: block.containerId,
                    async: true
                });
            });
        });
    }

    // Показ видеорекламы перед фильмом
    showPrerollAd(callback) {
        if (this.adsBlocked) {
            callback();
            return;
        }

        // Пример с использованием Google IMA SDK
        // const adContainer = document.createElement('div');
        // adContainer.id = 'preroll-ad-container';
        // document.body.appendChild(adContainer);

        // Здесь код для загрузки видеорекламы
        
        // После окончания рекламы
        setTimeout(() => {
            callback();
        }, 5000); // Имитация 5-секундной рекламы
    }

    // Трекинг кликов по рекламе
    trackAdClick(adPosition) {
        trackEvent('ad_click', {
            position: adPosition,
            timestamp: new Date().toISOString()
        });
    }

    // Показать нативную рекламу
    showNativeAd(container, adData) {
        if (this.adsBlocked) return;

        const nativeAdHTML = `
            <div class="native-ad-item">
                <span class="ad-label">Реклама</span>
                <img src="${adData.image}" alt="${adData.title}">
                <h3>${adData.title}</h3>
                <p>${adData.description}</p>
                <a href="${adData.url}" target="_blank" class="native-ad-link">
                    ${adData.cta}
                </a>
            </div>
        `;

        container.innerHTML = nativeAdHTML;
    }
}

// Инициализация менеджера рекламы
const adsManager = new AdsManager();

// Автозапуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Выберите нужную рекламную сеть
    // adsManager.initGoogleAds();
    // adsManager.initYandexAds();
    
    console.log('📢 Реклама инициализирована');
});

// Стили для сообщения об AdBlock
const style = document.createElement('style');
style.textContent = `
    .adblock-message {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .adblock-content {
        background: var(--bg-light);
        padding: 40px;
        border-radius: 12px;
        text-align: center;
        max-width: 500px;
    }

    .adblock-content h3 {
        font-size: 24px;
        margin-bottom: 20px;
        color: var(--primary-color);
    }

    .adblock-content p {
        margin-bottom: 15px;
        line-height: 1.6;
    }

    .adblock-content button {
        padding: 12px 30px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
    }

    .adblock-content button:hover {
        background: var(--primary-hover);
    }
`;
document.head.appendChild(style);