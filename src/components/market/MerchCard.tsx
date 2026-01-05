import React from 'react';
import { Coins, Heart, ShoppingBag, Star } from 'lucide-react';
import type { MarketItem } from '../../data/mockMarketItems';
import { useCredits } from '../../context/CreditContext';

interface MerchCardProps {
    item: MarketItem;
    onBuy: (item: MarketItem) => void;
    onToggleWishlist?: (item: MarketItem) => void;
    isOwned?: boolean;
    isWishlisted?: boolean;
    effectivePrice?: number;
    onClick?: () => void;
    onClickRating?: () => void;
}

const MerchCard: React.FC<MerchCardProps> = ({ item, onBuy, onToggleWishlist, isOwned, isWishlisted, effectivePrice, onClick, onClickRating }) => {
    const { credits } = useCredits();
    const currentPrice = effectivePrice !== undefined ? effectivePrice : item.price;
    const canAfford = credits >= currentPrice;

    // Check if discounted
    const isDiscounted = effectivePrice !== undefined && effectivePrice < item.price;

    const parseDate = (date: any) => {
        if (!date) return null;
        if (Array.isArray(date)) {
            return new Date(date[0], date[1] - 1, date[2], date[3] || 0, date[4] || 0, date[5] || 0);
        }
        return new Date(date);
    };

    return (
        <div
            onClick={onClick}
            className={`group relative bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden hover:border-[var(--btn-bg)] hover:shadow-lg transition-all duration-300 flex flex-col h-full ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Image Area */}
            <div className="aspect-square bg-[var(--bg-card-secondary)] relative overflow-hidden flex items-center justify-center p-6">
                {/* ... image code same ... */}
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        draggable={false}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm select-none"
                    />
                ) : (
                    <div className="text-[var(--text-secondary)]">No Image</div>
                )}

                {/* Overlay Badge */}
                {onToggleWishlist && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleWishlist(item);
                            }}
                            className={`p-2 rounded-full backdrop-blur-md transition-colors ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/10 text-white hover:bg-black/40'}`}
                        >
                            <Heart className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] backdrop-blur-sm">
                        {item.type.replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-[var(--text-primary)] mb-1 truncate">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 flex-1">{item.description}</p>

                <div className="flex items-center justify-between mt-auto">
                    {/* Rating if available */}
                    {(() => {
                        const createdDate = parseDate(item.createdAt);
                        const isNew = createdDate ? (new Date().getTime() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000) : false;
                        const hasRating = (item.averageRating || 0) > 0 || (item.reviewCount || 0) > 0;

                        if (hasRating) {
                            return (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClickRating?.();
                                    }}
                                    className="flex items-center gap-1 text-[var(--text-secondary)] text-xs font-medium cursor-pointer hover:bg-[var(--bg-card-secondary)] rounded px-1 transition-colors"
                                >
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    <span className="text-[var(--text-primary)] font-bold">{item.averageRating?.toFixed(1) || '0.0'}</span>
                                    <span className="opacity-50">({item.reviewCount || 0})</span>
                                </div>
                            );
                        } else if (isNew) {
                            return (
                                <div className="text-[10px] text-[var(--text-disabled)] font-medium bg-[var(--bg-card-secondary)] px-1.5 py-0.5 rounded-md">
                                    New
                                </div>
                            );
                        } else {
                            return (
                                <div className="flex items-center gap-1 text-[var(--text-secondary)] text-xs font-medium opacity-50">
                                    <Star className="w-3 h-3 text-[var(--text-disabled)]" />
                                    <span className="font-bold">0.0</span>
                                    <span>(0)</span>
                                </div>
                            );
                        }
                    })()}

                    <div className="flex flex-col items-end gap-0.5 ml-auto">
                        {isDiscounted && !isOwned && (
                            <span className="text-[10px] text-red-400 line-through decoration-red-400/50">
                                {item.price.toLocaleString()} C
                            </span>
                        )}
                        <div className={`flex items-center gap-1.5 font-bold ${isDiscounted && !isOwned ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                            <Coins className={`w-4 h-4 ${isDiscounted && !isOwned ? 'text-red-500' : 'text-yellow-500'}`} />
                            {currentPrice.toLocaleString()}
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBuy(item);
                    }}
                    disabled={isOwned || (!canAfford && !isOwned)}
                    className={`mt-4 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all 
                        ${isOwned
                            ? 'bg-green-500/10 text-green-600 border border-green-500/20 cursor-default'
                            : canAfford
                                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] hover:brightness-110 active:scale-95 shadow-md hover:shadow-lg'
                                : 'bg-[var(--bg-card-secondary)] text-[var(--text-disabled)] cursor-not-allowed'
                        }`}
                >
                    {isOwned ? (
                        '보유중'
                    ) : (
                        <>
                            <ShoppingBag className="w-4 h-4" />
                            {canAfford ? '구매하기' : '크레딧 부족'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MerchCard;
