import React, {useEffect, useState} from 'react';
import type { WidgetBlock, ContainerLocation } from '../types';
import {
    Check,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Trash2,
    Plus,
    GripVertical, EyeOff, Eye, Info, AlertTriangle, XCircle, CheckCircle, Star, Heart, Zap, ThumbsUp,
} from 'lucide-react';

import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {useDroppable} from '@dnd-kit/core';
import ColumnSortableItem from "./ColumnSortableItem.tsx";
import HeatmapWidget from "./HeatmapWidget.tsx";
// 🆕 Props 정의 확장 (재귀 및 인터랙션을 위해 필요)
interface RendererProps {
    block: WidgetBlock;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    activeContainer: ContainerLocation;
    onSetActiveContainer: (loc: ContainerLocation) => void;
}

const BlockRenderer: React.FC<RendererProps> = (props) => {
    const {
        block,
        selectedBlockId,
        onSelectBlock,
        onRemoveBlock,
        activeContainer,
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