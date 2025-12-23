import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Header/Navigation';
import MenuSettings, { useMenu } from '../components/settings/menu/MenuSettings';
import { WIDGET_REGISTRY, type WidgetType, type WidgetInstance, type WidgetLayout } from '../components/settings/widgets/Registry';
import { DraggableWidget } from '../components/settings/widgets/DraggableWidget';
import { Plus, X, RotateCcw, LayoutGrid, AlignStartVertical } from 'lucide-react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { clampWidget, resolveCollisions } from '../components/settings/widgets/layoutUtils';
import { CustomDragLayer } from '../components/settings/widgets/CustomDragLayer';

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
    const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
    const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isArrangeConfirmOpen, setIsArrangeConfirmOpen] = useState(false);

    // Preview properties
    const [layoutPreview, setLayoutPreview] = useState<WidgetInstance[] | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();

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

    // ... (omitted)

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

    const addWidget = (type: WidgetType) => {
        const registryItem = WIDGET_REGISTRY[type];

        let w = 1, h = 1;
        if (registryItem.defaultSize === 'wide') { w = 4; h = 1; }
        else if (registryItem.defaultSize === 'large') { w = 2; h = 2; }
        else if (registryItem.defaultSize === 'medium') { w = 2; h = 1; }

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

    const onCellHover = useCallback((x: number, y: number, item: any) => {
        if (!item || !item.id) return;

        // Find the actual widget being dragged to get its dimensions
        // (Item might only contain partial info depending on how it was constructed)
        const draggingWidget = widgets.find(w => w.id === item.id);
        if (!draggingWidget) return;

        const { w, h } = draggingWidget.layout;
        const clamped = clampWidget({ x, y, w, h }, gridSize.cols);

        // Optimization: Don't recalculate if position hasn't changed from last preview
        // effectively, we need to track "last calculated preview input" to avoid thrashing
        // but `layoutPreview` state updates will cause re-renders anyway.
        // We can just rely on basic equality or memo logic if performance is an issue.
        // For now, let's just calculate.

        // Create a temporary "moved" widget
        const movedWidget = { ...draggingWidget, layout: { ...draggingWidget.layout, x: clamped.x, y: clamped.y } };

        // Calculate the full layout with collisions resolved
        // Note: we must pass the *original* widgets list (without the move applied) 
        // but we need to trick resolveCollisions to use the movedWidget as the "pusher".

        // resolveCollisions takes (widgets list, active widget). 
        // It removes active widget from list by ID, then pushes it back in at new spot, then resolves others.
        const resolved = resolveCollisions(widgets, movedWidget);

        setLayoutPreview(resolved);
    }, [widgets, gridSize.cols]);

    // Handle end of drag to clear preview
    // Note: react-dnd dragging end is handled in the DraggableWidget, 
    // but the drop event is handled here.
    // We should clear preview on drop or when drag ends.

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

            return resolved;
        });
    };

    const resetWidgets = () => {
        if (confirm("초기화 하시겠습니까?")) {
            setWidgets(DEFAULT_WIDGETS_V3);
            setGridSize(DEFAULT_GRID_SIZE);
        }
    };

    const handleArrange = () => {
        setWidgets(prev => {
            // 1. Sort by Y then X (Reading Order)
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

    // Calculate minimum rows needed
    // Use layoutPreview if dragging, otherwise widgets
    const currentDisplayWidgets = layoutPreview || widgets;

    const maxWidgetY = currentDisplayWidgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
    const displayRows = Math.max(gridSize.rows, maxWidgetY, DEFAULT_GRID_SIZE.rows);
    const finalRows = displayRows;

    // Generate grid cells
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



    // ... (existing imports)

    return (
        <DndProvider backend={HTML5Backend}>
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
                                                onClick={() => setIsWidgetEditMode(false)}
                                                className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--btn-bg)] text-white shadow-md transition-colors"
                                            >
                                                Done
                                            </button>

                                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                                            <button
                                                onClick={() => setIsCatalogOpen(true)}
                                                className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)] font-bold flex items-center gap-1"
                                            >
                                                <Plus size={16} /> Add
                                            </button>

                                            <button
                                                onClick={() => setIsArrangeConfirmOpen(true)}
                                                className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)]"
                                                title="Auto Arrange"
                                            >
                                                <AlignStartVertical size={18} />
                                            </button>

                                            <button
                                                onClick={resetWidgets}
                                                className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-red-400 hover:text-red-500 hover:bg-red-50"
                                                title="Reset Layout"
                                            >
                                                <RotateCcw size={18} />
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
                                    gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                                    gridTemplateRows: `repeat(${finalRows}, 200px)`,
                                }}
                            >
                                {/* 1. Render Background Cells */}
                                {gridCells}

                                {/* 2. Render Widgets (using current display widgets i.e. preview or actual) */}
                                {currentDisplayWidgets.map((widget) => (
                                    <DraggableWidget
                                        key={widget.id}
                                        widget={widget}
                                        isEditMode={isWidgetEditMode}
                                        removeWidget={removeWidget}
                                        updateLayout={updateLayout}
                                        onDragEnd={() => setLayoutPreview(null)}
                                        onHover={onCellHover}
                                        onDrop={(x, y, item) => updateWidgetPosition(item.id, x, y)}
                                    />
                                ))}
                            </div>

                        </div>
                    )}
                </div>

                {/* Widget Catalog Modal */}
                {isCatalogOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card-secondary)]">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">위젯 보관함</h3>
                                <button onClick={() => setIsCatalogOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {Object.entries(
                                    Object.entries(WIDGET_REGISTRY).reduce((acc, [type, item]) => {
                                        const cat = (item as any).category || 'Other';
                                        if (!acc[cat]) acc[cat] = [];
                                        acc[cat].push({ type, item });
                                        return acc;
                                    }, {} as Record<string, { type: string, item: any }[]>)
                                ).map(([category, items]) => (
                                    <div key={category}>
                                        <h4 className="text-sm font-bold text-[var(--text-secondary)] mb-3 px-1">{category}</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {items.map(({ type, item }) => (
                                                <div
                                                    key={type}
                                                    onClick={() => addWidget(type as WidgetType)}
                                                    className="cursor-pointer group flex flex-col gap-2 p-2 rounded-xl hover:bg-[var(--bg-card-secondary)] border border-transparent hover:border-[var(--btn-bg)] transition-all"
                                                >
                                                    <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative pointer-events-none">
                                                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs font-bold p-2 text-center border border-[var(--border-color)]">
                                                            {item.label}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-[var(--text-primary)]">{item.label}</span>
                                                        <Plus size={14} className="text-[var(--btn-bg)] opacity-0 group-hover:opacity-100" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Auto Arrange Confirm Modal */}
                {isArrangeConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">위젯 정렬</h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                정렬시 빈칸없이 전부 체워집니다.
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
            </div>
        </DndProvider>
    );
};

export default MainPage;
