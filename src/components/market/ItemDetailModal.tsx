import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Star, User } from 'lucide-react';
import { useCredits } from '../../context/CreditContext';
import type { MarketItem } from '../../data/mockMarketItems';

interface ItemDetailModalProps {
    item: MarketItem;
    onClose: () => void;
    onBuy: (item: MarketItem) => void;
    onToggleWishlist: (item: MarketItem) => void;
    isOwned: boolean;
    isWishlisted: boolean;
    effectivePrice: number;
    initialTab?: 'details' | 'reviews';
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
    item, onClose, onBuy, onToggleWishlist, isOwned, isWishlisted, effectivePrice, initialTab = 'details'
}) => {
    const { userId } = useCredits();
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>(initialTab);
    const [reviews, setReviews] = useState<any[]>([]);
    const [newRating, setNewRating] = useState(5);
    const [newReviewContent, setNewReviewContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        if (item) {
            fetchReviews();
        }
    }, [item]);

    const fetchReviews = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`http://localhost:8080/api/market/reviews/${item.id}`, {
                headers
            });
            if (res.ok) {
                const data = await res.json();
                // Sort: My review first, then by Id desc (newest)
                data.sort((a: any, b: any) => {
                    // Check if a or b is my review. ReviewResponse userId is number, context userId is string
                    const isMyReviewA = String(a.userId) === String(userId);
                    const isMyReviewB = String(b.userId) === String(userId);
                    if (isMyReviewA && !isMyReviewB) return -1;
                    if (!isMyReviewA && isMyReviewB) return 1;
                    return b.id - a.id;
                });
                setReviews(data);
            }
        } catch (e) {
            console.error("Failed to fetch reviews", e);
        }
    };

    const handlePostReview = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!newReviewContent.trim()) {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:8080/api/market/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    marketItemId: item.id,
                    content: newReviewContent,
                    rating: newRating
                })
            });

            if (res.ok) {
                await fetchReviews();
                setNewReviewContent('');
                setNewRating(5);
                alert("리뷰가 등록되었습니다.");
            } else {
                const errorText = await res.text();
                if (res.status === 400 || res.status === 409) {
                    alert(`리뷰 등록 실패: ${errorText || "이미 등록했거나 오류가 발생했습니다."}`);
                } else {
                    alert("리뷰 등록 실패: 잠시 후 다시 시도해주세요.");
                }
            }
        } catch (e) {
            console.error("Failed to post review", e);
            alert("오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            draggable={false}
                            className="w-full h-full object-contain drop-shadow-xl select-none"
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
                            {/* Dynamic Header Stats */}
                            <div
                                onClick={() => setActiveTab('reviews')}
                                className="flex items-center gap-1 text-yellow-500 font-bold text-sm cursor-pointer hover:bg-[var(--bg-card-secondary)] rounded-lg px-2 -ml-2 transition-colors py-1"
                            >
                                <Star className="w-4 h-4 fill-yellow-500" />
                                <span>
                                    {reviews.length > 0
                                        ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
                                        : (item.averageRating ? item.averageRating.toFixed(1) : '0.0')}
                                </span>
                                <span className="text-[var(--text-secondary)] font-normal ml-1">
                                    ({reviews.length > 0 ? reviews.length : (item.reviewCount || 0)}개 리뷰)
                                </span>
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
                            onClick={() => {
                                setActiveTab('reviews');
                                if (reviews.length === 0) fetchReviews();
                            }}
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
                                </div>

                                {/* Review Input Form */}
                                {isOwned && (
                                    <div className="bg-[var(--bg-card-secondary)] p-4 rounded-xl mb-4">
                                        <h4 className="text-sm font-bold mb-2">리뷰 작성하기</h4>
                                        <div className="flex gap-2 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setNewRating(star)}>
                                                    <Star className={`w-5 h-5 ${star <= newRating ? 'fill-yellow-500 text-yellow-500' : 'text-[var(--text-disabled)]'}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={newReviewContent}
                                            onChange={(e) => setNewReviewContent(e.target.value)}
                                            placeholder="리뷰 내용을 입력하세요..."
                                            className="w-full p-2 text-sm bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] mb-2"
                                            rows={3}
                                        />
                                        <button
                                            onClick={handlePostReview}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-[var(--btn-bg)] text-white text-xs font-bold rounded-lg hover:brightness-110 disabled:opacity-50"
                                        >
                                            {isSubmitting ? '등록 중...' : '리뷰 등록'}
                                        </button>
                                    </div>
                                )}

                                {/* Reviews List */}
                                {reviews.length === 0 ? (
                                    <p className="text-center text-[var(--text-secondary)] py-8">아직 작성된 리뷰가 없습니다.</p>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="flex gap-4 border-b border-[var(--border-color)] pb-4 last:border-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                                                {review.userNickname?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-[var(--text-primary)]">{review.userNickname}</span>
                                                    {String(review.userId) === String(userId) && (
                                                        <span className="px-1.5 py-0.5 bg-[var(--btn-bg)] text-white text-[10px] font-bold rounded-md">
                                                            내 리뷰
                                                        </span>
                                                    )}
                                                    <div className="flex text-yellow-500 gap-0.5">
                                                        {[...Array(5)].map((_, j) => (
                                                            <Star
                                                                key={j}
                                                                className={`w-3 h-3 ${j < review.rating ? 'fill-current' : 'text-[var(--text-disabled)] opacity-30'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
                                                    {review.content}
                                                </p>
                                                <span className="text-[10px] text-[var(--text-disabled)] mt-2 block">
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleString() : new Date().toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                </div >
            </div >
        </div >
    );
};

export default ItemDetailModal;
