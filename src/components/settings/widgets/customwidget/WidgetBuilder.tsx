import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Settings2 } from 'lucide-react';
import type { WidgetBlock, BlockType, ContainerLocation } from './types';
import { WIDGET_SIZES, BLOCK_COSTS } from './constants';
import { getDefaultContent, getLabelByType } from './utils';

// 분리된 컴포넌트 임포트
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Canvas from './components/Canvas';
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { saveWidget, updateWidget } from "./widgetApi.ts";

interface Props {
    onExit: () => void;
    initialData?: any; // 🌟 수정 시 데이터 주입
}

const WidgetBuilder: React.FC<Props> = ({ onExit, initialData }) => {
    const [currentSizeKey, setCurrentSizeKey] = useState<keyof typeof WIDGET_SIZES>('2x2');

    // 🌟 초기 데이터가 있으면 blocks에 로드
    const [blocks, setBlocks] = useState<WidgetBlock[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // 🌟 initialData가 변경되면 상태 동기화 (Edit 모드 버그 수정)
    useEffect(() => {
        if (initialData) {
            const loadedBlock: WidgetBlock = {
                id: initialData.id || initialData._id || `blk-${Date.now()}`,
                type: initialData.type,
                content: initialData.content || {},
                styles: initialData.styles || {}
            };
            setBlocks([loadedBlock]);
            setSelectedBlockId(loadedBlock.id);
        } else {
            // 초기 데이터가 없으면 초기화 (선택적)
            // setBlocks([]);
            // setSelectedBlockId(null);
        }
    }, [initialData]);

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
            id: `blk - ${Date.now()} -${Math.random().toString(36).substr(2, 5)} `,
            type,
            content: getDefaultContent(type),
            styles: { color: '#1e293b', align: 'left', fontSize: 14 }
        };

        if (activeContainer) {
            setBlocks(prev => {
                const copy = JSON.parse(JSON.stringify(prev));
                const targetListId = `COL - ${activeContainer.blockId} -${activeContainer.colIndex} `;
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
                    if ('color' in updates || 'bgColor' in updates || 'fontSize' in updates || 'align' in updates || 'bold' in updates || 'italic' in updates || 'underline' in updates || 'strikethrough' in updates) {
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
    };

    // 🌟 저장 로직 핸들러
    const handleSaveToCloud = async () => {
        if (!selectedBlock) return;

        const defaultName = initialData?.name || getLabelByType(selectedBlock.type);
        const name = prompt("이 위젯을 저장할 이름을 입력하세요:", defaultName);
        if (!name) return;

        try {
            // DB ID 호환성 처리 (_id vs id)
            const targetId = initialData?.id || initialData?._id;

            if (targetId) {
                // 수정
                await updateWidget(targetId, selectedBlock, name);
                alert(`'${name}' 위젯이 업데이트되었습니다! ☁️`);
            } else {
                // 신규 저장
                await saveWidget(selectedBlock, name);
                alert(`'${name}' 위젯이 서버에 저장되었습니다! ☁️`);
            }
        } catch (e) {
            alert('저장에 실패했습니다.');
        }
    };

    // 🌟 테마 적용 (bg-white / dark:bg-[#1F1F1F] 등)
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col text-[var(--text-primary)] font-sans transition-colors">
            <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between px-6 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full transition text-[var(--text-secondary)]">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Settings2 size={18} className="text-indigo-400" /> 커스텀 위젯 빌더
                    </h1>
                </div>
                <div className="flex bg-[var(--bg-card-secondary)] p-1 rounded-lg">
                    {Object.entries(WIDGET_SIZES).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => setCurrentSizeKey(key as any)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${currentSizeKey === key ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {val.label}
                        </button>
                    ))}
                </div>
                <button onClick={handleSaveToCloud} className="px-5 py-2 bg-[var(--btn-bg)] hover:brightness-110 text-[var(--btn-text)] text-sm font-bold rounded-lg transition shadow-lg">
                    {initialData ? '수정 저장' : '저장하기'}
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
                    onDragOver={handleDndKitDragOver}
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
