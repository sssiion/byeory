import React, { useState } from 'react';
import { ArrowLeft, Settings2 } from 'lucide-react';
import type { WidgetBlock, BlockType, ContainerLocation } from './types';
import { WIDGET_SIZES, BLOCK_COSTS } from './constants';
import {getDefaultContent, getLabelByType} from './utils';

// 분리된 컴포넌트 임포트
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Canvas from './components/Canvas';
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import {saveWidget} from "./widgetApi.ts";

interface Props {
    onExit: () => void;
    onSave?: (data: any) => void;
}

const WidgetBuilder: React.FC<Props> = ({ onExit, onSave }) => {
    const [currentSizeKey, setCurrentSizeKey] = useState<keyof typeof WIDGET_SIZES>('2x2');
    const [blocks, setBlocks] = useState<WidgetBlock[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [activeContainer, setActiveContainer] = useState<ContainerLocation>(null);
    const currentSize = WIDGET_SIZES[currentSizeKey];

    // --- Helper Functions ---
    const findBlockRecursive = (items: WidgetBlock[], id: string): WidgetBlock | undefined => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.type === 'columns' && item.content.layout) {
                for (const col of item.content.layout) {
                    const found = findBlockRecursive(col, id);
                    if (found) return found;
                }
            }
        }
        return undefined;
    };

    const getListFromId = (droppableId: string, currentBlocks: WidgetBlock[]): WidgetBlock[] | undefined => {
        if (droppableId === 'ROOT') return currentBlocks;
        if (droppableId.startsWith('COL-')) {
            const splitIndex = droppableId.lastIndexOf('-');
            const blockId = droppableId.substring(4, splitIndex);
            const colIndex = parseInt(droppableId.substring(splitIndex + 1));
            const parentBlock = findBlockRecursive(currentBlocks, blockId);
            if (parentBlock && parentBlock.type === 'columns' && parentBlock.content.layout) {
                return parentBlock.content.layout[colIndex];
            }
        }
        return undefined;
    };

    const selectedBlock = selectedBlockId ? findBlockRecursive(blocks, selectedBlockId) : undefined;

    const calculateCapacity = (items: WidgetBlock[]): number => {
        return items.reduce((sum, block) => {
            let cost = BLOCK_COSTS[block.type] || 1;
            if (block.type === 'columns' && block.content.layout) {
                block.content.layout.forEach((col: WidgetBlock[]) => {
                    cost += calculateCapacity(col);
                });
            }
            return sum + cost;
        }, 0);
    };

    const usedCapacity = calculateCapacity(blocks);
    const remainingCapacity = currentSize.capacity - usedCapacity;

    // --- Handlers ---
    const addBlock = (type: BlockType) => {
        const cost = BLOCK_COSTS[type] || 1;
        if (cost > remainingCapacity) { alert("공간 부족!"); return; }

        const newBlock: WidgetBlock = {
            id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type,
            content: getDefaultContent(type),
            styles: { color: '#1e293b', align: 'left', fontSize: 14 }
        };

        if (activeContainer) {
            setBlocks(prev => {
                const copy = JSON.parse(JSON.stringify(prev));
                const targetListId = `COL-${activeContainer.blockId}-${activeContainer.colIndex}`;
                const targetList = getListFromId(targetListId, copy);
                if (targetList) targetList.unshift(newBlock);
                else copy.unshift(newBlock);
                return copy;
            });
        } else {
            setBlocks([newBlock, ...blocks]);
        }
        setSelectedBlockId(newBlock.id);
    };

    const removeBlock = (id: string) => {
        const filterRecursive = (items: WidgetBlock[]): WidgetBlock[] => {
            return items.filter(item => item.id !== id).map(item => {
                if (item.type === 'columns') {
                    item.content.layout = item.content.layout.map((col: any) => filterRecursive(col));
                }
                return item;
            });
        };
        setBlocks(prev => filterRecursive(prev));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const updateBlock = (id: string, updates: any) => {
        const updateRecursive = (items: WidgetBlock[]): WidgetBlock[] => {
            return items.map(item => {
                if (item.id === id) {
                    if ('color' in updates || 'bgColor' in updates || 'fontSize' in updates || 'align' in updates || 'bold' in updates) {
                        return { ...item, styles: { ...item.styles, ...updates } };
                    }
                    return { ...item, ...updates };
                }
                if (item.type === 'columns') {
                    item.content.layout = item.content.layout.map((col: any) => updateRecursive(col));
                }
                return item;
            });
        };
        setBlocks(prev => updateRecursive(prev));
    };

    const handleSave = () => {
        const widgetData = {
            size: currentSizeKey,
            blocks,
            createdAt: new Date().toISOString(),
        };
        onSave?.(widgetData);
    };

    // --- DnD Helpers (Moved Up) ---
    const getContainerIdFromDroppable = (over: any): string | undefined => {
        return (over?.data?.current?.containerId as string | undefined)
            ?? (typeof over?.id === 'string' ? (over.id as string) : undefined);
    };

    // --- DnD Handlers ---
    const handleDndKitDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const fromContainer = active.data.current?.containerId as string | undefined;
        const toContainer = getContainerIdFromDroppable(over);

        if (!fromContainer || !toContainer) return;
        if (fromContainer === toContainer) return;

        setBlocks((prev) => {
            const draft: WidgetBlock[] = JSON.parse(JSON.stringify(prev));
            const sourceList = getListFromId(fromContainer, draft);
            const destList = getListFromId(toContainer, draft);
            if (!sourceList || !destList) return prev;

            const oldIndex = sourceList.findIndex((b) => b.id === activeId);
            if (oldIndex === -1) return prev;

            const [moved] = sourceList.splice(oldIndex, 1);
            destList.push(moved);

            active.data.current = { ...(active.data.current ?? {}), containerId: toContainer };
            return draft;
        });
    };

    const handleDndKitDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        // setActiveId(null); // ❌ 오류 수정: setActiveId는 Canvas에 있으므로 여기서 호출 안 함
        if (!over) return;

        const activeId = active.id as string;
        const fromContainer = active.data.current?.containerId as string | undefined;
        const toContainer = getContainerIdFromDroppable(over);

        if (!fromContainer || !toContainer) return;

        if (fromContainer === toContainer) {
            setBlocks((prev) => {
                const draft: WidgetBlock[] = JSON.parse(JSON.stringify(prev));
                const list = getListFromId(fromContainer, draft);
                if (!list) return prev;

                const oldIndex = list.findIndex((b) => b.id === activeId);
                if (oldIndex === -1) return prev;

                const overId = over.id as string;
                let newIndex = list.findIndex((b) => b.id === overId);
                if (newIndex === -1) newIndex = list.length - 1;

                const [moved] = list.splice(oldIndex, 1);
                list.splice(newIndex, 0, moved);

                return draft;
            });
        }
        // 드래그가 끝나면 activeContainer 선택 해제 (선택사항)
        // setActiveContainer(null);
    };
    // 🌟 저장 로직 핸들러
    const handleSaveToCloud = async () => {
        if (!selectedBlock) return;

        // 위젯 이름 입력 받기
        const name = prompt("이 위젯을 저장할 이름을 입력하세요:", getLabelByType(selectedBlock.type));
        if (!name) return;

        try {
            await saveWidget(selectedBlock, name);
            alert(`'${name}' 위젯이 서버에 저장되었습니다! ☁️`);
        } catch (e) {
            alert('저장에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-[#1F1F1F] flex flex-col text-slate-200 font-sans">
            <header className="h-16 border-b border-gray-700 bg-[#252525] flex items-center justify-between px-6 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 hover:bg-gray-600 rounded-full transition">
                        <ArrowLeft size={20} className="text-gray-400" />
                    </button>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings2 size={18} className="text-indigo-400"/> 커스텀 위젯 빌더
                    </h1>
                </div>
                <div className="flex bg-gray-800 p-1 rounded-lg">
                    {Object.entries(WIDGET_SIZES).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => setCurrentSizeKey(key as any)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                                currentSizeKey === key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            {val.label}
                        </button>
                    ))}
                </div>
                <button onClick={handleSaveToCloud} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition shadow-lg">
                    저장하기
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <LeftSidebar onAddBlock={addBlock} remainingCapacity={remainingCapacity} />
                <Canvas
                    blocks={blocks}
                    currentSize={currentSize}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onRemoveBlock={removeBlock}
                    usedCapacity={usedCapacity}
                    maxCapacity={currentSize.capacity}
                    activeContainer={activeContainer}
                    onSetActiveContainer={setActiveContainer}
                    onUpdateBlock={updateBlock}
                    onDragEnd={handleDndKitDragEnd}
                    onDragOver={handleDndKitDragOver} // 🆕 추가: DragOver 핸들러 전달
                />
                <RightSidebar
                    selectedBlock={selectedBlock}
                    onUpdateBlock={updateBlock}
                />
            </div>
        </div>
    );
};

export default WidgetBuilder;