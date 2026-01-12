import React, { useState, useEffect } from 'react';
import { ArrowLeft, PanelLeft, PanelRight } from 'lucide-react';
import type { WidgetBlock, BlockType, ContainerLocation } from './types';
import { WIDGET_SIZES, BLOCK_COSTS } from './constants';
import { getDefaultContent, getLabelByType } from './utils';

// 분리된 컴포넌트 임포트
import LeftSidebar, { type Category } from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Canvas from './components/Canvas';
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { saveWidget, updateWidget } from "./widgetApi.ts";

interface Props {
    onExit: () => void;
    initialData?: any; // 🌟 수정 시 데이터 주입
    onSave?: (savedData: any) => void; // 🌟 저장 완료 콜백 추가
}

const WidgetBuilder: React.FC<Props> = ({ onExit, initialData, onSave }) => {
    const [currentSizeKey, setCurrentSizeKey] = useState<keyof typeof WIDGET_SIZES>('2x2');

    // 🌟 초기 데이터가 있으면 blocks에 로드
    const [blocks, setBlocks] = useState<WidgetBlock[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);


    // 🌟 블록 선택 시 오른쪽 사이드바 자동 열림 (모바일/데스크탑 모두)
    // 🌟 블록 선택 시 오른쪽 사이드바 자동 열림 (모바일/데스크탑 모두)
    useEffect(() => {
        if (selectedBlockId) {
            setIsRightOpen(true);
        } else {
            setIsRightOpen(false); // 선택 해제 시 자동으로 닫음
        }
    }, [selectedBlockId]);
    // 🌟 initialData가 변경되면 상태 동기화 (Edit 모드 버그 수정)
    useEffect(() => {
        if (initialData) {
            // 🌟 Composite Widget(다중 블록) 로드 확인
            if (initialData.type === 'custom-block' && initialData.content?.children) {
                setBlocks(initialData.content.children);
                // 첫 번째 블록 선택 (없으면 null)
                if (initialData.content.children.length > 0) {
                    setSelectedBlockId(initialData.content.children[0].id);
                }
            } else {
                // 단일 블록 로드
                const loadedBlock: WidgetBlock = {
                    id: initialData.id || initialData._id || `blk - ${Date.now()} `,
                    type: initialData.type,
                    content: initialData.content || {},
                    styles: initialData.styles || {}
                };
                setBlocks([loadedBlock]);
                setSelectedBlockId(loadedBlock.id);
            }
        } else {
            // 초기 상태 (빈 캔버스)
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
        if (blocks.length === 0) return;

        // 🌟 다중 블록이면 'custom-block'으로 랩핑하여 저장
        let blockToSave: WidgetBlock;

        // 🌟 수정된 로직: 블록이 1개면 그대로 저장
        // 🌟 항상 'custom-block'으로 통일하여 저장 (데이터 일관성 유지)
        blockToSave = {
            id: `group - ${Date.now()} `,
            type: 'custom-block',
            content: { children: blocks },
            styles: {},
        };

        const defaultName = initialData?.name || (blocks.length > 1 ? 'Composite Widget' : getLabelByType(blockToSave.type));
        const name = prompt("이 위젯을 저장할 이름을 입력하세요:", defaultName);
        if (!name) return;

        try {
            // DB ID 호환성 처리 (_id vs id)
            const targetId = initialData?.id || initialData?._id;
            let result;

            if (targetId) {
                // 수정
                result = await updateWidget(targetId, blockToSave, name);
                alert(`'${name}' 위젯이 업데이트되었습니다! ☁️`);
            } else {
                // 신규 저장
                result = await saveWidget(blockToSave, name);
                alert(`'${name}' 위젯이 서버에 저장되었습니다! ☁️`);
            }

            // 🌟 저장 후 부모에게 알림 (데이터 갱신용)
            if (onSave && result) {
                onSave(result);
            }

        } catch (e) {
            console.error(e);
            alert('저장에 실패했습니다.');
        }
    };

    const [isLeftOpen, setIsLeftOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Category>('text'); // LeftSidebar에 필요한 상태
    const handleRemoveBlock = removeBlock; // Canvas에 필요한 함수
    const handleUpdateBlock = updateBlock; // Canvas, RightSidebar에 필요한 함수
    const handleDragEnd = handleDndKitDragEnd; // Canvas에 필요한 함수
    const handleDragOver = handleDndKitDragOver; // Canvas에 필요한 함수


    return (
        <div className="h-screen bg-[var(--bg-primary)] flex flex-col text-[var(--text-primary)] font-sans transition-colors">
            <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between px-[3%] w-full shadow-md z-20 gap-2">
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <button onClick={onExit} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full transition text-[var(--text-secondary)]">
                        <ArrowLeft size={20} className="max-md:w-5 max-md:h-5" />
                    </button>
                    <h1 className="text-lg font-bold max-md:text-sm whitespace-nowrap">커스텀 위젯</h1>
                </div>
                <div className="flex bg-[var(--bg-card-secondary)] p-1 rounded-lg overflow-x-auto scrollbar-hide flex-shrink min-w-0">
                    {Object.entries(WIDGET_SIZES).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => setCurrentSizeKey(key as any)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap
                                max-md:px-2 max-md:text-[10px] max-md:py-1
                                ${currentSizeKey === key ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} 
                            `}
                        >
                            {val.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <button onClick={handleSaveToCloud} className="px-5 py-2 bg-[var(--btn-bg)] hover:brightness-110 text-[var(--btn-text)] text-sm font-bold rounded-lg transition shadow-lg max-md:px-3 max-md:text-xs whitespace-nowrap">
                        <span className="max-md:hidden">{initialData ? '수정 저장' : '저장하기'}</span>
                        <span className="md:hidden">저장</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* 왼쪽 사이드바 토글 버튼 (중앙 배치 / 모바일: 하단 플로팅) */}
                <button
                    onClick={() => setIsLeftOpen(!isLeftOpen)}
                    className="absolute top-1/2 -translate-y-1/2 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-full shadow-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all duration-300
                        max-md:fixed max-md:left-4 max-md:top-auto max-md:translate-y-0
                    "
                    style={{
                        left: isLeftOpen ? '270px' : '10px',
                        bottom: isLeftOpen ? 'calc(30vh + 10px)' : '20px' // 모바일: 시트 높이(30vh) + 10px / 닫힘: 20px
                    }}
                    title={isLeftOpen ? "왼쪽 사이드바 접기" : "왼쪽 사이드바 펼치기"}
                >
                    {isLeftOpen ? <PanelLeft size={16} /> : <PanelLeft size={16} />}
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0
                    ${isLeftOpen
                        ? 'w-[280px] opacity-100 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:h-[30vh] max-md:z-40 max-md:translate-y-0 max-md:border-t max-md:border-[var(--border-color)] max-md:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'
                        : 'w-0 opacity-0 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:h-[30vh] max-md:translate-y-full max-md:opacity-100 max-md:z-40'
                    }
                `}>
                    <LeftSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onAddBlock={addBlock}
                        remainingCapacity={remainingCapacity}
                    />
                </div>
                <Canvas
                    blocks={blocks}
                    currentSize={currentSize}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onRemoveBlock={handleRemoveBlock}
                    activeContainer={activeContainer}
                    onSetActiveContainer={setActiveContainer}
                    onUpdateBlock={handleUpdateBlock}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                />

                {/* 🌟 모바일용 백드롭 (팝업 뒤 어두운 배경) */}
                {isRightOpen && (
                    <div
                        className="md:hidden fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsRightOpen(false)}
                    />
                )}

                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 
                    ${isRightOpen
                        ? 'w-80 opacity-100 max-md:fixed max-md:top-1/2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:w-[90%] max-md:h-[80%] max-md:z-[100] max-md:rounded-2xl max-md:shadow-2xl max-md:border max-md:border-white/20'
                        : 'w-0 opacity-0 max-md:hidden'}
                `}>
                    <RightSidebar
                        selectedBlock={selectedBlock}
                        onUpdateBlock={handleUpdateBlock}
                        onClose={() => setIsRightOpen(false)}
                    />
                </div>

                {/* 오른쪽 사이드바 토글 버튼 (중앙 배치) - 모바일에서는 숨김 (팝업 오버레이가 덮거나 닫기 버튼으로 대체) */}
                <button
                    onClick={() => setIsRightOpen(!isRightOpen)}
                    className="max-md:hidden absolute top-1/2 -translate-y-1/2 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-full shadow-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all duration-300"
                    style={{ right: isRightOpen ? '310px' : '10px' }}
                    title={isRightOpen ? "오른쪽 사이드바 접기" : "오른쪽 사이드바 펼치기"}
                >
                    {isRightOpen ? <PanelRight size={16} /> : <PanelRight size={16} />}
                </button>
            </div>
        </div>
    );
};

export default WidgetBuilder;
