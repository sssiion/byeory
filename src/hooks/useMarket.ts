import { useCallback, useEffect, useState } from 'react';
import { useCredits } from '../context/CreditContext';
import { STICKERS } from '../pages/post/constants';
import { MOCK_MARKET_ITEMS } from '../data/mockMarketItems';

export const useMarket = () => {
    const { credits, spendCredits, refreshCredits, userId } = useCredits(); // Using refreshCredits, userId
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]); // Store full objects now
    const [sellingItems, setSellingItems] = useState<any[]>([]);
    const [marketItems, setMarketItems] = useState<any[]>([]); // All items on sale (from backend)
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [keyword, setKeyword] = useState('');

    // Function to fetch data from backend
    const refreshMarket = useCallback(async (options: { page?: number, keyword?: string, isLoadMore?: boolean } = {}) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const targetPage = options.page !== undefined ? options.page : 0;
        const targetKeyword = options.keyword !== undefined ? options.keyword : keyword;
        const isLoadMore = options.isLoadMore || false;

        if (!isLoadMore) {
            setPage(0); // Reset page on fresh load
        }

        try {
            // 1. Fetch Purchased Items
            let backendPurchased: any[] = [];
            const purchasedRes = await fetch('http://localhost:8080/api/market/purchased', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (purchasedRes.ok) {
                const items = await purchasedRes.json();
                backendPurchased = items.map((i: any) => ({
                    id: String(i.id),
                    title: i.name,
                    price: i.price,
                    description: i.contentJson ? JSON.parse(i.contentJson).description : '',
                    tags: i.contentJson ? JSON.parse(i.contentJson).tags : [],
                    imageUrl: i.contentJson ? JSON.parse(i.contentJson).imageUrl : '',
                    type: i.category,
                    author: i.sellerName,
                    purchasedAt: i.transactionDate,
                    status: i.status,
                    createdAt: i.createdAt,
                    salesCount: i.salesCount || 0,
                    isBackend: true
                }));
            }

            // Merge with Local Storage (Legacy) items
            const localIds = JSON.parse(localStorage.getItem('market_purchased_items') || '[]');
            const localItems = localIds.map((id: string) => {
                // Try to find in MOCK items
                const mockItem = MOCK_MARKET_ITEMS.find(m => m.id === id);
                // Try to find in backend items if available (requires them to be fetched already? But this is async...)
                // We haven't setMarketItems yet in this function scope fully (it sets at end).
                // But we can check if it's a known backend ID if we had the list.
                // For now, prioritize Mock as local storage usually stores mock IDs.

                return {
                    id: id,
                    title: mockItem ? mockItem.title : (id.startsWith('selling_') ? 'Custom Item' : id),
                    price: mockItem ? mockItem.price : 0,
                    type: mockItem ? mockItem.type : 'legacy',
                    // Use mock image if available
                    imageUrl: mockItem ? mockItem.imageUrl : undefined,
                    purchasedAt: new Date().toISOString(), // Mock date
                    isLegacy: true
                };
            });

            // Deduplicate: If backend has same ID, use backend (unlikely for strings vs numbers but needed if we mix)
            // Actually, Local IDs are like 'pack_basic', Backend are '1', '2'. No collision expected usually.
            // But we should filter out duplicates just in case.
            const allItems = [...backendPurchased, ...localItems];
            // Use a Map to dedup by ID
            const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());

            setPurchasedItems(uniqueItems);

            // 2. Fetch My Selling Items
            const sellingRes = await fetch('http://localhost:8080/api/market/my-items', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (sellingRes.ok) {
                const items = await sellingRes.json();
                const backendSelling = items.map((i: any) => ({
                    id: String(i.id),
                    title: i.name,
                    price: i.price,
                    description: i.contentJson ? JSON.parse(i.contentJson).description : '',
                    tags: i.contentJson ? JSON.parse(i.contentJson).tags : [],
                    imageUrl: i.contentJson ? JSON.parse(i.contentJson).imageUrl : '',
                    type: i.category,
                    author: i.sellerName,
                    status: i.status,
                    createdAt: i.createdAt,
                    salesCount: i.salesCount || 0,
                    referenceId: i.referenceId,
                    isBackend: true
                }));
                setSellingItems(backendSelling);
            }

            // 3. Fetch All Market Items (For browsing)
            const query = new URLSearchParams({
                page: String(targetPage),
                size: '12',
                sort: 'createdAt,desc'
            });
            if (targetKeyword) query.append('keyword', targetKeyword);

            const marketRes = await fetch(`http://localhost:8080/api/market/items?${query.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (marketRes.ok) {
                const data = await marketRes.json();
                const items = data.content; // Page response
                const backendItems = items.map((i: any) => ({
                    id: String(i.id),
                    title: i.name,
                    price: i.price,
                    description: i.contentJson ? JSON.parse(i.contentJson).description : '',
                    tags: i.contentJson ? JSON.parse(i.contentJson).tags : [],
                    imageUrl: i.contentJson ? JSON.parse(i.contentJson).imageUrl : '',
                    type: i.category,
                    author: i.sellerName,
                    sellerId: i.sellerId,
                    status: i.status,
                    createdAt: i.createdAt,
                    salesCount: i.salesCount || 0,
                    referenceId: i.referenceId,
                    isBackend: true
                }));

                // Filter out own items
                const filteredItems = userId
                    ? backendItems.filter((i: any) => String(i.sellerId) !== String(userId))
                    : backendItems;

                if (isLoadMore) {
                    setMarketItems(prev => {
                        // Avoid duplicates
                        const existingIds = new Set(prev.map(p => p.id));
                        const newUnique = filteredItems.filter((i: any) => !existingIds.has(i.id));
                        return [...prev, ...newUnique];
                    });
                } else {
                    setMarketItems(filteredItems);
                }
                setHasMore(!data.last);
                if (isLoadMore) {
                    setPage(targetPage);
                }
            }

        } catch (e) {
            console.error("Failed to fetch market data", e);
        }
    }, [userId, keyword]);

    const loadMore = useCallback(() => {
        if (!hasMore) return;
        refreshMarket({ page: page + 1, isLoadMore: true });
    }, [hasMore, page, refreshMarket]);

    const search = useCallback((kw: string) => {
        setKeyword(kw);
        refreshMarket({ page: 0, keyword: kw, isLoadMore: false });
    }, [refreshMarket]);

    useEffect(() => {
        // Initial setup
        const savedWishlist = localStorage.getItem('market_wishlist_items');
        if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));

        refreshMarket();
    }, [refreshMarket]);

    const isOwned = useCallback((itemId: string) => {
        return purchasedItems.some(item => item.id === String(itemId));
    }, [purchasedItems]);

    const isWishlisted = useCallback((itemId: string) => {
        return wishlistItems.includes(itemId);
    }, [wishlistItems]);

    const toggleWishlist = useCallback((itemId: string) => {
        const newItem = wishlistItems.includes(itemId)
            ? wishlistItems.filter(id => id !== itemId)
            : [...wishlistItems, itemId];

        setWishlistItems(newItem);
        localStorage.setItem('market_wishlist_items', JSON.stringify(newItem));
    }, [wishlistItems]);

    const registerItem = useCallback(async (item: any) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const payload = {
                name: item.title,
                price: item.price,
                category: item.type || 'sticker',
                contentJson: JSON.stringify({
                    description: item.description,
                    imageUrl: item.imageUrl,
                    tags: item.tags
                }),
                referenceId: item.originalId?.toString() || item.id?.toString()
            };

            const response = await fetch('http://localhost:8080/api/market/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await refreshMarket();
                await refreshCredits();
            } else {
                alert("아이템 등록 실패");
            }
        } catch (e) {
            console.error(e);
            alert("아이템 등록 중 오류 발생");
        }
    }, [refreshMarket, refreshCredits]);

    const cancelItem = useCallback(async (itemId: string) => {
        // check if it's a backend item (numeric ID)
        if (!isNaN(Number(itemId))) {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            try {
                const response = await fetch(`http://localhost:8080/api/market/cancel/${itemId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    await refreshMarket();
                } else {
                    alert("판매 취소 실패");
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [refreshMarket]);

    const buyItem = useCallback(async (itemId: string, cost: number, additionalIds: string[] = []) => {
        if (credits < cost) return false;

        // Check if numeric ID -> Backend Buy
        if (!isNaN(Number(itemId))) {
            const token = localStorage.getItem('accessToken');
            if (!token) return false;

            try {
                const response = await fetch(`http://localhost:8080/api/market/buy/${itemId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    await refreshMarket();
                    await refreshCredits(); // Force refresh credits
                    return true;
                } else {
                    alert("구매 실패 (이미 판매되었거나 오류가 발생했습니다)");
                    return false;
                }
            } catch (e) {
                console.error(e);
                return false;
            }
        } else {
            // Legacy LocalStorage Buy
            if (spendCredits(cost)) {
                const localIds = JSON.parse(localStorage.getItem('market_purchased_items') || '[]');
                const newPurchased = [...localIds, itemId, ...additionalIds];
                const unique = Array.from(new Set(newPurchased));
                localStorage.setItem('market_purchased_items', JSON.stringify(unique));

                await refreshMarket(); // Re-read local storage into state
                // spendCredits already updated local credit state optimistically, 
                // but we should probably trigger a refresh if we had a server sync mechanism for legacy (we don't really).
                // But it's fine.
                return true;
            }
        }
        return false;
    }, [credits, spendCredits, refreshMarket, refreshCredits]);

    const getPackPrice = useCallback((packId: string, originalPrice: number) => {
        const packStickers = STICKERS.filter(s => s.packId === packId);
        if (packStickers.length === 0) return originalPrice;
        const ownedStickers = packStickers.filter(s => isOwned(s.id));
        const ownedValue = ownedStickers.reduce((sum, s) => sum + (s.price || 0), 0);
        return Math.max(0, originalPrice - ownedValue);
    }, [isOwned]);

    return {
        marketItems,
        purchasedItems,
        sellingItems,
        wishlistItems,
        isOwned,
        isWishlisted,
        toggleWishlist,
        buyItem,
        registerItem,
        cancelItem,
        getPackPrice,
        loadMore,
        search,
        hasMore,
        isSearching: !!keyword
    };
};
