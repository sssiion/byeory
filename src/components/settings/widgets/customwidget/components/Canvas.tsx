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

interface Props {
    blocks: WidgetBlock[];
    currentSize: WidgetSize;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    usedCapacity: number;
    maxCapacity: number;
    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
    onUpdateBlock: (id: string, updates: any) => void;
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
        usedCapacity,
        maxCapacity,
        activeContainer,
        onSetActiveContainer,
        onUpdateBlock,
        onDragEnd,
        onDragOver,
    } = props;

    const [activeId, setActiveId] = useState<string | null>(null);

    const usagePercent = Math.min(100, (usedCapacity / maxCapacity) * 100);
    const isFull = usagePercent >= 100;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }, // 마우스 미세 움직임에 드래그 방지
        })
    );

    // ROOT 영역을 드롭 가능한 컨테이너로 설정
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
        <main className="flex-1 bg-[var(--bg-primary)] relative flex flex-col items-center pt-16 p-8 overflow-auto gap-8">
            {/* 상단 스토리지 게이지 */}
            <div className="bg-[var(--bg-card-secondary)] px-5 py-2.5 rounded-full flex items-center gap-4 shadow-xl border border-[var(--border-color)] sticky top-0 z-30">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Storage</span>
                <div className="w-40 h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isFull ? 'bg-red-500' : 'bg-indigo-500'
                            }`}
                        style={{ width: `${usagePercent}%` }}
                    />
                </div>
                <span className={`text-xs font-mono font-bold ${isFull ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                    {usedCapacity} / {maxCapacity}
                </span>
            </div>

            {/* 메인 캔버스 영역 */}
            <div className="relative group/canvas">
                <div
                    id="canvas-boundary"
                    className=" bg-[var(--bg-card)] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative transition-all duration-500 flex flex-col ring-[12px] ring-gray-900 border border-[var(--border-color)]"
                    style={{ width: currentSize.w, height: currentSize.h, padding: '24px' }}
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
                        <div ref={setNodeRef} className="flex-1 flex flex-col min-h-full">
                            {blocks.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)] rounded-[1.5rem] bg-[var(--bg-card-secondary)]/50 transition-colors group-hover/canvas:bg-[var(--bg-card-secondary)]">
                                    <Smartphone size={40} className="mb-3 opacity-20" />
                                    <p className="text-sm font-semibold opacity-40">좌측에서 기능을 클릭하세요.</p>
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
                                            onUpdateBlock={onUpdateBlock} // ✅ 중요: 마우스 직접 수정을 위해 전달
                                        />
                                    ))}
                                </SortableContext>
                            )}
                        </div>

                        {/* 드래그 시 보여지는 그림자 효과 */}
                        <DragOverlay modifiers={[snapCenterToCursor]} zIndex={1000}>
                            {activeId ? (
                                <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center text-white rotate-6 scale-110 opacity-90 border-2 border-white">
                                    <GripVertical size={24} />
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
