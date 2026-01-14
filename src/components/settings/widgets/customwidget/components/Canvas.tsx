import React, { useState } from 'react';
import { Smartphone, GripVertical } from 'lucide-react';
import type { WidgetBlock, WidgetSize, ContainerLocation } from '../types';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    pointerWithin,
    useDroppable,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

// 저장해두신 SortableBlockItem 임포트
import SortableBlockItem from './Rendercomponent/SortableBlockItem';
import BlockRenderer from './BlockRenderer';

interface Props {
    blocks: WidgetBlock[];
    currentSize: WidgetSize;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;

    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
    onUpdateBlock: (id: string, updates: any) => void; // ✅ 캔버스 직접 수정을 위해 필수
    onDragEnd: (event: DragEndEvent) => void;
    onDragOver: (event: DragOverEvent) => void;
}

const Canvas: React.FC<Props> = (props) => {
    const {
        blocks,
        currentSize,
        selectedBlockId,
        onSelectBlock,
        onRemoveBlock,
        activeContainer,
        onSetActiveContainer,
        onUpdateBlock,
        onDragEnd,
        onDragOver,
    } = props; // Destructure props here to use in helper

    const [activeId, setActiveId] = useState<string | null>(null);

    // 🌟 Helper to find active block for DragOverlay
    const findBlock = (id: string, items: WidgetBlock[]): WidgetBlock | undefined => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.type === 'columns' && item.content.layout) {
                for (const col of item.content.layout) {
                    const found = findBlock(id, col);
                    if (found) return found;
                }
            }
            // custom-block children check (if needed)
            if (item.type === 'custom-block' && item.content.children) {
                const found = findBlock(id, item.content.children);
                if (found) return found;
            }
        }
        return undefined;
    };

    const activeBlock = activeId ? findBlock(activeId, blocks) : null;

    // Calculate preview dimensions
    const getPreviewStyle = () => {
        if (!activeBlock) return {};
        const layout = activeBlock.layout || { w: '100%', h: 'auto' };

        let width = '200px'; // fallback
        if (typeof layout.w === 'string' && layout.w.endsWith('%')) {
            const percent = parseFloat(layout.w);
            width = `${(currentSize.w * percent) / 100}px`;
        } else if (typeof layout.w === 'number') {
            width = `${layout.w}px`;
        } else {
            width = layout.w as string;
        }

        let height = '100px';
        // h가 auto면 대략적인 높이 설정, px이면 그대로 사용
        if (layout.h === 'auto') height = '150px';
        else if (typeof layout.h === 'string' && layout.h.endsWith('%')) {
            const percent = parseFloat(layout.h);
            height = `${(currentSize.h * percent) / 100}px`;
        } else {
            height = layout.h as string;
        }

        return { width, height };
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const { setNodeRef } = useDroppable({
        id: 'ROOT',
        data: { containerId: 'ROOT', isContainer: true },
    });

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEndLocal = (event: DragEndEvent) => {
        setActiveId(null);
        onDragEnd(event);
    };

    return (
        <main className="flex-1 bg-[var(--bg-primary)] relative flex flex-col items-center pt-12 p-4 overflow-auto gap-1">
            <div className="relative group/canvas w-full max-w-full flex justify-center flex-1 ">
                <div
                    id="canvas-boundary"
                    className="bg-[var(--bg-card)] rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative transition-all duration-500 flex flex-col ring-[12px] ring-gray-900 border border-[var(--border-color)]"
                    style={{
                        width: `${currentSize.w}px`,
                        height: `${currentSize.h}px`,
                        maxWidth: '100%',
                        padding: '0px',
                    }}
                    onClick={() => {
                        onSelectBlock(null);
                        onSetActiveContainer(null);
                    }}
                >
                    <DndContext
                        sensors={sensors}
                        collisionDetection={pointerWithin}
                        onDragStart={handleDragStart}
                        onDragOver={onDragOver}
                        onDragEnd={handleDragEndLocal}
                    >
                        <div ref={setNodeRef} className="flex-1 flex flex-col gap-0 min-h-full">
                            {blocks.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-card-secondary)]/50 transition-colors group-hover/canvas:bg-[var(--bg-card-secondary)]">
                                    <Smartphone size={40} className="mb-3 opacity-20" />
                                    <p className="text-sm font-semibold opacity-40 max-md:hidden">좌측에서 기능 선택</p>
                                    <p className="text-sm font-semibold opacity-40 md:hidden">아래에서 기능 선택</p>
                                </div>
                            ) : (
                                <SortableContext
                                    items={blocks.map((b) => b.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {blocks.map((block) => (
                                        <SortableBlockItem
                                            key={block.id}
                                            block={block}
                                            selectedBlockId={selectedBlockId}
                                            onSelectBlock={onSelectBlock}
                                            onRemoveBlock={onRemoveBlock}
                                            activeContainer={activeContainer}
                                            onSetActiveContainer={onSetActiveContainer}
                                            onUpdateBlock={onUpdateBlock}
                                        />
                                    ))}
                                </SortableContext>
                            )}
                        </div>

                        {/* 🌟 드래그 오버레이: 실제 블록 모양 렌더링 */}
                        <DragOverlay modifiers={[snapCenterToCursor]} zIndex={1000} dropAnimation={null}>
                            {activeBlock ? (
                                <div
                                    className="rounded-lg shadow-2xl opacity-90 overflow-hidden bg-white ring-2 ring-indigo-500 ring-offset-2"
                                    style={getPreviewStyle()}
                                >
                                    <BlockRenderer
                                        block={activeBlock}
                                        selectedBlockId={null}
                                        onSelectBlock={() => { }}
                                        onRemoveBlock={() => { }}
                                        activeContainer={null}
                                        onSetActiveContainer={() => { }}
                                        onUpdateBlock={() => { }}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>


                {/* 하단 사이즈 표시 바닥 정보 */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-card-secondary)] px-4 py-1.5 rounded-full border border-[var(--border-color)] opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                    <span>WIDTH {currentSize.w}px</span>
                    <span className="text-[var(--text-secondary)]">|</span>
                    <span>HEIGHT {currentSize.h}px</span>
                </div>
            </div>
        </main>
    );
};

export default Canvas;
