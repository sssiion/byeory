import React from 'react';

interface Props {
    targetType: 'block' | 'sticker' | 'floating' | 'floatingImage' | null;
    values: any;
    onUpdate: (key: string, value: any) => void;
    onZIndexChange?: (direction: 'up' | 'down') => void;
    onDelete: () => void;
    hasImage?: boolean;
}

const EditorToolbar: React.FC<Props> = ({ targetType, values, onUpdate, onZIndexChange, onDelete, hasImage }) => {
    if (!targetType) return null;

    return (
        <div
            // 🛠️ [중요 수정] 도구 상자 클릭 시 배경 클릭 이벤트(선택 해제) 방지
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-gray-200 rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-fade-in-up"
        >

            {/* 1. 텍스트/블록 스타일 도구 */}
            {(targetType === 'block' || targetType === 'floating') && (
                <>
                    <div className="flex gap-1 border-r pr-4">
                        <span className="text-xs self-center mr-1">텍스트</span>
                        <select
                            value={values.fontSize || '18px'}
                            onChange={(e) => onUpdate('fontSize', e.target.value)}
                            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                        >
                            <option value="14px">작게</option>
                            <option value="18px">보통</option>
                            <option value="24px">크게</option>
                            <option value="32px">아주 크게</option>
                        </select>
                    </div>

                    <div className="flex gap-2 border-r pr-4 items-center">
                        <button onClick={() => onUpdate('textAlign', 'left')} className={`p-1.5 rounded ${values.textAlign === 'left' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}>⬅️</button>
                        <button onClick={() => onUpdate('textAlign', 'center')} className={`p-1.5 rounded ${values.textAlign === 'center' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}>⏺️</button>
                        <button onClick={() => onUpdate('textAlign', 'right')} className={`p-1.5 rounded ${values.textAlign === 'right' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}>➡️</button>
                        <input type="color" value={values.color || '#000000'} onChange={(e) => onUpdate('color', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0 ml-1" />
                    </div>

                    {/* 사진 크기 조절 (블록용) */}
                    {targetType === 'block' && hasImage && (
                        <div className="flex gap-2 items-center border-r pr-4 w-32">
                            <span className="text-xs">📸 크기</span>
                            <input
                                type="range" min="200" max="800" step="50"
                                value={parseInt(values.imageHeight || '400')}
                                onChange={(e) => onUpdate('imageHeight', `${e.target.value}px`)}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    )}
                </>
            )}

            {/* 2. 레이어 순서 (스티커, 텍스트, 사진) */}
            {(targetType === 'sticker' || targetType === 'floating' || targetType === 'floatingImage') && (
                <div className="flex gap-2 border-r pr-4">
                    <button onClick={() => onZIndexChange?.('down')} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">🔻 뒤로</button>
                    <button onClick={() => onZIndexChange?.('up')} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">🔺 앞으로</button>
                </div>
            )}

            {/* 3. 투명도 조절 (스티커, 자유 사진) */}
            {(targetType === 'sticker' || targetType === 'floatingImage') && (
                <div className="flex gap-2 items-center border-r pr-4 w-32">
                    <span className="text-xs">👻</span>
                    <input
                        type="range" min="0.1" max="1" step="0.1"
                        value={values.opacity || 1}
                        onChange={(e) => onUpdate('opacity', parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            )}

            {/* 삭제 버튼 */}
            <button onClick={onDelete} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded font-bold text-sm whitespace-nowrap">
                삭제 🗑️
            </button>
        </div>
    );
};

export default EditorToolbar;