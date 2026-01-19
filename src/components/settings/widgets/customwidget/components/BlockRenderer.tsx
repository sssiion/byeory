import React, { useCallback, useState, useEffect } from 'react';
import { getSvgPathFromPoints } from '../utils';
import type { WidgetBlock } from '../types';
import {
    Check,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    EyeOff, Eye, Info, AlertTriangle, XCircle, CheckCircle, Star, Heart, Zap, ThumbsUp, RotateCw
} from 'lucide-react';
import '@xyflow/react/dist/style.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/drop/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import HeatmapWidget from "./Rendercomponent/HeatmapWidget.tsx";
import BookInfoWidget from "./Rendercomponent/BookInfoWidget.tsx";
import MovieTicketWidget from "./Rendercomponent/MovieTicketWidget.tsx";
import UnitConverterWidget from "./Rendercomponent/UnitConverterWidget.tsx";
import LinkBookmarkWidget from "./Rendercomponent/LinkBookmarkWidget.tsx";
import DatabaseWidget from "./Rendercomponent/DatabaseWidget.tsx";
import TravelPlanWidget from './Rendercomponent/TravelPlanWidget';
import DecorationLayer from './DecorationLayer';
import {
    addEdge, applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    type Edge,
    type EdgeChange,
    type NodeChange,
    type Node,
    type Connection,
    ReactFlow
} from "@xyflow/react";
import PdfDropViewer from "./Rendercomponent/PdfDropViewer.tsx";
import { EditableText } from "./EditableText";

interface RendererProps {
    block: WidgetBlock;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    onUpdateBlock: (id: string, updates: any) => void;
}

