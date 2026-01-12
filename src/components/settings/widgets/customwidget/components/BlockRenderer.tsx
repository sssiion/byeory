import React, { useEffect } from 'react';
import type { WidgetBlock, ContainerLocation } from '../types';
import {
    Check,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    EyeOff, Eye, Info, AlertTriangle, XCircle, CheckCircle, Star, Heart, Zap, ThumbsUp, Database
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { RotateCw } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/drop/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useDroppable } from '@dnd-kit/core';
import ColumnSortableItem from "./Rendercomponent/ColumnSortableItem.tsx";
import HeatmapWidget from "./Rendercomponent/HeatmapWidget.tsx";
import BookInfoWidget from "./Rendercomponent/BookInfoWidget.tsx";
import MovieTicketWidget from "./Rendercomponent/MovieTicketWidget.tsx";
import UnitConverterWidget from "./Rendercomponent/UnitConverterWidget.tsx";
import LinkBookmarkWidget from "./Rendercomponent/LinkBookmarkWidget.tsx";

import {
    addEdge, applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    type Edge,
    type EdgeChange,
    type NodeChange,
    type Node,
    type Connection, // 🌟 Import Connection from @xyflow/react
    ReactFlow
} from "@xyflow/react";
// import type { Connection } from "puppeteer"; // 🚨 Remove this incorrect import
import PdfDropViewer from "./Rendercomponent/PdfDropViewer.tsx";
import { EditableText } from "./EditableText";

interface RendererProps {
    block: WidgetBlock;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
    onUpdateBlock: (id: string, updates: any) => void; // ✅ 필수
}


// --- Helper Components (Defined before BlockRenderer to avoid usage-before-declaration) ---
const ToggleItem = ({ block, onUpdateBlock, style }: any) => {
    const { content } = block;
    const [isOpen, setIsOpen] = useState(false);
    const items = content.items || [];

    // 리스트 아이템 개별 수정 헬퍼 함수
    const handleItemUpdate = (index: number, newVal: string) => {
        const newItems = [...items];
        newItems[index] = newVal;
        onUpdateBlock(block.id, { content: { ...content, items: newItems } });
    };

    return (
        <div className="w-full h-full">
            {/* 헤더 영역 */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-0.5 rounded select-none group"
            >
                <div className="text-gray-400 group-hover:text-gray-600">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                {/* 🌟 제목을 EditableText로 변경 */}
                <div className="flex-1 min-w-0 font-bold">
                    <EditableText
                        tagName="span"
                        text={content.title}
                        onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, title: val } })}
                        style={style}
                        className="truncate" // 말줄임 처리
                        placeholder="토글 제목"
                    />
                </div>
            </div>

            {/* 펼쳐진 내용 */}
            {isOpen && (
                <ul className="pl-6 mt-1 list-disc text-gray-600 space-y-1">
                    {items.map((it: string, i: number) => (
                        <li key={i} style={{ fontSize: '0.9em' }} className="break-words pl-1 flex items-center">
                            {/* 🌟 텍스트와 불릿 정렬 개선 */}
                            {/* 🌟 리스트 아이템도 EditableText로 변경 */}
                            <EditableText
                                tagName="span"
                                text={it}
                                onUpdate={(val) => handleItemUpdate(i, val)}
                                style={{ ...style, fontWeight: 'normal' }} // 본문은 굵기 빼기
                                placeholder={`항목 ${i + 1}`}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
const AccordionItem = ({ block, onUpdateBlock, style }: any) => {
    const { content } = block;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
            <div
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="bg-gray-50 p-1 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
            >
                {/* 제목 수정 */}
                <div className="flex-1 min-w-0 font-bold text-gray-800">
                    <EditableText
                        tagName="span"
                        text={content.title}
                        onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, title: val } })}
                        style={style}
                        className="truncate"
                        placeholder="아코디언 제목"
                    />
                </div>
                <div className="text-gray-500 ml-2">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
            </div>

            {/* 본문 수정 */}
            {isOpen && (
                <div className="p-1 text-sm border-t border-gray-100 bg-white text-gray-600 leading-relaxed break-words h-full">
                    <EditableText
                        tagName="p"
                        text={content.body}
                        onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, body: val } })}
                        style={style}
                        className="whitespace-pre-wrap"
                        placeholder="내용을 입력하세요..."
                    />
                </div>
            )}
        </div>
    );
};

// 🌟 2. 스포일러 수정: 내용 수정 가능하게 변경
const SpoilerItem = ({ block, onUpdateBlock, style }: any) => {
    const { content } = block;
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div
            onClick={() => setIsRevealed(!isRevealed)}
            className={`h-full w-full relative p-1 rounded-lg border transition-all cursor-pointer group select-none flex flex-col
                ${isRevealed
                    ? 'bg-gray-50 border-gray-200 text-gray-800'
                    : 'bg-gray-900 border-gray-800 text-transparent hover:bg-gray-800'
                }
            `}
            style={style}
        >
            <div className={`break-words w-full h-full ${isRevealed ? '' : 'blur-sm select-none pointer-events-none'}`}>
                {/* 공개되었을 때만 편집 가능하도록 함 */}
                {isRevealed ? (
                    <EditableText
                        tagName="p"
                        text={content.text}
                        onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                        style={style}
                        placeholder="스포일러 내용"
                    />
                ) : (
                    <p>{content.text || '스포일러 내용'}</p>
                )}
            </div>

            {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-gray-400 font-medium">
                    <EyeOff size={18} />
                    <span className="text-sm">스포일러 (클릭해서 보기)</span>
                </div>
            )}
            {isRevealed && (
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                    <Eye size={14} />
                </div>
            )}
        </div>
    );
};

