export type CoverType = 'solid' | 'gradient' | 'pattern' | 'illustration' | 'image';

export interface AlbumCoverConfig {
    type: CoverType;
    value: string; // Color code, gradient string, or pattern ID
    spineColor?: string; // Optional custom spine color, defaults to matching value
    labelColor?: string;
    sticker?: string; // Optional sticker icon
    customImage?: string; // Data URL for custom image
    backgroundColor?: string; // For patterns or transparent items
    backgroundSize?: string; // ✨ Control pattern scaling
}

// Helper to escape color for SVG data URI
const svgColor = (color: string) => encodeURIComponent(color);

// Pattern Generator for 'My Design'
export const PATTERN_SHAPES = [
    {
        id: 'dots',
        name: '도트',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'check',
        name: '체크',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='10' height='10' fill='${svgColor(color)}'/%3E%3Crect x='10' y='10' width='10' height='10' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '40px 40px'
    },
    {
        id: 'grid',
        name: '그리드',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='${svgColor(color)}' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'zigzag',
        name: '지그재그',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 L10 0 L20 10 L10 20 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'diagonal',
        name: '사선',
        generate: (color: string) => `repeating-linear-gradient(45deg, ${color}, ${color} 2px, transparent 2px, transparent 10px)`,
        size: '10px 10px'
    },
    {
        id: 'wave',
        name: '웨이브',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 5 0 10 10 T 20 10' stroke='${svgColor(color)}' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'dot-grid',
        name: '도트 그리드',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'cross',
        name: '십자가',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0 H12 V8 H20 V12 H12 V20 H8 V12 H0 V8 H8 V0 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'star',
        name: '별',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '34px 34px'
    },
    {
        id: 'heart',
        name: '하트',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35C12 21.35 22 13 22 8.5C22 5.42 19.58 3 16.5 3C14.76 3 13.09 3.81 12 5.09C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.42 2 8.5C2 13 12 21.35 12 21.35Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '34px 34px'
    },
    {
        id: 'diamond',
        name: '다이아',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L20 10 L10 20 L0 10 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'ring',
        name: '링',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='8' stroke='${svgColor(color)}' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
        size: '26px 26px'
    },
    {
        id: 'moon',
        name: '달',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '36px 36px'
    },
    {
        id: 'triangle',
        name: '세모',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 2 L2 18 L18 18 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'hexagon',
        name: '육각형',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2 L21 7 V17 L12 22 L3 17 V7 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'cloud',
        name: '구름',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17.5,19c-1.7,0-3.2-0.9-4.1-2.3c-0.6,0.2-1.3,0.3-1.9,0.3c-3.6,0-6.5-2.9-6.5-6.5c0-3.3,2.4-6,5.6-6.4C11.4,2.3,13,1,14.9,1c3.1,0,5.7,2.3,6.1,5.4C22.6,7.2,24,8.9,24,11C24,15.4,21.1,19,17.5,19z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '34px 34px'
    },
    {
        id: 'lightning',
        name: '번개',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13 2 L3 12 H10 L7 18 L17 8 H10 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    }
];

// Premium Illustrations (Trendy Gradients & Mesh)
export const COVER_ILLUSTRATIONS = [
    {
        id: 'aurora-borealis',
        name: '오로라',
        value: 'linear-gradient(to right bottom, #43e97b 0%, #38f9d7 100%)',
        spineColor: '#43e97b',
        previewColor: '#38f9d7',
        textColor: '#1f2937'
    },
    {
        id: 'twilight-haze',
        name: '트와일라잇',
        value: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
        spineColor: '#a18cd1',
        previewColor: '#fbc2eb',
        textColor: '#ffffff'
    },
    {
        id: 'holographic-mesh',
        name: '홀로그램',
        value: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
        spineColor: '#1e1b4b',
        previewColor: '#312e81',
        textColor: '#ffffff'
    },
    {
        id: 'peach-dream',
        name: '피치 드림',
        value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
        spineColor: '#fda085',
        previewColor: '#f6d365',
        textColor: '#ffffff'
    },
    {
        id: 'midnight-city',
        name: '미드나잇',
        value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
        spineColor: '#330867',
        previewColor: '#30cfd0',
        textColor: '#ffffff'
    },
    {
        id: 'abstract-art',
        name: '추상화',
        value: 'conic-gradient(from 180deg at 50% 50%, #FF9A9E 0deg, #FECFEF 90deg, #FF9A9E 180deg, #99B9FF 270deg, #FF9A9E 360deg)',
        spineColor: '#ff9a9e',
        previewColor: '#fecfef',
        textColor: '#ffffff'
    }
];