const ToggleItem = ({ block, onUpdateBlock, style }: any) => {
    const { content } = block;
    const [isOpen, setIsOpen] = useState(false);
    const items = content.items || [];

    const handleItemUpdate = (index: number, newVal: string) => {
        const newItems = [...items];
        newItems[index] = newVal;
        onUpdateBlock(block.id, { content: { ...content, items: newItems } });
    };

    return (
        <div className="w-full h-full">
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
                <div className="flex-1 min-w-0 font-bold">
                    <EditableText
                        tagName="span"
                        text={content.title}
                        onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, title: val } })}
                        style={style}
                        className="truncate"
                        placeholder="토글 제목"
                    />
                </div>
            </div>
            {isOpen && (
                <ul className="pl-6 mt-1 list-disc text-gray-600 space-y-1">
                    {items.map((it: string, i: number) => (
                        <li key={i} style={{ fontSize: '0.9em' }} className="break-words pl-1 flex items-center">
                            <EditableText
                                tagName="span"
                                text={it}
                                onUpdate={(val) => handleItemUpdate(i, val)}
                                style={{ ...style, fontWeight: 'normal' }}
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

const SpoilerItem = ({ block, onUpdateBlock, style }: any) => {
    const { content } = block;
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div
            onClick={() => setIsRevealed(!isRevealed)}
            className={`w-full relative p-1 rounded-lg border transition-all cursor-pointer group select-none flex flex-col
                ${isRevealed
                    ? 'bg-gray-50 border-gray-200 text-gray-800'
                    : 'bg-gray-900 border-gray-800 text-transparent hover:bg-gray-800'
                }
            `}
            style={style}
        >
            <div className={`break-words w-full h-full ${isRevealed ? '' : 'blur-sm select-none pointer-events-none'}`}>
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
        let timeoutId: any;
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
    const { block, onUpdateBlock, selectedBlockId, onSelectBlock, onRemoveBlock } = props;
    const { styles, content, type } = block;

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

    if (type === 'columns') {
        return (
            <div className="flex w-full h-full relative">
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs italic">
                    Columns block is deprecated in free-form mode.
                </div>
            </div>
        );
    }

    const renderWidgetContent = () => {
        switch (type as any) {
            case 'heading1':
                return (
                    <div className="w-full flex flex-col">
                        <EditableText
                            tagName="h1"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={commonStyle}
                            className="text-2xl font-bold break-words leading-none m-0 p-0 block"
                            placeholder="Heading 1"
                        />
                    </div>
                );
            case 'heading2':
                return (
                    <div className="w-full flex flex-col">
                        <EditableText
                            tagName="h2"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={commonStyle}
                            className="text-xl font-bold break-words leading-none m-0 p-0 block"
                            placeholder="Heading 2"
                        />
                    </div>
                );
            case 'heading3':
                return (
                    <div className="w-full overflow-hidden flex flex-col">
                        <EditableText
                            tagName="h3"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={commonStyle}
                            className="text-lg font-semibold break-words leading-none m-0 p-0 block"
                            placeholder="Heading 3"
                        />
                    </div>
                );
            case 'text':
                return (
                    <div className="w-full flex flex-col">
                        <EditableText
                            tagName="p"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={commonStyle}
                            className="whitespace-pre-wrap break-words leading-snug m-0 p-0 block"
                            placeholder="텍스트를 입력하세요..."
                        />
                    </div>
                );
            case 'quote':
                return (
                    <div style={{ ...commonStyle, borderLeftColor: styles.color || '#333' }} className="border-l-4 pl-1 py-0 my-0 text-gray-600 italic bg-gray-50 rounded-r break-words flex flex-col">
                        <EditableText
                            tagName="div"
                            text={content.text}
                            onUpdate={(val) => onUpdateBlock(block.id, { content: { ...content, text: val } })}
                            style={{ ...commonStyle, fontStyle: 'italic' }}
                            className="leading-none m-0 p-0 block"
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
            case 'travel-plan':
                return <TravelPlanWidget block={block} onUpdateBlock={onUpdateBlock} />;
            case 'mindmap': {
                const content0 = (content || {}) as any;
                const nodes = (content0.nodes || []) as Node[];
                const edges = (content0.edges || []) as Edge[];
                const setContent = (patch: any) => {
                    onUpdateBlock(block.id, { content: { ...content0, ...patch } });
                };
                return (
                    <div className="w-full h-full rounded-lg border border-gray-200 bg-white overflow-hidden" onPointerDownCapture={(e) => e.stopPropagation()}>
                        <div className="px-3 py-2 text-[11px] text-gray-500 border-b bg-gray-50 flex items-center justify-between gap-2">
                            <span className="font-bold truncate">Mind Map</span>
                        </div>
                        <div style={{ height: 360 }}>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={(changes) => setContent({ nodes: applyNodeChanges(changes, nodes) })}
                                onEdgesChange={(changes) => setContent({ edges: applyEdgeChanges(changes, edges) })}
                                onConnect={(connection) => setContent({ edges: addEdge({ ...connection, id: `mm-e-${Date.now()}` } as Edge, edges) })}
                                fitView
                            >
                                <Controls showInteractive={false} />
                                <Background />
                            </ReactFlow>
                        </div>
                    </div>
                );
            }
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
                    <div className="relative w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-2 group">
                        <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center w-full">
                            <div
                                className="aspect-square relative rounded-full shadow-inner flex-shrink-0"
                                style={{
                                    background: `conic-gradient(${gradientParts || '#ddd 0deg 360deg'})`,
                                    height: '100%',
                                    width: 'auto',
                                    maxHeight: '100%',
                                    maxWidth: '100%',
                                }}
                            >
                                <div className="absolute inset-[25%] bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                                    Total
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'rating':
                return <RatingItem block={block} onUpdateBlock={onUpdateBlock} />;
            case 'progress-bar': {
                const value = content.value || 0;
                const max = content.max || 100;
                const percentage = Math.min(100, Math.max(0, (value / max) * 100));
                const isCircle = content.style === 'circle';
                return (
                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm w-full h-full flex flex-col justify-center items-center">
                        {isCircle ? (
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * percentage) / 100} className="text-indigo-600" style={{ color: styles.color }} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-900">
                                    <span className="text-2xl font-bold" style={{ color: styles.color }}>{Math.round(percentage)}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full">
                                <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: styles.color }} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            case 'unit-converter':
                return <UnitConverterWidget block={block} onUpdateBlock={onUpdateBlock} />;
            case 'pdf-viewer':
                return <PdfDropViewer content={content} onUpdate={(patch) => onUpdateBlock(block.id, { content: { ...content, ...patch } })} />;
            case 'flashcards':
                return <div className="p-4 bg-white rounded-lg border">Flashcards (Simplified)</div>;
            case 'database':
                return <DatabaseWidget block={block} onUpdateBlock={onUpdateBlock} />;
            default:
                return <div className="text-gray-400 text-xs p-2 border border-dashed rounded">Unknown Block Type: {(type as any)}</div>;
        }
    };

    if (type === 'custom-block' as any) {
        const children = (content.children || []) as WidgetBlock[];
        const decorations = content.decorations || [];

        return (
            <div className="flex flex-col gap-0 w-full h-full relative">
                <DecorationLayer decorations={decorations} />
                {children.map((childBlock) => {
                    const layout = childBlock.layout || { w: '100%', h: 'auto' };
                    let width: string | number = '100%';
                    let height: string | number = 'auto';
                    if (typeof layout.w === 'number') width = `${layout.w}px`;
                    else if (layout.w) width = layout.w;
                    if (typeof layout.h === 'number') height = `${layout.h}px`;
                    else if (layout.h) height = layout.h;

                    return (
                        <div
                            key={childBlock.id}
                            style={{
                                width,
                                height,
                                minHeight: '20px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <BlockRenderer
                                block={childBlock}
                                selectedBlockId={null}
                                onSelectBlock={() => { }}
                                onRemoveBlock={() => { }}
                                onUpdateBlock={onUpdateBlock}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[30px] relative">
            {renderWidgetContent()}
        </div>
    );
};

export default BlockRenderer;