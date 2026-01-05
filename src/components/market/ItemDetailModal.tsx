import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Star, User } from 'lucide-react';
import type { MarketItem } from '../../data/mockMarketItems';

interface ItemDetailModalProps {
    item: MarketItem;
    onClose: () => void;
    onBuy: (item: MarketItem) => void;
    onToggleWishlist: (item: MarketItem) => void;
    isOwned: boolean;
    isWishlisted: boolean;
    effectivePrice: number;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
    item, onClose, onBuy, onToggleWishlist, isOwned, isWishlisted, effectivePrice
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Left: Image Section */}
                <div className="w-full md:w-1/2 bg-[var(--bg-card-secondary)] flex items-center justify-center p-8 relative">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-contain drop-shadow-xl"
                        />
                    ) : (
                        <div className="text-[var(--text-secondary)] flex flex-col items-center gap-4">
                            <ShoppingBag className="w-20 h-20 opacity-20" />
                            <span className="text-xl font-bold opacity-50">No Image</span>
                        </div>
                    )}
                    <div className="absolute bottom-6 left-6 flex gap-2">
                        {item.tags?.map((tag: string) => (
                            <span key={tag} className="px-3 py-1 bg-black/10 backdrop-blur-md rounded-full text-xs font-bold text-[var(--text-secondary)]">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right: Info Section */}
                <div className="w-full md:w-1/2 flex flex-col h-full bg-[var(--bg-card)]">
                    {/* Header */}
                    <div className="p-8 border-b border-[var(--border-color)]">
                        <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-1 bg-[var(--bg-card-secondary)] rounded-md text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                {item.type?.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                <Star className="w-4 h-4 fill-yellow-500" />
                                <span>4.8</span>
                                <span className="text-[var(--text-secondary)] font-normal ml-1">(124개 리뷰)</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 leading-tight">{item.title}</h2>
                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm font-medium">
                            <User className="w-4 h-4" />
                            <span>{item.author || 'Unknown Seller'}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-card)] z-10">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-[var(--btn-bg)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            상세 정보
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-[var(--btn-bg)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            리뷰
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 min-h-[200px]">
                        {activeTab === 'details' ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-[var(--text-primary)] mb-2">상품 설명</h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                                        {item.description || "설명이 없습니다."}
                                    </p>
                                </div>
                                <div className="p-4 bg-[var(--bg-card-secondary)] rounded-xl border border-[var(--border-color)]">
                                    <h4 className="font-bold text-[var(--text-primary)] text-sm mb-2">상품 정보</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-[var(--text-secondary)]">
                                        <div>출시일: {new Date().toLocaleDateString()}</div>
                                        <div>버전: 1.0.0</div>
                                        <div>크기: 2.1 MB</div>
                                        <div>라이선스: 개인 사용</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-[var(--text-primary)]">구매자 리뷰</h3>
                                    <button className="text-xs font-bold text-[var(--btn-bg)] hover:underline">리뷰 작성</button>
                                </div>
                                {/* Mock Reviews */}
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex gap-4 border-b border-[var(--border-color)] pb-4 last:border-0">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 shrink-0"></div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm text-[var(--text-primary)]">사용자 {i + 1}</span>
                                                <div className="flex text-yellow-500 gap-0.5">
                                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                                                </div>
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                정말 유용한 아이템입니다! 다이어리 꾸미기에 딱이에요. 추천합니다. 👍
                                            </p>
                                            <span className="text-[10px] text-[var(--text-disabled)] mt-2 block">2일 전</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex items-center gap-4">
                        <div className="flex flex-col">
                            {effectivePrice < item.price && (
                                <span className="text-xs text-red-500 line-through decoration-red-500/50">
                                    {item.price.toLocaleString()} C
                                </span>
                            )}
                            <span className={`text-2xl font-black ${effectivePrice < item.price ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                                {effectivePrice.toLocaleString()} C
                            </span>
                        </div>

                        <div className="flex-1 flex gap-3">
                            <button
                                onClick={() => onToggleWishlist(item)}
                                className={`p-4 rounded-xl border-2 transition-colors ${isWishlisted
                                    ? 'border-red-500/20 bg-red-500/10 text-red-500'
                                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--btn-bg)]'
                                    }`}
                            >
                                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={() => onBuy(item)}
                                disabled={isOwned}
                                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg shadow-lg transition-all transform active:scale-95
                                    ${isOwned
                                        ? 'bg-green-500/10 text-green-600 border border-green-500/20 cursor-default shadow-none'
                                        : 'bg-[var(--btn-bg)] text-[var(--btn-text)] hover:brightness-110'
                                    }`}
                            >
                                {isOwned ? '보유중' : '구매하기'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailModal;
