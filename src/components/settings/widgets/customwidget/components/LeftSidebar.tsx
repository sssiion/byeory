import React, { useState } from 'react';
import {
    // 카테고리 대표 아이콘
    Type, Layout, Sparkles, Activity, PieChart, Wrench, GraduationCap, MousePointer2,
    // 블록 아이콘들
    Heading1, Quote, Minus, List, ListOrdered, CheckSquare, Sidebar as IconSidebar,
    Columns, AlignVerticalJustifyCenter, AlertCircle, Highlighter, EyeOff, Sigma,
    Play, ChevronsRight, MoreHorizontal, BarChart3, Radar,
    Grid3X3, PlusCircle, Star, Battery, Database, ArrowLeftRight,
    Link, FileText, StickyNote, Search, RotateCw
} from 'lucide-react';
import type { BlockType } from '../types';
import { BLOCK_COSTS } from '../constants';
import { getMyWidgets } from '../widgetApi'; // API 임포트
import { Package } from 'lucide-react'; // 아이콘 임포트
import type { WidgetBlock } from '../types';

interface Props {
    onAddBlock: (type: BlockType, template?: WidgetBlock) => void;
    remainingCapacity: number;
    refreshTrigger?: number; // 🌟 외부에서 새로고침 트리거
}

// 카테고리 타입 정의 (saved 추가)
type Category = 'text' | 'structure' | 'visual' | 'effect' | 'data' | 'util' | 'study' | 'interaction' | 'saved';

