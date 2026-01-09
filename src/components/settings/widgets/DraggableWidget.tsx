import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Maximize2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import BlockRenderer from "./customwidget/components/BlockRenderer"; // .tsx 제거
import { useCredits } from '../../../context/CreditContext';
import type {WidgetConfig, WidgetInstance} from "./type.ts";
import {WIDGET_COMPONENT_MAP} from "./componentMap.ts";


interface DraggableWidgetProps {
    widget: WidgetInstance;
    registry: Record<string, WidgetConfig>;
    isEditMode: boolean;
    removeWidget: (id: string) => void;
    updateLayout: (id: string, layout: Partial<WidgetInstance['layout']>) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onHover: (x: number, y: number, item: any) => void;
    onDrop: (x: number, y: number, item: any) => void;
    isMobile?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
    onShowInfo?: () => void;
    onUpdateWidget?: (id: string, updates: any) => void;
}

const ItemTypes = {
    WIDGET: 'widget',
};

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
                                                                    widget,
                                                                    registry,
                                                                    isEditMode,
                                                                    removeWidget,
                                                                    updateLayout,
                                                                    onDragStart,
                                                                    onDragEnd,
                                                                    onHover,
                                                                    onDrop,
                                                                    isMobile = false,
                                                                    isSelected = false,
                                                                    onSelect,
                                                                    onShowInfo,
                                                                    onUpdateWidget
                                                                }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [showSizeMenu, setShowSizeMenu] = useState(false);

    const { triggerWidgetInteraction } = useCredits();

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.WIDGET,
        item: () => {
            if (onDragStart) onDragStart();
            const { offsetWidth, offsetHeight } = ref.current || { offsetWidth: 0, offsetHeight: 0 };
            return {
                id: widget.id,
                type: widget.type,
                layout: widget.layout,
                props: widget.props,
                initialWidth: offsetWidth,
                initialHeight: offsetHeight
            };
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

    useEffect(() => {
        if (!isSelected) {
            setShowSizeMenu(false);
        }
    }, [isSelected]);

    useEffect(() => {
        if (!showSizeMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.size-menu-container')) {
                setShowSizeMenu(false);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showSizeMenu]);

    if (isEditMode) {
        drag(drop(ref));
    }

    const { x, y, w, h } = widget.layout;
    const isTransparent = widget.type === 'transparent';

    // Widget Rendering Logic
    let WidgetComponent: any = null;
    let registryItem: WidgetConfig | undefined = registry[widget.type];

    // Registry에 있고, ComponentMap에도 코드가 있다면 연결
    if (registryItem && WIDGET_COMPONENT_MAP[widget.type]) {
        WidgetComponent = WIDGET_COMPONENT_MAP[widget.type];
    }

    // Fallback logic
    if (widget.type === 'custom-block' || !registryItem) {
        registryItem = {
            id: 0,
            widgetType: widget.type,
            label: 'Custom',
            description: '',
            category: 'My Saved',
            keywords: [],
            defaultSize: '2x2',
            validSizes: [[1, 1], [1, 2], [2, 1], [2, 2]],
            defaultProps: {},
            isSystem: false,
            component: null as any
        };
    }

    const gridStyle: React.CSSProperties = {
        gridColumn: `${x} / span ${w}`,
        gridRow: `${y} / span ${h}`,
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 50 : (showSizeMenu ? 60 : 1),
    };

    return (
        <motion.div
            layout
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
                ${(isMobile && isEditMode) ? 'overflow-visible' : ''}
            `}
            style={gridStyle}
            onClick={(e) => {
                if (isMobile && isEditMode) {
                    onSelect?.();
                    e.stopPropagation();
                } else if (!isEditMode) {
                    triggerWidgetInteraction();
                }
            }}
            onContextMenu={(e) => {
                if (isEditMode) e.preventDefault();
            }}
        >
            <div className={`w-full h-full transition-transform overflow-hidden rounded-2xl ${isEditMode ? 'pointer-events-none' : ''}`}>
                <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl" />}>

                    {/* 🔥 [수정 3] WidgetComponent가 없거나 custom-block 일 때 BlockRenderer 렌더링 */}
                    {(widget.type === 'custom-block' || !WidgetComponent) ? (
                        <BlockRenderer
                            block={{
                                id: widget.id,
                                // 🔥 [핵심 수정] widget.props가 undefined일 경우를 대비해 || {} 추가
                                type: (widget.props || {}).type || widget.type,
                                content: (widget.props || {}).content || {},
                                styles: (widget.props || {}).styles || {}
                            }}
                            selectedBlockId={null}
                            onSelectBlock={() => { }}
                            onRemoveBlock={() => { }}
                            activeContainer={null as any}
                            onSetActiveContainer={() => { }}
                            onUpdateBlock={(id, updates) => {
                                if (onUpdateWidget) {
                                    onUpdateWidget(widget.id, updates);
                                }
                            }}
                        />
                    ) : (
                        <WidgetComponent
                            {...(widget.props || {})}
                            gridSize={{ w, h }}
                            updateLayout={(layout: Partial<WidgetInstance['layout']>) => updateLayout(widget.id, layout)}
                            widgetId={widget.id}
                            onInteraction={triggerWidgetInteraction}
                        />
                    )}
                </Suspense>
            </div>

            {isEditMode && (
                <div
                    style={{
                        opacity: (isMobile && !isSelected) ? 0 : 1,
                        pointerEvents: (isMobile && !isSelected) ? 'none' : 'auto'
                    }}
                    className={`absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center transition-opacity border-2 border-[var(--btn-bg)] z-20 gap-2 pointer-events-auto
                    ${isMobile ? '' : 'opacity-0 group-hover:opacity-100'}
                `}>
                    {/* Info Button */}
                    {isEditMode && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowInfo?.();
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-black/70 backdrop-blur-sm transition-colors shadow-sm"
                            title="Information"
                        >
                            <HelpCircle size={14} />
                        </button>
                    )}

                    {/* Size Control */}
                    {registryItem.category !== 'Global' && (
                        <div className="relative size-menu-container">
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
                                    ]).filter(([cw, ch]: [number, number]) => {
                                        if (isMobile) {
                                            if (cw > 2) return false;
                                            if (ch > 2) return false;
                                            // Mobile specific filters...
                                            if (widget.type === 'welcome') {
                                                if (cw === 1 && ch === 2) return false;
                                                if (ch > 2) return false;
                                            }
                                            if (widget.type === 'ootd' && ch !== 2) return false;
                                            if (widget.type === 'chat-diary' && cw !== 2) return false;
                                            if (widget.type === 'asmr-mixer' && cw !== 2) return false;
                                            if (widget.type === 'random-picker' && cw === 1 && ch === 1) return false;
                                        }
                                        return true;
                                    }).map(([cw, ch]: [number, number]) => (
                                        <button
                                            key={`${cw}x${ch}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateLayout(widget.id, { w: cw, h: ch });
                                                // LocalStorage Config Logic
                                                try {
                                                    const key = `widget-config-${widget.type}`;
                                                    const existing = localStorage.getItem(key);
                                                    const config = existing ? JSON.parse(existing) : {};
                                                    const newConfig = { ...config, defaultSize: `${cw}x${ch}` };
                                                    localStorage.setItem(key, JSON.stringify(newConfig));
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