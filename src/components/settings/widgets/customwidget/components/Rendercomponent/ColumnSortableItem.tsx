import React from "react";
import type { WidgetBlock, ContainerLocation } from "../../types.ts"; // types 경로 확인 필요
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import BlockRenderer from "../BlockRenderer.tsx";


// 1️⃣ 여기서 받을 Props의 타입을 정의합니다.
interface ColumnSortableItemProps {
    child: WidgetBlock;
    columnContainerId: string;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    // BlockRenderer가 추가로 필요로 하는 props가 있다면 여기에 추가 (예: activeContainer 등)
    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
    onUpdateBlock: (id: string, updates: any) => void;
}

const ColumnSortableItem: React.FC<ColumnSortableItemProps> = ({

    child,
    columnContainerId,
    selectedBlockId,
    onSelectBlock,
    onRemoveBlock,
    activeContainer,
    onSetActiveContainer,
    onUpdateBlock
}) => {
    // 2️⃣ useSortable 훅 사용
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: child.id,
        data: {
            containerId: columnContainerId, // 🔥 이 컬럼 컨테이너 ID
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 9999 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onSelectBlock(child.id);
            }}
            className={`
                relative group rounded border flex transition-none w-full
                ${selectedBlockId === child.id
                    ? 'bg-black/5 ring-1 ring-gray-400 border-transparent'
                    : 'border-transparent hover:border-gray-200 hover:bg-black/5'
                }
                ${isDragging ? 'bg-indigo-50 border-dashed' : ''}
            `}
            {...attributes}
        >
            {/* 드래그 핸들 */}
            <div
                {...listeners}
                className="drag-handle text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing pt-1 flex-shrink-0"
            >
                <GripVertical size={12} />
            </div>

            {/* 실제 콘텐츠 렌더링 */}
            <div className="flex-1 min-w-0">
                {/* 3️⃣ BlockRenderer에 필요한 props를 명시적으로 전달합니다 */}
                <BlockRenderer
                    block={child}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={onSelectBlock}
                    onRemoveBlock={onRemoveBlock}
                    activeContainer={activeContainer}
                    onSetActiveContainer={onSetActiveContainer}
                    onUpdateBlock={onUpdateBlock}
                />
            </div>

            {/* 삭제 버튼 */}
            {selectedBlockId === child.id && !isDragging && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBlock(child.id);
                    }}
                    className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:scale-110 z-20 group-has-[.drag-handle:hover]:hidden"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </div>
    );
};

export default ColumnSortableItem;