const TypingTextItem = ({ content, style }: any) => {
    const [displayedText, setDisplayedText] = useState('');
    const fullText = content.text || '';
    const speed = content.speed || 100;
    const isBackspaceMode = content.isBackspaceMode || false;

    useEffect(() => {
        // @ts-ignore
        let timeoutId: NodeJS.Timeout;
        let currentText = '';
        let isDeleting = true;

        const animate = () => {
            const currentLen = currentText.length;
            if (isDeleting) {
                currentText = fullText.substring(0, currentLen - 1);
                setDisplayedText(currentText);
                if (currentText.length === 0) {
                    isDeleting = false;
                    timeoutId = setTimeout(animate, 500);
                } else {
                    timeoutId = setTimeout(animate, speed / 2);
                }
            }
            else {
                currentText = fullText.substring(0, currentLen + 1);
                setDisplayedText(currentText);
                if (currentText.length === fullText.length) {
                    if (isBackspaceMode) {
                        isDeleting = true;
                        timeoutId = setTimeout(animate, 2000);
                    } else {
                        timeoutId = setTimeout(() => {
                            currentText = '';
                            setDisplayedText('');
                            animate();
                        }, 2000);
                    }
                } else {
                    timeoutId = setTimeout(animate, speed);
                }
            }
        };
        animate();
        return () => clearTimeout(timeoutId);
    }, [fullText, speed, isBackspaceMode]);

    return (
        <div style={style} className="h-full w-full min-h-[1.5em] font-mono break-all">
            {displayedText}
            <span className="animate-pulse border-r-2 border-indigo-500 ml-1 align-middle h-4 inline-block"></span>
        </div>
    );
};

function DroppableColumn({
    id,
    onClick,
    children,
}: {
    id: string; // columnContainerId
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { containerId: id, isContainer: true },
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={`flex flex-col gap-1 w-full min-h-[50px] rounded-lg border-2 border-transparent p-1 relative transition-all
        ${isOver ? 'border-indigo-400 bg-indigo-50/30' : 'hover:border-gray-300 hover:bg-gray-50/50'}`}
        >
            {children}
        </div>
    );
}

const RadarChartItem = ({ content, style, styles }: any) => {
    const data = content.data || [];
    const count = data.length;

    if (count < 3) return <div className="text-gray-400 text-xs p-4 text-center">데이터 부족</div>;
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const maxValue = 100;

    const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (r * Math.cos(angleInRadians)),
            y: centerY + (r * Math.sin(angleInRadians))
        };
    };

    const angleSlice = 360 / count;
    const gridLevels = [20, 40, 60, 80, 100];
    const gridPolygons = gridLevels.map((level) => {
        const r = (radius * level) / 100;
        const points = data.map((_: any, i: number) => {
            const { x, y } = polarToCartesian(center, center, r, i * angleSlice);
            return `${x},${y}`;
        }).join(' ');
        return <polygon key={level} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
    });

    const axes = data.map((item: any, i: number) => {
        const { x, y } = polarToCartesian(center, center, radius, i * angleSlice);
        return (
            <g key={i}>
                <line x1={center} y1={center} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                {content.showLabels !== false && (
                    <text
                        x={x * 1.15 - center * 0.15}
                        y={y * 1.15 - center * 0.15}
                        dy="0.35em"
                        textAnchor="middle"
                        className="text-[10px] fill-gray-500 font-bold"
                        style={{ fontSize: '10px' }}
                    >
                        {item.label}
                    </text>
                )}
            </g>
        );
    });

    const dataPoints = data.map((item: any, i: number) => {
        const val = Math.min(Math.max(item.value, 0), maxValue);
        const r = (radius * val) / maxValue;
        const { x, y } = polarToCartesian(center, center, r, i * angleSlice);
        return `${x},${y}`;
    }).join(' ');

    const chartColor = styles.color || '#6366f1';

    return (
        <div style={style} className="h-full w-full flex justify-center items-center p-0 bg-white rounded-lg border border-gray-100">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="max-w-[250px] aspect-square overflow-visible">
                {gridPolygons}
                {axes}
                <polygon points={dataPoints} fill={chartColor} fillOpacity="0.3" stroke={chartColor} strokeWidth="2" />
                {data.map((item: any, i: number) => {
                    const val = Math.min(Math.max(item.value, 0), maxValue);
                    const r = (radius * val) / maxValue;
                    const { x, y } = polarToCartesian(center, center, r, i * angleSlice);
                    return <circle key={i} cx={x} cy={y} r="3" fill={chartColor} />;
                })}
            </svg>
        </div>
    );
};

const RatingItem = ({ block, onUpdateBlock }: any) => {
    const { content, styles, id } = block;
    const value = content.value || 0;
    const max = content.max || 5;
    const iconType = content.icon || 'star';

    const IconComponent = {
        star: Star,
        heart: Heart,
        zap: Zap,
        thumb: ThumbsUp
    }[iconType as string] || Star;

    const handleClick = (idx: number) => {
        if (onUpdateBlock) {
            onUpdateBlock(id, { content: { ...content, value: idx + 1 } });
        }
    };

    return (
        <div
            style={{
                justifyContent: styles.align === 'center' ? 'center' : styles.align === 'right' ? 'flex-end' : 'flex-start',
                ...styles
            }}
            className="flex items-center gap-1 w-full h-full min-h-[40px]"
        >
            {Array.from({ length: max }).map((_, i) => {
                const isActive = i < value;
                return (
                    <div
                        key={i}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick(i);
                        }}
                        className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                        <IconComponent
                            size={styles.fontSize ? Number(styles.fontSize) + 4 : 24}
                            fill={isActive ? (styles.color || '#F59E0B') : 'none'}
                            stroke={isActive ? (styles.color || '#F59E0B') : '#d1d5db'}
                            strokeWidth={isActive ? 0 : 2}
                            className={isActive ? 'text-transparent' : 'text-gray-300'}
                            style={{
                                stroke: isActive ? 'none' : (styles.color ? styles.color : '#d1d5db'),
                                fill: isActive ? (styles.color || '#F59E0B') : 'none'
                            }}
                        />
                    </div>
                );
            })}
            <span className="ml-2 text-sm font-bold text-gray-500">
                {value}/{max}
            </span>
        </div>
    );
};


