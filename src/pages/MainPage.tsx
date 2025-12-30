import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Header/Navigation';
import MenuSettings, { useMenu } from '../components/settings/menu/MenuSettings';
import { WIDGET_REGISTRY, type WidgetType, type WidgetInstance, type WidgetLayout } from '../components/settings/widgets/Registry';
import { WidgetGallery } from '../components/settings/widgets/WidgetGallery';
import { DraggableWidget } from '../components/settings/widgets/DraggableWidget';
import { Plus, X, RefreshCw, LayoutGrid, AlignStartVertical, ArrowUp } from 'lucide-react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { clampWidget, resolveCollisions, compactLayout } from '../components/settings/widgets/layoutUtils';
import { CustomDragLayer } from '../components/settings/widgets/CustomDragLayer';
import WidgetBuilder from "../components/settings/widgets/customwidget/WidgetBuilder.tsx";
import { useIsMobile } from '../hooks';

// Default Grid Size
const DEFAULT_GRID_SIZE = { cols: 4, rows: 1 };

// Default Widgets
const DEFAULT_WIDGETS_V3: WidgetInstance[] = [
    { id: 'w-1', type: 'welcome', layout: { x: 1, y: 1, w: 4, h: 1 } },
    { id: 'w-2', type: 'theme-guide', layout: { x: 1, y: 2, w: 2, h: 1 } },
    { id: 'w-3', type: 'feature-card', props: { title: "Feature 1", description: "기능", icon: "1" }, layout: { x: 3, y: 2, w: 1, h: 1 } },
    { id: 'w-4', type: 'feature-card', props: { title: "Feature 2", description: "기능", icon: "2" }, layout: { x: 4, y: 2, w: 1, h: 1 } },
];

interface GridCellProps {
    x: number;
    y: number;
    onDrop: (x: number, y: number, item: any) => void;
    onHover: (x: number, y: number, item: any) => void;
    isEditMode: boolean;
}

