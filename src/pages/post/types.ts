export type ViewMode = 'list' | 'editor' | 'read' | 'album' | 'folder';

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

// 좌표와 크기를 number(픽셀 단위)로 변경
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
        fontFamily: string;
        fontStyle?: string;
        textDecoration?: string;
    };
}

export interface FloatingImage extends BaseFloatingItem {
    url: string;
}

export interface PostData {
    id: number;
    title: string;
    date: string;
    tags?: string[]; // ✨ 태그 (앨범 분류용 - 하위 호환성 및 단순 태그용)
    albumIds?: string[]; // ✨ 앨범 ID (고유 저장 위치)
    blocks: Block[];
    stickers: Sticker[];
    floatingTexts: FloatingText[];
    floatingImages: FloatingImage[];
    titleStyles?: Record<string, any>;
}