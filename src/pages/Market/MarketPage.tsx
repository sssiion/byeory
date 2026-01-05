import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Header/Navigation';
import MarketLayout from '../../components/market/MarketLayout';
import MerchCard from '../../components/market/MerchCard';
import { MOCK_MARKET_ITEMS, type MarketItem } from '../../data/mockMarketItems';
import { useCredits } from '../../context/CreditContext';
import { useMarket } from '../../hooks/useMarket';
import { Search, Plus, FolderOpen, Heart } from 'lucide-react';
import { getMyWidgets } from '../../components/settings/widgets/customwidget/widgetApi';
import type { WidgetPreset } from '../../types/preset';

const Market: React.FC = () => {
    const { credits } = useCredits();
    const { purchasedItems, buyItem, getPackPrice, sellingItems, isWishlisted, toggleWishlist, registerItem, cancelItem } = useMarket();
    const [activeTab, setActiveTab] = useState<'all' | 'start_pack' | 'sticker' | 'template_widget' | 'template_post' | 'myshop' | 'wishlist'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'popular' | 'latest' | 'price_low' | 'price_high'>('popular');

    const [mySellableCandidates, setMySellableCandidates] = useState<any[]>([]);

    const loadMySellableItems = async () => {
        // 1. Dashboard LocalStorage Presets
        const savedPresets = localStorage.getItem('my_dashboard_presets');
        let localPresets: WidgetPreset[] = [];
        if (savedPresets) {
            try {
                localPresets = JSON.parse(savedPresets);
            } catch (e) {
                console.error(e);
            }
        }

        // 2. Custom Widgets from API
        let apiWidgets: any[] = [];
        try {
            apiWidgets = await getMyWidgets();
        } catch (e) {
            console.error("Failed to load custom widgets for market", e);
        }

        const formattedPresets = localPresets.map(p => ({
            id: p.id,
            title: p.name,
            type: 'template_widget',
            description: `Custom Layout with ${p.widgets.length} widgets.`,
            price: 0, // Not for sale yet, just listing
            source: 'local'
        }));

        const formattedWidgets = apiWidgets.map(w => ({
            id: w.id || w._id,
            title: w.name,
            type: 'template_widget', // or custom type
            description: 'Custom Widget Component',
            price: 0,
            source: 'api'
        }));

        setMySellableCandidates([...formattedPresets, ...formattedWidgets]);
    };

    // Load user's sellable items (Mock + Real) when Myshop tab is active
    useEffect(() => {
        if (activeTab === 'myshop') {
            loadMySellableItems();
        }
    }, [activeTab]);


    const handleBuy = (item: MarketItem) => {
        if (purchasedItems.includes(item.id)) return;

        // Dynamic price check
        const effectivePrice = getPackPrice(item.id, item.price);

        if (confirm(`'${item.title}'을(를) ${effectivePrice} 크레딧에 구매하시겠습니까?`)) {
            if (buyItem(item.id, effectivePrice)) {
                alert(`'${item.title}' 구매 완료! 🎉`);
            } else {
                alert('크레딧이 부족합니다.');
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

    const filteredItems = MOCK_MARKET_ITEMS.filter(item => {
        if (activeTab === 'wishlist') {
            return isWishlisted(item.id);
        }
        if (activeTab === 'start_pack') {
            return item.tags.includes('starter');
        }
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesTab && matchesSearch;
    }).sort((a, b) => {
        switch (sortOrder) {
            case 'price_low':
                return a.price - b.price;
            case 'price_high':
                return b.price - a.price;
            case 'latest':
                // Mock latest: assume higher ID or reverse index order. 
                return b.id.localeCompare(a.id);
            case 'popular':
            default:
                // Mock popular: default order
                return 0;
        }
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
                            <span className="text-xs text-[var(--text-secondary)] font-bold block">Current Balance</span>
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
                            { id: 'myshop', label: '내 상점', icon: FolderOpen }
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
                {activeTab !== 'myshop' && (
                    <div className="flex justify-between items-center -mb-4 px-2">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">
                            Total {filteredItems.length} items
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
                                    onClick={() => setSortOrder(opt.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sortOrder === opt.id
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
                {activeTab === 'myshop' ? (
                    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4">

                        {/* Section: On Sale */}
                        {sellingItems.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h2 className="text-xl font-bold px-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    판매 중인 아이템
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {sellingItems.map((item, idx) => (
                                        <div key={`${item.id}-${idx}`} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col gap-3 relative hover:border-green-500/50 transition-colors">
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full border border-green-200 dark:border-green-900">
                                                판매 중
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
                                                    if (confirm(`'${item.title}' 판매를 취소하시겠습니까?`)) {
                                                        cancelItem(item.id);
                                                    }
                                                }}
                                                className="mt-auto w-full py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                판매 취소
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: Registerable */}
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
                                                {item.source === 'local' ? 'Local Layout' : 'Custom Widget'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
                                                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">{item.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleSell(item)}
                                                className="mt-auto w-full py-2 rounded-lg bg-[var(--bg-card-secondary)] text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--btn-bg)] hover:text-white transition-colors"
                                            >
                                                판매 등록하기
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
                            filteredItems.map(item => {
                                const effectivePrice = getPackPrice(item.id, item.price);
                                return (
                                    <MerchCard
                                        key={item.id}
                                        item={item}
                                        onBuy={handleBuy}
                                        onToggleWishlist={() => toggleWishlist(item.id)}
                                        isOwned={purchasedItems.includes(item.id)}
                                        isWishlisted={isWishlisted(item.id)}
                                        effectivePrice={effectivePrice}
                                    />
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </MarketLayout>
    );
};

export default Market;
