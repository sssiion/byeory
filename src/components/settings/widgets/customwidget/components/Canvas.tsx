import React, { useState } from 'react';
import { Smartphone, GripVertical, Trash2 } from 'lucide-react';
import type { WidgetBlock, WidgetSize, ContainerLocation } from '../types';
import {
    DndContext,
    PointerSensor,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent, // 추가
    useSensor,
    useSensors,
    pointerWithin,
    useDroppable, // 추가
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable // 추가
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOverlay } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

// BlockRenderer 임포트 (경로 확인 필요)
import BlockRenderer from './BlockRenderer';

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
    onDragEnd: (event: DragEndEvent) => void;
    onDragOver: (event: DragOverEvent) => void; // 🆕 추가
}

// 🆕 내부 컴포넌트로 SortableBlockItem 구현 (파일이 분리되어 있지 않으므로)
const SortableBlockItem: React.FC<{
    block: WidgetBlock;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
    onUpdateBlock: (id: string) => void;
}> = (props) => {
    const { block, selectedBlockId, onSelectBlock, onRemoveBlock } = props;

    // ROOT 컨테이너에 속해있다고 가정
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: block.id,
        data: {
            containerId: 'ROOT', // 최상위 블록들은 ROOT 컨테이너
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onSelectBlock(block.id);
            }}
            className={`
                relative group rounded border bg-white p-2 flex gap-2 transition-none w-full
                ${selectedBlockId === block.id ? 'border-indigo-500 ring-1 ring-indigo-200' : 'border-gray-200'}
                ${isDragging ? 'z-50' : 'z-auto'}
            `}
            {...attributes}
        >
            {/* 드래그 핸들 */}
            <div
                {...listeners}
                className="drag-handle text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing pt-1 flex-shrink-0"
            >
                <GripVertical size={16} />
            </div>

            {/* 실제 블록 콘텐츠 */}
            <div className="flex-1 min-w-0">
                <BlockRenderer {...props} />
            </div>

            {/* 삭제 버튼 */}
            {selectedBlockId === block.id && !isDragging && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBlock(block.id);
                    }}
                    className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:scale-110 z-20"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </div>
    );
};

const Canvas: React.FC<Props> = ({
                                     blocks,
                                     currentSize,
                                     selectedBlockId,
                                     onSelectBlock,
                                     onRemoveBlock,
                                     usedCapacity,
                                     maxCapacity,
                                     activeContainer,
                                     onSetActiveContainer,
                                     onDragEnd,
                                     onDragOver, // 🆕 Prop으로 받음
                                 }) => {
    const usagePercent = Math.min(100, (usedCapacity / maxCapacity) * 100);
    const isFull = usagePercent >= 100;

    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 3 },
        }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEndLocal = (event: DragEndEvent) => {
        setActiveId(null);
        onDragEnd(event);
    };

    // 🆕 Root Droppable 영역 설정
    const { setNodeRef } = useDroppable({
        id: 'ROOT',
        data: { containerId: 'ROOT', isContainer: true }
    });

    return (
        <main className="flex-1 bg-[#1F1F1F] relative flex items-center justify-start pt-20 p-8 overflow-auto flex-col gap-6">
            <div className="bg-[#2a2a2a] px-4 py-2 rounded-full flex items-center gap-3 shadow-lg border border-gray-700 sticky top-0 z-20">
                <span className="text-xs font-bold text-gray-400">Storage</span>
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden relative">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${usagePercent}%` }} />
                </div>
                <span className={`text-xs font-mono ${isFull ? 'text-red-400' : 'text-gray-300'}`}>
                    {usedCapacity}/{maxCapacity}
                </span>
            </div>

            <div className="relative">
                <div
                    className="bg-white rounded-[2rem] shadow-2xl overflow-hidden relative transition-all duration-300 flex flex-col ring-8 ring-[#111]"
                    style={{ width: currentSize.w, height: currentSize.h, padding: '20px', gap: '10px' }}
                    onClick={() => {
                        onSelectBlock(null);
                        onSetActiveContainer(null);
                    }}
                >
                    <DndContext
                        sensors={sensors}
                        collisionDetection={pointerWithin} // 필요시 closestCorners 등으로 변경
                        onDragStart={handleDragStart}
                        onDragOver={onDragOver} // 🆕 부모에서 받은 핸들러 연결
                        onDragEnd={handleDragEndLocal}
                    >
                        {blocks.length === 0 ? (
                            <div ref={setNodeRef} className="flex-1 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 m-2">
                                <Smartphone size={32} className="mb-2 opacity-50" />
                                <span className="text-sm font-medium">기능을 추가하세요</span>
                            </div>
                        ) : (
                            <div ref={setNodeRef} className="flex flex-col gap-2 h-full min-h-[100px]">
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
                                        />
                                    ))}
                                </SortableContext>
                            </div>
                        )}

                        <DragOverlay modifiers={[snapCenterToCursor]}>
                            {activeId ? (
                                <DragPreview block={blocks.find((b) => b.id === activeId) ||
                                    // 중첩된 블록 찾기 로직이 필요할 수 있음 (간소화를 위해 1뎁스만 체크하거나 재귀 탐색 필요)
                                    blocks.find(b => b.id === activeId)!
                                } />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>

                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-gray-500 text-xs font-mono bg-[#2a2a2a] px-3 py-1 rounded-full border border-gray-700">
                    {currentSize.w} x {currentSize.h} px
                </div>
            </div>
        </main>
    );
};

const DragPreview: React.FC<{ block: WidgetBlock }> = ({ block }) => {
    if (!block) return null;
    return (
        <div className="w-[50px] h-[50px] rounded-xl bg-indigo-600 text-white shadow-2xl
                       flex items-center justify-center opacity-90 cursor-grabbing ring-2 ring-white"
        >
            <GripVertical size={16} className="text-indigo-600" />
            <span className="text-xs text-slate-700 truncate font-bold">
                {block.type}
            </span>
        </div>
    );
};

export default Canvas;