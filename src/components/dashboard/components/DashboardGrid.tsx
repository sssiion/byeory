import React from 'react';
import type { WidgetInstance, WidgetLayout } from '../../settings/widgets/type';
import { DraggableWidget } from '../../settings/widgets/DraggableWidget';
import GridCell from './GridCell';

interface DashboardGridProps {
    isMobile: boolean;
    isMenuEditMode: boolean;
    isWidgetEditMode: boolean;
    gridSize: { cols: number; rows: number };
    finalRows: number;
    widgetsToRender: WidgetInstance[];
    registry: any;
    selectedWidgetId: string | null;
    removeWidget: (id: string) => void;
    updateLayout: (id: string, layout: Partial<WidgetLayout>) => void;
    setIsDragging: (isDragging: boolean) => void;
    setLayoutPreview: (preview: null) => void;
    onCellHover: (x: number, y: number, item: any) => void;
    updateWidgetPosition: (id: string, x: number, y: number) => void;
    setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
    handleShowHelp: (widget: WidgetInstance) => void;
    handleUpdateWidgetData: (id: string, updates: any) => void;
    onWidgetClick?: (widgetId: string) => void;
    isZoomEnabled?: boolean;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
    isMobile,
    isMenuEditMode,
    isWidgetEditMode,
    gridSize,
    finalRows,
    widgetsToRender,
    registry,
    selectedWidgetId,
    removeWidget,
    updateLayout,
    setIsDragging,
    setLayoutPreview,
    onCellHover,
    updateWidgetPosition,
    setSelectedWidgetId,
    handleShowHelp,
    handleUpdateWidgetData,
    onWidgetClick,
    isZoomEnabled
}) => {
    if (isMenuEditMode) return null;

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

    return (
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
                        onZoom={() => onWidgetClick?.(widget.id)}
                        isZoomEnabled={isZoomEnabled}
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardGrid;
