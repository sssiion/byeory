
export interface MarketItem {
    id: string;
    type: 'sticker' | 'template_widget' | 'template_post';
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    author: string;
    tags: string[];
}

export const MOCK_MARKET_ITEMS: MarketItem[] = [
    {
        id: 'pack_basic',
        type: 'sticker',
        title: '⭐ 스타터 팩',
        description: '다이어리 꾸미기의 기본! 필수 스티커 10종 모음.',
        price: 500, // Bundle deal (Individual sum is ~1300)
        author: 'Byeory Official',
        tags: ['basic', 'starter', 'essential'],
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/169/169367.png'
    },
    {
        id: 'sticker_pack_001',
        type: 'sticker',
        title: '귀여운 고양이 팩',
        description: '다이어리에 쓰기 좋은 귀여운 고양이 스티커 모음입니다.',
        price: 1500,
        author: 'S_JSon',
        tags: ['cute', 'cat', 'animal'],
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png'
    },
    {
        id: 'sticker_pack_002',
        type: 'sticker',
        title: '빈티지 라벨',
        description: '감성적인 다꾸를 위한 빈티지 라벨 스티커입니다.',
        price: 1200,
        author: 'DesignLab',
        tags: ['vintage', 'label', 'brown'],
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/2361/2361730.png'
    },
    {
        id: 'widget_template_001',
        type: 'template_widget',
        title: '미니멀 시계 & 투두',
        description: '책상 위를 깔끔하게 정리해주는 미니멀 위젯 세트입니다.',
        price: 3000,
        author: 'Minimalist',
        tags: ['minimal', 'widget', 'productivity'],
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/12117/12117188.png'
    },
    {
        id: 'post_template_001',
        type: 'template_post',
        title: '공부 기록 템플릿',
        description: '오늘의 공부 시간을 기록하고 회고할 수 있는 템플릿입니다.',
        price: 2000,
        author: 'StudyWithMe',
        tags: ['study', 'diary', 'template'],
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/4021/4021693.png'
    },
    {
        id: 'sticker_pack_003',
        type: 'sticker',
        title: '픽셀 아트 이모지',
        description: '레트로 게임 감성의 픽셀 아트 이모지 팩!',
        price: 1800,
        author: 'PixelArt',
        tags: ['pixel', 'retro', 'emoji'],
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/10603/10603762.png'
    }
];
