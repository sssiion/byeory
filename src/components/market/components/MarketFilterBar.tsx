import React from 'react';
import { X, Check } from 'lucide-react';

interface MarketFilterBarProps {
    totalCount: number;
    sellerId: string | null;
    filterBySeller: (id: string | null) => void;
    selectedTags: string[];
    filterByTag: (tag: string | null) => void;
    onClearAll: () => void;
    hideOwned: boolean;
    setHideOwned: (hide: boolean) => void;
    sort: string;
    changeSort: (sort: any) => void;
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
    filterBySeller,
    selectedTags,
    filterByTag,
    onClearAll,
    hideOwned,
    setHideOwned,
    sort,
    changeSort
}) => {
    return (
        <div className="flex flex-col gap-2 -mb-4 px-2">
            {sellerId && (
                <div className="flex items-center gap-2">
                    <p className="text-[var(--text-secondary)]">
                        나만의 디지털 아이템을 거래해보세요 <span className="text-sm font-semibold opacity-70 ml-2">(Total {totalCount})</span>
                    </p>
                    <button
                        onClick={() => filterBySeller(null)}
                        className="flex items-center gap-1 px-2 py-1 bg-[var(--btn-bg)] text-white text-xs font-bold rounded-full hover:brightness-110"
                    >
                        <span>필터 해제</span>
                        <X size={12} />
                    </button>
                </div>
            )}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-[var(--text-secondary)] mr-1">태그:</span>
                    {selectedTags.map(tag => (
                        <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200">
                            <span>#{tag}</span>
                            <button
                                onClick={() => filterByTag(tag)}
                                className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={onClearAll}
                        className="text-xs text-gray-500 hover:text-gray-700 underline ml-1"
                    >
                        전체 해제
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 gap-3 md:gap-0">
                <span className="text-sm font-bold text-[var(--text-secondary)]">
                    총 {totalCount}개의 아이템
                </span>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    {/* Hide Owned Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none group shrink-0">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${hideOwned ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)]' : 'border-[var(--text-secondary)] group-hover:border-[var(--text-primary)]'}`}>
                            {hideOwned && <Check size={12} className="text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={hideOwned}
                            onChange={(e) => setHideOwned(e.target.checked)}
                            className="hidden"
                        />
                        <span className={`text-xs font-bold ${hideOwned ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>보유 상품 숨기기</span>
                    </label>

                    <div className="hidden sm:block h-4 w-[1px] bg-[var(--border-color)]"></div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {SORT_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => changeSort(opt.id)}
                                className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${sort === opt.id
                                    ? 'bg-[var(--btn-bg)] text-white'
                                    : 'text-[var(--text-secondary)] bg-[var(--bg-card)] sm:bg-transparent border sm:border-0 border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'
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
