import React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

export interface BreadcrumbItem {
    id?: string | null; // ✨ Added ID for DnD support
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
}

interface Props {
    items: BreadcrumbItem[];
}

const DroppableBreadcrumbItem: React.FC<{ item: BreadcrumbItem; isLast: boolean; index: number }> = ({ item, isLast, index }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: item.id !== undefined ? `breadcrumb-${item.id}` : `breadcrumb-disabled-${index}`,
        disabled: item.id === undefined || item.id === null || isLast,
        data: { type: 'BREADCRUMB', albumId: item.id }
    });

    const Icon = item.icon;

    const activeStyle = isOver ? 'bg-indigo-50 text-indigo-600 scale-105 border-indigo-200 shadow-sm' : '';

    return (
        <div ref={setNodeRef} className={`flex items-center gap-1 transition-all duration-200 rounded-lg px-2 -mx-1 border border-transparent ${activeStyle}`}>
            {item.onClick && !isLast ? (
                <button
                    onClick={item.onClick}
                    className="flex items-center gap-1 hover:text-[var(--text-primary)] hover:underline transition-colors py-0.5"
                >
                    {Icon && <Icon size={14} />}
                    <span className="truncate max-w-[150px]">{item.label}</span>
                </button>
            ) : (
                <div className={`flex items-center gap-1 font-semibold py-0.5 ${isLast ? 'text-[var(--text-primary)]' : ''}`}>
                    {Icon && <Icon size={14} className={isLast ? "text-indigo-500" : ""} />}
                    <span className="truncate max-w-[200px]">{item.label}</span>
                </div>
            )}
        </div>
    );
};

const PostBreadcrumb: React.FC<Props> = ({ items }) => {
    return (
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <ChevronRight size={14} className="text-[var(--text-tertiary)]" />}
                    <DroppableBreadcrumbItem item={item} isLast={index === items.length - 1} index={index} />
                </React.Fragment>
            ))}
        </div>
    );
};

export default PostBreadcrumb;
