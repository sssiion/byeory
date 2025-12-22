import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Header/Navigation';
import MenuSettings, { useMenu } from '../components/settings/menu/MenuSettings';
import { WIDGET_REGISTRY, type WidgetType, type WidgetInstance, type WidgetLayout } from '../components/widgets/Registry';
import { DraggableWidget } from '../components/widgets/DraggableWidget';
import { Plus, X, RotateCcw, LayoutGrid, Settings2, Minus } from 'lucide-react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { clampWidget, resolveCollisions } from '../components/widgets/layoutUtils';

// Default Grid Size
const DEFAULT_GRID_SIZE = { cols: 4, rows: 6 };

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

    // Preview state for drag
    const [dragPreview, setDragPreview] = useState<WidgetLayout | null>(null);

    const [searchParams, setSearchParams] = useSearchParams(); // Added this line

    // Load
    useEffect(() => {
        const savedWidgets = localStorage.getItem('my_dashboard_widgets_v3');
        const savedGrid = localStorage.getItem('my_dashboard_grid_size');

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
        }
    }, []);

    // Check for edit mode trigger in URL
    useEffect(() => {
        const editMode = searchParams.get('editMode');
        console.log("MainPage Edit Mode Trigger:", editMode);

        if (editMode === 'widget') {
            setIsWidgetEditMode(true);
            // Clear the param properly using react-router
            setSearchParams(params => {
                const newParams = new URLSearchParams(params);
                newParams.delete('editMode');
                return newParams;
            }, { replace: true });
        }
    }, [searchParams]);

    // Save
    useEffect(() => {
        if (widgets.length > 0) {
            localStorage.setItem('my_dashboard_widgets_v3', JSON.stringify(widgets));
        }
        localStorage.setItem('my_dashboard_grid_size', JSON.stringify(gridSize));
    }, [widgets, gridSize]);

    const addWidget = (type: WidgetType) => {
        const registryItem = WIDGET_REGISTRY[type];

        // 1. 위젯의 크기 결정
        let w = 1, h = 1;
        if (registryItem.defaultSize === 'wide') { w = 4; h = 1; }
        else if (registryItem.defaultSize === 'large') { w = 2; h = 2; }
        else if (registryItem.defaultSize === 'medium') { w = 2; h = 1; }

        // 그리드 너비보다 위젯이 크면 강제로 줄임 (안전장치)
        if (w > gridSize.cols) w = gridSize.cols;

        // 2. 빈 공간 찾기 알고리즘 (First Fit)
        let targetX = 1;
        let targetY = 1;
        let found = false;

        // 현재 가장 아래에 있는 위젯의 높이 구하기 (검색 범위 제한용)
        const currentMaxY = widgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 1);

        // Y축: 1행부터 (현재 최대 높이 + 위젯 높이)까지 탐색
        // 충분히 아래까지 검색하면 무조건 자리는 나오게 되어 있음
        for (let y = 1; y <= currentMaxY + h; y++) {
            // X축: 1열부터 (그리드 너비 - 위젯 너비 + 1)까지 탐색
            for (let x = 1; x <= gridSize.cols - w + 1; x++) {

                // 해당 위치(x, y)에 w, h 크기로 놓았을 때 충돌이 있는지 확인
                const hasCollision = widgets.some(existing => {
                    const e = existing.layout;
                    return (
                        x < e.x + e.w &&       // 기존 위젯 오른쪽보다 왼쪽
                        x + w > e.x &&         // 기존 위젯 왼쪽보다 오른쪽
                        y < e.y + e.h &&       // 기존 위젯 아래쪽보다 위쪽
                        y + h > e.y            // 기존 위젯 위쪽보다 아래쪽
                    );
                });

                // 충돌이 없다면 여기가 빈칸임!
                if (!hasCollision) {
                    targetX = x;
                    targetY = y;
                    found = true;
                    break;
                }
            }
            if (found) break; // 자리를 찾았으면 더 이상 검색 중단
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
        if (!item || !item.layout) return;

        // Calculate preview position
        const { w, h } = item.layout;
        const clamped = clampWidget({ x, y, w, h }, gridSize.cols);

        setDragPreview(prev => {
            if (prev && prev.x === clamped.x && prev.y === clamped.y) return prev;
            return clamped;
        });
    }, [gridSize]);

    const updateWidgetPosition = (id: string, targetX: number, targetY: number) => {
        setDragPreview(null); // Clear preview

        setWidgets(prev => {
            const activeWidget = prev.find(w => w.id === id);
            if (!activeWidget) return prev;

            // Apply clamping to ensure it fits in grid
            const clamped = clampWidget({
                ...activeWidget.layout,
                x: targetX,
                y: targetY
            }, gridSize.cols);

            const movedWidget = { ...activeWidget, layout: clamped };

            // Run collision resolution
            const resolved = resolveCollisions(prev, movedWidget);

            // Auto-expand grid if needed
            const maxRow = resolved.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), gridSize.rows);
            if (maxRow > gridSize.rows) {
                setGridSize(p => ({ ...p, rows: maxRow }));
            }

            return resolved;
        });
    };

    const updateLayout = (id: string, layout: Partial<WidgetLayout>) => {
        setWidgets(prev => {
            const activeWidget = prev.find(w => w.id === id);
            if (!activeWidget) return prev;

            const newLayout = { ...activeWidget.layout, ...layout };
            const clamped = clampWidget(newLayout, gridSize.cols);

            // Resolve collisions for resize too
            const movedWidget = { ...activeWidget, layout: clamped };
            const resolved = resolveCollisions(prev, movedWidget);

            // Auto-expand grid if needed
            const maxRow = resolved.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), gridSize.rows);
            if (maxRow > gridSize.rows) {
                setGridSize(p => ({ ...p, rows: maxRow }));
            }

            return resolved;
        });
    };

    const resetWidgets = () => {
        if (confirm("초기화 하시겠습니까?")) {
            setWidgets(DEFAULT_WIDGETS_V3);
            setGridSize(DEFAULT_GRID_SIZE);
        }
    };

    // Calculate minimum rows needed to show all widgets + 1 empty row
    const maxWidgetY = widgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
    const displayRows = Math.max(gridSize.rows, maxWidgetY, 6); // At least 6 rows or fits content
    const finalRows = displayRows + 1; // Always show 1 extra empty row at bottom

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

    return (
        <DndProvider backend={HTML5Backend}>
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

                                            {/* Grid Controls */}
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg">
                                                <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1"><Settings2 size={12} /> Grid</span>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setGridSize(p => ({ ...p, rows: Math.max(3, p.rows - 1) }))} className="p-1 hover:bg-gray-100 rounded"><Minus size={12} /></button>
                                                    <span className="text-xs font-mono">{gridSize.cols}x{finalRows}</span>
                                                    <button onClick={() => setGridSize(p => ({ ...p, rows: p.rows + 1 }))} className="p-1 hover:bg-gray-100 rounded"><Plus size={12} /></button>
                                                </div>
                                            </div>

                                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                                            <button
                                                onClick={() => setIsCatalogOpen(true)}
                                                className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)] font-bold flex items-center gap-1"
                                            >
                                                <Plus size={16} /> Add
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

                                {/* 2. Render Drag Preview (Placeholder) */}
                                {isWidgetEditMode && dragPreview && (
                                    <div
                                        className="bg-blue-200/50 border-2 border-blue-500 rounded-xl transition-all duration-100 z-10 pointer-events-none"
                                        style={{
                                            gridColumn: `${dragPreview.x} / span ${dragPreview.w}`,
                                            gridRow: `${dragPreview.y} / span ${dragPreview.h}`,
                                        }}
                                    />
                                )}

                                {/* 3. Render Widgets */}
                                {widgets.map((widget) => (
                                    <DraggableWidget
                                        key={widget.id}
                                        widget={widget}
                                        isEditMode={isWidgetEditMode}
                                        removeWidget={removeWidget}
                                        updateLayout={updateLayout}
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
            </div>
        </DndProvider>
    );
};

export default MainPage;
