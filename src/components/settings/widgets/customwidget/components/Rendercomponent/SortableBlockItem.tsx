import React, { useEffect, useState } from 'react';
import type { ContainerLocation, WidgetBlock } from '../../types.ts';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import BlockRenderer from '../BlockRenderer.tsx';
import { Resizable } from 're-resizable';

interface SortableBlockItemProps {
    block: WidgetBlock;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
    onUpdateBlock: (id: string, updates: any) => void;
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = (props) => {
    const { block, selectedBlockId, onSelectBlock, onRemoveBlock, activeContainer, onSetActiveContainer, onUpdateBlock } = props;

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
            containerId: 'ROOT',
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 9999 : 'auto',
    };
    const isSelected = selectedBlockId === block.id;

    // 🌟 layout 정보 가져오기 (없으면 기본값)
    // height가 'auto'이면 초기 렌더링 시 내용물에 맞춰지지만, 리사이징 시에는 픽셀로 변환됨
    const layout = block.layout || { w: '100%', h: 'auto' };
    const [boundaryElement, setBoundaryElement] = useState<HTMLElement | null>(null);
    useEffect(() => {
        // Canvas.tsx에서 설정한 ID로 요소를 찾습니다.
        const canvasEl = document.getElementById('canvas-boundary');
        if (canvasEl) {
            setBoundaryElement(canvasEl);
        }
    }, []);
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="outline-none relative mb-2" // mb-2: 블록 간 간격 확보
        >
            {/* 🔥 핵심 수정 사항 🔥
               1. maxHeight="100%" 제거: 높이를 자유롭게 늘릴 수 있게 함
               2. minHeight를 고정값(예: 50)으로 변경: 내용물이 많아도 작게 줄일 수 있게 함 (스크롤/숨김 처리됨)
               3. useLayoutEffect 제거: 불필요한 높이 재계산 로직 삭제하여 성능 향상 및 버그 방지
            */}
            <Resizable
                // bounds="parent" // ⚠️ bounds를 제거하거나 주석 처리해야 캔버스를 넘어서도 리사이징이 자연스러울 때가 있음 (필요시 복구)
                className="relative"
                // 가로는 100%를 넘지 않게 막지만, 세로는 제한을 풉니다.
                maxWidth="100%"
                bounds={boundaryElement || undefined}
                // 최소 크기 제한 (너무 작아져서 핸들이 사라지는 것 방지)
                minWidth={100}
                minHeight={50}

                size={{
                    width: layout.w,
                    height: layout.h, // 여기서 'auto'여도 re-resizable이 초기엔 알아서 처리, 드래그하면 픽셀로 변경됨
                }}

                // 리사이징 종료 시 layout 데이터 업데이트
                onResizeStop={(e, direction, ref, d) => {
                    onUpdateBlock(block.id, {
                        layout: {
                            w: ref.style.width,
                            h: ref.style.height,
                        }
                    });
                }}
                // 선택되었을 때만 핸들 활성화
                enable={{
                    top: false,
                    right: isSelected,
                    bottom: isSelected,
                    left: false,
                    topRight: false,
                    bottomRight: isSelected,
                    bottomLeft: false,
                    topLeft: false,
                }}
                // 핸들 스타일
                handleStyles={{
                    bottomRight: {
                        bottom: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#6366f1', // Indigo-500
                        borderRadius: '50%',
                        cursor: 'nwse-resize',
                        zIndex: 50,
                    },
                    right: { width: '10px', right: -5, cursor: 'col-resize' },
                    bottom: { height: '10px', bottom: -5, cursor: 'row-resize' }
                }}
            >
                {/* 카드 div */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectBlock(block.id);
                    }}
                    className={`
                        relative group rounded-lg transition-all border-2 flex items-stretch h-full overflow-hidden
                        ${isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                            : 'border-transparent hover:border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)] bg-transparent'
                        }
                    `}
                >
                    {/* 드래그 핸들 (Grip) */}
                    <div
                        {...listeners}
                        className="flex items-center justify-center px-2 cursor-grab active:cursor-grabbing text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0"
                    >
                        <GripVertical size={16} />
                    </div>

                    {/* 컨텐츠 영역 (BlockRenderer) */}
                    {/* min-w-0와 h-full을 주어 부모 크기 변화에 따라 컨텐츠도 같이 변하게 함 */}
                    <div className="flex-1 min-w-0 h-full ">
                        <BlockRenderer
                            block={block}
                            selectedBlockId={selectedBlockId}
                            onSelectBlock={onSelectBlock}
                            onRemoveBlock={onRemoveBlock}
                            activeContainer={activeContainer}
                            onSetActiveContainer={onSetActiveContainer}
                            onUpdateBlock={onUpdateBlock}
                        />
                    </div>
                </div>
                {/* 삭제 버튼 */}
                {isSelected && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveBlock(block.id);
                        }}
                        className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 z-50"
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </Resizable>
        </div>
    );
};

export default SortableBlockItem;