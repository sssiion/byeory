import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { WidgetInstance, WidgetLayout } from '../../settings/widgets/type';
import { clampWidget, resolveCollisions, compactLayout } from '../../settings/widgets/layoutUtils';
import { useWidgetRegistry } from '../../settings/widgets/useWidgetRegistry';

const DEFAULT_GRID_SIZE = { cols: 4, rows: 1 };
const DEFAULT_WIDGETS_V3: WidgetInstance[] = [
    { id: 'w-1', type: 'welcome', layout: { x: 1, y: 1, w: 4, h: 1 } },
    { id: 'w-2', type: 'todo-list', layout: { x: 1, y: 2, w: 2, h: 2 } },
    { id: 'w-3', type: 'ocean-wave', layout: { x: 3, y: 2, w: 2, h: 1 } },
    { id: 'w-4', type: 'scratch-card', layout: { x: 3, y: 3, w: 1, h: 1 } },
    { id: 'w-5', type: 'physics-box', layout: { x: 4, y: 3, w: 1, h: 1 } },
];

export const useDashboardLogic = (isMobile: boolean) => {
    const { registry } = useWidgetRegistry();
    const [searchParams, setSearchParams] = useSearchParams();

    const [isWidgetEditMode, setIsWidgetEditMode] = useState(false);
    const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
        const savedWidgets = localStorage.getItem('my_dashboard_widgets_v3');
        if (savedWidgets) {
            try { return JSON.parse(savedWidgets); } catch (e) { return DEFAULT_WIDGETS_V3; }
        }
        return DEFAULT_WIDGETS_V3;
    });

    const [gridSize, setGridSize] = useState<{ cols: number; rows: number }>(() => {
        const savedGrid = localStorage.getItem('my_dashboard_grid_size_v4');
        if (savedGrid) {
            try { return JSON.parse(savedGrid); } catch (e) { return DEFAULT_GRID_SIZE; }
        }
        return DEFAULT_GRID_SIZE;
    });

    const [widgetSnapshot, setWidgetSnapshot] = useState<WidgetInstance[] | null>(null);
    const [layoutPreview, setLayoutPreview] = useState<WidgetInstance[] | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Save to LC
    useEffect(() => {
        localStorage.setItem('my_dashboard_widgets_v3', JSON.stringify(widgets));
        localStorage.setItem('my_dashboard_grid_size_v4', JSON.stringify(gridSize));
    }, [widgets, gridSize]);

    // Snapshot for Cancel
    useEffect(() => {
        if (isWidgetEditMode && widgetSnapshot === null) {
            setWidgetSnapshot(JSON.parse(JSON.stringify(widgets)));
        } else if (!isWidgetEditMode) {
            setWidgetSnapshot(null);
        }
    }, [isWidgetEditMode, widgetSnapshot, widgets]);

    // Resize grid height automatically
    useEffect(() => {
        const maxY = widgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
        const requiredRows = Math.max(maxY, DEFAULT_GRID_SIZE.rows);
        if (requiredRows !== gridSize.rows) {
            setGridSize(prev => ({ ...prev, rows: requiredRows }));
        }
    }, [widgets, gridSize.rows]);

    // URL Check for editMode
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
    }, [searchParams, setSearchParams]);

    const addWidgets = (items: any[], setIsCatalogOpen: (open: boolean) => void) => {
        setWidgets(prevWidgets => {
            let currentWidgets = [...prevWidgets];

            items.forEach(item => {
                let type: string;
                let w = 1, h = 1;
                let initialProps = {};

                if (typeof item === 'object' && item !== null && (item.widgetType || item.type)) {
                    if (item.widgetType) {
                        type = item.widgetType;
                    } else {
                        type = item.type;
                    }

                    if (type === 'custom-block' || type === 'custom') {
                        const savedWidget = item;
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
                    } else {
                        const registryItem = registry[type];
                        if (!registryItem) {
                            console.error(`Unknown widget type: ${type}`);
                            return;
                        }
                        if (registryItem.defaultSize) {
                            const [wStr, hStr] = registryItem.defaultSize.split('x');
                            w = parseInt(wStr, 10) || 1;
                            h = parseInt(hStr, 10) || 1;
                        } else if (item.validSizes && item.validSizes.length > 0) {
                            const [vw, vh] = item.validSizes[0];
                            w = vw;
                            h = vh;
                        }

                        initialProps = registryItem.defaultProps ? JSON.parse(JSON.stringify(registryItem.defaultProps)) : {};
                    }
                } else if (typeof item === 'string') {
                    type = item;
                    const registryItem = registry[type];
                    if (!registryItem) {
                        console.error(`Unknown widget type: ${type}`);
                        return;
                    }
                    if (registryItem.defaultSize) {
                        const [wStr, hStr] = registryItem.defaultSize.split('x');
                        w = parseInt(wStr, 10) || 1;
                        h = parseInt(hStr, 10) || 1;
                    }
                    initialProps = registryItem.defaultProps ? JSON.parse(JSON.stringify(registryItem.defaultProps)) : {};
                } else {
                    return;
                }

                if (w > gridSize.cols) w = gridSize.cols;

                let targetX = 1;
                let targetY = 1;
                let found = false;
                const currentMaxY = currentWidgets.reduce((max: number, w: WidgetInstance) => Math.max(max, w.layout.y + w.layout.h), 1);

                for (let y = 1; y <= currentMaxY + h; y++) {
                    for (let x = 1; x <= gridSize.cols - w + 1; x++) {
                        const hasCollision = currentWidgets.some(existing => {
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

                currentWidgets.push(newWidget);
            });

            return currentWidgets;
        });

        setIsCatalogOpen(false);
    };

    const addWidget = (item: any, setIsCatalogOpen: (open: boolean) => void) => {
        addWidgets([item], setIsCatalogOpen);
    };

    const removeWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    };

    const resetWidgets = () => {
        setWidgets([]);
        setGridSize(DEFAULT_GRID_SIZE);
    };

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

    const HOVER_THROTTLE_MS = isMobile ? 60 : 30;
    const lastHoverTime = useRef(0);

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

    return {
        isWidgetEditMode, setIsWidgetEditMode,
        widgets, setWidgets,
        gridSize, setGridSize,
        widgetSnapshot, setWidgetSnapshot,
        layoutPreview, setLayoutPreview,
        isDragging, setIsDragging,
        registry,
        addWidgets,
        addWidget,
        removeWidget,
        resetWidgets,
        updateWidgetPosition,
        updateLayout,
        handleUpdateWidgetData,
        onCellHover,
        ensureMobileConstraints
    };
};
