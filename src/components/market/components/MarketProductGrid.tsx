import React from 'react';
import { Search, Plus } from 'lucide-react';
// import { useMarket } from '../../../hooks';
import { useCredits } from '../../../context/CreditContext';
import { STICKERS } from '../../post/constants';
import MerchCard from '../MerchCard';

interface MarketProductGridProps {
    filteredItems: any[];
    setSelectedItem: (item: any) => void;
    hasMore: boolean;
    loadMore: () => void;
    onBuy: (item: any) => void;
    // Props passed from parent to share state
    getPackPrice: (packId: string, originalPrice: number) => number;
    isOwned: (itemId: string) => boolean;
    toggleWishlist: (item: any) => void;
    isWishlisted: (itemId: string) => boolean;
    marketItems: any[];
    purchasedItems: any[];
}

const MarketProductGrid: React.FC<MarketProductGridProps> = ({
    filteredItems,
    setSelectedItem,
    hasMore,
    loadMore,
    onBuy,
    getPackPrice,
    isOwned,
    toggleWishlist,
    isWishlisted,
    marketItems,
    purchasedItems
}) => {
    const { userId } = useCredits();
    // Removed local useMarket hook to use shared state from parent
    // const { getPackPrice, toggleWishlist, isOwned, isWishlisted, marketItems, purchasedItems } = useMarket();

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4">
            {filteredItems.length === 0 ? (
                <div className="col-span-full py-20 text-center text-[var(--text-secondary)] flex flex-col items-center">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-bold">아이템이 없습니다.</p>
                    {/* {activeTab === 'wishlist' && <p className="text-sm mt-1">마음에 드는 아이템에 하트를 눌러보세요!</p>} - ActiveTab not available here without prop, removed for now or should pass it */}
                </div>
            ) : (
                <>
                    {filteredItems.map((item: any) => {
                        // Check logic: If item has referenceId (likely a pack/composite), try to get dynamic price.
                        // If it's a simple item, getPackPrice should return original price anyway but checking referenceId is safer for intent.
                        const effectivePrice = item.referenceId
                            ? getPackPrice(item.referenceId, item.price)
                            : item.price;

                        // Inherit rating from pack if available
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
                                onBuy={() => onBuy(item)}
                                // ... other props
                                onToggleWishlist={() => toggleWishlist(item as any)}
                                isOwned={isOwned(item.id)}
                                isWishlisted={isWishlisted(item.id)}
                                isMyItem={item.sellerId === String(userId)}
                                effectivePrice={effectivePrice}
                                onClick={() => setSelectedItem(item)}
                                onClickRating={() => setSelectedItem({ ...item, initialTab: 'reviews' })}
                            />
                        );
                    })}
                    {/* We need to pass activeTab prop to check 'wishlist' here if we keep this logic, or remove activeTab dependency */}
                    {hasMore && filteredItems.length > 0 && (
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
