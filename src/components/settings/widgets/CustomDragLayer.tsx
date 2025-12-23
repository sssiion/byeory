import React from 'react';
import { useDragLayer } from 'react-dnd';
import { WIDGET_REGISTRY, type WidgetType } from './Registry';

const ItemTypes = {
    WIDGET: 'widget',
};

function getItemStyles(initialOffset: { x: number; y: number } | null, currentOffset: { x: number; y: number } | null) {
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none',
        };
    }

    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;

    return {
        transform,
        WebkitTransform: transform,
    };
}

export const CustomDragLayer: React.FC = () => {
    const {
        itemType,
        isDragging,
        item,
        initialOffset,
        currentOffset,
    } = useDragLayer((monitor) => ({
        itemType: monitor.getItemType(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    function renderItem() {
        if (!item || !item.type) return null;

        const registryItem = WIDGET_REGISTRY[item.type as WidgetType];
        if (!registryItem) return null;

        const WidgetComponent = registryItem.component;

        // Render the widget preview (you might want to adjust dimensions or style)
        // We'll try to render it with the same dimensions it had on the grid if possible,
        // or just the component itself.
        // Since 'item' contains layout info from DraggableWidget's item(), we can use that.

        const { w, h } = item.layout || { w: 1, h: 1 };

        // We need to approximate the pixel size based on grid columns/rows?
        // Or just render it "as is" and let it flow. 
        // Ideally we grab the actual DOM rect size, but here we might just render a representative card.
        // For simplicity, let's render it in a fixed width container or just let it size itself.
        // But better yet, let's assume a standard cell size of ~200px or so (from main page grid row height) + gaps.

        // Rough calculation matching MainPage grid:
        // row height 200px. col width depends on screen. 
        // Let's just set a fixed width for the drag preview that looks reasonable (e.g. 300px for 1x1).
        // A better approach is to not enforce size here and let the widget component decide, 
        // but typically we want it to look like the grid memory.

        // Let's hardcode a base unit for preview to ensure it's not tiny.
        const width = w * 250;
        const height = h * 200;

        return (
            <div style={{ width, height }} className="bg-white rounded-2xl shadow-2xl overflow-hidden opacity-90 scale-105 pointer-events-none border-2 border-[var(--btn-bg)]">
                <WidgetComponent {...(item.props || {})} />
            </div>
        );
    }

    if (!isDragging || itemType !== ItemTypes.WIDGET) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 100,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
        }}>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                {renderItem()}
            </div>
        </div>
    );
};
