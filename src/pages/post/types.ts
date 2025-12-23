export interface Block {
    id: string;
    type: 'paragraph' | 'image-full' | 'image-double' | 'image-left' | 'image-right';
    text: string;
    imageUrl?: string;
    imageUrl2?: string;
    imageRotation?: number;
    imageFit?: 'cover' | 'contain';
    // 텍스트 스타일 추가
    styles?: {
        fontSize?: string;
        fontWeight?: string;
        textAlign?: 'left' | 'center' | 'right';
        color?: string;
    };
}

export interface Sticker {
    id: string;
    url: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    opacity: number;
    zIndex: number;
}

// ✨ 새로운 떠다니는 텍스트 타입
export interface FloatingText {
    id: string;
    text: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    zIndex: number;
    styles: {
        fontSize: string;
        fontWeight: string;
        textAlign: 'left' | 'center' | 'right';
        color: string;
        backgroundColor?: string;
    };
}

export type ViewMode = 'list' | 'editor' | 'read';

export interface PostData {
    id: number;
    title: string;
    date: string;
    blocks: Block[];
    stickers: Sticker[];
    floatingTexts?: FloatingText[]; // 저장 데이터에 추가
    floatingImages?: FloatingImage[]; // 추가
}
export interface FloatingImage {
    id: string;
    url: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    opacity: number;
    zIndex: number;
}