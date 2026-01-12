import React from 'react';
import { X, Check, User, Tag, Search } from 'lucide-react';

interface MarketFilterBarProps {
    totalCount: number;
    sellerId: string | null;
    sellerName?: string | null;
    filterBySeller: (id: string | null) => void;
    selectedTags: string[];
    filterByTag: (tag: string | null) => void;
    keyword?: string;
    onClearSearch?: () => void;
    onClearAll: () => void;
    hideOwned: boolean;
    setHideOwned: (hide: boolean) => void;
    sort: string;
    changeSort: (sort: any) => void;
    isFree?: boolean;
    setIsFree?: (isFree: boolean) => void;
}

const SORT_OPTIONS = [
    { id: 'popular', label: '인기순' },
    { id: 'latest', label: '최신순' },
    { id: 'price_low', label: '낮은가격순' },
    { id: 'price_high', label: '높은가격순' }
];

const MarketFilterBar: React.FC<MarketFilterBarProps> = ({
    totalCount,
    sellerId,
    sellerName,
    filterBySeller,
    selectedTags,
    filterByTag,
    keyword,
    onClearSearch,
    onClearAll,
    hideOwned,
    setHideOwned,
    sort,
    changeSort,
    isFree,
    setIsFree
}) => {
    const hasActiveFilters = sellerId || selectedTags.length > 0 || (keyword && keyword.trim() !== '');

    return (
        <div className="flex flex-col gap-4 px-2">
            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-3 py-1 border-b border-[var(--border-color)] pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="text-[10px] font-black text-[var(--text-secondary)] flex items-center gap-1.5 uppercase tracking-widest opacity-60">
                        적용된 필터
                    </span>

                    <div className="flex flex-wrap gap-2">
                        {/* Keyword Chip */}
                        {keyword && keyword.trim() !== '' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-full text-sm font-bold shadow-sm">
                                <Search size={14} className="text-[var(--text-secondary)]" />
                                <span>검색: "{keyword}"</span>
                                <button
                                    onClick={onClearSearch}
                                    className="hover:bg-[var(--border-color)] rounded-full p-0.5 transition-colors"
                                    title="검색 초기화"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Seller Chip */}
                        {sellerId && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--btn-bg)] text-white rounded-full text-sm font-bold shadow-sm transition-all hover:brightness-110">
                                <User size={14} />
                                <span>판매자: {sellerName || sellerId}</span>
                                <button
                                    onClick={() => filterBySeller(null)}
                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                    title="판매자 필터 해제"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Tag Chips */}
                        {selectedTags.map(tag => (
                            <div
                                key={tag}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-full text-sm font-bold shadow-sm animate-in zoom-in duration-200"
                            >
                                <Tag size={14} className="text-[var(--btn-bg)]" />
                                <span>#{tag}</span>
                                <button
                                    onClick={() => filterByTag(tag)}
                                    className="hover:bg-[var(--border-color)] rounded-full p-0.5 transition-colors"
                                    title="태그 해제"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onClearAll}
                        className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--btn-bg)] underline-offset-4 hover:underline transition-all ml-auto"
                    >
                        모든 필터 초기화
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[var(--text-primary)]">
                        {totalCount.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-secondary)] tracking-tight">
                        개의 상품이 있습니다
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto">
                    {/* Toggles Group */}
                    <div className="flex items-center gap-5 shrink-0">
                        {/* Free Only Toggle */}
                        {setIsFree && (
                            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isFree ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)] shadow-sm' : 'border-[var(--border-color)] group-hover:border-[var(--text-secondary)]'}`}>
                                    {isFree && <Check size={14} className="text-white stroke-[3px]" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isFree}
                                    onChange={(e) => setIsFree(e.target.checked)}
                                    className="hidden"
                                />
                                <span className={`text-sm font-bold transition-colors ${isFree ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>무료 상품</span>
                            </label>
                        )}

                        {/* Hide Owned Toggle */}
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${hideOwned ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)] shadow-sm' : 'border-[var(--border-color)] group-hover:border-[var(--text-secondary)]'}`}>
                                {hideOwned && <Check size={14} className="text-white stroke-[3px]" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={hideOwned}
                                onChange={(e) => setHideOwned(e.target.checked)}
                                className="hidden"
                            />
                            <span className={`text-sm font-bold transition-colors ${hideOwned ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>보유 상품 숨기기</span>
                        </label>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-[var(--border-color)] opacity-50"></div>

                    {/* Sort Buttons */}
                    <div className="flex items-center p-1 bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
                        {SORT_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => changeSort(opt.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${sort === opt.id
                                    ? 'bg-[var(--btn-bg)] text-white shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketFilterBar;
