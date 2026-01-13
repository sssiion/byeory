export interface StickerItemDef {
    id: string;
    url: string;
    isPremium: boolean;
    price?: number;
    packId?: string; // Links to MarketItem.id
    name: string; // Display name for history/UI
}

export const STICKERS: StickerItemDef[] = [
    // Free Stickers (Default)
    { id: 'free_1', url: 'https://cdn-icons-png.flaticon.com/512/833/833472.png', isPremium: false, name: '기본 1' },
    { id: 'free_2', url: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', isPremium: false, name: '기본 2' },
    { id: 'free_3', url: 'https://cdn-icons-png.flaticon.com/512/785/785116.png', isPremium: false, name: '기본 3' },
    { id: 'free_4', url: 'https://cdn-icons-png.flaticon.com/512/346/346167.png', isPremium: false, name: '기본 4' },
    { id: 'free_5', url: 'https://cdn-icons-png.flaticon.com/512/742/742751.png', isPremium: true, price: 150, packId: 'pack_basic', name: '스마일' },
    { id: 'free_6', url: 'https://cdn-icons-png.flaticon.com/512/169/169367.png', isPremium: true, price: 150, packId: 'pack_basic', name: '해' },
    { id: 'free_7', url: 'https://cdn-icons-png.flaticon.com/512/414/414825.png', isPremium: true, price: 150, packId: 'pack_basic', name: '구름' },
    { id: 'free_8', url: 'https://cdn-icons-png.flaticon.com/512/651/651717.png', isPremium: true, price: 150, packId: 'pack_basic', name: '음표' },
    { id: 'free_9', url: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', isPremium: true, price: 150, packId: 'pack_basic', name: '체크' },
    { id: 'free_10', url: 'https://cdn-icons-png.flaticon.com/512/126/126473.png', isPremium: true, price: 150, packId: 'pack_basic', name: '엄지척' },

    // Premium Stickers (From Mock Market)
    // Pack 001: Cute Cat
    { id: 'cat_1', url: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', isPremium: true, price: 200, packId: 'sticker_pack_001', name: '고양이 1' },
    { id: 'cat_2', url: 'https://cdn-icons-png.flaticon.com/512/616/616430.png', isPremium: true, price: 200, packId: 'sticker_pack_001', name: '고양이 2' },

    // Pack 002: Vintage Label
    { id: 'vintage_1', url: 'https://cdn-icons-png.flaticon.com/512/2361/2361730.png', isPremium: true, price: 300, packId: 'sticker_pack_002', name: '빈티지 라벨 1' },

    // Pack 003: Pixel Art
    { id: 'pixel_1', url: 'https://cdn-icons-png.flaticon.com/512/10603/10603762.png', isPremium: true, price: 250, packId: 'sticker_pack_003', name: '픽셀 이모지 1' },
];

// 사용 가능한 폰트 목록 (Google Fonts)
export const FONT_FAMILIES = [
    { name: 'Noto Sans KR', value: "'Noto Sans KR', sans-serif" },
    { name: '나눔고딕', value: "'Nanum Gothic', sans-serif" },
    { name: '나눔명조', value: "'Nanum Myeongjo', serif" },
    { name: '고운돋움', value: "'Gowun Dodum', sans-serif" },
    { name: '고운바탕', value: "'Gowun Batang', serif" },
    { name: '송명', value: "'Song Myung', serif" },
    { name: '검은고딕', value: "'Black Han Sans', sans-serif" },
    { name: '도현', value: "'Do Hyeon', sans-serif" },
    { name: '주아', value: "'Jua', sans-serif" },
    { name: '연성', value: "'Yeon Sung', cursive" },
    { name: '해바라기', value: "'Sunflower', sans-serif" },
    { name: '고딕 A1', value: "'Gothic A1', sans-serif" },
    { name: '하이멜로디', value: "'Hi Melody', cursive" },
    { name: '감자꽃', value: "'Gamja Flower', cursive" },
    { name: '서툰이야기', value: "'Poor Story', cursive" },
    { name: 'IBM Plex Sans KR', value: "'IBM Plex Sans KR', sans-serif" },
    { name: '베이글', value: "'Bagel Fat One', cursive" },
    { name: '동글', value: "'Dongle', sans-serif" },
    { name: '싱글데이', value: "'Single Day', cursive" },
];

// 레이아웃별로 '어떤 블록을 어떤 순서로 배치할지' 미리 정해둡니다.
export const LAYOUT_PRESETS = [
    {
        id: 'type-a',
        name: '📷 밸런스형',
        description: '사진과 글이 적절히 섞인 가장 무난한 구성',
        structure: [
            { type: 'image-full', text: '' },   // 1. 대문 사진 + 제목 느낌
            { type: 'paragraph', text: '' },    // 2. 도입부 글
            { type: 'image-double', text: '' }, // 3. 사진 2장 나란히 + 설명
            { type: 'paragraph', text: '' }     // 4. 마무리 글
        ]
    },
    {
        id: 'type-b',
        name: '📖 매거진형',
        description: '왼쪽, 오른쪽 사진이 교차되는 잡지 스타일',
        structure: [
            { type: 'image-left', text: '' },   // 1. 사진(좌) - 글(우)
            { type: 'image-right', text: '' },  // 2. 글(좌) - 사진(우)
            { type: 'image-left', text: '' },   // 3. 사진(좌) - 글(우)
            { type: 'paragraph', text: '' }     // 4. 짧은 마무리
        ]
    },
    {
        id: 'type-c',
        name: '🖼️ 앨범형',
        description: '글보다는 사진을 많이 보여주고 싶을 때',
        structure: [
            { type: 'image-double', text: '' }, // 1. 사진 2장
            { type: 'image-double', text: '' }, // 2. 사진 2장
            { type: 'image-full', text: '' },   // 3. 큰 사진 1장
            { type: 'paragraph', text: '' }     // 4. 전체적인 총평
        ]
    },
    {
        id: 'type-d',
        name: '📝 에세이형',
        description: '차분하게 글을 많이 쓰고 싶을 때',
        structure: [
            { type: 'paragraph', text: '' },    // 1. 긴 글
            { type: 'paragraph', text: '' },    // 2. 긴 글
            { type: 'image-full', text: '' },   // 3. 중간 환기용 사진
            { type: 'paragraph', text: '' }     // 4. 마무리 글
        ]
    }
];