import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { MoreVertical, Maximize2 } from 'lucide-react';
import { type WidgetInstance, WIDGET_REGISTRY } from './Registry';

interface DraggableWidgetProps {
    widget: WidgetInstance;
    index: number;
    isEditMode: boolean;
    moveWidget: (dragIndex: number, hoverIndex: number) => void;
    removeWidget: (id: string) => void;
    updateLayout: (id: string, cols: number, rows: number) => void;
}

const ItemTypes = {
    WIDGET: 'widget',
};

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
    widget,
    index,
    isEditMode,
    moveWidget,
    removeWidget,
    updateLayout
}) => {
    const ref = useRef<HTMLDivElement>(null);

    // Drag and Drop Logic
    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.WIDGET,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: any, monitor) {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) return;

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            // Time to actually perform the action
            moveWidget(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.WIDGET,
        item: () => {
            return { id: widget.id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: isEditMode, // Only draggable in edit mode
    });

    // Initialize drag and drop refs
    if (isEditMode) {
        drag(drop(ref));
    }

    const registryItem = WIDGET_REGISTRY[widget.type];
    if (!registryItem) return null;

    const WidgetComponent = registryItem.component;
    const opacity = isDragging ? 0.4 : 1;

    // Grid styling based on widget layout settings
    const getGridClass = () => {
        const { cols, rows } = widget.layout;

        // Using style object for exact grid span control if needed, 
        // but Tailwind classes are cleaner if we stick to a 12-column or fixed grid.
        // Based on user request: 1x1, 1x2, etc.
        // Assuming standard unit is approx 180px height + gap.

        // We'll map cols/rows to tailwind span classes roughly.
        // Cols: span-1 (mobile) / span-X (desktop)
        // Rows: row-span-X

        // We implement responsive logic: 
        // Mobile: always col-span-1, row can vary.
        // Desktop: col-span-{cols}, row-span-{rows}

        let colClass = 'col-span-1';
        if (cols === 2) colClass = 'md:col-span-2';
        if (cols === 3) colClass = 'md:col-span-3';
        if (cols === 4) colClass = 'md:col-span-4'; // Max width

        let rowClass = 'row-span-1';
        if (rows === 2) rowClass = 'row-span-2';
        if (rows === 3) rowClass = 'row-span-3';

        return `${colClass} ${rowClass}`;
    };

    const [showSizeMenu, setShowSizeMenu] = React.useState(false);

    return (
        <div
            ref={ref}
            className={`relative group h-full ${getGridClass()}`}
            style={{ opacity, minHeight: '180px' }}
            data-handler-id={handlerId}
        >
            {/* Widget Content */}
            <div className="w-full h-full transition-transform">
                <WidgetComponent {...(widget.props || {})} />
            </div>

            {/* Edit Overlay */}
            {isEditMode && (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-[var(--btn-bg)] z-20 gap-2">

                    {/* Drag Handle Indicator */}
                    <div className="absolute top-2 left-2 p-1 bg-white/90 rounded text-[var(--icon-color)] cursor-move">
                        <MoreVertical size={16} />
                    </div>

                    {/* Size Control */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSizeMenu(!showSizeMenu)}
                            className="bg-[var(--bg-card)] text-[var(--text-primary)] px-3 py-1.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-1 hover:bg-[var(--bg-card-secondary)]"
                        >
                            <Maximize2 size={12} /> Size
                        </button>

                        {showSizeMenu && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 w-32 grid grid-cols-2 gap-1 animate-in zoom-in duration-200">
                                {[
                                    [1, 1], [2, 1], [3, 1],
                                    [1, 2], [2, 2], [3, 2],
                                    [1, 3], [2, 3], [3, 3]
                                ].map(([c, r]) => (
                                    <button
                                        key={`${c}x${r}`}
                                        onClick={() => { updateLayout(widget.id, c, r); setShowSizeMenu(false); }}
                                        className={`text-[10px] p-1 rounded hover:bg-gray-100 border ${widget.layout.cols === c && widget.layout.rows === r ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-100 text-gray-600'}`}
                                    >
                                        {c}x{r}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Remove Button */}
                    <button
                        onClick={() => removeWidget(widget.id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-bold hover:bg-red-600 hover:scale-105 transition-transform"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
};
