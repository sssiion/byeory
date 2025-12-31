import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Maximize2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { type WidgetInstance, WIDGET_REGISTRY } from './Registry';
import BlockRenderer from "./customwidget/components/BlockRenderer.tsx";
import { useCredits } from '../../../context/CreditContext';

interface DraggableWidgetProps {
    widget: WidgetInstance;
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
}

const ItemTypes = {
    WIDGET: 'widget',
};

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
    widget,
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
    onShowInfo
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [showSizeMenu, setShowSizeMenu] = useState(false);

    // ✨ Context for generic interaction quest
    const { triggerWidgetInteraction } = useCredits();

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.WIDGET,
        item: () => {
            if (onDragStart) onDragStart();
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

    // Close size menu on click outside
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


    // 🌟 [핵심 수정] 위젯 렌더링 로직 분기
    let WidgetComponent: any = null;
    let registryItem: any = WIDGET_REGISTRY[widget.type];
    if (!registryItem) return null;

    // 1. 커스텀 블록 (저장된 위젯)인 경우
    if (widget.type === 'custom-block' || !registryItem) {
        // registryItem이 없으면 커스텀으로 간주 (또는 에러 방지)
        WidgetComponent = (props: any) => {
            // props.block이 있으면 그걸 쓰고, 없으면 widget.props를 block 형태로 변환
            const blockData = props.block || {
                id: widget.id,
                type: (widget.props as any).type || widget.type, // 원래 타입 보존
                content: (widget.props as any).content || {},
                styles: (widget.props as any).styles || {}
            };
            // Provide dummy props for BlockRenderer as it expects editor props
            return <BlockRenderer
                block={blockData}
                selectedBlockId={null}
                onSelectBlock={() => { }}
                onRemoveBlock={() => { }}
                activeContainer={null as any}
                onSetActiveContainer={() => { }}
                onUpdateBlock={() => { }}
            />;
        };
        // 가짜 registryItem 생성 (에러 방지용)
        registryItem = { category: 'My Saved', validSizes: [[1, 1], [1, 2], [2, 1], [2, 2]] };
    }
    // 2. 일반 레지스트리 위젯인 경우
    else {
        WidgetComponent = registryItem.component;
    }

    // Grid Layout Style Logic
    let gridStyle: React.CSSProperties = {
        gridColumn: `${x} / span ${w}`,
        gridRow: `${y} / span ${h}`,
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 50 : (showSizeMenu ? 60 : 1),
    };

    // Mobile Override: We now rely on explicit 2-column layout passed from MainPage,
    // so we don't need to force 'span' styles here anymore. 
    // We only keep the zIndex and specific interaction styles.

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
                ${(isMobile && isEditMode) ? 'overflow-visible' : ''}
            `}
            style={gridStyle}
            onClick={(e) => {
                // On mobile edit mode, tap to select
                if (isMobile && isEditMode) {
                    onSelect?.();
                    e.stopPropagation(); // Prevent deselecting from background click
                } else if (!isEditMode) {
                    // ✨ Trigger "Play Widget" Quest on generic interaction (click)
                    triggerWidgetInteraction();
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
                    // ✨ In case specific widgets need to trigger it explicitly (e.g., drag internal items)
                    onInteraction={triggerWidgetInteraction}
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
                    {/* Help Button (Top Right) */}
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

                    {/* Size Control (Hidden for Global widgets) */}
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
                                            // Ensure small widgets are selectable on mobile
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
                                    }).map(([cw, ch]: [number, number]) => (
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
