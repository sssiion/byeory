import React, { useState, useLayoutEffect } from 'react';
import EditorToolbar from './EditorToolbar';

interface Props {
    selectedId: string;
    selectedType: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title';
    currentItem: any;
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title', changes: any) => void;
    onDelete?: () => void;
    scale: number;
}

const ToolbarOverlay: React.FC<Props> = ({ selectedId, selectedType, currentItem, onUpdate, onDelete, scale }) => {
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null);

    useLayoutEffect(() => {
        const updatePosition = () => {
            if (!selectedId) return;

            const targetEl = document.getElementById(selectedId);
            if (!targetEl) return;

            // We assume this overlay is rendered inside the Scaled Content Container (width: 800px)
            // So we need the position relative to that container's offsetParent.
            // But getting offsets can be tricky with transforms (scale).

            // Safer approach: Get absolute client rects and subtract container's client rect.
            // AND divide by scale.

            // Find the closest relative parent (the Content Container) which should be the parent of this Overlay.
            const containerEl = targetEl.closest('.selection-zone');
            if (!containerEl) return;

            const targetRect = targetEl.getBoundingClientRect();
            const containerRect = containerEl.getBoundingClientRect();

            // Calculate Style Top/Left (relative to the container, unscaled coordinate space)
            // Since the container has `transform: scale()`, the `clientRect` is the "visual" size on screen.
            // The internal coordinate space is "original size" (800px width).

            const top = (targetRect.bottom - containerRect.top) / scale;
            const centerLeft = (targetRect.left - containerRect.left + targetRect.width / 2) / scale;

            setPosition({ top: top + 10, left: centerLeft }); // +10 for gap
        };

        updatePosition();

        // Optional: observe resize if needed.
        const resizeObserver = new ResizeObserver(updatePosition);
        const targetEl = document.getElementById(selectedId);
        if (targetEl) resizeObserver.observe(targetEl);

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [selectedId, selectedType, scale]);

    if (!position || !selectedId) return null;

    return (
        <div
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                transform: 'translateX(-50%)',
                zIndex: 9999, // ✨ The Goal: Always on Top
                width: 'max-content',
                pointerEvents: 'auto',
                color: '#1f2937' // ✨ Reset text color to dark gray (prevent inheritance from paper)
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent deselection when clicking toolbar
        >
            <EditorToolbar
                selectedId={selectedId}
                selectedType={selectedType}
                currentItem={currentItem}
                onUpdate={onUpdate}
                onDelete={onDelete}
                positionMode="inline" // We use inline mode style, but positioned absolutely by the wrapper
            />
        </div>
    );
};

export default ToolbarOverlay;
