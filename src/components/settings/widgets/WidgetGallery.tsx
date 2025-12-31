import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, HelpCircle, Loader2, Database, Plus } from 'lucide-react';
import { WIDGET_REGISTRY, type WidgetType } from './Registry';
import { matchKoreanSearch } from '../../../utils/searchUtils';
import { useIsMobile } from '../../../hooks';
import type { WidgetBlock } from "./customwidget/types.ts";
import { WidgetInfoModal } from './WidgetInfoModal';

import { getMyWidgets } from "./customwidget/widgetApi.ts";
import BlockRenderer from "./customwidget/components/BlockRenderer.tsx";

const CATEGORY_TRANSLATIONS: Record<string, string> = {
    'My Saved': '📂 내 보관함 (Saved)',
    'System': '시스템',
    'Data & Logic': '데이터 & 로직',
    'Diary & Emotion': '다이어리 & 감정',
    'Utility': '유틸리티',
    'Decoration': '꾸미기',
    'Collection': '수집품',
    'Interactive': '인터랙티브',
    'Tool': '도구',
    'Global': '글로벌 효과',
};

// 🌟 미리보기 렌더링 헬퍼
// 🌟 [수정됨] 미리보기 렌더링 헬퍼 -> BlockRenderer 사용
const renderWidgetPreview = (widgetData: any) => {
    // DB 데이터를 안전하게 BlockRenderer용 객체로 변환
    const block: WidgetBlock = {
        id: String(widgetData.id),
        type: widgetData.type, // 'chart-pie', 'book-info' 등 원본 타입
        content: widgetData.content || {},
        styles: widgetData.styles || {}
    };

    // 🌟 일일이 switch case를 쓸 필요 없이, 만능 그리기 도구인 BlockRenderer에게 맡깁니다.
    // (pointer-events-none 처리가 부모 컨테이너에 되어 있어서 클릭 등은 방지됨)
    return (
        <div className="w-full h-full overflow-hidden transform scale-95 origin-center">
            <BlockRenderer
                block={block}
                // 미리보기용이므로 인터랙션 함수들은 빈 함수로 전달
                selectedBlockId={null}
                onSelectBlock={() => { }}
                onRemoveBlock={() => { }}
                activeContainer={{ blockId: 'root', colIndex: 0 }}
                onSetActiveContainer={() => { }}
                onUpdateBlock={() => { }}
            />
        </div>
    );
};
// ... (WidgetContainer 컴포넌트는 그대로 유지) ...
function WidgetContainer({ children, title, className = '', onInfoClick, isMobile }: { children: React.ReactNode; title: string; className?: string; onInfoClick?: (e: React.MouseEvent) => void, isMobile?: boolean }) {
    return (
        <div className={`flex flex-col w-full h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:border-blue-400 hover:shadow-md transition-all duration-200 ${className}`}>
            <div className="flex-1 min-h-0 relative isolate overflow-hidden bg-gray-50/30 flex items-center justify-center p-2">
                <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
                    {children}
                </div>
            </div>
            <div className="shrink-0 h-[40px] px-3 border-t border-gray-50 flex items-center justify-between bg-white z-10 relative">
                <h2 className="text-xs text-gray-700 font-bold truncate pr-2">{title}</h2>
                <div className={`flex items-center gap-1 transition-all ${isMobile ? 'hidden' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}>
                    <button onClick={onInfoClick} className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><HelpCircle size={12} /></button>
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Plus size={14} strokeWidth={3} /></div>
                </div>
            </div>
        </div>
    );
}

interface WidgetGalleryProps {
    onSelect?: (item: WidgetType | any) => void;
}

type CombinedWidgetEntry = {
    type: string;
    label: string;
    category: string;
    description?: string;
    keywords?: string[];
    defaultSize?: string;
    isSaved?: boolean;
    data?: any;
    createdAt?: string; // 생성일시 추가
};

export function WidgetGallery({ onSelect }: WidgetGalleryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [selectedInfoWidget, setSelectedInfoWidget] = useState<CombinedWidgetEntry | null>(null);
    const isMobile = useIsMobile();

    const [savedWidgets, setSavedWidgets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🌟 1. DB 데이터 불러오기 (로그 추가)
    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                setIsLoading(true);
                console.log("Fetching widgets..."); // 로그 확인용
                const data = await getMyWidgets();
                console.log("Fetched Data:", data); // 데이터가 잘 오는지 콘솔에서 확인하세요

                // data가 배열인지 확인
                if (Array.isArray(data)) {
                    setSavedWidgets(data);
                    if (data.length > 0) {
                        setExpandedCategories(prev => new Set(prev).add('My Saved'));
                    }
                } else {
                    console.error("Data format error: Expected array but got", data);
                }
            } catch (e) {
                console.error("Failed to load saved widgets", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWidgets();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 🌟 2. 데이터 통합
    const groupedWidgets = useMemo(() => {
        const groups: Record<string, CombinedWidgetEntry[]> = {};

        // (1) Registry (기존)
        const registryEntries = Object.entries(WIDGET_REGISTRY).map(([key, widget]) => ({
            ...widget,
            type: key,
            isSaved: false
        }));

        // (2) Saved Widgets (DB)
        const savedEntries = savedWidgets.map((widget) => ({
            type: widget.type, // book-info 등
            label: widget.name || '제목 없음',
            category: 'My Saved',
            description: `저장된 날짜: ${widget.createdAt ? new Date(widget.createdAt).toLocaleDateString() : '알 수 없음'}`,
            isSaved: true,
            data: widget,
            createdAt: widget.createdAt
        }));

        const allEntries = [...savedEntries, ...registryEntries];

        // 정렬
        allEntries.sort((a, b) => {
            if (a.category === 'My Saved' && b.category !== 'My Saved') return -1;
            if (a.category !== 'My Saved' && b.category === 'My Saved') return 1;
            if (a.category === b.category) return a.label.localeCompare(b.label);
            return a.category.localeCompare(b.category);
        });

        for (const widget of allEntries) {
            // 검색 필터
            const isMatch =
                matchKoreanSearch(widget.label, debouncedSearch, { useChosung: true }) ||
                matchKoreanSearch(widget.category, debouncedSearch, { useChosung: false }) ||
                (widget.description && matchKoreanSearch(widget.description, debouncedSearch, { useChosung: false })) ||
                (widget.keywords && widget.keywords.some(k => matchKoreanSearch(k, debouncedSearch, { useChosung: false })));

            if (debouncedSearch && !isMatch) continue;

            const cat = widget.category || 'Other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(widget);
        }

        return groups;
    }, [debouncedSearch, savedWidgets]);

    useEffect(() => {
        if (debouncedSearch) {
            setExpandedCategories(new Set(Object.keys(groupedWidgets)));
        }
    }, [debouncedSearch, groupedWidgets]);

    const toggleCategory = (category: string) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(category)) newSet.delete(category);
        else newSet.add(category);
        setExpandedCategories(newSet);
    };

    const categories = Object.keys(groupedWidgets);

    return (
        <div className="h-full flex flex-col bg-[var(--bg-card)]">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="위젯 검색 (내 보관함 포함)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-card-secondary)] border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-sm"
                        autoFocus
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 overscroll-contain">
                {isLoading && (
                    <div className="flex justify-center p-2 text-xs text-gray-400 gap-2">
                        <Loader2 className="animate-spin" size={14} /> 불러오는 중...
                    </div>
                )}

                {categories.length === 0 && !isLoading ? (
                    <div className="text-center py-10 text-[var(--text-secondary)]">
                        <p className="text-sm">검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    categories.map(category => (
                        <div key={category} className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-card-secondary)] transition-colors text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`transition-transform duration-200 ${expandedCategories.has(category) ? 'rotate-90 text-[var(--btn-bg)]' : 'text-gray-400'}`}>
                                        <ChevronRight size={16} />
                                    </div>
                                    <span className={`text-sm font-bold ${category === 'My Saved' ? 'text-indigo-500' : 'text-[var(--text-primary)]'}`}>
                                        {CATEGORY_TRANSLATIONS[category] || category}
                                    </span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 bg-[var(--bg-card)] text-[var(--text-secondary)] rounded-full border border-[var(--border-color)]">
                                    {groupedWidgets[category].length}
                                </span>
                            </button>

                            {expandedCategories.has(category) && (
                                <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in slide-in-from-top-1 duration-200">
                                    {groupedWidgets[category].map((widget, idx) => (
                                        <div
                                            key={`${widget.type}-${idx}`}
                                            className="h-[120px] cursor-pointer"
                                            onClick={() => {
                                                if (isMobile) {
                                                    setSelectedInfoWidget(widget);
                                                } else {
                                                    // 저장된건 객체 전체, 템플릿은 문자열 타입 전달
                                                    onSelect?.(widget.isSaved ? widget.data : widget.type);
                                                }
                                            }}
                                        >
                                            <WidgetContainer
                                                title={widget.label}
                                                isMobile={isMobile}
                                                onInfoClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedInfoWidget(widget);
                                                }}
                                            >
                                                {/* 🌟 렌더링 분기 */}
                                                {widget.isSaved ? (
                                                    <div className="w-full h-full transform scale-[0.8] origin-center flex items-center justify-center">
                                                        {renderWidgetPreview(widget.data)}
                                                    </div>
                                                ) : (
                                                    // 기존 템플릿 로직 (Global 예외처리 등)
                                                    widget.category === 'Global' ? (
                                                        <div className="text-gray-400 p-2 border rounded-full"><Database size={20} /></div>
                                                    ) : (
                                                        <img
                                                            src={`/thumbnails/${widget.type}.png`}
                                                            alt={widget.label}
                                                            className="w-full h-full object-contain pointer-events-none"
                                                            onError={(e) => e.currentTarget.style.display = 'none'}
                                                        />
                                                    )
                                                )}
                                            </WidgetContainer>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Info Modal */}
            {selectedInfoWidget && (
                <WidgetInfoModal
                    widget={selectedInfoWidget}
                    onClose={() => setSelectedInfoWidget(null)}
                    onAction={() => {
                        onSelect?.(selectedInfoWidget.isSaved ? selectedInfoWidget.data : selectedInfoWidget.type);
                    }}
                />
            )}
        </div>
    );
}