import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, HelpCircle, Loader2, Database, Plus, Trash2, Pencil } from 'lucide-react';
import { WIDGET_REGISTRY, type WidgetType } from './Registry';
import { matchKoreanSearch } from '../../../utils/searchUtils';
import { useIsMobile } from '../../../hooks';
import type { WidgetBlock } from "./customwidget/types.ts";
import { WidgetInfoModal } from './WidgetInfoModal';

import { getMyWidgets, deleteWidget } from "./customwidget/widgetApi.ts";
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
const renderWidgetPreview = (widgetData: any) => {
    const block: WidgetBlock = {
        id: String(widgetData.id),
        type: widgetData.type,
        content: widgetData.content || {},
        styles: widgetData.styles || {}
    };

    return (
        <div className="w-full h-full overflow-hidden transform scale-95 origin-center">
            <BlockRenderer
                block={block}
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

function WidgetContainer({ children, title, className = '', onInfoClick, isMobile, buttons }: {
    children: React.ReactNode;
    title: string;
    className?: string;
    onInfoClick?: (e: React.MouseEvent) => void;
    isMobile?: boolean;
    buttons?: React.ReactNode;
}) {
    return (
        <div className={`flex flex-col w-full h-full bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden group hover:border-blue-400 hover:shadow-md transition-all duration-200 ${className}`}>
            <div className="flex-1 min-h-0 relative isolate overflow-hidden bg-[var(--bg-card-secondary)]/30 flex items-center justify-center p-2">
                <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
                    {children}
                </div>
            </div>
            <div className="shrink-0 h-[40px] px-3 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)] z-10 relative">
                <h2 className="text-xs text-[var(--text-primary)] font-bold truncate pr-2 flex-1">{title}</h2>
                <div className={`flex items-center gap-1 transition-all ${isMobile ? 'hidden' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}>
                    {buttons ? buttons : (
                        <>
                            <button onClick={onInfoClick} className="w-6 h-6 rounded-full bg-[var(--bg-card-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors"><HelpCircle size={12} /></button>
                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Plus size={14} strokeWidth={3} /></div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

interface WidgetGalleryProps {
    onSelect?: (item: WidgetType | any) => void;
    onEdit?: (item: any) => void;
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
    createdAt?: string;
};

export function WidgetGallery({ onSelect, onEdit }: WidgetGalleryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [selectedInfoWidget, setSelectedInfoWidget] = useState<CombinedWidgetEntry | null>(null);
    const isMobile = useIsMobile();

    const [savedWidgets, setSavedWidgets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🌟 1. DB 데이터 불러오기
    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                setIsLoading(true);
                const data = await getMyWidgets();
                if (Array.isArray(data)) {
                    setSavedWidgets(data);
                    if (data.length > 0) {
                        setExpandedCategories(prev => new Set(prev).add('My Saved'));
                    }
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

        const registryEntries = Object.entries(WIDGET_REGISTRY).map(([key, widget]) => ({
            ...widget,
            type: key,
            isSaved: false
        }));

        const savedEntries = savedWidgets.map((widget) => ({
            type: widget.type,
            label: widget.name || '제목 없음',
            category: 'My Saved',
            description: `저장된 날짜: ${widget.createdAt ? new Date(widget.createdAt).toLocaleDateString() : '알 수 없음'}`,
            isSaved: true,
            data: widget,
            createdAt: widget.createdAt
        }));

        const allEntries: CombinedWidgetEntry[] = [...savedEntries, ...registryEntries];

        allEntries.sort((a, b) => {
            if (a.category === 'My Saved' && b.category !== 'My Saved') return -1;
            if (a.category !== 'My Saved' && b.category === 'My Saved') return 1;
            if (a.category === b.category) return a.label.localeCompare(b.label);
            return a.category.localeCompare(b.category);
        });

        for (const widget of allEntries) {
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
        <div className="h-full flex flex-col bg-[var(--bg-card)] dark:bg-slate-900">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] dark:bg-slate-900 sticky top-0 z-20">
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
                                                buttons={widget.isSaved ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit?.(widget.data);
                                                            }}
                                                            className="w-6 h-6 rounded-full bg-[var(--bg-card-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                                                            title="수정"
                                                        >
                                                            <Pencil size={12} />
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (confirm('정말 삭제하시겠습니까?')) {
                                                                    try {
                                                                        const id = widget.data?.id || widget.data?._id;
                                                                        if (id) {
                                                                            await deleteWidget(id);
                                                                            setSavedWidgets(prev => prev.filter(w => (w.id || w._id) !== id));
                                                                        }
                                                                    } catch (err) {
                                                                        alert('삭제 실패');
                                                                    }
                                                                }
                                                            }}
                                                            className="w-6 h-6 rounded-full bg-[var(--bg-card-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-red-100 hover:text-red-500 transition-colors"
                                                            title="삭제"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedInfoWidget(widget);
                                                            }}
                                                            className="w-6 h-6 rounded-full bg-[var(--bg-card-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors"
                                                            title="정보"
                                                        >
                                                            <HelpCircle size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onSelect?.(widget.data);
                                                            }}
                                                            className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                                                            title="추가"
                                                        >
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ) : undefined}
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
                )
                }
            </div >

            {/* Info Modal */}
            {
                selectedInfoWidget && (
                    <WidgetInfoModal
                        widget={selectedInfoWidget}
                        onClose={() => setSelectedInfoWidget(null)}
                        onAction={() => {
                            onSelect?.(selectedInfoWidget.isSaved ? selectedInfoWidget.data : selectedInfoWidget.type);
                        }}
                    />
                )
            }
        </div >
    );
}
