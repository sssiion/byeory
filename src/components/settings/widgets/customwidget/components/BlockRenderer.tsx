import React, {useEffect} from 'react';
import type { WidgetBlock, ContainerLocation } from '../types';
import {
    Check,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    EyeOff, Eye, Info, AlertTriangle, XCircle, CheckCircle, Star, Heart, Zap, ThumbsUp, Database,
    ArrowLeftRight,Search, BookOpen, RotateCcw,
    Film, MessageSquare, Clapperboard,  ChevronUp // 👈 아이콘 확인
} from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { dropPlugin } from '@react-pdf-viewer/drop';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { useMemo, useCallback, useState } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Node,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/drop/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {useDroppable} from '@dnd-kit/core';
import ColumnSortableItem from "./ColumnSortableItem.tsx";
import HeatmapWidget from "./HeatmapWidget.tsx";
import BookInfoWidget from "./Rendercomponent/BookInfoWidget.tsx";
import MovieTicketWidget from "./Rendercomponent/MovieTicketWidget.tsx";
import UnitConverterWidget from "./Rendercomponent/UnitConverterWidget.tsx";
// 🆕 Props 정의 확장 (재귀 및 인터랙션을 위해 필요)
interface RendererProps {
    block: WidgetBlock;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
    onUpdateBlock: (id: string, updates: any) => void; // ✅ 추가
}