// Premium Patterns (Memphis & Geometric)
export const COVER_PATTERNS = [
    {
        id: 'memphis-fun',
        name: '멤피스',
        value: `radial-gradient(circle, #fca5a5 20%, transparent 20%), 
                radial-gradient(circle, #fcd34d 20%, transparent 20%) 30px 30px,
                linear-gradient(45deg, transparent 48%, #60a5fa 48%, #60a5fa 52%, transparent 52%)`,
        spineColor: '#fef3c7',
        previewColor: '#fffbeb',
        textColor: '#1f2937',
        backgroundColor: '#fffbeb',
        size: '60px 60px'
    },
    {
        id: 'geo-blocks',
        name: '블록',
        value: `linear-gradient(30deg, #475569 12%, transparent 12.5%, transparent 87%, #475569 87.5%, #475569),
                linear-gradient(150deg, #475569 12%, transparent 12.5%, transparent 87%, #475569 87.5%, #475569),
                linear-gradient(30deg, #475569 12%, transparent 12.5%, transparent 87%, #475569 87.5%, #475569),
                linear-gradient(150deg, #475569 12%, transparent 12.5%, transparent 87%, #475569 87.5%, #475569),
                linear-gradient(60deg, #64748b 25%, transparent 25.5%, transparent 75%, #64748b 75%, #64748b),
                linear-gradient(60deg, #64748b 25%, transparent 25.5%, transparent 75%, #64748b 75%, #64748b)`,
        spineColor: '#334155',
        previewColor: '#0f172a',
        textColor: '#f8fafc',
        backgroundColor: '#0f172a',
        size: '100px 100px'
    },
    {
        id: 'japanese-waves',
        name: '파도',
        value: `radial-gradient(circle at 100% 50%, transparent 20%, #a5f3fc 21%, #a5f3fc 34%, transparent 35%, transparent),
                radial-gradient(circle at 0% 50%, transparent 20%, #a5f3fc 21%, #a5f3fc 34%, transparent 35%, transparent) 0 -50px`,
        spineColor: '#0ea5e9',
        previewColor: '#e0f2fe',
        textColor: '#0c4a6e',
        backgroundColor: '#eff6ff',
        size: '50px 50px'
    },
    {
        id: 'minimal-grid-premium',
        name: '모눈종이',
        value: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
        spineColor: '#f3f4f6',
        previewColor: '#ffffff',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        size: '20px 20px'
    },
    {
        id: 'noise-texture',
        name: '노이즈',
        value: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"), linear-gradient(to bottom right, #e2e8f0, #cbd5e1)`,
        spineColor: '#94a3b8',
        previewColor: '#f1f5f9',
        textColor: '#334155',
        backgroundColor: '#f8fafc',
        size: '200px 200px'
    },
    {
        id: 'terrazzo-premium',
        name: '테라조',
        value: `radial-gradient(circle, #fbcfe8 15%, transparent 16%),
                radial-gradient(circle, #fcd34d 10%, transparent 11%) 20px 20px,
                radial-gradient(circle, #a5f3fc 15%, transparent 16%) 10px 10px`,
        spineColor: '#f5d0fe',
        previewColor: '#faf5ff',
        textColor: '#1f2937',
        backgroundColor: '#faf5ff',
        size: '40px 40px'
    }
];

export const COVER_COLORS = [
    { name: '크림', value: '#fffbeb', spine: '#fde68a', text: '#78350f' },
    { name: '스카이', value: '#f0f9ff', spine: '#bae6fd', text: '#0c4a6e' },
    { name: '라벤더', value: '#f5f3ff', spine: '#ddd6fe', text: '#4c1d95' },
    { name: '민트', value: '#ecfdf5', spine: '#6ee7b7', text: '#064e3b' },
    { name: '코랄', value: '#fff1f2', spine: '#fda4af', text: '#881337' },
    { name: '레몬', value: '#fefce8', spine: '#fde047', text: '#713f12' },
    { name: '클레이', value: '#fff7ed', spine: '#fdba74', text: '#7c2d12' },
    { name: '스톤', value: '#f8fafc', spine: '#94a3b8', text: '#0f172a' },
    { name: '미드나잇', value: '#0f172a', spine: '#1e293b', text: '#f1f5f9' },
];

export const STICKER_ICONS = [
    '📝', '✈️', '📖', '📅', '🍳', '🛒', '🏋️', '💼', '🎓', '🎨', '🧸', '🎵', '📷', '💊', '💰', '🔑', '🎁', '🎈', '🌙', '⭐', '❤️', '🔥', '✨', '🍀', '🐶', '🐱'
];