const GridCell: React.FC<GridCellProps> = ({ x, y, onDrop, onHover, isEditMode }) => {
    const [, drop] = useDrop({
        accept: 'widget',
        drop: (item) => onDrop(x, y, item),
        hover: (item) => onHover(x, y, item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div
            ref={drop as unknown as React.Ref<HTMLDivElement>}
            style={{ gridColumn: x, gridRow: y }}
            className={`
        w-full h-full rounded-xl transition-all duration-200
        ${isEditMode ? 'border border-dashed border-gray-200' : ''}
      `}
        />
    );
};

const MainPage: React.FC = () => {
    const { isEditMode: isMenuEditMode } = useMenu();
    const [isWidgetEditMode, setIsWidgetEditMode] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false); // State for scroll button visibility
    const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
    const [widgetSnapshot, setWidgetSnapshot] = useState<WidgetInstance[] | null>(null);
    const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isArrangeConfirmOpen, setIsArrangeConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    // Preview properties
    const [layoutPreview, setLayoutPreview] = useState<WidgetInstance[] | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();

    // Mobile Check
    const isMobile = useIsMobile();

    // Load
    useEffect(() => {
        const savedWidgets = localStorage.getItem('my_dashboard_widgets_v3');
        const savedGrid = localStorage.getItem('my_dashboard_grid_size_v4');

        if (savedWidgets) {
            try {
                setWidgets(JSON.parse(savedWidgets));
            } catch (e) {
                setWidgets(DEFAULT_WIDGETS_V3);
            }
        } else {
            setWidgets(DEFAULT_WIDGETS_V3);
        }

        if (savedGrid) {
            try {
                setGridSize(JSON.parse(savedGrid));
            } catch (e) {
                setGridSize(DEFAULT_GRID_SIZE);
            }
        } else {
            setGridSize(DEFAULT_GRID_SIZE);
        }
    }, []);

    // Save
    useEffect(() => {
        if (widgets.length > 0) {
            localStorage.setItem('my_dashboard_widgets_v3', JSON.stringify(widgets));
        }
        localStorage.setItem('my_dashboard_grid_size_v4', JSON.stringify(gridSize));
    }, [widgets, gridSize]);

    // Automatically resize grid based on widgets
    useEffect(() => {
        const maxY = widgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
        const requiredRows = Math.max(maxY, DEFAULT_GRID_SIZE.rows);

        if (requiredRows !== gridSize.rows) {
            setGridSize(prev => ({ ...prev, rows: requiredRows }));
        }
    }, [widgets, gridSize.rows]);

    // Check for edit mode trigger in URL
    useEffect(() => {
        const editMode = searchParams.get('editMode');

        if (editMode === 'widget') {
            setIsWidgetEditMode(true);
            setSearchParams(params => {
                const newParams = new URLSearchParams(params);
                newParams.delete('editMode');
                return newParams;
            }, { replace: true });
        }
    }, [searchParams]);

    // Lock body scroll when catalog is open
    useEffect(() => {
        if (isCatalogOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCatalogOpen]);

    // Handle Scroll Listener for "Scroll to Top" button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to Top Function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Snapshot widgets when entering edit mode
    useEffect(() => {
        if (isWidgetEditMode && widgetSnapshot === null) {
            setWidgetSnapshot(JSON.parse(JSON.stringify(widgets)));
        } else if (!isWidgetEditMode) {
            setWidgetSnapshot(null);
        }
    }, [isWidgetEditMode, widgetSnapshot, widgets]);

    const addWidget = (type: WidgetType) => {
        const registryItem = WIDGET_REGISTRY[type];

        let w = 1, h = 1;
        if (registryItem.defaultSize) {
            const [wStr, hStr] = registryItem.defaultSize.split('x');
            w = parseInt(wStr, 10) || 1;
            h = parseInt(hStr, 10) || 1;
        }

        if (w > gridSize.cols) w = gridSize.cols;

        let targetX = 1;
        let targetY = 1;
        let found = false;

        const currentMaxY = widgets.reduce((max: number, w: WidgetInstance) => Math.max(max, w.layout.y + w.layout.h), 1);

        for (let y = 1; y <= currentMaxY + h; y++) {
            for (let x = 1; x <= gridSize.cols - w + 1; x++) {
                const hasCollision = widgets.some(existing => {
                    const e = existing.layout;
                    return (
                        x < e.x + e.w &&
                        x + w > e.x &&
                        y < e.y + e.h &&
                        y + h > e.y
                    );
                });

                if (!hasCollision) {
                    targetX = x;
                    targetY = y;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        const newWidget: WidgetInstance = {
            id: `w-${Date.now()}`,
            type,
            props: registryItem.defaultProps,
            layout: { x: targetX, y: targetY, w, h }
        };

        setWidgets(prev => [...prev, newWidget]);
        setIsCatalogOpen(false);
    };

    const removeWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    };

    const lastHoverTime = React.useRef(0);
    const HOVER_THROTTLE_MS = isMobile ? 150 : 30; // More damping on mobile

    const onCellHover = useCallback((x: number, y: number, item: any) => {
        if (!item || !item.id) return;

        const now = Date.now();
        if (now - lastHoverTime.current < HOVER_THROTTLE_MS) return;
        lastHoverTime.current = now;

        const draggingWidget = widgets.find(w => w.id === item.id);
        if (!draggingWidget) return;

        // Optimization: Don't recalculate if position hasn't changed significantly enough to warrant a new cell
        // (However, grid logic relies on x/y inputs which are discrete cells, so this check is implicit)

        const { w, h } = draggingWidget.layout;
        const clamped = clampWidget({ x, y, w, h }, gridSize.cols);

        // Prevent calculating if the visual result would be identical to current preview
        if (layoutPreview) {
            const currentPreviewWidget = layoutPreview.find(w => w.id === item.id);
            if (currentPreviewWidget && currentPreviewWidget.layout.x === clamped.x && currentPreviewWidget.layout.y === clamped.y) {
                return;
            }
        }

        const movedWidget = { ...draggingWidget, layout: { ...draggingWidget.layout, x: clamped.x, y: clamped.y } };
        const resolved = resolveCollisions(widgets, movedWidget);

        setLayoutPreview(resolved);
    }, [widgets, gridSize.cols, layoutPreview, isMobile]);

    const updateWidgetPosition = (id: string, targetX: number, targetY: number) => {
        setLayoutPreview(null); // Clear preview on drop

        setWidgets(prev => {
            const activeWidget = prev.find(w => w.id === id);
            if (!activeWidget) return prev;

            const clamped = clampWidget({
                ...activeWidget.layout,
                x: targetX,
                y: targetY
            }, gridSize.cols);

            const movedWidget = { ...activeWidget, layout: clamped };
            const resolved = resolveCollisions(prev, movedWidget);

            return resolved;
        });
    };

    const updateLayout = (id: string, layout: Partial<WidgetLayout>) => {
        setWidgets(prev => {
            const activeWidget = prev.find(w => w.id === id);
            if (!activeWidget) return prev;

            const newLayout = { ...activeWidget.layout, ...layout };
            const clamped = clampWidget(newLayout, gridSize.cols);

            const movedWidget = { ...activeWidget, layout: clamped };
            const resolved = resolveCollisions(prev, movedWidget);

            return compactLayout(resolved);
        });
    };

    const resetWidgets = () => {
        setIsResetConfirmOpen(true);
    };

    const handleReset = () => {
        setWidgets(DEFAULT_WIDGETS_V3);
        setGridSize(DEFAULT_GRID_SIZE);
        setIsResetConfirmOpen(false);
    };

    const handleArrange = () => {
        setWidgets(prev => {
            const sorted = [...prev].sort((a, b) => {
                if (a.layout.y === b.layout.y) return a.layout.x - b.layout.x;
                return a.layout.y - b.layout.y;
            });

            const newWidgets: WidgetInstance[] = [];
            const occupied = new Set<string>();

            sorted.forEach(widget => {
                let x = 1;
                let y = 1;
                let found = false;

                while (!found) {
                    let fits = true;
                    if (x + widget.layout.w - 1 > gridSize.cols) {
                        fits = false;
                    } else {
                        for (let dy = 0; dy < widget.layout.h; dy++) {
                            for (let dx = 0; dx < widget.layout.w; dx++) {
                                if (occupied.has(`${x + dx},${y + dy}`)) {
                                    fits = false;
                                    break;
                                }
                            }
                            if (!fits) break;
                        }
                    }

                    if (fits) {
                        newWidgets.push({ ...widget, layout: { ...widget.layout, x, y } });
                        for (let dy = 0; dy < widget.layout.h; dy++) {
                            for (let dx = 0; dx < widget.layout.w; dx++) {
                                occupied.add(`${x + dx},${y + dy}`);
                            }
                        }
                        found = true;
                    } else {
                        x++;
                        if (x > gridSize.cols) {
                            x = 1;
                            y++;
                        }
                    }
                }
            });
            return newWidgets;
        });
        setIsArrangeConfirmOpen(false);
    };

    const currentDisplayWidgets = layoutPreview || widgets;
    const maxWidgetY = currentDisplayWidgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
    const displayRows = Math.max(gridSize.rows, maxWidgetY, DEFAULT_GRID_SIZE.rows);
    const finalRows = displayRows;

    const gridCells = [];
    for (let y = 1; y <= finalRows; y++) {
        for (let x = 1; x <= gridSize.cols; x++) {
            gridCells.push(
                <GridCell
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    onDrop={(targetX, targetY, item) => updateWidgetPosition(item.id, targetX, targetY)}
                    onHover={onCellHover}
                    isEditMode={isWidgetEditMode}
                />
            );
        }
    }

    const [isBuilderOpen, setIsBuilderOpen] = useState(false);


    if (isBuilderOpen) {
        return (
            <WidgetBuilder
                onExit={() => setIsBuilderOpen(false)}
            />
        );
    }

    return (
        <DndProvider
            backend={isMobile ? TouchBackend : HTML5Backend}
            options={isMobile ? { delayTouchStart: 500, enableMouseEvents: true } : undefined}
            key={isMobile ? "mobile" : "desktop"}
        >
            <CustomDragLayer />
            <div className="min-h-screen pb-20">
                <Navigation />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Controls Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold theme-text-primary flex items-center gap-2">
                            <LayoutGrid size={20} /> My Dashboard
                        </h2>

                        <div className="flex gap-2 items-center flex-wrap">
                            {!isMenuEditMode && (
                                <>
                                    {isWidgetEditMode && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setIsWidgetEditMode(false);
                                                }}
                                                className="h-10 px-4 w-20 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-md transition-colors"
                                            >
                                                Save
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (widgetSnapshot) {
                                                        setWidgets(widgetSnapshot);
                                                    }
                                                    setIsWidgetEditMode(false);
                                                }}
                                                className="h-10 px-4 w-20 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                Cancel
                                            </button>

                                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                                            <button
                                                onClick={() => setIsCatalogOpen(true)}
                                                className="h-10 px-4 w-20 flex items-center justify-center gap-1 rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-colors"
                                            >
                                                <Plus size={18} /> Add
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setIsBuilderOpen(true);
                                                }}
                                                className="h-10 px-4 flex items-center justify-center gap-1 rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-colors"
                                            >
                                                <span>새 버튼</span>
                                            </button>

                                            <button
                                                onClick={() => setIsArrangeConfirmOpen(true)}
                                                className="h-10 w-10 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)] transition-colors"
                                                title="Auto Arrange"
                                            >
                                                <AlignStartVertical size={18} />
                                            </button>

                                            <button
                                                onClick={resetWidgets}
                                                className="h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                title="Reset Layout"
                                            >
                                                <RefreshCw size={20} />
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {isMenuEditMode ? (
                        <MenuSettings />
                    ) : (
                        <div className="relative w-full overflow-x-hidden md:overflow-visible">
                            <div
                                className="grid gap-4 transition-all duration-300 ease-in-out relative"
                                style={{
                                    gridTemplateColumns: isMobile ? `repeat(2, minmax(0, 1fr))` : `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                                    gridTemplateRows: isMobile ? undefined : `repeat(${finalRows}, 200px)`,
                                    gridAutoRows: isMobile ? '45vw' : undefined,
                                    gridAutoFlow: isMobile ? 'row dense' : undefined
                                }}
                            >
                                {isMobile ? null : gridCells}

                                {/* Sort widgets for logical DOM order on mobile to assist auto-flow */}
                                {(isMobile
                                    ? [...currentDisplayWidgets].sort((a, b) => (a.layout.y - b.layout.y) || (a.layout.x - b.layout.x))
                                    : currentDisplayWidgets
                                ).map((widget) => (
                                    <DraggableWidget
                                        key={widget.id}
                                        widget={widget}
                                        isEditMode={isWidgetEditMode}
                                        removeWidget={removeWidget}
                                        updateLayout={updateLayout}
                                        onDragEnd={() => setLayoutPreview(null)}
                                        onHover={onCellHover}
                                        onDrop={(x, y, item) => updateWidgetPosition(item.id, x, y)}
                                        isMobile={isMobile}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Widget Catalog Modal */}
                {isCatalogOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card-secondary)]">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">위젯 보관함</h3>
                                <button onClick={() => setIsCatalogOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X /></button>
                            </div>
                            <div className="flex-1 min-h-0 flex flex-col relative">
                                <WidgetGallery onSelect={addWidget} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modals omitted for brevity, keeping existing stricture... 
                   Actually I must write full content. The previous modals are standard.
                */}
                {/* Auto Arrange Confirm Modal */}
                {isArrangeConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">위젯 정렬</h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                정렬시 빈칸없이 전부 채워집니다.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsArrangeConfirmOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 transition-colors"
                                >
                                    아니요
                                </button>
                                <button
                                    onClick={handleArrange}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--btn-bg)] text-white hover:opacity-90 transition-colors"
                                >
                                    실행
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset Confirm Modal */}
                {isResetConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">레이아웃 초기화</h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                모든 위젯 설정이 초기화됩니다. 계속하시겠습니까?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsResetConfirmOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    초기화
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll To Top Button */}
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-24 md:bottom-8 right-8 p-3 rounded-full bg-[var(--btn-bg)] text-white shadow-lg transition-all duration-300 z-40 hover:scale-110 active:scale-95 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={24} />
                </button>
            </div>
        </DndProvider >
    );
};

export default MainPage;