const BlockRenderer: React.FC<RendererProps> = (props) => {
    const {
        block,
        onSelectBlock,
        onSetActiveContainer,
    } = props;
    const { styles, content, type } = block;

    const commonStyle = {
        color: styles.color,
        backgroundColor: styles.bgColor,
        fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
        textAlign: styles.align as any,
        fontWeight: styles.bold ? 'bold' : 'normal',
        fontStyle: styles.italic ? 'italic' : 'normal',
    };

    // 🆕 컬럼 내부 아이템 1개를 dnd-kit useSortable로 감싼 컴포넌트


    // --- 🔥 컬럼(Columns) 렌더링 로직 (dnd-kit로 변경) ---
    if (type === 'columns') {
        const layout: WidgetBlock[][] = content.layout || [[], []];

        return (
            <div className="flex gap-2 w-full h-full">
                {layout.map((colBlocks, index) => {
                    const columnContainerId = `COL-${block.id}-${index}`;

                    return (
                        <div key={index} className="flex-1 w-0 min-w-[50px] flex flex-col h-full">
                            <DroppableColumn
                                id={columnContainerId}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetActiveContainer({blockId: block.id, colIndex: index});
                                    onSelectBlock(null);
                                }}
                            >
                                <SortableContext
                                    items={colBlocks.map((c) => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="relative z-10 flex flex-col gap-2 w-full">
                                        {colBlocks.map((child) => (
                                            <ColumnSortableItem
                                                key={child.id}
                                                child={child}
                                                columnContainerId={columnContainerId}
                                                // 아래 props들도 빠짐없이 전달해야 합니다.
                                                selectedBlockId={props.selectedBlockId}
                                                onSelectBlock={props.onSelectBlock}
                                                onRemoveBlock={props.onRemoveBlock}
                                                activeContainer={props.activeContainer}
                                                onSetActiveContainer={props.onSetActiveContainer}

                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DroppableColumn>
                        </div>
                    );
                })}
            </div>
        );
    }
    switch (type) {
        // --- 1. 텍스트류 (긴 텍스트 줄바꿈 처리) ---
        case 'heading1': return <h1 style={commonStyle} className="text-2xl font-bold mb-2 border-b pb-1 border-gray-100 break-words">{content.text}</h1>;
        case 'heading2': return <h2 style={commonStyle} className="text-xl font-bold mb-1 mt-2 break-words">{content.text}</h2>;
        case 'heading3': return <h3 style={commonStyle} className="text-lg font-semibold mb-1 break-words">{content.text}</h3>;
        case 'text': return <p style={commonStyle} className="whitespace-pre-wrap leading-relaxed break-words">{content.text}</p>;
        case 'quote': return <div style={{...commonStyle, borderLeftColor: styles.color || '#333'}} className="border-l-4 pl-3 py-1 my-2 text-gray-600 italic bg-gray-50 rounded-r break-words">{content.text}</div>;
        case 'book-info':
            return <BookInfoWidget block={block}  />;
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
                    const nextEdges = addEdge(
                        { ...connection, id: `mm-e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
                        edges
                    );
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
                    className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden"
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
                <div className="space-y-1.5">
                    {(content.items || []).map((it: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 group">
                            <div className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 transition-colors ${it.done ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-400 bg-white'}`}>
                                {it.done && <Check size={10} strokeWidth={4} />}
                            </div>
                            <span className={`text-sm transition-all break-words flex-1 ${it.done ? 'text-gray-400 line-through' : 'text-gray-800'}`} style={commonStyle}>
                                {it.text}
                            </span>
                        </div>
                    ))}
                </div>
            );

        // --- 3. 원형 차트 ---
        case 'chart-pie': {
            const data = content.data || [];
            const total = data.reduce((acc: number, cur: any) => acc + cur.value, 0);
            let currentDeg = 0;
            const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'];
            const gradientParts = data.map((item: any, i: number) => {
                const deg = (item.value / total) * 360;
                const part = `${colors[i % colors.length]} ${currentDeg}deg ${currentDeg + deg}deg`;
                currentDeg += deg;
                return part;
            }).join(', ');

            return (
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="w-12 h-12 rounded-full flex-shrink-0 relative" style={{ background: `conic-gradient(${gradientParts || '#ddd 0deg 360deg'})` }}>
                        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center text-[8px] font-bold text-gray-500">Total</div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                        {data.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }}></span><span className="truncate">{item.label}</span></span>
                                <span className="font-bold ml-1">{Math.round((item.value/total)*100)}%</span>
                            </div>
                        ))}
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
                <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm h-24 flex items-end justify-between gap-1 overflow-hidden">
                    {data.map((item: any, i: number) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group h-full justify-end min-w-0">
                            <div className="w-full rounded-t-sm transition-all relative" style={{ height: `${(item.value / max) * 100}%`, backgroundColor: colors[i % colors.length] }}></div>
                            <span className="text-[8px] text-gray-500 truncate w-full text-center">{item.label}</span>
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
                <div style={{ backgroundColor: styles.bgColor || '#eff6ff' }} className="p-3 rounded-lg flex items-center justify-between gap-2 overflow-hidden">
                    <div className="min-w-0">
                        <div className="text-[10px] text-gray-500 font-bold uppercase truncate flex items-center gap-1"><CalendarDays size={10}/> {content.title}</div>
                        <div className="text-[10px] text-gray-400 truncate">{content.date}</div>
                    </div>
                    <div className="text-xl font-black text-indigo-600 whitespace-nowrap">{dDay}</div>
                </div>
            );
        }

        // --- 6. 구분선 ---
        case 'divider': return <div className="py-2"><hr className="border-t border-gray-200" style={{ borderColor: styles.color }} /></div>;

        // --- 7. 리스트류 ---
        case 'bullet-list': return <ul style={commonStyle} className="list-disc list-inside space-y-1 text-gray-800">{content.items.map((it:string, i:number) => <li key={i} className="break-words">{it}</li>)}</ul>;
        case 'number-list': return <ol style={commonStyle} className="list-decimal list-inside space-y-1 text-gray-800">{content.items.map((it:string, i:number) => <li key={i} className="break-words">{it}</li>)}</ol>;

        // --- 8. 토글 목록 ---
        case 'toggle-list': return <ToggleItem title={content.title} items={content.items} style={commonStyle} />;

        // --- 9. 아코디언 ---
        case 'accordion': return <AccordionItem title={content.title} body={content.body} style={commonStyle} />;

        case 'callout': {
            const calloutType = content.type || 'info';
            // 타입별 스타일 및 아이콘 설정
            // @ts-ignore
            const config = {
                info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info size={20} className="text-blue-500" /> },
                warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: <AlertTriangle size={20} className="text-orange-500" /> },
                error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <XCircle size={20} className="text-red-500" /> },
                success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <CheckCircle size={20} className="text-green-500" /> }
            }[calloutType as 'info' | 'warning' | 'error' | 'success'] || config.info;

            return (
                <div className={`p-4 rounded-lg border flex gap-3 ${config.bg} ${config.border} break-words`}>
                    <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                    <div className="flex flex-col min-w-0">
                        {content.title && <span className={`font-bold mb-1 ${config.text}`}>{content.title}</span>}
                        <span className="text-gray-700 leading-relaxed text-sm">{content.text}</span>
                    </div>
                </div>
            );
        }

        // 🌟 2. 형광펜 강조 (Highlight)
        case 'highlight':
            return (
                <div style={commonStyle} className="leading-relaxed">
                    <span
                        className="px-2 py-1 rounded box-decoration-clone"
                        style={{ backgroundColor: styles.bgColor || '#fef08a' }} // 기본값 노랑
                    >
                        {content.text}
                    </span>
                </div>
            );

        // 🌟 3. 스포일러 방지 (Spoiler)
        case 'spoiler':
            return <SpoilerItem content={content} style={commonStyle} />;
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
                    className="h-full min-h-[150px] p-2 leading-loose whitespace-pre-wrap break-words border border-transparent"
                >
                    {content.text}
                </div>
            );