const BlockRenderer: React.FC<RendererProps> = (props) => {
    const { block, onSelectBlock, onSetActiveContainer, onUpdateBlock, selectedBlockId } = props;
    const { styles, content, type } = block;
    const { block: _unusedBlock, ...otherProps } = props;
    const layout = block.layout || { w: '100%', h: 'auto' };
    // 🌟 모든 위젯에 공통으로 적용될 "꽉 채우기" 스타일
    // h-full w-full을 강제하여 리사이징된 부모 크기를 따라가게 함
    const fullSizeStyle = "w-full h-full flex flex-col";
    const textDecoration = [
        styles.underline ? 'underline' : '',
        styles.strikethrough ? 'line-through' : ''
    ].filter(Boolean).join(' ');

    const commonStyle = {
        color: styles.color,
        backgroundColor: styles.bgColor,
        fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
        textAlign: styles.align as any,
        fontWeight: styles.bold ? 'bold' : 'normal',
        fontStyle: styles.italic ? 'italic' : 'normal',
        textDecoration: textDecoration || undefined,
    };
    // 🌟 [중요] 해당 블록이 선택되었는지 확인 (선택된 블록만 리사이징 핸들 표시)
    const isSelected = selectedBlockId === block.id;
    // --- 🔥 컬럼(Columns) 렌더링 로직 (dnd-kit로 변경) ---
    if (type === 'columns') {
        const layout: WidgetBlock[][] = content.layout || [[], []];
        // 🌟 [Resizable] 컬럼 너비 배열 (퍼센트) 가져오기. 없으면 균등 분배.
        const defaultWidths = layout.map(() => 100 / layout.length);
        const columnWidths: number[] = content.columnWidths || defaultWidths;

        // 리사이징 관련 상태 (Ref로 관리하여 리렌더링 최소화)
        const isResizingRef = React.useRef<{ index: number; startX: number; startWidths: number[]; containerWidth: number } | null>(null);

        const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
            e.preventDefault();
            e.stopPropagation();

            // 부모 컨테이너(Row)의 너비를 구함
            // handle(e.currentTarget) -> wrapper -> fragment?? (loop) -> container
            // 구조: div(flex relative) -> [ {div(col)}, {div(handle)}, ... ]
            // 핸들의 부모는 div.flex.relative (= row container)
            const container = e.currentTarget.parentElement as HTMLElement;
            const containerWidth = container?.clientWidth || 0;

            if (!containerWidth) return;

            isResizingRef.current = {
                index,
                startX: e.clientX,
                startWidths: [...columnWidths],
                containerWidth,
            };

            const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!isResizingRef.current) return;
                moveEvent.preventDefault(); // 스크롤/선택 방지

                const { index, startX, startWidths, containerWidth } = isResizingRef.current;

                const deltaX = moveEvent.clientX - startX;
                const deltaPercent = (deltaX / containerWidth) * 100;

                const newWidths = [...startWidths];
                // 왼쪽 컬럼 늘리기/줄이기
                newWidths[index] = Math.max(5, Math.min(95, startWidths[index] + deltaPercent));
                // 오른쪽 컬럼은 반대로
                newWidths[index + 1] = Math.max(5, Math.min(95, startWidths[index + 1] - deltaPercent));

                onUpdateBlock(block.id, {
                    content: { ...content, columnWidths: newWidths }
                });
            };

            const handleMouseUp = () => {
                isResizingRef.current = null;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }, [block.id, content, columnWidths, onUpdateBlock]);

        return (
            <div className="flex w-full h-full relative"> {/* gap 제거 */}
                {layout.map((colBlocks, index) => {
                    const columnContainerId = `COL-${block.id}-${index}`;
                    const widthPercent = columnWidths[index] || (100 / layout.length);

                    return (
                        <React.Fragment key={index}>
                            <div
                                style={{ width: `${widthPercent}%` }}
                                className="flex flex-col h-full min-w-[20px] transition-[width] duration-75 relative bg-white/50" // bg추가
                            >
                                <DroppableColumn
                                    id={columnContainerId}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetActiveContainer({ blockId: block.id, colIndex: index });
                                        onSelectBlock(null);
                                    }}
                                >
                                    <div className="w-full h-full"> {/* 내부 패딩 제거 (p-1 제거) */}
                                        <SortableContext items={colBlocks.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                            <div className="relative z-10 flex flex-col gap-0 w-full min-h-[50px]"> {/* gap-2 -> gap-0 */}
                                                {colBlocks.map((child) => (
                                                    <ColumnSortableItem
                                                        key={child.id}
                                                        child={child}
                                                        columnContainerId={columnContainerId}
                                                        selectedBlockId={props.selectedBlockId}
                                                        onSelectBlock={props.onSelectBlock}
                                                        onRemoveBlock={props.onRemoveBlock}
                                                        activeContainer={props.activeContainer}
                                                        onSetActiveContainer={props.onSetActiveContainer}
                                                        onUpdateBlock={props.onUpdateBlock}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </div>
                                </DroppableColumn>
                            </div>

                            {/* 리사이즈 핸들 (마지막 컬럼 제외) */}
                            {index < layout.length - 1 && (
                                <div
                                    className="w-[4px] -ml-[2px] -mr-[2px] z-50 cursor-col-resize hover:bg-indigo-400 active:bg-indigo-600 transition-colors h-full flex items-center justify-center group/handle"
                                    onMouseDown={(e) => handleMouseDown(e, index)}
                                >
                                    {/* 시각적 가이드 라인 (항상 표시로 설정) */}
                                    <div className="w-[1px] h-full bg-gray-200 group-hover/handle:bg-indigo-400 group-active/handle:bg-indigo-600" />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }

    // 🌟 [NEW] Composite Widget (Custom Block) Rendering
    if (type === 'custom-block') {
        const children = (content.children || []) as WidgetBlock[];
        return (
            <div className="flex flex-col gap-2 w-full h-full">
                {children.map((childBlock) => (
                    <BlockRenderer
                        key={childBlock.id}
                        {...props}
                        block={childBlock}
                        onUpdateBlock={(childId, childUpdates) => {
                            const targetChild = children.find(c => c.id === childId);
                            if (!targetChild) return;

                            const mergedChild = { ...targetChild };
                            if (childUpdates.content) mergedChild.content = { ...mergedChild.content, ...childUpdates.content };
                            if (childUpdates.styles) mergedChild.styles = { ...mergedChild.styles, ...childUpdates.styles };

                            Object.keys(childUpdates).forEach(k => {
                                if (k !== 'content' && k !== 'styles') {
                                    (mergedChild as any)[k] = childUpdates[k];
                                }
                            });

                            const finalChildren = children.map(c => c.id === childId ? mergedChild : c);

                            onUpdateBlock(block.id, {
                                content: {
                                    ...content,
                                    children: finalChildren
                                }
                            });
                        }}
                    />
                ))}
            </div>
        );
    }

    // 🌟 [추가] 리스트 업데이트 헬퍼 함수
    const handleListUpdate = (items: string[], index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onUpdateBlock(block.id, { content: { ...content, items: newItems } });
    };

    const renderWidgetContent = () => {
        switch (type) {
            // --- 1. 텍스트류 (긴 텍스트 줄바꿈 처리) ---
            case 'heading1':
                return (
                    <div className="h-full w-full flex flex-col justify-center">
                        <EditableText
                            tagName="h1"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={commonStyle}
                            // 🌟 [수정] mb-2, border-b, pb-1 제거 -> 여백 없이 딱 맞게
                            className="text-2xl font-bold break-words leading-none m-0 p-0 block"
                            placeholder="Heading 1"
                        />
                    </div>
                );
            case 'heading2':
                return (
                    <div className="h-full w-full flex flex-col justify-center">
                        <EditableText
                            tagName="h2"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={commonStyle}
                            // 🌟 [수정] mb-1, mt-2 제거 -> 여백 없이 딱 맞게
                            className="text-xl font-bold break-words leading-none m-0 p-0 block"
                            placeholder="Heading 2"
                        />
                    </div>
                );
            case 'heading3':
                return (
                    <div className="h-full w-full overflow-hidden flex flex-col justify-center">
                        <EditableText
                            tagName="h3"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={commonStyle}
                            // 🌟 [수정] mb-1 제거
                            className="text-lg font-semibold break-words leading-none m-0 p-0 block"
                            placeholder="Heading 3"
                        />
                    </div>
                );
            case 'text':
                return (
                    <div className="h-full w-full flex flex-col justify-center">
                        <EditableText
                            tagName="p"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={commonStyle}
                            // 🌟 [수정] leading-relaxed(줄간격 넓게)를 제거하거나 leading-normal/none으로 변경
                            className="whitespace-pre-wrap break-words leading-snug m-0 p-0 block"
                            placeholder="텍스트를 입력하세요..."
                        />
                    </div>
                );
            case 'quote':
                return (
                    <div style={{ ...commonStyle, borderLeftColor: styles.color || '#333' }} className="h-full border-l-4 pl-1 py-0 my-0 text-gray-600 italic bg-gray-50 rounded-r break-words flex flex-col justify-center">
                        <EditableText
                            tagName="div"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={{ ...commonStyle, fontStyle: 'italic' }} // Force italic visual
                            className="leading-none m-0 p-0 block" // 🌟 [수정] h-full 제거됨에 따라 자연스럽게 content fit
                            placeholder="인용문을 입력하세요..."
                        />
                    </div>
                );
            case 'book-info':
                return <BookInfoWidget block={block} />;
            case 'movie-ticket':
                return <MovieTicketWidget block={block} onUpdateBlock={onUpdateBlock} />;
            case 'link-bookmark':
                return <LinkBookmarkWidget block={block} onUpdateBlock={onUpdateBlock} />;
            case 'mindmap': {
                const content0 = (content || {}) as any;
                const nodes = (content0.nodes || []) as Node[];
                const edges = (content0.edges || []) as Edge[];
                const selectedNodeId = (content0.selectedNodeId ?? null) as string | null;

                const setContent = (patch: any) => {
                    props.onUpdateBlock(block.id, {
                        content: {
                            ...content0,
                            ...patch,
                        },
                    });
                };

                const onNodesChange = useCallback(
                    (changes: NodeChange[]) => {
                        setContent({ nodes: applyNodeChanges(changes, nodes) });
                    },
                    [nodes]
                );

                const onEdgesChange = useCallback(
                    (changes: EdgeChange[]) => {
                        setContent({ edges: applyEdgeChanges(changes, edges) });
                    },
                    [edges]
                );

                const onConnect = useCallback(
                    (connection: Connection) => {
                        const edge = { ...connection, id: `mm-e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` } as Edge;
                        const nextEdges = addEdge(edge, edges);
                        setContent({ edges: nextEdges });
                    },
                    [edges]
                );

                const addNode = () => {
                    const newId = `mm-n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                    const newNode: Node = {
                        id: newId,
                        type: 'mindmap',
                        position: { x: 40 * nodes.length, y: 40 * nodes.length },
                        data: { label: 'New Node' },
                    };

                    setContent({
                        nodes: [...nodes, newNode],
                        selectedNodeId: newId,
                    });
                };

                const deleteSelectedNode = () => {
                    if (!selectedNodeId) return;
                    const nextNodes = nodes.filter((n) => n.id !== selectedNodeId);
                    const nextEdges = edges.filter(
                        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
                    );
                    setContent({ nodes: nextNodes, edges: nextEdges, selectedNodeId: null });
                };

                const updateSelectedLabel = (label: string) => {
                    if (!selectedNodeId) return;
                    setContent({
                        nodes: nodes.map((n) =>
                            n.id === selectedNodeId ? { ...n, data: { ...(n.data as any), label } } : n
                        ),
                    });
                };

                return (
                    <div
                        className="w-full h-full rounded-lg border border-gray-200 bg-white overflow-hidden"
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        onMouseDownCapture={(e) => e.stopPropagation()}
                        onTouchStartCapture={(e) => e.stopPropagation()}
                    >
                        <div className="px-3 py-2 text-[11px] text-gray-500 border-b bg-gray-50 flex items-center justify-between gap-2">
                            <span className="font-bold truncate">Mind Map</span>
                            <div className="flex gap-2">
                                <button
                                    className="text-xs font-bold text-indigo-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addNode();
                                    }}
                                >
                                    + Node
                                </button>
                                <button
                                    className="text-xs font-bold text-red-500 disabled:opacity-40"
                                    disabled={!selectedNodeId}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSelectedNode();
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* 뷰어 영역 */}
                        <div style={{ height: 360 }}>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onNodeClick={(_, node) => setContent({ selectedNodeId: node.id })}
                                fitView
                            >
                                <Controls showInteractive={false} />
                                <Background />
                            </ReactFlow>
                        </div>

                        {/* 빠른 편집(선택된 노드 라벨) */}
                        <div className="p-3 border-t bg-white">
                            <div className="text-[11px] text-gray-500 mb-1">Selected node</div>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="노드를 선택하세요"
                                value={
                                    selectedNodeId
                                        ? ((nodes.find((n) => n.id === selectedNodeId)?.data as any)?.label ?? '')
                                        : ''
                                }
                                disabled={!selectedNodeId}
                                onChange={(e) => updateSelectedLabel(e.target.value)}
                            />
                        </div>
                    </div>
                );
            }
            // --- 2. 할 일 목록 ---
            case 'todo-list':
                return (
                    <div className="space-y-0.5 w-full h-full">
                        {(content.items || []).map((it: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 group">
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newItems = [...(content.items || [])];
                                        newItems[i] = { ...newItems[i], done: !newItems[i].done };
                                        onUpdateBlock(block.id, { content: { ...content, items: newItems } });
                                    }}
                                    className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${it.done ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-400 bg-white'}`}
                                >
                                    {it.done && <Check size={10} strokeWidth={4} />}
                                </div>
                                {/* 할 일 텍스트도 수정 가능하게 변경 */}
                                <div className="flex-1 min-w-0">
                                    <EditableText
                                        tagName="span"
                                        text={it.text}
                                        onUpdate={(val) => {
                                            const newItems = [...(content.items || [])];
                                            newItems[i] = { ...newItems[i], text: val };
                                            onUpdateBlock(block.id, { content: { ...content, items: newItems } });
                                        }}
                                        style={{ ...commonStyle, textDecoration: it.done ? 'line-through' : 'none', color: it.done ? '#9ca3af' : styles.color }}
                                        className="text-sm break-words"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            // --- 3. 원형 차트 ---
            case 'chart-pie': {
                const data = content.data || [];
                const total = data.reduce((acc: number, cur: any) => acc + cur.value, 0);

                // 1. 그라데이션 계산
                let currentDeg = 0;
                const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'];
                const gradientParts = data.map((item: any, i: number) => {
                    const deg = (item.value / total) * 360;
                    const part = `${colors[i % colors.length]} ${currentDeg}deg ${currentDeg + deg}deg`;
                    currentDeg += deg;
                    return part;
                }).join(', ');

                // 2. 가로/세로 방향 결정
                const direction = content.layoutDirection || 'col';
                const isRow = direction === 'row';

                // 3. 방향 토글 핸들러
                const toggleDirection = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onUpdateBlock(block.id, {
                        content: { ...content, layoutDirection: isRow ? 'col' : 'row' }
                    });
                };

                return (
                    <div className="relative w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-2 group">

                        {/* A. 배치 전환 버튼 */}
                        <button
                            onClick={toggleDirection}
                            className="absolute top-1 right-1 z-20 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={isRow ? "세로로 보기" : "가로로 보기"}
                        >
                            <RotateCw size={12} />
                        </button>

                        {/* B. 메인 컨테이너 */}
                        <div className={`w-full h-full flex ${isRow ? 'flex-row' : 'flex-col'} gap-2 overflow-hidden`}>

                            {/* C. 차트 영역 (핵심 수정)
                           flex-1: 공간 차지
                           min-h-0, min-w-0: 부모가 줄어들 때 같이 줄어들도록 허용 (안 줄어드는 버그 해결)
                           items-center justify-center: 중앙 정렬
                        */}
                            <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center w-full">
                                {/* 원 그리기
                               aspect-square: 1:1 비율 고정 (타원 방지)
                               h-full w-auto: 높이에 맞춤 (또는 상황에 따라 가로에 맞춤)
                               max-w-full max-h-full: 부모 넘침 방지
                            */}
                                <div
                                    className="aspect-square relative rounded-full shadow-inner flex-shrink-0"
                                    style={{
                                        background: `conic-gradient(${gradientParts || '#ddd 0deg 360deg'})`,
                                        height: '100%',     // 높이를 부모에 꽉 채움
                                        width: 'auto',      // 너비는 비율에 따라 자동
                                        maxHeight: '100%',  // 높이 제한
                                        maxWidth: '100%',   // 너비 제한
                                    }}
                                >
                                    {/* 가운데 구멍 (도넛 모양) */}
                                    <div className="absolute inset-[25%] bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                                        Total
                                    </div>
                                </div>
                            </div>

                            {/* D. 범례 영역 */}
                            <div className={`
                            flex-shrink-0 
                            flex ${isRow ? 'flex-col justify-center max-w-[40%]' : 'flex-row flex-wrap content-center justify-center max-h-[40%]'} 
                            gap-1 overflow-auto scrollbar-hide
                        `}>
                                {data.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-1 min-w-0 flex-shrink-0 max-w-full" title={`${item.label}: ${Math.round((item.value / total) * 100)}%`}>
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }}></span>
                                        <span className="text-[10px] text-gray-600 truncate">
                                            {item.label}
                                            <span className="font-bold ml-1 text-gray-900">{Math.round((item.value / total) * 100)}%</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }
            // --- 4. 막대 차트 ---
            case 'chart-bar': {
                const data = content.data || [];
                const max = Math.max(...data.map((d: any) => d.value), 1);
                const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'];
                return (
                    <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-full h-full flex items-end justify-between gap-1 overflow-hidden">
                        {data.map((item: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group h-full justify-end min-w-0">
                                {/* 막대 높이는 %이므로 부모가 커지면 같이 길어짐 */}
                                <div className="w-full rounded-t-sm transition-all relative" style={{ height: `${(item.value / max) * 100}%`, backgroundColor: colors[i % colors.length] }}></div>
                                <span className="text-[10px] text-gray-500 truncate w-full text-center">{item.label}</span>
                            </div>
                        ))}
                    </div>
                )
            }
            // --- 5. D-Day ---
            case 'counter': {
                const targetDate = new Date(content.date);
                const today = new Date();
                const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const dDay = diff > 0 ? `D-${diff}` : diff === 0 ? 'D-Day' : `D+${Math.abs(diff)}`;
                return (
                    <div style={{ backgroundColor: styles.bgColor || '#eff6ff' }} className="p-3 rounded-lg flex flex-col justify-center items-center gap-2 overflow-hidden w-full h-full text-center">
                        <div className="min-w-0">
                            <div className="text-[10px] text-gray-500 font-bold uppercase truncate flex items-center gap-1"><CalendarDays size={10} /> {content.title}</div>
                            <div className="text-[10px] text-gray-400 truncate">{content.date}</div>
                        </div>
                        <div className="text-xl font-black text-indigo-600 whitespace-nowrap">{dDay}</div>
                    </div>
                );
            }
            // --- 6. 구분선 ---
            case 'divider': return <div className="w-full h-full py-2"><hr className="border-t border-gray-200" style={{ borderColor: styles.color }} /></div>;
            // --- 7. 리스트류 ---
            case 'bullet-list': return (
                <ul style={commonStyle} className="w-full h-full list-disc list-outside ml-5 space-y-1 text-gray-800 flex flex-col justify-center">
                    {(content.items || []).map((it: string, i: number) => (
                        <li key={i} className="break-words pl-1">
                            <EditableText
                                tagName="span"
                                text={it}
                                onUpdate={(val) => handleListUpdate(content.items || [], i, val)}
                                style={commonStyle}
                                placeholder={`항목 ${i + 1}`}
                                className="block"
                            />
                        </li>
                    ))}
                </ul>
            );
            case 'number-list':
                return (
                    <ol style={commonStyle} className="w-full h-full list-decimal list-outside ml-5 space-y-1 text-gray-800 flex flex-col justify-center">
                        {(content.items || []).map((it: string, i: number) => (
                            <li key={i} className="break-words pl-1">
                                <EditableText
                                    tagName="span"
                                    text={it}
                                    onUpdate={(val) => handleListUpdate(content.items || [], i, val)}
                                    style={commonStyle}
                                    placeholder={`항목 ${i + 1}`}
                                    className="block"
                                />
                            </li>
                        ))}
                    </ol>
                );
            // --- 8. 인용문 (Quote) ---

            // --- 8. 토글 목록 ---
            case 'toggle-list':
                return (
                    <ToggleItem
                        block={block}
                        onUpdateBlock={onUpdateBlock}
                        style={commonStyle}
                    />
                );
            // --- 9. 아코디언 ---
            case 'accordion': return (
                <AccordionItem
                    block={block} // title, body 대신 block 전체 전달
                    onUpdateBlock={onUpdateBlock}
                    style={commonStyle}
                />
            );
            case 'callout': {
                const calloutType = content.type || 'info';
                // @ts-ignore
                const configMap = {
                    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info size={20} className="text-blue-500" /> },
                    warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: <AlertTriangle size={20} className="text-orange-500" /> },
                    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <XCircle size={20} className="text-red-500" /> },
                    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <CheckCircle size={20} className="text-green-500" /> }
                };
                const config = configMap[calloutType as keyof typeof configMap] || configMap.info;

                return (
                    // 🌟 [수정] h-full, items-center (아이콘/텍스트 수직 중앙 정렬)
                    <div className={`h-full w-full p-1 rounded-lg border flex items-center gap-1 ${config.bg} ${config.border} break-words`}>
                        <div className="flex-shrink-0">{config.icon}</div> {/* mt-0.5 제거 */}
                        <div className="flex flex-col min-w-0 flex-1 justify-center"> {/* justify-center 추가 */}
                            {/* 제목 수정 */}
                            <div className={`font-bold mb-0 leading-none ${config.text}`}> {/* mb-0.5 제거, leading-none */}
                                <EditableText
                                    tagName="span"
                                    text={content.title}
                                    onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, title: val } })}
                                    className="leading-none m-0 p-0 block" // 🌟 [수정]
                                    placeholder="제목 (선택)"
                                />
                            </div>
                            {/* 내용 수정 */}
                            <div className="text-gray-700 leading-none text-sm"> {/* leading-tight -> leading-none */}
                                <EditableText
                                    tagName="p"
                                    text={content.text}
                                    onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                                    className="leading-none m-0 p-0 block" // 🌟 [수정]
                                    placeholder="내용을 입력하세요..."
                                />
                            </div>
                        </div>
                    </div>
                );
            }
            // 🌟 2. 형광펜 강조 (Highlight)
            case 'highlight':
                return (
                    <div style={commonStyle} className="h-full w-full leading-relaxed flex flex-col justify-center">
                        <span
                            className="px-2 py-1 rounded box-decoration-clone block w-fit" // w-fit 추가하여 배경색이 텍스트만큼만
                            style={{ backgroundColor: styles.bgColor || '#fef08a' }} // 기본값 노랑
                        >
                            {content.text}
                        </span>
                    </div>
                );
            // 🌟 3. 스포일러 방지 (Spoiler)
            case 'spoiler':
                return (
                    <SpoilerItem
                        block={block} // content 대신 block 전달
                        onUpdateBlock={onUpdateBlock}
                        style={commonStyle}
                    />
                );
            // 🌟 4. 세로 쓰기 (Vertical Text)
            case 'vertical-text':
                return (
                    <div
                        style={{
                            ...commonStyle,
                            writingMode: 'vertical-rl', // 세로 쓰기 핵심 속성
                            textOrientation: 'upright', // 알파벳도 똑바로 세우기 (선택사항)
                            letterSpacing: '0.1em'      // 자간을 약간 넓혀 가독성 확보
                        }}
                        className="h-full w-full p-2 leading-normal whitespace-pre-wrap break-words border border-transparent"
                    >
                        {content.text}
                    </div>
                );
            // 🌟 5. 수식 (Math) - LaTeX
            case 'math':
                // 수식이 비어있으면 안내 문구 표시
                if (!content.text) return <div className="text-gray-400 text-xs italic">(수식을 입력하세요)</div>;

                return (
                    <div style={commonStyle} className="h-full w-full p-4 flex justify-center items-center overflow-x-auto">
                        <img
                            // CodeCogs 무료 LaTeX API 사용 (설치 불필요)
                            src={`https://latex.codecogs.com/svg.latex?\\huge&space;${encodeURIComponent(content.text)}`}
                            alt="Math Formula"
                            className="max-w-full"
                            style={{
                                filter: styles.color === '#ffffff' || styles.color?.includes('white')
                                    ? 'invert(1)' // 배경이 어두울 경우 수식을 흰색으로 반전
                                    : 'none'
                            }}
                        />
                    </div>
                );
            // 🌟 6. 타이핑 효과 (Typing Text)
            case 'typing-text':
                return <TypingTextItem content={content} style={commonStyle} />;
            // 🌟 7. 스크롤 텍스트 (Scroll Text, Marquee)
            case 'scroll-text':
                return (
                    <div className="h-full w-full overflow-hidden bg-gray-100 rounded border border-gray-200 py-2 relative flex items-center">
                        {/* 애니메이션 스타일 정의 */}
                        <style>
                            {`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                `}
                        </style>
                        <div
                            style={{
                                ...commonStyle,
                                whiteSpace: 'nowrap',
                                animation: `marquee ${content.speed || 10}s linear infinite`,
                                width: 'max-content' // 텍스트 길이만큼 너비 확보
                            }}
                        >
                            {content.text}
                        </div>
                    </div>
                );
            // 🌟 8. 방사형 차트 (Radar Chart)
            case 'chart-radar':
                return <RadarChartItem content={content} style={commonStyle} styles={styles} />;
            case 'heatmap':
                return (
                    <div style={commonStyle} className="p-3 w-full h-full bg-white flex flex-col justify-center">
                        {/* 제목이 있으면 표시 */}
                        {content.title && <div className="text-xs font-bold text-gray-500 mb-2">{content.title}</div>}

                        <HeatmapWidget
                            viewMode={content.viewMode || 'year'}
                            themeColor={styles.color || '#6366f1'} // 사용자가 설정한 색상 전달
                        />
                    </div>
                );
            // 🌟 [NEW] 별점/평점 (Rating)
            case 'rating':
                return <RatingItem block={block} {...otherProps} />;
            // --- [NEW] 진행 게이지 위젯 ---
            // --- [NEW] 진행 게이지 위젯 (원형/직선형 분기 추가) ---
            case 'progress-bar': {
                // 1. 값 계산
                const value = content.value || 0;
                const max = content.max || 100;
                const percentage = Math.min(100, Math.max(0, (value / max) * 100));
                // 2. 스타일 확인 (RightSidebar에서 설정한 값)
                const isCircle = content.style === 'circle';

                return (
                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm w-full h-full flex flex-col justify-center items-center">

                        {/* A. 원형 (Circle) 스타일 렌더링 */}
                        {isCircle ? (
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="relative w-32 h-32">
                                    {/* SVG로 도넛 차트 그리기 */}
                                    <svg className="w-full h-full transform -rotate-90">
                                        {/* 1) 배경 원 (회색) */}
                                        <circle
                                            cx="64" cy="64" r="56"
                                            stroke="currentColor" strokeWidth="12" fill="transparent"
                                            className="text-gray-100"
                                        />
                                        {/* 2) 진행 원 (설정된 색상 or 파란색) */}
                                        <circle
                                            cx="64" cy="64" r="56"
                                            stroke="currentColor" strokeWidth="12" fill="transparent"
                                            strokeDasharray={351.86} // 원의 둘레 (2 * pi * r) -> 2 * 3.14159 * 56 ≈ 351.86
                                            strokeDashoffset={351.86 - (351.86 * percentage) / 100} // 진행률만큼 오프셋 조정
                                            className="text-indigo-600 transition-all duration-1000 ease-out"
                                            style={{ color: styles.color }} // 사용자 지정 색상 적용 가능
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    {/* 중앙 텍스트 */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-900">
                                        <span className="text-2xl font-bold" style={{ color: styles.color }}>
                                            {Math.round(percentage)}%
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                            {content.label || 'Progress'}
                                        </span>
                                    </div>
                                </div>

                                {/* 하단 값 표시 */}
                                <div className="mt-2 text-xs text-gray-400 font-mono">
                                    {value} / {max}
                                </div>
                            </div>
                        ) : (
                            /* B. 직선형 (Bar) 스타일 (기존 코드 유지) */
                            <>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-700">{content.label || '진행률'}</span>
                                    <span className="text-sm font-bold text-indigo-600" style={{ color: styles.color }}>
                                        {Math.round(percentage)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden relative">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out relative"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: styles.color // 사용자 지정 색상 적용
                                        }}
                                    >
                                        {/* 반짝이는 효과 (선택사항) */}
                                        <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-400 text-right">
                                    {value} / {max}
                                </div>
                            </>
                        )}
                    </div>
                );
            }

                return <UnitConverterWidget block={block} {...otherProps} />;
            case 'pdf-viewer':
                return (
                    <PdfDropViewer
                        content={content}
                        onUpdate={(patch) => onUpdateBlock(block.id, { content: { ...content, ...patch } })}
                    />
                );

            // BlockRenderer.tsx (switch 내부에 추가)
            case 'flashcards': {
                const title: string = content.title || 'Flashcards';
                const cards = (content.cards || []) as { id: string; front: string; back: string }[];
                const currentIndex = Math.min(content.currentIndex ?? 0, Math.max(cards.length - 1, 0));
                const showBack = !!content.showBack;

                const current = cards[currentIndex];

                const setState = (patch: any) => {
                    props.onUpdateBlock(block.id, {
                        content: {
                            ...content,
                            ...patch,
                        },
                    });
                };

                const goPrev = () => {
                    if (cards.length === 0) return;
                    setState({
                        currentIndex: Math.max(0, currentIndex - 1),
                        showBack: false,
                    });
                };

                const goNext = () => {
                    if (cards.length === 0) return;
                    setState({
                        currentIndex: Math.min(cards.length - 1, currentIndex + 1),
                        showBack: false,
                    });
                };

                const flip = () => {
                    if (cards.length === 0) return;
                    setState({ showBack: !showBack });
                };

                return (
                    <div className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden">
                        <div className="px-3 py-2 text-[11px] text-gray-500 border-b bg-gray-50 flex items-center justify-between gap-2">
                            <span className="font-bold truncate">{title}</span>
                            <span className="text-[10px] text-gray-400">
                                {cards.length === 0 ? '0 cards' : `${currentIndex + 1}/${cards.length}`}
                            </span>
                        </div>

                        <div className="p-3">
                            {cards.length === 0 ? (
                                <div className="text-sm text-gray-400">카드를 추가하세요 (RightSidebar)</div>
                            ) : (
                                <div
                                    className="rounded-lg border border-gray-200 bg-white"
                                    style={{ perspective: 1000 }}
                                >
                                    {/* flip-card: CSS로 뒤집기(3D) */}
                                    <div
                                        className="relative w-full h-[160px] cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            flip();
                                        }}
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transition: 'transform 0.4s ease',
                                            transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        }}
                                    >
                                        {/* Front */}
                                        <div
                                            className="absolute inset-0 p-4 flex items-center justify-center text-sm text-gray-800"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                            }}
                                        >
                                            <div className="whitespace-pre-wrap break-words text-center">
                                                {current.front || '(Front empty)'}
                                            </div>
                                        </div>

                                        {/* Back */}
                                        <div
                                            className="absolute inset-0 p-4 flex items-center justify-center text-sm text-gray-800 bg-indigo-50"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)',
                                            }}
                                        >
                                            <div className="whitespace-pre-wrap break-words text-center">
                                                {current.back || '(Back empty)'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 flex gap-2">
                                <button
                                    className="flex-1 py-2 rounded bg-gray-900 text-white text-xs font-bold disabled:opacity-40"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goPrev();
                                    }}
                                    disabled={cards.length === 0 || currentIndex === 0}
                                >
                                    Prev
                                </button>

                                <button
                                    className="flex-1 py-2 rounded bg-indigo-600 text-white text-xs font-bold disabled:opacity-40"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        flip();
                                    }}
                                    disabled={cards.length === 0}
                                >
                                    Flip
                                </button>

                                <button
                                    className="flex-1 py-2 rounded bg-gray-900 text-white text-xs font-bold disabled:opacity-40"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goNext();
                                    }}
                                    disabled={cards.length === 0 || currentIndex === cards.length - 1}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            // 🌟 [NEW] case 추가
            case 'movie-ticket':
                return <MovieTicketWidget block={block} onUpdateBlock={onUpdateBlock} />;
            case 'link-bookmark':
                return <LinkBookmarkWidget block={block} onUpdateBlock={onUpdateBlock} />;
            // --- [NEW] 데이터베이스 위젯 (심플 테이블 버전) ---
            case 'database': {
                // 기본값: 간단한 표 데이터
                const headers = content.headers || ['이름', '태그', '상태'];
                const rows = content.rows || [
                    ['프로젝트 기획', '업무', '완료'],
                    ['디자인 시안', '디자인', '진행중'],
                    ['개발 착수', '개발', '대기'],
                ];

                return (
                    <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
                        {/* 상단 제목 바 */}
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                            <Database size={14} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-600">데이터베이스</span>
                        </div>
                        {/* 테이블 본문 */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                    <tr>
                                        {headers.map((h: string, i: number) => (
                                            <th key={i} className="px-4 py-2 font-medium border-b border-gray-100">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row: string[], i: number) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                            {row.map((cell: string, j: number) => (
                                                <td key={j} className="px-4 py-2 text-gray-700">
                                                    {/* 태그 스타일링 예시 (2번째 컬럼) */}
                                                    {j === 1 ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                                            {cell}
                                                        </span>
                                                    ) : (
                                                        cell
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }
            default: return <div className="text-gray-400 text-xs p-2 border border-dashed rounded">Unknown</div>;

        }

    };

    return (
        <div className="w-full h-full min-h-[30px]">
            {/* 단순히 컨텐츠만 렌더링 */}
            {renderWidgetContent()}
        </div>
    );
};
// End of BlockRenderer
export default BlockRenderer;