import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Header/Navigation';
import MenuSettings, { useMenu } from '../components/settings/menu/MenuSettings';
import { WidgetGallery } from '../components/settings/widgets/WidgetGallery';
import { DraggableWidget } from '../components/settings/widgets/DraggableWidget';
import { Plus, X, RefreshCw, LayoutGrid, AlignStartVertical, ArrowUp, FolderOpen } from 'lucide-react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { clampWidget, resolveCollisions, compactLayout } from '../components/settings/widgets/layoutUtils';
import { CustomDragLayer } from '../components/settings/widgets/CustomDragLayer';
import WidgetBuilder from "../components/settings/widgets/customwidget/WidgetBuilder"; // .tsx 제거
import { WidgetInfoModal } from '../components/settings/widgets/WidgetInfoModal';
import { PresetManager } from '../components/settings/widgets/PresetManager';
import { useIsMobile } from '../hooks';
import {useWidgetRegistry} from "../components/settings/widgets/useWidgetRegistry.ts";
import type {WidgetInstance} from "../components/settings/widgets/type.ts";

// 🔥 [변경 1] 훅과 타입 import (경로 확인 필수)

// Default Grid Size
const DEFAULT_GRID_SIZE = { cols: 4, rows: 1 };

// Default Widgets
const DEFAULT_WIDGETS_V3: WidgetInstance[] = [
    { id: 'w-1', type: 'welcome', layout: { x: 1, y: 1, w: 4, h: 1 } },
    { id: 'w-2', type: 'todo-list', layout: { x: 1, y: 2, w: 2, h: 2 } },
    { id: 'w-3', type: 'ocean-wave', layout: { x: 3, y: 2, w: 2, h: 1 } },
    { id: 'w-4', type: 'scratch-card', layout: { x: 3, y: 3, w: 1, h: 1 } },
    { id: 'w-5', type: 'physics-box', layout: { x: 4, y: 3, w: 1, h: 1 } },
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
    // 🔥 [변경 2] 훅을 사용해 위젯 메타데이터(registry) 로딩
    const { registry, isLoading } = useWidgetRegistry();

    const { isEditMode: isMenuEditMode } = useMenu();
    const [isWidgetEditMode, setIsWidgetEditMode] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
        const savedWidgets = localStorage.getItem('my_dashboard_widgets_v3');
        if (savedWidgets) {
            try {
                return JSON.parse(savedWidgets);
            } catch (e) {
                return DEFAULT_WIDGETS_V3;
            }
        }
        return DEFAULT_WIDGETS_V3;
    });

    const [widgetSnapshot, setWidgetSnapshot] = useState<WidgetInstance[] | null>(null);

    const [gridSize, setGridSize] = useState<{ cols: number; rows: number }>(() => {
        const savedGrid = localStorage.getItem('my_dashboard_grid_size_v4');
        if (savedGrid) {
            try {
                return JSON.parse(savedGrid);
            } catch (e) {
                return DEFAULT_GRID_SIZE;
            }
        }
        return DEFAULT_GRID_SIZE;
    });

    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isArrangeConfirmOpen, setIsArrangeConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
    const [editingWidgetData, setEditingWidgetData] = useState<any>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [layoutPreview, setLayoutPreview] = useState<WidgetInstance[] | null>(null);
    const [infoWidget, setInfoWidget] = useState<any>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const isMobile = useIsMobile();

    // Save
    useEffect(() => {
        localStorage.setItem('my_dashboard_widgets_v3', JSON.stringify(widgets));
        localStorage.setItem('my_dashboard_grid_size_v4', JSON.stringify(gridSize));
    }, [widgets, gridSize]);

    // Resize grid
    useEffect(() => {
        const maxY = widgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
        const requiredRows = Math.max(maxY, DEFAULT_GRID_SIZE.rows);

        if (requiredRows !== gridSize.rows) {
            setGridSize(prev => ({ ...prev, rows: requiredRows }));
        }
    }, [widgets, gridSize.rows]);

    // URL Check
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

    // Body Scroll Lock
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

    // Scroll Listener
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

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Snapshot
    useEffect(() => {
        if (isWidgetEditMode && widgetSnapshot === null) {
            setWidgetSnapshot(JSON.parse(JSON.stringify(widgets)));
        } else if (!isWidgetEditMode) {
            setWidgetSnapshot(null);
        }
    }, [isWidgetEditMode, widgetSnapshot, widgets]);

    // 🌟 [핵심 수정] 위젯 추가 함수
    const addWidget = (item: any) => {
        let type: string;
        let w = 1, h = 1;
        let initialProps = {};

        // CASE 1: 커스텀 저장된 위젯 (객체)
        if (typeof item === 'object' && item !== null) {
            const savedWidget = item;
            type = 'custom-block';

            const sizeStr = savedWidget.defaultSize || '1x1';
            const [wStr, hStr] = sizeStr.split('x');
            w = parseInt(wStr, 10) || 2;
            h = parseInt(hStr, 10) || 2;

            initialProps = {
                type: savedWidget.type,
                content: JSON.parse(JSON.stringify(savedWidget.content || {})),
                styles: JSON.parse(JSON.stringify(savedWidget.styles || {})),
                title: savedWidget.name
            };
        }
        // CASE 2: 기본 템플릿 (문자열 - widgetType)
        else {
            type = item as string;

            // 🔥 [변경 3] WIDGET_REGISTRY 대신 hook에서 받은 registry 사용
            const registryItem = registry[type];

            if (!registryItem) {
                console.error(`Unknown widget type: ${type}`);
                return;
            }

            // DB에서 가져온 defaultSize 사용
            if (registryItem.defaultSize) {
                const [wStr, hStr] = registryItem.defaultSize.split('x');
                w = parseInt(wStr, 10) || 1;
                h = parseInt(hStr, 10) || 1;
            }
            initialProps = registryItem.defaultProps ? JSON.parse(JSON.stringify(registryItem.defaultProps)) : {};
        }

        // 공통: 빈 자리 찾기
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
            id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: type,
            props: initialProps,
            layout: { x: targetX, y: targetY, w, h }
        };

        setWidgets(prev => [...prev, newWidget]);
        setIsCatalogOpen(false);
    };

    const removeWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    };

    // Hover Logic (생략 - 기존과 동일)
    const lastHoverTime = React.useRef(0);
    const HOVER_THROTTLE_MS = isMobile ? 60 : 30;

    const onCellHover = useCallback((x: number, y: number, item: any) => {
        if (!item || !item.id) return;
        const now = Date.now();
        if (now - lastHoverTime.current < HOVER_THROTTLE_MS) return;
        lastHoverTime.current = now;
        const draggingWidget = widgets.find(w => w.id === item.id);
        if (!draggingWidget) return;
        const { w, h } = draggingWidget.layout;
        const clamped = clampWidget({ x, y, w, h }, gridSize.cols);
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
        setLayoutPreview(null);
        setWidgets(prev => {
            const activeWidget = prev.find(w => w.id === id);
            if (!activeWidget) return prev;
            const clamped = clampWidget({ ...activeWidget.layout, x: targetX, y: targetY }, gridSize.cols);
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

    const resetWidgets = () => setIsResetConfirmOpen(true);
    const handleReset = () => {
        setWidgets([]);
        setGridSize(DEFAULT_GRID_SIZE);
        setIsResetConfirmOpen(false);
    };

    const handleArrange = () => {
        setWidgets(prev => {
            const sorted = [...prev].sort((a, b) => {
                if (a.layout.y === b.layout.y) return a.layout.x - b.layout.x;
                return a.layout.y - b.layout.y;
            });
            return compactLayout(sorted);
        });
        setIsArrangeConfirmOpen(false);
    };

    const ensureMobileConstraints = (widgets: WidgetInstance[]): WidgetInstance[] => {
        const sorted = [...widgets].sort((a, b) => {
            if (a.layout.y === b.layout.y) return a.layout.x - b.layout.x;
            return a.layout.y - b.layout.y;
        });
        const mobileWidgets: WidgetInstance[] = [];
        const occupied = new Set<string>();
        sorted.forEach(w => {
            const width = Math.min(w.layout.w, 2);
            const height = w.layout.h;
            let startX = Math.min(w.layout.x, 2 - width + 1);
            if (startX < 1) startX = 1;
            let startY = w.layout.y;
            let x = startX;
            let y = startY;
            let found = false;
            while (!found) {
                let fits = true;
                if (x + width - 1 > 2) fits = false;
                else {
                    for (let dy = 0; dy < height; dy++) {
                        for (let dx = 0; dx < width; dx++) {
                            if (occupied.has(`${x + dx},${y + dy}`)) {
                                fits = false;
                                break;
                            }
                        }
                        if (!fits) break;
                    }
                }
                if (fits) {
                    mobileWidgets.push({ ...w, layout: { ...w.layout, x, y, w: width } });
                    for (let dy = 0; dy < height; dy++) {
                        for (let dx = 0; dx < width; dx++) {
                            occupied.add(`${x + dx},${y + dy}`);
                        }
                    }
                    found = true;
                } else {
                    x++;
                    if (x > 2 - width + 1) { x = 1; y++; }
                }
            }
        });
        return mobileWidgets;
    };

    const currentDisplayWidgets = layoutPreview || widgets;
    const widgetsToRender = isMobile ? ensureMobileConstraints(currentDisplayWidgets) : currentDisplayWidgets;
    const maxWidgetY = widgetsToRender.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
    const displayRows = Math.max(gridSize.rows, maxWidgetY, DEFAULT_GRID_SIZE.rows);
    const finalRows = displayRows + (isDragging ? 4 : 0);

    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.global-physics-widget')) {
                setSelectedWidgetId(null);
            }
        };
        if (isWidgetEditMode) {
            window.addEventListener('click', handleGlobalClick);
        }
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [isWidgetEditMode]);

    const gridCells = [];
    const currentCols = isMobile ? 2 : gridSize.cols;
    for (let y = 1; y <= finalRows; y++) {
        for (let x = 1; x <= currentCols; x++) {
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

    const controlsRef = React.useRef<HTMLDivElement>(null);
    const [showRightBlur, setShowRightBlur] = useState(false);

    useEffect(() => {
        const el = controlsRef.current;
        if (!el) return;
        const checkScroll = () => {
            setShowRightBlur(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
        };
        el.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
        checkScroll();
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [isWidgetEditMode, isMenuEditMode, isMobile]);

    const handleUpdateWidgetData = useCallback((id: string, updates: any) => {
        setWidgets(prev => prev.map(w => {
            if (w.id === id) {
                const newProps = { ...w.props };
                if (updates.content) newProps.content = { ...(newProps.content || {}), ...updates.content };
                if (updates.styles) newProps.styles = { ...(newProps.styles || {}), ...updates.styles };
                Object.keys(updates).forEach(key => {
                    if (key !== 'content' && key !== 'styles') newProps[key] = updates[key];
                });
                return { ...w, props: newProps };
            }
            return w;
        }));
    }, []);

    // 🔥 [변경 4] Help Modal 핸들러 수정: registry 사용
    const handleShowHelp = (widget: WidgetInstance) => {
        let info: any = null;

        if (widget.type === 'custom-block' || widget.type === 'custom') {
            info = {
                type: widget.type,
                label: (widget.props as any).title || 'Custom Widget',
                category: 'My Saved',
                isSaved: true,
                data: { ...widget, name: (widget.props as any).title }
            };
        } else {
            // registry에서 검색
            const regItem = registry[widget.type];
            if (regItem) {
                info = {
                    ...regItem,
                    type: widget.type,
                    isSaved: false
                };
            }
        }
        if (info) {
            setInfoWidget(info);
        }
    };

    const handleLoadPreset = (newWidgets: WidgetInstance[], newGridSize: { cols: number; rows: number }) => {
        setWidgets(newWidgets);
        setGridSize(newGridSize);
        setIsPresetManagerOpen(false);
    };

    if (isBuilderOpen) {
        return (
            <WidgetBuilder
                initialData={editingWidgetData}
                onExit={() => {
                    setIsBuilderOpen(false);
                    setEditingWidgetData(null);
                }}
                onSave={(savedData) => {
                    setEditingWidgetData(savedData);
                }}
            />
        );
    }

    return (
        <DndProvider
            backend={isMobile ? TouchBackend : HTML5Backend}
            options={isMobile ? { delayTouchStart: 800, enableMouseEvents: true } : undefined}
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

                        <div
                            ref={controlsRef}
                            className={`flex gap-2 items-center ${isMobile ? 'flex-nowrap overflow-x-auto w-full pb-2 no-scrollbar' : 'flex-wrap'} ${isMobile && showRightBlur ? 'mask-linear-fade' : ''}`}
                        >
                            {!isMenuEditMode && (
                                <>
                                    {isWidgetEditMode && (
                                        <>
                                            <button onClick={() => setIsWidgetEditMode(false)} className="h-10 px-4 w-20 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-md transition-colors">
                                                Save
                                            </button>
                                            <button onClick={() => { if (widgetSnapshot) setWidgets(widgetSnapshot); setIsWidgetEditMode(false); }} className="h-10 px-4 w-20 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                                Cancel
                                            </button>
                                            <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0"></div>
                                            <button onClick={() => setIsCatalogOpen(true)} className="h-10 px-4 w-20 flex-shrink-0 flex items-center justify-center gap-1 rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-colors">
                                                <Plus size={18} /> Add
                                            </button>
                                            <button onClick={() => setIsBuilderOpen(true)} className="h-10 px-4 flex-shrink-0 flex items-center justify-center gap-1 rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-colors">
                                                <span>새 버튼</span>
                                            </button>
                                            <button onClick={() => setIsArrangeConfirmOpen(true)} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)] transition-colors" title="Auto Arrange">
                                                <AlignStartVertical size={18} />
                                            </button>
                                            <button onClick={() => setIsPresetManagerOpen(true)} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)] transition-colors" title="Presets">
                                                <FolderOpen size={18} />
                                            </button>
                                            <button onClick={resetWidgets} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Reset Layout">
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
                        <div className="relative w-full overflow-visible p-4">
                            <div
                                className="grid gap-4 transition-all duration-300 ease-in-out relative"
                                style={{
                                    gridTemplateColumns: isMobile ? `repeat(2, minmax(0, 1fr))` : `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                                    gridTemplateRows: `repeat(${finalRows}, ${isMobile ? '45vw' : '200px'})`,
                                }}
                            >
                                {gridCells}

                                {widgetsToRender.map((widget) => (
                                    <DraggableWidget
                                        key={widget.id}
                                        widget={widget}
                                        // 🔥 [변경 5] registry를 props로 전달
                                        registry={registry}
                                        isEditMode={isWidgetEditMode}
                                        removeWidget={removeWidget}
                                        updateLayout={updateLayout}
                                        onDragStart={() => setIsDragging(true)}
                                        onDragEnd={() => {
                                            setLayoutPreview(null);
                                            setIsDragging(false);
                                        }}
                                        onHover={onCellHover}
                                        onDrop={(x, y, item) => {
                                            updateWidgetPosition(item.id, x, y);
                                            setIsDragging(false);
                                        }}
                                        isMobile={isMobile}
                                        isSelected={selectedWidgetId === widget.id}
                                        onSelect={() => setSelectedWidgetId(prev => prev === widget.id ? null : widget.id)}
                                        onShowInfo={() => handleShowHelp(widget)}
                                        onUpdateWidget={handleUpdateWidgetData}
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
                                <WidgetGallery
                                    onSelect={addWidget}
                                    onEdit={(data) => {
                                        setEditingWidgetData(data);
                                        setIsBuilderOpen(true);
                                        setIsCatalogOpen(false);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modals ... */}
                {isArrangeConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">위젯 정렬</h3>
                            <p className="text-[var(--text-secondary)] mb-6">정렬시 빈칸없이 전부 채워집니다.</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsArrangeConfirmOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 transition-colors">아니요</button>
                                <button onClick={handleArrange} className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--btn-bg)] text-white hover:opacity-90 transition-colors">예, 정렬합니다</button>
                            </div>
                        </div>
                    </div>
                )}

                {isPresetManagerOpen && (
                    <PresetManager
                        currentWidgets={widgets}
                        currentGridSize={gridSize}
                        onLoad={handleLoadPreset}
                        onClose={() => setIsPresetManagerOpen(false)}
                    />
                )}

                {isResetConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">레이아웃 초기화</h3>
                            <p className="text-[var(--text-secondary)] mb-6">모든 위젯 설정이 초기화됩니다. 계속하시겠습니까?</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsResetConfirmOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 transition-colors">취소</button>
                                <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">초기화</button>
                            </div>
                        </div>
                    </div>
                )}

                {isBuilderOpen && (
                    <div className="fixed inset-0 z-50 bg-[#1F1F1F] animate-in slide-in-from-bottom-5 duration-300">
                        <WidgetBuilder
                            onExit={() => {
                                setIsBuilderOpen(false);
                                setEditingWidgetData(null);
                            }}
                            initialData={editingWidgetData}
                            onSave={(savedData) => {
                                setEditingWidgetData(savedData);
                            }}
                        />
                    </div>
                )}

                {infoWidget && (
                    <WidgetInfoModal
                        widget={infoWidget}
                        onClose={() => setInfoWidget(null)}
                        showAction={false}
                    />
                )}

                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-24 md:bottom-8 right-8 p-3 rounded-full bg-[var(--btn-bg)] text-white shadow-lg transition-all duration-300 z-40 hover:scale-110 active:scale-95 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={24} />
                </button>
            </div>
        </DndProvider>
    );
};

export default MainPage;