// 🌟 5. 수식 (Math) - LaTeX
        case 'math':
            // 수식이 비어있으면 안내 문구 표시
            if (!content.text) return <div className="text-gray-400 text-xs italic">(수식을 입력하세요)</div>;

            return (
                <div style={commonStyle} className="p-4 flex justify-center items-center overflow-x-auto">
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
                <div className="w-full overflow-hidden bg-gray-100 rounded border border-gray-200 py-2 relative flex items-center">
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
            return <RatingItem block={block} {...props} />;
            default: return <div className="text-gray-400 text-xs p-2 border border-dashed rounded">Unknown</div>;
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
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col justify-center min-h-[100px]">

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

        case 'unit-converter':
            return <UnitConverterWidget block={block} {...props} />;
        case 'pdf-viewer': {
            const fileUrl: string = content.fileUrl || '';
            const fileName: string = content.fileName || '';

            const drop = dropPlugin();
            const layout = defaultLayoutPlugin();

            const setFromFile = (file: File) => {
                if (file.type !== 'application/pdf') return;
                const nextUrl = URL.createObjectURL(file);

                props.onUpdateBlock(block.id, {
                    content: {
                        ...content,
                        fileUrl: nextUrl,
                        fileName: file.name,
                    },
                });
            };

            const onDropCapture = (e: React.DragEvent) => {
                const f = e.dataTransfer.files?.[0];
                if (f) setFromFile(f);
            };

            return (
                <div
                    onDropCapture={onDropCapture}
                    onDragOver={(e) => e.preventDefault()}
                    className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden"
                    style={{ minHeight: 180 }}
                >
                    <div className="px-3 py-2 text-[11px] text-gray-500 border-b bg-gray-50 flex justify-between gap-2">
        <span className="truncate">
          {fileName ? fileName : 'PDF를 드래그 앤 드롭해서 열기'}
        </span>
                        {fileUrl ? (
                            <button
                                className="text-red-500 font-bold"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
                                    props.onUpdateBlock(block.id, {
                                        content: { ...content, fileUrl: '', fileName: '' },
                                    });
                                }}
                            >
                                Clear
                            </button>
                        ) : null}
                    </div>

                    {/* Worker 사용 패턴은 공식 문서에 안내되어 있습니다. [web:74] */}
                    <div style={{ height: 320 }}>
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                            {fileUrl ? (
                                <Viewer fileUrl={fileUrl} plugins={[drop, layout]} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    여기에 PDF 파일을 드롭하세요
                                </div>
                            )}
                        </Worker>
                    </div>
                </div>
            );
        }
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
            return <MovieTicketWidget block={block} />;
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

    }
};


// --- 내부 컴포넌트 ---
const ToggleItem = ({ title, items, style }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="w-full">
            <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded select-none">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span style={style} className="font-bold truncate">{title}</span>
            </div>
            {isOpen && (
                <ul className="pl-6 mt-1 list-disc text-gray-600 space-y-1">
                    {items.map((it: string, i: number) => <li key={i} style={{ fontSize: '0.9em' }} className="break-words">{it}</li>)}
                </ul>
            )}
        </div>
    );
};

