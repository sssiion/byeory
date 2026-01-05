import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Header/Navigation';
import MarketLayout from '../../components/market/MarketLayout';
import MerchCard from '../../components/market/MerchCard';
import ItemDetailModal from '../../components/market/ItemDetailModal';
import { type MarketItem } from '../../data/mockMarketItems';
import { useCredits } from '../../context/CreditContext';
import { useMarket } from '../../hooks/useMarket';
import { Search, Plus, FolderOpen, Heart, ShoppingBag } from 'lucide-react';
import { getMyWidgets } from '../../components/settings/widgets/customwidget/widgetApi';

const Market: React.FC = () => {
    const { credits } = useCredits();
    const { marketItems, purchasedItems, buyItem, getPackPrice, sellingItems, isWishlisted, toggleWishlist, registerItem, cancelItem, isOwned, loadMore, search, hasMore, sort, changeSort } = useMarket(); // destructured marketItems, sort, changeSort
    const [activeTab, setActiveTab] = useState<'all' | 'start_pack' | 'sticker' | 'template_widget' | 'template_post' | 'myshop' | 'wishlist' | 'history'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    // const [sortOrder, setSortOrder] = useState<'popular' | 'latest' | 'price_low' | 'price_high'>('popular'); // Removed in favor of hook state

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            search(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, search]);

    const [mySellableCandidates, setMySellableCandidates] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const loadMySellableItems = React.useCallback(async () => {
        // 1. Custom Widgets from API (Only source now)
        let apiWidgets: any[] = [];
        try {
            apiWidgets = await getMyWidgets();
        } catch (e) {
            console.error("Failed to load custom widgets for market", e);
        }

        const formattedWidgets = apiWidgets.map(w => ({
            id: w.id || w._id,
            title: w.name,
            type: 'template_widget', // or custom type
            description: 'Custom Widget Component',
            price: 0,
            source: 'api'
        }));

        const allCandidates = [...formattedWidgets];
        const sellable = allCandidates.filter(candidate => !isOwned(candidate.id))
            .map(candidate => {
                const isAlreadySelling = sellingItems.some(s =>
                    s.referenceId === candidate.id?.toString() &&
                    s.status === 'ON_SALE'
                );
                return { ...candidate, isAlreadySelling };
            });

        setMySellableCandidates(sellable);
    }, [sellingItems, isOwned]);

    // Load user's sellable items (Mock + Real) when Myshop tab is active
    useEffect(() => {
        if (activeTab === 'myshop') {
            loadMySellableItems();
        }
    }, [activeTab, loadMySellableItems]);


    const handleBuy = async (item: MarketItem) => {
        if (isOwned(item.id)) return; // Use isOwned helper

        // Dynamic price check
        const effectivePrice = getPackPrice(item.id, item.price);

        if (confirm(`'${item.title}'을(를) ${effectivePrice} 크레딧에 구매하시겠습니까?`)) {
            const success = await buyItem(item.id, effectivePrice);
            if (success) {
                alert(`'${item.title}' 구매 완료! 🎉`);
            } else {
                alert('크레딧이 부족하거나 오류가 발생했습니다.');
            }
        }
    };

    const handleSell = (item: any) => {
        const confirmPrice = prompt(`'${item.title}'을(를) 마켓에 등록하시겠습니까?\n판매 가격을 입력하세요 (Credit):`, "1000");
        if (confirmPrice) {
            const price = parseInt(confirmPrice, 10);
            if (!isNaN(price)) {
                registerItem({
                    ...item,
                    id: `selling_${Date.now()}_${item.id}`, // New unique ID for listing
                    originalId: item.id,
                    price: price
                });
                alert(`'${item.title}'이(가) ${price} 크레딧에 마켓에 등록되었습니다!`);
            }
        }
    };

    // MERGE MOCK ITEMS + BACKEND ITEMS
    // Since we migrated mock data to DB, we should only use backend items to prevent duplicates and ID mismatches.
    const allMarketItems = [...marketItems];

    const filteredItems = allMarketItems.filter((item: any) => {
        // 1. Tab Filtering
        let matchesTab = false;
        if (activeTab === 'wishlist') {
            matchesTab = isWishlisted(item.id);
        } else if (activeTab === 'start_pack') {
            matchesTab = (item.tags || []).includes('starter');
        } else if (activeTab === 'history' || activeTab === 'myshop') {
            return false;
        } else if (activeTab === 'all') {
            matchesTab = true;
        } else {
            matchesTab = item.type === activeTab;
        }

        if (!matchesTab) return false;

        // 2. Search Filtering (Essential for Mock items and local verification)
        if (!searchTerm) return true;

        const tags = item.tags || [];
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    return (
        <MarketLayout header={<Navigation />}>
            <div className="flex flex-col gap-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Market</h1>
                        <p className="text-[var(--text-secondary)]">
                            나만의 템플릿과 스티커를 거래해보세요.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-color)] shadow-sm">
                        <div className="px-4 py-2 bg-[var(--bg-card-secondary)] rounded-xl">
                            <span className="text-xs text-[var(--text-secondary)] font-bold block">보유 크레딧</span>
                            <span className="text-xl font-black text-yellow-500 font-mono flex items-center gap-2">
                                {credits.toLocaleString()} C
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4 sticky top-16 z-10 bg-transparent py-4 -mx-2 px-2 transition-all mt-4">
                    <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 flex-1 scrollbar-hide px-2">
                        {[
                            { id: 'all', label: '전체' },
                            { id: 'start_pack', label: '⭐ 스타터 팩' },
                            { id: 'sticker', label: '스티커' },
                            { id: 'template_widget', label: '위젯 템플릿' },
                            { id: 'template_post', label: '게시물 템플릿' },
                            { id: 'wishlist', label: '찜 목록', icon: Heart },
                            { id: 'myshop', label: '내 상점', icon: FolderOpen },
                            { id: 'history', label: '구매 내역' } // Added History Tab
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2
                                    ${activeTab === tab.id
                                        ? 'bg-[var(--btn-bg)] text-white shadow-md transform scale-105'
                                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'
                                    }`}
                            >
                                {tab.icon && <tab.icon size={16} />}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
                        <input
                            type="text"
                            placeholder="아이템 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] transition-all"
                        />
                    </div>
                </div>

                {/* Sort & Filter Bar */}
                {activeTab !== 'myshop' && activeTab !== 'history' && (
                    <div className="flex justify-between items-center -mb-4 px-2">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">
                            총 {filteredItems.length}개의 아이템
                        </span>
                        <div className="flex gap-2">
                            {[
                                { id: 'popular', label: '인기순' },
                                { id: 'latest', label: '최신순' },
                                { id: 'price_low', label: '낮은가격순' },
                                { id: 'price_high', label: '높은가격순' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => changeSort(opt.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sort === opt.id
                                        ? 'bg-[var(--btn-bg)] text-white'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)]'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                {activeTab === 'history' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {purchasedItems.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-[var(--text-secondary)] flex flex-col items-center">
                                <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg font-bold">구매 내역이 없습니다.</p>
                            </div>
                        ) : (
                            purchasedItems.map((item: any) => (
                                <MerchCard
                                    key={`history-${item.id}`}
                                    item={item}
                                    onBuy={() => { }} // No buy action for history
                                    isOwned={true}
                                    // Hide wishlist/price in history? Or just show as owned.
                                    effectivePrice={item.price}
                                    onClick={() => setSelectedItem(item)}
                                />
                            ))
                        )}
                    </div>
                ) : activeTab === 'myshop' ? (
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                                    <div className="aspect-video bg-[var(--bg-card-secondary)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider">
                                                        {item.type}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
                                                        <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">{item.price} C</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`'${item.title}' 판매를 중지하시겠습니까?`)) {
                                                                cancelItem(item.id);
                                                            }
                                                        }}
                                                        disabled={isCanceled}
                                                        className={`mt-auto w-full py-2 rounded-lg border text-xs font-bold transition-colors
                                                    ${isCanceled
                                                                ? 'border-transparent text-[var(--text-disabled)] cursor-not-allowed bg-[var(--bg-card-secondary)]'
                                                                : 'border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            }`}
                                                    >
                                                        {isCanceled ? '판매 중지됨' : '판매 중지'}
                                                    </button>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {mySellableCandidates.map((item, idx) => (
                                        <div key={`${item.source}-${item.id}-${idx}`} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col gap-3 group hover:border-[var(--btn-bg)] transition-colors relative">
                                            <div className="aspect-video bg-[var(--bg-card-secondary)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider">
                                                {item.source === 'local' ? '로컬 레이아웃' : '커스텀 위젯'}
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
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-[var(--text-secondary)] flex flex-col items-center">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg font-bold">아이템이 없습니다.</p>
                                {activeTab === 'wishlist' && <p className="text-sm mt-1">마음에 드는 아이템에 하트를 눌러보세요!</p>}
                            </div>
                        ) : (
                            <>
                                {filteredItems.map(item => {
                                    const effectivePrice = getPackPrice(item.id, item.price);
                                    return (
                                        <MerchCard
                                            key={item.id}
                                            item={item}
                                            onBuy={handleBuy}
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
                )}
            </div>
            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onBuy={(item) => {
                        handleBuy(item);
                        // Update selected item status if needed or close
                        setSelectedItem(null); // Close after action for now
                    }}
                    onToggleWishlist={(item) => toggleWishlist(item.id)}
                    isOwned={isOwned(selectedItem.id)}
                    isWishlisted={isWishlisted(selectedItem.id)}
                    effectivePrice={getPackPrice(selectedItem.id, selectedItem.price)}
                    initialTab={selectedItem.initialTab}
                />
            )
            }
        </MarketLayout >
    );
};

export default Market;
