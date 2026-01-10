import React from 'react';
import { Search, Plus } from 'lucide-react';
import MerchCard from '../MerchCard';
import { STICKERS } from '../../post/constants';

interface MarketProductGridProps {
    filteredItems: any[];
    marketItems: any[];
    purchasedItems: any[];
    activeTab: string;
    onBuy: (item: any) => void;
    toggleWishlist: (id: string) => void;
    isOwned: (id: string) => boolean;
    isWishlisted: (id: string) => boolean;
    setSelectedItem: (item: any) => void;
    getPackPrice: (id: string, price: number) => number;
    hasMore: boolean;
    loadMore: () => void;
}

const MarketProductGrid: React.FC<MarketProductGridProps> = ({
    filteredItems,
    marketItems,
    purchasedItems,
    activeTab,
    onBuy,
    toggleWishlist,
    isOwned,
    isWishlisted,
    setSelectedItem,
    getPackPrice,
    hasMore,
    loadMore
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4">
            {filteredItems.length === 0 ? (
                <div className="col-span-full py-20 text-center text-[var(--text-secondary)] flex flex-col items-center">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-bold">아이템이 없습니다.</p>
                    {activeTab === 'wishlist' && <p className="text-sm mt-1">마음에 드는 아이템에 하트를 눌러보세요!</p>}
                </div>
            ) : (
                <>
                    {filteredItems.map((item: any) => {
                        const effectivePrice = getPackPrice(item.id, item.price);

                        // Check if this item inherits ratings from a Pack
                        let displayItem = item;
                        const stickerDef = STICKERS.find(s => s.id === item.referenceId);
                        if (stickerDef && stickerDef.packId) {
                            let packItem = marketItems.find(m => m.referenceId === stickerDef.packId);
                            // Fallback to purchased items if not in current list (e.g. filtered)
                            if (!packItem) {
                                packItem = purchasedItems.find(p => p.referenceId === stickerDef.packId);
                            }

                            if (packItem && (packItem.reviewCount || 0) > 0) {
                                displayItem = {
                                    ...item,
                                    averageRating: packItem.averageRating,
                                    reviewCount: packItem.reviewCount
                                };
                            }
                        }

                        return (
                            <MerchCard
                                key={item.id}
                                item={displayItem}
                                onBuy={onBuy}
                                onToggleWishlist={() => toggleWishlist(item.id)}
                                isOwned={isOwned(item.id)}
                                isWishlisted={isWishlisted(item.id)}
                                effectivePrice={effectivePrice}
                                onClick={() => setSelectedItem(item)}
                                onClickRating={() => setSelectedItem({ ...item, initialTab: 'reviews' })}
                            />
                        );
                    })}
                    {hasMore && filteredItems.length > 0 && activeTab !== 'wishlist' && (
                        <div className="col-span-full flex justify-center py-8">
                            <button
                                onClick={loadMore}
                                className="px-8 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm flex items-center gap-2"
                            >
                                <Plus size={16} />
                                더 보기
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MarketProductGrid;
