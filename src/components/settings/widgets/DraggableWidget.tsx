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
    isMobile?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
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
    onDrop,
    isMobile = false,
    isSelected = false,
    onSelect
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
        hover: (item: { type: string, id?: string }) => {
            if (isEditMode && onHover) {
                onHover(widget.layout.x, widget.layout.y, item);
            }
        },
        drop: (item: { type: string, id?: string }) => {
            if (isEditMode && onDrop) {
                onDrop(widget.layout.x, widget.layout.y, item);
            }
        },
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    // Close size menu if deselected
    useEffect(() => {
        if (!isSelected) {
            setShowSizeMenu(false);
        }
    }, [isSelected]);

    if (isEditMode) {
        drag(drop(ref));
    }

    const registryItem = WIDGET_REGISTRY[widget.type];
    if (!registryItem) return null;

    const WidgetComponent = registryItem.component;
    const { x, y, w, h } = widget.layout;
    const isTransparent = widget.type === 'transparent';

    // Grid Layout Style Logic
    let gridStyle: React.CSSProperties = {
        gridColumn: `${x} / span ${w}`,
        gridRow: `${y} / span ${h}`,
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 50 : (showSizeMenu ? 60 : 1),
    };

    // Mobile Override (2-Column Flow)
    if (isMobile) {
        gridStyle = {
            ...gridStyle,
            gridColumn: w >= 2 ? 'span 2' : 'span 1', // Full width for w>=2
            gridRow: `span ${h}`, // Allow spanning multiple rows
            zIndex: 1
        };
    }

    return (
        <motion.div
            layout // Enable layout animation on all devices for smooth transitions
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            ref={ref}
            className={`global-physics-widget relative group rounded-2xl transition-colors duration-200 
                ${isTransparent
                    ? (isEditMode ? 'bg-white/10 border-2 border-dashed border-white/30' : '')
                    : 'theme-bg-card shadow-sm hover:shadow-md'} 
                ${(isEditMode && !isMobile) ? 'cursor-move ring-2 ring-[var(--btn-bg)] ring-offset-2 overflow-visible' : 'overflow-hidden'}
                ${isDragging ? 'pointer-events-none' : ''}
                ${(isMobile && isSelected && isEditMode) ? 'ring-2 ring-[var(--btn-bg)] ring-offset-2' : ''}
                ${isEditMode ? 'select-none' : ''}
            `}
            style={gridStyle}
            onClick={(e) => {
                // On mobile edit mode, tap to select
                if (isMobile && isEditMode) {
                    onSelect?.();
                    e.stopPropagation(); // Prevent deselecting from background click
                }
            }}
            onContextMenu={(e) => {
                // Prevent context menu to allow long-press drag on mobile/touch
                if (isEditMode) e.preventDefault();
            }}
        >
            {/* Widget Content */}
            <div className={`w-full h-full transition-transform overflow-hidden rounded-2xl ${isEditMode ? 'pointer-events-none' : ''}`}>
                <WidgetComponent
                    {...(widget.props || {})}
                    gridSize={{ w, h }}
                    updateLayout={(layout: Partial<WidgetInstance['layout']>) => updateLayout(widget.id, layout)}
                    widgetId={widget.id}
                />
            </div>

            {/* Edit Overlay */}
            {isEditMode && (
                <div
                    style={{
                        opacity: (isMobile && !isSelected) ? 0 : 1,
                        pointerEvents: (isMobile && !isSelected) ? 'none' : 'auto'
                    }}
                    className={`absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center transition-opacity border-2 border-[var(--btn-bg)] z-20 gap-2 pointer-events-auto
                    ${isMobile ? '' : 'opacity-0 group-hover:opacity-100'}
                `}>
                    {/* Size Control (Hidden for Global widgets) */}
                    {registryItem.category !== 'Global' && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSizeMenu(!showSizeMenu);
                                }}
                                className="bg-[var(--bg-card)] text-[var(--text-primary)] px-3 py-1.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-1 hover:bg-[var(--bg-card-secondary)]"
                            >
                                <Maximize2 size={12} /> Size
                            </button>

                            {showSizeMenu && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[var(--bg-card)] rounded-lg shadow-xl border border-[var(--border-color)] p-2 z-[100] w-36 grid grid-cols-2 gap-1 animate-in zoom-in duration-200 max-h-60 overflow-y-auto custom-scrollbar">
                                    {(registryItem.validSizes || [
                                        [1, 1], [2, 1], [3, 1],
                                        [1, 2], [2, 2], [3, 2],
                                        [2, 3], [3, 3], [4, 2]
                                    ]).filter(([cw, ch]) => {
                                        if (isMobile) {
                                            if (cw > 2) return false; // Hide sizes wider than 2 cols on mobile
                                            if (ch > 2) return false; // Hide sizes taller than 2 rows on mobile (Global Rule)

                                            // Special rules for 'welcome' widget on mobile
                                            if (widget.type === 'welcome') {
                                                if (cw === 1 && ch === 2) return false; // Block 1x2
                                                if (ch > 2) return false; // Max height 2
                                            }

                                            // Special rules for 'ootd' widget on mobile
                                            if (widget.type === 'ootd') {
                                                if (ch !== 2) return false; // Only allow height 2
                                            }

                                            // Special rules for 'chat-diary' widget on mobile
                                            if (widget.type === 'chat-diary') {
                                                if (cw !== 2) return false; // Force width 2 (full width)
                                            }

                                            // Special rules for 'asmr-mixer' widget on mobile
                                            if (widget.type === 'asmr-mixer') {
                                                if (cw !== 2) return false; // Force width 2
                                            }

                                            // Special rules for 'random-picker' widget on mobile
                                            if (widget.type === 'random-picker') {
                                                if (cw === 1 && ch === 1) return false; // Hide 1x1
                                            }
                                        }
                                        if (registryItem.minW && cw < registryItem.minW) return false;
                                        if (registryItem.minH && ch < registryItem.minH) return false;
                                        return true;
                                    }).map(([cw, ch]) => (
                                        <button
                                            key={`${cw}x${ch}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateLayout(widget.id, { w: cw, h: ch });
                                                try {
                                                    const key = `widget-config-${widget.type}`;
                                                    const existing = localStorage.getItem(key);
                                                    const config = existing ? JSON.parse(existing) : {};
                                                    const newConfig = { ...config, defaultSize: `${cw}x${ch}` };
                                                    localStorage.setItem(key, JSON.stringify(newConfig));

                                                    const regItem = WIDGET_REGISTRY[widget.type];
                                                    if (regItem) regItem.defaultSize = `${cw}x${ch}`;
                                                } catch (e) { console.warn(e); }
                                                setShowSizeMenu(false);
                                            }}
                                            className={`text-[10px] p-2 rounded hover:bg-[var(--bg-card-secondary)] border transition-colors ${w === cw && h === ch ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            removeWidget(widget.id);
                        }}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-bold hover:bg-red-600 hover:scale-105 transition-transform"
                    >
                        Remove
                    </button>
                </div>
            )}
        </motion.div>
    );
};
