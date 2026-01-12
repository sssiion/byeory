import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, Suspense } from 'react';
import ContentBlock from './ContentBlock';
import { WIDGET_COMPONENT_MAP } from '../../../../components/settings/widgets/componentMap';
import ResizableItem from './ResizableItem';
import EditorToolbar from './EditorToolbar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Block, Sticker, FloatingText, FloatingImage } from '../../types';
import { Image as ImageIcon, Type, Trash2, ArrowUp, ArrowDown, LayoutTemplate, ArrowRightLeft } from 'lucide-react';

interface Props {
    title: string;
    setTitle: (v: string) => void;
    titleStyles: Record<string, any>;
    viewMode: 'editor' | 'read';
    blocks: Block[];
    stickers: Sticker[];
    floatingTexts: FloatingText[];
    floatingImages: FloatingImage[];
    selectedId: string | null;
    selectedIds?: string[]; // ✨ Multi-Select Support
    selectedType?: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title' | null;

    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
    onSelect: (id: string | null, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title' | null, isMulti?: boolean) => void; // ✨ Updated Signature
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title', changes: any) => void;
    onDelete: () => void;
    onBlockImageUpload: (id: string, file: File, idx?: number) => void;
    onBackgroundClick: () => void;
    paperStyles?: Record<string, any>;
}

const EditorCanvas = forwardRef<HTMLDivElement, Props>(({
    title, setTitle, titleStyles, viewMode, blocks, stickers, floatingTexts, floatingImages, selectedId, selectedIds = [], selectedType,
    setBlocks, onSelect, onUpdate, onDelete, onBlockImageUpload, paperStyles
}, ref) => {

    // ✨ Responsive Scaling Logic
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);

    // ✨ Drag Selection State
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);

    // ✨ Expose Content Ref
    useImperativeHandle(ref, () => contentRef.current!);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const targetWidth = 800;

                const containerWidth = containerRef.current.clientWidth;

                // If container is smaller than 800, scale down.
                if (containerWidth < targetWidth && containerWidth > 0) {
                    setScale(containerWidth / targetWidth);
                } else {
                    setScale(1);
                }
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
            // Also observe parent to trigger resize if parent flex changes
            if (containerRef.current.parentElement) {
                resizeObserver.observe(containerRef.current.parentElement);
            }
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [viewMode]);

    // ✨ Delete Key Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const activeTag = document.activeElement?.tagName.toLowerCase();
                const isInputActive = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement).isContentEditable;

                // If editing text, do not delete object
                if (isInputActive) return;

                if ((selectedIds && selectedIds.length > 0) || selectedId) {
                    onDelete();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, selectedId, onDelete]);

    // ✨ Update wrapper height to match scaled content
    useEffect(() => {
        const updateHeight = () => {
            if (contentRef.current) {
                const originalHeight = contentRef.current.offsetHeight;
                setScaledHeight(originalHeight * scale);
            }
        };

        // Run immediately
        updateHeight();

        // Observer for content height changes (blocks added/removed)
        const observer = new ResizeObserver(updateHeight);
        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        return () => observer.disconnect();
    }, [scale, blocks, stickers, floatingTexts, floatingImages]);

    // ✨ Selection Box Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (viewMode !== 'editor') return;

        const target = e.target as HTMLElement;

        if (['input', 'textarea', 'button'].includes(target.tagName.toLowerCase())) return;
        if (target.closest('button')) return;

        e.preventDefault();

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const rect = contentRef.current!.getBoundingClientRect();
        // Calculate relative position within the content area, accounting for scale
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setIsSelecting(true);
        setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });

        // Clear selection initially if not holding shift
        if (!e.shiftKey) {
            onSelect(null, null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || !selectionBox || !contentRef.current) return;

        const rect = contentRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setSelectionBox(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    };

    const handleMouseUp = () => {
        if (isSelecting && selectionBox) {
            // Calculate selection logic
            const boxLeft = Math.min(selectionBox.startX, selectionBox.currentX);
            const boxTop = Math.min(selectionBox.startY, selectionBox.currentY);
            const boxWidth = Math.abs(selectionBox.currentX - selectionBox.startX);
            const boxHeight = Math.abs(selectionBox.currentY - selectionBox.startY);
            const boxRight = boxLeft + boxWidth;
            const boxBottom = boxTop + boxHeight;

            // Threshold to distinguish click from drag
            if (boxWidth > 5 || boxHeight > 5) {
                const newSelectedIds: string[] = [];

                // Helper to check intersection
                const checkIntersection = (id: string, x: number, y: number, w: number, h: number) => {
                    // Try getting DOM element first for accurate size
                    const el = document.getElementById(id);
                    let finalX = x, finalY = y, finalW = w, finalH = h;

                    if (el && contentRef.current) {
                        const elRect = el.getBoundingClientRect();
                        const contentRect = contentRef.current.getBoundingClientRect();

                        // Calculate element position relative to the contentRef, scaled
                        finalX = (elRect.left - contentRect.left) / scale;
                        finalY = (elRect.top - contentRect.top) / scale;
                        finalW = elRect.width / scale;
                        finalH = elRect.height / scale;
                    }

                    if (boxLeft < finalX + finalW &&
                        boxRight > finalX &&
                        boxTop < finalY + finalH &&
                        boxBottom > finalY) {
                        return true;
                    }
                    return false;
                }

                // Check intersection with stickers
                stickers.forEach(stk => {
                    if (checkIntersection(stk.id, stk.x as number, stk.y as number, stk.w as number, stk.h as number)) {
                        newSelectedIds.push(stk.id);
                    }
                });

                // Also check text / images
                floatingTexts.forEach(txt => {
                    if (checkIntersection(txt.id, txt.x as number, txt.y as number, txt.w as number, txt.h as number)) {
                        newSelectedIds.push(txt.id);
                    }
                });

                floatingImages.forEach(img => {
                    if (checkIntersection(img.id, img.x as number, img.y as number, img.w as number, img.h as number)) {
                        newSelectedIds.push(img.id);
                    }
                });

                // ✨ Check blocks (standard content)
                blocks.forEach(blk => {
                    if (checkIntersection(blk.id, 0, 0, 0, 0)) { // x,y,w,h are placeholders, checkIntersection will use DOM rect
                        newSelectedIds.push(blk.id);
                    }
                });

                newSelectedIds.forEach(id => {
                    // Determine type
                    let type: any = 'sticker';
                    if (floatingTexts.some(t => t.id === id)) type = 'floating';
                    if (floatingImages.some(i => i.id === id)) type = 'floatingImage';
                    if (blocks.some(b => b.id === id)) type = 'block'; // ✨ Support blocks

                    // We use isMulti=true to append.
                    if (!selectedIds.includes(id)) {
                        onSelect(id, type, true);
                    }
                });
            }
        }
        setIsSelecting(false);
        setSelectionBox(null);
    };


    // 드래그가 끝났을 때 순서를 바꾸는 함수
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) return;
        const newBlocks = Array.from(blocks);
        const [reorderedItem] = newBlocks.splice(sourceIndex, 1);
        newBlocks.splice(destinationIndex, 0, reorderedItem);
        setBlocks(newBlocks);
    };

    const handleAddBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: `manual-${Date.now()}`,
            type, text: '', imageRotation: 0, imageFit: 'cover', styles: { imageHeight: '300px' }
        };
        setBlocks(prev => [...prev, newBlock]);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const handleSwapLayout = (id: string) => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== id) return b;
            if (b.type === 'image-left') return { ...b, type: 'image-right' };
            if (b.type === 'image-right') return { ...b, type: 'image-left' };
            return b;
        }));
    };

    const handleDeleteBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        if (selectedId === id) onSelect('', 'block');
    };

    const getDetectedType = () => {
        if (selectedType) return selectedType;
        if (!selectedId) return null;
        if (selectedId === 'title') return 'title';
        if (blocks.some(b => b.id === selectedId)) return 'block';
        if (stickers.some(s => s.id === selectedId)) return 'sticker';
        if (floatingTexts.some(t => t.id === selectedId)) return 'floating';
        if (floatingImages.some(i => i.id === selectedId)) return 'floatingImage';
        return null;
    };

    const detectedType = getDetectedType();

    const getSelectedItem = () => {
        if (!selectedId || !detectedType) return null;
        if (detectedType === 'title') return { id: 'title', type: 'title', styles: titleStyles };
        if (detectedType === 'block') return blocks.find(b => b.id === selectedId);
        if (detectedType === 'sticker') return stickers.find(s => s.id === selectedId);
        if (detectedType === 'floating') return floatingTexts.find(t => t.id === selectedId);
        if (detectedType === 'floatingImage') return floatingImages.find(i => i.id === selectedId);
        return null;
    };

    const currentItem = getSelectedItem();



    return (
        // 최상위 컨테이너 (Scale Wrapper)
        <div
            ref={containerRef}
            className={`w-full h-full flex items-start justify-center overflow-x-hidden overflow-y-auto py-4 md:py-8 px-2 md:px-0 custom-scrollbar ${viewMode === 'read' ? 'items-center' : ''}`}
            // ✨ Bind selection handlers
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Let's try inserting a spacer div */}
            <div style={{ height: scaledHeight, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: '800px',
                        minWidth: '800px'
                    }}
                >
                    <div
                        ref={contentRef}
                        className="w-[800px] min-h-[1000px] relative flex flex-col transition-shadow duration-300 overflow-hidden rounded-xl selection-zone"
                        style={{
                            backgroundColor: '#ffffff',
                            ...paperStyles
                        }}
                    >
                        {/* ✨ Selection Overlay */}
                        {isSelecting && selectionBox && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: Math.min(selectionBox.startX, selectionBox.currentX),
                                    top: Math.min(selectionBox.startY, selectionBox.currentY),
                                    width: Math.abs(selectionBox.currentX - selectionBox.startX),
                                    height: Math.abs(selectionBox.currentY - selectionBox.startY),
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    zIndex: 9999,
                                    pointerEvents: 'none'
                                }}
                            />
                        )}

                        {/* 헤더 */}
                        <div
                            className={`sticky top-0 bg-transparent border-b p-5 flex justify-between items-start gap-4 transition-all pointer-events-none ${viewMode === 'editor' && selectedId === 'title' ? '' : ''}`}
                            style={{ zIndex: titleStyles.zIndex || 20 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (viewMode === 'editor') onSelect('title', 'title');
                            }}
                        >
                            <div className="flex justify-between items-start gap-4 pointer-events-auto w-full">
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="제목을 입력하세요"
                                    readOnly={viewMode === 'read'}
                                    className="flex-1 outline-none bg-transparent placeholder-gray-300 min-w-0"
                                    style={{
                                        ...titleStyles,
                                        fontSize: titleStyles.fontSize || '30px',
                                        fontWeight: titleStyles.fontWeight || 'bold',
                                    }}
                                />
                            </div>
                        </div>

                        <div className={`flex-1 relative pb-40 ${viewMode === 'read' ? 'p-6 md:pl-12 md:py-12 md:pr-16' : 'pl-12 py-12 pr-16'}`}>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="content-blocks-list">
                                    {(provided) => (
                                        <div
                                            className="space-y-4"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {blocks.map((block, index) => {
                                                const isFocused = viewMode === 'editor' && selectedId === block.id;
                                                const canSwap = block.type === 'image-left' || block.type === 'image-right';

                                                return (
                                                    <Draggable
                                                        key={block.id}
                                                        draggableId={block.id}
                                                        index={index}
                                                        isDragDisabled={viewMode === 'read' || !!block.locked}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                id={block.id} // ✨ Added ID for selection logic
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                                    zIndex: snapshot.isDragging ? 100 : ((block as any).zIndex || 'auto')
                                                                }}
                                                                className={`relative group transition-shadow duration-200 ${isFocused ? 'ring-2 ring-indigo-200 rounded-lg pl-2' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); if (viewMode === 'editor') onSelect(block.id, 'block', e.shiftKey); }}
                                                            >
                                                                <ContentBlock
                                                                    block={block}
                                                                    onUpdate={(id, k, v) => setBlocks(p => p.map(b => b.id === id ? { ...b, [k]: v } : b))}
                                                                    onDelete={handleDeleteBlock}
                                                                    onImageUpload={onBlockImageUpload}
                                                                    isSelected={isFocused}
                                                                    onSelect={() => onSelect(block.id, 'block')}
                                                                    readOnly={viewMode === 'read' || !!block.locked}
                                                                    dragHandleProps={provided.dragHandleProps}
                                                                />

                                                                {viewMode === 'editor' && isFocused && !block.locked && (
                                                                    <div className="absolute -right-14 top-[-10px] h-full flex flex-col justify-start pt-2 gap-2 z-30">
                                                                        <div className="flex flex-col gap-1 bg-white/80 backdrop-blur rounded-lg shadow-sm p-1 border">
                                                                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} className="p-1.5 rounded hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"><ArrowUp size={16} /></button>
                                                                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} className="p-1.5 rounded hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"><ArrowDown size={16} /></button>
                                                                        </div>
                                                                        {canSwap && (
                                                                            <button onClick={(e) => { e.stopPropagation(); handleSwapLayout(block.id); }} className="p-2 bg-white border shadow-md rounded-full text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center ring-1 ring-indigo-100"><ArrowRightLeft size={18} /></button>
                                                                        )}
                                                                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 bg-white border shadow-md rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition flex items-center justify-center mt-2 ring-1 ring-red-50"><Trash2 size={18} /></button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                            {viewMode === 'editor' && (
                                <div className="mt-12 py-8 border-t border-dashed border-gray-200 flex flex-col items-center gap-4 text-gray-500 select-none"> {/* ✨ select-none */}
                                    <span className="text-sm font-medium opacity-70">어떤 내용을 추가할까요?</span>
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        <button onClick={() => handleAddBlock('paragraph')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-full transition shadow-sm"><Type size={16} /> <span>글만 쓰기</span></button>
                                        <button onClick={() => handleAddBlock('image-left')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-full transition shadow-sm"><LayoutTemplate size={16} /> <span>사진 + 글</span></button>
                                        <button onClick={() => handleAddBlock('image-full')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-full transition shadow-sm"><ImageIcon size={16} /> <span>꽉찬 사진</span></button>
                                        <button onClick={() => handleAddBlock('image-double')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-full transition shadow-sm"><div className="flex"><ImageIcon size={14} /><ImageIcon size={14} /></div> <span>사진 2장</span></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {stickers.map(stk => (
                            <ResizableItem
                                key={stk.id}
                                {...stk}
                                // ✨ Check against selectedIds
                                isSelected={selectedId === stk.id || selectedIds.includes(stk.id)}
                                readOnly={viewMode === 'read' || !!stk.locked}
                                onSelect={(isMulti) => onSelect(stk.id, 'sticker', isMulti)} // ✨ Pass shift key state from item? No, ResizableItem wraps props.
                                // ResizableItem onClick needs to be updated too?
                                onUpdate={(changes) => onUpdate(stk.id, 'sticker', changes)}
                            >
                                {stk.widgetType ? (
                                    <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />}>
                                        {(() => {
                                            const Widget = WIDGET_COMPONENT_MAP[stk.widgetType!];
                                            return Widget ? (
                                                <div className="w-full h-full overflow-hidden rounded-lg pointer-events-auto">
                                                    <Widget {...(stk.widgetProps || {})} />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-red-50 flex items-center justify-center text-red-400 text-xs">
                                                    Unknown
                                                </div>
                                            );
                                        })()}
                                    </Suspense>
                                ) : (
                                    <img src={stk.url} className="w-full h-full object-contain pointer-events-none select-none" style={{ opacity: stk.opacity }} />
                                )}
                            </ResizableItem>
                        ))}

                        {floatingTexts.map(txt => (
                            <ResizableItem
                                key={txt.id}
                                {...txt}
                                isSelected={selectedId === txt.id || selectedIds.includes(txt.id)}
                                readOnly={viewMode === 'read' || !!txt.locked}
                                onSelect={(isMulti) => onSelect(txt.id, 'floating', isMulti)}
                                onUpdate={(changes) => onUpdate(txt.id, 'floating', changes)}
                            >
                                <textarea
                                    value={txt.text}
                                    onChange={(e) => onUpdate(txt.id, 'floating', { text: e.target.value })}
                                    className="w-full h-full bg-transparent outline-none resize-none p-2 overflow-hidden"
                                    style={{
                                        fontFamily: txt.styles?.fontFamily,
                                        fontSize: txt.styles?.fontSize,
                                        fontWeight: txt.styles?.fontWeight || 'normal',
                                        textAlign: txt.styles?.textAlign as any,
                                        color: txt.styles?.color,
                                        backgroundColor: txt.styles?.backgroundColor,
                                        fontStyle: txt.styles?.fontStyle || 'normal',
                                        textDecoration: txt.styles?.textDecoration || 'none',
                                    }}
                                    readOnly={viewMode === 'read' || !!txt.locked}
                                />
                            </ResizableItem>
                        ))}

                        {floatingImages.map(img => (
                            <ResizableItem
                                key={img.id}
                                {...img}
                                isSelected={selectedId === img.id || selectedIds.includes(img.id)}
                                readOnly={viewMode === 'read' || !!img.locked}
                                onSelect={(isMulti) => onSelect(img.id, 'floatingImage', isMulti)}

                                onUpdate={(changes) => onUpdate(img.id, 'floatingImage', changes)}
                            >
                                <img src={img.url} className="w-full h-full object-cover pointer-events-none rounded-lg select-none" style={{ opacity: img.opacity }} />
                            </ResizableItem>
                        ))}

                        {/* 하단 툴바 */}
                        {viewMode === 'editor' && selectedId && currentItem && detectedType && (
                            <EditorToolbar
                                selectedId={selectedId}
                                selectedType={detectedType}
                                currentItem={currentItem}
                                onUpdate={onUpdate}
                                onDelete={detectedType === 'title' ? undefined : onDelete}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default EditorCanvas;