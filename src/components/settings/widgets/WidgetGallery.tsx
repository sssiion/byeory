import { useState } from 'react';
import { useWidgetRegistry } from "./useWidgetRegistry.ts";
import type { WidgetConfig } from "./type.ts";

// MainPage에서 넘겨주는 props 이름(onSelect, onEdit)과 일치시킵니다.
interface WidgetGalleryProps {
    onSelect: (widgetType: string) => void; // 문자열(ID)을 넘기도록 수정
    onEdit?: (data: WidgetConfig) => void;           // MainPage에서 onEdit도 넘겨주고 있으므로 추가
}

export const WidgetGallery = ({ onSelect, onEdit }: WidgetGalleryProps) => {
    // 훅을 통해 DB에서 위젯 정보를 가져옴
    const { registry, isLoading, error } = useWidgetRegistry();
    const [searchTerm, setSearchTerm] = useState('');

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">위젯 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">위젯 목록 로딩 실패</div>;
    }

    // registry 객체를 배열로 변환
    const allWidgets = Object.values(registry);

    // 검색어 필터링
    const widgets = allWidgets.filter(widget => {
        const term = searchTerm.toLowerCase();
        return (
            widget.label.toLowerCase().includes(term) ||
            (widget.description && widget.description.toLowerCase().includes(term))
        );
    });

    // 카테고리 순서 정의
    const CATEGORY_ORDER = [
        'System',
        'Data & Logic',
        'Diary & Emotion',
        'Utility',
        'Decoration & Collection',
        'Interactive',
        'Global Controllers',
        'Uncategorized'
    ];

    // 위젯을 카테고리별로 그룹화
    const groupedWidgets = widgets.reduce((acc, widget) => {
        const category = widget.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(widget);
        return acc;
    }, {} as Record<string, WidgetConfig[]>);

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            {/* 검색 입력창 고정 영역 */}
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-10">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search widgets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* 스크롤 가능한 위젯 목록 영역 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20 flex flex-col gap-6">
                {CATEGORY_ORDER.map((category) => {
                    const categoryWidgets = groupedWidgets[category];
                    if (!categoryWidgets || categoryWidgets.length === 0) return null;

                    return (
                        <div key={category} className="flex flex-col gap-3">
                            <h2 className="text-sm font-bold text-[var(--accent-color)] uppercase tracking-wider px-1">
                                {category}
                            </h2>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {categoryWidgets.map((widget) => (
                                    <div
                                        key={widget.widgetType}
                                        className="border border-[var(--border-color)] rounded-xl p-4 cursor-pointer hover:bg-[var(--bg-card-secondary)] transition-all hover:scale-[1.02] active:scale-95 bg-[var(--bg-card)] shadow-sm group"
                                        onClick={() => {
                                            // 🌟 중요: 객체 전체가 아니라 'widgetType'(문자열)만 넘겨야 MainPage의 addWidget이 정상 작동함
                                            onSelect(widget.widgetType);
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-[var(--text-primary)]">{widget.label}</h3>

                                            {/* 편집 가능한 위젯인 경우 Edit 버튼 표시 (onEdit이 있을 때만) */}
                                            {onEdit && !widget.isSystem && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 부모 클릭 방지
                                                        onEdit(widget);
                                                    }}
                                                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-600"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 h-10">
                                            {widget.description}
                                        </p>

                                        <div className="flex gap-2 text-xs flex-wrap">
                                            <span className="px-2 py-1 bg-[var(--bg-card-secondary)] rounded text-[var(--text-secondary)] border border-[var(--border-color)]">
                                                {widget.category || 'Uncategorized'}
                                            </span>
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 font-medium">
                                                {widget.defaultSize}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {widgets.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        No widgets found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};