const AccordionItem = ({ title, body, style }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden w-full bg-white shadow-sm">
            <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors">
                <span style={style} className="font-bold text-gray-800 truncate">{title}</span>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {isOpen && <div className="p-3 text-sm border-t border-gray-100 bg-white text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{body}</div>}
        </div>
    );
};
// --- 내부 컴포넌트: 스포일러 ---
const SpoilerItem = ({ content, style }: any) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div
            onClick={(e) => {
                // 편집 모드에서의 선택과 충돌 방지를 위해 stopPropagation 사용 고려
                // 하지만 미리보기 기능을 위해 클릭 허용
                // e.stopPropagation();
                setIsRevealed(!isRevealed);
            }}
            className={`
                relative p-3 rounded-lg border transition-all cursor-pointer group select-none
                ${isRevealed
                ? 'bg-gray-50 border-gray-200 text-gray-800'
                : 'bg-gray-900 border-gray-800 text-transparent hover:bg-gray-800'
            }
            `}
            style={style}
        >
            {/* 텍스트 내용 */}
            <p className={`break-words ${isRevealed ? '' : 'blur-sm select-none'}`}>
                {content.text}
            </p>

            {/* 가려진 상태일 때 아이콘 및 안내 문구 */}
            {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-gray-400 font-medium">
                    <EyeOff size={18} />
                    <span className="text-sm">스포일러 (클릭해서 보기)</span>
                </div>
            )}

            {/* 보여진 상태일 때 다시 숨기기 힌트 (우측 상단) */}
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
    const isBackspaceMode = content.isBackspaceMode || false; // 🆕 옵션 값

    useEffect(() => {
        // @ts-ignore
        let timeoutId: NodeJS.Timeout;
        let currentText = '';
        let isDeleting = true; // (선택사항) 지워지는 효과를 원하면 true로 활용 가능, 여기선 그냥 리셋

        const animate = () => {
            const currentLen = currentText.length;

            // 1. 지우는 모드 (백스페이스 효과)
            if (isDeleting) {
                currentText = fullText.substring(0, currentLen - 1);
                setDisplayedText(currentText);

                if (currentText.length === 0) {
                    isDeleting = false;
                    timeoutId = setTimeout(animate, 500); // 다 지워지면 잠시 쉬고 다시 시작
                } else {
                    // 지우는 속도는 타이핑 속도의 절반(2배 빠름)으로 설정
                    timeoutId = setTimeout(animate, speed / 2);
                }
            }
            // 2. 타이핑 모드
            else {
                currentText = fullText.substring(0, currentLen + 1);
                setDisplayedText(currentText);

                if (currentText.length === fullText.length) {
                    // 문장이 완성됨 -> 2초 대기
                    if (isBackspaceMode) {
                        isDeleting = true; // 백스페이스 모드면 지우기 시작
                        timeoutId = setTimeout(animate, 2000);
                    } else {
                        // 일반 모드면 즉시 초기화 후 다시 시작
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

        // 초기 실행
        animate();

        // 클린업: 컴포넌트가 사라지거나 텍스트가 바뀌면 타이머 취소
        return () => clearTimeout(timeoutId);
    }, [fullText, speed, isBackspaceMode]);

    return (
        <div style={style} className="min-h-[1.5em] font-mono break-all">
            {displayedText}
            {/* 커서 깜빡임 효과 */}
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
    const {setNodeRef, isOver} = useDroppable({
        id,
        data: {containerId: id, isContainer: true},
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={`flex flex-col gap-2 w-full min-h-[80px] rounded-lg border-2 p-2 relative
        ${isOver ? 'border-indigo-400 bg-indigo-50/30' : ''}`}
        >
            {children}
        </div>
    );
}
// --- 내부 컴포넌트: 방사형 차트 ---
const RadarChartItem = ({ content, style, styles }: any) => {
    const data = content.data || [];
    const count = data.length;

    // 데이터가 없거나 3개 미만이면 차트를 그릴 수 없음
    if (count < 3) return <div className="text-gray-400 text-xs p-4 text-center">데이터가 3개 이상 필요합니다.</div>;

    const size = 200; // SVG viewBox 크기
    const center = size / 2;
    const radius = 80; // 차트 반지름
    const maxValue = 100; // 값의 최대치 (100점 만점 기준)

    // 📌 극좌표(거리, 각도) -> 직교좌표(x, y) 변환 함수
    const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0; // -90은 12시 방향부터 시작하기 위함
        return {
            x: centerX + (r * Math.cos(angleInRadians)),
            y: centerY + (r * Math.sin(angleInRadians))
        };
    };

    // 각 축의 각도 계산
    const angleSlice = 360 / count;

    // 1. 배경 그리드 (거미줄 모양) 생성 (20%, 40%, 60%, 80%, 100%)
    const gridLevels = [20, 40, 60, 80, 100];
    const gridPolygons = gridLevels.map((level) => {
        const r = (radius * level) / 100;
        const points = data.map((_: any, i: number) => {
            const { x, y } = polarToCartesian(center, center, r, i * angleSlice);
            return `${x},${y}`;
        }).join(' ');
        return <polygon key={level} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
    });

    // 2. 축(Axis) 선 그리기
    const axes = data.map((item: any, i: number) => {
        const { x, y } = polarToCartesian(center, center, radius, i * angleSlice);
        return (
            <g key={i}>
                <line x1={center} y1={center} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                {/* 라벨 텍스트 */}
                {content.showLabels !== false && (
                    <text
                        x={x * 1.15 - center * 0.15} // 위치 미세 조정
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

    // 3. 실제 데이터 영역 그리기
    const dataPoints = data.map((item: any, i: number) => {
        const val = Math.min(Math.max(item.value, 0), maxValue); // 0~100 제한
        const r = (radius * val) / maxValue;
        const { x, y } = polarToCartesian(center, center, r, i * angleSlice);
        return `${x},${y}`;
    }).join(' ');

    const chartColor = styles.color || '#6366f1'; // 기본 인디고 색상

    return (
        <div style={style} className="w-full flex justify-center items-center py-2 bg-white rounded-lg border border-gray-100">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="max-w-[250px] aspect-square overflow-visible">
                {/* 배경 그리드 */}
                {gridPolygons}
                {/* 축과 라벨 */}
                {axes}
                {/* 데이터 영역 (채우기) */}
                <polygon points={dataPoints} fill={chartColor} fillOpacity="0.3" stroke={chartColor} strokeWidth="2" />
                {/* 데이터 꼭짓점 점 찍기 */}
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
// --- 내부 컴포넌트: 별점 아이템 ---
const RatingItem = ({ block, onUpdateBlock }: any) => {
    const { content, styles, id } = block;
    const value = content.value || 0;
    const max = content.max || 5;
    const iconType = content.icon || 'star';

    // 아이콘 매핑
    const IconComponent = {
        star: Star,
        heart: Heart,
        zap: Zap,
        thumb: ThumbsUp
    }[iconType as string] || Star;

    // 점수 변경 핸들러 (캔버스에서 직접 클릭 시)
    const handleClick = (idx: number) => {
        // onUpdateBlock이 전달된 경우(편집 모드)에만 동작
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
                            e.stopPropagation(); // 블록 선택 이벤트 전파 방지
                            handleClick(i);
                        }}
                        className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                        <IconComponent
                            size={styles.fontSize ? Number(styles.fontSize) + 4 : 24}
                            // 채워진 아이콘 vs 빈 아이콘 스타일링
                            fill={isActive ? (styles.color || '#F59E0B') : 'none'}
                            stroke={isActive ? (styles.color || '#F59E0B') : '#d1d5db'}
                            strokeWidth={isActive ? 0 : 2}
                            // strokeWidth가 0이면 외곽선이 안보이므로, fill 될때도 외곽선을 살짝 주려면 아래처럼
                            className={isActive ? 'text-transparent' : 'text-gray-300'}
                            style={{
                                stroke: isActive ? 'none' : (styles.color ? styles.color : '#d1d5db'),
                                fill: isActive ? (styles.color || '#F59E0B') : 'none'
                            }}
                        />
                    </div>
                );
            })}

            {/* 점수 텍스트 표시 (선택사항) */}
            <span className="ml-2 text-sm font-bold text-gray-500">
                {value}/{max}
            </span>
        </div>
    );
};
export default BlockRenderer;