const LeftSidebar: React.FC<Props> = ({ onAddBlock, remainingCapacity, refreshTrigger }) => {
    const [activeTab, setActiveTab] = useState<Category>('text');
    const [savedWidgets, setSavedWidgets] = useState<WidgetBlock[]>([]);

    // 보관함 탭 클릭 시 위젯 로드
    const loadSavedWidgets = () => {
        getMyWidgets().then(response => {
            // 🌟 응답 구조 방어 로직 (페이지네이션 vs 배열)
            let dataList = [];
            if (Array.isArray(response)) {
                dataList = response;
            } else if (response && Array.isArray(response.content)) {
                dataList = response.content;
            } else if (response && Array.isArray(response.data)) { // 혹시 모를 구조
                dataList = response.data;
            }

            const mapped = dataList.map((w: any) => ({
                id: w.id || w._id,
                type: w.type,
                content: w.content,
                styles: w.styles || {},
                name: w.name
            }));
            setSavedWidgets(mapped);
        }).catch(err => {
            console.error(err);
            setSavedWidgets([]);
        });
    };

    // 탭 변경 또는 refreshTrigger 발생 시 로드
    React.useEffect(() => {
        if (activeTab === 'saved') {
            loadSavedWidgets();
        }
    }, [activeTab, refreshTrigger]);

    // 헬퍼: 버튼 렌더링
    const renderBtn = (icon: React.ReactNode, label: string, type: BlockType) => {
        const cost = BLOCK_COSTS[type] || 1;
        const isDisabled = cost > remainingCapacity;

        return (
            <button
                key={type}
                onClick={() => !isDisabled && onAddBlock(type)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group relative text-left mb-1
                    ${isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-transparent'
                        : 'hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-[var(--text-secondary)] bg-[var(--bg-card-secondary)]/50 border border-[var(--border-color)] hover:border-indigo-500'
                    }
                `}
            >
                <div className={isDisabled ? '' : 'group-hover:text-indigo-400 text-[var(--text-secondary)]'}>{icon}</div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">비용: {cost}</span>
                </div>

                {isDisabled && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-400 font-bold border border-red-900/50 bg-red-900/20 px-1.5 py-0.5 rounded">
                        Full
                    </span>
                )}
            </button>
        );
    };

    return (
        <aside className="h-full flex bg-[var(--bg-card)] border-r border-[var(--border-color)]">

            {/* 1. 1단계: 카테고리 탭 (아이콘 메뉴) */}
            <div className="w-16 flex flex-col items-center py-4 gap-2 border-r border-[var(--border-color)] bg-[var(--bg-card-secondary)]">
                <TabButton
                    active={activeTab === 'text'}
                    onClick={() => setActiveTab('text')}
                    icon={<Type size={20} />}
                    label="기본"
                />
                <TabButton
                    active={activeTab === 'structure'}
                    onClick={() => setActiveTab('structure')}
                    icon={<Layout size={20} />}
                    label="구조"
                />
                <TabButton
                    active={activeTab === 'visual'}
                    onClick={() => setActiveTab('visual')}
                    icon={<Sparkles size={20} />}
                    label="꾸미기"
                />
                <TabButton
                    active={activeTab === 'effect'}
                    onClick={() => setActiveTab('effect')}
                    icon={<Activity size={20} />}
                    label="효과"
                />
                <div className="w-8 h-px bg-[var(--border-color)] my-1"></div>
                <TabButton
                    active={activeTab === 'data'}
                    onClick={() => setActiveTab('data')}
                    icon={<PieChart size={20} />}
                    label="데이터"
                />
                <TabButton
                    active={activeTab === 'util'}
                    onClick={() => setActiveTab('util')}
                    icon={<Wrench size={20} />}
                    label="도구"
                />
                <TabButton
                    active={activeTab === 'study'}
                    onClick={() => setActiveTab('study')}
                    icon={<GraduationCap size={20} />}
                    label="학습"
                />
                <TabButton
                    active={activeTab === 'interaction'}
                    onClick={() => setActiveTab('interaction')}
                    icon={<MousePointer2 size={20} />}
                    label="동작"
                />

                <div className="w-8 h-px bg-[var(--border-color)] my-1"></div>
                <TabButton
                    active={activeTab === 'saved'}
                    onClick={() => setActiveTab('saved')}
                    icon={<Package size={20} />}
                    label="보관함"
                />
            </div>

            {/* 2. 2단계: 선택된 카테고리의 기능 목록 (스크롤 영역) */}
            <div className="w-60 flex flex-col">
                {/* 상단: 남은 용량 표시 */}
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                        <span className="font-bold">남은 공간</span>
                        <span className={remainingCapacity < 2 ? 'text-red-400 font-bold' : 'text-indigo-400 font-mono'}>
                            {remainingCapacity.toFixed(1)}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-card-secondary)] rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${remainingCapacity < 2 ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min(100, remainingCapacity * 10)}%` }}
                        ></div>
                    </div>
                </div>

                {/* 기능 버튼 목록 */}
                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent">
                    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 px-1">
                        {getCategoryTitle(activeTab)}
                    </h3>

                    <div className="space-y-1">
                        {activeTab === 'text' && (
                            <>
                                {renderBtn(<Heading1 size={18} />, "헤딩 (H1~H3)", 'heading1')}
                                {renderBtn(<Type size={18} />, "기본 텍스트", 'text')}
                                {renderBtn(<Quote size={18} />, "인용구", 'quote')}
                                {renderBtn(<Minus size={18} />, "구분선", 'divider')}
                            </>
                        )}

                        {activeTab === 'structure' && (
                            <>
                                {renderBtn(<List size={18} />, "글머리 목록", 'bullet-list')}
                                {renderBtn(<ListOrdered size={18} />, "번호 목록", 'number-list')}
                                {renderBtn(<CheckSquare size={18} />, "할 일 목록", 'todo-list')}
                                {renderBtn(<IconSidebar size={18} className="rotate-90" />, "토글 목록", 'toggle-list')}
                                {renderBtn(<Columns size={18} />, "다단 컬럼", 'columns')}
                                {renderBtn(<AlignVerticalJustifyCenter size={18} />, "아코디언", 'accordion')}
                            </>
                        )}

                        {activeTab === 'visual' && (
                            <>
                                {renderBtn(<AlertCircle size={18} />, "콜아웃 (Callout)", 'callout')}
                                {renderBtn(<Highlighter size={18} />, "형광펜 강조", 'highlight')}
                                {renderBtn(<EyeOff size={18} />, "스포일러 방지", 'spoiler')}
                                {renderBtn(<Sigma size={18} />, "수식 (Math)", 'math')}
                                {renderBtn(<MoreHorizontal size={18} className="rotate-90" />, "세로쓰기", 'vertical-text')}
                            </>
                        )}

                        {activeTab === 'effect' && (
                            <>
                                {renderBtn(<Play size={18} />, "타이핑 효과", 'typing-text')}
                                {renderBtn(<ChevronsRight size={18} />, "스크롤 텍스트", 'scroll-text')}
                            </>
                        )}

                        {activeTab === 'data' && (
                            <>
                                {renderBtn(<PieChart size={18} />, "원형 차트", 'chart-pie')}
                                {renderBtn(<BarChart3 size={18} />, "막대/선 그래프", 'chart-bar')}
                                {renderBtn(<Radar size={18} />, "방사형 차트", 'chart-radar')}
                                {renderBtn(<Grid3X3 size={18} />, "히트맵 (잔디)", 'heatmap')}
                                {renderBtn(<PlusCircle size={18} />, "카운터", 'counter')}
                                {renderBtn(<Star size={18} />, "별점/평점", 'rating')}
                                {renderBtn(<Battery size={18} />, "진행 게이지", 'progress-bar')}
                                {renderBtn(<Database size={18} />, "데이터베이스", 'database')}
                            </>
                        )}

                        {activeTab === 'util' && (
                            <>
                                {renderBtn(<ArrowLeftRight size={18} />, "단위 변환기", 'unit-converter')}
                                {renderBtn(<Link size={18} />, "링크 북마크", 'link-bookmark')}
                                {renderBtn(<FileText size={18} />, "PDF 뷰어", 'pdf-viewer')}
                            </>
                        )}

                        {activeTab === 'study' && (
                            <>
                                {renderBtn(<StickyNote size={18} />, "플래시 카드", 'flashcards')}
                                {renderBtn(<Search size={18} />, "책 정보 검색", 'book-info')}
                                {renderBtn(<Search size={18} />, "영화 정보 검색", 'movie-ticket')}
                            </>
                        )}


                    </div>

                    {activeTab === 'saved' && (
                        <>
                            <div className="flex justify-between items-center px-4 py-2 border-b border-[var(--border-color)] mb-2">
                                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">내 보관함</span>
                                <button
                                    onClick={loadSavedWidgets}
                                    className="text-[var(--text-secondary)] hover:text-indigo-400 transition-colors p-1 rounded hover:bg-[var(--bg-card-secondary)]"
                                    title="새로고침"
                                >
                                    <RotateCw size={14} />
                                </button>
                            </div>
                            {savedWidgets.length === 0 ? (
                                <div className="text-center text-[var(--text-secondary)] text-xs p-4 bg-gray-50/50 rounded-lg mx-2 border border-dashed border-gray-200">
                                    <p className="mb-1">저장된 위젯이 없습니다.</p>
                                    <p className="text-[10px] text-gray-400">상단의 '저장하기' 버튼으로<br />현재 위젯을 저장해보세요!</p>
                                </div>
                            ) : (
                                savedWidgets.map((widget) => {
                                    // 커스텀 블록 비용 계산 (여기서는 대략 1 또는 자식 수 비례?? 일단 1로 처리하거나 계산 로직 필요)
                                    // 일단 비용 1로 가정하고 렌더링
                                    return (
                                        <button
                                            key={widget.id}
                                            onClick={() => onAddBlock(widget.type, widget)}
                                            className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group relative text-left mb-1 hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-[var(--text-secondary)] bg-[var(--bg-card-secondary)]/50 border border-[var(--border-color)] hover:border-indigo-500"
                                        >
                                            <div className="group-hover:text-indigo-400 text-[var(--text-secondary)]">
                                                <Package size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[140px]">
                                                    {(widget as any).name || '이름 없음'}
                                                </span>
                                                <span className="text-[10px] text-[var(--text-secondary)]">
                                                    {widget.type === 'custom-block' ? '복합 위젯' : widget.type}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </>
                    )}

                </div>
            </div>
        </aside>
    );
};

// 탭 버튼 컴포넌트
const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-all gap-0.5
            ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)]'
            }
        `}
        title={label}
    >
        {icon}
        <span className="text-[9px] font-medium">{label}</span>
    </button>
);

const getCategoryTitle = (cat: Category) => {
    switch (cat) {
        case 'text': return '기본 텍스트';
        case 'structure': return '구조 및 목록';
        case 'visual': return '시각적 강조';
        case 'effect': return '애니메이션';
        case 'data': return '데이터 시각화';
        case 'util': return '유틸리티 도구';
        case 'study': return '지식 및 학습';
        case 'interaction': return '상호작용';
        default: return '';
    }
};

export default LeftSidebar;
