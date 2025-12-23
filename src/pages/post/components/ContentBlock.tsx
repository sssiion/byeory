import React, { useRef } from 'react';
import type { Block } from '../types';

interface Props {
    block: Block;
    onUpdate: (id: string, field: string, value: any) => void;
    onDelete: (id: string) => void;
    onImageUpload: (id: string, file: File, index?: number) => void;
    onSwapLayout: (id: string) => void;
    isSelected: boolean;
    onSelect: () => void;
    readOnly: boolean;
    dragHandleProps?: any;
}

const ContentBlock: React.FC<Props> = ({ block, onUpdate, onDelete, onImageUpload, onSwapLayout, isSelected, onSelect, readOnly, dragHandleProps }) => {
    const fileInputRef1 = useRef<HTMLInputElement>(null);
    const fileInputRef2 = useRef<HTMLInputElement>(null);

    const triggerFile = (idx: number) => idx === 1 ? fileInputRef1.current?.click() : fileInputRef2.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imgIndex: number) => {
        if (e.target.files?.[0]) onImageUpload(block.id, e.target.files[0], imgIndex);
    };

    const handleDeleteImage = (e: React.MouseEvent, imgIndex: number) => {
        e.stopPropagation();
        onUpdate(block.id, imgIndex === 1 ? 'imageUrl' : 'imageUrl2', '');
    };

    const toggleImageFit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newFit = block.imageFit === 'contain' ? 'cover' : 'contain';
        onUpdate(block.id, 'imageFit', newFit);
    };

    // 스타일 추출 (높이 기본값 400px)
    const s = block.styles || {};
    const imgHeight = s.imageHeight || '400px';

    const textStyle = `flex-1 outline-none whitespace-pre-wrap leading-relaxed text-gray-800 font-serif text-lg min-h-[1.5em] p-2 text-left ${readOnly ? '' : "empty:before:content-['내용을_입력하세요...'] empty:before:text-gray-400 cursor-text"}`;

    // 이미지 영역 컴포넌트
    const ImageArea = ({ url, index, isFull = false }: { url?: string, index: number, isFull?: boolean }) => {
        const fitMode = block.imageFit || 'cover';
        if (!url && readOnly) return null;

        return (
            <div
                onClick={(e) => { e.stopPropagation(); if (!readOnly) { onSelect(); if (!url) triggerFile(index); } }}
                className={`relative rounded-lg overflow-hidden group/img transition-all bg-gray-50
                    ${!url ? 'border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center' : ''} 
                    ${isSelected && !readOnly ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}
                    ${isFull ? 'w-full' : 'h-full'} 
                `}
                // [NEW] 높이 조절 적용 (이미지 없을 땐 고정 높이)
                style={{ height: url ? imgHeight : '150px' }}
            >
                {url ? (
                    <>
                        <img
                            src={url}
                            className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                            style={{ transform: `rotate(${block.imageRotation || 0}deg)` }}
                            alt="img"
                        />
                        {!readOnly && (
                            <>
                                <button onClick={(e) => handleDeleteImage(e, index)} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition z-10">×</button>
                                <button onClick={toggleImageFit} className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-xs px-2 py-1 rounded shadow text-gray-700 opacity-0 group-hover/img:opacity-100 transition z-10 font-bold">{fitMode === 'contain' ? '↔ 꽉 채우기' : '🖼 원본 비율'}</button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-gray-400 hover:text-indigo-500 text-center">
                        <span className="text-2xl block mb-1">📷</span>
                        <span className="text-xs font-bold">사진 추가</span>
                    </div>
                )}
                <input type="file" hidden ref={index === 1 ? fileInputRef1 : fileInputRef2} onChange={(e) => handleFileChange(e, index)} accept="image/*" />
            </div>
        );
    };

    const hasImg1 = !!block.imageUrl;
    const hasImg2 = !!block.imageUrl2;
    const showImg1InDouble = hasImg1 || (!hasImg1 && !hasImg2);
    const showImg2InDouble = hasImg2 || (!hasImg1 && !hasImg2);

    return (
        <div className={`group relative mb-2 flex gap-4 items-start ${readOnly ? '' : 'hover:bg-gray-50/50 rounded-lg p-1 -ml-1 transition'}`} onClick={(e) => { e.stopPropagation(); if (!readOnly) onSelect(); }}>
            {!readOnly && (
                <>
                    <div {...dragHandleProps} className="absolute -left-6 top-2 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing px-2 opacity-0 group-hover:opacity-100 transition">⋮⋮</div>
                    <button onClick={() => onDelete(block.id)} className="absolute -right-8 top-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2">🗑️</button>
                    {(block.type === 'image-left' || block.type === 'image-right') && <button onClick={(e) => { e.stopPropagation(); onSwapLayout(block.id); }} className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white border shadow-sm text-gray-500 text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-indigo-50 hover:text-indigo-600">↔️ 위치 변경</button>}
                </>
            )}

            {/* Content Renders */}
            {block.type === 'image-full' && (
                <div className="w-full">
                    <ImageArea url={block.imageUrl} index={1} isFull />
                    {block.text && <div contentEditable={!readOnly} suppressContentEditableWarning onInput={(e) => onUpdate(block.id, 'text', e.currentTarget.innerText)} className={textStyle + " mt-2 bg-gray-50/50 rounded-lg"} style={s}>{block.text}</div>}
                </div>
            )}

            {block.type === 'image-double' && (
                <div className="w-full">
                    <div className="flex gap-4 mb-2">
                        {showImg1InDouble && <div className={!showImg2InDouble ? "w-full" : "w-1/2"}><ImageArea url={block.imageUrl} index={1} isFull={!showImg2InDouble} /></div>}
                        {showImg2InDouble && <div className={!showImg1InDouble ? "w-full" : "w-1/2"}><ImageArea url={block.imageUrl2} index={2} isFull={!showImg1InDouble} /></div>}
                    </div>
                    {!readOnly && !hasImg1 && !hasImg2 && <div className="text-center text-xs text-gray-400 mb-2">사진이 모두 삭제되었습니다.</div>}
                    <div contentEditable={!readOnly} suppressContentEditableWarning onInput={(e) => onUpdate(block.id, 'text', e.currentTarget.innerText)} className={textStyle} style={s}>{block.text}</div>
                </div>
            )}

            {block.type === 'image-left' && (
                <>
                    {hasImg1 && <div className="w-1/3 flex-shrink-0"><ImageArea url={block.imageUrl} index={1} isFull={true} /></div>}
                    <div className="flex-1 min-w-0 relative">
                        <div contentEditable={!readOnly} suppressContentEditableWarning onInput={(e) => onUpdate(block.id, 'text', e.currentTarget.innerText)} className={textStyle} style={s}>{block.text}</div>
                        {!readOnly && !hasImg1 && <button onClick={() => triggerFile(1)} className="absolute -left-8 top-1 text-gray-300 hover:text-indigo-500 p-1">📷+</button>}
                    </div>
                </>
            )}

            {block.type === 'image-right' && (
                <>
                    <div className="flex-1 min-w-0 relative">
                        <div contentEditable={!readOnly} suppressContentEditableWarning onInput={(e) => onUpdate(block.id, 'text', e.currentTarget.innerText)} className={textStyle} style={s}>{block.text}</div>
                        {!readOnly && !hasImg1 && <button onClick={() => triggerFile(1)} className="absolute -right-8 top-1 text-gray-300 hover:text-indigo-500 p-1">📷+</button>}
                    </div>
                    {hasImg1 && <div className="w-1/3 flex-shrink-0"><ImageArea url={block.imageUrl} index={1} isFull={true} /></div>}
                </>
            )}

            {block.type === 'paragraph' && (
                <div contentEditable={!readOnly} suppressContentEditableWarning onInput={(e) => onUpdate(block.id, 'text', e.currentTarget.innerText)} className={textStyle} style={s}>{block.text}</div>
            )}

            <input type="file" hidden ref={fileInputRef1} onChange={(e) => handleFileChange(e, 1)} accept="image/*" />
            <input type="file" hidden ref={fileInputRef2} onChange={(e) => handleFileChange(e, 2)} accept="image/*" />
        </div>
    );
};

export default ContentBlock;