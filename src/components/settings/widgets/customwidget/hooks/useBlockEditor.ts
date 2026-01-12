import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Robust ID generation
import type { WidgetBlock, BlockType, BlockMap } from '../types';
import { getDefaultContent } from '../utils';

// Helper to create a new block
const createBlock = (type: BlockType, parent: string | null = null): WidgetBlock => ({
    id: uuidv4(),
    type,
    parent,
    children: [],
    content: getDefaultContent(type),
    styles: { align: 'left' }
});

export const useBlockEditor = (initialBlocks?: WidgetBlock[]) => {
    // Flat State Storage
    const [blocks, setBlocks] = useState<BlockMap>(() => {
        if (!initialBlocks || initialBlocks.length === 0) {
            return {};
        }
        // Convert tree to flat map if needed (migration logic)
        // For now, assume we start fresh or handle migration elsewhere
        return {};
    });

    const [rootOrder, setRootOrder] = useState<string[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // --- Actions ---

    const addBlock = useCallback((type: BlockType, targetParentId: string | null, index?: number) => {
        const newBlock = createBlock(type, targetParentId);

        setBlocks(prev => {
            const next = { ...prev };
            next[newBlock.id] = newBlock;

            if (targetParentId && next[targetParentId]) {
                // Add to parent's children
                const parent = { ...next[targetParentId] };
                const newChildren = [...parent.children];
                if (typeof index === 'number') {
                    newChildren.splice(index, 0, newBlock.id);
                } else {
                    newChildren.push(newBlock.id);
                }
                parent.children = newChildren;
                next[targetParentId] = parent;
            }
            return next;
        });

        if (!targetParentId) {
            setRootOrder(prev => {
                const newOrder = [...prev];
                if (typeof index === 'number') {
                    newOrder.splice(index, 0, newBlock.id);
                } else {
                    newOrder.push(newBlock.id);
                }
                return newOrder;
            });
        }

        return newBlock.id;
    }, []);

    const updateBlock = useCallback((id: string, updates: Partial<WidgetBlock> | any) => {
        setBlocks(prev => {
            if (!prev[id]) return prev;
            return {
                ...prev,
                [id]: { ...prev[id], ...updates }
            };
        });
    }, []);

    const removeBlock = useCallback((id: string) => {
        setBlocks(prev => {
            const next = { ...prev };
            const block = next[id];

            // Remove from parent's children list
            if (block?.parent && next[block.parent]) {
                const parent = { ...next[block.parent] };
                parent.children = parent.children.filter(childId => childId !== id);
                next[block.parent] = parent;
            }

            // Remove the block itself
            delete next[id];

            // TODO: Recursively delete children? Yes, for clean up.
            // Leaving for next step to implement strict cleanup.
            return next;
        });

        setRootOrder(prev => prev.filter(rootId => rootId !== id));
    }, []);

    const moveBlock = useCallback((dragId: string, hoverId: string, position: 'before' | 'after' | 'inside') => {
        // Complex logic for DnD reordering (Flat structure makes this easier!)
        // Implementation coming in next layout step
    }, []);

    return {
        blocks,
        rootOrder,
        selectedBlockId,
        setSelectedBlockId,
        addBlock,
        updateBlock,
        removeBlock,
        moveBlock
    };
};
