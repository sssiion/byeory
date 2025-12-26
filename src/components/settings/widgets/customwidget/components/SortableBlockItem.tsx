// ✅ dnd-kit 용 SortableBlockItem.tsx

import React from 'react';
import type {ContainerLocation, WidgetBlock} from '../types';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {GripVertical, Trash2} from 'lucide-react';
import BlockRenderer from './BlockRenderer';

interface SortableBlockItemProps {
    block: WidgetBlock;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = (props) => {
    const {block, selectedBlockId, onSelectBlock, onRemoveBlock, activeContainer, onSetActiveContainer} = props;

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
            // 루트 리스트에 있는 블록
            containerId: 'ROOT',
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 9999 : 'auto',
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
        relative group rounded-lg transition-all border-2 cursor-pointer flex items-stretch bg-white
        ${
                selectedBlockId === block.id
                    ? 'border-indigo-500 bg-indigo-50/10 ring-2 ring-indigo-200'
                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
            }
      `}
            {...attributes}
        >
            <div
                {...listeners}
                className="flex items-center justify-center px-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600"
            >
                <GripVertical size={16} />
            </div>

            <div className="flex-1 min-w-0 py-2 pr-2">
                <BlockRenderer
                    block={block}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={onSelectBlock}
                    onRemoveBlock={onRemoveBlock}
                    activeContainer={activeContainer}
                    onSetActiveContainer={onSetActiveContainer}
                />
            </div>

            {selectedBlockId === block.id && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBlock(block.id);
                    }}
                    className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 z-10"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </div>
    );
};

export default SortableBlockItem;
