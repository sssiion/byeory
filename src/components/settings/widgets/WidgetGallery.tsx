import { useState } from 'react'; // React import
import { useWidgetRegistry } from "./useWidgetRegistry.ts";
import type { WidgetConfig } from "./type.ts";
import { X, Check } from 'lucide-react'; // Icon imports

// MainPage에서 넘겨주는 props 이름(onSelect, onEdit)과 일치시킵니다.
interface WidgetGalleryProps {
    onSelect: (widgetType: string) => void; // 문자열(ID)을 넘기도록 수정
    onMultiSelect?: (items: WidgetConfig[]) => void; // 다중 선택 처리를 위한 prop 추가
    onEdit?: (data: WidgetConfig) => void; // MainPage에서 onEdit도 넘겨주고 있으므로 추가
}

export const WidgetGallery = ({ onSelect, onMultiSelect, onEdit }: WidgetGalleryProps) => {
    // 훅을 통해 DB에서 위젯 정보를 가져옴
    const { registry, isLoading, error } = useWidgetRegistry();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWidgets, setSelectedWidgets] = useState<WidgetConfig[]>([]); // 장바구니 상태

    const handleCardClick = (widget: WidgetConfig) => {
        setSelectedWidgets(prev => [...prev, widget]);
    };

    const handleRemoveFromCart = (index: number) => {
        setSelectedWidgets(prev => prev.filter((_, i) => i !== index));
    };

    const handleApply = () => {
        if (selectedWidgets.length === 0) return;

        if (onMultiSelect) {
            onMultiSelect(selectedWidgets);
        } else {
            // Fallback for when onMultiSelect is not passed (legacy support)
            selectedWidgets.forEach(widget => {
                onSelect(widget.widgetType);
            });
        }
    };

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
        'Utility',
        'Diary & Emotion',
        'Interactive',
        'Data & Logic',
        'Decoration & Collection',
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
            <div className="border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-20 shadow-sm">
                <div className="p-4 pb-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search widgets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--icon-color)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* 장바구니 (Selected Widgets) 영역 - 하나라도 선택되었을 때만 노출 or 항상 노출? 사용성을 위해 항상 노출하되 비어있으면 안내문구 */}
                <div className="px-4 pb-4">
                    <div className="bg-[var(--bg-card-secondary)]/50 rounded-xl border border-[var(--border-color)] p-3 transition-all">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <span>추가 할 위젯</span>
                                <span className="bg-[var(--btn-bg)] text-white text-[10px] px-1.5 py-0.5 rounded-full">{selectedWidgets.length}</span>
                            </h3>
                            {selectedWidgets.length > 0 && (
                                <button
                                    onClick={handleApply}
                                    className="bg-[var(--btn-bg)] hover:brightness-110 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm active:scale-95"
                                >
                                    <Check size={12} />
                                    적용하기
                                </button>
                            )}
                        </div>

                        {selectedWidgets.length === 0 ? (
                            <div className="text-xs text-[var(--text-secondary)] py-2 text-center opacity-70">
                                아래 목록에서 위젯을 선택하여 담아보세요.
                            </div>
                        ) : (
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar p-3 pt-4">
                                {selectedWidgets.map((widget, idx) => (
                                    <div key={`${widget.widgetType}-${idx}`} className="flex-shrink-0 relative group">
                                        <div className="w-16 h-16 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] flex flex-col items-center justify-center p-1 overflow-hidden">
                                            {widget.thumbnail ? (
                                                <img src={widget.thumbnail} alt={widget.label} className="w-full h-full object-contain opacity-80" />
                                            ) : (
                                                <div className="text-[10px] text-center break-all leading-tight text-[var(--text-secondary)]">{widget.label}</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFromCart(idx)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:scale-110 transition-transform"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 스크롤 가능한 위젯 목록 영역 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20 flex flex-col gap-6">
                {CATEGORY_ORDER.map((category) => {
                    const categoryWidgets = groupedWidgets[category];
                    if (!categoryWidgets || categoryWidgets.length === 0) return null;

                    return (
                        <div key={category} className="bg-[var(--bg-card-secondary)] rounded-3xl p-6 border border-[var(--border-color)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 px-1 flex items-center gap-2">
                                <span className="w-1.5 h-6 rounded-full bg-[var(--btn-bg)] inline-block"></span>
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryWidgets.map((widget) => {
                                    // 현재 장바구니에 이 위젯이 몇 개 담겼는지 카운트
                                    const selectedCount = selectedWidgets.filter(w => w.widgetType === widget.widgetType).length;

                                    return (
                                        <div
                                            key={widget.widgetType}
                                            className={`border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm group flex flex-col relative
                                                ${selectedCount > 0
                                                    ? 'border-[var(--btn-bg)] bg-[var(--bg-card)] ring-1 ring-[var(--btn-bg)]'
                                                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-secondary)]'}`}
                                            onClick={() => handleCardClick(widget)}
                                        >
                                            {/* 선택된 개수 뱃지 */}
                                            {selectedCount > 0 && (
                                                <div className="absolute top-3 right-3 bg-[var(--btn-bg)] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200 z-10">
                                                    {selectedCount}
                                                </div>
                                            )}

                                            {widget.thumbnail && (
                                                <div className="w-full bg-[var(--bg-card-secondary)] rounded-lg mb-4 overflow-hidden border border-[var(--border-color)] flex items-center justify-center">
                                                    <img
                                                        src={widget.thumbnail}
                                                        alt={widget.label}
                                                        className="w-full h-auto object-contain max-h-48"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none'; // 이미지 로드 실패 시 숨김
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="w-full flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-[var(--text-primary)] w-full">{widget.label}</h3>

                                                {/* 편집 가능한 위젯인 경우 Edit 버튼 표시 (onEdit이 있을 때만) */}
                                                {onEdit && !widget.isSystem && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // 부모 클릭 방지
                                                            onEdit(widget);
                                                        }}
                                                        className="text-xs px-2 py-1 bg-[var(--bg-card-secondary)] rounded hover:brightness-95 text-[var(--text-secondary)] border border-[var(--border-color)] transition-all z-20"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 h-10 w-full text-left">
                                                {widget.description}
                                            </p>

                                            <div className="flex gap-2 text-xs flex-wrap w-full justify-start">
                                                {widget.validSizes && widget.validSizes.length > 5 ? (
                                                    <span className="px-2 py-1 bg-[var(--bg-card-secondary)] text-[var(--btn-bg)] rounded border border-[var(--border-color)] font-medium opacity-90">
                                                        다양한 크기
                                                    </span>
                                                ) : (
                                                    (widget.validSizes || [[1, 1]]).map(([w, h], idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-[var(--bg-card-secondary)] text-[var(--btn-bg)] rounded border border-[var(--border-color)] font-medium opacity-90"
                                                        >
                                                            {w}x{h}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {widgets.length === 0 && (
                    <div className="text-center py-10 text-[var(--text-secondary)]">
                        No widgets found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};