import type { Sticker, FloatingImage, FloatingText } from '../types';

export interface PaperPreset {
    id: string;
    name: string;
    styles: {
        backgroundColor?: string;
        backgroundImage?: string;
        backgroundSize?: string;
        backgroundRepeat?: string;
        backgroundPosition?: string;
        border?: string;
        boxShadow?: string;
        padding?: string;
        // Allows extra styles
        [key: string]: any;
    };
    defaultFontColor?: string;
    stickers?: Sticker[]; // Decorations like stars, dried flowers
    floatingImages?: FloatingImage[]; // Frames
    floatingTexts?: FloatingText[]; // Placeholders
    thumbnail?: string; // Optional thumbnail for selection UI
}

export const PAPER_PRESETS: Record<string, PaperPreset> = {
    DEFAULT: {
        id: 'default',
        name: '기본 (A4)',
        styles: {
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '3rem',
        },
        defaultFontColor: '#000000',
    },
    HANJI: {
        id: 'hanji',
        name: '한지 (Hanji)',
        styles: {
            backgroundColor: '#f5f5dc', // Beige
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")', // Example texture
            backgroundSize: 'auto',
            backgroundRepeat: 'repeat',
            border: '2px solid #5d4037', // Brush-like brown border
            // Rough edge simulation using box-shadow or clip-path (simplified here)
            boxShadow: 'inset 0 0 20px rgba(139, 69, 19, 0.2), 5px 5px 15px rgba(0,0,0,0.1)',
            padding: '3.5rem',
            fontFamily: '"Gowun Batang", serif', // If available
        },
        defaultFontColor: '#3e2723', // Dark Brown
    },
    NIGHT_SKY: {
        id: 'night_sky',
        name: '밤하늘 (Night Sky)',
        styles: {
            backgroundColor: '#0f172a', // Dark Slate Blue
            backgroundImage: 'linear-gradient(to bottom, #0f172a, #1e1b4b)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            padding: '3rem',
            color: '#ffffff'
        },
        defaultFontColor: '#ffffff',
        stickers: [
            {
                id: 'star_1',
                x: '10%', y: '10%', w: 30, h: 30, rotation: 15, zIndex: 1,
                url: 'https://cdn-icons-png.flaticon.com/512/616/616490.png'
            },
            {
                id: 'star_2',
                x: '90%', y: '20%', w: 20, h: 20, rotation: -15, zIndex: 1,
                url: 'https://cdn-icons-png.flaticon.com/512/616/616490.png'
            },
            {
                id: 'moon_1',
                x: '80%', y: '80%', w: 80, h: 80, rotation: 0, zIndex: 1,
                url: 'https://cdn-icons-png.flaticon.com/512/1164/1164955.png'
            }
        ]
    },
    POLAROID: {
        id: 'polaroid',
        name: '폴라로이드 (Polaroid)',
        styles: {
            backgroundColor: '#ffffff',
            padding: '2rem 2rem 8rem 2rem', // Large bottom padding
            boxShadow: '0 15px 30px rgba(0,0,0,0.2)', // Floating effect
            border: '1px solid #eee',
            transform: 'rotate(-2deg)', // Slight tilt (might affect content, be careful)
        },
        defaultFontColor: '#333333',
    },
    CARDBOARD: {
        id: 'cardboard',
        name: '골판지 (Cardboard)',
        styles: {
            backgroundColor: '#d7c4a1',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cardboard-flat.png")',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.1)',
            padding: '3rem',
            border: '1px dashed #a18e6e'
        },
        defaultFontColor: '#5d4037',
    },
    LETTER: {
        id: 'letter',
        name: '줄 편지지 (Lined)',
        styles: {
            backgroundColor: '#fffdf5', // Cream
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 29px, #d1d5db 30px)',
            backgroundSize: '100% 30px',
            lineHeight: '30px',
            padding: '3rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        },
        defaultFontColor: '#374151'
    }
};

export const DEFAULT_PAPER_PRESET = PAPER_PRESETS.DEFAULT;
