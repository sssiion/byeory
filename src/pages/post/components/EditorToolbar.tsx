import React from 'react';
import {
    Trash2,
    Type,
    Palette,
    AlignLeft,
    AlignCenter,
    AlignRight,
    // 👇 레이어 관련 아이콘 추가
    BringToFront,
    SendToBack,
    ArrowUp,
    ArrowDown, Sliders
} from 'lucide-react';
import type { Block, Sticker, FloatingText, FloatingImage } from '../types';

interface Props {
    selectedId: string;
    selectedType: 'block' | 'sticker' | 'floating' | 'floatingImage';
    currentItem: Block | Sticker | FloatingText | FloatingImage | any;
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage', changes: any) => void;
    onDelete?: () => void;
}

const EditorToolbar: React.FC<Props> = ({ selectedId, selectedType, currentItem, onUpdate, onDelete }) => {
    const itemType = (currentItem as any)?.type;
    // 현재 z-index 가져오기 (기본값 1)
    // 타입 가드: block이 아닌 경우에만 styles 속성이 있다고 가정 (또는 block 제외 로직)
    const currentZIndex = (currentItem as any).zIndex || 1;

    // z-index 변경 핸들러
    const handleZIndexChange = (change: number) => {
        const newZIndex = Math.max(1, currentZIndex + change); // 최소 1 이상

        // 기존 styles 객체를 유지하면서 zIndex만 업데이트
        const currentStyles = (currentItem as any).styles || {};
        onUpdate(selectedId, selectedType, { zIndex: newZIndex });onUpdate(selectedId, selectedType, { zIndex: newZIndex });
    };
    // "맨 앞으로/맨 뒤로" 같은 극단적인 이동이 필요하다면 아래처럼 큰 숫자를 쓸 수도 있습니다.
    // const setLayer = (mode: 'front' | 'back') => ...



    const isTextItem = (selectedType === 'block' && itemType === 'paragraph') || (selectedType === 'floating');
    const isImageItem = (selectedType === 'block' && itemType !== 'paragraph') || selectedType === 'sticker' || selectedType === 'floatingImage';

    const handleTextUpdate = (key: string, value: any) => {
        if (selectedType === 'block') {
            onUpdate(selectedId, selectedType, { [key]: value });
        } else {
            const currentStyles = (currentItem as any).styles || {};
            const newStyles = { ...currentStyles, [key]: value };
            onUpdate(selectedId, selectedType, { styles: newStyles });
        }
    };

    return (
        <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-2xl px-6 py-3 flex items-center gap-6 z-[100] animate-in slide-in-from-bottom-5"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 border-r pr-4">
                <Sliders size={16} className="text-indigo-600" />
                <span>설정</span>
            </div>
            {/* 1. 레이어(Z-Index) 조절 섹션 */}
            <div className="flex items-center gap-1 border-r pr-4 mr-2 border-gray-200">
                <span className="text-xs text-gray-400 font-bold mr-1">순서</span>
                <button
                    onClick={() => handleZIndexChange(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600 tooltip-trigger"
                    title="뒤로 보내기"
                >
                    <SendToBack size={18} />
                </button>
                <span className="text-xs font-mono w-4 text-center">{currentZIndex}</span>
                <button
                    onClick={() => handleZIndexChange(1)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                    title="앞으로 가져오기"
                >
                    <BringToFront size={18} />
                </button>
            </div>

            {isTextItem && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Type size={14} className="text-gray-400" />
                        <select
                            value={(currentItem as any).styles?.fontSize || '18px'}
                            onChange={(e) => handleTextUpdate('fontSize', e.target.value)}
                            className="bg-gray-100 rounded px-2 py-1 text-sm outline-none cursor-pointer hover:bg-gray-200 transition"
                        >
                            <option value="14px">작게</option>
                            <option value="18px">보통</option>
                            <option value="24px">크게</option>
                            <option value="32px">제목</option>
                        </select>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                        {['left', 'center', 'right'].map((align) => (
                            <button key={align} onClick={() => handleTextUpdate('textAlign', align)} className={`p-1.5 rounded-md ${(currentItem as any).styles?.textAlign === align ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:bg-gray-200'}`}>
                                {align === 'left' && <AlignLeft size={14} />}
                                {align === 'center' && <AlignCenter size={14} />}
                                {align === 'right' && <AlignRight size={14} />}
                            </button>
                        ))}
                    </div>
                    <input
                        type="color"
                        value={(currentItem as any).styles?.color || '#000000'}
                        onChange={(e) => handleTextUpdate('color', e.target.value)}
                        className="w-6 h-6 rounded-full cursor-pointer border-0 p-0"
                    />
                </div>
            )}

            {isImageItem && (
                <>
                    {selectedType === 'block' && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-bold whitespace-nowrap">사진 높이</span>
                            <input
                                type="range" min="200" max="800" step="10"
                                value={parseInt((currentItem as Block).styles?.imageHeight || '300')}
                                onChange={(e) => onUpdate(selectedId, 'block', { imageHeight: `${e.target.value}px` })}
                                className="w-32 accent-indigo-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                            />
                        </div>
                    )}
                    {(selectedType === 'sticker' || selectedType === 'floatingImage') && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-bold whitespace-nowrap">투명도</span>
                            <input
                                type="range" min="0.1" max="1" step="0.1"
                                value={(currentItem as any).opacity ?? 1}
                                onChange={(e) => onUpdate(selectedId, selectedType, { opacity: parseFloat(e.target.value) })}
                                className="w-32 accent-indigo-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                            />
                        </div>
                    )}
                </>
            )}

            {onDelete && (
                <div className="border-l pl-4 ml-auto">
                    <button onClick={onDelete} className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap">
                        <Trash2 size={16} />
                        <span>삭제</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditorToolbar;