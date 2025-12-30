import React from 'react';
import ContentBlock from './ContentBlock';
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
    selectedType?: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title' | null;

    setViewMode: (m: 'editor') => void;
    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
    onSelect: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title') => void;
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title', changes: any) => void;
    onDelete: () => void;
    onBlockImageUpload: (id: string, file: File, idx?: number) => void;
    onBackgroundClick: () => void;
}

const EditorCanvas: React.FC<Props> = ({
    title, setTitle, titleStyles, viewMode, blocks, stickers, floatingTexts, floatingImages, selectedId, selectedType,
    setViewMode, setBlocks, onSelect, onUpdate, onDelete, onBlockImageUpload, onBackgroundClick
}) => {

    // 드래그가 끝났을 때 순서를 바꾸는 함수
    const onDragEnd = (result: DropResult) => {
        // 드래그가 취소되거나 엉뚱한 곳에 떨어졌을 때
        if (!result.destination) return;

        // 순서 변경 로직
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        const newBlocks = Array.from(blocks);
        const [reorderedItem] = newBlocks.splice(sourceIndex, 1); // 뺀 놈
        newBlocks.splice(destinationIndex, 0, reorderedItem);     // 넣을 놈

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

    // 특정 블록 삭제 함수 (ContentBlock의 쓰레기통 버튼용)
    const handleDeleteBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        if (selectedId === id) onSelect('', 'block'); // 만약 선택된 상태였다면 선택 해제
    };

    // [자동 감지 로직] 부모가 selectedType을 안 줘도 여기서 직접 찾습니다.
    const getDetectedType = () => {
        if (selectedType) return selectedType; // 부모가 줬으면 그거 씀
        if (!selectedId) return null;
        if (selectedId === 'title') return 'title';
        if (blocks.some(b => b.id === selectedId)) return 'block';
        if (stickers.some(s => s.id === selectedId)) return 'sticker';
        if (floatingTexts.some(t => t.id === selectedId)) return 'floating';
        if (floatingImages.some(i => i.id === selectedId)) return 'floatingImage';
        return null;
    };

    const detectedType = getDetectedType();

    // 현재 선택된 아이템 데이터 찾기
    const getSelectedItem = () => {
        if (!selectedId || !detectedType) return null;
        if (detectedType === 'title') return { id: 'title', type: 'title', styles: titleStyles };
        if (detectedType === 'block') return blocks.find(b => b.id === selectedId);
        if (detectedType === 'sticker') return stickers.find(s => s.id === selectedId);
        if (detectedType === 'floating') return floatingTexts.find(t => t.id === selectedId); // 👈 포스트잇 찾기 추가
        if (detectedType === 'floatingImage') return floatingImages.find(i => i.id === selectedId);
        return null;
    };

    const currentItem = getSelectedItem();

    return (
        // 최상위 컨테이너 (배경 스크롤 담당)
        <div
            className="w-full h-full flex justify-center overflow-x-auto overflow-y-visible py-8"
            onClick={onBackgroundClick}
        >
            <div className="w-[800px] min-w-[800px] bg-white rounded-xl shadow-xl min-h-[1000px] relative flex flex-col transition-shadow duration-300 overflow-hidden">

                {/* 헤더 */}
                <div
                    className={`sticky top-0 bg-white/95 backdrop-blur border-b p-6 flex justify-between items-center rounded-t-xl z-20 transition-all ${viewMode === 'editor' && selectedId === 'title' ? 'ring-2 ring-indigo-200' : ''}`}
                    style={{
                        backgroundColor: titleStyles.backgroundColor || 'rgba(255, 255, 255, 0.95)',
                        borderTopLeftRadius: '0.75rem',
                        borderTopRightRadius: '0.75rem'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (viewMode === 'editor') onSelect('title', 'title');
                    }}
                >
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        readOnly={viewMode === 'read'}
                        className="w-full outline-none bg-transparent placeholder-gray-300"
                        style={{
                            ...titleStyles,
                            backgroundColor: 'transparent', // 부모가 색을 가지므로 투명
                            // 기본 스타일이 덮어씌워지지 않도록 명시
                            fontSize: titleStyles.fontSize || '30px',
                            fontWeight: titleStyles.fontWeight || 'bold',
                        }}
                    />
                    {viewMode === 'read' && <button onClick={() => setViewMode('editor')} className="ml-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold hover:bg-indigo-200 transition ">🛠️ 수정하기</button>}
                </div>

                <div className="flex-1 pl-12 py-12 pr-16 relative pb-40">

                    {/* 1. DragDropContext는 가장 바깥에 위치 */}
                    <DragDropContext onDragEnd={onDragEnd}>

                        {/* 2. Droppable 시작 */}
                        <Droppable droppableId="content-blocks-list">
                            {(provided) => (
                                <div
                                    className="space-y-4"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {/* 3. 반복문 시작 */}
                                    {blocks.map((block, index) => {
                                        const isFocused = viewMode === 'editor' && selectedId === block.id;
                                        const canSwap = block.type === 'image-left' || block.type === 'image-right';

                                        return (
                                            /* 4. Draggable 시작 */
                                            <Draggable
                                                key={block.id}
                                                draggableId={block.id}
                                                index={index}
                                                isDragDisabled={viewMode === 'read'}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            opacity: snapshot.isDragging ? 0.8 : 1,
                                                            zIndex: snapshot.isDragging ? 100 : 'auto' // 드래그 시 가려짐 방지
                                                        }}
                                                        className={`relative group transition-shadow duration-200 ${isFocused ? 'ring-2 ring-indigo-200 rounded-lg pl-2' : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); if (viewMode === 'editor') onSelect(block.id, 'block'); }}
                                                    >
                                                        <ContentBlock
                                                            block={block}
                                                            onUpdate={(id, k, v) => setBlocks(p => p.map(b => b.id === id ? { ...b, [k]: v } : b))}
                                                            onDelete={handleDeleteBlock}
                                                            onImageUpload={onBlockImageUpload}
                                                            isSelected={isFocused}
                                                            onSelect={() => onSelect(block.id, 'block')}
                                                            readOnly={viewMode === 'read'}
                                                            dragHandleProps={provided.dragHandleProps}
                                                        />

                                                        {/* 우측 메뉴 버튼들 */}
                                                        {viewMode === 'editor' && isFocused && (
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
                                            /* Draggable 끝 */
                                        );
                                    })}
                                    {/* 반복문 끝 */}

                                    {provided.placeholder} {/* 드래그 시 공간 확보용 (Droppable div 안, map 밖) */}
                                </div>
                            )}
                        </Droppable>
                        {/* Droppable 끝 */}

                    </DragDropContext>
                    {/* DragDropContext 끝 */}

                    {/* 2. 스티커 / 텍스트 / 자유 이미지 (이것들이 캔버스 밖으로 나가면 잘림) */}
                    {stickers.map(stk => (
                        <ResizableItem
                            key={stk.id}
                            {...stk}


                            isSelected={selectedId === stk.id}
                            readOnly={viewMode === 'read'}
                            onSelect={() => onSelect(stk.id, 'sticker')}
                            onUpdate={(changes) => onUpdate(stk.id, 'sticker', changes)}
                        >
                            <img src={stk.url} className="w-full h-full object-contain pointer-events-none select-none" style={{ opacity: stk.opacity }} />
                        </ResizableItem>
                    ))}

                    {floatingTexts.map(txt => (
                        <ResizableItem
                            key={txt.id}
                            {...txt}


                            isSelected={selectedId === txt.id}
                            readOnly={viewMode === 'read'}
                            onSelect={() => onSelect(txt.id, 'floating')}
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
                                readOnly={viewMode === 'read'}
                            />
                        </ResizableItem>
                    ))}

                    {floatingImages.map(img => (
                        <ResizableItem
                            key={img.id}
                            {...img}


                            isSelected={selectedId === img.id}
                            readOnly={viewMode === 'read'}
                            onSelect={() => onSelect(img.id, 'floatingImage')}
                            onUpdate={(changes) => onUpdate(img.id, 'floatingImage', changes)}
                        >
                            <img src={img.url} className="w-full h-full object-cover pointer-events-none rounded-lg select-none" style={{ opacity: img.opacity }} />
                        </ResizableItem>
                    ))}

                    {/* 하단 추가 버튼 */}
                    {viewMode === 'editor' && (
                        <div className="mt-12 py-8 border-t border-dashed border-gray-200 flex flex-col items-center gap-4 text-gray-500">
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
    );
};

export default EditorCanvas;