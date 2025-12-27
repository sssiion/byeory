import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { type WidgetInstance, WIDGET_REGISTRY } from './Registry';

interface DraggableWidgetProps {
    widget: WidgetInstance;
    isEditMode: boolean;
    removeWidget: (id: string) => void;
    updateLayout: (id: string, layout: Partial<WidgetInstance['layout']>) => void;
    onDragEnd?: () => void;
    onHover: (x: number, y: number, item: any) => void;
    onDrop: (x: number, y: number, item: any) => void;
}

const ItemTypes = {
    WIDGET: 'widget',
};

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
    widget,
    isEditMode,
    removeWidget,
    updateLayout,
    onDragEnd,
    onHover,
    onDrop
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [showSizeMenu, setShowSizeMenu] = useState(false);

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.WIDGET,
        item: () => {
            return { id: widget.id, type: widget.type, layout: widget.layout, props: widget.props };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            if (onDragEnd) onDragEnd();
        },
        canDrag: isEditMode,
    });

    const [, drop] = useDrop({
        accept: ItemTypes.WIDGET,
        hover: (item: any) => {
            if (isEditMode && onHover) {
                onHover(widget.layout.x, widget.layout.y, item);
            }
        },
        drop: (item: any) => {
            if (isEditMode && onDrop) {
                onDrop(widget.layout.x, widget.layout.y, item);
            }
        },
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    if (isEditMode) {
        drag(drop(ref));
    }

    const registryItem = WIDGET_REGISTRY[widget.type];
    if (!registryItem) return null;

    const WidgetComponent = registryItem.component;
    const { x, y, w, h } = widget.layout;
    const isTransparent = widget.type === 'transparent';

    return (
        <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            ref={ref}
            className={`global-physics-widget relative group rounded-2xl transition-colors duration-200 overflow-hidden 
                ${isTransparent
                    ? (isEditMode ? 'bg-white/10 border-2 border-dashed border-white/30' : '')
                    : 'bg-white shadow-sm hover:shadow-md'} 
                ${isEditMode ? 'cursor-move ring-2 ring-[var(--btn-bg)] ring-offset-2' : ''}
                ${isDragging ? 'pointer-events-none' : ''}`}
            style={{
                gridColumn: `${x} / span ${w}`,
                gridRow: `${y} / span ${h}`,
                opacity: isDragging ? 0 : 1, // Hide original when dragging
                zIndex: isDragging ? 50 : 1,
            }}
        >
            {/* Widget Content */}
            <div className={`w-full h-full transition-transform overflow-hidden rounded-2xl ${isEditMode ? 'pointer-events-none' : ''}`}>
                <WidgetComponent
                    {...(widget.props || {})}
                    gridSize={{ w, h }}
                    updateLayout={(layout: any) => updateLayout(widget.id, layout)}
                    widgetId={widget.id}
                />
            </div>

            {/* Edit Overlay */}
            {isEditMode && (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-[var(--btn-bg)] z-20 gap-2 pointer-events-auto">
                    {/* Drag Handle Indicator */}


                    {/* Size Control (Hidden for Global widgets) */}
                    {registryItem.category !== 'Global' && (
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
                                        [2, 3], [3, 3], [4, 2]
                                    ].filter(([cw, ch]) => {
                                        if (registryItem.minW && cw < registryItem.minW) return false;
                                        if (registryItem.minH && ch < registryItem.minH) return false;
                                        return true;
                                    }).map(([cw, ch]) => (
                                        <button
                                            key={`${cw}x${ch}`}
                                            onClick={() => { updateLayout(widget.id, { w: cw, h: ch }); setShowSizeMenu(false); }}
                                            className={`text-[10px] p-1 rounded hover:bg-gray-100 border ${w === cw && h === ch ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-100 text-gray-600'}`}
                                        >
                                            {cw}x{ch}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Remove Button */}
                    <button
                        onClick={() => removeWidget(widget.id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-bold hover:bg-red-600 hover:scale-105 transition-transform"
                    >
                        Remove
                    </button>
                </div>
            )}
        </motion.div>
    );
};
