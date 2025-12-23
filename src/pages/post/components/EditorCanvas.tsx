import React from 'react';
import ContentBlock from '../components/ContentBlock';
import ResizableItem from '../components/ResizableItem'; // 이걸로 통일!
import type { Block, Sticker, FloatingText, FloatingImage } from '../types';

interface Props {
    title: string;
    setTitle: (v: string) => void;
    viewMode: 'editor' | 'read';
    blocks: Block[];
    stickers: Sticker[];
    floatingTexts: FloatingText[];
    floatingImages: FloatingImage[];
    selectedId: string | null;

    setViewMode: (m: 'editor') => void;
    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
    onSelect: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage') => void;
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage', changes: any) => void;
    onDelete: () => void;
    onBlockImageUpload: (id: string, file: File, idx?: number) => void;
    onBackgroundClick: () => void;
}

const EditorCanvas: React.FC<Props> = ({
                                           title, setTitle, viewMode, blocks, stickers, floatingTexts, floatingImages, selectedId,
                                           setViewMode, setBlocks, onSelect, onUpdate, onDelete, onBlockImageUpload, onBackgroundClick
                                       }) => {
    return (
        <div className="flex-1 bg-white rounded-xl shadow-xl min-h-[800px] relative overflow-hidden flex flex-col" onClick={onBackgroundClick}>

            {/* ... 헤더 부분 (기존 동일) ... */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-20 border-b p-6 flex justify-between items-center">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" readOnly={viewMode==='read'} className="w-full text-3xl font-bold outline-none bg-transparent" />
                {viewMode === 'read' && <button onClick={() => setViewMode('editor')} className="ml-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold">🛠️ 수정</button>}
            </div>

            <div className="flex-1 p-12 relative">
                {/* 1. 블록 (고정된 글/사진) */}
                <div className="space-y-2">
                    {blocks.map((block) => (
                        <div key={block.id} onClick={(e) => { e.stopPropagation(); if(viewMode==='editor') onSelect(block.id, 'block'); }}>
                            <ContentBlock
                                block={block}
                                onUpdate={(id, k, v) => setBlocks(p => p.map(b => b.id === id ? { ...b, [k]: v } : b))}
                                onDelete={onDelete}
                                onImageUpload={onBlockImageUpload}
                                onSwapLayout={(id) => setBlocks(p => p.map(b => b.id !== id ? b : { ...b, type: b.type === 'image-left' ? 'image-right' : 'image-left' }))}
                                isSelected={selectedId === block.id}
                                onSelect={() => onSelect(block.id, 'block')}
                                readOnly={viewMode === 'read'}
                            />
                        </div>
                    ))}
                </div>

                {/* 2. 스티커 (ResizableItem 사용) */}
                {stickers.map(stk => (
                    <ResizableItem
                        key={stk.id} {...stk}
                        isSelected={selectedId === stk.id}
                        readOnly={viewMode === 'read'}
                        onSelect={() => onSelect(stk.id, 'sticker')}
                        onUpdate={(changes) => onUpdate(stk.id, 'sticker', changes)}
                    >
                        <img src={stk.url} className="w-full h-full object-contain pointer-events-none select-none" style={{ opacity: stk.opacity }} alt="stk" />
                    </ResizableItem>
                ))}

                {/* 3. 떠다니는 텍스트 (ResizableItem 사용) */}
                {floatingTexts.map(txt => (
                    <ResizableItem
                        key={txt.id} {...txt}
                        isSelected={selectedId === txt.id}
                        readOnly={viewMode === 'read'}
                        onSelect={() => onSelect(txt.id, 'floating')}
                        onUpdate={(changes) => onUpdate(txt.id, 'floating', changes)}
                    >
                        <textarea
                            value={txt.text}
                            onChange={(e) => onUpdate(txt.id, 'floating', { text: e.target.value })}
                            className="w-full h-full bg-transparent outline-none resize-none p-2 overflow-hidden font-serif"
                            style={{ ...txt.styles, backgroundColor: txt.styles.backgroundColor }}
                            readOnly={viewMode === 'read'}
                        />
                    </ResizableItem>
                ))}

                {/* 4. 자유 사진 (ResizableItem 사용) */}
                {floatingImages.map(img => (
                    <ResizableItem
                        key={img.id} {...img}
                        isSelected={selectedId === img.id}
                        readOnly={viewMode === 'read'}
                        onSelect={() => onSelect(img.id, 'floatingImage')}
                        onUpdate={(changes) => onUpdate(img.id, 'floatingImage', changes)}
                    >
                        <img src={img.url} className="w-full h-full object-cover pointer-events-none select-none rounded-lg shadow-sm" style={{ opacity: img.opacity }} alt="img" />
                    </ResizableItem>
                ))}

                {/* 에디터용 추가 버튼들 (기존 동일) */}
                {viewMode === 'editor' && <div className="mt-10 py-8 border-t border-dashed flex justify-center gap-3 opacity-50 hover:opacity-100 transition"><button onClick={() => setBlocks([...blocks, { id: `m-${Date.now()}`, type: 'paragraph', text: '' }])} className="px-3 py-1 bg-gray-100 rounded text-sm">+ 글상자</button></div>}
            </div>
        </div>
    );
};

export default EditorCanvas;