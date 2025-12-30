import type { WidgetInstance } from './Registry';

export const collides = (w1: WidgetInstance['layout'], w2: WidgetInstance['layout']): boolean => {
    if (w1 === w2) return false; // Same widget

    // Check intersection
    return (
        w1.x < w2.x + w2.w &&
        w1.x + w1.w > w2.x &&
        w1.y < w2.y + w2.h &&
        w1.y + w1.h > w2.y
    );
};

export const clampWidget = (layout: WidgetInstance['layout'], gridCols: number) => {
    let { x, w } = layout;

    // Clamp width if it exceeds grid
    if (w > gridCols) w = gridCols;

    // Clamp x position
    if (x + w > gridCols + 1) {
        x = gridCols - w + 1;
    }
    if (x < 1) x = 1;

    return { ...layout, x, w };
};

export const resolveCollisions = (
    widgets: WidgetInstance[],
    activeWidget: WidgetInstance
): WidgetInstance[] => {
    let sorted = [...widgets].sort((a, b) => {
        if (a.layout.y === b.layout.y) return a.layout.x - b.layout.x;
        return a.layout.y - b.layout.y;
    });

    const activeIndex = sorted.findIndex(w => w.id === activeWidget.id);
    // Remove active widget to process it separately
    sorted.splice(activeIndex, 1);

    // Re-insert active widget (it's the "pusher")
    sorted.push(activeWidget);

    // We need a stable iterative or recursive push.
    // Simpler approach: 
    // 1. Place active widget.
    // 2. Find anything colliding with it.
    // 3. Move colliding items down.
    // 4. Repeat for those items.

    const otherWidgets = widgets.filter(w => w.id !== activeWidget.id);

    // A queue of widgets to process/move
    let queue = [activeWidget];

    // Helper map to lookup current positions
    let currentLayouts = new Map<string, WidgetInstance['layout']>();
    widgets.forEach(w => currentLayouts.set(w.id, { ...w.layout }));

    // Update with active widget's new pos
    currentLayouts.set(activeWidget.id, { ...activeWidget.layout });

    while (queue.length > 0) {
        const pusher = queue.shift()!;
        const pusherLayout = currentLayouts.get(pusher.id)!;

        // Find collisions
        for (let other of otherWidgets) {
            const otherLayout = currentLayouts.get(other.id)!;

            // Optimization: only check items that are potentially below or at same level?
            // "Push Down" logic: only push items if they collide.

            if (collides(pusherLayout, otherLayout)) {
                // Determine movement. 
                // We always push DOWN.
                // New Y = Pusher.Y + Pusher.H
                const newY = pusherLayout.y + pusherLayout.h;
                const newLayout = { ...otherLayout, y: newY };

                currentLayouts.set(other.id, newLayout);

                // Add to queue to resolve its new collisions
                // Avoid infinite loops: only add if we actually moved it
                if (newY !== otherLayout.y) {
                    queue.push(other);
                }
            }
        }
    }

    // Reconstruct result
    return widgets.map(w => ({
        ...w,
        layout: currentLayouts.get(w.id)!
    }));
};

// Find the first available slot (x, y) that fits w x h
export const findFirstAvailableSlot = (
    widgets: WidgetInstance[],
    gridCols: number,
    w: number,
    h: number
): { x: number, y: number } => {
    let y = 1;
    while (true) {
        for (let x = 1; x <= gridCols - w + 1; x++) {
            const proposed = { x, y, w, h };
            const hasCollision = widgets.some(existing => collides(proposed, existing.layout));

            if (!hasCollision) {
                return { x, y };
            }
        }
        y++;
        // Safety break if grid gets ridiculously huge (e.g. bug)
        // In practice, we'll find a spot at the bottom eventually.
        if (y > 1000) break;
    }
    return { x: 1, y: 1 }; // Fallback (should ideally not happen due to infinite height)
};

export const getMinGridRows = (widgets: WidgetInstance[]): number => {
    if (widgets.length === 0) return 0;
    return widgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
};

export const compactLayout = (widgets: WidgetInstance[]): WidgetInstance[] => {
    // 1. Sort widgets by Y then X
    const sorted = [...widgets].sort((a, b) => {
        if (a.layout.y === b.layout.y) return a.layout.x - b.layout.x;
        return a.layout.y - b.layout.y;
    });

    const placedWidgets: WidgetInstance[] = [];

    for (const widget of sorted) {
        let newY = 1;
        // Try starting from y=1 and go down until we fit without collision with ALREADY PLACED widgets
        while (true) {
            const proposed = { ...widget.layout, y: newY };
            const collision = placedWidgets.some(w => collides(proposed, w.layout));
            if (!collision) {
                break;
            }
            newY++;
        }
        placedWidgets.push({ ...widget, layout: { ...widget.layout, y: newY } });
    }
    return placedWidgets;
};
