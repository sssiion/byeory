import React from 'react';
import { Plus } from 'lucide-react';

interface MarketMyShopViewProps {
    sellingItems: any[];
    mySellableCandidates: any[];
    handleSell: (item: any, isEdit?: boolean) => void;
    cancelItem: (id: string) => void;
}

const MarketMyShopView: React.FC<MarketMyShopViewProps> = ({
    sellingItems,
    mySellableCandidates,
    handleSell,
    cancelItem
}) => {
    return (
        <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4">
            {/* Dashboard */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)]">
                    <h3 className="text-xs text-[var(--text-secondary)] font-bold uppercase">총 수익</h3>
                    <p className="text-2xl font-black text-[var(--text-primary)] mt-1">
                        {(sellingItems.reduce((acc, cur) => acc + (cur.price || 0) * (cur.salesCount || 0), 0)).toLocaleString()} C
                    </p>
                </div>
                <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)]">
                    <h3 className="text-xs text-[var(--text-secondary)] font-bold uppercase">판매 수</h3>
                    <p className="text-2xl font-black text-blue-500 mt-1">
                        {sellingItems.reduce((acc, cur) => acc + (cur.salesCount || 0), 0)}
                    </p>
                </div>
                <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)]">
                    <h3 className="text-xs text-[var(--text-secondary)] font-bold uppercase">판매 중</h3>
                    <p className="text-2xl font-black text-green-500 mt-1">
                        {sellingItems.filter(i => i.status === 'ON_SALE').length}
                    </p>
                </div>
            </div>

            {/* Selling Items */}
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold px-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    판매 관리
                </h2>
                {sellingItems.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)] px-1">판매 내역이 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...sellingItems]
                            .filter(item => item.status !== 'CANCELLED')
                            .sort((a, b) => {
                                // Date Priority: Newest First
                                const dateA = new Date(a.createdAt || 0).getTime();
                                const dateB = new Date(b.createdAt || 0).getTime();
                                return dateB - dateA;
                            })
                            .map((item, idx) => {
                                const status = item.status || 'ON_SALE'; // Default to ON_SALE if undefined (legacy)
                                const isCanceled = status === 'CANCELLED';
                                const badgeColor = isCanceled ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' :
                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900';
                                const statusText = isCanceled ? '판매 중지됨' : '판매 중';

                                return (
                                    <div key={`${item.id}-${idx}`} className={`bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col gap-3 relative transition-colors ${!isCanceled ? 'hover:border-green-500/50' : ''} ${isCanceled ? 'opacity-60' : ''}`}>
                                        <div className={`absolute top-3 right-3 px-2 py-1 text-[10px] font-bold rounded-full border ${badgeColor}`}>
                                            {statusText}
                                        </div>
                                        <div className="aspect-video bg-[var(--bg-card-secondary)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider overflow-hidden">
                                            {(item.imageUrl || item.thumbnailUrl) ? (
                                                <img src={item.imageUrl || item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                (item.type as string).toLowerCase() === 'template_widget' ? '위젯 템플릿' :
                                                    (item.type as string).toLowerCase() === 'template_post' ? '게시물 템플릿' :
                                                        (item.type as string).toLowerCase() === 'sticker' ? '스티커' :
                                                            (item.type as string).toLowerCase() === 'package' ? '패키지' :
                                                                (item.type as string).toLowerCase() === 'start_pack' ? '패키지' :
                                                                    item.type
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
                                            <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">{item.price} C</p>
                                        </div>
                                        <div className="flex gap-2 w-full mt-auto">
                                            <button
                                                onClick={() => {
                                                    if (confirm(`'${item.title}' 판매를 중지하시겠습니까?`)) {
                                                        cancelItem(item.id);
                                                    }
                                                }}
                                                disabled={isCanceled}
                                                className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-colors
                                                ${isCanceled
                                                        ? 'border-transparent text-[var(--text-disabled)] cursor-not-allowed bg-[var(--bg-card-secondary)]'
                                                        : 'border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    }`}
                                            >
                                                {isCanceled ? '판매 중지됨' : '판매 중지'}
                                            </button>
                                            {!isCanceled && (
                                                <button
                                                    onClick={() => handleSell(item, true)}
                                                    className="flex-1 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] text-xs font-bold transition-colors"
                                                >
                                                    수정
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                )}
            </div>

            {/* Register Section */}
            <div className="flex flex-col gap-4">
                <div className="px-1">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-[var(--btn-bg)]" />
                        판매 등록 가능
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        보유한 위젯 템플릿과 스티커를 마켓에 등록해보세요.
                    </p>
                </div>

                {mySellableCandidates.length === 0 ? (
                    <div className="py-20 text-center text-[var(--text-secondary)] bg-[var(--bg-card-secondary)] rounded-2xl border border-dashed border-[var(--border-color)]">
                        <p className="text-sm">판매할 수 있는 아이템이 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {mySellableCandidates.map((item, idx) => (
                            <div key={`${item.source}-${item.id}-${idx}`} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col gap-3 group hover:border-[var(--btn-bg)] transition-colors relative">
                                <div className="aspect-video bg-[var(--bg-card-secondary)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider overflow-hidden">
                                    {(item.imageUrl || item.thumbnailUrl) ? (
                                        <img src={item.imageUrl || item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        item.type === 'template_widget' ? '위젯 템플릿' :
                                            item.type === 'sticker' ? '스티커' :
                                                item.type === 'template_post' ? '게시물 템플릿' :
                                                    item.type === 'package' ? '패키지' :
                                                        item.type === 'start_pack' ? '패키지' :
                                                            '로컬 아이템'
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
                                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">{item.description}</p>
                                </div>
                                <button
                                    onClick={() => handleSell(item)}
                                    disabled={item.isAlreadySelling}
                                    className={`mt-auto w-full py-2 rounded-lg text-xs font-bold transition-colors
                                        ${item.isAlreadySelling
                                            ? 'bg-[var(--bg-card-secondary)] text-[var(--text-disabled)] cursor-not-allowed border border-[var(--border-color)]'
                                            : 'bg-[var(--bg-card-secondary)] text-[var(--text-primary)] hover:bg-[var(--btn-bg)] hover:text-white'
                                        }`}
                                >
                                    {item.isAlreadySelling ? '이미 등록됨' : '판매 등록하기'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketMyShopView;
