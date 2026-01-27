import React from "react";
import type { WidgetBlock } from "../../types.ts"; // types 경로 확인 필요
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import BlockRenderer from "../BlockRenderer.tsx";


// 1️⃣ 여기서 받을 Props의 타입을 정의합니다.
interface ColumnSortableItemProps {
    child: WidgetBlock;
    columnContainerId: string;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    // BlockRenderer가 추가로 필요로 하는 props가 있다면 여기에 추가 (예: activeContainer 등)
    // activeContainer, onSetActiveContainer removed as unused in BlockRenderer
    onUpdateBlock: (id: string, updates: any) => void;
}

const ColumnSortableItem: React.FC<ColumnSortableItemProps> = ({

    child,
    columnContainerId,
    selectedBlockId,
    onSelectBlock,
    onRemoveBlock,

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
        opacity: isDragging ? 0.4 : 1, // 드래그 시 반투명
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
                relative group rounded border bg-white flex flex-col transition-none w-full overflow-hidden
                ${selectedBlockId === child.id
                    ? 'border-indigo-500 ring-1 ring-indigo-200'
                    : 'border-gray-200'
                }
                ${isDragging ? 'bg-indigo-50 border-dashed' : ''}
            `}
            {...attributes}
        >
            {/* 드래그 핸들 (Top Overlay) - Invisible but functional */}
            <div
                {...listeners}
                className={`
                    absolute top-0 left-0 w-full h-3 z-20 cursor-grab active:cursor-grabbing flex justify-center items-start
                    transition-opacity duration-200
                    ${isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 bg-transparent'}
                `}
            >
                <div className="w-6 h-1 bg-transparent rounded-full mt-1" />
            </div>

            {/* 실제 콘텐츠 렌더링 */}
            <div className="flex-1 min-w-0 w-full pt-2"> {/* pt-2로 핸들 영역 확보 */}
                <BlockRenderer
                    block={child}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={onSelectBlock}
                    onRemoveBlock={onRemoveBlock}
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
                    className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:scale-110 z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </div>
    );
};

export default ColumnSortableItem;