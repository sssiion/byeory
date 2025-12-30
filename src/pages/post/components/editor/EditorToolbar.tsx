import React from 'react';
import {
    Trash2,
    Type,
    AlignLeft,
    AlignCenter,
    AlignRight,
    BringToFront,
    SendToBack,
    Sliders,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    ChevronDown
} from 'lucide-react';
import type { Block, Sticker, FloatingText, FloatingImage } from '../../types';
import { FONT_FAMILIES } from '../../constants';

interface Props {
    selectedId: string;
    selectedType: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title';
    currentItem: Block | Sticker | FloatingText | FloatingImage | any;
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title', changes: any) => void;
    onDelete?: () => void;
}

const EditorToolbar: React.FC<Props> = ({ selectedId, selectedType, currentItem, onUpdate, onDelete }) => {
    const [showTextMenu, setShowTextMenu] = React.useState(false);
    const [showBgMenu, setShowBgMenu] = React.useState(false);
    const itemType = (currentItem as any)?.type;
    const currentZIndex = (currentItem as any).zIndex || 1;

    const handleZIndexChange = (change: number) => {
        const newZIndex = Math.max(1, currentZIndex + change);
        onUpdate(selectedId, selectedType, { zIndex: newZIndex });
    };

    const isTextItem = (selectedType === 'block' && itemType === 'paragraph') || (selectedType === 'floating') || (selectedType === 'title');
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

    // 폰트 크기 숫자(px)만 추출하는 헬퍼
    const getFontSizeNumber = () => {
        const sizeStr = (currentItem as any).styles?.fontSize || '18px';
        return parseInt(sizeStr.replace('px', '')) || 18;
    };

    return (
        <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-2xl px-6 py-3 flex items-center z-[100] animate-in slide-in-from-bottom-5"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 border-r pr-4 mr-4">
                <Sliders size={16} className="text-indigo-600" />
                <span>설정</span>
            </div>

            {/* 1. 레이어 순서 */}
            {selectedType !== 'block' && (
                <div className="flex items-center gap-1 border-r pr-4 mr-2 border-gray-200">
                    <span className="text-xs text-gray-400 font-bold mr-1">순서</span>
                    <button onClick={() => handleZIndexChange(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="뒤로 보내기">
                        <SendToBack size={18} />
                    </button>
                    <span className="text-xs font-mono w-4 text-center">{currentZIndex}</span>
                    <button onClick={() => handleZIndexChange(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="앞으로 가져오기">
                        <BringToFront size={18} />
                    </button>
                </div>
            )}

            {isTextItem && (
                <div className="flex items-center gap-4">
                    {/* 폰트 선택 */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border">
                        <select
                            value={(currentItem as any).styles?.fontFamily || FONT_FAMILIES[0].value}
                            onChange={(e) => handleTextUpdate('fontFamily', e.target.value)}
                            className="bg-transparent text-sm outline-none cursor-pointer w-24 truncate px-1"
                        >
                            {FONT_FAMILIES.map(font => (
                                <option key={font.name} value={font.value}>{font.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 폰트 크기 (px input) */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border">
                        <Type size={14} className="text-gray-400 ml-1" />
                        <input
                            type="number"
                            min="10"
                            max="170"
                            value={getFontSizeNumber()}
                            onChange={(e) => handleTextUpdate('fontSize', `${e.target.value}px`)}
                            className="w-12 bg-transparent text-sm outline-none text-center font-mono"
                        />
                        <span className="text-xs text-gray-400 pr-1">px</span>
                    </div>

                    {/* 정렬 버튼 */}
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                        {['left', 'center', 'right'].map((align) => (
                            <button key={align} onClick={() => handleTextUpdate('textAlign', align)} className={`p-1.5 rounded-md ${((currentItem as any).styles?.textAlign || 'left') === align ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:bg-gray-200'}`}>
                                {align === 'left' && <AlignLeft size={14} />}
                                {align === 'center' && <AlignCenter size={14} />}
                                {align === 'right' && <AlignRight size={14} />}
                            </button>
                        ))}
                    </div>

                    {/* 텍스트 스타일 드롭다운 (색상 + 꾸미기) */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTextMenu(!showTextMenu)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded hover:bg-gray-100 transition ${showTextMenu ? 'bg-gray-100' : ''}`}
                            title="텍스트 스타일"
                        >
                            <span
                                className="font-serif font-bold text-lg"
                                style={{
                                    color: (currentItem as any).styles?.color || '#000000',
                                    textDecoration: (currentItem as any).styles?.textDecoration,
                                    fontStyle: (currentItem as any).styles?.fontStyle
                                }}
                            >
                                T
                            </span>
                            <ChevronDown size={12} className="text-gray-400" />
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {showTextMenu && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex flex-col gap-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
                                {/* 1. 스타일 버튼들 */}
                                <div className="flex justify-between bg-gray-50 rounded p-1">
                                    <button
                                        onClick={() => handleTextUpdate('fontWeight', (currentItem as any).styles?.fontWeight === 'bold' ? 'normal' : 'bold')}
                                        className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition ${(currentItem as any).styles?.fontWeight === 'bold' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                        title="굵게"
                                    >
                                        <Bold size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleTextUpdate('fontStyle', (currentItem as any).styles?.fontStyle === 'italic' ? 'normal' : 'italic')}
                                        className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition ${(currentItem as any).styles?.fontStyle === 'italic' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                        title="기울임"
                                    >
                                        <Italic size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleTextUpdate('textDecoration', (currentItem as any).styles?.textDecoration?.includes('underline') ? 'none' : 'underline')}
                                        className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition ${(currentItem as any).styles?.textDecoration?.includes('underline') ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                        title="밑줄"
                                    >
                                        <Underline size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleTextUpdate('textDecoration', (currentItem as any).styles?.textDecoration?.includes('line-through') ? 'none' : 'line-through')}
                                        className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition ${(currentItem as any).styles?.textDecoration?.includes('line-through') ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                        title="취소선"
                                    >
                                        <Strikethrough size={16} />
                                    </button>
                                </div>

                                {/* 2. 색상 선택 */}
                                <div className="relative h-8 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group">
                                    <div
                                        className="w-full h-full flex items-center justify-center gap-2 bg-gray-50 group-hover:bg-gray-100 transition"
                                        style={{ backgroundColor: (currentItem as any).styles?.color || '#000000' + '10' }} // 배경색으로 살짝 틴트
                                    >
                                        <span className="text-xs font-bold text-gray-600 mix-blend-difference">Color</span>
                                        <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: (currentItem as any).styles?.color || '#000000' }}></div>
                                    </div>
                                    <input
                                        type="color"
                                        value={(currentItem as any).styles?.color || '#000000'}
                                        onChange={(e) => handleTextUpdate('color', e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 배경색 스타일 드롭다운 (O 아이콘) */}
                    <div className="relative">
                        <button
                            onClick={() => setShowBgMenu(!showBgMenu)}
                            className={`flex items-center gap-1 px-2 py-2 rounded hover:bg-gray-100 transition ${showBgMenu ? 'bg-gray-100' : ''}`}
                            title="배경 색상"
                        >
                            <span
                                className="w-5 h-5 rounded-full border border-gray-300 shadow-sm flex items-center justify-center font-bold text-xs"
                                style={{ backgroundColor: (currentItem as any).styles?.backgroundColor || 'transparent' }}
                            >
                                {/* 배경색이 투명이면 빗금 표시 등으로 표현 가능하지만 지금은 심플하게 */}
                                {!(currentItem as any).styles?.backgroundColor || (currentItem as any).styles?.backgroundColor === 'transparent' ? '/' : ''}
                            </span>
                            <ChevronDown size={12} className="text-gray-400" />
                        </button>

                        {/* 배경색 메뉴 */}
                        {showBgMenu && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex flex-col gap-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
                                {/* 색상 선택 */}
                                <div className="relative h-8 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group">
                                    <div
                                        className="w-full h-full flex items-center justify-center gap-2 bg-gray-50 group-hover:bg-gray-100 transition"
                                    >
                                        <span className="text-xs font-bold text-gray-600">BG Color</span>
                                        <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: (currentItem as any).styles?.backgroundColor || 'transparent' }}></div>
                                    </div>
                                    <input
                                        type="color"
                                        value={(currentItem as any).styles?.backgroundColor || '#ffffff'}
                                        onChange={(e) => handleTextUpdate('backgroundColor', e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </div>
                                {/* 초기화 버튼 */}
                                <button
                                    onClick={() => handleTextUpdate('backgroundColor', 'transparent')}
                                    className="w-full py-1.5 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition"
                                >
                                    배경색 없음
                                </button>
                            </div>
                        )}
                    </div>
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
                <div className="border-l pl-3 ml-2 text-gray-500">
                    <button onClick={onDelete} className="flex items-center justify-center text-red-500 hover:bg-red-50 w-8 h-5 rounded-lg transition" title="삭제">
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditorToolbar;