import React, { useRef, useEffect } from 'react';
import type { Block } from '../../types';
import { Trash2, GripVertical } from 'lucide-react';

interface Props {
    block: Block;
    onUpdate: (id: string, field: string, value: any) => void;
    onDelete: (id: string) => void;
    onImageUpload: (id: string, file: File, index?: number) => void;
    isSelected: boolean;
    onSelect: () => void;
    readOnly: boolean;
    dragHandleProps?: any;
}

const ContentBlock: React.FC<Props> = ({ block, onUpdate, onDelete, onImageUpload, isSelected, onSelect, readOnly, dragHandleProps }) => {
    const fileInputRef1 = useRef<HTMLInputElement>(null);
    const fileInputRef2 = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 텍스트 높이 자동 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [block.text, block.styles]);

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

    const s = block.styles || {};
    const imgHeight = s.imageHeight || '300px';

    // 이미지 영역 렌더링 함수
    const renderImageArea = (url: string | undefined, index: number, isFull: boolean = false) => {
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
                style={{ height: url ? imgHeight : '200px' }}
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

    return (
        <div className={`group relative mb-6 flex gap-6 items-start ${readOnly ? '' : `hover:bg-gray-50 rounded-xl p-2 -ml-2 transition ${isSelected ? 'bg-gray-50' : ''}`}`} onClick={(e) => { e.stopPropagation(); if (!readOnly) onSelect(); }}>

            {!readOnly && !isSelected && ( // isSelected일 때는 숨김 (오른쪽 사이드바 메뉴가 나오거나 방해되지 않도록)
                <>
                    <div {...dragHandleProps} className="absolute -left-10 top-1 p-1.5 text-gray-400 hover:text-indigo-600 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition">
                        <GripVertical size={20} />
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                        className="absolute -right-12 top-0 bg-white border border-gray-200 shadow-sm p-1.5 rounded text-red-500 hover:bg-red-50 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                        <Trash2 size={16} />
                    </button>
                </>
            )}

            {/* 1. 꽉찬 사진 + 아래 글 */}
            {block.type === 'image-full' && (
                <div className="w-full flex flex-col gap-4">
                    {renderImageArea(block.imageUrl, 1, true)}
                    <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className="w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[3rem]" style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize || '18px', textAlign: block.styles?.textAlign as any || 'left', color: block.styles?.color || 'inherit' }} />
                </div>
            )}

            {/* 2. 사진 2장 + 아래 글 */}
            {block.type === 'image-double' && (
                <div className="w-full flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="w-1/2">{renderImageArea(block.imageUrl, 1, true)}</div>
                        <div className="w-1/2">{renderImageArea(block.imageUrl2, 2, true)}</div>
                    </div>
                    <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className="w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[3rem]" style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize || '18px', textAlign: block.styles?.textAlign as any || 'left', color: block.styles?.color || 'inherit' }} />
                </div>
            )}

            {/* 3. 사진 왼쪽 + 글 오른쪽 */}
            {block.type === 'image-left' && (
                <div className="w-full flex flex-row gap-6 items-start">
                    <div className="w-1/2 flex-shrink-0">{renderImageArea(block.imageUrl, 1, true)}</div>
                    <div className="flex-1 min-w-0 pt-2 relative">
                        <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className="w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[3rem]" style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize || '18px', textAlign: block.styles?.textAlign as any || 'left', color: block.styles?.color || 'inherit' }} />

                    </div>
                </div>
            )}

            {/* 4. 글 왼쪽 + 사진 오른쪽 */}
            {block.type === 'image-right' && (
                <div className="w-full flex flex-row gap-6 items-start">
                    <div className="flex-1 min-w-0 pt-2 relative">
                        <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className="w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[3rem]" style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize || '18px', textAlign: block.styles?.textAlign as any || 'left', color: block.styles?.color || 'inherit' }} />

                    </div>
                    <div className="w-1/2 flex-shrink-0">{renderImageArea(block.imageUrl, 1, true)}</div>
                </div>
            )}

            {/* 5. 글만 */}
            {block.type === 'paragraph' && (
                <div className="w-full">
                    <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className="w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[3rem]" style={{
                        fontFamily: block.styles?.fontFamily,
                        fontSize: block.styles?.fontSize || '18px',
                        textAlign: block.styles?.textAlign as any || 'left',
                        color: block.styles?.color || 'inherit',
                        fontWeight: block.styles?.fontWeight || 'normal',
                        fontStyle: block.styles?.fontStyle || 'normal',
                        textDecoration: block.styles?.textDecoration || 'none',
                        backgroundColor: block.styles?.backgroundColor || 'transparent',
                        borderRadius: '4px' // 배경색이 있을 때 보기 좋게
                    }} />
                </div>
            )}
        </div>
    );
};

export default ContentBlock;