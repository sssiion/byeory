const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const WIDGET_TYPES = [
    // System
    'welcome', 'theme-guide', 'feature-card',
    // Data & Logic
    'formula-block', 'relation-link', 'rollup', 'property-toggle',
    // Diary
    'ai-diary', 'daily-diary', 'random-diary', 'exchange-diary', 'past-today',
    'my-persona', 'emotion-analysis', 'compliment-jar', 'emotional-weather', 'dream-log', 'daily-stamp',
    // Utility
    'time-machine', 'todo-list', 'weather', 'notification', 'clock',
    'streak', 'battery', 'worry-shredder', 'scrap-note',
    'recipe-card', 'worry-doll',
    // Decoration
    'photo-gallery', 'polaroid', 'instant-booth', 'film-strip', 'ocean-wave',
    'movie-ticket', 'bookshelf', 'stamp-collection', 'sky-map', 'birth-flower', 'receipt-printer', 'weather-stickers',
    // Tools
    'unit-converter', 'calculator', 'random-picker', 'map-pin', 'rss-reader',
    // Interactive
    'community', 'moon-phase', 'switch-board', 'fortune-cookie', 'ootd', 'book-cover', 'bubble-wrap', 'transparent',
    // Static
    'favorite-char', 'color-chip', 'color-palette', 'movie-scene', 'ticket', 'neon', 'candle', 'text-scroller', 'window-view', 'payphone', 'typewriter',
    'digital-plant', 'dessert-case', 'cat-chaser', 'snow-globe', 'lp-player', 'asmr-mixer', 'bonfire',
    // New
    'chat-diary', 'tag-cloud', 'scratch-card', 'switches'
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

    const outputDir = path.join(__dirname, 'public/thumbnails');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Starting capture of ${WIDGET_TYPES.length} widgets...`);

    for (const type of WIDGET_TYPES) {
        try {
            console.log(`📸 Capturing ${type}...`);
            await page.goto(`http://localhost:5173/screenshot-studio?type=${type}`, {
                waitUntil: 'networkidle0'
            });

            await new Promise(resolve => setTimeout(resolve, 500)); // slightly faster wait

            const element = await page.$('#widget-target');
            if (element) {
                await element.screenshot({
                    path: path.join(outputDir, `${type}.png`),
                    omitBackground: true
                });
                console.log(`✅ Saved ${type}.png`);
            }
        } catch (e) {
            console.error(`❌ Error capturing ${type}:`, e.message);
        }
    }

    await browser.close();
    console.log('🎉 All done!');
})();
