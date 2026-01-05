import React from 'react';
import { Coins, Heart, ShoppingBag } from 'lucide-react';
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
}

const MerchCard: React.FC<MerchCardProps> = ({ item, onBuy, onToggleWishlist, isOwned, isWishlisted, effectivePrice, onClick }) => {
    const { credits } = useCredits();
    const currentPrice = effectivePrice !== undefined ? effectivePrice : item.price;
    const canAfford = credits >= currentPrice;

    // Check if discounted
    const isDiscounted = effectivePrice !== undefined && effectivePrice < item.price;

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
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm"
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
                    <div className="flex flex-col items-start gap-0.5">
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
