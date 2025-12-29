export type ViewMode = 'list' | 'editor' | 'read';

export interface Block {
    id: string;
    type: 'paragraph' | 'image-full' | 'image-double' | 'image-left' | 'image-right';
    text: string;
    imageUrl?: string;
    imageUrl2?: string;
    imageRotation?: number;
    imageFit?: 'cover' | 'contain';
    styles?: Record<string, any>;
}

// 🔴 수정됨: 좌표와 크기를 number(픽셀 단위)로 변경
export interface BaseFloatingItem {
    id: string;
    x: number; // px 단위
    y: number; // px 단위
    w: number; // px 단위
    h: number; // px 단위 (비율 유지를 위해 자동 계산될 수 있음)
    rotation: number;
    opacity?: number;
    zIndex: number;
}

export interface Sticker extends BaseFloatingItem {
    url: string;
}

export interface FloatingText extends BaseFloatingItem {
    text: string;
    styles: {
        fontSize: string;
        fontWeight: string;
        textAlign: string;
        color: string;
        backgroundColor: string;
        fontFamily: string; // ✨ 추가
    };
}

export interface FloatingImage extends BaseFloatingItem {
    url: string;
}

export interface PostData {
    id: number;
    title: string;
    date: string;
    blocks: Block[];
    stickers: Sticker[];
    floatingTexts: FloatingText[];
    floatingImages: FloatingImage[];
    titleStyles?: Record<string, any>;
}